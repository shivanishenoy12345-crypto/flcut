export async function getLocation(ip: string): Promise<{
  country: string | null;
  city: string | null;
}> {
  try {
    if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168")) {
      return { country: "Local", city: "Local" };
    }

    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,status`);
    const data = await res.json();

    if (data.status !== "success") {
      return { country: null, city: null };
    }

    return {
      country: data.country ?? null,
      city: data.city ?? null,
    };
  } catch {
    return { country: null, city: null };
  }
}