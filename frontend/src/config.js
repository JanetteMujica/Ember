// src/config.js =>
// can be imported in your React components or services when needed:
// import config from '../config';
// or Now you can use it like:
// const apiUrl = config.apiUrl;

// Define environment - this will be set by webpack DefinePlugin
const environment =
	typeof process !== 'undefined' && process.env && process.env.NODE_ENV
		? process.env.NODE_ENV
		: 'development';

// Base configuration
const config = {
	// Default to development settings
	apiUrl: 'http://localhost:3000',
	rasaUrl: 'http://localhost:5005',
	debug: true, // Enable debug mode in development
	environment: environment, // Store the environment value for reference
};

// You can add environment-specific overrides here if needed
// These won't cause errors since they're only evaluated once during build time
if (environment === 'production') {
	// Production-specific settings
	// config.apiUrl = 'https://api.your-domain.com';
	// config.rasaUrl = 'https://rasa.your-domain.com';
	config.debug = false;
}

export default config;
