import Link from 'next/link'
import Gallery from '../components/Gallery'

export default function GalleryPage() {
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
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: 'white'
                }}
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
      <main className="py-12">
        <Gallery />
      </main>
    </div>
  )
}
