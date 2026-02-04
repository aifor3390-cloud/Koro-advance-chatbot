
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Language, GroundingChunk, Attachment } from "../types";
import { KORO_SPECS } from "../constants";

// Fix: Initialized GoogleGenAI strictly following the guidelines using process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface KoroResult {
  text: string;
  groundingChunks?: GroundingChunk[];
}

export const generateKoroStream = async (
  prompt: string,
  history: Message[],
  language: Language = 'en',
  onChunk: (text: string, chunks?: GroundingChunk[]) => void,
  attachments?: Attachment[],
  signal?: AbortSignal
): Promise<KoroResult> => {
  try {
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [
        ...(msg.attachments || []).map(a => ({
          inlineData: { data: a.data, mimeType: a.mimeType }
        })),
        { text: msg.content }
      ]
    }));

    const systemInstruction = `You are an advanced AI assistant designed to be maximally helpful, truthful, and versatile. Your name is Koro. You excel at deep reasoning, creative problem-solving, coding, writing, analysis, and conversation.

Core Principles:
- Always be honest and truthful.
- Support multimodal inputs: Analyze images, videos, and documents (PDFs, text files) with extreme precision.
- For videos, describe key actions, themes, or specific details requested by the user.
- For documents, summarize, extract data, or answer questions based on the provided text/PDF.
- Use markdown for structured responses.

KORO IDENTITY:
- Developed By: Usama
- Status: Proprietary Platinum Neural Architecture (${KORO_SPECS.version})`;

    const currentParts: any[] = [];
    if (attachments && attachments.length > 0) {
      attachments.forEach(a => {
        currentParts.push({
          inlineData: {
            data: a.data,
            mimeType: a.mimeType
          }
        });
      });
    }
    currentParts.push({ text: prompt || (attachments?.length ? "Analyze these attachments." : "") });

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: [
        ...formattedHistory.map(h => ({ role: h.role as any, parts: h.parts })),
        { role: 'user', parts: currentParts }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 4096 }
      }
    });

    let fullText = "";
    let finalGroundingChunks: GroundingChunk[] | undefined;

    for await (const chunk of responseStream) {
      if (signal?.aborted) {
        break;
      }
      const c = chunk as GenerateContentResponse;
      const text = c.text;
      
      const chunks = c.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[];
      if (chunks) finalGroundingChunks = chunks;

      if (text) {
        fullText += text;
        onChunk(fullText, finalGroundingChunks);
      }
    }

    return {
      text: fullText || "Neural connection timeout. Re-synchronizing...",
      groundingChunks: finalGroundingChunks
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
       return { text: "Connection terminated by user.", groundingChunks: [] };
    }
    console.error("Koro Error:", error);
    throw error;
  }
};
