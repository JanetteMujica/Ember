// test-api-esm.js
// Run with: node test-api-esm.js

// Using dynamic import for node-fetch
(async () => {
	const fetch = (await import('node-fetch')).default;

	async function testJournalAPI() {
		try {
			console.log('Testing POST /api/journal...');

			// Test creating a journal entry
			const createResponse = await fetch('http://localhost:5000/api/journal', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					type: 'experience',
					content: 'This is a test journal entry from the API test script',
					tags: ['test', 'api'],
					userId: 'default_user',
				}),
			});

			const createData = await createResponse.json();
			console.log('Create response:', createData);

			if (!createResponse.ok) {
				console.error(
					'Create request failed with status:',
					createResponse.status
				);
				return;
			}

			console.log('Testing GET /api/journal...');

			// Test getting journal entries
			const getResponse = await fetch('http://localhost:5000/api/journal');
			const getData = await getResponse.json();

			console.log('Get response:', getData);

			if (!getResponse.ok) {
				console.error('Get request failed with status:', getResponse.status);
				return;
			}

			console.log('API tests completed successfully!');
		} catch (error) {
			console.error('Error testing API:', error);
		}
	}

	await testJournalAPI();
})();
