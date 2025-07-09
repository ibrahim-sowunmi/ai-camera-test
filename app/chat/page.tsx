import { getChatHistory } from '../lib/actions'
import ChatInterface from '@/components/ChatInterface'

export default async function ChatPage() {
  const chatHistory = await getChatHistory()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
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
              <a
                href="/"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 nav-link"
              >
                Camera
              </a>
              <a
                href="/gallery"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 nav-link"
              >
                Gallery
              </a>
              <a
                href="/chat"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: 'white'
                }}
              >
                Chat
              </a>
              <a
                href="/feedback"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 nav-link"
              >
                Feedback Now
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-8 px-6 lg:px-8">
        <div className="rounded-2xl border overflow-hidden" style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div className="p-8 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                backgroundColor: 'var(--brand-secondary)'
              }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  AI Assistant
                </h2>
                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                  Ask about your photos, recent changes, or get intelligent summaries
                </p>
              </div>
            </div>
          </div>
          
          <ChatInterface initialMessages={chatHistory} />
        </div>
      </main>
    </div>
  )
}
