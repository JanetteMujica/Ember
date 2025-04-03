import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import QuickResponseButtons from './QuickResponseButtons';
import { sendMessage } from '../../services/rasaServices';

// Helper functions for handling Rasa redirects
const handleRasaRedirect = (response) => {
	let redirectUrl = null;

	// Check for redirect in various possible locations
	if (response.custom && response.custom.redirect) {
		redirectUrl = response.custom.redirect;
	} else if (response.json_message && response.json_message.redirect) {
		redirectUrl = response.json_message.redirect;
	} else if (typeof response === 'object' && response.redirect) {
		redirectUrl = response.redirect;
	}

	if (redirectUrl) {
		console.log('Detected redirect request to:', redirectUrl);

		// Store the pending redirect in sessionStorage in case it gets interrupted
		sessionStorage.setItem('ember_pending_redirect', redirectUrl);

		// Add a delay to ensure confirmation message is seen
		setTimeout(() => {
			try {
				// Clear the pending redirect since we're executing it now
				sessionStorage.removeItem('ember_pending_redirect');
				console.log('Executing redirect to:', redirectUrl);
				window.location.href = redirectUrl;
			} catch (error) {
				console.error('Failed to redirect:', error);
			}
		}, 2000);

		return true;
	}
	return false;
};

const checkPendingRedirects = () => {
	// Check if there's a stored redirect in sessionStorage
	const pendingRedirect = sessionStorage.getItem('ember_pending_redirect');
	if (pendingRedirect) {
		console.log('Found pending redirect to:', pendingRedirect);

		// Clear the pending redirect
		sessionStorage.removeItem('ember_pending_redirect');

		// Execute the redirect
		console.log('Executing pending redirect to:', pendingRedirect);
		window.location.href = pendingRedirect;
		return true;
	}
	return false;
};

const PainChatbot = () => {
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [quickResponses, setQuickResponses] = useState([]);
	const [showButtons, setShowButtons] = useState(false);
	const [conversationHistory, setConversationHistory] = useState([]);
	const messagesEndRef = useRef(null);

	// Check for pending redirects and initialize chatbot
	useEffect(() => {
		// Check for any pending redirects that might have been interrupted
		const hasRedirect = checkPendingRedirects();

		// Only continue with initialization if there's no redirect to handle
		if (!hasRedirect) {
			// Ask Rasa for the greeting message when component mounts
			handleSendMessage('/greet', true); // true indicates this is a system command
		}
	}, []);

	// Add monitoring for conversation history changes
	useEffect(() => {
		console.log(
			'Conversation history updated, length:',
			conversationHistory.length
		);
	}, [conversationHistory]);

	// Auto-scroll to bottom of chat when messages update
	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const scrollToBottom = () => {
		// Only scroll the messages container, not the whole page
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({
				behavior: 'smooth',
				block: 'end', // This ensures it only scrolls within its container
			});
		}
	};

	// Add a back button handler
	const handleGoBack = () => {
		if (conversationHistory.length > 0) {
			// Get the last saved state
			const prevState = conversationHistory[conversationHistory.length - 1];

			console.log('Going back to previous state:', prevState); // Add debugging

			// Restore that state
			setMessages(prevState.messages);
			setQuickResponses(prevState.quickResponses);
			setShowButtons(
				prevState.showButtons || prevState.quickResponses.length > 0
			);

			// Remove the used history entry
			setConversationHistory((prev) => prev.slice(0, -1));
		} else {
			console.log('No conversation history to go back to'); // Add debugging
		}
	};

	// Process a set of responses from the Rasa server
	const processRasaResponses = (botResponses) => {
		if (!botResponses || !Array.isArray(botResponses)) {
			console.error('Invalid Rasa responses received:', botResponses);
			return [];
		}

		return botResponses.map((response) => {
			// Enhanced debugging for each response
			console.log('Processing response:', response);

			// Check for buttons in the response
			const buttons = response.buttons || [];

			// Check for redirect in the response
			const hasRedirect = handleRasaRedirect(response);

			return {
				text: response.text || '',
				sender: 'bot',
				timestamp: new Date(),
				buttons: buttons,
				hasRedirect: hasRedirect,
			};
		});
	};

	// Send message to Rasa server and handle response
	const handleSendMessage = async (text, isSystemCommand = false) => {
		if (!text.trim()) return;

		// Save current state to history before changing
		if (!isSystemCommand) {
			setConversationHistory((prev) => [
				...prev,
				{
					messages: [...messages],
					quickResponses: [...quickResponses],
					showButtons: showButtons,
				},
			]);
		}

		// Debug: Log what's being sent to Rasa
		console.log('Sending to Rasa:', text);

		// Add user message to chat only if it's not a system command
		if (!isSystemCommand) {
			const userMessage = {
				text: text,
				sender: 'user',
				timestamp: new Date(),
			};
			setMessages((prevMessages) => [...prevMessages, userMessage]);
		}

		setLoading(true);
		setQuickResponses([]);

		try {
			// Send message to Rasa server
			const botResponses = await sendMessage(text);

			// Enhanced debugging
			console.log('Rasa response:', botResponses);

			// Process bot responses
			const newBotMessages = processRasaResponses(botResponses);

			// Add bot responses to chat
			if (newBotMessages.length > 0) {
				setMessages((prevMessages) => [...prevMessages, ...newBotMessages]);

				// Extract buttons from the last response, if any
				const lastMessage = newBotMessages[newBotMessages.length - 1];
				if (
					lastMessage &&
					lastMessage.buttons &&
					lastMessage.buttons.length > 0
				) {
					setQuickResponses(lastMessage.buttons);
					setShowButtons(true); // Set to true when buttons are available
				} else {
					setShowButtons(false); // Set to false when no buttons
				}
			} else {
				console.warn('No bot responses received');
				setShowButtons(false);
			}
		} catch (error) {
			console.error('Error sending message to Rasa:', error);
			console.error('Error details:', error.message, error.stack);

			// Add error message to chat
			const errorMessage = {
				text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
				sender: 'bot',
				timestamp: new Date(),
			};

			setMessages((prevMessages) => [...prevMessages, errorMessage]);
			setShowButtons(false);
		} finally {
			setLoading(false);
		}
	};

	// Handle quick response button clicks
	const handleQuickResponse = (button) => {
		console.log('Quick response selected:', button);

		// Save current state to history before handling the button click
		setConversationHistory((prev) => [
			...prev,
			{
				messages: [...messages],
				quickResponses: [...quickResponses],
				showButtons: showButtons,
			},
		]);

		// Add user's button selection as a message
		const userMessage = {
			text: button.title,
			sender: 'user',
			timestamp: new Date(),
		};

		setMessages((prevMessages) => [...prevMessages, userMessage]);

		// Send the button payload to Rasa, but mark it as a system command
		// so the payload doesn't show up in the chat
		handleSendMessage(button.payload, true);
	};

	return (
		<div className='chatbot'>
			<div className='chatbot-header'>
				<button
					onClick={() => {
						console.log(
							'Back button clicked. History length:',
							conversationHistory.length
						);
						handleGoBack();
					}}
					disabled={conversationHistory.length === 0}
					className='back-button'
					aria-label='Go back to previous step'
				>
					← Back
				</button>
			</div>

			<div className='chatbot-messages'>
				{messages.map((message, index) => (
					<ChatMessage
						key={index}
						text={message.text}
						sender={message.sender}
						timestamp={message.timestamp}
					/>
				))}
				{loading && (
					<div className='typing-indicator'>
						<span></span>
						<span></span>
						<span></span>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			{quickResponses.length > 0 && (
				<QuickResponseButtons
					buttons={quickResponses}
					onButtonClick={handleQuickResponse}
				/>
			)}

			<ChatInput
				onSendMessage={handleSendMessage}
				disabled={loading || showButtons}
			/>
		</div>
	);
};

export default PainChatbot;
