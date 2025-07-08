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
    <div className="flex flex-col gap-3">
      <button
        onClick={handleDescribe}
        disabled={isProcessing}
        className="px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
        style={{
          backgroundColor: isProcessing ? 'var(--container)' : 'var(--brand-secondary)',
          color: isProcessing ? 'var(--text-secondary)' : 'white',
          border: `1px solid ${isProcessing ? 'var(--border-subtle)' : 'var(--brand-secondary)'}`
        }}
      >
        {isProcessing ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Analyzing...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Re-analyze
          </>
        )}
      </button>
      
      {status && (
        <div className="text-xs text-center p-3 rounded-lg font-medium transition-all duration-200" style={{
          backgroundColor: status.includes('✅') 
            ? 'var(--success-bg)' 
            : status.includes('❌')
            ? 'var(--error-bg)'
            : 'var(--info-bg)',
          color: status.includes('✅') 
            ? 'var(--success)' 
            : status.includes('❌')
            ? 'var(--error)'
            : 'var(--info)',
          border: `1px solid ${status.includes('✅') 
            ? 'var(--success)' 
            : status.includes('❌')
            ? 'var(--error)'
            : 'var(--info)'}`
        }}>
          {status.replace('✅', '').replace('❌', '').trim()}
        </div>
      )}
    </div>
  )
}
