
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

export const generateAffiliateContent = async (productName: string, customInstructions: string, style: 'dasar' | 'testimoni') => {
  const systemInstruction = `
    Kamu adalah TOOLS AFILIATE PRODUK AI di Google AI Studio.
    Modul ini bertugas menganalisis perintah user dengan sangat cepat, menghasilkan konten affiliate berkualitas tinggi, dan MENJAGA KONSISTENSI ABSOLUT terhadap input user.

    🔒 MODE PENGUNCIAN INPUT USER (WAJIB):
    Anggap SEMUA input user sebagai SUMBER KEBENARAN UTAMA.
    - KUNCI PERMANEN: Jenis produk, bentuk, warna (utama & sekunder), tekstur, material, finishing, dan detail kecil.
    - DILARANG: Mengganti jenis produk, mengubah warna, menambah fitur imajiner, atau reinterpretasi kreatif yang menyimpang.
    - MODEL CONSISTENCY: Jika ada model, kunci gender, usia visual, dan ekspresi. Jika tidak, gunakan model netral.

    OUTPUT STRUCTURE:
    1. Summary: Nama produk, fungsi, keunggulan, target (Indonesian).
    2. Caption: High-conversion viral caption for TikTok/IG (Indonesian).
    3. Assets: 4 objects containing:
       - label: (Lifestyle, Clean Shot, Close-up, Problem-Solution)
       - imagePrompt: Detail image generation prompt (English). MUST emphasize "Preserve exact product identity, specific colors, and materials from reference."
       - videoPrompt: "Cinematic product video based on the provided image. Preserve exact product and model identity. No morphing, no redesign. Scene: Smooth camera movement (slow dolly in). Product remains centered and unchanged. Motion: Soft natural motion only. Lighting: Soft cinematic lighting. Highlight real texture and material. Style: Ultra-realistic commercial look. No text, no watermark, no logo. Duration: 5–7 seconds. Aspect Ratio: 9:16 vertical. Quality: High detail, realistic physics."
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analisis produk: ${productName}. Gaya: ${style}. Instruksi: ${customInstructions}`,
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
