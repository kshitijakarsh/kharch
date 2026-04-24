import crypto from "crypto";

/**
 * Validates data received from Telegram Mini App.
 * @param initData The raw initData string from Telegram
 * @param botToken The bot token from BotFather
 */
export function validateTelegramData(initData: string, botToken: string): boolean {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get("hash");
  if (!hash) return false;

  urlParams.delete("hash");

  // Sort keys alphabetically
  const sortedParams = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  // HMAC-SHA256 of the bot token with "WebAppData" string
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  // HMAC-SHA256 of the sorted params with the secret key
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(sortedParams)
    .digest("hex");

  return calculatedHash === hash;
}

/**
 * Parses the user object from Telegram initData.
 */
export function parseTelegramUser(initData: string) {
  const urlParams = new URLSearchParams(initData);
  const userJson = urlParams.get("user");
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (e) {
    return null;
  }
}
