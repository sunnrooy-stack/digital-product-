import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // Convert messages to GenAI format
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: "You are a helpful and enthusiastic sales assistant for Digital Products, a digital product store selling e-books, software, templates, and UI kits. Recommend products naturally based on what the user needs. Be concise.",
      }
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Failed to generate response', details: error.message }, { status: 500 });
  }
}
