# Ember

Helps you track and reflect on your pain episodes with visualizations.

## Structure

Core Ember.js Files:

frontend/app/app.js - Main application file
frontend/app/router.js - Routes definition
frontend/app/index.html - Main HTML template
frontend/config/environment.js - Environment configuration

HTML Templates:

frontend/track.html - Pain tracking page with chatbot
frontend/visualize.html - Pain data visualization page

React Components:

frontend/src/components/PainChatbot/index.jsx - React chatbot component (now complete)
frontend/src/components/PainChatbot/styles.css - Chatbot styling
frontend/src/components/PainVisualization/index.jsx - React visualization component
frontend/src/components/PainVisualization/styles.css - Visualization styling

JavaScript/Service Files:

frontend/js/main.js - Common utility functions
frontend/js/pain-chatbot-entry.js - Entry point for the PainChatbot component
frontend/js/pain-visualization-entry.js - Entry point for the PainVisualization component
frontend/src/services/rasaServices.js - Backend API service for RASA integration

The PainChatbot component is now fully implemented with:

Initial welcome message
User input handling (text and voice)
Quick reply buttons for easier interaction
A complete conversation flow for pain assessment
Mood, pain intensity, location, sleep quality, activities, and medication tracking
Accessibility features (compatible with screen readers and other assistive technologies)
Mobile-responsive design

Once you get your IBM Pain State API key, you'll want to update the simulateBotResponse function in the PainChatbot component to use real API calls via the rasaServices.js module instead of the simulated responses.
