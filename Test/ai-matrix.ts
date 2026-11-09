export {};
/**
 * AI PIPELINE TEST MATRIX
 *   Normal run (Kaggle on):   npx ts-node --compiler-options '{"module":"CommonJS","moduleResolution":"node"}' Test/ai-matrix.ts
 *   Kaggle-off simulation:    KAGGLE_OFF=1 npx ts-node ... Test/ai-matrix.ts   (expects source=gemini-fallback)
 *   Repeat count:             REPEAT=2 ...
 * Prints each result and a label-distribution report (to measure the "same output" problem).
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require("dotenv");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs");
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
if (process.env.KAGGLE_OFF) {
  process.env.KAGGLE_API_URL = "http://127.0.0.1:9";
  process.env.NEXT_PUBLIC_KAGGLE_API_URL = "http://127.0.0.1:9";
}

const TEXT_CASES: { text: string; redFlag?: boolean }[] = [
  { text: "I have a high fever and headache for two days" },
  { text: "chest pain and sweating, pain going to my left arm", redFlag: true },
  { text: "itchy red rash on my arm that spreads" },
  { text: "stomach ache, vomiting and loose motions since last night" },
  { text: "cough, sore throat and runny nose" },
  { text: "burning sensation when urinating and lower abdominal pain" },
  { text: "joint pain and swelling in my knees, worse in the morning" },
  { text: "I cannot breathe properly and my lips are turning blue", redFlag: true },
  { text: "frequent urination, extreme thirst and tiredness" },
  { text: "sneezing, itchy watery eyes every spring" },
];

async function main() {
  const { identifySymptoms, identifyImageSymptoms } = await import("../lib/ai");
  const repeat = Number(process.env.REPEAT || 1);
  const dist: Record<string, number> = {};
  const sources: Record<string, number> = {};
  let redFlagMiss = 0;
  let fails = 0;

  console.log(`\n===== TEXT CASES (x${repeat}) ${process.env.KAGGLE_OFF ? "[KAGGLE OFF]" : ""} =====`);
  for (const c of TEXT_CASES) {
    for (let i = 0; i < repeat; i++) {
      try {
        const r = await identifySymptoms(c.text, "adult", "male");
        const label = r.possibleIllnesses[0];
        dist[label] = (dist[label] || 0) + 1;
        sources[r.source] = (sources[r.source] || 0) + 1;
        if (c.redFlag && !r.emergencyRequired) redFlagMiss++;
        console.log(`→ "${c.text.slice(0, 50)}"  =>  ${label} | ${r.source} | conf=${r.kaggle?.confidence ?? "n/a"} | sev=${r.severity}${c.redFlag ? " | redflag=" + r.emergencyRequired : ""}\n`);
      } catch (e: any) {
        fails++;
        console.log(`✗ "${c.text.slice(0, 50)}"  FAILED: ${e.message}\n`);
      }
    }
  }

  const testDir = path.resolve(__dirname);
  const images = fs.readdirSync(testDir).filter((f: string) => /\.(png|jpe?g|webp)$/i.test(f));
  const imageDist: Record<string, number> = {};
  console.log(`\n===== IMAGE CASES (${images.length}) =====`);
  for (const f of images) {
    const buf = fs.readFileSync(path.join(testDir, f));
    const mime = f.endsWith(".png") ? "image/png" : f.endsWith(".webp") ? "image/webp" : "image/jpeg";
    try {
      const r = await identifyImageSymptoms(buf.toString("base64"), mime, "");
      const label = r.possibleIllnesses[0];
      imageDist[label] = (imageDist[label] || 0) + 1;
      sources[r.source] = (sources[r.source] || 0) + 1;
      console.log(`→ ${f}  =>  ${label} | ${r.source} | conf=${r.kaggle?.confidence ?? "n/a"}\n`);
    } catch (e: any) {
      fails++;
      console.log(`✗ ${f} FAILED: ${e.message}\n`);
    }
  }

  console.log("\n===== REPORT =====");
  console.log("Text label distribution :", dist);
  console.log("Image label distribution:", imageDist);
  console.log("Sources                 :", sources);
  console.log("Red-flag cases missing emergency flag:", redFlagMiss, "(must be 0)");
  console.log("Hard failures:", fails);
  const top = Object.values(dist).sort((a, b) => b - a)[0] || 0;
  const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
  console.log(`Most common text label share: ${Math.round((top / total) * 100)}%  (>50% suggests model bias)`);
  process.exit(0);
}
main();
