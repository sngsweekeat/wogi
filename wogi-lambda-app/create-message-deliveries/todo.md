for each event
	Get users from wogi-user based on nric
		Get user's chatId and platform
			save to message_deliveries table {
				user.platform, user.chatId, event.message
			}
