
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export type AvatarStyle = 'cyberpunk' | 'anime' | 'professional' | '3d-render' | 'pixel-art' | 'oil-painting';

export const AvatarService = {
  generateAvatar: async (prompt: string, style: AvatarStyle = 'professional'): Promise<string> => {
    // Advanced prompt augmentation for high-fidelity results
    const stylePrompts: Record<AvatarStyle, string> = {
      cyberpunk: "Cyberpunk 2077 aesthetic, night city vibes, neon pink and electric blue lighting, rain-slicked surfaces, cybernetic implants, hyper-detailed chrome, volumetric fog.",
      anime: "High-end anime character design, ufotable or Kyoto Animation style, vibrant cel-shading, expressive eyes, dynamic lighting, clean line art, cinematic composition.",
      professional: "Ultra-realistic 8k studio portrait, shallow depth of field, bokeh background, professional rim lighting, sharp focus on eyes, 85mm lens aesthetic, corporate clean.",
      '3d-render': "Stylized 3D character, Octane Render, Disney-Pixar movie quality, subsurface scattering, soft global illumination, toy-like texture, vibrant saturated colors.",
      'pixel-art': "Masterpiece 32-bit pixel art, high-detail sprites, vibrant retro color palette, clean anti-aliasing, modern indie game aesthetic, isometric lighting.",
      'oil-painting': "Impressionist oil painting masterpiece, thick visible impasto brushstrokes, rich canvas texture, dramatic chiaroscuro lighting, Rembrandt style, deep oil colors."
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ 
            text: `
              TASK: Generate a professional, high-quality square profile avatar.
              SUBJECT: ${prompt}.
              VISUAL STYLE: ${stylePrompts[style]}.
              TECHNICAL CONSTRAINTS: Centered headshot, clear facial features, 1:1 aspect ratio, no text, no logos, no watermarks, perfectly framed, clean edges.
            ` 
          }]
        },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      let base64Image = "";
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!base64Image) throw new Error("Synthesis failed: No image data returned.");
      return base64Image;
    } catch (error) {
      console.error("Avatar Workshop Error:", error);
      throw error;
    }
  }
};
