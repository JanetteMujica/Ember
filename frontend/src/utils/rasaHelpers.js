/**
 * Rasa chatbot helper utilities
 */

/**
 * Helper function to handle Rasa bot redirects
 * @param {Object} botResponse - A single response from the Rasa bot
 * @returns {boolean} - Whether a redirect was processed
 */
export const handleRasaRedirect = (botResponse) => {
	// Check for redirect in various possible locations
	let redirectUrl = null;

	if (botResponse.custom && botResponse.custom.redirect) {
		redirectUrl = botResponse.custom.redirect;
	} else if (botResponse.json_message && botResponse.json_message.redirect) {
		redirectUrl = botResponse.json_message.redirect;
	} else if (typeof botResponse === 'object' && botResponse.redirect) {
		redirectUrl = botResponse.redirect;
	}

	if (redirectUrl) {
		console.log('Detected redirect request to:', redirectUrl);

		// Store the pending redirect in sessionStorage in case it gets interrupted
		sessionStorage.setItem('ember_pending_redirect', redirectUrl);

		// Add a slight delay to allow the last message to be displayed
		setTimeout(() => {
			try {
				// Clear the pending redirect since we're executing it now
				sessionStorage.removeItem('ember_pending_redirect');
				console.log('Executing redirect to:', redirectUrl);
				window.location.href = redirectUrl;
			} catch (error) {
				console.error('Failed to redirect:', error);
			}
		}, 2000);

		return true;
	}
	return false;
};

/**
 * Process a set of responses from the Rasa server
 * @param {Array} botResponses - Array of responses from the Rasa server
 * @returns {Array} - Processed messages to display, with redirects handled
 */
export const processRasaResponses = (botResponses) => {
	if (!botResponses || !Array.isArray(botResponses)) {
		console.error('Invalid Rasa responses received:', botResponses);
		return [];
	}

	const processedMessages = [];
	let hasRedirect = false;

	// Process each message in the response
	botResponses.forEach((response) => {
		// First check if it's a redirect message
		if (handleRasaRedirect(response)) {
			hasRedirect = true;
			// We still want to show the message that contains the redirect
		}

		// Format the message for display
		processedMessages.push({
			text: response.text || '',
			sender: 'bot',
			timestamp: new Date(),
			buttons: response.buttons || [],
			hasRedirect: hasRedirect,
		});
	});

	return processedMessages;
};

/**
 * Checks for and processes any pending redirects
 * This should be called when the page loads to handle any stored redirect commands
 */
export const checkPendingRedirects = () => {
	// Check if there's a stored redirect in sessionStorage
	const pendingRedirect = sessionStorage.getItem('ember_pending_redirect');
	if (pendingRedirect) {
		console.log('Found pending redirect to:', pendingRedirect);

		// Clear the pending redirect
		sessionStorage.removeItem('ember_pending_redirect');

		// Execute the redirect
		console.log('Executing pending redirect to:', pendingRedirect);
		window.location.href = pendingRedirect;
		return true;
	}
	return false;
};

/**
 * Function to diagnose server connectivity issues
 * Call this during initialization to identify API endpoint issues
 */
export const diagnoseServerConnectivity = () => {
	// List of endpoints to test
	const endpoints = [
		'/webhooks/rest/webhook',
		'/api/tracking-preferences',
		'/tracking-preferences',
		'/api/pain-entries',
		'/pain-entries',
		'/api/journal',
		'/journal',
		'/api/entries',
		'/entries',
	];

	console.log('Diagnosing server connectivity...');

	// Test each endpoint
	endpoints.forEach((endpoint) => {
		const baseUrl = 'http://localhost:5005'; // Using your Rasa URL
		const url = `${baseUrl}${endpoint}`;

		// Use an OPTIONS request to test endpoint availability without modifying data
		fetch(url, {
			method: 'OPTIONS',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((response) => {
				console.log(
					`Endpoint ${endpoint}: ${response.status} ${response.statusText}`
				);
			})
			.catch((error) => {
				console.error(`Endpoint ${endpoint} error: ${error.message}`);
			});
	});
};
