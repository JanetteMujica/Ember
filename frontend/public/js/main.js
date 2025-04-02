/**
 * main.js
 *
 * Common JavaScript functionality for the Ember application
 */

document.addEventListener('DOMContentLoaded', () => {
	// Mobile menu toggle
	initMobileMenu();

	// Check for saved accessibility preferences and apply them
	applyAccessibilityPreferences();
});

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
	const menuToggle = document.querySelector('.mobile-menu-toggle');
	const navigation = document.getElementById('navigation');

	if (menuToggle && navigation) {
		menuToggle.addEventListener('click', () => {
			const expanded =
				menuToggle.getAttribute('aria-expanded') === 'true' || false;

			menuToggle.setAttribute('aria-expanded', !expanded);
			navigation.classList.toggle('is-open', !expanded);

			if (!expanded) {
				menuToggle.textContent = 'Close';
			} else {
				menuToggle.textContent = 'Menu';
			}
		});
	}
}

/**
 * Apply saved accessibility preferences
 */
function applyAccessibilityPreferences() {
	// Apply text size preference
	const savedTextSize = localStorage.getItem('textSize');
	if (savedTextSize) {
		document.body.classList.add(`text-${savedTextSize}`);
	}

	// Apply contrast mode preference
	if (localStorage.getItem('contrastMode') === 'high') {
		document.body.classList.add('high-contrast');
	}
}

/**
 * Function to create a downloadable file from a Blob
 *
 * @param {Blob} blob - The file data as a Blob
 * @param {string} filename - The name to give the downloaded file
 */
function downloadFile(blob, filename) {
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.style.display = 'none';
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	window.URL.revokeObjectURL(url);
	document.body.removeChild(a);
}

/**
 * Format date to a human-readable string
 *
 * @param {Date} date - The date to format
 * @param {string} format - The format to use ('short', 'medium', 'long')
 * @returns {string} - Formatted date string
 */
function formatDate(date, format = 'medium') {
	if (!(date instanceof Date)) {
		date = new Date(date);
	}

	const options = {
		short: { month: 'numeric', day: 'numeric', year: '2-digit' },
		medium: { month: 'short', day: 'numeric', year: 'numeric' },
		long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
	};

	return date.toLocaleDateString(undefined, options[format] || options.medium);
}

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 *
 * @param {Date|string} date - The date to format
 * @returns {string} - Relative time string
 */
function getRelativeTimeString(date) {
	if (!(date instanceof Date)) {
		date = new Date(date);
	}

	const now = new Date();
	const diffInMs = date.getTime() - now.getTime();
	const diffInSec = Math.round(diffInMs / 1000);
	const diffInMin = Math.round(diffInSec / 60);
	const diffInHour = Math.round(diffInMin / 60);
	const diffInDay = Math.round(diffInHour / 24);

	if (Math.abs(diffInSec) < 60) {
		return diffInSec >= 0 ? 'just now' : 'just now';
	} else if (Math.abs(diffInMin) < 60) {
		return diffInMin > 0
			? `in ${diffInMin} minute${diffInMin !== 1 ? 's' : ''}`
			: `${Math.abs(diffInMin)} minute${
					Math.abs(diffInMin) !== 1 ? 's' : ''
			  } ago`;
	} else if (Math.abs(diffInHour) < 24) {
		return diffInHour > 0
			? `in ${diffInHour} hour${diffInHour !== 1 ? 's' : ''}`
			: `${Math.abs(diffInHour)} hour${
					Math.abs(diffInHour) !== 1 ? 's' : ''
			  } ago`;
	} else if (Math.abs(diffInDay) < 30) {
		return diffInDay > 0
			? `in ${diffInDay} day${diffInDay !== 1 ? 's' : ''}`
			: `${Math.abs(diffInDay)} day${Math.abs(diffInDay) !== 1 ? 's' : ''} ago`;
	} else {
		return formatDate(date);
	}
}

// Export common utility functions for use in other scripts
window.Ember = window.Ember || {};
window.Ember.utils = {
	downloadFile,
	formatDate,
	getRelativeTimeString,
};
