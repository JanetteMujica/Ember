const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	timeOfDay: {
		type: String,
		enum: ['morning', 'noon', 'evening'],
		required: true,
	},
	message: {
		type: String,
		required: true,
	},
	isActive: {
		type: Boolean,
		default: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('Reminder', ReminderSchema);
