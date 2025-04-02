const mongoose = require('mongoose');

const PainEntrySchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
	date: {
		type: String, // YYYY-MM-DD format for easier querying
		required: true,
	},
	time: {
		type: String, // HH:MM format
		required: true,
	},
	timeOfDay: {
		type: String,
		enum: ['morning', 'noon', 'evening', 'night'],
		required: true,
	},
	metrics: {
		moodLevel: {
			type: Number, // 1-10 scale
			min: 1,
			max: 10,
		},
		painMagnitude: {
			type: Number, // 1-10 scale
			min: 1,
			max: 10,
		},
		sleepQuality: {
			type: String,
			enum: ['poor', 'fair', 'average', 'good', 'excellent'],
		},
		sleepHours: {
			type: Number,
			min: 0,
			max: 24,
		},
		activityInterference: {
			type: Number, // 1-10 scale
			min: 1,
			max: 10,
		},
		alertnessLevel: {
			type: Number, // 1-10 scale
			min: 1,
			max: 10,
		},
	},
	medications: {
		opioid: {
			type: Boolean,
			default: false,
		},
		prescription: {
			type: Boolean,
			default: false,
		},
		nonPrescription: {
			type: Boolean,
			default: false,
		},
		medicationNotes: String,
	},
	journalEntry: String,
});

module.exports = mongoose.model('PainEntry', PainEntrySchema);
