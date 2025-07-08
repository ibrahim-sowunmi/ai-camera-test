import { getAllImages, describeImage } from '../lib/actions'
import DescribeButton from './DescribeButton'

interface Image {
  id: string
  url: string
  description: string | null
  delta: string | null
  createdAt: Date
}

export default async function Gallery() {
  const images = await getAllImages()

  if (images.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{
            backgroundColor: 'var(--container)'
          }}>
            <svg className="w-12 h-12" style={{ color: 'var(--text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>No images yet</h3>
          <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>Start capturing photos to build your AI-powered gallery</p>
          <a href="/" className="inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105" style={{
            backgroundColor: 'var(--brand-primary)',
            color: 'white'
          }}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Take First Photo
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Image Gallery</h2>
        <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>AI-analyzed photos with intelligent descriptions</p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {images.map((image: Image, index: number) => (
          <div key={image.id} className="rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-105" style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-md)'
          }}>
            {/* Image */}
            <div className="relative">
              <img
                src={image.url}
                alt={`Captured image ${index + 1}`}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-3 right-3 px-3 py-1 rounded-lg font-semibold text-sm" style={{
                backgroundColor: 'var(--brand-primary)',
                color: 'white'
              }}>
                #{images.length - index}
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Timestamp */}
              <div className="text-sm mb-4 font-medium" style={{ color: 'var(--text-tertiary)' }}>
                {new Date(image.createdAt).toLocaleString()}
              </div>
              
              {/* Description */}
              {image.description && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <svg className="w-4 h-4 mr-2" style={{ color: 'var(--brand-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI Description
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {image.description}
                  </p>
                </div>
              )}
              
              {/* Delta (difference from previous) */}
              {image.delta && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <svg className="w-4 h-4 mr-2" style={{ color: 'var(--info)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Changes Detected
                  </h4>
                  <div className="p-4 rounded-xl text-sm leading-relaxed" style={{
                    backgroundColor: 'var(--info-bg)',
                    color: 'var(--info)',
                    border: '1px solid var(--info)'
                  }}>
                    {image.delta}
                  </div>
                </div>
              )}
              
              {/* Re-describe button */}
              <div className="pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <DescribeButton imageId={image.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary stats */}
      <div className="mt-16 p-8 rounded-2xl border" style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border-subtle)'
      }}>
        <h3 className="text-2xl font-semibold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>Gallery Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--container)' }}>
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--brand-primary)' }}>{images.length}</div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Images</div>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--container)' }}>
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--brand-secondary)' }}>
              {images.filter((img: Image) => img.description).length}
            </div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>AI Described</div>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--container)' }}>
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--info)' }}>
              {images.filter((img: Image) => img.delta).length}
            </div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>With Changes</div>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--container)' }}>
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--brand-accent)' }}>
              {images.length > 0 ? Math.round((Date.now() - new Date(images[images.length - 1].createdAt).getTime()) / (1000 * 60)) : 0}
            </div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Minutes Ago</div>
          </div>
        </div>
      </div>
    </div>
  )
}
