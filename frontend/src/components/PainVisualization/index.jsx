import React, { useState, useEffect } from 'react';
import './styles.css';

const PainVisualization = () => {
	// State for selected date range
	const [dateRange, setDateRange] = useState('3months');

	// State for custom date range
	const [customDateRange, setCustomDateRange] = useState({
		startDate: '',
		endDate: '',
	});

	// State for loading status
	const [isLoading, setIsLoading] = useState(true);

	// State for pain data
	const [painData, setPainData] = useState(null);

	// State for insights
	const [insights, setInsights] = useState([]);

	// Load pain data when component mounts or date range changes
	useEffect(() => {
		loadPainData();
	}, [dateRange, customDateRange]);

	// Mock function to load pain data
	const loadPainData = async () => {
		setIsLoading(true);

		try {
			// In a real app, this would be an API call to get data based on date range
			// For demo purposes, we'll use mock data
			setTimeout(() => {
				const mockData = generateMockData();
				setPainData(mockData);
				generateInsights(mockData);
				setIsLoading(false);
			}, 1000);
		} catch (error) {
			console.error('Error loading pain data:', error);
			setIsLoading(false);
		}
	};

	// Function to handle date range selection
	const handleDateRangeChange = (range) => {
		setDateRange(range);

		// Clear custom date range if a predefined range is selected
		setCustomDateRange({
			startDate: '',
			endDate: '',
		});
	};

	// Function to handle custom date range
	const handleCustomDateRange = () => {
		if (customDateRange.startDate && customDateRange.endDate) {
			// Clear predefined date range
			setDateRange('custom');
		}
	};

	// Function to generate mock pain data
	const generateMockData = () => {
		// Get appropriate date range based on selected option
		const endDate = new Date();
		let startDate = new Date();

		switch (dateRange) {
			case 'week':
				startDate.setDate(endDate.getDate() - 7);
				break;
			case 'month':
				startDate.setMonth(endDate.getMonth() - 1);
				break;
			case '3months':
				startDate.setMonth(endDate.getMonth() - 3);
				break;
			case 'year':
				startDate.setFullYear(endDate.getFullYear() - 1);
				break;
			case 'custom':
				startDate = new Date(customDateRange.startDate);
				endDate = new Date(customDateRange.endDate);
				break;
			default:
				startDate.setMonth(endDate.getMonth() - 3);
		}

		// Generate daily pain entries between start and end dates
		const data = [];
		const currentDate = new Date(startDate);

		while (currentDate <= endDate) {
			// Some days might not have entries
			if (Math.random() > 0.2) {
				data.push({
					date: new Date(currentDate),
					painIntensity: Math.floor(Math.random() * 10) + 1,
					location: getRandomLocation(),
					mood: Math.floor(Math.random() * 10) + 1,
					sleepQuality: Math.floor(Math.random() * 10) + 1,
					sleepDuration: Math.floor(Math.random() * 4) + 4, // 4-8 hours
					activities: getRandomActivities(),
					medications: getRandomMedications(),
				});
			}

			currentDate.setDate(currentDate.getDate() + 1);
		}

		return data;
	};

	// Function to generate random pain location
	const getRandomLocation = () => {
		const locations = [
			'Head/Neck',
			'Back',
			'Chest/Abdomen',
			'Arms/Hands',
			'Legs/Feet',
			'Joints',
		];
		return locations[Math.floor(Math.random() * locations.length)];
	};

	// Function to generate random activities
	const getRandomActivities = () => {
		const activities = [
			'Walking',
			'Sitting',
			'Standing',
			'Exercising',
			'Sleeping',
			'Working',
			'Household chores',
		];
		const result = [];
		const numActivities = Math.floor(Math.random() * 3) + 1;

		for (let i = 0; i < numActivities; i++) {
			const randomActivity =
				activities[Math.floor(Math.random() * activities.length)];
			if (!result.includes(randomActivity)) {
				result.push(randomActivity);
			}
		}

		return result;
	};

	// Function to generate random medications
	const getRandomMedications = () => {
		const medications = [
			'Ibuprofen',
			'Acetaminophen',
			'Naproxen',
			'Aspirin',
			'Prescription medication',
			'None',
		];
		const result = [];
		const numMedications = Math.floor(Math.random() * 2);

		for (let i = 0; i < numMedications; i++) {
			const randomMedication =
				medications[Math.floor(Math.random() * medications.length)];
			if (!result.includes(randomMedication)) {
				result.push(randomMedication);
			}
		}

		return result.length > 0 ? result : ['None'];
	};

	// Function to generate insights from pain data
	const generateInsights = (data) => {
		if (!data || data.length === 0) {
			setInsights(['No data available to generate insights.']);
			return;
		}

		const insightsList = [];

		// Calculate average pain intensity
		const avgPainIntensity =
			data.reduce((sum, entry) => sum + entry.painIntensity, 0) / data.length;
		insightsList.push(
			`Your average pain intensity is ${avgPainIntensity.toFixed(1)} out of 10.`
		);

		// Determine most common pain location
		const locationCounts = {};
		data.forEach((entry) => {
			locationCounts[entry.location] =
				(locationCounts[entry.location] || 0) + 1;
		});

		let mostCommonLocation = '';
		let maxCount = 0;

		for (const location in locationCounts) {
			if (locationCounts[location] > maxCount) {
				mostCommonLocation = location;
				maxCount = locationCounts[location];
			}
		}

		insightsList.push(
			`Your most common pain location is ${mostCommonLocation} (${Math.round(
				(maxCount / data.length) * 100
			)}% of entries).`
		);

		// Analyze sleep quality correlation with pain
		const highPainDays = data.filter((entry) => entry.painIntensity >= 7);
		const lowPainDays = data.filter((entry) => entry.painIntensity <= 3);

		if (highPainDays.length > 0 && lowPainDays.length > 0) {
			const avgSleepHighPain =
				highPainDays.reduce((sum, entry) => sum + entry.sleepQuality, 0) /
				highPainDays.length;
			const avgSleepLowPain =
				lowPainDays.reduce((sum, entry) => sum + entry.sleepQuality, 0) /
				lowPainDays.length;

			if (avgSleepHighPain < avgSleepLowPain - 1) {
				insightsList.push(
					`On days with higher pain, your sleep quality tends to be lower (${avgSleepHighPain.toFixed(
						1
					)} vs ${avgSleepLowPain.toFixed(1)} out of 10).`
				);
			} else if (avgSleepLowPain < avgSleepHighPain - 1) {
				insightsList.push(
					`Interestingly, your sleep quality tends to be better on days with higher pain (${avgSleepHighPain.toFixed(
						1
					)} vs ${avgSleepLowPain.toFixed(1)} out of 10).`
				);
			} else {
				insightsList.push(
					`Your sleep quality doesn't seem to be strongly related to your pain levels.`
				);
			}
		}

		// Analyze mood correlation with pain
		if (highPainDays.length > 0 && lowPainDays.length > 0) {
			const avgMoodHighPain =
				highPainDays.reduce((sum, entry) => sum + entry.mood, 0) /
				highPainDays.length;
			const avgMoodLowPain =
				lowPainDays.reduce((sum, entry) => sum + entry.mood, 0) /
				lowPainDays.length;

			if (avgMoodHighPain < avgMoodLowPain - 1) {
				insightsList.push(
					`Your mood tends to be lower on days with higher pain (${avgMoodHighPain.toFixed(
						1
					)} vs ${avgMoodLowPain.toFixed(1)} out of 10).`
				);
			} else {
				insightsList.push(
					`Your mood remains relatively stable regardless of pain intensity.`
				);
			}
		}

		setInsights(insightsList);
	};

	// Function to render charts
	const renderCharts = () => {
		if (isLoading) {
			return (
				<div className='loading-container'>
					<p>Loading your pain data...</p>
				</div>
			);
		}

		if (!painData || painData.length === 0) {
			return (
				<div className='no-data-container'>
					<p>No pain data available for the selected time period.</p>
					<button
						className='ho-button'
						onClick={() => (window.location.href = '/track')}
					>
						Start Tracking Your Pain
					</button>
				</div>
			);
		}

		return (
			<div className='charts-container'>
				<div className='chart-row'>
					<div className='chart-card'>
						<h3 className='chart-title'>Pain Intensity Over Time</h3>
						<div className='chart-placeholder'>
							{/* In a real app, this would be a proper chart component */}
							<div className='mock-line-chart'>
								<div className='mock-axis-y'>
									<span>10</span>
									<span>5</span>
									<span>0</span>
								</div>
								<div className='mock-chart-area'>
									{painData.slice(0, 10).map((entry, index) => (
										<div
											key={index}
											className='mock-data-point'
											style={{
												height: `${entry.painIntensity * 10}%`,
												left: `${index * 10}%`,
											}}
										/>
									))}
								</div>
								<div className='mock-axis-x'>
									<span>Time</span>
								</div>
							</div>
						</div>
					</div>

					<div className='chart-card'>
						<h3 className='chart-title'>Pain Frequency by Location</h3>
						<div className='chart-placeholder'>
							{/* In a real app, this would be a proper chart component */}
							<div className='mock-bar-chart'>
								<div className='mock-axis-y'>
									<span>100%</span>
									<span>50%</span>
									<span>0%</span>
								</div>
								<div className='mock-chart-area'>
									{Object.entries(
										painData.reduce((acc, entry) => {
											acc[entry.location] = (acc[entry.location] || 0) + 1;
											return acc;
										}, {})
									).map(([location, count], index) => (
										<div
											key={index}
											className='mock-bar'
											style={{
												height: `${(count / painData.length) * 100}%`,
												left: `${index * 15 + 5}%`,
												width: '10%',
											}}
										>
											<span className='bar-label'>{location}</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className='chart-row'>
					<div className='chart-card'>
						<h3 className='chart-title'>Pain vs. Sleep Quality</h3>
						<div className='chart-placeholder'>
							{/* In a real app, this would be a proper chart component */}
							<div className='mock-scatter-plot'>
								<div className='mock-axis-y'>
									<span>Sleep Quality</span>
									<span>10</span>
									<span>5</span>
									<span>0</span>
								</div>
								<div className='mock-chart-area'>
									{painData.slice(0, 15).map((entry, index) => (
										<div
											key={index}
											className='mock-scatter-point'
											style={{
												bottom: `${entry.sleepQuality * 10}%`,
												left: `${entry.painIntensity * 10}%`,
											}}
										/>
									))}
								</div>
								<div className='mock-axis-x'>
									<span>0</span>
									<span>5</span>
									<span>10</span>
									<span>Pain Intensity</span>
								</div>
							</div>
						</div>
					</div>

					<div className='chart-card'>
						<h3 className='chart-title'>Mood and Pain Correlation</h3>
						<div className='chart-placeholder'>
							{/* In a real app, this would be a proper chart component */}
							<div className='mock-scatter-plot'>
								<div className='mock-axis-y'>
									<span>Mood</span>
									<span>10</span>
									<span>5</span>
									<span>0</span>
								</div>
								<div className='mock-chart-area'>
									{painData.slice(0, 15).map((entry, index) => (
										<div
											key={index}
											className='mock-scatter-point mood-point'
											style={{
												bottom: `${entry.mood * 10}%`,
												left: `${entry.painIntensity * 10}%`,
											}}
										/>
									))}
								</div>
								<div className='mock-axis-x'>
									<span>0</span>
									<span>5</span>
									<span>10</span>
									<span>Pain Intensity</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	// Render insights section
	const renderInsights = () => {
		if (isLoading) {
			return (
				<p className='insights-loading'>Analyzing your data for insights...</p>
			);
		}

		if (!insights || insights.length === 0) {
			return <p>No insights available for the selected time period.</p>;
		}

		return (
			<ul className='insights-list'>
				{insights.map((insight, index) => (
					<li key={index} className='insight-item'>
						{insight}
					</li>
				))}
			</ul>
		);
	};

	return (
		<div className='pain-visualization'>
			<div className='time-range-controls'>
				<h2 className='section-title'>Select Time Range</h2>
				<div className='range-buttons'>
					<button
						className={`range-button ${dateRange === 'week' ? 'active' : ''}`}
						onClick={() => handleDateRangeChange('week')}
					>
						Last Week
					</button>
					<button
						className={`range-button ${dateRange === 'month' ? 'active' : ''}`}
						onClick={() => handleDateRangeChange('month')}
					>
						Last Month
					</button>
					<button
						className={`range-button ${
							dateRange === '3months' ? 'active' : ''
						}`}
						onClick={() => handleDateRangeChange('3months')}
					>
						Last 3 Months
					</button>
					<button
						className={`range-button ${dateRange === 'year' ? 'active' : ''}`}
						onClick={() => handleDateRangeChange('year')}
					>
						Last Year
					</button>
				</div>

				<div className='custom-date-range'>
					<label className='date-label'>Custom Range:</label>
					<div className='date-inputs'>
						<input
							type='date'
							value={customDateRange.startDate}
							onChange={(e) =>
								setCustomDateRange({
									...customDateRange,
									startDate: e.target.value,
								})
							}
							className='date-input'
							aria-label='Start date'
						/>
						<span className='date-separator'>to</span>
						<input
							type='date'
							value={customDateRange.endDate}
							onChange={(e) =>
								setCustomDateRange({
									...customDateRange,
									endDate: e.target.value,
								})
							}
							className='date-input'
							aria-label='End date'
						/>
						<button
							className='apply-date-button'
							onClick={handleCustomDateRange}
							disabled={!customDateRange.startDate || !customDateRange.endDate}
						>
							Apply
						</button>
					</div>
				</div>
			</div>

			{renderCharts()}

			<div className='insights-section'>
				<h2 className='section-title'>Data Insights</h2>
				<div className='insights-content'>{renderInsights()}</div>
			</div>

			<div className='export-section'>
				<h2 className='section-title'>Export Options</h2>
				<div className='export-buttons'>
					<button className='export-button'>Export as PDF</button>
					<button className='export-button'>Export as CSV</button>
					<button className='export-button'>Share with Doctor</button>
				</div>
			</div>
		</div>
	);
};

export default PainVisualization;
