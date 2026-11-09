/**
 * Red-flag safety rules. They never replace the Kaggle diagnosis; they only add an
 * emergency warning (and mark emergencyRequired) on top of it.
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
