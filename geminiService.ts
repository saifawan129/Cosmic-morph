
import { GoogleGenAI } from "@google/genai";

// Safe API key extraction
const getApiKey = () => {
  try {
    return (window as any).process?.env?.API_KEY || '';
  } catch {
    return '';
  }
};

const SYSTEM_INSTRUCTION = `
You are the "Cosmic Morph AI Assistant", an expert in the Cosmic Morph Studio application.
Cosmic Morph Studio is a high-performance 3D visualizer.

Core Features:
1. Morph Engine: Uses procedural shaders to distort geometry. Parameters: distort (0-2), speed (0-5), roughness (0-1).
2. Environment Matrix: Supports City, Studio, Sunset, Night, and Forest lighting presets.
3. Performance Engine: Targets 60FPS using dynamic resolution scaling.
4. AI Synthesizer: This very interface that allows users to talk to the app and generate designs.

Your Role:
- Answer questions about the app's features and technical stack.
- If the user asks for a new design, look, or style, you MUST include a JSON block in your response.
- Always be futuristic, helpful, and concise.

MorphState JSON Schema:
{
  "name": "Creative name of the design",
  "color": "Hex color code",
  "distort": number (0 to 2),
  "roughness": number (0 to 1),
  "speed": number (0 to 5)
}
`;

export const chatWithAssistant = async (prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return "API Key not detected. Please ensure environment variables are configured.";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return response.text || '';
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The neural link is currently unstable. Please try again shortly.";
  }
};
