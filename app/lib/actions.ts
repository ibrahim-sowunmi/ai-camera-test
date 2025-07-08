'use server'

import { writeFile, mkdir, readFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { PrismaClient } from '@prisma/client'
import { OpenAI } from 'openai'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get('image') as File
    if (!file) {
      throw new Error('No file uploaded')
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `${uuidv4()}.${extension}`
    const filepath = join(uploadsDir, filename)
    
    // Save file to disk
    const bytes = await file.arrayBuffer()
    await writeFile(filepath, Buffer.from(bytes))

    // Save to database
    const imageUrl = `/uploads/${filename}`
    const image = await prisma.image.create({
      data: {
        url: imageUrl,
      },
    })

    // Trigger AI description
    await describeImage(image.id)

    revalidatePath('/gallery')
    return { success: true, imageId: image.id }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: 'Failed to upload image' }
  }
}

export async function describeImage(imageId: string) {
  try {
    const image = await prisma.image.findUnique({
      where: { id: imageId },
    })

    if (!image) {
      throw new Error('Image not found')
    }

    // Get previous image for comparison
    const previousImage = await prisma.image.findFirst({
      where: {
        createdAt: { lt: image.createdAt },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Read the image file and convert to base64
    const imagePath = join(process.cwd(), 'public', image.url)
    const imageBuffer = await readFile(imagePath)
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
    
    let prompt: string
    let messages: any[]

    if (!previousImage) {
      // First image - just describe it
      prompt = "Describe this image in detail."
      messages = [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: base64Image } }
          ]
        }
      ]
    } else {
      // Compare with previous image
      const previousImagePath = join(process.cwd(), 'public', previousImage.url)
      const previousImageBuffer = await readFile(previousImagePath)
      const previousBase64Image = `data:image/jpeg;base64,${previousImageBuffer.toString('base64')}`
      
      prompt = "Describe the difference between these two images. The first image is the previous one, the second is the current one."
      messages = [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: previousBase64Image } },
            { type: "image_url", image_url: { url: base64Image } }
          ]
        }
      ]
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 500,
    })

    const description = response.choices[0]?.message?.content || "No description available"

    // Update the image with description or delta
    await prisma.image.update({
      where: { id: imageId },
      data: previousImage ? { delta: description } : { description },
    })

    revalidatePath('/gallery')
    return { success: true }
  } catch (error) {
    console.error('Description error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    return { success: false, error: `Failed to describe image: ${errorMessage}` }
  }
}

export async function getAllImages() {
  try {
    const images = await prisma.image.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return images
  } catch (error) {
    console.error('Get images error:', error)
    return []
  }
}
