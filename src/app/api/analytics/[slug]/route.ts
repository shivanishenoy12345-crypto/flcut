import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const link = await prisma.link.findUnique({
      where: { slug },
      include: {
        clicks: {
          orderBy: { clickedAt: "asc" },
        },
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const clicks = link.clicks;
    const totalClicks = clicks.length;
    const uniqueClicks = clicks.filter((c) => c.isUnique).length;

    // Clicks by referrer
    const byReferrer: Record<string, number> = {};
    clicks.forEach((c) => {
      const ref = c.referrer || "Direct";
      byReferrer[ref] = (byReferrer[ref] || 0) + 1;
    });

    // Clicks by device
    const byDevice: Record<string, number> = {};
    clicks.forEach((c) => {
      const device = c.device || "Unknown";
      byDevice[device] = (byDevice[device] || 0) + 1;
    });

    // Clicks by country
    const byCountry: Record<string, number> = {};
    clicks.forEach((c) => {
      const country = c.country || "Unknown";
      byCountry[country] = (byCountry[country] || 0) + 1;
    });

    // Clicks by hour (0-23) to find peak time
    const byHour: Record<number, number> = {};
    clicks.forEach((c) => {
      const hour = new Date(c.clickedAt).getHours();
      byHour[hour] = (byHour[hour] || 0) + 1;
    });

    // Clicks over time (by date) for a chart
    const byDate: Record<string, number> = {};
    clicks.forEach((c) => {
      const date = new Date(c.clickedAt).toISOString().split("T")[0];
      byDate[date] = (byDate[date] || 0) + 1;
    });

    return NextResponse.json({
      link: {
        id: link.id,
        slug: link.slug,
        originalUrl: link.originalUrl,
        createdAt: link.createdAt,
        goLiveAt: link.goLiveAt,
        expiresAt: link.expiresAt,
        maxClicks: link.maxClicks,
      },
      analytics: {
        totalClicks,
        uniqueClicks,
        byReferrer,
        byDevice,
        byCountry,
        byHour,
        byDate,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}