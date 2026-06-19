import { prisma } from "@/lib/prisma";
import { isBot } from "@/lib/isBot";
import { getDeviceType } from "@/types/index";
import { getLocation } from "@/lib/getLocation";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function SlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const headersList = await headers();

  const userAgent = headersList.get("user-agent") || "";
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";
  const referrer = headersList.get("referer") || null;

  const link = await prisma.link.findUnique({
    where: { slug },
    include: { clicks: true },
  });

  // Link not found
  if (!link) {
    return (
      <NotFound />
    );
  }

  const now = new Date();

  // Not live yet
  if (link.goLiveAt && now < new Date(link.goLiveAt)) {
    return <NotLiveYet goLiveAt={link.goLiveAt} />;
  }

  // Expired
  if (link.expiresAt && now > new Date(link.expiresAt)) {
    return <Expired />;
  }

  // Cap reached
  const totalClicks = link.clicks.length;
  if (link.maxClicks && totalClicks >= link.maxClicks) {
    return <CapReached />;
  }

  // Bot check — skip logging if bot
  if (!isBot(userAgent)) {
    const device = getDeviceType(userAgent);
    const { country, city } = await getLocation(ip);

    // Unique click: same IP hasn't clicked this link in the last 24 hours
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentClick = await prisma.click.findFirst({
      where: {
        linkId: link.id,
        ip,
        clickedAt: { gte: oneDayAgo },
      },
    });

    await prisma.click.create({
      data: {
        linkId: link.id,
        referrer,
        device,
        country,
        city,
        ip,
        isUnique: !recentClick,
      },
    });
  }

  redirect(link.originalUrl);
}

// ── UI States ──────────────────────────────────────────────

function NotFound() {
  return (
    <div className="min-h-screen bg-[#0F1623] flex items-center justify-center text-center px-4">
      <div>
        <p className="text-6xl mb-4">🔗</p>
        <h1 className="text-3xl font-bold text-white mb-2">Link not found</h1>
        <p className="text-[#8892A4]">This short link doesn't exist.</p>
        <a href="/" className="mt-6 inline-block text-[#4F46E5] underline">
          Create one →
        </a>
      </div>
    </div>
  );
}

function NotLiveYet({ goLiveAt }: { goLiveAt: Date }) {
  return (
    <div className="min-h-screen bg-[#0F1623] flex items-center justify-center text-center px-4">
      <div>
        <p className="text-6xl mb-4">⏳</p>
        <h1 className="text-3xl font-bold text-white mb-2">Not live yet</h1>
        <p className="text-[#8892A4]">
          This link goes live on{" "}
          <span className="text-white">
            {new Date(goLiveAt).toLocaleString()}
          </span>
        </p>
      </div>
    </div>
  );
}

function Expired() {
  return (
    <div className="min-h-screen bg-[#0F1623] flex items-center justify-center text-center px-4">
      <div>
        <p className="text-6xl mb-4">🚫</p>
        <h1 className="text-3xl font-bold text-white mb-2">Link expired</h1>
        <p className="text-[#8892A4]">This link is no longer active.</p>
        <a href="/" className="mt-6 inline-block text-[#4F46E5] underline">
          Create a new one →
        </a>
      </div>
    </div>
  );
}

function CapReached() {
  return (
    <div className="min-h-screen bg-[#0F1623] flex items-center justify-center text-center px-4">
      <div>
        <p className="text-6xl mb-4">🔒</p>
        <h1 className="text-3xl font-bold text-white mb-2">
          Registration closed
        </h1>
        <p className="text-[#8892A4]">
          This link has reached its maximum number of clicks.
        </p>
      </div>
    </div>
  );
}