export function isBot(userAgent: string): boolean {
  const botPatterns = [
    "bot",
    "crawler",
    "spider",
    "crawling",
    "facebookexternalhit",
    "Twitterbot",
    "LinkedInBot",
    "WhatsApp",
    "Slackbot",
    "TelegramBot",
    "Discordbot",
    "Googlebot",
    "bingbot",
    "Yahoo",
    "DuckDuckBot",
    "Baiduspider",
    "ia_archiver",
    "Wget",
    "curl",
    "python-requests",
    "PostmanRuntime",
  ];

  const ua = userAgent.toLowerCase();
  return botPatterns.some((pattern) => ua.includes(pattern.toLowerCase()));
}