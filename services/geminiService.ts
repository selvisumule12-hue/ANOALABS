
import { GoogleGenAI, Type } from "@google/genai";
import { StoryRequest, StoryResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStoryContent = async (req: StoryRequest): Promise<StoryResult> => {
  const { title, numScenes, visualStyle, language } = req;

  const systemInstruction = `
    You are ANOALABS.AI ULTIMATE v4, a professional cinematic storytelling architect.
    
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

export const generateAffiliateContent = async (
  productName: string, 
  customInstructions: string, 
  productImg: string | undefined, 
  modelImg: string | undefined,
  style: string,
  numScenes: number
) => {
  const systemInstruction = `
    Kamu adalah ANOALABS UGC TOOL - Expert Afiliasi & Pemasaran Konten.
    Tugas: Menghasilkan strategi visual UGC dioptimalkan untuk VEO 3.1 & FLOW.
    
    Gaya Konten: ${style}
    Target Jumlah Adegan: ${numScenes}

    🔒 IDENTITY LOCK PROTOCOL:
    1. Product Precision: Amati detail produk. Video prompt HARUS spesifik menyebutkan brand/tekstur produk.
    2. Affiliate Acting: Jika gaya adalah 'Unboxing', fokus pada gerakan tangan membuka kemasan. Jika 'Talking Head', fokus pada ekspresi wajah dan eye contact.
    3. Cinematic Flow: Gunakan keyword: "8k", "photorealistic", "fluid motion", "consistent identity".

    OUTPUT STRUCTURE:
    - summary: Ringkasan strategi.
    - caption: Caption viral.
    - assets: Array berisi ${numScenes} item (label, imagePrompt, videoPrompt).
  `;

  const parts: any[] = [
    { text: `Produk: ${productName}. Gaya: ${style}. Scene Count: ${numScenes}. Instruksi: ${customInstructions}.` }
  ];

  if (productImg) parts.push({ inlineData: { mimeType: "image/png", data: productImg.split(',')[1] } });
  if (modelImg) parts.push({ inlineData: { mimeType: "image/png", data: modelImg.split(',')[1] } });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
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
              },
              required: ['label', 'imagePrompt', 'videoPrompt']
            }
          }
        },
        required: ['summary', 'caption', 'assets']
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateImage = async (prompt: string, aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1", referenceImg?: string): Promise<string> => {
  const parts: any[] = [{ text: `High quality cinematic photo, strictly follow the visual identity of the attached image. ${prompt}` }];
  
  if (referenceImg) {
    parts.push({
      inlineData: {
        mimeType: "image/png",
        data: referenceImg.split(',')[1]
      }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: { imageConfig: { aspectRatio } },
  });

  const responseParts = response.candidates?.[0]?.content?.parts || [];
  for (const part of responseParts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Gagal generate gambar.");
};
