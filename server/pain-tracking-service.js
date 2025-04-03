// server/pain-tracking-service.js
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
const result = dotenv.config({ path: path.join(__dirname, '.env') });
if (result.error) {
	console.error('Error loading .env file:', result.error);
}
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('./config/logger');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Import models
const User = require('./models/user');
const PainEntry = require('./models/painEntry');
const Journal = require('./models/journal');
const Reminder = require('./models/reminder');

// Import services

// API Routes

// ----- Tracking Preferences -----
app.post('/api/tracking-preferences', async (req, res) => {
    try {
        const { category, frequency, time, userId } = req.body;
        
        // Validate required fields
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Category is required',
            });
        }
        
        // Set default user ID if not provided
        const userIdToUse = userId || 'default_user';
        
        // Store preferences in a simple format (in a real app, you'd save to database)
        // This is a basic in-memory implementation
        if (!global.trackingPreferences) {
            global.trackingPreferences = [];
        }
        
        // Check if this category already exists
        const existingIndex = global.trackingPreferences.findIndex(
            pref => pref.category === category && pref.userId === userIdToUse
        );
        
        if (existingIndex >= 0) {
            // Update existing preference
            global.trackingPreferences[existingIndex] = {
                category,
                frequency: frequency || global.trackingPreferences[existingIndex].frequency,
                time: time || global.trackingPreferences[existingIndex].time,
                userId: userIdToUse,
                updatedAt: new Date().toISOString()
            };
        } else {
            // Add new preference
            global.trackingPreferences.push({
                category,
                frequency: frequency || 'daily',
                time: time || '9am',
                userId: userIdToUse,
                createdAt: new Date().toISOString()
            });
        }
        
        logger.info(`Tracking preference saved for ${category}`);
        res.status(201).json({
            success: true,
            message: `Tracking preference saved for ${category}`
        });
    } catch (error) {
        logger.error(`Error saving tracking preference: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get tracking preferences
app.get('/api/tracking-preferences', async (req, res) => {
    try {
        const { userId } = req.query;
        const userIdToUse = userId || 'default_user';
        
        // Get preferences for this user
        const preferences = global.trackingPreferences?.filter(
            pref => pref.userId === userIdToUse
        ) || [];
        
        res.json({ 
            success: true, 
            preferences 
        });
    } catch (error) {
        logger.error(`Error fetching tracking preferences: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Non-API paths for compatibility
app.post('/tracking-preferences', (req, res) => {
    req.url = '/api/tracking-preferences';
    app._router.handle(req, res);
});

app.get('/tracking-preferences', (req, res) => {
    req.url = '/api/tracking-preferences';
    app._router.handle(req, res);
});

// ----- Users -----

// Get user settings
app.get('/api/users/:userId/settings', async (req, res) => {
	try {
		const { userId } = req.params;

		const user = await User.findById(userId);
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: 'User not found' });
		}

		res.json(user.settings);
	} catch (error) {
		logger.error(`Error getting user settings: ${error.message}`);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Update user settings
app.patch('/api/users/:userId/settings', async (req, res) => {
	try {
		const { userId } = req.params;
		const { settings } = req.body;

		if (!settings) {
			return res
				.status(400)
				.json({ success: false, message: 'Settings data is required' });
		}

		const user = await User.findById(userId);
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: 'User not found' });
		}

		// Update only the provided settings
		if (settings.reminderEnabled !== undefined) {
			user.settings.reminderEnabled = settings.reminderEnabled;
		}

		if (settings.reminderTimes) {
			user.settings.reminderTimes = settings.reminderTimes;
		}

		if (settings.trackingMetrics) {
			for (const [metric, value] of Object.entries(settings.trackingMetrics)) {
				user.settings.trackingMetrics[metric] = value;
			}
		}

		if (settings.accessibilityPreferences) {
			for (const [pref, value] of Object.entries(
				settings.accessibilityPreferences
			)) {
				user.settings.accessibilityPreferences[pref] = value;
			}
		}

		await user.save();

		res.json({ success: true, settings: user.settings });
	} catch (error) {
		logger.error(`Error updating user settings: ${error.message}`);
		res.status(500).json({ success: false, message: error.message });
	}
});

// ----- Track Entries -----

// ----- Journal Entries -----

// Create new journal entry
app.post('/api/journal', async (req, res) => {
	try {
		const { userId, type, content, timestamp, tags, eventType } = req.body;

		// Validate required fields - content is the only absolutely required field
		if (!content) {
			return res.status(400).json({
				success: false,
				message: 'Content is required',
			});
		}

		// Set default user ID if not provided
		const userIdToUse = userId || 'default_user';

		// Check if user exists (only if not using default_user)
		if (userId && userId !== 'default_user') {
			const user = await User.findById(userId);
			if (!user) {
				return res
					.status(404)
					.json({ success: false, message: 'User not found' });
			}
		}

		// Create journal entry (with more flexible fields)
		const journal = new Journal({
			userId: userIdToUse,
			type: type || 'experience', // Default type is experience
			title: req.body.title || 'Journal Entry', // Optional title
			content,
			timestamp: timestamp || new Date(),
			tags: tags || [],
			eventType: eventType, // Only used for event type entries
		});

		await journal.save();
		logger.info(`New journal entry created: ${journal._id}`);

		res.status(201).json({ success: true, journal });
	} catch (error) {
		logger.error(`Error creating journal entry: ${error.message}`);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Get journal entries (update to allow more flexible filtering)
app.get('/api/journal', async (req, res) => {
	try {
		const { userId, limit, type, startDate, endDate, searchTerm } = req.query;

		// Build query
		const query = {};

		// Add userId filter if provided
		if (userId) {
			query.userId = userId;
		}

		// Add type filter if provided
		if (type && type !== 'all') {
			query.type = type;
		}

		// Add date range filter
		if (startDate || endDate) {
			query.timestamp = {};

			if (startDate) {
				query.timestamp.$gte = new Date(startDate);
			}

			if (endDate) {
				const endDateTime = new Date(endDate);
				endDateTime.setHours(23, 59, 59, 999); // End of day
				query.timestamp.$lte = endDateTime;
			}
		}

		// Add text search if provided
		if (searchTerm) {
			query.$or = [
				{ content: { $regex: searchTerm, $options: 'i' } },
				{ title: { $regex: searchTerm, $options: 'i' } },
				{ tags: { $in: [new RegExp(searchTerm, 'i')] } },
			];
		}

		// Execute query
		let journalQuery = Journal.find(query).sort({ timestamp: -1 });

		if (limit) {
			journalQuery = journalQuery.limit(parseInt(limit));
		}

		const journals = await journalQuery.exec();

		res.json({ success: true, journals });
	} catch (error) {
		logger.error(`Error fetching journal entries: ${error.message}`);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Keep the original endpoint for backward compatibility
app.get('/api/journal/:userId', async (req, res) => {
	try {
		const { userId } = req.params;
		const { limit } = req.query;

		// Execute query
		let journalQuery = Journal.find({ userId }).sort({ timestamp: -1 });

		if (limit) {
			journalQuery = journalQuery.limit(parseInt(limit));
		}

		const journals = await journalQuery.exec();

		res.json({ success: true, journals });
	} catch (error) {
		logger.error(`Error fetching journal entries: ${error.message}`);
		res.status(500).json({ success: false, message: error.message });
	}
});

// ----- Insights -----

// Get insights for a user
app.get('/api/insights/:userId', async (req, res) => {
	try {
		const { userId } = req.params;
		const { regenerate } = req.query;

		if (regenerate === 'true') {
			// Generate new insights
			const insightResults = await patternDetectionService.generateInsights(
				userId
			);
			return res.json(insightResults);
		}

		// Get stored insights
		const insights = await PatternInsight.find({ userId })
			.sort({ confidence: -1, createdAt: -1 })
			.exec();

		if (insights.length === 0) {
			// No stored insights, generate new ones
			const insightResults = await patternDetectionService.generateInsights(
				userId
			);
			return res.json(insightResults);
		}

		res.json({ success: true, insights });
	} catch (error) {
		logger.error(`Error fetching insights: ${error.message}`);
		res.status(500).json({ success: false, message: error.message });
	}
});

// ----- Reminders -----

// Create new reminder
app.post('/api/reminders', async (req, res) => {
	try {
		const { userId, timeOfDay, message, isActive } = req.body;

		// Validate required fields
		if (!userId || !timeOfDay) {
			return res.status(400).json({
				success: false,
				message: 'User ID and time of day are required',
			});
		}

		// Validate time of day
		if (!['morning', 'noon', 'evening'].includes(timeOfDay)) {
			return res.status(400).json({
				success: false,
				message: 'Time of day must be morning, noon, or evening',
			});
		}

		// Check if user exists
		const user = await User.findById(userId);
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: 'User not found' });
		}

		// Create reminder
		const reminder = new Reminder({
			userId,
			timeOfDay,
			message: message || 'Time to track your pain levels!',
			isActive: isActive !== undefined ? isActive : true,
		});

		await reminder.save();

		res.status(201).json({ success: true, reminder });
	} catch (error) {
		logger.error(`Error creating reminder: ${error.message}`);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Get reminders for a user
app.get('/api/reminders/:userId', async (req, res) => {
	try {
		const { userId } = req.params;

		const reminders = await Reminder.find({ userId })
			.sort({ timeOfDay: 1 })
			.exec();

		res.json({ success: true, reminders });
	} catch (error) {
		logger.error(`Error fetching reminders: ${error.message}`);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Update reminder
app.patch('/api/reminders/:reminderId', async (req, res) => {
	try {
		const { reminderId } = req.params;
		const { timeOfDay, message, isActive } = req.body;

		const reminder = await Reminder.findById(reminderId);
		if (!reminder) {
			return res
				.status(404)
				.json({ success: false, message: 'Reminder not found' });
		}

		// Update fields if provided
		if (timeOfDay && ['morning', 'noon', 'evening'].includes(timeOfDay)) {
			reminder.timeOfDay = timeOfDay;
		}

		if (message) {
			reminder.message = message;
		}

		if (isActive !== undefined) {
			reminder.isActive = isActive;
		}

		await reminder.save();

		res.json({ success: true, reminder });
	} catch (error) {
		logger.error(`Error updating reminder: ${error.message}`);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Delete reminder
app.delete('/api/reminders/:reminderId', async (req, res) => {
	try {
		const { reminderId } = req.params;

		const result = await Reminder.findByIdAndDelete(reminderId);
		if (!result) {
			return res
				.status(404)
				.json({ success: false, message: 'Reminder not found' });
		}

		res.json({ success: true, message: 'Reminder deleted successfully' });
	} catch (error) {
		logger.error(`Error deleting reminder: ${error.message}`);
		res.status(500).json({ success: false, message: error.message });
	}
});

// ----- Debugging Endpoints -----

// GET /debug/test - Simple endpoint for testing
app.get('/debug/test', (req, res) => {
    res.json({
        success: true,
        message: 'Debug test endpoint is working!',
        timestamp: new Date().toISOString(),
        serverInfo: {
            platform: process.platform,
            nodeVersion: process.version,
            uptime: process.uptime()
        }
    });
});

// GET /entries - Test endpoint for visualization
app.get('/entries', (req, res) => {
    // Return sample data for testing
    const mockData = {
        success: true,
        entries: [
            {
                category: 'pain',
                severity: 3,
                timestamp: new Date().toISOString(),
                userId: 'default_user'
            },
            {
                category: 'fatigue',
                severity: 4,
                timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                userId: 'default_user'
            },
            {
                category: 'pain',
                severity: 2,
                timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                userId: 'default_user'
            },
            {
                category: 'sleep',
                severity: 3,
                timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
                userId: 'default_user'
            }
        ]
    };
    
    res.json(mockData);
});

// GET /api/entries - Alias for /entries
app.get('/api/entries', (req, res) => {
    req.url = '/entries';
    app._router.handle(req, res);
});

// ----- Statistics -----

// Get statistics for a user's pain data
app.get('/api/statistics/:userId', async (req, res) => {
	try {
		const { userId } = req.params;
		const { period } = req.query;

		// Determine date range based on period
		const endDate = new Date();
		let startDate = new Date();

		switch (period) {
			case 'week':
				startDate.setDate(endDate.getDate() - 7);
				break;
			case 'month':
				startDate.setMonth(endDate.getMonth() - 1);
				break;
			case '3months':
				startDate.setMonth(endDate.getMonth() - 3);
				break;
			case 'year':
				startDate.setFullYear(endDate.getFullYear() - 1);
				break;
			default:
				// Default to last 30 days
				startDate.setDate(endDate.getDate() - 30);
		}

		const startDateStr = startDate.toISOString().split('T')[0];
		const endDateStr = endDate.toISOString().split('T')[0];

		// Get pain entries for the period
		const entries = await PainEntry.find({
			userId,
			date: { $gte: startDateStr, $lte: endDateStr },
		})
			.sort({ date: 1, time: 1 })
			.lean();

		if (entries.length === 0) {
			return res.json({
				success: true,
				message: 'No data available for the selected period',
				statistics: null,
			});
		}

		// Calculate statistics
		const painValues = entries
			.map((entry) => entry.metrics.painMagnitude)
			.filter((val) => val != null);
		const moodValues = entries
			.map((entry) => entry.metrics.moodLevel)
			.filter((val) => val != null);
		const sleepHoursValues = entries
			.map((entry) => entry.metrics.sleepHours)
			.filter((val) => val != null);

		// Helper function to calculate statistics
		const calculateStats = (values) => {
			if (values.length === 0) return null;

			const sum = values.reduce((acc, val) => acc + val, 0);
			const avg = sum / values.length;
			const min = Math.min(...values);
			const max = Math.max(...values);

			return {
				count: values.length,
				min,
				max,
				avg,
				median: values.sort()[Math.floor(values.length / 2)],
			};
		};

		// Group by time of day
		const timeOfDayGroups = {
			morning: { values: [] },
			noon: { values: [] },
			evening: { values: [] },
			night: { values: [] },
		};

		entries.forEach((entry) => {
			if (entry.timeOfDay && entry.metrics.painMagnitude != null) {
				timeOfDayGroups[entry.timeOfDay].values.push(
					entry.metrics.painMagnitude
				);
			}
		});

		// Calculate time of day averages
		const timeOfDayStats = {};
		for (const [time, data] of Object.entries(timeOfDayGroups)) {
			timeOfDayStats[time] = calculateStats(data.values);
		}

		// Create time series data for visualizations
		const timeSeriesData = entries.map((entry) => ({
			date: entry.date,
			time: entry.time,
			painMagnitude: entry.metrics.painMagnitude,
			moodLevel: entry.metrics.moodLevel,
			timeOfDay: entry.timeOfDay,
		}));

		// Calculate medication usage statistics
		const medicationCounts = {
			opioid: entries.filter((e) => e.medications.opioid).length,
			prescription: entries.filter((e) => e.medications.prescription).length,
			nonPrescription: entries.filter((e) => e.medications.nonPrescription)
				.length,
			total: entries.filter(
				(e) =>
					e.medications.opioid ||
					e.medications.prescription ||
					e.medications.nonPrescription
			).length,
		};

		const statistics = {
			period: {
				start: startDateStr,
				end: endDateStr,
				totalDays: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
			},
			entriesCount: entries.length,
			pain: calculateStats(painValues),
			mood: calculateStats(moodValues),
			sleepHours: calculateStats(sleepHoursValues),
			timeOfDay: timeOfDayStats,
			medications: medicationCounts,
			timeSeriesData,
		};

		res.json({
			success: true,
			statistics,
		});
	} catch (error) {
		logger.error(`Error calculating statistics: ${error.message}`);
		res.status(500).json({ success: false, message: error.message });
	}
});

// Start the server
app.listen(PORT, () => {
	logger.info(`Server running on port ${PORT}`);
});

module.exports = app;
