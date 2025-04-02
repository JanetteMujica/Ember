const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	settings: {
		reminderEnabled: {
			type: Boolean,
			default: true,
		},
		reminderTimes: {
			type: [String], // ["morning", "noon", "evening"]
			default: ['morning'],
		},
		trackingMetrics: {
			moodLevel: {
				type: Boolean,
				default: true,
			},
			painMagnitude: {
				type: Boolean,
				default: true,
			},
			sleepQuality: {
				type: Boolean,
				default: true,
			},
			sleepHours: {
				type: Boolean,
				default: true,
			},
			activityInterference: {
				type: Boolean,
				default: true,
			},
			alertnessLevel: {
				type: Boolean,
				default: true,
			},
			medications: {
				type: Boolean,
				default: true,
			},
		},
		accessibilityPreferences: {
			textSize: {
				type: String,
				enum: ['small', 'medium', 'large'],
				default: 'medium',
			},
			highContrast: {
				type: Boolean,
				default: false,
			},
			readAloud: {
				type: Boolean,
				default: false,
			},
		},
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('User', UserSchema);
