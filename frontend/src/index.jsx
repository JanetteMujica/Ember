// frontend/src/index.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Import CSS using alias
import '@styles/main.css';

// Simplified mounting - just mount the main App
document.addEventListener('DOMContentLoaded', () => {
	const rootElement = document.getElementById('root');
	if (rootElement) {
		const root = createRoot(rootElement);
		root.render(
			<React.StrictMode>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</React.StrictMode>
		);
	} else {
		console.error('Could not find root element!');
	}
});
