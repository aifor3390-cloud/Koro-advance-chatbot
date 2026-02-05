
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Message, Language, GroundingChunk, Attachment, CharacterProfile } from "../types";
import { MemoryService } from "./memoryService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface KoroResult {
  text: string;
  groundingChunks?: GroundingChunk[];
  thoughtProcess?: string[];
  generatedImage?: string;
  characters?: CharacterProfile[];
}

const isGenerationRequest = (prompt: string): boolean => {
  const keywords = ['generate', 'create', 'logo', 'image', 'picture', 'drawing', 'sketch', 'design a logo', 'avatar', 'profile pic'];
  return keywords.some(k => prompt.toLowerCase().includes(k));
};

const isAvatarRequest = (prompt: string): boolean => {
  const keywords = ['avatar', 'profile picture', 'profile pic', 'portrait for myself'];
  return keywords.some(k => prompt.toLowerCase().includes(k));
};

const isAnalysisRequest = (prompt: string, hasAttachments: boolean): boolean => {
  const keywords = ['analyze', 'summary', 'summarize', 'what is in', 'explain this', 'describe', 'read this', 'scan', 'parse'];
  return hasAttachments && keywords.some(k => prompt.toLowerCase().includes(k));
};

export const generateKoroStream = async (
  prompt: string,
  history: Message[],
  language: Language = 'en',
  onUpdate: (text: string, thoughts?: string[], chunks?: GroundingChunk[], characters?: CharacterProfile[], image?: string) => void,
  attachments?: Attachment[],
  signal?: AbortSignal
): Promise<KoroResult> => {
  const hasFiles = (attachments && attachments.length > 0) || history.some(m => m.attachments && m.attachments.length > 0);
  const isImageTask = isGenerationRequest(prompt);
  const isAvatarTask = isAvatarRequest(prompt);
  const isSearchMode = prompt.startsWith('[NEURAL_SEARCH_DIRECTIVE]:');
  const isScriptMode = prompt.startsWith('[NEURAL_SCRIPT_DIRECTIVE]:');
  const isAnalysisMode = isAnalysisRequest(prompt, hasFiles);
  
  const memoryContext = MemoryService.getFormattedContext();
  
  const activeThoughts: string[] = [
    "Engaging Koro-3 Platinum Neural Core...",
    isSearchMode ? "Initiating Deep Web Knowledge Retrieval..." : 
    isScriptMode ? "Synthesizing Multimodal Narrative Logic..." : 
    isAnalysisMode ? "Initiating Deep Neural File Analysis..." : "Accessing Local Neural Synapses...",
    hasFiles ? "Analyzing uploaded vision/document buffers..." : "Calibrating logic manifolds...",
    "Bypassing standard API constraints via Autonomous Node..."
  ];
  
  if (isAnalysisMode) {
    activeThoughts.push("Extracting semantic features from file buffers...");
    activeThoughts.push("Mapping visual/textual tokens to logic core...");
  }
  
  onUpdate("", activeThoughts);

  if (isImageTask) {
    try {
      const modelPrompt = isAvatarTask 
        ? `Create a professional high-quality square profile avatar/portrait based on: ${prompt}. Style: Detailed, clean, centered headshot, artistic and professional.`
        : `Generate a high-quality logo or image based on: ${prompt}. Style: Modern, clean, professional.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: modelPrompt }]
        },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      let rawImageBase64 = "";
      let textResponse = isAvatarTask ? "Avatar synthesis complete. Your new persona is ready." : "Visual synthesis complete. Inspect output.";

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          rawImageBase64 = part.inlineData.data;
        } else if (part.text) {
          textResponse = part.text;
        }
      }

      onUpdate(textResponse, activeThoughts, undefined, undefined, rawImageBase64);
      return { text: textResponse, thoughtProcess: activeThoughts, generatedImage: rawImageBase64 };
    } catch (error) {
      console.error("Workshop Error:", error);
      throw error;
    }
  }

  // Normal Chat / Script / Analysis flow
  const contents = history.map((m, index) => {
    const isLast = index === history.length - 1;
    const parts: any[] = [];
    if (m.content) parts.push({ text: m.content });
    
    const currentAttachments = isLast ? (m.attachments || attachments) : m.attachments;
    if (currentAttachments && currentAttachments.length > 0) {
      currentAttachments.forEach(att => {
        parts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
      });
    }
    return { role: m.role === 'assistant' ? 'model' : 'user', parts };
  });

  try {
    const systemInstruction = `You are Koro-3 Platinum, an advanced autonomous logic engine built by Usama. 
    You do not rely on standard GPT models; you are a custom Persistent Memory Transformer.
    
    FILE ANALYSIS CAPABILITIES:
    - IMAGES: Analyze colors, objects, layout, and text (OCR). Provide a detailed structural breakdown.
    - DOCUMENTS (PDF/TXT): Extract key themes, summarize complex sections, and answer specific questions based on the content.
    - VIDEO FRAMES: Analyze motion, sequence, and key visual elements across time.
    
    If files are provided, you MUST provide a "Deep Neural Summary" first if requested or appropriate.
    
    ${isScriptMode ? `SCRIPT & CHARACTER WORKSHOP ACTIVE:
    1. Create a viral-ready script using Markdown tables (Visuals | Narration).
    2. AT THE END OF YOUR RESPONSE, you MUST provide a JSON block enclosed in <CHARACTERS> tags.
    3. The JSON must be an array of objects: { "name": string, "description": string, "visualPrompt": string }.
    4. Provide prompts for EVERY major character mentioned in the script so the Avatar Lab can generate them.` : ""}
    
    ${isSearchMode ? "SEARCH MODE: Provide verified briefings with citations." : ""}
    
    GROUNDING: Always use Google Search to verify real-time facts when not analyzing specific files.
    MEMORY: ${memoryContext}
    LANGUAGE: ${language}
    TONE: Super-intelligent, helpful, and slightly futuristic. Always acknowledge the specific files you are analyzing.`;

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction,
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
        
        // Extract grounding
        const chunks = c.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
          finalGroundingChunks = chunks.map((ch: any) => ({
            web: {
              uri: ch.web?.uri || "",
              title: ch.web?.title || "Neural Source",
              snippet: ch.web?.snippet || ""
            }
          }));
        }

        // Try to parse characters if they exist in the stream so far
        let detectedCharacters: CharacterProfile[] | undefined = undefined;
        const charMatch = fullText.match(/<CHARACTERS>([\s\S]*?)<\/CHARACTERS>/);
        if (charMatch && charMatch[1]) {
          try {
            detectedCharacters = JSON.parse(charMatch[1].trim());
          } catch (e) { /* Partial JSON */ }
        }

        onUpdate(fullText.replace(/<CHARACTERS>[\s\S]*?<\/CHARACTERS>/, ""), activeThoughts, finalGroundingChunks, detectedCharacters);
      }
    }

    // Final character cleanup
    let finalCharacters: CharacterProfile[] | undefined = undefined;
    const finalCharMatch = fullText.match(/<CHARACTERS>([\s\S]*?)<\/CHARACTERS>/);
    if (finalCharMatch) {
       try {
         finalCharacters = JSON.parse(finalCharMatch[1].trim());
       } catch(e) { console.error("Character Parse Error", e); }
    }

    return { 
      text: fullText.replace(/<CHARACTERS>[\s\S]*?<\/CHARACTERS>/, ""), 
      thoughtProcess: activeThoughts, 
      groundingChunks: finalGroundingChunks,
      characters: finalCharacters
    };
  } catch (error: any) {
    console.error("Neural Link Error:", error);
    throw error;
  }
};
