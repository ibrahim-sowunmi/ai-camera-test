import Link from 'next/link'
import CameraCapture from './components/CameraCapture'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🤖 AI Camera</h1>
            </div>
            <nav className="flex space-x-4">
              <Link 
                href="/" 
                className="px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-700"
              >
                📸 Camera
              </Link>
              <Link 
                href="/gallery" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                🖼️ Gallery
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            AI-Powered Camera Experience
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Capture photos and let AI describe what it sees. Each new photo is compared 
            with the previous one to highlight changes and differences.
          </p>
        </div>

        {/* Camera Component */}
        <div className="flex justify-center">
          <CameraCapture />
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <div className="text-4xl mb-4">📷</div>
            <h3 className="text-lg font-semibold mb-2">Live Camera Feed</h3>
            <p className="text-gray-600">Access your camera with live preview and instant photo capture.</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-lg font-semibold mb-2">AI Description</h3>
            <p className="text-gray-600">GPT-4 Vision analyzes and describes every image in detail.</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-lg font-semibold mb-2">Change Detection</h3>
            <p className="text-gray-600">Compare consecutive images to identify differences and changes.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
