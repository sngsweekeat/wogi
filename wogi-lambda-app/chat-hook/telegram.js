const TelegramBot = require('node-telegram-bot-api');
const User = require('./user').User;

const TOKEN = '720915328:AAENtjqp36A3JFK4WEAuOFjmi8kFF-uPTEA';
const bot = new TelegramBot(TOKEN);

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
  try {
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
    const user = await User.queryOne('otp').eq(otp).exec();

    if (!user) {
      await bot.sendMessage(chatId, "We couldn't find a user associated with the given OTP. Please try and generate a new one");

      return {
        statusCode: 200,
        body: JSON.stringify({
          errors: [
            {
              message: 'Could not find a user associated with the given OTP.'
            }
          ]
        })
      }
    }

    user.platform = "TELEGRAM";
    user.chatId = chatId;
    await user.save()
    await bot.sendMessage(chatId, "You have successfully registered with Wogi on Telegram!");

    return {
      statusCode: 204,
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
    }
  }
}

const isValidOtp = (messageText) => {
  return messageText.match(/^WOGI-REG.*/);
}