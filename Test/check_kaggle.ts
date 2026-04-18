/**
 * KAGGLE API CONNECTIVITY TESTER
 * Run with: npx tsx Test/check_kaggle.ts
 */
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const KAGGLE_URL = process.env.NEXT_PUBLIC_KAGGLE_API_URL;

async function runTests() {
  console.log("🚀 STARTING KAGGLE CONNECTIVITY TEST...");
  console.log(`🌍 TARGET URL: ${KAGGLE_URL}`);

  if (!KAGGLE_URL) {
    console.error("❌ ERROR: NEXT_PUBLIC_KAGGLE_API_URL is missing in .env!");
    return;
  }

  // 1. TEST TEXT PREDICTION
  try {
    console.log("\n📝 Testing Text API (/predict-text)...");
    const textRes = await fetch(`${KAGGLE_URL}/predict-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms: "I have a high fever and headache" }),
    });

    if (textRes.ok) {
      const data = await textRes.json();
      console.log("✅ TEXT API SUCCESS!");
      console.log(`🤖 Kaggle Response: ${JSON.stringify(data)}`);
    } else {
      console.error(`❌ TEXT API FAILED: Status ${textRes.status}`);
    }
  } catch (e: any) {
    console.error(`❌ TEXT API CONNECTION ERROR: ${e.message}`);
  }

  // 2. TEST IMAGE PREDICTION (Small dummy image)
  try {
    console.log("\n📸 Testing Image API (/predict-image)...");
    // Minimal white pixel image base64
    const dummyImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    
    const imgRes = await fetch(`${KAGGLE_URL}/predict-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dummyImage }),
    });

    if (imgRes.ok) {
      const data = await imgRes.json();
      console.log("✅ IMAGE API SUCCESS!");
      console.log(`🤖 Kaggle Response: ${JSON.stringify(data)}`);
    } else {
      console.error(`❌ IMAGE API FAILED: Status ${imgRes.status}`);
    }
  } catch (e: any) {
    console.error(`❌ IMAGE API CONNECTION ERROR: ${e.message}`);
  }

  console.log("\n--- TEST COMPLETE ---");
}

runTests();
