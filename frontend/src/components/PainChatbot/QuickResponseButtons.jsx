import React from 'react';

const QuickResponseButtons = ({ buttons, onButtonClick }) => {
	return (
		<div className='quick-response-buttons'>
			{buttons.map((button, index) => (
				<button
					key={index}
					className='quick-response-button'
					onClick={() => onButtonClick(button)}
					aria-label={`Quick response: ${button.title}`}
				>
					{button.title}
				</button>
			))}
		</div>
	);
};

export default QuickResponseButtons;
