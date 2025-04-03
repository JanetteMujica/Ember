// server/config/db.js
const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
	try {
		const mongoURI = process.env.MONGO_URI;

		// Check if URI is defined
		if (!mongoURI) {
			throw new Error(
				'MongoDB connection string is not defined. Please check your .env file.'
			);
		}

		// Log that we're attempting to connect
		console.log('Attempting to connect to MongoDB...');

		const conn = await mongoose.connect(mongoURI);
		logger.info(`MongoDB Connected: ${conn.connection.host}`);
		return conn;
	} catch (error) {
		logger.error(`Error connecting to MongoDB: ${error.message}`);
		// Don't exit the process, just log the error
		// process.exit(1);
		throw error;
	}
};

module.exports = connectDB;
