/**
 * rasaServices.js
 *
 * This file contains service functions for communicating with the RASA backend
 * for the pain chatbot functionality and for retrieving pain data for visualization.
 */

// Base URL for RASA API - can be configured in environment.js
const RASA_BASE_URL = process.env.RASA_HOST || 'http://localhost:5005';

// Base URL for our own backend API
const API_BASE_URL = process.env.API_HOST || 'http://localhost:3000';

/**
 * Send a message to the RASA chatbot and get a response
 *
 * @param {string} message - The user's message to send to the chatbot
 * @param {string} senderId - Optional sender ID for conversation tracking
 * @returns {Promise<Array>} - Array of bot response messages
 */
export const sendMessage = async (message, senderId = 'default-user') => {
	try {
		const response = await fetch(`${RASA_BASE_URL}/webhooks/rest/webhook`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				sender: senderId,
				message: message,
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error sending message to RASA:', error);
		// Return a default error message as a fallback
		return [
			{
				recipient_id: senderId,
				text: "I'm sorry, I'm having trouble connecting to the server. Please try again later.",
			},
		];
	}
};

/**
 * Get a model status from the RASA server
 *
 * @returns {Promise<Object>} - The model status information
 */
export const getModelStatus = async () => {
	try {
		const response = await fetch(`${RASA_BASE_URL}/status`);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error checking RASA model status:', error);
		throw error;
	}
};

/**
 * Get pain data from the backend API
 *
 * @param {Date} startDate - The start date for the data query
 * @param {Date} endDate - The end date for the data query
 * @param {string} userId - The user ID (optional)
 * @returns {Promise<Array>} - Array of pain data entries
 */
export const getPainData = async (
	startDate,
	endDate,
	userId = 'default-user'
) => {
	try {
		// Format dates for the API
		const formattedStartDate = startDate.toISOString().split('T')[0];
		const formattedEndDate = endDate.toISOString().split('T')[0];

		const response = await fetch(
			`${API_BASE_URL}/api/pain-data?startDate=${formattedStartDate}&endDate=${formattedEndDate}&userId=${userId}`
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching pain data:', error);
		throw error;
	}
};

/**
 * Save pain data to the backend API
 *
 * @param {Object} painData - The pain data to save
 * @param {string} userId - The user ID (optional)
 * @returns {Promise<Object>} - The saved pain data entry
 */
export const savePainData = async (painData, userId = 'default-user') => {
	try {
		const response = await fetch(`${API_BASE_URL}/api/pain-data`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				userId,
				...painData,
				timestamp: new Date().toISOString(),
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error saving pain data:', error);
		throw error;
	}
};

/**
 * Get pain data summary statistics
 *
 * @param {string} timeframe - The timeframe for the summary (e.g., 'week', 'month', 'year')
 * @param {string} userId - The user ID (optional)
 * @returns {Promise<Object>} - Summary statistics object
 */
export const getPainDataSummary = async (
	timeframe = 'month',
	userId = 'default-user'
) => {
	try {
		const response = await fetch(
			`${API_BASE_URL}/api/pain-data/summary?timeframe=${timeframe}&userId=${userId}`
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching pain data summary:', error);
		throw error;
	}
};

/**
 * Export pain data as CSV
 *
 * @param {Date} startDate - The start date for the data export
 * @param {Date} endDate - The end date for the data export
 * @param {string} userId - The user ID (optional)
 * @returns {Promise<Blob>} - CSV file as a Blob
 */
export const exportPainDataCsv = async (
	startDate,
	endDate,
	userId = 'default-user'
) => {
	try {
		// Format dates for the API
		const formattedStartDate = startDate.toISOString().split('T')[0];
		const formattedEndDate = endDate.toISOString().split('T')[0];

		const response = await fetch(
			`${API_BASE_URL}/api/pain-data/export/csv?startDate=${formattedStartDate}&endDate=${formattedEndDate}&userId=${userId}`
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const blob = await response.blob();
		return blob;
	} catch (error) {
		console.error('Error exporting pain data as CSV:', error);
		throw error;
	}
};

/**
 * Export pain data as PDF
 *
 * @param {Date} startDate - The start date for the data export
 * @param {Date} endDate - The end date for the data export
 * @param {string} userId - The user ID (optional)
 * @returns {Promise<Blob>} - PDF file as a Blob
 */
export const exportPainDataPdf = async (
	startDate,
	endDate,
	userId = 'default-user'
) => {
	try {
		// Format dates for the API
		const formattedStartDate = startDate.toISOString().split('T')[0];
		const formattedEndDate = endDate.toISOString().split('T')[0];

		const response = await fetch(
			`${API_BASE_URL}/api/pain-data/export/pdf?startDate=${formattedStartDate}&endDate=${formattedEndDate}&userId=${userId}`
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const blob = await response.blob();
		return blob;
	} catch (error) {
		console.error('Error exporting pain data as PDF:', error);
		throw error;
	}
};
