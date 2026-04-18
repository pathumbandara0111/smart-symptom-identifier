import { analyzeTextSymptoms as analyzeWithGemini, analyzeImageSymptoms as analyzeImageWithGemini, MEDICAL_SYSTEM_PROMPT } from "./gemini";

const KAGGLE_API_URL = process.env.NEXT_PUBLIC_KAGGLE_API_URL;

export interface PredictionResponse {
  possibleIllnesses: string[];
  severity: string;
  firstAidSteps: string[];
  specialistType: string;
  emergencyRequired: boolean;
  additionalInfo: string;
  disclaimer: string;
  source: "kaggle" | "gemini";
}

/**
 * Smart Text Symptom Analyzer
 * Tries Kaggle (Custom Model) first, falls back to Gemini.
 */
export async function identifySymptoms(symptoms: string, age?: string, gender?: string): Promise<PredictionResponse> {
  console.log("🔄 Starting AI Analysis...");

  // 1. TRY KAGGLE (CUSTOM MODEL)
  if (KAGGLE_API_URL) {
    try {
      console.log("🩺 Attempting to connect to Kaggle Custom Model (Ngrok)...");
      const response = await fetch(`${KAGGLE_API_URL}/predict-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === "success" && data.illness) {
          console.log(`✅ [BACKEND LOG]: Prediction successful using Custom Kaggle Model: ${data.illness}`);

          // Since our Kaggle model only returns the illness name, 
          // we use a "Refined Gemini Call" to get the professional medical details (First Aid, etc.)
          // This keeps our model as the 'Decision Maker'.
          const refinedResult = await getRefinedMedicalDetails(data.illness, symptoms);
          return { ...refinedResult, source: "kaggle" };
        }
      }
    } catch (error) {
      console.warn("⚠️ Kaggle API is offline or timed out. Falling back to Gemini...");
    }
  }

  // 2. FALLBACK TO GEMINI
  console.log("✨ [BACKEND LOG]: Using Backup Gemini API for analysis.");
  const geminiResult = await analyzeWithGemini(symptoms, age, gender);
  return { ...geminiResult, source: "gemini" };
}

/**
 * Smart Image Symptom Analyzer
 */
export async function identifyImageSymptoms(imageBase64: string, mimeType: string, description?: string): Promise<PredictionResponse> {
  if (KAGGLE_API_URL) {
    try {
      console.log("📸 Attempting to connect to Kaggle Image Model...");
      const response = await fetch(`${KAGGLE_API_URL}/predict-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === "success") {
          console.log(`✅ [BACKEND LOG]: Image Analysis successful using Custom Model: ${data.condition}`);
          const refinedResult = await getRefinedMedicalDetails(data.condition, description || "Visible skin symptom");
          return { ...refinedResult, source: "kaggle" };
        }
      }
    } catch (error) {
      console.warn("⚠️ Kaggle Image API offline. Falling back to Gemini...");
    }
  }

  const geminiResult = await analyzeImageWithGemini(imageBase64, mimeType, description);
  return { ...geminiResult, source: "gemini" };
}

/**
 * Uses Gemini as a 'Medical Encyclopedia' to provide details for a specific illness
 */
async function getRefinedMedicalDetails(illness: string, originalSymptoms: string) {
  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

    // Using the same model name as your gemini.ts
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: MEDICAL_SYSTEM_PROMPT
    });

    const prompt = `
      The custom AI model has identified this condition: "${illness}" 
      based on these symptoms: "${originalSymptoms}".
      
      Provide professional medical details for this SPECIFIC condition ONLY.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) throw new Error("Invalid JSON from refinement");
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("❌ [REFINEMENT ERROR]:", error);
    // Return a basic structure if refinement fails so we still show the Kaggle prediction
    return {
      possibleIllnesses: [illness],
      severity: "moderate",
      firstAidSteps: ["Consult a doctor for professional advice."],
      specialistType: "General Physician",
      emergencyRequired: false,
      additionalInfo: "Custom model prediction successful, but details could not be generated.",
      disclaimer: "⚠️ This is not a substitute for professional medical advice."
    };
  }
}
