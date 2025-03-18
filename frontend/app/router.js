import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
	location: config.locationType,
	rootURL: config.rootURL,
});

Router.map(function () {
	// Define your routes here
	this.route('track', { path: '/track' });
	this.route('visualize', { path: '/visualize' });
	this.route('journal', { path: '/journal' });
	this.route('help', { path: '/help' });
	this.route('accessibility', { path: '/accessibility' });
	this.route('privacy', { path: '/privacy' });
	this.route('terms', { path: '/terms' });
});

export default Router;
