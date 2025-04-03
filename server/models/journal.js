// server/models/journal.js

const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
			default: 'default_user',
		},
		type: {
			type: String,
			enum: ['experience', 'event', 'journal'],
			required: true,
			default: 'experience',
		},
		title: {
			type: String,
			default: 'Journal Entry',
		},
		content: {
			type: String,
			required: true,
		},
		timestamp: {
			type: Date,
			default: Date.now,
		},
		tags: {
			type: [String],
			default: [],
		},
		eventType: {
			type: String,
			enum: ['medication_change', 'new_symptom', 'other'],
			required: function () {
				return this.type === 'event';
			},
		},
	},
	{
		timestamps: true, // Adds createdAt and updatedAt fields
	}
);

// Add indexes for better query performance
journalSchema.index({ timestamp: -1 });
journalSchema.index({ userId: 1 });
journalSchema.index({ type: 1 });
journalSchema.index({ tags: 1 });
journalSchema.index({ content: 'text', title: 'text' });

const Journal = mongoose.model('Journal', journalSchema);

module.exports = Journal;
