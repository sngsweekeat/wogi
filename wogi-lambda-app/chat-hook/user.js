const dynamoose = require('dynamoose');

const modelOptions = {
    create: false,
    update: true,
};
const userSchema = new dynamoose.Schema({
    id: {
        type: String,
        hashKey: true,
    },
    otp: {
        type: String,
        index: {
            global: true,
            project: true,
        },
    },
    platform: {
        type: String,
    },
    chatId: {
        type: String,
    },
}, {
    timestamps: true,
});

exports.User = dynamoose.model('wogi-users', userSchema, modelOptions);

