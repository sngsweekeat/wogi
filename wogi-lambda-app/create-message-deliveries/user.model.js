const dynamoose = require("dynamoose");

module.exports = function User() {

	const options = {
		create: false, // Create table in DB, if it does not exist,
		update: true, // Update remote indexes if they do not match local index structure
	}

	const userSchema = new dynamoose.Schema({
		id: {
			type: String,
			hashKey: true,
		},
		otp: {
			type: String,
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

	const User = dynamoose.model('wogi-users', userSchema, options);
	return User;
}
