import React from 'react';

const ChatMessage = ({ text, sender, timestamp }) => {
	// Format timestamp (e.g., "10:30 AM")
	const formattedTime = new Date(timestamp).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
	});

	return (
		<div
			className={`chat-message ${
				sender === 'user' ? 'user-message' : 'bot-message'
			}`}
		>
			<div className='message-content'>
				{/* For bot messages, include a bot icon */}
				{sender === 'bot' && (
					<div className='bot-icon'>
						<img src='/img/EmberLogo.png' alt='Ember Bot' />
					</div>
				)}

				<div className='message-bubble'>
					<div className='message-text'>
						{/* Parse newlines in the message text */}
						{text.split('\n').map((line, i) => (
							<React.Fragment key={i}>
								{line}
								{i < text.split('\n').length - 1 && <br />}
							</React.Fragment>
						))}
					</div>
					<div className='message-time'>{formattedTime}</div>
				</div>
			</div>
		</div>
	);
};

export default ChatMessage;
