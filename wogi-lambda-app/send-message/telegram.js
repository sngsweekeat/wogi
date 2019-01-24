const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);

exports.handler = async ({
  messageDeliveryId, chatId, message, options, messageTitle, agencyId,
}) => {
  try {
    let keyboardButtons;
    if (options) {
      keyboardButtons = options.map(option => ({
        text: option,
        callback_data: JSON.stringify({ optionSelected: option, messageDeliveryId }),
      }));
    }
    const sendMessageOptions = {
      ...(keyboardButtons ? {
        reply_markup: {
          inline_keyboard: [keyboardButtons],
        },
      } : {}),
      parse_mode: 'HTML',
    };
    const finalMessage = `<i>From agency: ${agencyId}</i>\n<b>${messageTitle}</b>\n\n${message}`;
    const result = await bot.sendMessage(chatId, finalMessage, sendMessageOptions);
    console.log('Telegram result is: ', result);
    return 'SUCCESS';
  } catch (e) {
    if (e.response.statusCode >= 400 && e.response.statusCode < 500) {
      return 'FAIL';
    }
    throw e;
  }
};
