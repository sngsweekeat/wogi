const dynamoose = require("dynamoose");

module.exports = function User() {

	const options = {
		create: false, // Create table in DB, if it does not exist,
		update: false, // Update remote indexes if they do not match local index structure
	}

	const userSchema = new dynamoose.Schema({
		id: {
			type: String,
			hashKey: true,
		},
		createdAt: {
			type: Number,
		},
		otp: {
			type: String,
		},
		updatedAt: {
			type: Number,
		}
	});
	const User = dynamoose.model('wogi-users', userSchema, options);
	return User;
}
