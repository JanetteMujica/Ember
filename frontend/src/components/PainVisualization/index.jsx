// Modified PainVisualization.jsx component with hard-coded data
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const PainVisualization = ({
	category,
	timeRange,
	highContrast = false,
	simplifiedUI = false,
}) => {
	const [visualizationData, setVisualizationData] = useState([]);
	const [journalEvents, setJournalEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [visibleCategories, setVisibleCategories] = useState({});

	// Get all available categories for filtering
	const [allCategories, setAllCategories] = useState([]);

	// HARD-CODED DATA FOR DEMO - Based on James Kane persona
	const HARD_CODED_CATEGORIES = [
		'tremor',
		'lightheadedness',
		'constipation',
		'sleep',
		'mood',
		'energy',
	];

	// Generate dates for the past 2 months
	const generateDates = (daysBack) => {
		const dates = [];
		const today = new Date();

		for (let i = daysBack; i >= 0; i--) {
			const date = new Date();
			date.setDate(today.getDate() - i);
			dates.push(date.toISOString().split('T')[0]);
		}

		return dates;
	};

	const past60Days = generateDates(60);

	// Hard-coded tracking data for James
	const HARD_CODED_TRACKING_DATA = [
		// Tremor - shows pattern of being worse in the morning, better after medication
		...past60Days
			.map((date, index) => {
				// Generate a baseline severity with some randomness
				let morningBaseline = 3 + Math.floor(Math.random() * 2); // 3-4 severity
				let eveningBaseline = 2 + Math.floor(Math.random() * 2); // 2-3 severity

				// Worsen tremor on certain days (creates a pattern)
				if (index % 7 === 0) {
					morningBaseline += 1; // Worse on certain days of the week
				}

				// Pattern related to wine tasting (his hobby)
				const dayOfWeek = new Date(date).getDay();
				if (dayOfWeek === 5) {
					// Friday wine tasting
					eveningBaseline += 1; // Slightly worse in evening after wine
				}

				return [
					{
						id: `tremor-morning-${date}`,
						category: 'tremor',
						timestamp: `${date}T08:30:00.000Z`,
						severity: morningBaseline,
						notes: 'Morning, before medication',
					},
					{
						id: `tremor-evening-${date}`,
						category: 'tremor',
						timestamp: `${date}T19:30:00.000Z`,
						severity: eveningBaseline,
						notes: 'Evening, after daily activities',
					},
				];
			})
			.flat(),

		// Lightheadedness - worse when standing too quickly
		...past60Days.map((date, index) => {
			// Create a pattern with some randomness
			const baseline = 2 + Math.floor(Math.random() * 2);

			// Worse on days with high physical activity
			let severity = baseline;
			if ([2, 4].includes(new Date(date).getDay())) {
				// More active on Tuesdays and Thursdays
				severity += 1;
			}

			// Occasional more severe episodes
			if (index % 10 === 0) {
				severity = Math.min(severity + 2, 5);
			}

			return {
				id: `lightheaded-${date}`,
				category: 'lightheadedness',
				timestamp: `${date}T12:00:00.000Z`,
				severity: severity,
				notes:
					severity > 3
						? 'Felt very dizzy when standing up'
						: 'Mild dizziness when changing positions',
			};
		}),

		// Constipation - irregular pattern
		...past60Days
			.filter((_, index) => index % 3 === 0)
			.map((date, index) => {
				return {
					id: `constipation-${date}`,
					category: 'constipation',
					timestamp: `${date}T09:00:00.000Z`,
					severity: 2 + Math.floor(Math.random() * 3),
					notes: 'Digestive discomfort noted',
				};
			}),

		// Sleep quality
		...past60Days.map((date, index) => {
			// Base sleep pattern
			let sleepQuality = 3 - Math.floor(Math.random() * 2); // 2-3 range (higher is better)

			// Sleep affected by tremor severity
			if (index % 7 === 0 || index % 7 === 1) {
				sleepQuality -= 1; // Worse sleep after days with worse tremors
			}

			// Sleep improves after medication adjustments (see events below)
			if (date >= '2025-03-10' && date <= '2025-03-20') {
				sleepQuality -= 1; // Worse during medication adjustment
			} else if (date > '2025-03-20') {
				sleepQuality += 1; // Better after new medication routine
			}

			// Cap values
			sleepQuality = Math.max(1, Math.min(5, sleepQuality));

			return {
				id: `sleep-${date}`,
				category: 'sleep',
				timestamp: `${date}T07:00:00.000Z`,
				severity: 6 - sleepQuality, // Invert scale for visualization (5 = worst sleep)
				notes: sleepQuality > 3 ? 'Slept well' : 'Disrupted sleep',
			};
		}),

		// Mood tracking
		...past60Days
			.filter((_, index) => index % 2 === 0)
			.map((date) => {
				const dayOfWeek = new Date(date).getDay();
				let mood = 3; // baseline mood

				// Better mood on weekends when with family
				if (dayOfWeek === 0 || dayOfWeek === 6) {
					mood = 2; // Better mood (lower severity)
				}

				// Mood affected by special events
				if (date === '2025-03-15') {
					// Grandkids visit
					mood = 1;
				} else if (date === '2025-03-08') {
					// Doctor appointment day
					mood = 4;
				}

				return {
					id: `mood-${date}`,
					category: 'mood',
					timestamp: `${date}T18:00:00.000Z`,
					severity: mood,
					notes:
						mood <= 2
							? 'Feeling positive'
							: mood >= 4
							? 'Feeling frustrated'
							: 'Neutral mood',
				};
			}),

		// Energy levels
		...past60Days
			.filter((_, index) => index % 2 === 0)
			.map((date) => {
				const dayOfWeek = new Date(date).getDay();
				let energyLevel = 3; // baseline energy (higher number = lower energy)

				// Energy patterns
				if ([1, 3, 5].includes(dayOfWeek)) {
					// Mon, Wed, Fri - exercise days
					energyLevel = 2; // Better energy after exercise
				}

				// Energy affected by medication timing
				if (date >= '2025-03-20') {
					// After medication adjustment
					energyLevel -= 1; // Improved energy
				}

				// Cap values
				energyLevel = Math.max(1, Math.min(5, energyLevel));

				return {
					id: `energy-${date}`,
					category: 'energy',
					timestamp: `${date}T15:00:00.000Z`,
					severity: energyLevel,
					notes:
						energyLevel <= 2
							? 'Good energy today'
							: energyLevel >= 4
							? 'Very fatigued'
							: 'Moderate energy levels',
				};
			}),
	];

	// Hard-coded events (medication changes, appointments, etc.)
	const HARD_CODED_EVENTS = [
		{
			id: 'event-1',
			type: 'event',
			eventType: 'doctor_appointment',
			timestamp: '2025-03-08T14:30:00.000Z',
			content:
				'Neurologist appointment. Dr. Williams observed increased tremor in the morning. Discussed potential medication timing adjustment.',
			tags: ['appointment', 'tremor', 'medication'],
		},
		{
			id: 'event-2',
			type: 'event',
			eventType: 'medication_change',
			timestamp: '2025-03-10T09:00:00.000Z',
			content:
				'Started adjusted Carbidopa/Levodopa schedule. Taking first dose earlier (6am instead of 8am) to address morning tremors.',
			tags: ['medication', 'tremor', 'treatment'],
		},
		{
			id: 'event-3',
			type: 'event',
			eventType: 'physical_therapy',
			timestamp: '2025-03-12T11:00:00.000Z',
			content:
				'Physical therapy session focused on balance exercises to prevent falls. Therapist recommended daily practice of standing from seated position with proper technique.',
			tags: ['exercise', 'balance', 'falls'],
		},
		{
			id: 'event-4',
			type: 'event',
			eventType: 'family_activity',
			timestamp: '2025-03-15T13:00:00.000Z',
			content:
				'Grandchildren visited. Noticed less tremor while engaged in board games with them. Mental engagement seems to help symptoms temporarily.',
			tags: ['family', 'tremor', 'observation'],
		},
		{
			id: 'event-5',
			type: 'event',
			eventType: 'medication_change',
			timestamp: '2025-03-20T09:00:00.000Z',
			content:
				'Adjusted evening dose timing to help with sleep. Taking last dose at 7pm instead of 8pm to reduce nighttime restlessness.',
			tags: ['medication', 'sleep', 'treatment'],
		},
		{
			id: 'event-6',
			type: 'event',
			eventType: 'wine_tasting',
			timestamp: '2025-03-22T18:30:00.000Z',
			content:
				'Wine tasting event with local club. Used adaptive glass holder to manage tremor. Found the stemless glasses easier to handle.',
			tags: ['hobby', 'adaptation', 'tremor'],
		},
		{
			id: 'event-7',
			type: 'event',
			eventType: 'support_group',
			timestamp: '2025-03-25T15:00:00.000Z',
			content:
				"Parkinson's support group meeting. Shared experience with medication timing adjustments. Learned about new balance techniques from other members.",
			tags: ['support', 'learning', 'community'],
		},
		{
			id: 'event-8',
			type: 'event',
			eventType: 'fall_incident',
			timestamp: '2025-03-28T07:45:00.000Z',
			content:
				'Minor fall when getting out of bed too quickly. No injuries, but reinforced need to move more deliberately in the morning when lightheadedness is worse.',
			tags: ['fall', 'lightheadedness', 'morning'],
		},
		{
			id: 'event-9',
			type: 'event',
			eventType: 'nutrition_change',
			timestamp: '2025-04-01T12:00:00.000Z',
			content:
				'Started increasing fiber intake to help with constipation. Added prune juice to morning routine and more vegetables to lunch.',
			tags: ['diet', 'constipation', 'self-management'],
		},
	];

	useEffect(() => {
		// Simulate API fetch with hard-coded data
		setLoading(true);

		// Short timeout to simulate loading
		setTimeout(() => {
			try {
				// Set categories
				setAllCategories(HARD_CODED_CATEGORIES);

				// Initialize visible categories
				const initialVisibility = {};
				HARD_CODED_CATEGORIES.forEach((cat) => {
					initialVisibility[cat] = true;
				});
				setVisibleCategories(initialVisibility);

				// Filter data based on timeRange
				const now = new Date();
				let startDate;

				switch (timeRange) {
					case 'week':
						startDate = new Date(now.setDate(now.getDate() - 7));
						break;
					case 'month':
						startDate = new Date(now.setMonth(now.getMonth() - 1));
						break;
					case '3months':
						startDate = new Date(now.setMonth(now.getMonth() - 3));
						break;
					case '6months':
						startDate = new Date(now.setMonth(now.getMonth() - 6));
						break;
					case 'year':
						startDate = new Date(now.setFullYear(now.getFullYear() - 1));
						break;
					default:
						startDate = new Date(now.setDate(now.getDate() - 7));
				}

				// Filter entries by date
				const filteredData = HARD_CODED_TRACKING_DATA.filter((entry) => {
					const entryDate = new Date(entry.timestamp);
					return entryDate >= startDate;
				});

				// Filter events by date
				const filteredEvents = HARD_CODED_EVENTS.filter((entry) => {
					const entryDate = new Date(entry.timestamp);
					return entryDate >= startDate;
				});

				setVisualizationData(filteredData);
				setJournalEvents(filteredEvents);
			} catch (err) {
				console.error('Error processing visualization data:', err);
				setError('Failed to load visualization data. Please try again later.');
				setVisualizationData([]);
				setJournalEvents([]);
			} finally {
				setLoading(false);
			}
		}, 800); // Simulate API delay
	}, [category, timeRange]);

	// Rest of your component remains the same...
	// Toggle visibility function
	const toggleCategoryVisibility = (cat) => {
		setVisibleCategories({
			...visibleCategories,
			[cat]: !visibleCategories[cat],
		});
	};

	// Get dates for the x-axis based on timeRange
	const getDates = () => {
		const dates = [];
		const now = new Date();
		const startDate = new Date();

		switch (timeRange) {
			case 'week':
				startDate.setDate(now.getDate() - 7);
				for (let i = 0; i <= 7; i++) {
					const date = new Date(startDate);
					date.setDate(startDate.getDate() + i);
					dates.push(date);
				}
				break;
			case 'month':
				startDate.setMonth(now.getMonth() - 1);
				for (let i = 0; i <= 30; i++) {
					const date = new Date(startDate);
					date.setDate(startDate.getDate() + i);
					dates.push(date);
				}
				break;
			case '3months':
				startDate.setMonth(now.getMonth() - 3);
				// Add bi-weekly dates
				while (startDate <= now) {
					dates.push(new Date(startDate));
					startDate.setDate(startDate.getDate() + 14);
				}
				break;
			case '6months':
				startDate.setMonth(now.getMonth() - 6);
				// Add monthly dates
				while (startDate <= now) {
					dates.push(new Date(startDate));
					startDate.setMonth(startDate.getMonth() + 1);
				}
				break;
			case 'year':
				startDate.setFullYear(now.getFullYear() - 1);
				// Add monthly dates
				while (startDate <= now) {
					dates.push(new Date(startDate));
					startDate.setMonth(startDate.getMonth() + 1);
				}
				break;
			default:
				startDate.setDate(now.getDate() - 7);
				for (let i = 0; i <= 7; i++) {
					const date = new Date(startDate);
					date.setDate(startDate.getDate() + i);
					dates.push(date);
				}
		}

		return dates;
	};

	// Format date for display
	const formatDate = (date) => {
		if (timeRange === 'week') {
			return date.toLocaleDateString('en-US', {
				weekday: 'short',
				month: 'numeric',
				day: 'numeric',
			});
		} else if (timeRange === 'month') {
			return date.toLocaleDateString('en-US', {
				month: 'numeric',
				day: 'numeric',
			});
		} else {
			return date.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
			});
		}
	};

	// Get entries for a specific date and category
	const getEntriesForDate = (date, cat) => {
		const startOfDay = new Date(date);
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date(date);
		endOfDay.setHours(23, 59, 59, 999);

		return visualizationData.filter((entry) => {
			const entryDate = new Date(entry.timestamp);
			return (
				entryDate >= startOfDay &&
				entryDate <= endOfDay &&
				entry.category === cat
			);
		});
	};

	// Get journal events for a specific date
	const getEventsForDate = (date) => {
		const startOfDay = new Date(date);
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date(date);
		endOfDay.setHours(23, 59, 59, 999);

		return journalEvents.filter((event) => {
			const eventDate = new Date(event.timestamp);
			return eventDate >= startOfDay && eventDate <= endOfDay;
		});
	};

	// Create formatted tooltip content for event markers
	const createEventTooltip = (events) => {
		if (!events || events.length === 0) return '';

		// If there's only one event, show more details
		if (events.length === 1) {
			const event = events[0];
			const eventType = event.eventType
				? event.eventType.replace('_', ' ')
				: 'Event';
			// Truncate content if it's too long for tooltip
			const shortContent =
				event.content.length > 80
					? event.content.substring(0, 80) + '...'
					: event.content;
			return `${eventType}: ${shortContent}`;
		}

		// If multiple events, show a summary
		return `${events.length} events: ${events
			.map((e) => (e.eventType ? e.eventType.replace('_', ' ') : 'Event'))
			.join(', ')}`;
	};

	// Then in the rendering part, update the event marker JSX:

	{
		events.length > 0 && (
			<div
				className='event-marker'
				title={createEventTooltip(events)}
				aria-label={createEventTooltip(events)}
			>
				!
			</div>
		);
	}

	// Get color for severity level
	const getSeverityColor = (severity, highContrast) => {
		if (highContrast) {
			switch (severity) {
				case 1:
					return '#000000';
				case 2:
					return '#333333';
				case 3:
					return '#666666';
				case 4:
					return '#999999';
				case 5:
					return '#CCCCCC';
				default:
					return '#EEEEEE';
			}
		} else {
			switch (severity) {
				case 1:
					return '#E3F2FD';
				case 2:
					return '#90CAF9';
				case 3:
					return '#42A5F5';
				case 4:
					return '#1E88E5';
				case 5:
					return '#0D47A1';
				default:
					return '#E3F2FD';
			}
		}
	};

	// Compute maximum severity for a given set of entries
	const getMaxSeverity = (entries) => {
		if (!entries || entries.length === 0) return 0;
		return Math.max(...entries.map((entry) => entry.severity));
	};

	// Render loading state
	if (loading) {
		return (
			<div className='visualization-loading'>
				<p>Loading your data...</p>
			</div>
		);
	}

	// Render error state
	if (error) {
		return (
			<div className='visualization-error'>
				<p>{error}</p>
			</div>
		);
	}

	// Render empty state
	if (visualizationData.length === 0) {
		return (
			<div className='visualization-empty'>
				<p>
					No data available for the selected time range. Start tracking to see
					your patterns!
				</p>
			</div>
		);
	}

	// Get dates for x-axis
	const dates = getDates();

	return (
		<div
			className={`pain-visualization ${highContrast ? 'high-contrast' : ''} ${
				simplifiedUI ? 'simplified' : ''
			}`}
		>
			<div className='category-toggles'>
				<h3>Toggle Categories:</h3>
				<div className='toggle-buttons'>
					{allCategories.map((cat) => (
						<button
							key={cat}
							className={`toggle-button ${
								visibleCategories[cat] ? 'active' : 'inactive'
							}`}
							onClick={() => toggleCategoryVisibility(cat)}
						>
							{cat.charAt(0).toUpperCase() + cat.slice(1)}
						</button>
					))}
				</div>
			</div>

			<div className='histogram-container'>
				<div className='histogram-legend'>
					<h3>Severity Level:</h3>
					<div className='legend-items'>
						<div className='legend-item'>
							<span
								className='legend-color'
								style={{ backgroundColor: getSeverityColor(1, highContrast) }}
							></span>
							<span className='legend-label'>1 (Minimal)</span>
						</div>
						<div className='legend-item'>
							<span
								className='legend-color'
								style={{ backgroundColor: getSeverityColor(2, highContrast) }}
							></span>
							<span className='legend-label'>2 (Mild)</span>
						</div>
						<div className='legend-item'>
							<span
								className='legend-color'
								style={{ backgroundColor: getSeverityColor(3, highContrast) }}
							></span>
							<span className='legend-label'>3 (Moderate)</span>
						</div>
						<div className='legend-item'>
							<span
								className='legend-color'
								style={{ backgroundColor: getSeverityColor(4, highContrast) }}
							></span>
							<span className='legend-label'>4 (Significant)</span>
						</div>
						<div className='legend-item'>
							<span
								className='legend-color'
								style={{ backgroundColor: getSeverityColor(5, highContrast) }}
							></span>
							<span className='legend-label'>5 (Severe)</span>
						</div>
					</div>
				</div>

				<div className='histogram-chart'>
					{/* X-axis: Dates */}
					<div className='histogram-dates'>
						{dates.map((date, index) => (
							<div key={index} className='date-label'>
								{formatDate(date)}
							</div>
						))}
					</div>

					{/* Y-axis: Categories and data */}
					<div className='histogram-data'>
						{allCategories
							.filter((cat) => visibleCategories[cat])
							.map((cat) => (
								<div key={cat} className='category-row'>
									<div className='category-label'>
										{cat.charAt(0).toUpperCase() + cat.slice(1)}
									</div>
									<div className='severity-bars'>
										{dates.map((date, index) => {
											const entries = getEntriesForDate(date, cat);
											const maxSeverity = getMaxSeverity(entries);
											const events = getEventsForDate(date);

											return (
												<div key={index} className='date-cell'>
													{maxSeverity > 0 && (
														<div
															className='severity-bar'
															style={{
																backgroundColor: getSeverityColor(
																	maxSeverity,
																	highContrast
																),
																height: `${maxSeverity * 20}px`,
															}}
															title={`${cat}: Level ${maxSeverity} on ${formatDate(
																date
															)}`}
														>
															{maxSeverity}
														</div>
													)}
													{events.length > 0 && (
														<div
															className='event-marker'
															title='Event recorded on this date'
														>
															!
														</div>
													)}
												</div>
											);
										})}
									</div>
								</div>
							))}
					</div>
				</div>
			</div>

			{/* Events Timeline */}
			{journalEvents.length > 0 && (
				<div className='events-timeline'>
					<h3>Events Timeline</h3>
					<div className='timeline-entries'>
						{journalEvents.map((event, index) => (
							<div key={index} className='timeline-entry'>
								<div className='timeline-date'>
									{new Date(event.timestamp).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'short',
										day: 'numeric',
									})}
								</div>
								<div className='timeline-content'>
									<div className='timeline-type'>
										{event.eventType
											? event.eventType.replace('_', ' ')
											: 'Event'}
									</div>
									<div className='timeline-text'>{event.content}</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

PainVisualization.propTypes = {
	category: PropTypes.string,
	timeRange: PropTypes.string,
	highContrast: PropTypes.bool,
	simplifiedUI: PropTypes.bool,
};

export default PainVisualization;
