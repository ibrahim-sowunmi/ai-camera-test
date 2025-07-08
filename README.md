# 🤖 AI Camera - Next.js 15 Application

An AI-powered camera application built with Next.js 15, React, Prisma, PostgreSQL, and OpenAI Vision API. Capture photos from your webcam and let AI describe what it sees, with intelligent comparison between consecutive images.

## ✨ Features

- **📸 Live Camera Feed**: Real-time webcam preview with instant photo capture
- **🧠 AI Image Description**: GPT-4 Vision API analyzes and describes every image
- **🔄 Change Detection**: Compares consecutive images to identify differences
- **🖼️ Gallery View**: Browse all captured images with descriptions and deltas
- **⚡ Server Actions**: Uses Next.js 15 Server Actions with FormData (no Express needed)
- **💾 Local Storage**: Images stored on disk with PostgreSQL metadata

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes & Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI GPT-4 Vision API
- **Storage**: Local disk (development)
- **Styling**: Tailwind CSS

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- Webcam/camera access

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/ai_camera_db"
OPENAI_API_KEY="your-openai-api-key-here"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Create and migrate database
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## 📁 Project Structure

```
app/
├── components/
│   ├── CameraCapture.tsx    # Webcam interface & photo capture
│   ├── Gallery.tsx          # Image gallery with AI descriptions
│   └── DescribeButton.tsx   # Manual re-analysis trigger
├── lib/
│   └── actions.ts           # Server actions for image handling
├── gallery/
│   └── page.tsx            # Gallery page
├── page.tsx                # Home page with camera
└── layout.tsx              # Root layout

prisma/
└── schema.prisma           # Database schema

public/
└── uploads/                # Stored images (created automatically)
```

## 🔄 Image Processing Flow

1. **Capture**: User takes photo via webcam
2. **Upload**: Image sent to server action via FormData
3. **Storage**: File saved to `/public/uploads/` + DB record created
4. **AI Analysis**: 
   - First image: "Describe this image in detail"
   - Subsequent images: "Describe the difference between these images"
5. **Database Update**: Description/delta saved to PostgreSQL
6. **Gallery Refresh**: UI updates with new analysis

## 🗄️ Database Schema

```prisma
model Image {
  id          String   @id @default(uuid())
  url         String   // Path to stored image file
  description String?  // AI description (first image)
  delta       String?  // AI comparison (subsequent images)
  createdAt   DateTime @default(now())
}
```

## 🔧 API Endpoints (Server Actions)

| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `uploadImage()` | Upload & store image | FormData with image file | `{success: boolean, imageId?: string, error?: string}` |
| `describeImage()` | Trigger AI analysis | `imageId: string` | `{success: boolean, error?: string}` |
| `getAllImages()` | Fetch all images | None | `Image[]` |

## 🎯 Usage

### Taking Photos
1. Navigate to home page (`/`)
2. Click "Start Camera" to enable webcam
3. Click "📸 Take Photo" to capture
4. Review preview and click "🚀 Submit & Analyze"
5. AI will automatically describe the image

### Viewing Gallery
1. Navigate to gallery page (`/gallery`)
2. Browse images in reverse chronological order
3. View AI descriptions and change comparisons
4. Use "🤖 Re-analyze" to trigger new AI analysis

## 🔍 Key Features Explained

### Server Actions with FormData
Utilizes Next.js 15's server actions instead of traditional API routes:
```typescript
'use server'
export async function uploadImage(formData: FormData) {
  const file = formData.get('image') as File
  // Process file...
}
```

### AI Image Comparison
- **First Image**: Gets detailed description
- **Subsequent Images**: Compares with previous image to highlight changes
- Uses GPT-4 Vision with multiple image inputs for comparison

### Real-time Camera
- Uses `navigator.mediaDevices.getUserMedia()` for webcam access
- Canvas-based image capture for high quality
- Blob conversion for server upload

## 🚨 Troubleshooting

### Camera Access Issues
- Ensure HTTPS in production (required for camera access)
- Check browser permissions for camera
- Verify webcam is not in use by other applications

### Database Connection
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Run `npx prisma migrate reset` if schema issues

### OpenAI API
- Verify API key is valid and has credits
- Check rate limits if requests fail
- Ensure images are accessible via public URL

## 📈 Future Enhancements

- [ ] Cloud storage integration (AWS S3, Cloudinary)
- [ ] User authentication and multi-user support
- [ ] Image tagging and search functionality
- [ ] Export gallery as PDF/slideshow
- [ ] Real-time streaming analysis
- [ ] Mobile app version

## 📄 License

MIT License - feel free to use this project for learning and development!
