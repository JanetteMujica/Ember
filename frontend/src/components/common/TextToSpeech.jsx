import React, { useState, useEffect, useRef } from 'react';

const TextToSpeech = () => {
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [currentText, setCurrentText] = useState('');
	const [availableVoices, setAvailableVoices] = useState([]);
	const [selectedVoice, setSelectedVoice] = useState(null);
	const [speechRate, setSpeechRate] = useState(1);
	const [isExpanded, setIsExpanded] = useState(false);

	const synth = useRef(window.speechSynthesis);
	const utterance = useRef(null);

	// Initialize and get available voices
	useEffect(() => {
		const initVoices = () => {
			const voices = synth.current.getVoices();
			setAvailableVoices(voices);

			// Set a default voice (preferably English)
			const englishVoice = voices.find((voice) => voice.lang.startsWith('en-'));
			setSelectedVoice(englishVoice || voices[0]);
		};

		// Some browsers need to wait for the voiceschanged event
		if (synth.current.onvoiceschanged !== undefined) {
			synth.current.onvoiceschanged = initVoices;
		}

		// Initial call to handle browsers where the event doesn't fire
		initVoices();

		// Clean up function to stop speech when component unmounts
		return () => {
			if (isSpeaking) {
				synth.current.cancel();
			}
		};
	}, []);

	// Function to gather all text from the page
	const getAllPageText = () => {
		// Focus on main content areas
		const contentSelectors = [
			'.ho-width-container h1',
			'.ho-width-container h2',
			'.ho-width-container h3',
			'.ho-width-container p',
			'.ho-width-container li',
			'.journal-entries .journal-entry',
			'.visualization-container',
			'.chat-messages .chat-message',
			'.chat-input .message-input',
		];

		let pageText = '';

		// Get text from each selector
		contentSelectors.forEach((selector) => {
			const elements = document.querySelectorAll(selector);
			elements.forEach((element) => {
				// Skip hidden elements
				if (element.offsetParent !== null) {
					pageText += element.textContent + '. ';
				}
			});
		});

		return pageText;
	};

	// Start speaking
	const startSpeaking = () => {
		// Stop any current speech
		synth.current.cancel();

		// Get all text from the page
		const pageText = getAllPageText();
		setCurrentText(pageText);

		// Create new utterance
		utterance.current = new SpeechSynthesisUtterance(pageText);

		// Set voice and rate
		if (selectedVoice) {
			utterance.current.voice = selectedVoice;
		}
		utterance.current.rate = speechRate;

		// Set event handlers
		utterance.current.onend = () => {
			setIsSpeaking(false);
			setIsPaused(false);
		};

		utterance.current.onerror = (event) => {
			console.error('Speech synthesis error:', event);
			setIsSpeaking(false);
			setIsPaused(false);
		};

		// Start speaking
		synth.current.speak(utterance.current);
		setIsSpeaking(true);
		setIsPaused(false);
	};

	// Pause speaking
	const pauseSpeaking = () => {
		synth.current.pause();
		setIsPaused(true);
	};

	// Resume speaking
	const resumeSpeaking = () => {
		synth.current.resume();
		setIsPaused(false);
	};

	// Stop speaking
	const stopSpeaking = () => {
		synth.current.cancel();
		setIsSpeaking(false);
		setIsPaused(false);
	};

	// Toggle between expanded and collapsed state
	const toggleExpanded = () => {
		setIsExpanded(!isExpanded);
	};

	// Handle voice change
	const handleVoiceChange = (e) => {
		const voiceName = e.target.value;
		const voice = availableVoices.find((v) => v.name === voiceName);
		setSelectedVoice(voice);
	};

	// Handle rate change
	const handleRateChange = (e) => {
		setSpeechRate(parseFloat(e.target.value));
	};

	return (
		<div
			className={`text-to-speech-widget ${
				isExpanded ? 'expanded' : 'collapsed'
			}`}
		>
			<button
				className='tts-toggle-button'
				onClick={toggleExpanded}
				aria-label={
					isExpanded
						? 'Collapse text-to-speech controls'
						: 'Expand text-to-speech controls'
				}
			>
				{isExpanded ? '×' : '🔊'}
			</button>

			{isExpanded && (
				<div className='tts-controls'>
					<h3>Text-to-Speech</h3>

					<div className='tts-buttons'>
						{!isSpeaking ? (
							<button
								className='tts-button start'
								onClick={startSpeaking}
								aria-label='Start reading page'
							>
								Read Page
							</button>
						) : isPaused ? (
							<button
								className='tts-button resume'
								onClick={resumeSpeaking}
								aria-label='Resume reading'
							>
								Resume
							</button>
						) : (
							<button
								className='tts-button pause'
								onClick={pauseSpeaking}
								aria-label='Pause reading'
							>
								Pause
							</button>
						)}

						{isSpeaking && (
							<button
								className='tts-button stop'
								onClick={stopSpeaking}
								aria-label='Stop reading'
							>
								Stop
							</button>
						)}
					</div>

					<div className='tts-settings'>
						<div className='tts-setting'>
							<label htmlFor='voice-select'>Voice:</label>
							<select
								id='voice-select'
								value={selectedVoice ? selectedVoice.name : ''}
								onChange={handleVoiceChange}
								disabled={isSpeaking && !isPaused}
							>
								{availableVoices.map((voice) => (
									<option key={voice.name} value={voice.name}>
										{voice.name} ({voice.lang})
									</option>
								))}
							</select>
						</div>

						<div className='tts-setting'>
							<label htmlFor='rate-slider'>Speed:</label>
							<input
								id='rate-slider'
								type='range'
								min='0.5'
								max='2'
								step='0.1'
								value={speechRate}
								onChange={handleRateChange}
								disabled={isSpeaking && !isPaused}
							/>
							<span className='rate-value'>{speechRate}x</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default TextToSpeech;
