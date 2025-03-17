import React from 'react';
import ReactDOM from 'react-dom';
import PainVisualization from '../../src/components/PainVisualization';

document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('pain-visualization-root');
	if (container) {
		ReactDOM.render(<PainVisualization />, container);
	}
});
