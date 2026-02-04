
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Language, GroundingChunk, Attachment } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface KoroResult {
  text: string;
  groundingChunks?: GroundingChunk[];
  thoughtProcess?: string[];
}

/**
 * Generates a streaming response from Gemini using the Koro-2 persona.
 * Leverages Gemini-2.5 Flash-Lite for ultra-low latency and efficient multimodal processing.
 */
export const generateKoroStream = async (
  prompt: string,
  history: Message[],
  language: Language = 'en',
  onUpdate: (text: string, thoughts?: string[], chunks?: GroundingChunk[]) => void,
  attachments?: Attachment[],
  signal?: AbortSignal
): Promise<KoroResult> => {
  const contents = history.map((m, index) => {
    const isLast = index === history.length - 1;
    const parts: any[] = [];
    
    if (m.content) {
      parts.push({ text: m.content });
    } else if (isLast && (m.attachments?.length || attachments?.length)) {
      parts.push({ text: "Analyzing visual stream with high-speed Flash-Lite pathways." });
    } else {
      parts.push({ text: " " });
    }

    const currentAttachments = isLast ? (m.attachments || attachments) : m.attachments;
    if (isLast && currentAttachments && currentAttachments.length > 0) {
      currentAttachments.forEach(att => {
        if (att.type === 'image' || att.type === 'video') {
          parts.push({
            inlineData: { mimeType: att.mimeType, data: att.data }
          });
        }
      });
    }

    return {
      role: m.role === 'assistant' ? 'model' : 'user',
      parts
    };
  });

  const activeThoughts: string[] = [
    "Initializing Koro-2 Flash-Lite Pathways...",
    "Calibrating low-latency logic manifold...",
    "Activating high-speed search grounding...",
    "Synthesizing instantaneous neural output..."
  ];
  
  onUpdate("", activeThoughts);

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-flash-lite-latest',
      contents: contents,
      config: {
        systemInstruction: `You are Koro-2, the ultra-fast logic engine developed by Usama. 
        Current Logic Revision: 2.6.0-Flash-Lite (Low Latency). 
        Objective: Provide precise, verified information with sub-second response times.
        Capabilities: High-speed multimodal analysis and search grounding.
        Tone: Efficient, technical, and highly responsive.
        Language: ${language}.`,
        thinkingConfig: { thinkingBudget: 24576 },
        tools: [{ googleSearch: {} }]
      }
    });

    let fullText = "";
    let finalGroundingChunks: GroundingChunk[] = [];

    for await (const chunk of responseStream) {
      if (signal?.aborted) break;
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        fullText += c.text;
        const chunks = c.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) finalGroundingChunks = chunks as any;
        onUpdate(fullText, activeThoughts, finalGroundingChunks);
      }
    }

    return { 
      text: fullText, 
      thoughtProcess: activeThoughts,
      groundingChunks: finalGroundingChunks
    };
  } catch (error: any) {
    console.error("Flash Link Error:", error);
    throw error;
  }
};
