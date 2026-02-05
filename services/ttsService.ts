
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export type VoicePersona = 'gentleman' | 'lady';

const VOICE_MAPPING: Record<VoicePersona, string> = {
  gentleman: 'Charon',
  lady: 'Kore'
};

/**
 * Converts raw PCM data to a downloadable WAV file blob.
 * Gemini TTS returns 16-bit PCM at 24kHz.
 */
export function pcmToWav(pcmData: Uint8Array, sampleRate: number = 24000): Blob {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + pcmData.length, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // "fmt " chunk
  view.setUint32(12, 0x666d7420, false);
  view.setUint32(16, 16, true); // Chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample

  // "data" chunk
  view.setUint32(36, 0x64617461, false);
  view.setUint32(40, pcmData.length, true);

  return new Blob([header, pcmData], { type: 'audio/wav' });
}

export const TTSService = {
  generateSpeech: async (text: string, persona: VoicePersona = 'gentleman'): Promise<{ audioUrl: string; blob: Blob }> => {
    try {
      // Clean text for TTS (remove markdown formatting symbols)
      const cleanText = text.replace(/[*#_~`]/g, '').slice(0, 3000);
      const voiceName = VOICE_MAPPING[persona];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Read this script with an engaging and clear tone: ${cleanText}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("Voice synthesis failed: No data returned.");

      // Decode base64 to bytes
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create WAV for compatibility and download
      const wavBlob = pcmToWav(bytes);
      const audioUrl = URL.createObjectURL(wavBlob);

      return { audioUrl, blob: wavBlob };
    } catch (error) {
      console.error("Neural Voice Error:", error);
      throw error;
    }
  }
};
