import React, { useEffect } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import PainChatbot from '../components/PainChatbot';

// Main CSS will be imported at the entry point level
// No need to import it here

const TrackPage = () => {
	useEffect(() => {
		// Set page title for accessibility
		document.title = "Track Your Daily Life with Parkinson's | Ember";

		// Ensure page starts at the top
		window.scrollTo(0, 0);
	}, []);

	return (
		<div className='track-page'>
			<Header />

			<main className='track-content'>
				<div className='ho-width-container'>
					<h1>Track Your Daily Life with Parkinson's</h1>
					<p className='intro-text'>
						Record your experiences with Parkinson's to identify patterns, make
						informed decisions, and share detailed information with your
						healthcare providers.
					</p>

					<div className='chatbot-container'>
						<PainChatbot />
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default TrackPage;
