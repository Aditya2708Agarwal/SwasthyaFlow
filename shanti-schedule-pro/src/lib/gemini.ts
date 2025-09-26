import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI('AIzaSyBk_SVe3csCU0D20dZECX8BWjcP6WcExzg');

export const generateAIResponse = async (prompt: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
};