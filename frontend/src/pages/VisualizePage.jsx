import React, { useEffect, useState } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import PainVisualization from '../components/PainVisualization'; // Uncommented
import ParkinsonsDemoVisualization from '../components/PainVisualization/ParkinsonsDemoVisualization';

const VisualizePage = () => {
	const [journalEntry, setJournalEntry] = useState('');
	const [loading, setLoading] = useState(true);
	const [trackedCategories, setTrackedCategories] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [timeRange, setTimeRange] = useState('week'); // week, month, 3months, 6months, year
	const [accessibilitySettings, setAccessibilitySettings] = useState({
		highContrast: false,
		simplifiedUI: false,
	});
	const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
	const [useRealAPI, setUseRealAPI] = useState(false); // Toggle between demo and real API

	useEffect(() => {
		// Set page title for accessibility
		document.title = 'Visualize Your Data | Ember';

		// For demo purposes, we'll simulate API success without actual calls
		setTimeout(() => {
			const demoCategories = [
				{ category: 'tremor' },
				{ category: 'lightheadedness' },
				{ category: 'constipation' },
				{ category: 'sleep' },
				{ category: 'mood' },
				{ category: 'energy' },
			];

			setTrackedCategories(demoCategories);
			setSelectedCategory('tremor');
			setLoading(false);
		}, 800);

		// We'll keep the real API code commented but available for future use
		/*
		// Fetch tracked categories from API
		const fetchCategories = async () => {
			try {
				// Try first endpoint
				let response = await fetch(
					'http://localhost:5000/api/tracking-preferences'
				);

				// If that fails, try alternative endpoint
				if (!response.ok) {
					response = await fetch('http://localhost:5000/tracking-preferences');
				}

				if (response.ok) {
					const data = await response.json();
					let categories = [];

					if (data.success && Array.isArray(data.preferences)) {
						categories = data.preferences;
					} else if (Array.isArray(data)) {
						categories = data;
					}

					setTrackedCategories(categories);

					// Set the first category as selected by default if available
					if (categories.length > 0) {
						setSelectedCategory(categories[0].category);
					}
				} else {
					console.error('Failed to fetch tracking categories');
				}
			} catch (error) {
				console.error('Error fetching tracking categories:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchCategories();
		*/

		// Check for user preference for high contrast
		const prefersHighContrast = window.matchMedia(
			'(prefers-contrast: high)'
		).matches;

		if (prefersHighContrast) {
			setAccessibilitySettings((prev) => ({
				...prev,
				highContrast: true,
			}));
		}
	}, []);

	// Handle journal entry submission - simplified for demo
	const handleJournalSubmit = async (e) => {
		e.preventDefault();

		if (!journalEntry.trim()) return;

		try {
			// Simulate successful API call for demo
			await new Promise((resolve) => setTimeout(resolve, 600));

			// Clear the input after successful submission
			setJournalEntry('');
			showStatusMessage(
				'Your observations have been saved to your journal!',
				'success'
			);
		} catch (error) {
			console.error('Error saving journal entry:', error);
			showStatusMessage(
				'Error saving observations. Please try again.',
				'error'
			);
		}
	};

	// Handle category selection change
	const handleCategoryChange = (e) => {
		setSelectedCategory(e.target.value);
	};

	// Handle time range selection change
	const handleTimeRangeChange = (e) => {
		setTimeRange(e.target.value);
	};

	// Toggle accessibility settings
	const toggleAccessibilitySetting = (setting) => {
		setAccessibilitySettings((prev) => ({
			...prev,
			[setting]: !prev[setting],
		}));
	};

	// Show status message
	const showStatusMessage = (text, type) => {
		setStatusMessage({ text, type });

		// Clear message after 5 seconds
		setTimeout(() => {
			setStatusMessage({ text: '', type: '' });
		}, 5000);
	};

	// Toggle between demo and real API (for demonstration purposes)
	const toggleDemoMode = () => {
		setUseRealAPI(!useRealAPI);
	};

	return (
		<div className='visualize-page'>
			<Header />

			<main className='visualize-content'>
				<div className='ho-width-container'>
					<h1>Visualize Your Patterns</h1>
					<p className='intro-text'>
						See your data displayed in easy-to-understand charts and identify
						patterns in your life with Parkinson's.
					</p>

					{/* Demo Mode Toggle (for demonstration purposes) */}
					<div
						className='demo-toggle'
						style={{ margin: '10px 0', textAlign: 'right' }}
					>
						<button
							onClick={toggleDemoMode}
							style={{
								padding: '5px 10px',
								background: useRealAPI ? '#ddd' : '#f0f0f0',
								border: '1px solid #ccc',
								borderRadius: '4px',
							}}
						>
							{useRealAPI ? 'Switch to Demo Mode' : 'Using Demo Mode'}
						</button>
					</div>

					{/* Accessibility Controls */}
					<div className='accessibility-controls'>
						<h2>Accessibility Settings</h2>
						<div className='accessibility-options'>
							<label className='accessibility-option'>
								<input
									type='checkbox'
									checked={accessibilitySettings.highContrast}
									onChange={() => toggleAccessibilitySetting('highContrast')}
								/>
								High Contrast Mode
							</label>
							<label className='accessibility-option'>
								<input
									type='checkbox'
									checked={accessibilitySettings.simplifiedUI}
									onChange={() => toggleAccessibilitySetting('simplifiedUI')}
								/>
								Simplified UI (Larger Text)
							</label>
						</div>
					</div>

					{/* Status Message */}
					{statusMessage.text && (
						<div className={`status-message ${statusMessage.type}`}>
							{statusMessage.text}
						</div>
					)}

					{loading ? (
						<div className='loading-indicator'>Loading your data...</div>
					) : trackedCategories.length === 0 ? (
						<div className='no-data-message'>
							<p>You haven't set up any tracking categories yet.</p>
							<a href='/track.html' className='button'>
								Go to Track Page
							</a>
						</div>
					) : (
						<>
							<div className='visualization-controls'>
								<div className='control-group'>
									<label htmlFor='category-select'>Select Category:</label>
									<select
										id='category-select'
										value={selectedCategory || ''}
										onChange={handleCategoryChange}
										className='category-select'
									>
										{trackedCategories.map((item, index) => (
											<option key={index} value={item.category}>
												{item.category.charAt(0).toUpperCase() +
													item.category.slice(1)}
											</option>
										))}
									</select>
								</div>

								<div className='control-group'>
									<label htmlFor='time-range-select'>Time Range:</label>
									<select
										id='time-range-select'
										value={timeRange}
										onChange={handleTimeRangeChange}
										className='time-range-select'
									>
										<option value='week'>Past Week</option>
										<option value='month'>Past Month</option>
										<option value='3months'>Past 3 Months</option>
										<option value='6months'>Past 6 Months</option>
										<option value='year'>Past Year</option>
									</select>
								</div>
							</div>

							<div className='visualization-container'>
								{selectedCategory &&
									(useRealAPI ? (
										// Use the regular PainVisualization when real API is selected
										<PainVisualization
											category={selectedCategory}
											timeRange={timeRange}
											highContrast={accessibilitySettings.highContrast}
											simplifiedUI={accessibilitySettings.simplifiedUI}
										/>
									) : (
										// Use the demo visualization by default
										<ParkinsonsDemoVisualization
											timeRange={timeRange}
											highContrast={accessibilitySettings.highContrast}
											simplifiedUI={accessibilitySettings.simplifiedUI}
										/>
									))}
							</div>

							<div className='journal-section'>
								<h2>Record Your Observations</h2>
								<p>
									Document your insights about the patterns you observe in your
									data. What do you notice? How do these patterns relate to your
									activities, medication, or other factors?
								</p>

								<form className='journal-form' onSubmit={handleJournalSubmit}>
									<textarea
										value={journalEntry}
										onChange={(e) => setJournalEntry(e.target.value)}
										placeholder='What patterns do you notice? How do these relate to your daily activities or medication?'
										rows={4}
										className='journal-textarea'
										aria-label='Observations about your data patterns'
									/>
									<button
										type='submit'
										className='submit-button'
										disabled={!journalEntry.trim()}
									>
										Save to Journal
									</button>
								</form>
							</div>
						</>
					)}

					<div className='navigation-links'>
						<a href='/track.html' className='nav-link'>
							Track Your Daily Life
						</a>
						<a href='/journal.html' className='nav-link'>
							View Your Journal
						</a>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default VisualizePage;
