import { Bot } from "grammy";

let bot : Bot | null = null;

export default function getBot() {
  if (!bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      throw new Error("TELEGRAM_TOKEN is missing");
    }

    bot = new Bot(token);

    bot.command("start", (ctx : any) => {
      ctx.reply("Welcome to Kharch Bot!");
    });

    bot.on("message:text", (ctx : any) => {
      ctx.reply("You said: " + ctx.message.text);
    });

    bot.command("help", (ctx : any) => {
      ctx.reply("Available commands:\n/start - Start the bot\n/help - Show this help message\n/describe - Describe the bot");
    });

    bot.command("describe", (ctx : any) => {
      ctx.reply("Kharch Bot is a simple bot to help you manage your expenses.");
    });
  }

  return bot;
}