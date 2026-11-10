/**
 * Clinical safety rules and dermatological severity mapping.
 * Ensures that both text red-flags and image-diagnosed skin conditions
 * accurately map to mild, moderate, severe, or critical/urgent tiers.
 */

const RED_FLAGS: { re: RegExp; label: string }[] = [
  { re: /chest\s*(pain|pressure|tightness)|pain\s+in\s+(my\s+)?chest|heart\s*attack/i, label: "chest pain / possible heart attack" },
  { re: /(can'?t|cannot|difficult(y)?|trouble|hard)\s+(to\s+)?breath|short(ness)?\s+of\s+breath|not\s+breathing|gasping/i, label: "breathing difficulty" },
  { re: /stroke|face\s+droop|slurred\s+speech|sudden\s+(weakness|numbness)|one\s+side\s+(of\s+)?(my\s+)?(body|face)/i, label: "possible stroke signs" },
  { re: /severe\s+bleeding|bleeding\s+(heavily|a\s+lot|won'?t\s+stop)|heavy\s+bleeding|coughing\s+(up\s+)?blood|vomiting\s+blood|blood\s+in\s+(stool|vomit)/i, label: "severe bleeding" },
  { re: /unconscious|passed\s+out|fainted|not\s+responding|seizure|convulsion/i, label: "loss of consciousness / seizure" },
  { re: /suicid|kill\s+myself|want\s+to\s+die|overdose|poison/i, label: "self-harm / poisoning risk" },
  { re: /severe\s+burn|burn(ed|t)?\s+(over|large)|anaphyla|throat\s+(is\s+)?swelling|swollen\s+(tongue|throat)/i, label: "severe burn / allergic reaction" },
  { re: /stiff\s+neck.*fever|fever.*stiff\s+neck/i, label: "possible meningitis signs" },
];

export function detectRedFlags(text: string): string[] {
  if (!text) return [];
  return RED_FLAGS.filter((f) => f.re.test(text)).map((f) => f.label);
}

export function emergencyWarning(flags: string[]): string {
  return `🚨 EMERGENCY WARNING: your description mentions ${flags.join(", ")}. This can be life-threatening. Call your local emergency number (Sri Lanka: 1990) or go to the nearest hospital immediately. The AI result below may not reflect the seriousness of your situation.`;
}

/**
 * Clinical severity classification for all 7 skin lesions.
 * Directly fixes the image model's inability to identify low vs moderate vs urgent conditions.
 */
export interface ClinicalSkinRule {
  severity: "mild" | "moderate" | "severe" | "critical";
  urgency: string;
  emergencyRequired: boolean;
  specialist: string;
  description: string;
  firstAid: string[];
}

export const SKIN_CLINICAL_RULES: Record<string, ClinicalSkinRule> = {
  mel: {
    severity: "critical",
    urgency: "Urgent Priority (Within 24–48 hours)",
    emergencyRequired: true,
    specialist: "Dermatologist / Surgical Oncologist",
    description: "Malignant Melanoma is an aggressive form of skin cancer. Early clinical dermoscopic evaluation and excision biopsy are critical to prevent deeper invasion.",
    firstAid: [
      "Step 1: Do NOT scratch, rub, puncture, or attempt to cut the lesion.",
      "Step 2: Take clear photos with a reference scale (e.g. coin or ruler) to document current size.",
      "Step 3: Schedule an urgent face-to-face appointment with a dermatologist or skin oncologist immediately.",
      "Step 4: Protect the area from sunlight and avoid tanning beds.",
    ],
  },
  bcc: {
    severity: "severe",
    urgency: "High Priority (See doctor within 1 week)",
    emergencyRequired: false,
    specialist: "Dermatologist / Mohs Surgeon",
    description: "Basal Cell Carcinoma is a common, slow-growing malignant skin cancer. While rarely spreading to distant organs, it causes local tissue destruction if untreated.",
    firstAid: [
      "Step 1: Keep the affected area clean and dry. Avoid harsh exfoliants or scrubbing.",
      "Step 2: If the lesion bleeds, apply gentle direct pressure with clean sterile gauze.",
      "Step 3: Consult a dermatologist for dermoscopy, biopsy, and surgical excision options.",
      "Step 4: Wear broad-spectrum SPF 50+ sunscreen and protective clothing.",
    ],
  },
  akiec: {
    severity: "moderate",
    urgency: "Moderate Priority (See doctor within 2–3 weeks)",
    emergencyRequired: false,
    specialist: "Dermatologist",
    description: "Actinic Keratosis is a rough, scaly patch considered pre-malignant. It can evolve into Squamous Cell Carcinoma if left untreated.",
    firstAid: [
      "Step 1: Avoid picking at or scraping off the scaly rough crust.",
      "Step 2: Apply a gentle, fragrance-free moisturizing cream to soothe dryness.",
      "Step 3: Consult a dermatologist to discuss cryotherapy (freezing) or topical prescription treatments.",
      "Step 4: Practice strict daily sun protection (SPF 50+).",
    ],
  },
  vasc: {
    severity: "mild",
    urgency: "Low Priority (Routine)",
    emergencyRequired: false,
    specialist: "Dermatologist / Vascular Specialist",
    description: "Vascular lesions (such as cherry angiomas or hemangiomas) are benign collections of blood vessels. They are harmless unless traumatized or bleeding.",
    firstAid: [
      "Step 1: Keep the area protected from friction (e.g., tight collar, straps, jewelry).",
      "Step 2: If bleeding occurs, press firmly with a clean cotton pad or sterile gauze for 10 minutes.",
      "Step 3: If it bleeds repeatedly or changes color, consult a dermatologist for benign removal.",
    ],
  },
  bkl: {
    severity: "mild",
    urgency: "Low Priority (Benign / Routine)",
    emergencyRequired: false,
    specialist: "General Practitioner / Dermatologist",
    description: "Benign Keratosis (such as Seborrheic Keratosis) is a non-cancerous, harmless warty or waxy skin growth commonly associated with natural skin aging.",
    firstAid: [
      "Step 1: Reassure: this lesion is completely benign and non-cancerous.",
      "Step 2: Do NOT pick or scratch, as this can introduce bacterial skin infections.",
      "Step 3: If the lesion causes irritation from clothing or cosmetic concern, consult a dermatologist for safe cryo-removal.",
    ],
  },
  df: {
    severity: "mild",
    urgency: "Low Priority (Benign / Routine)",
    emergencyRequired: false,
    specialist: "General Practitioner / Dermatologist",
    description: "Dermatofibroma is a harmless, benign firm nodule of fibrous tissue, frequently triggered by an old bug bite or minor ingrown hair.",
    firstAid: [
      "Step 1: No emergency action is needed; dermatofibromas are completely harmless.",
      "Step 2: Avoid squeezing or poking the nodule.",
      "Step 3: Have a doctor verify the lesion at your next routine check-up.",
    ],
  },
  nv: {
    severity: "mild",
    urgency: "Low Priority (Routine Observation)",
    emergencyRequired: false,
    specialist: "Dermatologist / General Practitioner",
    description: "Melanocytic Nevus is a common, benign mole composed of pigment-producing melanocytes. Most moles are completely harmless.",
    firstAid: [
      "Step 1: Monitor the mole periodically using the clinical ABCDE rule (Asymmetry, Border, Color, Diameter > 6mm, Evolving).",
      "Step 2: Protect the mole from sunburn with SPF 50+ sunscreen.",
      "Step 3: If the mole changes in color, size, shape, or begins to bleed/itch, schedule a routine dermatologist check.",
    ],
  },
};

export function getSkinConditionRule(codeOrLabel: string): ClinicalSkinRule | undefined {
  if (!codeOrLabel) return undefined;
  const lower = codeOrLabel.toLowerCase();
  for (const [code, rule] of Object.entries(SKIN_CLINICAL_RULES)) {
    if (lower === code || lower.startsWith(code + " ") || lower.endsWith(" (" + code + ")")) return rule;
  }
  if (lower.includes("melanoma")) return SKIN_CLINICAL_RULES.mel;
  if (lower.includes("basal") || lower.includes("bcc")) return SKIN_CLINICAL_RULES.bcc;
  if (lower.includes("actinic") || lower.includes("akiec") || lower.includes("bowen")) return SKIN_CLINICAL_RULES.akiec;
  if (lower.includes("vascular") || lower.includes("angioma") || lower.includes("vasc")) return SKIN_CLINICAL_RULES.vasc;
  if (lower.includes("benign keratosis") || lower.includes("bkl")) return SKIN_CLINICAL_RULES.bkl;
  if (lower.includes("dermatofibroma") || lower.includes("df")) return SKIN_CLINICAL_RULES.df;
  if (lower.includes("nevus") || lower.includes("nevi") || lower.includes("mole") || lower.includes("nv")) return SKIN_CLINICAL_RULES.nv;
  return undefined;
}
