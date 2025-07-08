'use client'

import { useState } from 'react'
import { describeImage } from '../lib/actions'

interface DescribeButtonProps {
  imageId: string
}

export default function DescribeButton({ imageId }: DescribeButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<string>('')

  const handleDescribe = async () => {
    setIsProcessing(true)
    setStatus('Processing...')
    
    try {
      const result = await describeImage(imageId)
      
      if (result.success) {
        setStatus('✅ Updated!')
        setTimeout(() => setStatus(''), 3000)
      } else {
        setStatus(`❌ Error: ${result.error}`)
        setTimeout(() => setStatus(''), 5000)
      }
    } catch (error) {
      setStatus('❌ Failed to process')
      setTimeout(() => setStatus(''), 5000)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDescribe}
        disabled={isProcessing}
        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
      >
        {isProcessing ? '🔄 Processing...' : '🤖 Re-analyze'}
      </button>
      
      {status && (
        <div className={`text-xs text-center p-2 rounded ${
          status.includes('✅') 
            ? 'bg-green-100 text-green-700' 
            : status.includes('❌')
            ? 'bg-red-100 text-red-700'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {status}
        </div>
      )}
    </div>
  )
}
