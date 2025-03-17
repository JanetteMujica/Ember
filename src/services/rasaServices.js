// rasaService.js
const RASA_API_URL = 'http://localhost:5005/webhooks/rest/webhook';

export async function sendMessage(message, senderId = 'user') {
	try {
		const response = await fetch(RASA_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				sender: senderId,
				message: message,
			}),
		});

		return await response.json();
	} catch (error) {
		console.error('Error sending message to RASA:', error);
		return [];
	}
}

export async function fetchPainData(patientId, timeframe = 'week') {
	try {
		const response = await fetch(
			`/api/pain-reports/${patientId}?timeframe=${timeframe}`
		);
		return await response.json();
	} catch (error) {
		console.error('Error fetching pain data:', error);
		return [];
	}
}
