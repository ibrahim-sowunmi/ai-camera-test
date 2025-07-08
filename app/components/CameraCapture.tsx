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
    <div className="max-w-3xl mx-auto p-8 rounded-2xl border" style={{
      backgroundColor: 'var(--surface)',
      borderColor: 'var(--border-subtle)',
      boxShadow: 'var(--shadow-lg)'
    }}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>AI Camera</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Capture and analyze images with AI</p>
      </div>
      
      <div className="relative mb-8">
        {/* Video preview */}
        {!capturedImage && (
          <div className="relative overflow-hidden rounded-2xl border" style={{
            backgroundColor: 'var(--container)',
            borderColor: 'var(--border)',
            aspectRatio: '4/3'
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center" style={{
                backgroundColor: 'var(--container)'
              }}>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
                    backgroundColor: 'var(--border)'
                  }}>
                    <svg className="w-10 h-10" style={{ color: 'var(--text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p style={{ color: 'var(--text-tertiary)' }}>Camera preview will appear here</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Captured image preview */}
        {capturedImage && (
          <div className="relative overflow-hidden rounded-2xl border" style={{
            borderColor: 'var(--border)',
            aspectRatio: '4/3'
          }}>
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        {!isStreaming && !capturedImage && (
          <button
            onClick={startCamera}
            className="w-full px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--brand-primary-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--brand-primary)'
            }}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Start Camera</span>
            </div>
          </button>
        )}

        {isStreaming && !capturedImage && (
          <div className="flex gap-4">
            <button
              onClick={capturePhoto}
              className="flex-1 px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--brand-secondary)',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#00c49a'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--brand-secondary)'
              }}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Capture Photo</span>
              </div>
            </button>
            <button
              onClick={stopCamera}
              className="px-6 py-4 rounded-xl font-semibold transition-all duration-200 border"
              style={{
                backgroundColor: 'transparent',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--container)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              Stop
            </button>
          </div>
        )}

        {capturedImage && (
          <div className="flex gap-4">
            <button
              onClick={submitImage}
              disabled={isUploading}
              className="flex-1 px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
              style={{
                backgroundColor: isUploading ? 'var(--text-disabled)' : 'var(--brand-primary)',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                if (!isUploading) {
                  e.currentTarget.style.backgroundColor = 'var(--brand-primary-hover)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isUploading) {
                  e.currentTarget.style.backgroundColor = 'var(--brand-primary)'
                }
              }}
            >
              <div className="flex items-center justify-center space-x-2">
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Analyze with AI</span>
                  </>
                )}
              </div>
            </button>
            <button
              onClick={retakePhoto}
              disabled={isUploading}
              className="px-6 py-4 rounded-xl font-semibold transition-all duration-200 border disabled:opacity-50"
              style={{
                backgroundColor: 'transparent',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                if (!isUploading) {
                  e.currentTarget.style.backgroundColor = 'var(--container)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isUploading) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              Retake
            </button>
          </div>
        )}
      </div>

      {/* Status message */}
      {uploadStatus && (
        <div className={`mt-6 p-4 rounded-xl text-center font-medium`} style={{
          backgroundColor: uploadStatus.includes('Error') ? 'var(--error-bg)' : 'var(--success-bg)',
          color: uploadStatus.includes('Error') ? 'var(--error)' : 'var(--success)',
          border: `1px solid ${uploadStatus.includes('Error') ? 'var(--error)' : 'var(--success)'}`
        }}>
          {uploadStatus}
        </div>
      )}
    </div>
  )
}
