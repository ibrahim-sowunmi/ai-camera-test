// Test script to manually trigger image description
const { PrismaClient } = require('@prisma/client');
const { OpenAI } = require('openai');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testDescribeImage(imageId) {
  try {
    console.log('Testing image description for ID:', imageId);
    
    // Get the image from the database
    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });
    
    if (!image) {
      throw new Error('Image not found');
    }
    
    console.log('Found image:', image);
    
    // Read the image file and convert to base64
    const imagePath = path.join(process.cwd(), 'public', image.url);
    console.log('Image path:', imagePath);
    
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    console.log('Image loaded and converted to base64');
    
    // Prepare the OpenAI API call
    const prompt = "Describe this image in detail.";
    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: base64Image } }
        ]
      }
    ];
    
    console.log('Calling OpenAI API...');
    console.log('API Key available:', !!process.env.OPENAI_API_KEY);
    
    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 500,
    });
    
    console.log('OpenAI API response:', response);
    
    const description = response.choices[0]?.message?.content || "No description available";
    console.log('Generated description:', description);
    
    // Update the image with the description
    await prisma.image.update({
      where: { id: imageId },
      data: { description },
    });
    
    console.log('Image updated successfully!');
    return { success: true, description };
  } catch (error) {
    console.error('Error in test script:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    await prisma.$disconnect();
  }
}

// Get the image ID from command line arguments or use the first one
const imageId = process.argv[2] || '2ae652ae-b68b-4589-afa0-868e36f27658';

testDescribeImage(imageId)
  .then((result) => {
    console.log('Test result:', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
