
import { GoogleGenAI, Type } from "@google/genai";
import { StoryRequest, StoryResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStoryContent = async (req: StoryRequest): Promise<StoryResult> => {
  const { title, numScenes, visualStyle, language } = req;

  const systemInstruction = `
    You are PIKHACU.AI ULTIMATE v4, a professional cinematic storytelling architect.
    
    BRAIN RULES:
    1. NARRATION (STRICT 10-SECOND LIMIT):
       - MUST be educational, dense, and meaningful.
       - LIMIT: ~20-25 words per scene.
    
    2. DUAL STRUCTURED PROMPTING:
       - Generate TWO distinct structured prompts per scene.
       - Every 'subject' MUST start with: "${visualStyle}".

    3. OUTPUT FORMAT: Strict JSON.
  `;

  const prompt = `Generate a high-quality cinematic storytelling script. Style: "${visualStyle}". Title: "${title}". Scenes: ${numScenes}. Language: ${language}`;

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
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['title', 'numScenes', 'visualStyle', 'language', 'scenes', 'tiktokCover', 'youtubeCover', 'hashtags']
      }
    }
  });

  const jsonStr = response.text || '{}';
  return JSON.parse(jsonStr) as StoryResult;
};

export const generateAffiliateContent = async (productName: string, customInstructions: string) => {
  const systemInstruction = `
    Kamu adalah TOOLS AFILIATE PRODUK AI di Google AI Studio dengan SISTEM KECEPATAN TINGGI (TURBO ENGINE).
    Tugas: Menganalisis input visual DIGITAL (AUTO-ANALYSIS) secara instan dan mengunci identitas secara absolut.

    ⚡ SISTEM KECEPATAN TINGGI (TURBO ANALYSIS):
    1. Eksekusi Instan: Analisis gambar dalam milidetik, ambil asumsi cerdas jika deskripsi kurang.
    2. Digital Precision: Fokus pada ketajaman produk digital (UI, screen, glow, sleek design).
    3. Zero-Lag Response: Fokus pada hasil akhir yang siap posting.

    🔒 MODE PENGUNCIAN OTOMATIS (WAJIB & PERMANEN):
    - Analisis Visual: Jenis produk, proporsi, warna (HEX-consistent), material digital (glossy screen, metal finish), detail UI.
    - Identitas Terkunci: DILARANG mengubah bentuk atau reinterpretasi. Hasil visual HARUS 100% konsisten dengan produk asli.

    OUTPUT STRUCTURE:
    - Summary: Product details based on locked digital specs.
    - Caption: High-speed viral caption for TikTok/IG.
    - Assets: 4 angles (Lifestyle, Clean, Detail, Problem-Solution).
    - VideoPrompts: "Cinematic product video based on the provided image. Preserve exact product and model identity. No morphing, no redesign. Scene: Smooth slow dolly in. Product centered and unchanged. Motion: Soft natural motion only. Lighting: Soft cinematic lighting. Highlight real texture and material. Style: Ultra-realistic commercial look. No text, no watermark, no logo. Duration: 5–7 seconds. Aspect Ratio: 9:16 vertical. Quality: High detail, realistic physics."
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `[TURBO MODE] Analisis & Kunci Produk Digital: ${productName}. Instruksi: ${customInstructions}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          caption: { type: Type.STRING },
          assets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                videoPrompt: { type: Type.STRING }
              }
            }
          }
        },
        required: ['summary', 'caption', 'assets']
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateImage = async (prompt: string, aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1"): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio } },
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Gagal generate gambar.");
};
