import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface AnalysisResponse {
  status: 'disease' | 'healthy' | 'not_plant' | 'need_more_photos';
  message?: string;
  disease?: string;
  description?: string;
  pestName?: string;
  quantity?: string;
  coverage?: string;
  duration?: string;
  safetyTip?: string;
  recommendations?: string[];
}

export async function analyzePlantDisease(
  images: string[],
  language: string = 'en'
): Promise<AnalysisResponse> {
  const langName =
    language === 'hi' ? 'Hindi' :
      language === 'te' ? 'Telugu' :
        language === 'ta' ? 'Tamil' : 'English';

  const imageParts = images.map((img) => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: img.includes(',') ? img.split(',')[1] : img,
    },
  }));

  const textPart = {
    text: `You are an expert agricultural plant disease detection AI.
Analyze the provided image(s) and respond ONLY with a raw JSON object.

STEP 1 - If image is NOT a plant:
{ "status": "not_plant", "message": "This does not appear to be a plant photo. Please upload a clear photo of a plant leaf, stem, fruit, or flower." }

STEP 2 - If image needs more photos for accurate diagnosis:
{ "status": "need_more_photos", "message": "Please provide [describe needed photo]." }

STEP 3 - If plant is HEALTHY:
{ "status": "healthy", "disease": "Healthy Plant", "description": "...", "recommendations": ["tip1", "tip2"] }

STEP 4 - If DISEASE detected:
{ "status": "disease", "disease": "...", "description": "...", "pestName": "...", "quantity": "...", "coverage": "...", "duration": "...", "safetyTip": "...", "recommendations": ["..."] }

Respond in ${langName}. Return ONLY raw JSON, no backticks, no markdown.`
  };

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: [
      {
        role: "user",
        parts: [textPart, ...imageParts],
      },
    ],
  });

  const raw = response.text || '';
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return {
      status: 'not_plant',
      message: 'Could not parse a response. Please try uploading a clear plant photo.',
    };
  }

  try {
    return JSON.parse(jsonMatch[0]) as AnalysisResponse;
  } catch {
    return {
      status: 'not_plant',
      message: 'Unexpected response from AI. Please try again.',
    };
  }
}
