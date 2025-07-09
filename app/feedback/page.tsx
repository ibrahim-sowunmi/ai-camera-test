import Link from 'next/link'
import RealtimeAnalysis from '@/components/RealtimeAnalysis'

export default function FeedbackPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header className="border-b" style={{ 
        backgroundColor: 'var(--surface)', 
        borderColor: 'var(--border-subtle)' 
      }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                backgroundColor: 'var(--brand-primary)'
              }}>
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                AI Camera
              </h1>
            </div>
            <nav className="flex space-x-1">
              <Link 
                href="/" 
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 nav-link"
              >
                Camera
              </Link>
              <Link 
                href="/gallery" 
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 nav-link"
              >
                Gallery
              </Link>
              <Link 
                href="/chat" 
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 nav-link"
              >
                Chat
              </Link>
              <Link 
                href="/feedback" 
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: 'white'
                }}
              >
                Feedback Now
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Realtime Feedback
            </h2>
            <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
              Show an object in your right hand for instant AI analysis
            </p>
          </div>
          
          <RealtimeAnalysis />
        </div>
      </main>
    </div>
  )
}
