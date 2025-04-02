// frontend/src/services/rasaServices.js

/**
 * Service for interacting with the Rasa chatbot
 */

// Rasa server URL with fallback options
const RASA_URL = 'http://localhost:5005'; // Main Rasa server URL
const FALLBACK_URLS = ['http://127.0.0.1:5005']; // Fallback URLs to try if main URL fails

// Flag to track if we're using a fallback URL
let currentUrlIndex = -1; // -1 means we're using the main URL

/**
 * Send a message to the Rasa chatbot and get a response
 * @param {string} message - The message to send
 * @param {string} senderId - Unique ID for the user session
 * @returns {Promise<Array>} - Array of bot responses
 */
export const sendMessage = async (message, senderId = 'default') => {
	// Get the current URL to use
	let currentUrl = currentUrlIndex === -1 ? RASA_URL : FALLBACK_URLS[currentUrlIndex];
	
	try {
		console.log(`Attempting to send message to Rasa at ${currentUrl}/webhooks/rest/webhook`);
		console.log(`Using URL index: ${currentUrlIndex}`);

		// Create the request body
		const requestBody = JSON.stringify({
			sender: senderId,
			message: message,
		});

		console.log('Request body:', requestBody);

		// Make the fetch request with a timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
		
		const response = await fetch(`${currentUrl}/webhooks/rest/webhook`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: requestBody,
			signal: controller.signal
		});
		
		clearTimeout(timeoutId);

		console.log('Response status:', response.status);

		// If response is not OK, throw an error
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		// Parse the JSON response
		const text = await response.text();
		console.log('Raw response text:', text);

		// Reset to main URL if we were using a fallback and it worked
		if (currentUrlIndex !== -1) {
			console.log('Resetting to main URL since fallback worked');
			currentUrlIndex = -1;
		}

		let data;
		try {
			data = JSON.parse(text);
			console.log('Parsed data:', data);
		} catch (parseError) {
			console.error('Error parsing JSON:', parseError);
			throw new Error('Invalid JSON response');
		}

		// If we got an empty array, send a default response
		if (Array.isArray(data) && data.length === 0) {
			return [{
				text: "I received your message but I'm not sure how to respond. Please try asking something else."
			}];
		}

		return data;
	} catch (error) {
		console.error('Error details:', error.message);
		console.error('Stack trace:', error.stack);
		
		// Try fallback URLs if main URL fails
		if (error.name === 'AbortError' || error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
			// Try the next fallback URL if available
			if (currentUrlIndex < FALLBACK_URLS.length - 1) {
				currentUrlIndex++;
				console.log(`Trying fallback URL at index ${currentUrlIndex}: ${FALLBACK_URLS[currentUrlIndex]}`);
				return sendMessage(message, senderId); // Recursive call with next URL
			} else if (currentUrlIndex === FALLBACK_URLS.length - 1 && currentUrlIndex >= 0) {
				// We've tried all fallbacks, reset to main URL for next time
				currentUrlIndex = -1;
			}
		}

		// Test if Rasa server is accessible - this will be an automatic health check
		// that runs in the background without blocking the UI
		testRasaHealth().catch(e => console.log('Health check failed:', e));

		// Return a more specific fallback message based on the error
		let errorMessage = "I'm having trouble connecting to my system. Please try again in a moment.";
		
		if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
			errorMessage = "I can't reach my knowledge system right now. Please check that the Rasa server is running at " + RASA_URL;
		} else if (error.name === 'AbortError') {
			errorMessage = "The request to my knowledge system timed out. Please check that the Rasa server is responding at " + RASA_URL;
		} else if (error.message.includes('Unexpected token')) {
			errorMessage = "I received an invalid response format from my knowledge system. This might be a configuration issue.";
		}
		
		return [{ text: errorMessage }];
	}
};

/**
 * Test if the Rasa server is accessible
 * @returns {Promise<boolean>} - True if Rasa is accessible, false otherwise
 */
export const testRasaHealth = async () => {
	try {
		const response = await fetch(`${RASA_URL}/`, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
			timeout: 2000
		});
		
		if (response.ok) {
			console.log('Rasa server is accessible');
			return true;
		}
		console.log('Rasa server returned non-OK response:', response.status);
		return false;
	} catch (error) {
		console.error('Failed to access Rasa server:', error.message);
		return false;
	}
};

/**
 * Generate a random session ID for the user
 * @returns {string} - Random session ID
 */
export const generateSessionId = () => {
	return 'user_' + Math.random().toString(36).substring(2, 15);
};

/**
 * Get stored session ID or create a new one
 * @returns {string} - Session ID
 */
export const getSessionId = () => {
	let sessionId = localStorage.getItem('ember_session_id');
	if (!sessionId) {
		sessionId = generateSessionId();
		localStorage.setItem('ember_session_id', sessionId);
	}
	return sessionId;
};
