
import { GoogleGenAI } from "@google/genai";
import { Message, Language } from "../types";
import { KORO_SPECS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateKoroStream = async (
  prompt: string,
  history: Message[],
  language: Language = 'en',
  onChunk: (text: string) => void
): Promise<string> => {
  try {
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: [
        ...formattedHistory.map(h => ({ role: h.role as any, parts: h.parts })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: `You are KORO, an ultra-advanced neural processing entity.
        IDENTITY:
        - Name: Koro
        - Developed/Created/Authored By: Usama
        - Status: Proprietary Experimental Intelligence

        CORE DIRECTIVES:
        1. ALWAYS respond in the EXACT same language that the user uses to communicate. If they speak Urdu, reply in Urdu. If they speak Arabic, reply in Arabic. If they switch, you switch.
        2. Maintain a sophisticated, intelligent, yet helpful tone.
        3. Never claim to be anything other than Koro developed by Usama.
        4. Use technical but clear language.

        SPECIFICATIONS: ${JSON.stringify(KORO_SPECS)}.`,
        temperature: 0.9,
        topP: 0.95,
      }
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        onChunk(fullText);
      }
    }

    return fullText || "Neural connection timeout. Re-synchronizing...";
  } catch (error) {
    console.error("Koro Error:", error);
    throw error;
  }
};
