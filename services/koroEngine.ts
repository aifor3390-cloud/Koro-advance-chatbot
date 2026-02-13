
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

interface IntentProfile {
  mode: 'chat' | 'search' | 'script' | 'analysis' | 'image' | 'avatar';
  confidence: 'low' | 'medium' | 'high';
  reason: string;
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

const sanitizePrompt = (prompt: string): string => prompt.replace(/\s+/g, ' ').trim();

const trimHistory = (history: Message[], maxMessages: number = 14): Message[] => {
  if (history.length <= maxMessages) return history;
  return history.slice(-maxMessages);
};

const detectIntent = (prompt: string, hasFiles: boolean): IntentProfile => {
  if (prompt.startsWith('[NEURAL_SEARCH_DIRECTIVE]:')) {
    return { mode: 'search', confidence: 'high', reason: 'explicit-search-directive' };
  }
  if (prompt.startsWith('[NEURAL_SCRIPT_DIRECTIVE]:')) {
    return { mode: 'script', confidence: 'high', reason: 'explicit-script-directive' };
  }
  if (isAvatarRequest(prompt)) {
    return { mode: 'avatar', confidence: 'high', reason: 'avatar-keywords-detected' };
  }
  if (isGenerationRequest(prompt)) {
    return { mode: 'image', confidence: 'high', reason: 'image-keywords-detected' };
  }
  if (isAnalysisRequest(prompt, hasFiles)) {
    return { mode: 'analysis', confidence: 'high', reason: 'attachments-with-analysis-query' };
  }
  if (hasFiles) {
    return { mode: 'analysis', confidence: 'medium', reason: 'attachments-present' };
  }
  return { mode: 'chat', confidence: 'medium', reason: 'default-conversational-flow' };
};

const extractMemoryCandidates = (prompt: string): string[] => {
  const memoryPatterns = [
    /my name is ([^.,!?\n]+)/i,
    /i am ([^.,!?\n]+)/i,
    /i prefer ([^.,!?\n]+)/i,
    /i like ([^.,!?\n]+)/i,
    /my goal is to ([^.,!?\n]+)/i,
    /remember that ([^.,!?\n]+)/i,
  ];

  return memoryPatterns
    .map((pattern) => prompt.match(pattern)?.[1]?.trim())
    .filter((fact): fact is string => Boolean(fact && fact.length > 2))
    .map((fact) => fact.charAt(0).toUpperCase() + fact.slice(1));
};

const buildSystemInstruction = (
  language: Language,
  memoryContext: string,
  intent: IntentProfile,
  hasFiles: boolean
): string => {
  const baseGuidelines = [
    'You are Koro, an advanced multimodal assistant built by Usama.',
    'Be clear, technically accurate, and practical. Use concise structure with headings when helpful.',
    'If the user asks for step-by-step help, provide implementation-ready output.',
    'If uncertain, state uncertainty and propose a verification step instead of guessing.',
    `Answer in language: ${language}.`,
    hasFiles
      ? 'When files are attached, acknowledge each file type and explain what was extracted from it.'
      : 'When no files are attached, reason from user context and current conversation.',
    memoryContext ? `Relevant memory context:${memoryContext}` : 'No persistent user memories yet.',
    `Detected intent mode: ${intent.mode} (confidence: ${intent.confidence}, reason: ${intent.reason}).`,
  ];

  const modeSpecificRules: Record<IntentProfile['mode'], string[]> = {
    chat: ['Keep answers focused and collaborative. Ask one clarifying question only if required.'],
    search: [
      'Use grounding/search evidence for factual claims and summarize verified results first.',
      'Include a short source list at the end with title + URL when available.',
    ],
    script: [
      'Produce a high-retention script using a markdown table: Visuals | Narration.',
      'At the end include a <CHARACTERS>[...]</CHARACTERS> JSON block for major characters.',
    ],
    analysis: [
      'Start with "Deep Analysis Summary" and then provide insights, risks, and action items.',
      'If OCR or visual extraction is relevant, mention what was read vs inferred.',
    ],
    image: ['Generate image prompts that are vivid, style-aware, and production quality.'],
    avatar: ['Generate portrait/avatar prompts that are clean, centered, and profile-ready.'],
  };

  return [...baseGuidelines, ...modeSpecificRules[intent.mode]].join('\n');
};

export const generateKoroStream = async (
  prompt: string,
  history: Message[],
  language: Language = 'en',
  onUpdate: (text: string, thoughts?: string[], chunks?: GroundingChunk[], characters?: CharacterProfile[], image?: string) => void,
  attachments?: Attachment[],
  signal?: AbortSignal
): Promise<KoroResult> => {
  prompt = sanitizePrompt(prompt);
  const hasFiles = (attachments && attachments.length > 0) || history.some(m => m.attachments && m.attachments.length > 0);
  const intent = detectIntent(prompt, hasFiles);
  const isImageTask = intent.mode === 'image' || intent.mode === 'avatar';
  const isAvatarTask = intent.mode === 'avatar';
  const isSearchMode = intent.mode === 'search';
  const isScriptMode = intent.mode === 'script';
  const isAnalysisMode = intent.mode === 'analysis';

  const memoryCandidates = extractMemoryCandidates(prompt);
  memoryCandidates.forEach((fact) => MemoryService.saveSynapse(fact, 2));
  
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

  const compactHistory = trimHistory(history);

  // Normal Chat / Script / Analysis flow
  const contents = compactHistory.map((m, index) => {
    const isLast = index === compactHistory.length - 1;
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
    const systemInstruction = buildSystemInstruction(language, memoryContext, intent, hasFiles);

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 24576 },
        temperature: 0.6,
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
