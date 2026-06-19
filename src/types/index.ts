export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";

export function getDeviceType(userAgent: string): DeviceType {
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod/.test(ua)) return "mobile";
  if (/tablet|ipad/.test(ua)) return "tablet";
  if (/windows|macintosh|linux/.test(ua)) return "desktop";
  return "unknown";
}