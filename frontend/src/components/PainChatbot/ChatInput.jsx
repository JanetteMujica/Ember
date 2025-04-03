import React, { useState } from 'react';

const ChatInput = ({ onSendMessage, disabled }) => {
	const [message, setMessage] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();

		if (message.trim() && !disabled) {
			onSendMessage(message);
			setMessage('');
		}
	};

	const handleKeyDown = (e) => {
		// Submit on Enter (but allow Shift+Enter for new lines)
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	return (
		<form
			className={`chat-input ${disabled ? 'disabled' : ''}`}
			onSubmit={handleSubmit}
		>
			<textarea
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={
					disabled
						? 'Please select an option above'
						: 'Type your message here...'
				}
				disabled={disabled}
				aria-label='Type your message'
				rows={1}
			/>
			<button
				type='submit'
				className='send-button'
				disabled={disabled || !message.trim()}
				aria-label='Send message'
			>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 24 24'
					fill='currentColor'
				>
					<path d='M0 0h24v24H0z' fill='none' />
					<path d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' />
				</svg>
			</button>
		</form>
	);
};

export default ChatInput;
