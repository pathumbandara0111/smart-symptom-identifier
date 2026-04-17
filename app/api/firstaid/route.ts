import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const illnesses = await prisma.illness.findMany({
      where: category ? { category } : undefined,
      include: {
        firstAids: { orderBy: { step: "asc" } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, illnesses });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch first aid data" }, { status: 500 });
  }
}
