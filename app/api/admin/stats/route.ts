import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Basic aggregated statistics for the admin dashboard
    const totalSessions = await prisma.symptomSession.count();
    
    // Count how many sessions had 'critical' severity (Emergency)
    const emergencyAlerts = await prisma.symptomSession.count({
      where: { severity: "critical" }
    });

    // Top illness calculation (simplified)
    // For a real production app with thousands of records, we might do this via RAW SQL or a cron job.
    // Here we sample the latest 100 to find the most common for the dashboard demo.
    const recentSessions = await prisma.symptomSession.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' }
    });

    const illnessCounts: Record<string, number> = {};
    recentSessions.forEach(session => {
      const ai = session.aiResponse as any;
      if (ai && Array.isArray(ai.possibleIllnesses)) {
        const top = ai.possibleIllnesses[0];
        if (top) {
          illnessCounts[top] = (illnessCounts[top] || 0) + 1;
        }
      }
    });

    let topIllness = "No Data";
    let maxCount = 0;
    for (const [illness, count] of Object.entries(illnessCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topIllness = illness;
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalSessions,
        emergencyAlerts,
        topIllness
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
