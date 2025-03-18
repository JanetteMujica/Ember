import React, { useState, useEffect, useRef } from 'react';
import './styles.css';

// Import service to communicate with RASA backend
import { sendMessage, getBotResponse } from '../../services/rasaServices';

const PainChatbot = () => {
	// State to store chat messages
	const [messages, setMessages] = useState([]);

	// State to store user input
	const [userInput, setUserInput] = useState('');

	// State to store quick reply options
	const [quickReplies, setQuickReplies] = useState([]);

	// State to track if we're recording voice
	const [isRecording, setIsRecording] = useState(false);

	// Reference to the messages container for auto-scrolling
	const messagesEndRef = useRef(null);

	// State to store conversation context
	const [conversationContext, setConversationContext] = useState({
		painAssessmentStage: 'initial',
		painData: {
			mood: null,
			painIntensity: null,
			painLocation: null,
			sleepQuality: null,
			activities: [],
			medications: [],
		},
	});

	// Function to scroll to bottom of chat
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	// Scroll to bottom whenever messages change
	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// Initialize chatbot with welcome message
	useEffect(() => {
		// Add initial bot message
		addBotMessage(
			"Hello! I'm Ember, your pain tracking assistant. I'll help you record information about your pain experience. This will help identify patterns that you can share with your healthcare providers.",
			[
				{ text: "I'm ready", value: 'ready' },
				{ text: 'Tell me more about how this works', value: 'more_info' },
			]
		);
	}, []);

	// Function to add a bot message to the chat
	const addBotMessage = (text, replies = []) => {
		setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text }]);

		setQuickReplies(replies);

		// If text-to-speech is enabled, read the message
		if (
			window.speechSynthesis &&
			localStorage.getItem('readAloud') === 'true'
		) {
			const speech = new SpeechSynthesisUtterance(text);
			window.speechSynthesis.speak(speech);
		}
	};

	// Function to add a user message to the chat
	const addUserMessage = (text) => {
		setMessages((prevMessages) => [...prevMessages, { sender: 'user', text }]);
	};

	// Function to handle sending user message
	const handleSendMessage = async (e) => {
		e.preventDefault();

		if (!userInput.trim()) return;

		// Add user message to chat
		addUserMessage(userInput);

		// Clear input field and quick replies
		setUserInput('');
		setQuickReplies([]);

		try {
			// In a real app, this would send the message to RASA
			// For now, we'll simulate responses
			const botResponse = await simulateBotResponse(
				userInput,
				conversationContext
			);

			// Add bot response to chat
			addBotMessage(botResponse.text, botResponse.quickReplies);

			// Update conversation context
			setConversationContext(botResponse.updatedContext);
		} catch (error) {
			console.error('Error getting bot response:', error);
			addBotMessage(
				"I'm sorry, I'm having trouble processing your response. Please try again."
			);
		}
	};

	// Function to handle quick reply selection
	const handleQuickReply = async (reply) => {
		// Add user message to chat
		addUserMessage(reply.text);

		// Clear quick replies
		setQuickReplies([]);

		try {
			// In a real app, this would send the message to RASA
			// For now, we'll simulate responses
			const botResponse = await simulateBotResponse(
				reply.value,
				conversationContext
			);

			// Add bot response to chat
			addBotMessage(botResponse.text, botResponse.quickReplies);

			// Update conversation context
			setConversationContext(botResponse.updatedContext);
		} catch (error) {
			console.error('Error getting bot response:', error);
			addBotMessage(
				"I'm sorry, I'm having trouble processing your response. Please try again."
			);
		}
	};

	// Function to handle voice input
	const handleVoiceInput = () => {
		if (!('webkitSpeechRecognition' in window)) {
			alert('Speech recognition is not supported in your browser.');
			return;
		}

		const recognition = new window.webkitSpeechRecognition();
		recognition.continuous = false;
		recognition.interimResults = false;

		setIsRecording(true);

		recognition.onresult = (event) => {
			const transcript = event.results[0][0].transcript;
			setUserInput(transcript);
			setIsRecording(false);
		};

		recognition.onerror = (event) => {
			console.error('Speech recognition error', event.error);
			setIsRecording(false);
		};

		recognition.onend = () => {
			setIsRecording(false);
		};

		recognition.start();
	};

	// Function to simulate bot response (will be replaced with actual RASA API calls)
	const simulateBotResponse = (message, context) => {
		return new Promise((resolve) => {
			// Simulate network delay
			setTimeout(() => {
				const lowerMessage = message.toLowerCase();
				let response = {
					text: '',
					quickReplies: [],
					updatedContext: { ...context },
				};

				// Handle different stages of the conversation
				switch (context.painAssessmentStage) {
					case 'initial':
						if (lowerMessage.includes('ready')) {
							response.text =
								"Great! Let's start. How would you rate your mood today on a scale from 1 (terrible) to 10 (excellent)?";
							response.quickReplies = [
								{ text: '1-3 (Not good)', value: 'mood_low' },
								{ text: '4-6 (Okay)', value: 'mood_medium' },
								{ text: '7-10 (Good)', value: 'mood_high' },
							];
							response.updatedContext.painAssessmentStage = 'mood';
						} else {
							response.text =
								"Ember helps you track and visualize your pain experience over time. This information can help you and your healthcare providers identify patterns and triggers. I'll ask you a series of questions about your pain, mood, sleep, and activities. Ready to get started?";
							response.quickReplies = [
								{ text: "I'm ready now", value: 'ready' },
								{ text: 'Not right now', value: 'not_ready' },
							];
						}
						break;

					case 'mood':
						// Store mood rating
						if (lowerMessage.includes('1-3') || lowerMessage === 'mood_low') {
							response.updatedContext.painData.mood = 'low';
						} else if (
							lowerMessage.includes('4-6') ||
							lowerMessage === 'mood_medium'
						) {
							response.updatedContext.painData.mood = 'medium';
						} else if (
							lowerMessage.includes('7-10') ||
							lowerMessage === 'mood_high'
						) {
							response.updatedContext.painData.mood = 'high';
						} else {
							// Try to parse a number from the message
							const moodMatch = lowerMessage.match(/\d+/);
							if (moodMatch) {
								const moodValue = parseInt(moodMatch[0]);
								if (moodValue >= 1 && moodValue <= 10) {
									if (moodValue <= 3)
										response.updatedContext.painData.mood = 'low';
									else if (moodValue <= 6)
										response.updatedContext.painData.mood = 'medium';
									else response.updatedContext.painData.mood = 'high';
								}
							}
						}

						// Move to pain intensity question
						response.text =
							'Thank you. Now, on a scale of 0 (no pain) to 10 (worst pain imaginable), how would you rate your pain right now?';
						response.quickReplies = [
							{ text: '0-3 (Mild)', value: 'pain_mild' },
							{ text: '4-6 (Moderate)', value: 'pain_moderate' },
							{ text: '7-10 (Severe)', value: 'pain_severe' },
						];
						response.updatedContext.painAssessmentStage = 'pain_intensity';
						break;

					case 'pain_intensity':
						// Store pain intensity
						if (lowerMessage.includes('0-3') || lowerMessage === 'pain_mild') {
							response.updatedContext.painData.painIntensity = 'mild';
						} else if (
							lowerMessage.includes('4-6') ||
							lowerMessage === 'pain_moderate'
						) {
							response.updatedContext.painData.painIntensity = 'moderate';
						} else if (
							lowerMessage.includes('7-10') ||
							lowerMessage === 'pain_severe'
						) {
							response.updatedContext.painData.painIntensity = 'severe';
						} else {
							// Try to parse a number from the message
							const painMatch = lowerMessage.match(/\d+/);
							if (painMatch) {
								const painValue = parseInt(painMatch[0]);
								if (painValue >= 0 && painValue <= 10) {
									if (painValue <= 3)
										response.updatedContext.painData.painIntensity = 'mild';
									else if (painValue <= 6)
										response.updatedContext.painData.painIntensity = 'moderate';
									else
										response.updatedContext.painData.painIntensity = 'severe';
								}
							}
						}

						// Move to pain location question
						response.text =
							'Where is your pain located? You can select multiple areas if needed.';
						response.quickReplies = [
							{ text: 'Head/Neck', value: 'pain_head_neck' },
							{ text: 'Back', value: 'pain_back' },
							{ text: 'Chest/Abdomen', value: 'pain_chest_abdomen' },
							{ text: 'Arms/Hands', value: 'pain_arms_hands' },
							{ text: 'Legs/Feet', value: 'pain_legs_feet' },
							{ text: 'Joints', value: 'pain_joints' },
							{ text: 'Done selecting', value: 'pain_location_done' },
						];
						response.updatedContext.painAssessmentStage = 'pain_location';
						break;

					case 'pain_location':
						// Store pain location
						if (
							lowerMessage !== 'pain_location_done' &&
							!lowerMessage.includes('done')
						) {
							let location = '';
							if (
								lowerMessage.includes('head') ||
								lowerMessage.includes('neck') ||
								lowerMessage === 'pain_head_neck'
							) {
								location = 'Head/Neck';
							} else if (
								lowerMessage.includes('back') ||
								lowerMessage === 'pain_back'
							) {
								location = 'Back';
							} else if (
								lowerMessage.includes('chest') ||
								lowerMessage.includes('abdomen') ||
								lowerMessage === 'pain_chest_abdomen'
							) {
								location = 'Chest/Abdomen';
							} else if (
								lowerMessage.includes('arm') ||
								lowerMessage.includes('hand') ||
								lowerMessage === 'pain_arms_hands'
							) {
								location = 'Arms/Hands';
							} else if (
								lowerMessage.includes('leg') ||
								lowerMessage.includes('foot') ||
								lowerMessage.includes('feet') ||
								lowerMessage === 'pain_legs_feet'
							) {
								location = 'Legs/Feet';
							} else if (
								lowerMessage.includes('joint') ||
								lowerMessage === 'pain_joints'
							) {
								location = 'Joints';
							}

							if (location) {
								response.updatedContext.painData.painLocation = location;
								response.text = `I've noted that your pain is in your ${location}. Any other locations? If not, select "Done selecting".`;
								response.quickReplies = [
									{ text: 'Head/Neck', value: 'pain_head_neck' },
									{ text: 'Back', value: 'pain_back' },
									{ text: 'Chest/Abdomen', value: 'pain_chest_abdomen' },
									{ text: 'Arms/Hands', value: 'pain_arms_hands' },
									{ text: 'Legs/Feet', value: 'pain_legs_feet' },
									{ text: 'Joints', value: 'pain_joints' },
									{ text: 'Done selecting', value: 'pain_location_done' },
								];
								break;
							}
						}

						// Move to sleep quality question
						response.text =
							'How would you rate your sleep quality last night on a scale from 1 (very poor) to 10 (excellent)?';
						response.quickReplies = [
							{ text: '1-3 (Poor)', value: 'sleep_poor' },
							{ text: '4-6 (Fair)', value: 'sleep_fair' },
							{ text: '7-10 (Good)', value: 'sleep_good' },
						];
						response.updatedContext.painAssessmentStage = 'sleep_quality';
						break;

					case 'sleep_quality':
						// Store sleep quality
						if (lowerMessage.includes('1-3') || lowerMessage === 'sleep_poor') {
							response.updatedContext.painData.sleepQuality = 'poor';
						} else if (
							lowerMessage.includes('4-6') ||
							lowerMessage === 'sleep_fair'
						) {
							response.updatedContext.painData.sleepQuality = 'fair';
						} else if (
							lowerMessage.includes('7-10') ||
							lowerMessage === 'sleep_good'
						) {
							response.updatedContext.painData.sleepQuality = 'good';
						}

						// Move to activities question
						response.text =
							'Which activities have been affected by your pain today? Select all that apply.';
						response.quickReplies = [
							{ text: 'Walking', value: 'activity_walking' },
							{ text: 'Standing', value: 'activity_standing' },
							{ text: 'Sitting', value: 'activity_sitting' },
							{ text: 'Sleep', value: 'activity_sleep' },
							{ text: 'Exercise', value: 'activity_exercise' },
							{ text: 'Work', value: 'activity_work' },
							{ text: 'Household chores', value: 'activity_chores' },
							{ text: 'None', value: 'activity_none' },
						];
						response.updatedContext.painAssessmentStage = 'activities';
						break;

					case 'activities':
						// Store activities
						let activity = '';
						if (
							lowerMessage.includes('walk') ||
							lowerMessage === 'activity_walking'
						) {
							activity = 'Walking';
						} else if (
							lowerMessage.includes('stand') ||
							lowerMessage === 'activity_standing'
						) {
							activity = 'Standing';
						} else if (
							lowerMessage.includes('sit') ||
							lowerMessage === 'activity_sitting'
						) {
							activity = 'Sitting';
						} else if (
							lowerMessage.includes('sleep') ||
							lowerMessage === 'activity_sleep'
						) {
							activity = 'Sleep';
						} else if (
							lowerMessage.includes('exercise') ||
							lowerMessage === 'activity_exercise'
						) {
							activity = 'Exercise';
						} else if (
							lowerMessage.includes('work') ||
							lowerMessage === 'activity_work'
						) {
							activity = 'Work';
						} else if (
							lowerMessage.includes('chore') ||
							lowerMessage.includes('household') ||
							lowerMessage === 'activity_chores'
						) {
							activity = 'Household chores';
						} else if (
							lowerMessage.includes('none') ||
							lowerMessage === 'activity_none'
						) {
							activity = 'None';
							response.updatedContext.painData.activities = ['None'];
						}

						if (activity && activity !== 'None') {
							if (
								!response.updatedContext.painData.activities.includes(activity)
							) {
								response.updatedContext.painData.activities.push(activity);
							}

							response.text = `I've noted that ${activity} is affected by your pain. Any other activities? If not, type "done".`;
							response.quickReplies = [
								{ text: 'Walking', value: 'activity_walking' },
								{ text: 'Standing', value: 'activity_standing' },
								{ text: 'Sitting', value: 'activity_sitting' },
								{ text: 'Sleep', value: 'activity_sleep' },
								{ text: 'Exercise', value: 'activity_exercise' },
								{ text: 'Work', value: 'activity_work' },
								{ text: 'Household chores', value: 'activity_chores' },
								{ text: 'Done', value: 'activities_done' },
							];

							break;
						}

						if (
							lowerMessage.includes('done') ||
							lowerMessage === 'activities_done'
						) {
							// Move to medications question
							response.text =
								'Have you taken any medications for your pain today?';
							response.quickReplies = [
								{ text: 'Yes', value: 'medications_yes' },
								{ text: 'No', value: 'medications_no' },
							];
							response.updatedContext.painAssessmentStage = 'medications';
						}
						break;

					case 'medications':
						if (
							lowerMessage.includes('yes') ||
							lowerMessage === 'medications_yes'
						) {
							response.text =
								'Which medications have you taken? Please select or type them.';
							response.quickReplies = [
								{ text: 'Ibuprofen (Advil, Motrin)', value: 'med_ibuprofen' },
								{ text: 'Acetaminophen (Tylenol)', value: 'med_acetaminophen' },
								{ text: 'Naproxen (Aleve)', value: 'med_naproxen' },
								{ text: 'Aspirin', value: 'med_aspirin' },
								{ text: 'Prescription medication', value: 'med_prescription' },
								{ text: 'Other', value: 'med_other' },
								{ text: 'Done', value: 'medications_done' },
							];
							response.updatedContext.painAssessmentStage = 'medications_list';
						} else if (
							lowerMessage.includes('no') ||
							lowerMessage === 'medications_no'
						) {
							response.updatedContext.painData.medications = ['None'];

							// Move to summary
							response.text =
								"Thank you for sharing your pain information. Here's a summary of what you've told me:\n\n" +
								`Mood: ${
									response.updatedContext.painData.mood || 'Not specified'
								}\n` +
								`Pain intensity: ${
									response.updatedContext.painData.painIntensity ||
									'Not specified'
								}\n` +
								`Pain location: ${
									response.updatedContext.painData.painLocation ||
									'Not specified'
								}\n` +
								`Sleep quality: ${
									response.updatedContext.painData.sleepQuality ||
									'Not specified'
								}\n` +
								`Activities affected: ${
									response.updatedContext.painData.activities.join(', ') ||
									'None'
								}\n` +
								`Medications: None\n\n` +
								'Would you like to save this information?';

							response.quickReplies = [
								{ text: 'Yes, save it', value: 'save_yes' },
								{ text: "No, don't save", value: 'save_no' },
							];
							response.updatedContext.painAssessmentStage = 'summary';
						}
						break;

					case 'medications_list':
						let medication = '';
						if (
							lowerMessage.includes('ibuprofen') ||
							lowerMessage.includes('advil') ||
							lowerMessage.includes('motrin') ||
							lowerMessage === 'med_ibuprofen'
						) {
							medication = 'Ibuprofen (Advil, Motrin)';
						} else if (
							lowerMessage.includes('acetaminophen') ||
							lowerMessage.includes('tylenol') ||
							lowerMessage === 'med_acetaminophen'
						) {
							medication = 'Acetaminophen (Tylenol)';
						} else if (
							lowerMessage.includes('naproxen') ||
							lowerMessage.includes('aleve') ||
							lowerMessage === 'med_naproxen'
						) {
							medication = 'Naproxen (Aleve)';
						} else if (
							lowerMessage.includes('aspirin') ||
							lowerMessage === 'med_aspirin'
						) {
							medication = 'Aspirin';
						} else if (
							lowerMessage.includes('prescription') ||
							lowerMessage === 'med_prescription'
						) {
							medication = 'Prescription medication';
						} else if (lowerMessage === 'med_other') {
							response.text =
								"Please type the name of the medication you've taken.";
							response.updatedContext.painAssessmentStage = 'medications_other';
							break;
						}

						if (medication) {
							if (!response.updatedContext.painData.medications) {
								response.updatedContext.painData.medications = [];
							}

							if (
								!response.updatedContext.painData.medications.includes(
									medication
								)
							) {
								response.updatedContext.painData.medications.push(medication);
							}

							response.text = `I've noted that you've taken ${medication}. Any other medications? If not, select "Done".`;
							response.quickReplies = [
								{ text: 'Ibuprofen (Advil, Motrin)', value: 'med_ibuprofen' },
								{ text: 'Acetaminophen (Tylenol)', value: 'med_acetaminophen' },
								{ text: 'Naproxen (Aleve)', value: 'med_naproxen' },
								{ text: 'Aspirin', value: 'med_aspirin' },
								{ text: 'Prescription medication', value: 'med_prescription' },
								{ text: 'Other', value: 'med_other' },
								{ text: 'Done', value: 'medications_done' },
							];

							break;
						}

						if (
							lowerMessage.includes('done') ||
							lowerMessage === 'medications_done'
						) {
							// Move to summary
							const medications =
								response.updatedContext.painData.medications || [];

							response.text =
								"Thank you for sharing your pain information. Here's a summary of what you've told me:\n\n" +
								`Mood: ${
									response.updatedContext.painData.mood || 'Not specified'
								}\n` +
								`Pain intensity: ${
									response.updatedContext.painData.painIntensity ||
									'Not specified'
								}\n` +
								`Pain location: ${
									response.updatedContext.painData.painLocation ||
									'Not specified'
								}\n` +
								`Sleep quality: ${
									response.updatedContext.painData.sleepQuality ||
									'Not specified'
								}\n` +
								`Activities affected: ${
									response.updatedContext.painData.activities.join(', ') ||
									'None'
								}\n` +
								`Medications: ${
									medications.length > 0 ? medications.join(', ') : 'None'
								}\n\n` +
								'Would you like to save this information?';

							response.quickReplies = [
								{ text: 'Yes, save it', value: 'save_yes' },
								{ text: "No, don't save", value: 'save_no' },
							];
							response.updatedContext.painAssessmentStage = 'summary';
						}
						break;

					case 'medications_other':
						// Store custom medication
						if (lowerMessage.trim() !== '') {
							if (!response.updatedContext.painData.medications) {
								response.updatedContext.painData.medications = [];
							}

							response.updatedContext.painData.medications.push(lowerMessage);

							response.text = `I've noted that you've taken ${lowerMessage}. Any other medications? If not, select "Done".`;
							response.quickReplies = [
								{ text: 'Ibuprofen (Advil, Motrin)', value: 'med_ibuprofen' },
								{ text: 'Acetaminophen (Tylenol)', value: 'med_acetaminophen' },
								{ text: 'Naproxen (Aleve)', value: 'med_naproxen' },
								{ text: 'Aspirin', value: 'med_aspirin' },
								{ text: 'Prescription medication', value: 'med_prescription' },
								{ text: 'Other', value: 'med_other' },
								{ text: 'Done', value: 'medications_done' },
							];
							response.updatedContext.painAssessmentStage = 'medications_list';
						}
						break;

					case 'summary':
						if (lowerMessage.includes('yes') || lowerMessage === 'save_yes') {
							// In a real app, this would save the data to the backend
							response.text =
								"Your pain information has been saved. You can view your pain patterns in the Visualize section. Is there anything else you'd like to add about your pain today?";
							response.quickReplies = [
								{ text: 'Yes, add a note', value: 'add_note' },
								{ text: "No, I'm done", value: 'done' },
							];
							response.updatedContext.painAssessmentStage = 'additional_notes';
						} else if (
							lowerMessage.includes('no') ||
							lowerMessage === 'save_no'
						) {
							response.text =
								'No problem. Your information has not been saved. Is there anything else I can help you with?';
							response.quickReplies = [
								{ text: 'Start over', value: 'restart' },
								{ text: "I'm done", value: 'done' },
							];
							response.updatedContext.painAssessmentStage = 'final';
						}
						break;

					case 'additional_notes':
						if (lowerMessage.includes('yes') || lowerMessage === 'add_note') {
							response.text =
								'Please type any additional notes about your pain today.';
							response.updatedContext.painAssessmentStage = 'adding_note';
						} else if (
							lowerMessage.includes('no') ||
							lowerMessage.includes('done')
						) {
							response.text =
								'Thank you for using Ember to track your pain today. This information will help you and your healthcare providers better understand your pain patterns over time. Would you like to go to the visualization page to see your pain data?';
							response.quickReplies = [
								{ text: 'Yes, show visualizations', value: 'goto_visualize' },
								{ text: "No, I'm done", value: 'done' },
							];
							response.updatedContext.painAssessmentStage = 'final';
						}
						break;

					case 'adding_note':
						// Store the note
						response.updatedContext.painData.notes = lowerMessage;

						response.text =
							"I've added your note. Thank you for using Ember to track your pain today. This information will help you and your healthcare providers better understand your pain patterns over time. Would you like to go to the visualization page to see your pain data?";
						response.quickReplies = [
							{ text: 'Yes, show visualizations', value: 'goto_visualize' },
							{ text: "No, I'm done", value: 'done' },
						];
						response.updatedContext.painAssessmentStage = 'final';
						break;

					case 'final':
						if (
							lowerMessage.includes('visualize') ||
							lowerMessage === 'goto_visualize'
						) {
							// Redirect to visualization page
							window.location.href = '/visualize';
							response.text = 'Taking you to the visualization page...';
						} else if (
							lowerMessage.includes('restart') ||
							lowerMessage === 'restart'
						) {
							// Reset the conversation
							response.text = "Let's start over. How are you feeling today?";
							response.quickReplies = [
								{ text: "I'm ready", value: 'ready' },
								{
									text: 'Tell me more about how this works',
									value: 'more_info',
								},
							];
							response.updatedContext = {
								painAssessmentStage: 'initial',
								painData: {
									mood: null,
									painIntensity: null,
									painLocation: null,
									sleepQuality: null,
									activities: [],
									medications: [],
								},
							};
						} else {
							response.text = 'Thank you for using Ember. Have a great day!';
						}
						break;

					default:
						// Default response if we don't recognize the context
						response.text =
							"I'm not sure what to ask next. Let's go back to the beginning. How are you feeling today?";
						response.quickReplies = [{ text: 'Start over', value: 'restart' }];
						response.updatedContext.painAssessmentStage = 'initial';
				}

				resolve(response);
			}, 500); // Simulate half-second delay for response
		});
	};

	return (
		<div className='pain-chatbot'>
			<div className='chatbot-header'>
				<h2 className='chatbot-title'>Pain Assessment</h2>
			</div>

			<div className='chatbot-messages'>
				{messages.map((message, index) => (
					<div
						key={index}
						className={`message ${
							message.sender === 'bot' ? 'bot-message' : 'user-message'
						}`}
					>
						{message.sender === 'bot' && (
							<div className='message-avatar'>
								<img
									src='img/smileyRobo_color.svg'
									alt='Ember'
									width='40'
									height='40'
								/>
							</div>
						)}
						<div className='message-content'>
							<p>{message.text}</p>
						</div>
					</div>
				))}
				<div ref={messagesEndRef} />
			</div>

			{quickReplies.length > 0 && (
				<div className='quick-replies'>
					{quickReplies.map((reply, index) => (
						<button
							key={index}
							className='quick-reply-button'
							onClick={() => handleQuickReply(reply)}
						>
							{reply.text}
						</button>
					))}
				</div>
			)}

			<form className='chatbot-input-form' onSubmit={handleSendMessage}>
				<div className='input-container'>
					<input
						type='text'
						value={userInput}
						onChange={(e) => setUserInput(e.target.value)}
						placeholder='Type your response...'
						className='chatbot-input'
						aria-label='Type your response'
					/>
					<button
						type='button'
						className={`voice-input-button ${isRecording ? 'recording' : ''}`}
						onClick={handleVoiceInput}
						aria-label='Use voice input'
						title='Click to speak your response'
					>
						<svg width='20' height='20' viewBox='0 0 24 24' aria-hidden='true'>
							<path d='M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z' />
							<path d='M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z' />
						</svg>
					</button>
				</div>
				<button type='submit' className='send-button'>
					Send
				</button>
			</form>
		</div>
	);
};

export default PainChatbot;
