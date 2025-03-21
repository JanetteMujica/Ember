'use strict';

module.exports = function (environment) {
	let ENV = {
		modulePrefix: 'ember',
		environment,
		rootURL: '/',
		locationType: 'auto',
		EmberENV: {
			FEATURES: {
				// Here you can enable experimental features on an ember canary build
				// e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
			},
			EXTEND_PROTOTYPES: {
				// Prevent Ember Data from overriding Date.parse.
				Date: false,
			},
		},

		APP: {
			// Here you can pass flags/options to your application instance
			// when it is created
			apiHost: process.env.API_HOST || 'http://localhost:3000',
			rasaHost: process.env.RASA_HOST || 'http://localhost:5005',
		},
	};

	if (environment === 'development') {
		// ENV.APP.LOG_RESOLVER = true;
		// ENV.APP.LOG_ACTIVE_GENERATION = true;
		// ENV.APP.LOG_TRANSITIONS = true;
		// ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
		// ENV.APP.LOG_VIEW_LOOKUPS = true;
	}

	if (environment === 'test') {
		// Testem prefers this...
		ENV.locationType = 'none';

		// keep test console output quieter
		ENV.APP.LOG_ACTIVE_GENERATION = false;
		ENV.APP.LOG_VIEW_LOOKUPS = false;

		ENV.APP.rootElement = '#ember-testing';
		ENV.APP.autoboot = false;
	}

	if (environment === 'production') {
		// Production-specific settings
		// ENV.APP.apiHost = 'https://api.your-domain.com';
		// ENV.APP.rasaHost = 'https://rasa.your-domain.com';
	}

	return ENV;
};
