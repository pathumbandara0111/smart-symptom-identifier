export type Severity = "mild" | "moderate" | "severe" | "critical";

/** What ends up in the API response and is stored in SymptomSession.aiResponse */
export interface PredictionResponse {
  possibleIllnesses: string[];
  severity: string;
  firstAidSteps: string[];
  specialistType: string;
  emergencyRequired: boolean;
  additionalInfo: string;
  disclaimer: string;
  /** Which path produced the diagnosis */
  source: "kaggle+gemini" | "kaggle" | "gemini-fallback";
  /** Kaggle model details (when Kaggle answered) */
  kaggle?: {
    label: string;
    confidence: number | null;
    lowConfidence: boolean;
    topK?: { label: string; confidence: number }[];
  };
  geminiModel?: string;
  fallbackReason?: string;
  /** Extra warning added by safety rules / low-confidence notes */
  warnings?: string[];
  latencyMs?: number;
}

export interface KaggleResult {
  label: string;
  confidence: number | null;
  topK?: { label: string; confidence: number }[];
  severity?: Severity;
  urgency?: string;
  emergencyRequired?: boolean;
}

export const DISCLAIMER =
  "⚠️ This is not a substitute for professional medical advice. Please consult a qualified doctor.";
