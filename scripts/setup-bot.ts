import { Bot } from "grammy";
import * as dotenv from "dotenv";
import path from "path";

// Load .env from root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function setup() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("❌ TELEGRAM_BOT_TOKEN is missing in .env");
    return;
  }

  const bot = new Bot(token);

  try {
    const me = await bot.api.getMe();
    await bot.api.setMyCommands([
      { command: "start", description: "Start the bot" },
      { command: "history", description: "Recent expenses & delete" },
      { command: "stats", description: "Spending reports" },
      { command: "add", description: "Add manually (e.g. /add 20 pen)" },
      { command: "help", description: "Show help & examples" },
    ]);
  } catch (error) {
    console.error("❌ Setup failed:", error);
  }
}

setup();
