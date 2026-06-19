import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateUniqueSlug, isReserved } from "@/lib/generateSlug";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { originalUrl, alias, goLiveAt, expiresAt, maxClicks } = body;

    // Validate URL
    if (!originalUrl) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
      new URL(originalUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Handle alias vs auto-generated slug
    let slug: string;

    if (alias) {
      // Check if reserved
      if (isReserved(alias)) {
        return NextResponse.json(
          { error: "That alias is reserved. Please choose another." },
          { status: 400 }
        );
      }

      // Check if already taken
      const existing = await prisma.link.findUnique({ where: { slug: alias } });
      if (existing) {
        return NextResponse.json(
          { error: "That alias is already taken. Please choose another." },
          { status: 400 }
        );
      }

      slug = alias;
    } else {
      slug = await generateUniqueSlug();
    }

    // Create the link
    const link = await prisma.link.create({
      data: {
        originalUrl,
        slug,
        alias: alias || null,
        goLiveAt: goLiveAt ? new Date(goLiveAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxClicks: maxClicks ? parseInt(maxClicks) : null,
      },
    });

    return NextResponse.json({
      slug: link.slug,
      shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${link.slug}`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}