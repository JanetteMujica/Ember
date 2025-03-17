import React, { useState, useEffect } from 'react';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	BarChart,
	Bar,
} from 'recharts';

const AccessiblePainVisualization = () => {
	const [painData, setPainData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [viewMode, setViewMode] = useState('chart'); // 'chart', 'table', or 'summary'
	const [dateRange, setDateRange] = useState('week'); // 'day', 'week', 'month', 'year'
	const [highContrast, setHighContrast] = useState(false);

	// Simulated data - this would be replaced with actual API data
	useEffect(() => {
		const fetchData = async () => {
			try {
				// In a real implementation, this would fetch data from the backend
				// which would get it from IBM Pain States API
				const mockData = [
					{
						date: '2025-03-10',
						painIntensity: 7,
						sleepQuality: 'severely affected',
						mood: 'irritable',
						activityLevel: 'moderately limited',
					},
					{
						date: '2025-03-11',
						painIntensity: 6,
						sleepQuality: 'moderately affected',
						mood: 'anxious',
						activityLevel: 'moderately limited',
					},
					{
						date: '2025-03-12',
						painIntensity: 8,
						sleepQuality: 'severely affected',
						mood: 'irritable',
						activityLevel: 'severely limited',
					},
					{
						date: '2025-03-13',
						painIntensity: 7,
						sleepQuality: 'severely affected',
						mood: 'sad',
						activityLevel: 'severely limited',
					},
					{
						date: '2025-03-14',
						painIntensity: 5,
						sleepQuality: 'moderately affected',
						mood: 'okay',
						activityLevel: 'moderately limited',
					},
					{
						date: '2025-03-15',
						painIntensity: 4,
						sleepQuality: 'slightly affected',
						mood: 'okay',
						activityLevel: 'slightly limited',
					},
					{
						date: '2025-03-16',
						painIntensity: 6,
						sleepQuality: 'moderately affected',
						mood: 'anxious',
						activityLevel: 'moderately limited',
					},
					{
						date: '2025-03-17',
						painIntensity: 5,
						sleepQuality: 'moderately affected',
						mood: 'okay',
						activityLevel: 'moderately limited',
					},
				];

				// Format data for visualization
				const formattedData = mockData.map((entry) => ({
					date: new Date(entry.date).toLocaleDateString(),
					painIntensity: entry.painIntensity,
					sleepQualityValue: mapSleepQualityToValue(entry.sleepQuality),
					sleepQuality: entry.sleepQuality,
					mood: entry.mood,
					activityLevel: entry.activityLevel,
					activityLevelValue: mapActivityLevelToValue(entry.activityLevel),
				}));

				setPainData(formattedData);
				setLoading(false);
			} catch (err) {
				setError("Couldn't load your pain data. Please try again later.");
				setLoading(false);
			}
		};

		fetchData();
	}, [dateRange]);

	// Helper functions to map text values to numeric for charting
	const mapSleepQualityToValue = (quality) => {
		const map = {
			'not affected': 5,
			'slightly affected': 4,
			'moderately affected': 3,
			'severely affected': 2,
			'cannot sleep': 1,
		};
		return map[quality] || 0;
	};

	const mapActivityLevelToValue = (level) => {
		const map = {
			'not limited': 5,
			'slightly limited': 4,
			'moderately limited': 3,
			'severely limited': 2,
			'unable to perform': 1,
		};
		return map[level] || 0;
	};

	// Get chart colors based on contrast setting
	const getColors = () => {
		if (highContrast) {
			return {
				pain: '#FF0000', // Bright red
				sleep: '#0000FF', // Bright blue
				activity: '#00FF00', // Bright green
				background: '#000000', // Black background
				text: '#FFFFFF', // White text
			};
		}
		return {
			pain: '#FF6B6B',
			sleep: '#4D96FF',
			activity: '#6BCB77',
			background: '#FFFFFF',
			text: '#333333',
		};
	};

	const colors = getColors();

	// Get insights from data
	const getInsights = () => {
		if (!painData.length) return {};

		const avgPain =
			painData.reduce((sum, entry) => sum + entry.painIntensity, 0) /
			painData.length;
		const maxPain = Math.max(...painData.map((entry) => entry.painIntensity));
		const minPain = Math.min(...painData.map((entry) => entry.painIntensity));
		const painTrend =
			painData[painData.length - 1].painIntensity < painData[0].painIntensity
				? 'decreasing'
				: 'increasing';

		return {
			avgPain: avgPain.toFixed(1),
			maxPain,
			minPain,
			painTrend,
		};
	};

	const insights = getInsights();

	// Custom tooltip for better accessibility
	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			return (
				<div className='p-4 bg-white border rounded shadow'>
					<p className='font-bold'>{`Date: ${label}`}</p>
					{payload.map((entry, index) => {
						if (entry.name === 'painIntensity') {
							return (
								<p
									key={index}
									style={{ color: colors.pain }}
								>{`Pain: ${entry.value}/10`}</p>
							);
						}
						if (entry.name === 'sleepQualityValue') {
							const sleepEntry = painData.find((item) => item.date === label);
							return (
								<p
									key={index}
									style={{ color: colors.sleep }}
								>{`Sleep: ${sleepEntry?.sleepQuality}`}</p>
							);
						}
						if (entry.name === 'activityLevelValue') {
							const activityEntry = painData.find(
								(item) => item.date === label
							);
							return (
								<p
									key={index}
									style={{ color: colors.activity }}
								>{`Activity: ${activityEntry?.activityLevel}`}</p>
							);
						}
						return null;
					})}
				</div>
			);
		}
		return null;
	};

	if (loading)
		return <div className='text-center p-4'>Loading your pain data...</div>;
	if (error) return <div className='text-center p-4 text-red-500'>{error}</div>;

	// Render the appropriate view based on viewMode
	const renderContent = () => {
		switch (viewMode) {
			case 'chart':
				return (
					<div className='mb-6'>
						<h3 className='text-xl font-semibold mb-4'>
							Pain Intensity Over Time
						</h3>
						<ResponsiveContainer width='100%' height={300}>
							<LineChart
								data={painData}
								margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
							>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis
									dataKey='date'
									tick={{ fill: colors.text }}
									fontSize={16} // Larger font for better visibility
								/>
								<YAxis
									domain={[0, 10]}
									tick={{ fill: colors.text }}
									fontSize={16}
									label={{
										value: 'Pain (0-10)',
										angle: -90,
										position: 'insideLeft',
										fill: colors.text,
									}}
								/>
								<Tooltip content={<CustomTooltip />} />
								<Legend wrapperStyle={{ fontSize: '16px' }} />
								<Line
									type='monotone'
									dataKey='painIntensity'
									name='Pain Intensity'
									stroke={colors.pain}
									strokeWidth={3} // Thicker line for visibility
									activeDot={{ r: 8 }} // Larger active dot
								/>
								<Line
									type='monotone'
									dataKey='sleepQualityValue'
									name='Sleep Quality'
									stroke={colors.sleep}
									strokeWidth={3}
								/>
								<Line
									type='monotone'
									dataKey='activityLevelValue'
									name='Activity Level'
									stroke={colors.activity}
									strokeWidth={3}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				);
			case 'table':
				return (
					<div className='mb-6'>
						<h3 className='text-xl font-semibold mb-4'>Pain Data Table</h3>
						<div className='overflow-x-auto'>
							<table className='w-full border-collapse border text-lg'>
								<thead>
									<tr className='bg-gray-100'>
										<th className='border p-3 text-left'>Date</th>
										<th className='border p-3 text-left'>Pain Level</th>
										<th className='border p-3 text-left'>Sleep Quality</th>
										<th className='border p-3 text-left'>Mood</th>
										<th className='border p-3 text-left'>Activity Level</th>
									</tr>
								</thead>
								<tbody>
									{painData.map((entry, index) => (
										<tr
											key={index}
											className={index % 2 === 0 ? 'bg-gray-50' : ''}
										>
											<td className='border p-3'>{entry.date}</td>
											<td className='border p-3'>{entry.painIntensity}/10</td>
											<td className='border p-3'>{entry.sleepQuality}</td>
											<td className='border p-3'>{entry.mood}</td>
											<td className='border p-3'>{entry.activityLevel}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				);
			case 'summary':
				return (
					<div className='mb-6'>
						<h3 className='text-xl font-semibold mb-4'>Pain Summary</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='bg-white p-4 rounded-lg shadow border'>
								<h4 className='text-lg font-medium mb-2'>Pain Overview</h4>
								<ul className='space-y-2 text-lg'>
									<li>
										Average pain level:{' '}
										<span className='font-semibold'>{insights.avgPain}/10</span>
									</li>
									<li>
										Highest pain:{' '}
										<span className='font-semibold'>{insights.maxPain}/10</span>
									</li>
									<li>
										Lowest pain:{' '}
										<span className='font-semibold'>{insights.minPain}/10</span>
									</li>
									<li>
										Pain trend:{' '}
										<span className='font-semibold'>{insights.painTrend}</span>
									</li>
								</ul>
							</div>
							<div className='bg-white p-4 rounded-lg shadow border'>
								<h4 className='text-lg font-medium mb-2'>Recommendations</h4>
								<ul className='space-y-2 text-lg'>
									<li>
										Consider discussing with your healthcare provider if your
										pain level is consistently above 5.
									</li>
									<li>Track activities that seem to trigger increased pain.</li>
									<li>
										Note any patterns between sleep quality and pain levels.
									</li>
								</ul>
							</div>
						</div>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div
			className='bg-gray-50 p-6 rounded-lg shadow max-w-4xl mx-auto'
			style={{ background: colors.background, color: colors.text }}
		>
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
				<h2 className='text-2xl font-bold mb-4 md:mb-0'>
					Pain Tracking Dashboard
				</h2>
				<div className='flex flex-col sm:flex-row gap-4'>
					<div className='flex items-center space-x-2'>
						<label htmlFor='dateRange' className='font-medium'>
							Time Range:
						</label>
						<select
							id='dateRange'
							value={dateRange}
							onChange={(e) => setDateRange(e.target.value)}
							className='p-2 border rounded bg-white text-lg'
						>
							<option value='day'>Today</option>
							<option value='week'>Past Week</option>
							<option value='month'>Past Month</option>
							<option value='year'>Past Year</option>
						</select>
					</div>
					<div className='flex items-center space-x-2'>
						<label htmlFor='highContrastToggle' className='font-medium'>
							High Contrast:
						</label>
						<input
							id='highContrastToggle'
							type='checkbox'
							checked={highContrast}
							onChange={() => setHighContrast(!highContrast)}
							className='w-5 h-5'
						/>
					</div>
				</div>
			</div>

			<div className='flex flex-wrap gap-4 mb-6'>
				<button
					onClick={() => setViewMode('chart')}
					className={`px-4 py-2 text-lg rounded-md ${
						viewMode === 'chart'
							? 'bg-blue-600 text-white'
							: 'bg-gray-200 text-gray-800'
					}`}
					aria-pressed={viewMode === 'chart'}
				>
					Chart View
				</button>
				<button
					onClick={() => setViewMode('table')}
					className={`px-4 py-2 text-lg rounded-md ${
						viewMode === 'table'
							? 'bg-blue-600 text-white'
							: 'bg-gray-200 text-gray-800'
					}`}
					aria-pressed={viewMode === 'table'}
				>
					Table View
				</button>
				<button
					onClick={() => setViewMode('summary')}
					className={`px-4 py-2 text-lg rounded-md ${
						viewMode === 'summary'
							? 'bg-blue-600 text-white'
							: 'bg-gray-200 text-gray-800'
					}`}
					aria-pressed={viewMode === 'summary'}
				>
					Summary View
				</button>
			</div>

			{renderContent()}

			<div
				className='mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200'
				role='complementary'
				aria-label='Accessibility features'
			>
				<h3 className='text-lg font-semibold mb-2'>Accessibility Features</h3>
				<ul className='list-disc list-inside space-y-1'>
					<li>Use the Table View for screen reader accessibility</li>
					<li>Toggle High Contrast mode for better visibility</li>
					<li>All buttons and controls are keyboard accessible</li>
					<li>Text size is increased for better readability</li>
				</ul>
			</div>
		</div>
	);
};

export default AccessiblePainVisualization;
