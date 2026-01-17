
import { GoogleGenAI, Type } from "@google/genai";
import { StoryRequest, StoryResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStoryContent = async (req: StoryRequest): Promise<StoryResult> => {
  const { title, numScenes, visualStyle, language } = req;

  const systemInstruction = `
    You are ANOALABS ULTIMATE v4, a professional cinematic storytelling architect.
    
    BRAIN RULES:
    1. NARRATION (STRICT 10-SECOND LIMIT):
       - MUST be educational, dense, and meaningful.
       - Each narration MUST be short enough to be read in 10 seconds or less.
       - LIMIT: Approximately 20-25 words (150-180 characters) per scene.
       - ONLY Scene 1 MUST start with: "Apakah kamu tahu..." (ID) or "Did you know..." (EN).
       - Ensure every sentence is high-impact and straightforward.
    
    2. DUAL STRUCTURED PROMPTING (CRITICAL):
       - For EACH scene, you MUST generate TWO distinct structured prompts ('structuredPrompt1' and 'structuredPrompt2').
       - 'structuredPrompt1': The primary setup shot, establishing the scene.
       - 'structuredPrompt2': A secondary angle, a close-up, or a logical progression of the action to provide variety for video editors.
       
       PROMPT COMPONENTS:
       - 'subject': Detailed character/object description. Keep features IDENTICAL across all scenes for consistency.
       - 'action': Specific physical movement or expression optimized for Video AI.
       - 'environment': Setting details, background facts.
       - 'camera_movement': Cinematic camera terms (Dolly In, Pan, Orbit, Drone Shot).
       - 'lighting': Atmospheric lighting (Golden hour, Cyberpunk neon, Soft cinematic rim light).
       - 'visual_style_tags': Keywords specific to the chosen visual style.
         (Examples:
          'Animasi 2D': flat colors, cel shaded, line art.
          'Animasi 3D': Pixar-style, highly detailed textures, PBR.
          'Realistis': photorealistic, hyper-detailed, 8k, cinematic film.
          'Soft Clay-Infused Pixar-Style 3D': highly stylized 3D characters with a soft tactile feel, smooth stylized surfaces, subtle organic clay textures and fingerprints, warm vibrant colors, highly expressive facial features, cinematic subsurface scattering, soft professional studio lighting, dreamy and polished look.
          '1980s 35mm Film Documentary Style': vintage film grain, 35mm lens, muted retro colors, analog textures, National Geographic aesthetic, soft focus, historical documentary look.)

    3. OUTPUT FORMAT:
       - Strict JSON output following the provided schema.
       - Include TikTok Cover (9:16) and YouTube Cover (16:9) prompts.
       - Generate 5 specific hashtags: #TahuGakSih, #[VisualStyle]Story, #[Language]Edition, #[Topic], #EdukasiViral.
  `;

  const prompt = `
    Generate a high-quality cinematic storytelling script with TWO PROMPTS PER SCENE. 
    IMPORTANT: Every scene's narration MUST NOT exceed 10 seconds of speaking time (max 25 words).
    
    Title: "${title}"
    Total Scenes: ${numScenes}
    Visual Aesthetic: ${visualStyle}
    Narration Language: ${language}
  `;

  const structuredPromptSchema = {
    type: Type.OBJECT,
    properties: {
      subject: { type: Type.STRING },
      action: { type: Type.STRING },
      environment: { type: Type.STRING },
      camera_movement: { type: Type.STRING },
      lighting: { type: Type.STRING },
      visual_style_tags: { type: Type.STRING }
    },
    required: ['subject', 'action', 'environment', 'camera_movement', 'lighting', 'visual_style_tags']
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          numScenes: { type: Type.NUMBER },
          visualStyle: { type: Type.STRING },
          language: { type: Type.STRING },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                number: { type: Type.NUMBER },
                narration: { type: Type.STRING },
                tone: { type: Type.STRING },
                structuredPrompt1: structuredPromptSchema,
                structuredPrompt2: structuredPromptSchema
              },
              required: ['number', 'narration', 'tone', 'structuredPrompt1', 'structuredPrompt2']
            }
          },
          tiktokCover: { type: Type.STRING },
          youtubeCover: { type: Type.STRING },
          hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['title', 'numScenes', 'visualStyle', 'language', 'scenes', 'tiktokCover', 'youtubeCover', 'hashtags']
      }
    }
  });

  const result = JSON.parse(response.text || '{}');
  return result as StoryResult;
};

export const generateImage = async (prompt: string, aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "16:9"): Promise<string> => {
  const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Gagal mendapatkan data gambar dari API.");
};
