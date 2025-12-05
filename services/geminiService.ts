import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// NOTE: In a real production app, this should be proxied through a backend
// to protect the API key. For this demo, we use the env var directly.
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    aiProbability: { type: Type.NUMBER, description: "Probability from 0 to 100 that the image is AI generated." },
    textureCoherence: { type: Type.NUMBER, description: "Score 0-100 for natural texture consistency." },
    lightingConsistency: { type: Type.NUMBER, description: "Score 0-100 for realistic lighting and shadows." },
    geometryScore: { type: Type.NUMBER, description: "Score 0-100 for anatomical and geometric correctness." },
    backgroundBlur: { type: Type.NUMBER, description: "Score 0-100 for natural depth of field vs artificial blurring." },
    compressionArtifacts: { type: Type.NUMBER, description: "Score 0-100 for consistency of compression artifacts." },
    reasoning: { type: Type.STRING, description: "A concise summary of why the model believes this is AI or Real." },
    technicalDetails: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of 3-5 specific technical observations (e.g., 'Mismatched ear rings', 'Pupil asymmetry')." 
    },
    verdict: { type: Type.STRING, enum: ['LIKELY_REAL', 'LIKELY_AI', 'UNCERTAIN'] }
  },
  required: [
    "aiProbability", 
    "textureCoherence", 
    "lightingConsistency", 
    "geometryScore", 
    "backgroundBlur", 
    "compressionArtifacts",
    "reasoning",
    "technicalDetails",
    "verdict"
  ]
};

export const analyzeImageWithGemini = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  try {
    // Remove header from base64 string if present
    const data = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: data
            }
          },
          {
            text: `Analyze this image for signs of AI generation. 
            Look for common generative artifacts such as:
            - Asymmetrical features (eyes, hands, jewelry)
            - Inconsistent lighting or shadows
            - 'Plastic' skin textures
            - Background logic errors
            - Strange text rendering
            
            Provide a forensic assessment.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");

    const json = JSON.parse(resultText);

    return {
      metrics: {
        aiProbability: json.aiProbability,
        textureCoherence: json.textureCoherence,
        lightingConsistency: json.lightingConsistency,
        geometryScore: json.geometryScore,
        backgroundBlur: json.backgroundBlur,
        compressionArtifacts: json.compressionArtifacts
      },
      reasoning: json.reasoning,
      technicalDetails: json.technicalDetails,
      verdict: json.verdict,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fallback mock data for demo if API fails/key missing
    return {
      metrics: {
        aiProbability: 0,
        textureCoherence: 0,
        lightingConsistency: 0,
        geometryScore: 0,
        backgroundBlur: 0,
        compressionArtifacts: 0
      },
      reasoning: "Analysis failed. Please check API Key or internet connection.",
      technicalDetails: ["Error connecting to analysis engine."],
      verdict: 'UNCERTAIN',
      timestamp: new Date().toISOString()
    };
  }
};