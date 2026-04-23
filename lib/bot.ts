import { Bot } from "grammy";

let bot : any;

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
  }

  return bot;
}