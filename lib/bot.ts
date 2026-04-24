import { Bot, InlineKeyboard } from "grammy";
import { extractExpense } from "./llm";
import { getUserCategories, findOrCreateCategory } from "./categories";
import { addExpense, getRecentExpenses, deleteExpense, getStats } from "./expenses";
import { ExpenseSchema } from "./validator";
import { pool } from "./db";

let bot: Bot | null = null;

// --- Helper: Clean up expired codes ---
async function cleanupCodes() {
  try {
    await pool.query("DELETE FROM auth_codes WHERE expires_at < NOW()");
  } catch (e) {
    console.error("Cleanup error:", e);
  }
}

// --- Handler: Generate Login Code ---
async function handleLoginCode(ctx: any) {
  const userId = ctx.from?.id;
  if (!userId) return;

  await cleanupCodes();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  try {
    // Remove any existing codes for this user first
    await pool.query("DELETE FROM auth_codes WHERE user_id = $1", [userId]);
    await pool.query(
      "INSERT INTO auth_codes (user_id, code, expires_at) VALUES ($1, $2, $3)",
      [userId, code, expiresAt]
    );

    await ctx.reply(
      `🔐 *Your Secure Login Code*\n\n` +
      `Code: \`${code}\`\n\n` +
      `Enter this on the Kharch dashboard to log in. It will expire in 10 minutes.`,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("Auth code error:", error);
    await ctx.reply("❌ Failed to generate code. Please try again.");
  }
}

// --- Handler: Process Expense (AI or Manual) ---
async function handleExpense(ctx: any, text: string) {
  const userId = ctx.from?.id;
  if (!userId || !text.trim()) return;

  if (text.length > 500) {
    return ctx.reply("⚠️ That message is a bit too long! Try keeping it under 500 characters.");
  }

  try {
    await ctx.replyWithChatAction("typing");

    const categories = await getUserCategories(userId);
    const categoryNames = categories.map((c: any) => c.name);

    const extracted = await extractExpense(text, categoryNames);
    const expense = ExpenseSchema.parse(extracted);

    if (expense.amount <= 0) {
      return ctx.reply("💰 Please provide a valid amount greater than 0.");
    }

    const category = await findOrCreateCategory(expense.category, userId);
    await addExpense(expense, userId, category.id);

    let response = `✅ *Recorded successfully!*\n\n`;
    response += `💰 *Amount:* ₹${expense.amount.toLocaleString()}\n`;
    response += `📁 *Category:* ${category.name}${expense.isNewCategory ? " (New)" : ""}\n`;
    if (expense.description) {
      response += `📝 *Note:* ${expense.description}\n`;
    }

    await ctx.reply(response, { parse_mode: "Markdown" });
  } catch (error: any) {
    console.error("Expense processing error:", error);
    let msg = "❌ *Oops!* I couldn't process that.";
    if (error.name === "ZodError") msg = "❌ *Error:* Invalid data format received from AI.";
    
    await ctx.reply(`${msg}\n\n_Try:_ \`100 for Pizza\` or \`250 - Petrol\``, { parse_mode: "Markdown" });
  }
}

export default function getBot() {
  if (!bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error("TELEGRAM_TOKEN is missing");

    bot = new Bot(token);

    bot.api.setMyCommands([
      { command: "start", description: "🏠 Welcome & Setup" },
      { command: "code", description: "🔑 Get Login Code" },
      { command: "history", description: "📋 Recent Expenses" },
      { command: "stats", description: "📊 Spending Reports" },
      { command: "categories", description: "📁 My Categories" },
      { command: "add", description: "➕ Add Manually" },
      { command: "help", description: "❓ How to Use" },
      { command: "clear", description: "⚠️ Reset Data" },
    ]);

    bot.command("start", (ctx: any) => {
      ctx.reply(
        `🚀 *Welcome to Kharch AI!*\n\n` +
        `I'm here to help you track your spending without the hassle. Just send me your expenses like you're talking to a friend.\n\n` +
        `✨ *Example:* \`500 for dinner with Rahul\`\n\n` +
        `Use /help to see all features.`,
        { parse_mode: "Markdown" }
      );
    });

    bot.command("code", handleLoginCode);

    bot.command("categories", async (ctx: any) => {
      const userId = ctx.from?.id;
      if (!userId) return;
      const cats = await getUserCategories(userId);
      if (cats.length === 0) return ctx.reply("📁 You haven't created any categories yet.");
      
      const list = cats.map((c: any) => `• ${c.name}`).join("\n");
      ctx.reply(`📁 *Your Categories:*\n\n${list}`, { parse_mode: "Markdown" });
    });

    bot.command("history", async (ctx: any) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      const recent = await getRecentExpenses(userId, 10);
      if (recent.length === 0) return ctx.reply("📭 No expenses found.");

      let message = "📝 *Recent Expenses*\n\n";
      const keyboard = new InlineKeyboard();

      recent.forEach((exp: any, index: number) => {
        message += `${index + 1}. *₹${exp.amount}* — ${exp.category_name}\n   _${exp.description || "No description"}_\n\n`;
        keyboard.text(`🗑 Del ${index + 1}`, `delete_${exp.id}`);
        if ((index + 1) % 2 === 0) keyboard.row();
      });

      await ctx.reply(message, { parse_mode: "Markdown", reply_markup: keyboard });
    });

    bot.command("stats", async (ctx: any) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      await ctx.replyWithChatAction("typing");
      const [w, m] = await Promise.all([getStats(userId, "week"), getStats(userId, "month")]);

      let msg = "📊 *Spending Report*\n\n";
      msg += "🗓 *Last 7 Days*\n" + (w.length ? w.map((s: any) => `• ${s.category}: ₹${s.total}`).join("\n") : "_No data_") + "\n\n";
      msg += "🗓 *Last 30 Days*\n" + (m.length ? m.map((s: any) => `• ${s.category}: ₹${s.total}`).join("\n") : "_No data_");

      await ctx.reply(msg, { parse_mode: "Markdown" });
    });

    bot.command("clear", (ctx: any) => {
      const keyboard = new InlineKeyboard()
        .text("❌ Cancel", "cancel_clear")
        .text("✅ Confirm Reset", "confirm_clear");
      ctx.reply("⚠️ *Danger Zone*\n\nThis will permanently delete all your expense data. Are you sure?", {
        parse_mode: "Markdown",
        reply_markup: keyboard
      });
    });

    bot.command("add", (ctx: any) => {
      const text = ctx.message?.text?.replace("/add", "").trim();
      if (!text) return ctx.reply("❓ *Usage:* \`/add 50 for Tea\`");
      handleExpense(ctx, text);
    });

    bot.command("help", (ctx: any) => {
      ctx.reply(
        `📖 *Kharch AI Guide*\n\n` +
        `• *Natural Language:* Just type \`100 for snacks\`\n` +
        `• *Shorthand:* \`Petrol 500\` or \`200 - Lunch\`\n` +
        `• *Dashboard:* Use /code to log into the web UI\n` +
        `• *Management:* Use /history to delete entries\n\n` +
        `I'll automatically categorize your spending!`,
        { parse_mode: "Markdown" }
      );
    });

    bot.on("callback_query:data", async (ctx: any) => {
      const data = ctx.callbackQuery.data;
      const userId = ctx.from?.id;
      if (!userId) return;

      if (data.startsWith("delete_")) {
        const id = parseInt(data.replace("delete_", ""));
        if (await deleteExpense(id, userId)) {
          await ctx.answerCallbackQuery("✅ Deleted");
          await ctx.editMessageText("🗑 *Entry removed.*", { parse_mode: "Markdown" });
        }
      } else if (data === "confirm_clear") {
        await pool.query("DELETE FROM expenses WHERE user_id = $1", [userId]);
        await pool.query("DELETE FROM categories WHERE user_id = $1", [userId]);
        await ctx.editMessageText("💥 *All data has been wiped clean.*", { parse_mode: "Markdown" });
      } else if (data === "cancel_clear") {
        await ctx.editMessageText("Whew! Action cancelled. 😅", { parse_mode: "Markdown" });
      }
    });

    bot.on("message:text", (ctx: any) => {
      const text = ctx.message.text;
      
      // If it starts with / but wasn't caught by bot.command() handlers above
      if (text.startsWith("/")) {
        return ctx.reply("❓ *Unknown Command*\n\nTry /help to see all available commands.", { 
          parse_mode: "Markdown" 
        });
      }

      handleExpense(ctx, text);
    });

  }
  return bot;
}