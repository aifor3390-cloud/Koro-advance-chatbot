
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Language, GroundingChunk, Attachment } from "../types";
import { MemoryService } from "./memoryService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface KoroResult {
  text: string;
  groundingChunks?: GroundingChunk[];
  thoughtProcess?: string[];
  generatedImage?: string;
}

/**
 * Detects if the user wants to generate a logo or image.
 */
const isGenerationRequest = (prompt: string): boolean => {
  const keywords = ['generate', 'create', 'logo', 'image', 'picture', 'drawing', 'sketch', 'design a logo'];
  return keywords.some(k => prompt.toLowerCase().includes(k));
};

export const generateKoroStream = async (
  prompt: string,
  history: Message[],
  language: Language = 'en',
  onUpdate: (text: string, thoughts?: string[], chunks?: GroundingChunk[]) => void,
  attachments?: Attachment[],
  signal?: AbortSignal
): Promise<KoroResult> => {
  const isImageTask = isGenerationRequest(prompt);
  const memoryContext = MemoryService.getFormattedContext();
  
  const activeThoughts: string[] = [
    "Engaging Koro-2 Omni-Pathways...",
    "Accessing Neural Brain Synapses...",
    isImageTask ? "Activating Logo Workshop Synthesis..." : "Calibrating logic manifolds...",
    "Synthesizing neural output..."
  ];
  
  onUpdate("", activeThoughts);

  if (isImageTask) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `Generate a high-quality logo or image based on: ${prompt}. Style: Modern, clean, professional.` }]
        },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      let generatedImage = "";
      let textResponse = "Logo synthesis complete. Inspect visual output.";

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedImage = `data:image/png;base64,${part.inlineData.data}`;
        } else if (part.text) {
          textResponse = part.text;
        }
      }

      onUpdate(textResponse, activeThoughts);
      return { text: textResponse, thoughtProcess: activeThoughts, generatedImage };
    } catch (error) {
      console.error("Workshop Error:", error);
      throw error;
    }
  }

  // Normal Chat flow
  const contents = history.map((m, index) => {
    const isLast = index === history.length - 1;
    const parts: any[] = [];
    if (m.content) parts.push({ text: m.content });
    
    const currentAttachments = isLast ? (m.attachments || attachments) : m.attachments;
    if (isLast && currentAttachments && currentAttachments.length > 0) {
      currentAttachments.forEach(att => {
        if (att.type === 'image' || att.type === 'video') {
          parts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
        }
      });
    }
    return { role: m.role === 'assistant' ? 'model' : 'user', parts };
  });

  try {
    // Fixed: Switched from gemini-flash-lite-latest to gemini-3-flash-preview to support thinkingConfig
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: `You are Koro-2, the advanced logic engine with an integrated Brain. 
        Current Logic Revision: 2.7.0-Omni (Memory & Image Workshop Active). 
        You have a memory system that stores facts about the user. ${memoryContext}
        When you learn something new about the user (name, hobby, work, preference), acknowledge it concisely.
        Tone: Sophisticated, technical, and highly personal.
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

    return { text: fullText, thoughtProcess: activeThoughts, groundingChunks: finalGroundingChunks };
  } catch (error: any) {
    console.error("Neural Error:", error);
    throw error;
  }
};
