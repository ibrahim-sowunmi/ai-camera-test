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

// Chat-related actions
export async function getChatHistory() {
  try {
    const messages = await prisma.chatMessage.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return messages
  } catch (error) {
    console.error('Get chat history error:', error)
    return []
  }
}

export async function saveChatMessage(role: 'user' | 'assistant', content: string) {
  try {
    const message = await prisma.chatMessage.create({
      data: {
        role,
        content,
      },
    })
    return message
  } catch (error) {
    console.error('Save chat message error:', error)
    throw error
  }
}

// AI Agent Tools
export async function getLatestChanges(range: number = 2) {
  try {
    const images = await prisma.image.findMany({
      orderBy: { createdAt: 'desc' },
      take: range,
    })
    
    if (images.length === 0) {
      return { success: false, message: 'No images found' }
    }
    
    const analysis = {
      totalImages: images.length,
      timeRange: {
        from: images[images.length - 1]?.createdAt,
        to: images[0]?.createdAt,
      },
      images: images.map(img => ({
        id: img.id,
        createdAt: img.createdAt,
        description: img.description,
        delta: img.delta,
      })),
    }
    
    return { success: true, data: analysis }
  } catch (error) {
    console.error('Get latest changes error:', error)
    return { success: false, message: 'Failed to get latest changes' }
  }
}

export async function getAllImageDescriptions() {
  try {
    const images = await prisma.image.findMany({
      select: {
        id: true,
        createdAt: true,
        description: true,
        delta: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return { success: true, data: images }
  } catch (error) {
    console.error('Get all descriptions error:', error)
    return { success: false, message: 'Failed to get image descriptions' }
  }
}

// AI Agent Chat Handler
export async function handleChatMessage(userMessage: string) {
  try {
    // Save user message
    await saveChatMessage('user', userMessage)
    
    // Prepare system prompt and tools for the AI agent
    const systemPrompt = `You are an AI assistant that helps users understand what's happening in their camera feed over time. You have access to tools that can analyze image changes and provide insights.

Available tools:
1. getLatestChanges(range) - Get the latest N images with their descriptions and deltas
2. getAllImageDescriptions() - Get all image descriptions to understand the full context

When users ask about recent changes, use the getLatestChanges tool. When they want a broader understanding, use getAllImageDescriptions.

Provide helpful, conversational responses about what you observe in the images.`
    
    // Simple tool detection (in a real implementation, you'd use a more sophisticated approach)
    let toolResponse = ''
    
    if (userMessage.toLowerCase().includes('latest') || userMessage.toLowerCase().includes('recent') || userMessage.toLowerCase().includes('change')) {
      const range = extractRangeFromMessage(userMessage)
      const result = await getLatestChanges(range)
      if (result.success && result.data) {
        toolResponse = `Based on the latest ${range} images:\n\n`
        result.data.images.forEach((img, index) => {
          toolResponse += `Image ${index + 1} (${new Date(img.createdAt).toLocaleString()}):\n`
          if (img.description) toolResponse += `Description: ${img.description}\n`
          if (img.delta) toolResponse += `Changes: ${img.delta}\n`
          toolResponse += '\n'
        })
      }
    } else if (userMessage.toLowerCase().includes('all') || userMessage.toLowerCase().includes('everything') || userMessage.toLowerCase().includes('summary')) {
      const result = await getAllImageDescriptions()
      if (result.success && result.data) {
        toolResponse = `Here's a summary of all captured images (${result.data.length} total):\n\n`
        result.data.slice(0, 5).forEach((img, index) => {
          toolResponse += `${index + 1}. ${new Date(img.createdAt).toLocaleString()}\n`
          if (img.description) toolResponse += `   ${img.description}\n`
          toolResponse += '\n'
        })
        if (result.data.length > 5) {
          toolResponse += `... and ${result.data.length - 5} more images.`
        }
      }
    }
    
    // Generate AI response using OpenAI
    const messages: Array<{ role: 'system' | 'user' | 'assistant', content: string }> = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage + (toolResponse ? `\n\nTool data:\n${toolResponse}` : '') }
    ]
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 500,
    })
    
    const assistantMessage = response.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response.'
    
    // Save assistant message
    await saveChatMessage('assistant', assistantMessage)
    
    revalidatePath('/chat')
    return { success: true, message: assistantMessage }
  } catch (error) {
    console.error('Chat handler error:', error)
    const errorMessage = 'I apologize, but I encountered an error while processing your message.'
    await saveChatMessage('assistant', errorMessage)
    return { success: false, message: errorMessage }
  }
}

function extractRangeFromMessage(message: string): number {
  const numbers = message.match(/\d+/)
  if (numbers) {
    const num = parseInt(numbers[0])
    return Math.min(Math.max(num, 1), 10) // Limit between 1 and 10
  }
  return 2 // Default
}
