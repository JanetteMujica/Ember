import React from 'react';
import ReactDOM from 'react-dom';
import PainVisualization from '../../src/components/PainVisualization';

document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('pain-visualization-root');
	if (container) {
		ReactDOM.render(<PainVisualization />, container);
	}

	// Set up accessibility features
	setupAccessibilityFeatures();
});

/**
 * Set up accessibility features for the page
 */
function setupAccessibilityFeatures() {
	// Text size buttons
	const textSizeButtons = document.querySelectorAll('.text-size-btn');
	textSizeButtons.forEach((button) => {
		button.addEventListener('click', () => {
			const size = button.dataset.size;
			document.body.classList.remove('text-small', 'text-medium', 'text-large');
			document.body.classList.add(`text-${size}`);

			// Update active button
			textSizeButtons.forEach((btn) => btn.classList.remove('active'));
			button.classList.add('active');

			// Save preference
			localStorage.setItem('textSize', size);
		});
	});

	// Contrast mode buttons
	const contrastButtons = document.querySelectorAll('.contrast-btn');
	contrastButtons.forEach((button) => {
		button.addEventListener('click', () => {
			const contrast = button.dataset.contrast;
			document.body.classList.remove('high-contrast');
			if (contrast === 'high') {
				document.body.classList.add('high-contrast');
			}

			// Update active button
			contrastButtons.forEach((btn) => btn.classList.remove('active'));
			button.classList.add('active');

			// Save preference
			localStorage.setItem('contrastMode', contrast);
		});
	});

	// Read aloud button
	const readAloudButton = document.getElementById('read-aloud');
	if (readAloudButton) {
		readAloudButton.addEventListener('click', () => {
			const readAloud = localStorage.getItem('readAloud') === 'true';
			localStorage.setItem('readAloud', !readAloud);
			readAloudButton.classList.toggle('active', !readAloud);

			if (!readAloud) {
				readAloudButton.textContent = 'Stop Reading Aloud';
				// Read page content using text-to-speech
				if (window.speechSynthesis) {
					const mainContent = document.querySelector('main').textContent;
					const speech = new SpeechSynthesisUtterance(mainContent);
					window.speechSynthesis.speak(speech);
				}
			} else {
				readAloudButton.textContent = 'Read Aloud';
				if (window.speechSynthesis) {
					window.speechSynthesis.cancel();
				}
			}
		});
	}

	// Apply saved preferences
	const savedTextSize = localStorage.getItem('textSize');
	if (savedTextSize) {
		document.body.classList.add(`text-${savedTextSize}`);
		const activeTextButton = document.querySelector(
			`.text-size-btn[data-size="${savedTextSize}"]`
		);
		if (activeTextButton) {
			activeTextButton.classList.add('active');
		}
	}

	const savedContrastMode = localStorage.getItem('contrastMode');
	if (savedContrastMode === 'high') {
		document.body.classList.add('high-contrast');
		const activeContrastButton = document.querySelector(
			'.contrast-btn[data-contrast="high"]'
		);
		if (activeContrastButton) {
			activeContrastButton.classList.add('active');
		}
	}

	const readAloud = localStorage.getItem('readAloud') === 'true';
	if (readAloud && readAloudButton) {
		readAloudButton.classList.add('active');
		readAloudButton.textContent = 'Stop Reading Aloud';
	}
}
