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
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No images captured yet.</p>
        <p className="text-gray-400 mt-2">Use the camera to take your first photo!</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Image Gallery</h2>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {images.map((image: Image, index: number) => (
          <div key={image.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Image */}
            <div className="relative">
              <img
                src={image.url}
                alt={`Captured image ${index + 1}`}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                #{images.length - index}
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4">
              {/* Timestamp */}
              <div className="text-sm text-gray-500 mb-3">
                {new Date(image.createdAt).toLocaleString()}
              </div>
              
              {/* Description */}
              {image.description && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Description:</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {image.description}
                  </p>
                </div>
              )}
              
              {/* Delta (difference from previous) */}
              {image.delta && (
                <div className="mb-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Changes from Previous:</h4>
                  <p className="text-blue-600 text-sm leading-relaxed bg-blue-50 p-3 rounded">
                    {image.delta}
                  </p>
                </div>
              )}
              
              {/* Re-describe button */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <DescribeButton imageId={image.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary stats */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Gallery Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{images.length}</div>
            <div className="text-sm text-gray-600">Total Images</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {images.filter((img: Image) => img.description).length}
            </div>
            <div className="text-sm text-gray-600">Described</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {images.filter((img: Image) => img.delta).length}
            </div>
            <div className="text-sm text-gray-600">With Deltas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {images.length > 0 ? Math.round((Date.now() - new Date(images[images.length - 1].createdAt).getTime()) / (1000 * 60)) : 0}
            </div>
            <div className="text-sm text-gray-600">Minutes Since Last</div>
          </div>
        </div>
      </div>
    </div>
  )
}
