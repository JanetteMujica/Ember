import React, { useState } from 'react';

const ParkinsonsDemoVisualization = ({
	timeRange = 'month',
	highContrast = false,
	simplifiedUI = false,
}) => {
	// Sample data for demonstration
	const categories = [
		'tremor',
		'lightheadedness',
		'constipation',
		'sleep',
		'mood',
		'energy',
	];

	// Sample events with descriptions for tooltips
	const demoEvents = [
		{
			id: 'event-1',
			date: new Date('2025-03-08'),
			type: 'doctor_appointment',
			description:
				'Neurologist appointment with Dr. Williams. Discussed medication timing adjustment.',
		},
		{
			id: 'event-2',
			date: new Date('2025-03-10'),
			type: 'medication_change',
			description:
				'Started taking first Carbidopa/Levodopa dose earlier (6am instead of 8am).',
		},
		{
			id: 'event-3',
			date: new Date('2025-03-12'),
			type: 'physical_therapy',
			description:
				'Physical therapy session focused on balance exercises to prevent falls.',
		},
		{
			id: 'event-4',
			date: new Date('2025-03-15'),
			type: 'family_activity',
			description:
				'Grandchildren visit. Observed less tremor during focused board games.',
		},
		{
			id: 'event-5',
			date: new Date('2025-03-20'),
			type: 'medication_change',
			description:
				'Adjusted evening dose timing to help with sleep (7pm instead of 8pm).',
		},
		{
			id: 'event-6',
			date: new Date('2025-03-22'),
			type: 'wine_tasting',
			description:
				'Wine tasting with local club. Used adaptive stemless glasses successfully.',
		},
		{
			id: 'event-7',
			date: new Date('2025-03-25'),
			type: 'support_group',
			description:
				"Parkinson's support group meeting. Shared medication timing experiences.",
		},
		{
			id: 'event-8',
			date: new Date('2025-03-28'),
			type: 'fall_incident',
			description:
				'Minor fall when getting out of bed too quickly. No injuries, reminder to move deliberately.',
		},
		{
			id: 'event-9',
			date: new Date('2025-04-01'),
			type: 'nutrition_change',
			description:
				'Started increasing fiber intake to help with constipation. Added prune juice to routine.',
		},
	];

	// Create a sample dataset to visualize
	const generateDataPoints = () => {
		const dateRange = 30; // Show 30 days of data
		const today = new Date();
		const dataPoints = [];

		// Generate dates
		for (let i = 0; i < dateRange; i++) {
			const date = new Date();
			date.setDate(today.getDate() - dateRange + i);

			// Find events for this date
			const eventsForDate = demoEvents.filter(
				(event) => event.date.toDateString() === date.toDateString()
			);

			// Add visualization point
			dataPoints.push({
				date,
				events: eventsForDate,
				values: {
					tremor: Math.floor(Math.random() * 5) + 1,
					lightheadedness: Math.floor(Math.random() * 5) + 1,
					constipation: Math.floor(Math.random() * 5) + 1,
					sleep: Math.floor(Math.random() * 5) + 1,
					mood: Math.floor(Math.random() * 5) + 1,
					energy: Math.floor(Math.random() * 5) + 1,
				},
			});
		}

		return dataPoints;
	};

	const dataPoints = generateDataPoints();

	return (
		<div
			className={`demo-visualization ${highContrast ? 'high-contrast' : ''} ${
				simplifiedUI ? 'simplified' : ''
			}`}
		>
			<div className='visualization-header'>
				<h2>James Kane's Symptom Tracking ({timeRange} view)</h2>
				<p>Drag mouse over data points or event markers (!) for details</p>
			</div>

			<div className='visualization-grid'>
				{categories.map((category) => (
					<div key={category} className='category-row'>
						<div className='category-label'>
							{category.charAt(0).toUpperCase() + category.slice(1)}
						</div>
						<div className='data-points'>
							{dataPoints.map((point, index) => (
								<div key={index} className='data-point-cell'>
									{/* Severity bar with tooltip */}
									<div
										className='severity-bar'
										style={{
											height: `${point.values[category] * 15}px`,
											backgroundColor: highContrast
												? `rgb(${255 - point.values[category] * 50}, ${
														255 - point.values[category] * 50
												  }, ${255 - point.values[category] * 50})`
												: `rgb(${215 - point.values[category] * 30}, ${
														235 - point.values[category] * 25
												  }, 255)`,
										}}
										title={`${category}: Level ${
											point.values[category]
										} on ${point.date.toLocaleDateString()}`}
									>
										{point.values[category]}
									</div>

									{/* Event marker with enhanced tooltip */}
									{point.events.length > 0 && (
										<div
											className='event-marker'
											title={point.events
												.map(
													(e) => `${e.type.replace('_', ' ')}: ${e.description}`
												)
												.join('\n')}
										>
											!
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				))}
			</div>

			<div className='event-timeline'>
				<h3>Recent Events</h3>
				<div className='timeline-entries'>
					{demoEvents.slice(0, 5).map((event) => (
						<div key={event.id} className='timeline-entry'>
							<div className='event-date'>
								{event.date.toLocaleDateString()}
							</div>
							<div className='event-type'>{event.type.replace('_', ' ')}</div>
							<div className='event-description'>{event.description}</div>
						</div>
					))}
				</div>
			</div>

			<style jsx>{`
				.demo-visualization {
					font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
						Oxygen, Ubuntu, Cantarell, sans-serif;
					padding: 20px;
					border-radius: 8px;
					background-color: #f9f9f9;
					box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
				}

				.high-contrast {
					background-color: #ffffff;
					color: #000000;
				}

				.simplified {
					font-size: 1.2em;
				}

				.visualization-header {
					margin-bottom: 20px;
				}

				.visualization-header h2 {
					margin-bottom: 5px;
				}

				.visualization-header p {
					color: #666;
					font-size: 0.9em;
				}

				.visualization-grid {
					display: flex;
					flex-direction: column;
					margin-bottom: 30px;
				}

				.category-row {
					display: flex;
					margin-bottom: 15px;
					align-items: center;
				}

				.category-label {
					width: 150px;
					font-weight: bold;
				}

				.data-points {
					display: flex;
					flex-grow: 1;
					height: 100px;
					align-items: flex-end;
				}

				.data-point-cell {
					flex: 1;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: flex-end;
					height: 100%;
					position: relative;
				}

				.severity-bar {
					width: 80%;
					min-height: 15px;
					display: flex;
					align-items: center;
					justify-content: center;
					color: white;
					font-weight: bold;
					text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
					border-radius: 3px;
				}

				.event-marker {
					position: absolute;
					top: 0;
					width: 20px;
					height: 20px;
					background-color: #ff5722;
					color: white;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					font-weight: bold;
					cursor: help;
					box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
				}

				.event-timeline {
					border-top: 1px solid #ddd;
					padding-top: 20px;
				}

				.timeline-entries {
					display: flex;
					flex-direction: column;
					gap: 10px;
				}

				.timeline-entry {
					display: flex;
					gap: 15px;
					padding: 10px;
					background-color: #f0f0f0;
					border-radius: 4px;
				}

				.event-date {
					font-weight: bold;
					min-width: 100px;
				}

				.event-type {
					min-width: 150px;
					font-weight: 500;
					color: #555;
				}

				.event-description {
					flex-grow: 1;
				}

				/* Additional styles for high contrast mode */
				.high-contrast .event-marker {
					background-color: #000000;
					border: 2px solid #ffffff;
				}

				.high-contrast .timeline-entry {
					background-color: #dddddd;
					border: 1px solid #000000;
				}
			`}</style>
		</div>
	);
};

export default ParkinsonsDemoVisualization;
