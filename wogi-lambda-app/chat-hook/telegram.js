const TelegramBot = require('node-telegram-bot-api');
const User = require('./user').User;

const TOKEN = '720915328:AAENtjqp36A3JFK4WEAuOFjmi8kFF-uPTEA';
const bot = new TelegramBot(TOKEN, {polling: true});

// event.body looks something like this:
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

exports.handler = async (event, context) => {
  const body = JSON.parse(event.body)
  const messageText = body.message.text;
  const chatId = body.message.chat.id;

  if (!isValidOtp(messageText)) {
    await bot.sendMessage(chatId, "Please enter a valid OTP to register.");
    return {
      statusCode: 200,
      body: JSON.stringify({
        errors: [
          {
            message: "Invalid OTP given",
          },
        ],
      }),
    };
  }

  const otp = messageText;

  const user = await User.get({ otp });
  console.log("USER ID", user.id);

  await user.put({
    platform: 'telegram',
    chatId,
  })

  return {
    statusCode: 204,
  }
}

const isValidOtp = (messageText) => {
  return messageText.match(/^WOGI-REG.*/);
}