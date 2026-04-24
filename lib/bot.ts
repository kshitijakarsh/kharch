import { Bot, InlineKeyboard } from "grammy";
import { extractExpense } from "./llm";
import { getUserCategories, findOrCreateCategory } from "./categories";
import { addExpense, getRecentExpenses, deleteExpense, getStats } from "./expenses";
import { ExpenseSchema } from "./validator";

let bot: Bot | null = null;

async function handleExpense(ctx: any, text: string) {
  const userId = ctx.from?.id;
  if (!userId) return;

  try {
    // Show that the bot is thinking/typing
    await ctx.replyWithChatAction("typing");

    const categories = await getUserCategories(userId);
    const categoryNames = categories.map((c: any) => c.name);

    const extracted = await extractExpense(text, categoryNames);
    const expense = ExpenseSchema.parse(extracted);

    const category = await findOrCreateCategory(expense.category, userId);
    await addExpense(expense, userId, category.id);

    let response = `✅ *Expense Recorded!*\n\n`;
    response += `💰 *Amount:* ₹${expense.amount}\n`;
    response += `📁 *Category:* ${category.name}${expense.isNewCategory ? " (New)" : ""}\n`;
    if (expense.description) {
      response += `📝 *Description:* ${expense.description}\n`;
    }

    await ctx.reply(response, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Expense processing error:", error);
    await ctx.reply(
      "❌ *Oops!* I couldn't understand that. \nTry: `Spent 50 on snacks` or `100 - Petrol`",
      { parse_mode: "Markdown" }
    );
  }
}

export default function getBot() {
  if (!bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      throw new Error("TELEGRAM_TOKEN is missing");
    }

    bot = new Bot(token);

    // Register commands for the Telegram "Menu" button
    bot.api.setMyCommands([
      { command: "start", description: "Start the bot" },
      { command: "history", description: "Recent expenses & delete" },
      { command: "stats", description: "Spending reports" },
      { command: "add", description: "Add manually (e.g. /add 20 pen)" },
      { command: "help", description: "Show help & examples" },
    ]);

    bot.command("start", (ctx: any) => {
      let startMsg = `🚀 *Welcome to Kharch Bot!*\n\n`;
      startMsg += `I'm your AI-powered financial assistant. Send me your expenses in any format, and I'll track them for you.\n\n`;
      startMsg += `✨ *Try saying:* \`100 for lunch\`\n\n`;
      startMsg += `Use /help to see all available commands.`;
      ctx.reply(startMsg, { parse_mode: "Markdown" });
    });

    bot.command("help", (ctx: any) => {
      let helpMsg = `📖 *Kharch Bot Help*\n\n`;
      helpMsg += `Track your expenses easily using AI! Just talk to me normally.\n\n`;
      
      helpMsg += `🖋 *Tracking Expenses*\n`;
      helpMsg += `• Just type: \`20 for coffee\`\n`;
      helpMsg += `• Or shorthand: \`Tea 10\`\n`;
      helpMsg += `• Or command: \`/add 500 petrol\`\n\n`;
      
      helpMsg += `📋 *Management*\n`;
      helpMsg += `• /history - View last 5 entries & delete them\n`;
      helpMsg += `• /stats - Weekly & monthly summaries\n\n`;
      
      helpMsg += `💡 *Tip:* I can learn your categories! If you spend on something new, just say it and I'll remember.`;

      ctx.reply(helpMsg, { parse_mode: "Markdown" });
    });

    bot.command("history", async (ctx: any) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      const recent = await getRecentExpenses(userId, 5);
      if (recent.length === 0) {
        return ctx.reply("📭 You haven't added any expenses yet!");
      }

      let message = "📝 *Recent Expenses (Last 5)*\n\n";
      const keyboard = new InlineKeyboard();

      recent.forEach((exp: any, index: number) => {
        message += `${index + 1}. *₹${exp.amount}* — ${exp.category_name}\n   _📅 ${new Date(exp.created_at).toLocaleDateString()}_\n\n`;
        keyboard.text(`🗑 Delete ${index + 1}`, `delete_${exp.id}`).row();
      });

      await ctx.reply(message, { 
        parse_mode: "Markdown",
        reply_markup: keyboard
      });
    });

    bot.command("stats", async (ctx: any) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      await ctx.replyWithChatAction("typing");
      const [weekStats, monthStats] = await Promise.all([
        getStats(userId, "week"),
        getStats(userId, "month")
      ]);

      let message = "📊 *Your Spending Summary*\n\n";
      
      message += "🗓 *Last 7 Days*\n";
      if (weekStats.length === 0) {
        message += "_No data available_\n";
      } else {
        weekStats.forEach((s: any) => message += `• ${s.category}: ₹${s.total}\n`);
      }

      message += "\n🗓 *Last 30 Days*\n";
      if (monthStats.length === 0) {
        message += "_No data available_\n";
      } else {
        monthStats.forEach((s: any) => message += `• ${s.category}: ₹${s.total}\n`);
      }

      await ctx.reply(message, { parse_mode: "Markdown" });
    });

    bot.command("add", async (ctx: any) => {
      const text = ctx.message?.text?.replace("/add", "").trim();
      if (!text) {
        return ctx.reply("❓ *How to use:* \`/add 20 on pen\`");
      }
      await handleExpense(ctx, text);
    });

    bot.on("callback_query:data", async (ctx: any) => {
      const data = ctx.callbackQuery.data;
      if (data?.startsWith("delete_")) {
        const id = parseInt(data.replace("delete_", ""));
        const userId = ctx.from?.id;
        if (!userId) return;

        const success = await deleteExpense(id, userId);
        if (success) {
          await ctx.answerCallbackQuery("✅ Deleted!");
          await ctx.editMessageText("🗑 *Expense has been removed from your history.*", { parse_mode: "Markdown" });
        } else {
          await ctx.answerCallbackQuery("❌ Failed to delete.");
        }
      }
    });

    bot.on("message:text", async (ctx: any) => {
      await handleExpense(ctx, ctx.message.text);
    });
  }

  return bot;
}