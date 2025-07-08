'use client'

import { useRef, useState, useCallback } from 'react'
import { uploadImage } from '@/lib/actions'

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setUploadStatus('Error accessing camera')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
    }
  }, [])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(imageDataUrl)
        stopCamera()
      }
    }
  }, [stopCamera])

  const submitImage = useCallback(async () => {
    if (!capturedImage) return

    setIsUploading(true)
    setUploadStatus('Uploading and processing...')

    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage)
      const blob = await response.blob()
      
      // Create form data
      const formData = new FormData()
      formData.append('image', blob, 'captured-image.jpg')
      
      // Upload using server action
      const result = await uploadImage(formData)
      
      if (result.success) {
        setUploadStatus('Image uploaded and processed successfully!')
        setCapturedImage(null)
      } else {
        setUploadStatus(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Submit error:', error)
      setUploadStatus('Error submitting image')
    } finally {
      setIsUploading(false)
    }
  }, [capturedImage])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    setUploadStatus('')
    startCamera()
  }, [startCamera])

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">AI Camera</h2>
      
      <div className="relative mb-6">
        {/* Video preview */}
        {!capturedImage && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg bg-gray-900"
            style={{ aspectRatio: '4/3' }}
          />
        )}
        
        {/* Captured image preview */}
        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full rounded-lg"
            style={{ aspectRatio: '4/3', objectFit: 'cover' }}
          />
        )}
        
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        {!isStreaming && !capturedImage && (
          <button
            onClick={startCamera}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Camera
          </button>
        )}

        {isStreaming && !capturedImage && (
          <div className="flex gap-4">
            <button
              onClick={capturePhoto}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              📸 Take Photo
            </button>
            <button
              onClick={stopCamera}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Stop Camera
            </button>
          </div>
        )}

        {capturedImage && (
          <div className="flex gap-4">
            <button
              onClick={submitImage}
              disabled={isUploading}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
            >
              {isUploading ? 'Processing...' : '🚀 Submit & Analyze'}
            </button>
            <button
              onClick={retakePhoto}
              disabled={isUploading}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
            >
              🔄 Retake
            </button>
          </div>
        )}
      </div>

      {/* Status message */}
      {uploadStatus && (
        <div className={`mt-4 p-3 rounded-lg text-center ${
          uploadStatus.includes('Error') 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {uploadStatus}
        </div>
      )}
    </div>
  )
}
