import React from 'react';
import { createRoot } from 'react-dom/client';
import TrackPage from '../src/pages/TrackPage';

// Import main CSS at the entry point level
import '../src/components/styles/main.css';

// Wait for the DOM to be fully loaded before rendering
document.addEventListener('DOMContentLoaded', () => {
	const rootElement = document.getElementById('root');

	// Add a safety check to prevent errors
	if (rootElement) {
		const root = createRoot(rootElement);
		root.render(<TrackPage />);
	} else {
		console.error('Root element not found');
	}
});
