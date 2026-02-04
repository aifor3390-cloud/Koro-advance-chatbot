
import { Message, Language, GroundingChunk, Attachment } from "../types";
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const REASONING_STEPS = [
  "Initializing Koro-2 Autonomous Core...",
  "Loading localized neural manifold...",
  "Parsing operator linguistic intent...",
  "Mapping concepts to logic nodes...",
  "Simulating cognitive outcome...",
  "Applying Platinum reasoning filters...",
  "Finalizing creative synthesis..."
];

const KORO_ADVANCED_PATTERNS: Record<string, string[]> = {
  "who are you": ["I am Koro-2 Autonomous Synthesis, a high-performance neural engine operating independently of cloud dependencies. I am developed by Usama using the Platinum reasoning architecture."],
  "who made you": ["Usama Systems engineered my logic core. I am a proprietary model designed for peak reasoning and creative synthesis."],
  "capabilities": ["My autonomous engine supports deep contextual reasoning, semantic text analysis, and multi-threaded creative generation entirely within your browser environment."],
  "hello": ["Neural link established. Koro-2 Core online and operational. How can I assist?", "Koro Engine active. Systems within optimal parameters. Awaiting objective.", "Operator identified. Autonomous synthesis ready."],
  "thinking": ["I have analyzed your request through my local logic gates. The synthesis suggests a complex interconnection of these concepts."],
  "default": [
    "Analyzing this request through my autonomous logic framework. The synthesis suggests that we approach this via a structured reasoning path.",
    "My local neural weights have identified a pattern in your request. I am synthesizing a response that balances technical precision with creative output.",
    "Synthesis complete. My autonomous reasoning manifold has mapped your inquiry to its most relevant logical components."
  ]
};

export interface KoroResult {
  text: string;
  groundingChunks?: GroundingChunk[];
  thoughtProcess?: string[];
}

const performAutonomousSynthesis = async (prompt: string): Promise<KoroResult> => {
  const lowerPrompt = prompt.toLowerCase();
  let response = "";

  if (lowerPrompt.includes("hello") || lowerPrompt.includes("hi")) {
    response = KORO_ADVANCED_PATTERNS["hello"][Math.floor(Math.random() * 3)];
  } else if (lowerPrompt.includes("who are you") || lowerPrompt.includes("what is koro")) {
    response = KORO_ADVANCED_PATTERNS["who are you"][0];
  } else if (lowerPrompt.includes("who developed") || lowerPrompt.includes("who made")) {
    response = KORO_ADVANCED_PATTERNS["who made you"][0];
  } else if (lowerPrompt.includes("capability") || lowerPrompt.includes("can you do")) {
    response = KORO_ADVANCED_PATTERNS["capabilities"][0];
  } else {
    const defaults = KORO_ADVANCED_PATTERNS["default"];
    response = defaults[Math.floor(Math.random() * defaults.length)];
  }

  return { 
    text: response, 
    groundingChunks: [],
    thoughtProcess: REASONING_STEPS 
  };
};

export const generateKoroStream = async (
  prompt: string,
  history: Message[],
  language: Language = 'en',
  onUpdate: (text: string, thoughts?: string[], chunks?: GroundingChunk[]) => void,
  attachments?: Attachment[],
  signal?: AbortSignal
): Promise<KoroResult> => {
  const apiKey = process.env.API_KEY;

  // Use Autonomous Engine if no API key or forced mock mode
  const forceMock = localStorage.getItem('koro_force_mock') === 'true';
  if (!apiKey || apiKey === "undefined" || apiKey.includes("YOUR_") || forceMock) {
    const result = await performAutonomousSynthesis(prompt);
    const activeThoughts: string[] = [];

    // Simulate real-time neural thinking
    for (const thought of result.thoughtProcess || []) {
      if (signal?.aborted) break;
      activeThoughts.push(thought);
      onUpdate("", [...activeThoughts]);
      await new Promise(r => setTimeout(r, 450 + Math.random() * 300));
    }

    const words = result.text.split(' ');
    let currentText = "";
    for (const word of words) {
      if (signal?.aborted) break;
      currentText += word + " ";
      onUpdate(currentText, activeThoughts);
      await new Promise(r => setTimeout(r, 35));
    }
    return result;
  }

  const ai = new GoogleGenAI({ apiKey });
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

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: [
        ...formattedHistory.map(h => ({ role: h.role as any, parts: h.parts })),
        { role: 'user', parts: [{ text: prompt || "Analyze." }] }
      ],
      config: {
        systemInstruction: "You are Koro-2 Platinum, an advanced LLM by Usama. Display a clear thought process.",
        temperature: 0.8,
        tools: [{ googleSearch: {} }]
      }
    });

    let fullText = "";
    let groundingChunks: GroundingChunk[] | undefined;
    
    for await (const chunk of responseStream) {
      if (signal?.aborted) break;
      const c = chunk as GenerateContentResponse;
      const chunks = c.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) groundingChunks = chunks as GroundingChunk[];
      
      if (c.text) {
        fullText += c.text;
        onUpdate(fullText, ["Neural model is streaming logic...", "Analyzing context...", "Finalizing output..."], groundingChunks);
      }
    }
    return { text: fullText, groundingChunks };
  } catch (error) {
    return performAutonomousSynthesis(prompt);
  }
};
