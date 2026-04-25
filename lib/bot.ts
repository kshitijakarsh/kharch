import { Bot, InlineKeyboard } from "grammy";
import { getUserCategories, findOrCreateCategory } from "./categories";
import { addExpense, getRecentExpenses, deleteExpense, getStats } from "./expenses";
import { updateUserSalary, getUserSalary } from "./users";
import { addIncome, getMonthlyExtraIncome } from "./incomes";
import { pool } from "./db";
import { parseManualCommand } from "./parser";

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
      `Enter this on the [Kharch Dashboard](https://kharch-two.vercel.app/) to log in. It will expire in 10 minutes.`,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("Auth code error:", error);
    await ctx.reply("❌ Failed to generate code. Please try again.");
  }
}

export default function getBot() {
  if (!bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error("TELEGRAM_TOKEN is missing");

    bot = new Bot(token);

    bot.api.setMyCommands([
      { command: "start", description: "🏠 Welcome & Onboarding" },
      { command: "add", description: "➕ Add Expense: /add <amount> <category> [note]" },
      { command: "salary", description: "💰 Set Monthly Income: /salary <amount>" },
      { command: "income", description: "💵 Record Extra Money: /income <amount> [note]" },
      { command: "history", description: "📋 Recent Expenses" },
      { command: "stats", description: "📊 Spending Reports" },
      { command: "categories", description: "📁 My Categories" },
      { command: "code", description: "🔑 Get Web Login Code" },
      { command: "help", description: "❓ How to Use" },
      { command: "reset", description: "⚠️ Clear All Data" },
    ]);

    bot.command("start", async (ctx: any) => {
      const userId = ctx.from?.id;
      const salary = await getUserSalary(userId);

      let welcomeMsg = 
        `🚀 *Welcome to Kharch! Your Financial Journal.*\n\n` +
        `I help you track your spending with simple commands. No more spreadsheets.\n\n` +
        `1️⃣ *Set your Income:* Crucial for calculating your burn rate.\n` +
        `   _Use:_ \`/salary 80000\`\n\n` +
        `2️⃣ *Log an Expense:* Record what you spend.\n` +
        `   _Use:_ \`/add 150 food snacks\`\n\n` +
        `3️⃣ *View Dashboard:* Access the full UI here:\n` +
        `   🔗 [kharch-two.vercel.app](https://kharch-two.vercel.app/)\n\n`;

      if (salary === 0) {
        welcomeMsg += `🚩 *Action Required:* Please set your monthly salary to unlock full analytics.`;
      } else {
        welcomeMsg += `✅ Current Salary: *₹${salary.toLocaleString()}*`;
      }

      await ctx.reply(welcomeMsg, { parse_mode: "Markdown" });
    });

    bot.command("add", async (ctx: any) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      const parsed = parseManualCommand(ctx.message?.text || "");
      if (!parsed || parsed.type !== "expense") {
        return ctx.reply(
          `➕ *Add Expense*\n\n` +
          `Usage: \`/add <amount> <category> [note]\`\n\n` +
          `*Example:* \`/add 150 food snacks\``,
          { parse_mode: "Markdown" }
        );
      }

      try {
        const category = await findOrCreateCategory(parsed.category!, userId);
        await addExpense({
          type: "expense",
          amount: parsed.amount,
          description: parsed.description,
          category: category.name,
          isNewCategory: false
        }, userId, category.id);

        let response = `✅ *Recorded!*\n\n`;
        response += `💰 *Amount:* ₹${parsed.amount.toLocaleString()}\n`;
        response += `📁 *Category:* ${category.name}\n`;
        if (parsed.description) {
          response += `📝 *Note:* ${parsed.description}\n`;
        }

        await ctx.reply(response, { parse_mode: "Markdown" });
      } catch (error) {
        console.error("Add expense error:", error);
        await ctx.reply("❌ Failed to record expense. Please try again.");
      }
    });

    bot.command("salary", async (ctx: any) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      const parsed = parseManualCommand(ctx.message?.text || "");
      if (!parsed || parsed.type !== "salary_update") {
        const salary = await getUserSalary(userId);
        return ctx.reply(
          `💰 *Monthly Salary*\n\n` +
          `Current: *₹${salary.toLocaleString()}*\n\n` +
          `To update, type: \`/salary 80000\``,
          { parse_mode: "Markdown" }
        );
      }

      await updateUserSalary(userId, parsed.amount);
      return ctx.reply(
        `✅ *Salary Updated!*\n\n` +
        `Your monthly income is now set to *₹${parsed.amount.toLocaleString()}*.`,
        { parse_mode: "Markdown" }
      );
    });

    bot.command("income", async (ctx: any) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      const parsed = parseManualCommand(ctx.message?.text || "");
      if (!parsed || parsed.type !== "extra_income") {
        const extra = await getMonthlyExtraIncome(userId);
        return ctx.reply(
          `💵 *Extra Income (This Month)*\n\n` +
          `Total: *₹${extra.toLocaleString()}*\n\n` +
          `To record more, type: \`/income <amount> [note]\`\n` +
          `*Example:* \`/income 5000 bonus\``,
          { parse_mode: "Markdown" }
        );
      }

      await addIncome({ type: "extra_income", amount: parsed.amount, description: parsed.description || "Extra money" }, userId);
      return ctx.reply(
        `✅ *Income Recorded!*\n\n` +
        `💰 *Amount:* ₹${parsed.amount.toLocaleString()}\n` +
        `📝 *Note:* ${parsed.description || "Extra money"}`,
        { parse_mode: "Markdown" }
      );
    });

    bot.command("reset", (ctx: any) => {
      const keyboard = new InlineKeyboard()
        .text("❌ Cancel", "cancel_clear")
        .text("✅ Confirm Reset", "confirm_clear");
      ctx.reply("⚠️ *Danger Zone*\n\nThis will permanently delete all your expense data. Are you sure?", {
        parse_mode: "Markdown",
        reply_markup: keyboard
      });
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
      const [w, m, salary, extraIncome] = await Promise.all([
        getStats(userId, "week"), 
        getStats(userId, "month"),
        getUserSalary(userId),
        getMonthlyExtraIncome(userId)
      ]);

      const totalMonth = m.reduce((a: number, c: any) => a + parseFloat(c.total), 0);
      const totalIncome = salary + extraIncome;

      let msg = "📊 *Financial Overview*\n\n";
      if (totalIncome > 0) {
        const burn = (totalMonth / totalIncome) * 100;
        msg += `💰 *Monthly Salary:* ₹${salary.toLocaleString()}\n`;
        msg += `➕ *Extra Income:* ₹${extraIncome.toLocaleString()}\n`;
        msg += `🏦 *Total Capital:* ₹${totalIncome.toLocaleString()}\n`;
        msg += `🔥 *Burn Rate:* ${burn.toFixed(1)}%\n\n`;
      }
      
      msg += "🗓 *Last 7 Days*\n" + (w.length ? w.map((s: any) => `• ${s.category}: ₹${s.total}`).join("\n") : "_No activity_") + "\n\n";
      msg += "🗓 *Last 30 Days*\n" + (m.length ? m.map((s: any) => `• ${s.category}: ₹${s.total}`).join("\n") : "_No activity_");

      await ctx.reply(msg, { parse_mode: "Markdown" });
    });


    bot.command("help", (ctx: any) => {
      ctx.reply(
        `📖 *Kharch Command Guide*\n\n` +
        `• *Expenses:* \`/add <amount> <category> [note]\`\n` +
        `• *Salary:* \`/salary <amount>\`\n` +
        `• *Extra Income:* \`/income <amount> [note]\`\n` +
        `• *Stats:* \`/stats\`\n` +
        `• *History:* \`/history\`\n\n` +
        `💡 *Example:* \`/add 500 food dinner\``,
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
        await ctx.editMessageText("💥 *Expense history has been wiped.*", { parse_mode: "Markdown" });
      } else if (data === "cancel_clear") {
        await ctx.editMessageText("Whew! Action cancelled. 😅", { parse_mode: "Markdown" });
      }
    });

    bot.on("message:text", (ctx: any) => {
      const text = ctx.message.text;
      if (text.startsWith("/")) return; 
      ctx.reply("💡 *To record an expense, use the /add command.*\n\n_Example:_ \`/add 150 food snacks\`", { parse_mode: "Markdown" });
    });

  }
  return bot;
}