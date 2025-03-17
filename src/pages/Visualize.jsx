// Visualize.jsx
import React from 'react';
import AccessiblePainVisualization from '../components/AccessiblePainVisualization';

function Visualize() {
	return (
		<div className='visualize-page'>
			<h1>Visualize Your Pain Data</h1>

			<div className='visualization-container'>
				<AccessiblePainVisualization />
			</div>
		</div>
	);
}

export default Visualize;
