const mineflayer = require("mineflayer");

let activeBots = [];

function startBots(server, count, mode) {
  for (let i = 0; i < count; i++) {
    const username = `AFK_${Math.floor(Math.random() * 9999)}`;

    const bot = mineflayer.createBot({
      host: server.ip,
      port: server.port,
      username,
      version: server.version
    });

    bot.once("spawn", () => {
      console.log(`✅ ${username} دخل للسيرفر`);

      if (mode === "walk") {
        setInterval(() => {
          bot.setControlState("forward", true);
          setTimeout(() => bot.setControlState("forward", false), 1000);
        }, 3000);
      }

      if (mode === "jump") {
        setInterval(() => {
          bot.setControlState("jump", true);
          setTimeout(() => bot.setControlState("jump", false), 500);
        }, 4000);
      }
    });

    bot.on("end", () => {
      console.log(`❌ ${username} خرج`);
    });

    bot.on("error", err => console.log("BOT ERROR:", err));

    activeBots.push(bot);
  }
}

function stopBots() {
  activeBots.forEach(bot => bot.quit());
  activeBots = [];
}

module.exports = { startBots, stopBots };
