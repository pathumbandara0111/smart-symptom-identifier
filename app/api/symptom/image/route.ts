import { NextRequest, NextResponse } from "next/server";
import { analyzeImageSymptoms } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const description = formData.get("description") as string;

    if (!image) {
      return NextResponse.json(
        { error: "Please upload an image" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(image.type)) {
      return NextResponse.json(
        { error: "Please upload a valid image (JPEG, PNG, or WEBP)" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Convert to base64
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // Get AI analysis
    const analysis = await analyzeImageSymptoms(base64, image.type, description);

    // Save session if logged in
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
              symptomText: description || "Image analysis",
              aiResponse: analysis,
              severity: analysis.severity || "mild",
            },
          });
        }
      }
    } catch {
      // Non-critical
    }

    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    console.error("Image analysis error:", error);
    return NextResponse.json(
      { error: "Image analysis failed. Please try again.", details: error.message },
      { status: 500 }
    );
  }
}
