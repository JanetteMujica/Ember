import React from 'react';
import ReactDOM from 'react-dom';
import PainChatbot from '../../src/components/PainChatbot';

document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('pain-chatbot-root');
	if (container) {
		ReactDOM.render(<PainChatbot />, container);
	}
});
