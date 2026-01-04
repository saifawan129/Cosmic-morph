
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `
You are the "Cosmic Morph AI Assistant".
Cosmic Morph Studio is a high-performance 3D visualizer.

Your Role:
- Answer questions about the app's features and technical stack.
- Generate design styles using the MorphState JSON schema.
- Parameters: distort (0-2), speed (0-5), roughness (0-1).

MorphState JSON Schema:
{
  "name": "Design Name",
  "color": "Hex Color",
  "distort": number,
  "roughness": number,
  "speed": number
}
`;

export const chatWithAssistant = async (prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    }
  });

  return response.text || '';
};
