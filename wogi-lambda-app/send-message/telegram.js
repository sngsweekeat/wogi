const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);

exports.handler = async (chatId, message) => {
  try {
    const result = await bot.sendMessage(chatId, message);
    console.log('Telegram result is: ', result);
    return 'SUCCESS';
  } catch (e) {
    if (e.response.statusCode >= 400 && e.response.statusCode < 500) {
      return 'FAIL';
    }
    throw e;
  }
};
