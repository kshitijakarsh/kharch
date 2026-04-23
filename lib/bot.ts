import { Bot } from "grammy";

export const bot = new Bot(process.env.BOT_TOKEN!);

// basic handlers at the beginning

bot.command("start", (ctx) => {
  ctx.reply("Welcome to Kharch Bot! ");
});

bot.on("message:text", (ctx) => {
  ctx.reply("You said: " + ctx.message.text);
});