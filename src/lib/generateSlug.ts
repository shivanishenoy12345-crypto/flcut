import { prisma } from "./prisma";

const RESERVED = [
  "dashboard",
  "api",
  "admin",
  "login",
  "signup",
  "home",
  "about",
  "analytics",
];

function randomSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function generateUniqueSlug(): Promise<string> {
  let slug = randomSlug();
  let attempts = 0;

  while (attempts < 10) {
    const existing = await prisma.link.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = randomSlug();
    attempts++;
  }

  throw new Error("Could not generate a unique slug. Try again.");
}

export function isReserved(alias: string): boolean {
  return RESERVED.includes(alias.toLowerCase());
}