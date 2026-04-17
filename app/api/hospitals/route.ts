import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const hospitals = await prisma.hospital.findMany({
      include: { doctors: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, hospitals });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch hospitals" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, lat, lng, phone, type } = body;

    if (!name || !address || !lat || !lng || !phone) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const hospital = await prisma.hospital.create({ data: body });
    return NextResponse.json({ success: true, hospital }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create hospital" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    
    await prisma.hospital.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete hospital" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, address, lat, lng, phone, type } = body;

    if (!id || !name || !address || !lat || !lng || !phone) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const hospital = await prisma.hospital.update({
      where: { id },
      data: { name, address, lat, lng, phone, type },
    });

    return NextResponse.json({ success: true, hospital });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update hospital" }, { status: 500 });
  }
}
