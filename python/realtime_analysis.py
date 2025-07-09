import cv2
import numpy as np
import json
import time
import os
import threading
import base64
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
from ultralytics import YOLO

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Initialize YOLO model (using YOLO11m-seg as requested)
try:
    # Try to load YOLO11m-seg for segmentation support
    yolo_model = YOLO('yolo11m-seg.pt')
    print("Successfully loaded YOLO11m-seg model")
except Exception as e:
    print(f"Could not load YOLO11m-seg, attempting to download it...")
    try:    
        # Try to download the model if not available locally
        yolo_model = YOLO('yolo11m-seg.pt')
        print("Successfully downloaded and loaded YOLO11m-seg model")
    except Exception as e2:
        print(f"Could not download YOLO11m-seg: {e2}, falling back to YOLOv8-seg")
        try:
            # Try YOLOv8 segmentation model as fallback
            yolo_model = YOLO('yolov8n-seg.pt')
            print("Using YOLOv8n-seg model as fallback")
        except Exception as e3:
            print(f"Could not load YOLOv8n-seg: {e3}, falling back to YOLOv8n")
            # Last resort: standard YOLOv8 detection model
            yolo_model = YOLO('yolov8n.pt')
            print("Using YOLOv8n model as final fallback")

app = Flask(__name__)
CORS(app)

# Global variables to store the latest analysis result and frame
latest_result = {"item": "No item detected", "timestamp": time.time()}
latest_frame = None
analysis_active = False
last_ai_analysis_time = 0  # Track last time AI analysis was performed
ai_analysis_interval = 1.0  # Analyze at 1fps (every 1 second)
lock = threading.Lock()
webcam_lock = threading.RLock()  # Reentrant lock for webcam access
openai_lock = threading.Lock()  # Separate lock for OpenAI API calls

# Store YOLO and OpenAI results separately
yolo_result = {"item": "No item detected by YOLO11n-seg", "timestamp": time.time()}
openai_result = {"item": "Press 'Provide Feedback' button for OpenAI analysis", "timestamp": time.time()}

# Track webcam status
webcam_status = {"active": False, "error": None}
webcam_thread = None

def analyze_with_openai(frame):
    """
    Analyze the frame using OpenAI's Vision API
    Focus on the left side of the image (right hand from user perspective)
    """
    try:
        # Extract the right hand region (left side of the frame from camera perspective)
        height, width = frame.shape[:2]
        right_hand_region = frame[:, :width//2]
        
        # Draw a rectangle around the region we're analyzing
        cv2.rectangle(frame, (0, 0), (width//2, height), (0, 255, 0), 2)
        
        # Convert the region to JPEG for API submission
        _, buffer = cv2.imencode('.jpg', right_hand_region)
        image_bytes = buffer.tobytes()
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        
        # Call OpenAI Vision API with the cheapest, fastest model (GPT-4o)
        response = client.chat.completions.create(
            model="gpt-4o",  # Fast and cost-effective vision model
            messages=[
                {"role": "system", "content": "You are a real-time object detector. Identify what the person is holding in their hand. Be very concise - respond with just the object name and nothing else."},
                {"role": "user", "content": [
                    {"type": "text", "text": "What object am I holding in my hand? Respond with just the name of the object, nothing else."},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
                ]}
            ],
            max_tokens=20  # Keep response short for real-time use
        )
        
        # Extract the object name from the response
        object_name = response.choices[0].message.content.strip()
        return object_name
    except Exception as e:
        print(f"Error in OpenAI analysis: {e}")
        return "Analysis error"

def process_frame(frame):
    """Process a frame with YOLO11n-seg and return results"""
    try:
        # Process only the left half of the frame (user's right hand)
        height, width = frame.shape[:2]
        left_half = frame[:, :width//2]
        
        # Run YOLO detection on the frame
        results = yolo_model(left_half)
        
        # Get detected objects
        detected_objects = []
        for r in results:
            # Handle segmentation results if available
            if hasattr(r, 'masks') and r.masks is not None:
                print("Using segmentation results")
                # Count the number of segmented objects
                num_segments = len(r.masks)
                
                for i, mask in enumerate(r.masks):
                    if i < len(r.boxes):
                        box = r.boxes[i]
                        cls_id = int(box.cls[0])
                        conf = float(box.conf[0])
                        label = r.names[cls_id]
                        detected_objects.append((label, conf, "segmented"))
            else:
                # Fallback to regular detection if segmentation not available
                print("Using standard detection results")
                for box in r.boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    label = r.names[cls_id]
                    detected_objects.append((label, conf, "detected"))
        
        # Sort by confidence and get the top 3
        detected_objects.sort(key=lambda x: x[1], reverse=True)
        top_objects = detected_objects[:3]
        
        if top_objects:
            # Format the results
            result_text = ", ".join([f"{label} ({conf:.2f})" for label, conf, _ in top_objects])
            # Add info about segmentation
            if any(obj[2] == "segmented" for obj in top_objects):
                result_text += " (with segmentation)"
            return result_text
        else:
            return "No objects detected"
    except Exception as e:
        print(f"Error in YOLO analysis: {e}")
        return "YOLO analysis error"

def webcam_stream():
    """Background thread to continuously process webcam frames"""
    global latest_frame, analysis_active, yolo_result, openai_result, webcam_status
    
    try:
        with webcam_lock:
            # Initialize webcam with explicit resolution settings
            cap = cv2.VideoCapture(0)  # Use default camera (index 0)
            
            # Set explicit resolution (640x480) for better compatibility
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            cap.set(cv2.CAP_PROP_FPS, 30)  # Set FPS explicitly
            
            # Wait a moment for camera to initialize
            time.sleep(1)
            
            if not cap.isOpened():
                error_msg = "Error: Could not open webcam"
                print(error_msg)
                webcam_status = {"active": False, "error": error_msg}
                return
            
            # Check if camera is actually providing frames
            ret, test_frame = cap.read()
            if not ret or test_frame is None:
                error_msg = "Error: Camera opened but not providing frames"
                print(error_msg)
                webcam_status = {"active": False, "error": error_msg}
                cap.release()
                return
                
            print(f"Webcam successfully opened and streaming at {int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))}x{int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))}")
            webcam_status = {"active": True, "error": None}
    except Exception as e:
        print(f"Error initializing webcam: {e}")
        webcam_status = {"active": False, "error": str(e)}
    
    try:
        frame_count = 0
        last_error_time = 0
        
        while analysis_active:
            try:
                with webcam_lock:
                    if not cap.isOpened():
                        print("Error: Webcam closed unexpectedly")
                        webcam_status = {"active": False, "error": "Webcam closed unexpectedly"}
                        break
                        
                    ret, frame = cap.read()
                    
                if not ret or frame is None:
                    # Don't spam the console with errors
                    current_time = time.time()
                    if current_time - last_error_time > 5:
                        print("Error: Failed to capture image")
                        last_error_time = current_time
                    time.sleep(0.1)  # Short delay before retry
                    continue
                
                current_time = time.time()
                frame_count += 1
                
                # Only process every 3rd frame with YOLO to reduce CPU load
                if frame_count % 3 == 0:
                    # Create a copy of the frame for YOLO analysis
                    analysis_frame = frame.copy()
                    
                    # Perform YOLO analysis in real-time
                    yolo_detection = process_frame(analysis_frame)
                    
                    # Update YOLO result with thread safety
                    with lock:
                        yolo_result = {"item": yolo_detection, "timestamp": current_time}
                
                # Get the current OpenAI result (thread-safe)
                with lock:
                    openai_detection = openai_result["item"]
                
                # Draw a vertical line dividing the frame in half
                height, width = frame.shape[:2]
                cv2.line(frame, (width//2, 0), (width//2, height), (0, 255, 0), 2)
                
                # Add text showing the YOLO detected item
                cv2.putText(frame, f"YOLO: {yolo_detection}", (10, 30), 
                          cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                
                # Add text showing the OpenAI detected item
                cv2.putText(frame, f"OpenAI: {openai_detection}", (10, 70), 
                          cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
                
                # Update the frame with thread safety
                with lock:
                    # Store the frame as a numpy array for later processing
                    latest_frame = frame.copy()
                
                # Adaptive sleep based on processing time
                processing_time = time.time() - current_time
                sleep_time = max(0.01, 0.03 - processing_time)  # Aim for ~30fps but never below 10ms
                time.sleep(sleep_time)
                
            except Exception as e:
                print(f"Error in webcam processing loop: {e}")
                time.sleep(0.1)  # Short delay before retry
    except Exception as e:
        print(f"Fatal error in webcam thread: {e}")
        webcam_status = {"active": False, "error": str(e)}
    finally:
        with webcam_lock:
            if cap is not None and cap.isOpened():
                cap.release()
        webcam_status = {"active": False, "error": None}
        print("Webcam released and thread stopping")

def process_frame_with_openai(frame):
    """Process a frame with OpenAI Vision API on demand"""
    global openai_result
    
    try:
        # Use a separate lock for OpenAI API calls to prevent blocking the video stream
        with openai_lock:
            # Analyze frame with OpenAI Vision API
            result = analyze_with_openai(frame)
            
            # Update the result with thread safety
            with lock:
                openai_result = {"item": result, "timestamp": time.time()}
                
            return {"status": "success", "result": result}
    except Exception as e:
        print(f"Error in OpenAI processing: {e}")
        return {"status": "error", "message": str(e)}

@app.route('/start', methods=['GET'])
def api_start():
    """Start the webcam analysis"""
    global analysis_active, webcam_thread, webcam_status
    
    # Make sure we're not already running
    if analysis_active:
        return jsonify({"status": "already_running"})
    
    # Clean up any existing thread
    if webcam_thread is not None and webcam_thread.is_alive():
        print("Warning: Existing thread still alive, waiting for it to terminate")
        webcam_thread.join(timeout=3.0)  # Wait up to 3 seconds for clean termination
    
    # Reset status
    analysis_active = True
    webcam_status = {"active": False, "error": None}
    
    # Start a new thread
    webcam_thread = threading.Thread(target=webcam_stream, daemon=True)
    webcam_thread.start()
    
    # Give the webcam thread a moment to initialize
    time.sleep(2)
    
    # Check if webcam started successfully
    if not webcam_status["active"] and webcam_status["error"] is not None:
        return jsonify({"status": "error", "message": webcam_status["error"]})
    
    return jsonify({"status": "running"})

@app.route('/stop', methods=['GET'])
def api_stop():
    """Stop the webcam analysis thread"""
    global analysis_active, webcam_thread
    
    if analysis_active:
        # Signal thread to stop
        analysis_active = False
        
        # Wait briefly for thread to clean up
        if webcam_thread is not None and webcam_thread.is_alive():
            try:
                webcam_thread.join(timeout=1.0)  # Wait up to 1 second
            except Exception as e:
                print(f"Error joining webcam thread: {e}")
        
        return jsonify({"status": "stopped"})
    
    return jsonify({"status": "not running"})

@app.route('/result', methods=['GET'])
def api_result():
    with lock:
        return jsonify({
            "yolo_result": yolo_result,
            "openai_result": openai_result
        })

@app.route('/stream', methods=['GET'])
def api_stream():
    def generate():
        while analysis_active:
            with lock:
                if latest_frame is not None:
                    yield (b'--frame\r\n'
                          b'Content-Type: image/jpeg\r\n\r\n' + latest_frame + b'\r\n')
            time.sleep(0.1)
    
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/request-feedback', methods=['POST'])
def request_feedback():
    """Process a frame with OpenAI Vision API on demand"""
    global latest_frame
    
    with lock:
        if latest_frame is None:
            return jsonify({"status": "error", "message": "No frame available"})
        
        # Make a copy of the frame to avoid modifying it while it's being processed
        frame_copy = latest_frame.copy()
    
    # Process the frame copy with OpenAI (outside the main lock)
    result = process_frame_with_openai(frame_copy)
    
    return jsonify(result)

@app.route('/frame')
def get_frame():
    """Return the latest frame and analysis results"""
    global latest_frame, yolo_result, openai_result
    
    with lock:
        if latest_frame is None:
            return jsonify({
                "error": "No frame available"
            })
        
        # Convert frame to base64 for sending to frontend
        try:
            # Make sure we're working with a valid numpy array
            if isinstance(latest_frame, np.ndarray):
                # Resize the frame to reduce bandwidth
                resized_frame = cv2.resize(latest_frame, (640, 480))
                _, buffer = cv2.imencode('.jpg', resized_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
                frame_base64 = base64.b64encode(buffer).decode('utf-8')
                
                print("Frame successfully encoded and ready to send")
                
                return jsonify({
                    "frame": frame_base64,
                    "yolo_result": yolo_result,
                    "openai_result": openai_result
                })
            else:
                print(f"Invalid frame type: {type(latest_frame)}")
                return jsonify({
                    "error": "Invalid frame type"
                })
        except Exception as e:
            print(f"Error encoding frame: {e}")
            return jsonify({
                "error": "Error encoding frame"
            })

if __name__ == '__main__':
    # Start on port 5002 to avoid conflict with AirPlay Receiver on macOS
    app.run(host='0.0.0.0', port=5002, debug=True)
