import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const illnesses = await prisma.illness.findMany({
      include: { firstAids: { orderBy: { step: "asc" } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, illnesses });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch first aid guides" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, steps } = body;

    if (!name || !description || !category || !steps || !Array.isArray(steps)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const illness = await prisma.illness.create({
      data: {
        name,
        description,
        category,
        firstAids: {
          create: steps.map((s: string, index: number) => ({
            step: index + 1,
            instruction: s,
          })),
        },
      },
      include: { firstAids: true },
    });

    return NextResponse.json({ success: true, illness }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create guide" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, category, steps } = body;

    if (!id || !name || !description || !category || !steps || !Array.isArray(steps)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update illness and replace all steps (simplest way to re-sync)
    const illness = await prisma.$transaction(async (tx) => {
      // 1. Update illness details
      const updated = await tx.illness.update({
        where: { id },
        data: { name, description, category },
      });

      // 2. Delete existing steps
      await tx.firstAid.deleteMany({ where: { illnessId: id } });

      // 3. Create new steps
      await tx.firstAid.createMany({
        data: steps.map((s: string, index: number) => ({
          illnessId: id,
          step: index + 1,
          instruction: s,
        })),
      });

      return await tx.illness.findUnique({
        where: { id },
        include: { firstAids: { orderBy: { step: "asc" } } },
      });
    });

    return NextResponse.json({ success: true, illness });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update guide" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    
    await prisma.illness.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete guide" }, { status: 500 });
  }
}
