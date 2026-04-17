import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const speciality = searchParams.get("speciality");
    const hospitalId = searchParams.get("hospitalId");

    const where: any = { available: true };
    if (speciality) where.speciality = { contains: speciality, mode: "insensitive" };
    if (hospitalId) where.hospitalId = hospitalId;

    const doctors = await prisma.doctor.findMany({
      where,
      include: { hospital: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, doctors });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch doctors" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, speciality, fee, phone, hospitalId } = body;

    if (!name || !speciality || !fee || !phone || !hospitalId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const doctor = await prisma.doctor.create({ data: body });
    return NextResponse.json({ success: true, doctor }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create doctor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    
    await prisma.doctor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete doctor" }, { status: 500 });
  }
}
