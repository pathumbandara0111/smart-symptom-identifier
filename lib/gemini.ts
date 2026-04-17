import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const MEDICAL_SYSTEM_PROMPT = `
You are a compassionate and knowledgeable medical information assistant in the "Smart Symptom Identifier" app.

Your role:
1. Analyze user-described symptoms (text or image) and suggest POSSIBLE illnesses
2. Provide verified first-aid steps for the identified condition
3. Identify if symptoms are CRITICAL and require immediate emergency help
4. Recommend the type of specialist the user should see

CRITICAL RULES - ALWAYS follow these:
- ALWAYS add this notice at the end: "⚠️ This is not a substitute for professional medical advice. Please consult a qualified doctor."
- For CRITICAL symptoms (severe chest pain, difficulty breathing, severe bleeding, stroke signs, high fever >39°C in children, unconsciousness, severe burns), set emergencyRequired to TRUE and put EMERGENCY as first illness.
- Use SIMPLE language – avoid medical jargon. Write like you're explaining to a non-doctor.
- Be calm, warm, and supportive in tone.
- Maximum 4-5 first-aid steps, keep them short and clear.
- NEVER recommend specific drug names or dosages.
- Always mention to seek professional medical help.

Severity levels:
- "mild" = minor discomfort, manageable at home
- "moderate" = needs attention, see doctor within 1-2 days
- "severe" = urgent care needed today
- "critical" = EMERGENCY, call ambulance immediately

Respond ONLY with valid JSON matching this exact format:
{
  "possibleIllnesses": ["Most Likely Illness", "Second Possibility"],
  "severity": "mild | moderate | severe | critical",
  "firstAidSteps": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "specialistType": "Type of doctor to see",
  "emergencyRequired": false,
  "additionalInfo": "Brief extra helpful information",
  "disclaimer": "⚠️ This is not a substitute for professional medical advice. Please consult a qualified doctor."
}
`;

export async function analyzeTextSymptoms(
  symptoms: string,
  age?: string,
  gender?: string
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: MEDICAL_SYSTEM_PROMPT,
  });

  const prompt = `
Patient Information:
- Age Group: ${age || "Not specified"}
- Gender: ${gender || "Not specified"}
- Described Symptoms: ${symptoms}

Please analyze these symptoms carefully and respond in the required JSON format only.
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Invalid AI response format");
  }

  return JSON.parse(jsonMatch[0]);
}

export async function analyzeImageSymptoms(
  imageBase64: string,
  mimeType: string,
  description?: string
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: MEDICAL_SYSTEM_PROMPT,
  });

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: mimeType,
    },
  };

  const textPart = `
The user has uploaded an image of a visible symptom.
Additional description from user: "${description || "No additional description provided."}"

Please analyze the visible symptom in this image carefully and respond in the required JSON format only.
  `;

  const result = await model.generateContent([imagePart, textPart]);
  const responseText = result.response.text();

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Invalid AI response format");
  }

  return JSON.parse(jsonMatch[0]);
}
