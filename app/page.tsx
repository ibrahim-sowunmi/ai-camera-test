import Link from 'next/link'
import CameraCapture from './components/CameraCapture'

export default function Home() {
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
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: 'white'
                }}
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
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            AI-Powered Camera Experience
          </h2>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Capture photos and let AI describe what it sees. Each new photo is compared 
            with the previous one to highlight changes and differences.
          </p>
        </div>

        {/* Camera Component */}
        <div className="flex justify-center mb-16">
          <CameraCapture />
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-8 rounded-2xl border transition-all duration-300 hover:scale-105" style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{
              backgroundColor: 'var(--brand-primary)',
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-primary-hover))'
            }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Live Camera Feed</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Access your camera with live preview and instant photo capture.</p>
          </div>
          <div className="text-center p-8 rounded-2xl border transition-all duration-300 hover:scale-105" style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{
              backgroundColor: 'var(--brand-secondary)',
              background: 'linear-gradient(135deg, var(--brand-secondary), #00c49a)'
            }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>AI Description</h3>
            <p style={{ color: 'var(--text-secondary)' }}>GPT-4 Vision analyzes and describes every image in detail.</p>
          </div>
          <div className="text-center p-8 rounded-2xl border transition-all duration-300 hover:scale-105" style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{
              backgroundColor: 'var(--info)',
              background: 'linear-gradient(135deg, var(--info), #6c5ce7)'
            }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Change Detection</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Compare consecutive images to identify differences and changes.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
