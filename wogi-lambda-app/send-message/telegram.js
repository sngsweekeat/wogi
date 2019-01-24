const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);

exports.handler = async (messageDeliveryId, chatId, message) => {
  try {
    const callbackData = {
      optionSelected: 'Yes',
      messageDeliveryId,
    };
    const options = {
      reply_markup: {
        inline_keyboard: [[
          { text: 'Yes', callback_data: JSON.stringify(callbackData) },
          { text: 'No', callback_data: JSON.stringify(callbackData) },
        ]],
      },
    };
    const result = await bot.sendMessage(chatId, message, options);
    console.log('Telegram result is: ', result);
    return 'SUCCESS';
  } catch (e) {
    if (e.response.statusCode >= 400 && e.response.statusCode < 500) {
      return 'FAIL';
    }
    throw e;
  }
};
