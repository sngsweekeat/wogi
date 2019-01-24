const TelegramBot = require('node-telegram-bot-api');
const { User } = require('./user');
const { MessageDelivery } = require('./message-delivery.model');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);

const isValidOtp = messageText => messageText.match(/^WOGI-REG.*/);

// For a normal message, event.body looks something like this:
// {
//     "update_id": 540942475,
//     "message": {
//         "message_id": 50,
//         "from": {
//             "id": <chatid>,
//             "is_bot": false,
//             "first_name": "<User's display name>",
//             "username": "<username>",
//             "language_code": "en"
//         },
//         "chat": {
//             "id": <chatid>,
//             "first_name": "<User's display name>",
//             "username": "<username>",
//             "type": "private"
//         },
//         "date": 1548210285,
//         "text": "<message text>"
//     }
// }

const handleMessage = async (message) => {
  const messageText = message.text;
  const chatId = message.chat.id;

  let user;
  user = await User.queryOne('chatId').eq(chatId).exec();

  if (user) {
    await bot.sendMessage(chatId, 'It looks like you\'ve already registered for Notifications.sg. You\'re already able to receive notifications for government agencies through Telegram.');

    return {
      statusCode: 204,
    };
  }

  if (!isValidOtp(messageText)) {
    await bot.sendMessage(chatId, 'Please enter a valid OTP to register.');
    return {
      statusCode: 200,
      body: JSON.stringify({
        errors: [
          {
            message: 'Invalid OTP given',
          },
        ],
      }),
    };
  }

  const otp = messageText;
  user = await User.queryOne('otp').eq(otp).exec();

  if (!user) {
    await bot.sendMessage(chatId, "We couldn't find a user associated with the given OTP. Please try and generate a new one");

    return {
      statusCode: 200,
      body: JSON.stringify({
        errors: [
          {
            message: 'Could not find a user associated with the given OTP.',
          },
        ],
      }),
    };
  }

  user.platform = 'TELEGRAM';
  user.chatId = chatId;
  await user.save();
  await bot.sendMessage(chatId, 'You have successfully registered with Wogi on Telegram!');

  return {
    statusCode: 204,
  };
};

// For a callback query, event.body looks something like this:
// {
//   "update_id": 540942564,
//   "callback_query": {
//     "id": "1212848847398988314",
//     "from": {
//       "id": 282388377,
//       "is_bot": false,
//       "first_name": "Jun Qi (she/her)",
//       "username": "tjjjwxzq",
//       "language_code": "en"
//     },
//     "message": {
//       "message_id": 233,
//       "from": [
//         null
//       ],
//       "chat": [
//         null
//       ],
//       "date": 1548311835,
//       "text": "Hello from WOGI"
//     },
//     "chat_instance": "5261849522625467999",
//     "data": "7abcfe40-1fa2-11e9-a3dd-7fdc84f60b52"
//   }
// }

const handleCallbackQuery = async (callbackQuery) => {
  const { data, from, message } = callbackQuery;
  const { optionSelected, messageDeliveryId } = JSON.parse(data);
  const chatId = from.id;

  console.log('FETCHING MESSAGE DELIVERY');
  const messageDelivery = await MessageDelivery.get(messageDeliveryId);

  if (!messageDelivery) {
    const result = await bot.sendMessage(chatId, `Something went wrong with handling the reply to the message: ${message.text}`);
    console.log('Telegram sendMessage result', result);

    return {
      statusCode: 200,
      body: JSON.stringify({
        errors: [
          {
            message: `Message delivery not found for message delivery id: ${messageDeliveryId}`,
          },
        ],
      }),
    };
  }

  if (messageDelivery.responseStatus && messageDelivery.responseStatus !== 'PENDING') {
    const result = await bot.sendMessage(chatId, 'You have already responded to this option, don\'t guai lan:)');
    console.log('Telegram sendMessage result', result);
    return {
      statusCode: 204,
    };
  }
  messageDelivery.responseStatus = optionSelected;
  await messageDelivery.save();

  const result = await bot.sendMessage(chatId, 'Thank you! Your response has been sent to the agency');
  console.log('Telegram sendMessage result', result);

  return {
    statusCode: 204,
  };
};

exports.handler = async (event) => {
  try {
    console.log('EVENT HANDLED BY TELEGRAM', event);
    const body = JSON.parse(event.body);
    console.log('EVENT BODY HANDLED BY TELEGRAM', body);

    if (body.message) {
      return await handleMessage(body.message);
    }

    if (body.callback_query) {
      return await handleCallbackQuery(body.callback_query);
    }
  } catch (e) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        errors: [
          {
            message: `Someting went wrong: ${e.message}`,
          },
        ],
      }),
    };
  }
};
