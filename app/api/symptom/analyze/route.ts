import { NextRequest, NextResponse } from "next/server";
import { identifySymptoms } from "@/lib/aiService";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(request: NextRequest) {
  try {
    const { symptoms, age, gender } = await request.json();

    if (!symptoms || symptoms.trim().length < 5) {
      return NextResponse.json(
        { error: "Please describe your symptoms in more detail (at least 5 characters)" },
        { status: 400 }
      );
    }

    // Use Smart AI Service (Kaggle Model + Gemini Fallback)
    const analysis = await identifySymptoms(symptoms, age, gender);

    // Try to save session if user is logged in
    try {
      const session = await getServerSession();
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
        });
        if (user) {
          await prisma.symptomSession.create({
            data: {
              userId: user.id,
              symptomText: symptoms,
              aiResponse: analysis as any,
              severity: analysis.severity || "mild",
            },
          });
        }
      }
    } catch {
      // Non-critical: continue even if saving fails
    }

    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    console.error("Symptom analysis error:", error);
    return NextResponse.json(
      { error: "AI analysis failed. Please try again.", details: error.message },
      { status: 500 }
    );
  }
}
