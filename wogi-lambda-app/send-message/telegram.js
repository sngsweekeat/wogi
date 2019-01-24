const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);

exports.handler = (chatId, message) => {
    result = await bot.sendMessage(chatId, message);
    console.log("Telegram result is: ", result);
    return deliveryStatus = "SUCCESS";
}