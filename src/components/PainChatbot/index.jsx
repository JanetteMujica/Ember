import React, { useState, useEffect } from 'react';
import './styles.css';

const PainChatbot = () => {
	const [messages, setMessages] = useState([
		{
			text: "Hello! I'm your Pain Tracker Assistant. I can help you record and track your pain. Would you like to start a pain assessment?",
			isUser: false,
		},
	]);
	const [userInput, setUserInput] = useState('');
	const [quickReplies, setQuickReplies] = useState([
		{ text: 'Yes, start assessment', value: 'yes' },
		{ text: 'No, thanks', value: 'no' },
	]);

	// Send message to RASA server
	const sendMessage = async (message) => {
		try {
			// Add user message to chat
			setMessages((prev) => [...prev, { text: message, isUser: true }]);

			// Clear input field
			setUserInput('');

			// Show typing indicator
			setMessages((prev) => [...prev, { isTyping: true }]);

			// Send to RASA server
			const response = await fetch(
				'http://localhost:5005/webhooks/rest/webhook',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						sender: 'user',
						message: message,
					}),
				}
			);

			const data = await response.json();

			// Remove typing indicator
			setMessages((prev) => prev.filter((msg) => !msg.isTyping));

			// Add bot response(s)
			if (data && data.length > 0) {
				data.forEach((item) => {
					setMessages((prev) => [...prev, { text: item.text, isUser: false }]);

					// If quick replies are included
					if (item.buttons && item.buttons.length > 0) {
						setQuickReplies(
							item.buttons.map((button) => ({
								text: button.title,
								value: button.payload.replace(/^\//, ''),
							}))
						);
					} else {
						setQuickReplies([]);
					}
				});
			} else {
				// Fallback if no response
				setMessages((prev) => [
					...prev,
					{
						text: "I'm having trouble connecting to the server. Please try again later.",
						isUser: false,
					},
				]);
			}
		} catch (error) {
			console.error('Error sending message to RASA:', error);

			// Remove typing indicator
			setMessages((prev) => prev.filter((msg) => !msg.isTyping));

			// Add error message
			setMessages((prev) => [
				...prev,
				{
					text: "I'm having trouble connecting to the server. Please try again later.",
					isUser: false,
				},
			]);
		}
	};

	// Handle user input submission
	const handleSubmit = (e) => {
		e.preventDefault();
		if (userInput.trim()) {
			sendMessage(userInput);
		}
	};

	// Handle quick reply buttons
	const handleQuickReply = (value) => {
		sendMessage(value);
	};

	return (
		<div className='pain-chatbot'>
			<div className='chat-container'>
				{messages.map((msg, index) => (
					<div
						key={index}
						className={msg.isUser ? 'user-message' : 'bot-message'}
					>
						{msg.isTyping ? (
							<div className='typing-indicator'>
								<span></span>
								<span></span>
								<span></span>
							</div>
						) : (
							msg.text
						)}
					</div>
				))}
			</div>

			{quickReplies.length > 0 && (
				<div className='quick-replies'>
					{quickReplies.map((reply, index) => (
						<button
							key={index}
							className='quick-reply-button'
							onClick={() => handleQuickReply(reply.value)}
						>
							{reply.text}
						</button>
					))}
				</div>
			)}

			<form onSubmit={handleSubmit} className='input-container'>
				<input
					type='text'
					value={userInput}
					onChange={(e) => setUserInput(e.target.value)}
					placeholder='Type your message...'
					className='message-input'
				/>
				<button type='submit' className='send-button'>
					Send
				</button>
			</form>

			<div className='accessibility-controls'>
				<button className='access-button voice-button'>
					<span className='access-icon'>🎤</span>
					Voice Input
				</button>
				<button className='access-button help-button'>
					<span className='access-icon'>?</span>
					Help
				</button>
			</div>
		</div>
	);
};

export default PainChatbot;
