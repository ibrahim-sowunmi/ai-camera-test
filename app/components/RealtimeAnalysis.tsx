"use client";

import { useEffect, useState } from "react";

interface AnalysisResult {
  item: string;
  timestamp: number;
}

export default function RealtimeAnalysis() {
  const [isConnected, setIsConnected] = useState(false);
  const [isAnalysisRunning, setIsAnalysisRunning] = useState(false);
  const [frame, setFrame] = useState<string | null>(null);
  const [yoloResult, setYoloResult] = useState<AnalysisResult | null>(null);
  const [openaiResult, setOpenaiResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  // Start the analysis when the component mounts
  useEffect(() => {
    startAnalysis();
    return () => {
      stopAnalysis();
    };
  }, []);

  // Fetch frames and analysis results at regular intervals
  useEffect(() => {
    if (!isAnalysisRunning) return;

    const intervalId = setInterval(fetchFrame, 100); // 10fps for UI updates

    return () => {
      clearInterval(intervalId);
    };
  }, [isAnalysisRunning]);

  const startAnalysis = async () => {
    try {
      setError(null);
      const response = await fetch("http://localhost:5002/start");
      const data = await response.json();

      if (data.status === "running") {
        setIsAnalysisRunning(true);
        setIsConnected(true);
      } else {
        setError("Failed to start analysis");
      }
    } catch (err) {
      setError(
        "Could not connect to the analysis server. Make sure it's running on port 5002."
      );
      setIsConnected(false);
    }
  };

  const stopAnalysis = async () => {
    try {
      await fetch("http://localhost:5002/stop");
      setIsAnalysisRunning(false);
    } catch (err) {
      console.error("Error stopping analysis:", err);
    }
  };

  const fetchFrame = async () => {
    try {
      const response = await fetch("http://localhost:5002/frame");
      const data = await response.json();

      if (data.error) {
        console.error("Error fetching frame:", data.error);
        return;
      }

      setFrame(data.frame);
      setYoloResult(data.yolo_result);
      setOpenaiResult(data.openai_result);
    } catch (err) {
      console.error("Error fetching frame:", err);
      setIsConnected(false);
    }
  };

  const requestFeedback = async () => {
    try {
      setIsFeedbackLoading(true);
      const response = await fetch("http://localhost:5002/request-feedback", {
        method: "POST",
      });
      const data = await response.json();

      if (data.status === "success") {
        // The backend will update the openaiResult, which we'll get in the next frame fetch
        console.log("Feedback requested successfully");
      } else {
        setError("Failed to get feedback: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error requesting feedback:", err);
      setError("Failed to connect to feedback service");
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-white">Realtime Analysis</h2>

      {error && (
        <div className="bg-red-500 text-white p-4 rounded-md w-full">
          {error}
          <button
            onClick={startAnalysis}
            className="ml-4 bg-white text-red-500 px-3 py-1 rounded-md"
          >
            Retry
          </button>
        </div>
      )}

      <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-full">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p>Connecting to analysis server...</p>
            <button
              onClick={startAnalysis}
              className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-md"
            >
              Connect
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              {frame ? (
                <img
                  src={`data:image/jpeg;base64,${frame}`}
                  alt="Webcam feed"
                  className="w-full rounded-md"
                />
              ) : (
                <div className="bg-gray-800 h-64 w-full flex items-center justify-center rounded-md">
                  <p className="text-gray-400">Loading video feed...</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* YOLOv12 Real-time Analysis */}
              <div className="bg-gray-800 p-4 rounded-md">
                <h3 className="text-xl font-semibold text-white mb-2">
                  YOLOv11 Real-time Analysis
                </h3>
                {yoloResult ? (
                  <div>
                    <p className="text-lg text-white">
                      <span className="font-medium">Detected:</span>{" "}
                      {yoloResult.item}
                    </p>
                    <p className="text-sm text-gray-400">
                      Last updated:{" "}
                      {new Date(yoloResult.timestamp * 1000).toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400">Waiting for analysis...</p>
                )}
              </div>

              {/* OpenAI Vision Analysis */}
              <div className="bg-gray-800 p-4 rounded-md">
                <h3 className="text-xl font-semibold text-white mb-2">
                  OpenAI Vision Analysis
                </h3>
                {openaiResult ? (
                  <div>
                    <p className="text-lg text-white">
                      <span className="font-medium">Detected:</span>{" "}
                      {openaiResult.item}
                    </p>
                    <p className="text-sm text-gray-400">
                      Last updated:{" "}
                      {new Date(openaiResult.timestamp * 1000).toLocaleTimeString()}
                    </p>
                    <button
                      onClick={requestFeedback}
                      disabled={isFeedbackLoading}
                      className={`mt-3 px-4 py-2 rounded-md ${isFeedbackLoading
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        }`}
                    >
                      {isFeedbackLoading ? "Getting feedback..." : "Provide me feedback"}
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-400">Waiting for analysis...</p>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={startAnalysis}
                disabled={isAnalysisRunning}
                className={`px-4 py-2 rounded-md ${isAnalysisRunning
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-green-700 text-white"
                  }`}
              >
                {isAnalysisRunning ? "Analysis Running" : "Start Analysis"}
              </button>
              <button
                onClick={stopAnalysis}
                disabled={!isAnalysisRunning}
                className={`px-4 py-2 rounded-md ${!isAnalysisRunning
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-600 to-red-700 text-white"
                  }`}
              >
                Stop Analysis
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-full">
        <h3 className="text-xl font-semibold text-white mb-4">
          How to use this feature
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-300">
          <li>
            Position your right hand in the left half of the camera view (the
            green box).
          </li>
          <li>Hold an object in your hand that you want to identify.</li>
          <li>
            The system uses two AI models:
            <ul className="list-circle pl-5 mt-1">
              <li><strong>YOLOv11:</strong> Provides real-time object detection</li>
              <li><strong>OpenAI Vision:</strong> Provides detailed analysis on demand</li>
            </ul>
          </li>
          <li>
            Click the "Provide me feedback" button to get detailed analysis from OpenAI Vision API.
          </li>
        </ul>
      </div>
    </div>
  );
}
