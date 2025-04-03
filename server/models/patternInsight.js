const mongoose = require('mongoose');

const PatternInsightSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	type: {
		type: String,
		enum: ['correlation', 'timePattern', 'medication', 'trigger'],
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	metrics: [String],
	confidence: {
		type: Number,
		min: 0,
		max: 1,
		required: true,
	},
	data: mongoose.Schema.Types.Mixed,
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('PatternInsight', PatternInsightSchema);
