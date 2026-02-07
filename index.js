const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const { startBots, stopBots } = require("./mcBot");

const TOKEN = process.env.BOT_TOKEN || "8133593409:AAEcD--HxMlG2MCI3Z0CEtEyV1VQ-xmlZk0";
const bot = new TelegramBot(TOKEN, { polling: true });

const FILE = "./servers.json";

function load() {
  return JSON.parse(fs.readFileSync(FILE));
}
function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// keep alive
setInterval(() => {
  console.log("🤖 Bot is running...");
}, 30000);

// /start
bot.onText(/\/start/, msg => {
  bot.sendMessage(msg.chat.id, "🤖 **Minecraft AFK Manager**", {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "➕ إضافة سيرفر", callback_data: "add" }],
        [{ text: "📋 السيرفرات", callback_data: "list" }]
      ]
    }
  });
});

bot.on("callback_query", q => {
  const chatId = q.message.chat.id;
  const data = load();

  // إضافة سيرفر
  if (q.data === "add") {
    bot.sendMessage(chatId,
      "أرسل المعلومات هكذا:\n`name ip port version`\n\nمثال:\n`test play.example.com 25565 1.20.1`",
      { parse_mode: "Markdown" }
    );

    bot.once("message", msg => {
      const [name, ip, port, version] = msg.text.split(" ");
      data.servers.push({ name, ip, port, version });
      save(data);
      bot.sendMessage(chatId, "✅ تم حفظ السيرفر");
    });
  }

  // لائحة السيرفرات
  if (q.data === "list") {
    if (data.servers.length === 0)
      return bot.sendMessage(chatId, "❌ ما كاين حتى سيرفر");

    const kb = data.servers.map((s, i) => [
      { text: s.name, callback_data: "srv_" + i }
    ]);

    bot.sendMessage(chatId, "📋 اختر سيرفر:", {
      reply_markup: { inline_keyboard: kb }
    });
  }

  // إدارة سيرفر
  if (q.data.startsWith("srv_")) {
    const id = q.data.split("_")[1];

    bot.sendMessage(chatId, "⚙️ تحكم فالبوت:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "▶️ تشغيل (ثابت)", callback_data: "run_stay_" + id }],
          [{ text: "🚶 تشغيل (مشي)", callback_data: "run_walk_" + id }],
          [{ text: "🦘 تشغيل (قفز)", callback_data: "run_jump_" + id }],
          [{ text: "⏹️ إيقاف", callback_data: "stop" }]
        ]
      }
    });
  }

  // تشغيل
  if (q.data.startsWith("run_")) {
    const [, mode, id] = q.data.split("_");
    const server = data.servers[id];
    startBots(server, 1, mode);
    bot.sendMessage(chatId, "🟢 البوت دخل للسيرفر");
  }

  // إيقاف
  if (q.data === "stop") {
    stopBots();
    bot.sendMessage(chatId, "🔴 تم إيقاف جميع البوتات");
  }
});
