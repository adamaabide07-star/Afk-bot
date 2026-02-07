const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const { startBots, stopBots } = require("./mcBot");

const TOKEN = process.env.BOT_TOKEN; // مهم
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
  console.log("🤖 Bot running...");
}, 30000);

bot.onText(/\/start/, msg => {
  bot.sendMessage(msg.chat.id, "🤖 Minecraft AFK Bot", {
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

  if (q.data === "add") {
    bot.sendMessage(chatId,
      "أرسل:\nname ip port version\nمثال:\ntest play.example.com 25565 1.20.1"
    );

    bot.once("message", msg => {
      const [name, ip, port, version] = msg.text.split(" ");
      data.servers.push({ name, ip, port, version });
      save(data);
      bot.sendMessage(chatId, "✅ تم إضافة السيرفر");
    });
  }

  if (q.data === "list") {
    const kb = data.servers.map((s, i) => [
      { text: s.name, callback_data: "srv_" + i }
    ]);

    bot.sendMessage(chatId, "اختر:", {
      reply_markup: { inline_keyboard: kb }
    });
  }

  if (q.data.startsWith("srv_")) {
    const id = q.data.split("_")[1];

    bot.sendMessage(chatId, "اختر الوضع:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "▶️ ثابت", callback_data: "run_stay_" + id }],
          [{ text: "🚶 مشي", callback_data: "run_walk_" + id }],
          [{ text: "🦘 قفز", callback_data: "run_jump_" + id }],
          [{ text: "⏹️ إيقاف", callback_data: "stop" }]
        ]
      }
    });
  }

  if (q.data.startsWith("run_")) {
    const [, mode, id] = q.data.split("_");
    const server = data.servers[id];
    startBots(server, 1, mode);
    bot.sendMessage(chatId, "🟢 البوت تشغل");
  }

  if (q.data === "stop") {
    stopBots();
    bot.sendMessage(chatId, "🔴 توقف");
  }
});
