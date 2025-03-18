const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const IBM_PAIN_API_KEY = process.env.IBM_PAIN_API_KEY;
const IBM_PAIN_API_URL =
	process.env.IBM_PAIN_API_URL ||
	'https://api.digitalhealth.ibm.com/pain-states/api/v1';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data directory
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
	fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Routes

// Get patient pain reports
app.get('/api/pain-reports/:patientId', (req, res) => {
	const { patientId } = req.params;
	const { timeframe } = req.query; // day, week, month, year

	try {
		// First, try to fetch from IBM Pain States API
		fetchFromIBMPainStates(patientId, timeframe)
			.then((data) => {
				res.status(200).json(data);
			})
			.catch((err) => {
				console.error(
					'Error fetching from IBM API, falling back to local data',
					err
				);
				// Fallback to local data
				const localData = fetchLocalPainReports(patientId, timeframe);
				res.status(200).json(localData);
			});
	} catch (error) {
		console.error('Error fetching pain reports:', error);
		res.status(500).json({ error: 'Failed to fetch pain reports' });
	}
});

// Save a new pain report
app.post('/api/pain-reports', async (req, res) => {
	const reportData = req.body;

	if (!reportData.patient_id || !reportData.pain_data) {
		return res.status(400).json({ error: 'Missing required fields' });
	}

	try {
		// Try to save to IBM Pain States API first
		const ibmResponse = await saveToIBMPainStates(reportData);

		// Always save locally as a backup
		const localSaveSuccess = saveLocalPainReport(reportData);

		if (ibmResponse.success) {
			res.status(201).json({
				success: true,
				report_id: ibmResponse.report_id,
				message:
					'Pain report saved successfully to IBM Pain States API and locally',
			});
		} else {
			res.status(201).json({
				success: true,
				local_only: true,
				message: 'Pain report saved locally only',
			});
		}
	} catch (error) {
		console.error('Error saving pain report:', error);

		// Try to save locally as a fallback
		try {
			const localSaveSuccess = saveLocalPainReport(reportData);
			if (localSaveSuccess) {
				res.status(201).json({
					success: true,
					local_only: true,
					message: 'Pain report saved locally after API error',
				});
			} else {
				res.status(500).json({ error: 'Failed to save pain report' });
			}
		} catch (localError) {
			console.error('Error saving locally:', localError);
			res.status(500).json({ error: 'Failed to save pain report anywhere' });
		}
	}
});

// Get insights based on pain data
app.get('/api/pain-insights/:patientId', async (req, res) => {
	const { patientId } = req.params;

	try {
		// Try to get insights from IBM Pain States API
		const ibmInsights = await fetchInsightsFromIBMPainStates(patientId);
		if (ibmInsights.success) {
			res.status(200).json(ibmInsights.data);
		} else {
			// Generate basic insights locally as a fallback
			const localData = fetchLocalPainReports(patientId, 'month');
			const localInsights = generateLocalInsights(localData);
			res.status(200).json(localInsights);
		}
	} catch (error) {
		console.error('Error fetching pain insights:', error);
		res.status(500).json({ error: 'Failed to fetch pain insights' });
	}
});

// Helper functions

// Fetch from IBM Pain States API
async function fetchFromIBMPainStates(patientId, timeframe) {
	if (!IBM_PAIN_API_KEY) {
		throw new Error('IBM Pain States API key not configured');
	}

	try {
		const headers = {
			'Content-Type': 'application/json',
			'x-ibm-client-id': IBM_PAIN_API_KEY,
		};

		const response = await axios.get(`${IBM_PAIN_API_URL}/patient-reports`, {
			headers,
			params: {
				patient_id: patientId,
				timeframe: timeframe || 'week',
			},
		});

		if (response.status === 200) {
			return response.data;
		} else {
			throw new Error(`API returned status ${response.status}`);
		}
	} catch (error) {
		console.error('Error fetching from IBM Pain States API:', error);
		throw error;
	}
}

// Save to IBM Pain States API
async function saveToIBMPainStates(reportData) {
	if (!IBM_PAIN_API_KEY) {
		return { success: false, error: 'IBM Pain States API key not configured' };
	}

	try {
		const headers = {
			'Content-Type': 'application/json',
			'x-ibm-client-id': IBM_PAIN_API_KEY,
		};

		const response = await axios.post(
			`${IBM_PAIN_API_URL}/patient-reports`,
			reportData,
			{ headers }
		);

		if (response.status === 200 || response.status === 201) {
			return {
				success: true,
				report_id: response.data?.report_id || 'unknown',
			};
		} else {
			return {
				success: false,
				error: `API returned status ${response.status}`,
			};
		}
	} catch (error) {
		console.error('Error saving to IBM Pain States API:', error);
		return { success: false, error: error.message };
	}
}

// Fetch insights from IBM Pain States API
async function fetchInsightsFromIBMPainStates(patientId) {
	if (!IBM_PAIN_API_KEY) {
		return { success: false, error: 'IBM Pain States API key not configured' };
	}

	try {
		const headers = {
			'Content-Type': 'application/json',
			'x-ibm-client-id': IBM_PAIN_API_KEY,
		};

		const response = await axios.get(
			`${IBM_PAIN_API_URL}/patient-reports/${patientId}/insights`,
			{ headers }
		);

		if (response.status === 200) {
			return { success: true, data: response.data };
		} else {
			return {
				success: false,
				error: `API returned status ${response.status}`,
			};
		}
	} catch (error) {
		console.error('Error fetching insights from IBM Pain States API:', error);
		return { success: false, error: error.message };
	}
}

// Save pain report to local storage
function saveLocalPainReport(reportData) {
	try {
		const patientDir = path.join(DATA_DIR, reportData.patient_id);
		if (!fs.existsSync(patientDir)) {
			fs.mkdirSync(patientDir, { recursive: true });
		}

		const timestamp = reportData.timestamp || new Date().toISOString();
		const fileName = `${timestamp.replace(/:/g, '-')}.json`;
		const filePath = path.join(patientDir, fileName);

		fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2));

		// Also update the patient index
		updatePatientIndex(reportData.patient_id, timestamp);

		return true;
	} catch (error) {
		console.error('Error saving pain report locally:', error);
		return false;
	}
}

// Update the patient index for easier retrieval
function updatePatientIndex(patientId, timestamp) {
	const indexPath = path.join(DATA_DIR, 'patient_index.json');
	let index = {};

	if (fs.existsSync(indexPath)) {
		try {
			index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
		} catch (error) {
			console.error('Error reading patient index:', error);
		}
	}

	if (!index[patientId]) {
		index[patientId] = [];
	}

	// Add new timestamp
	index[patientId].push(timestamp);

	// Sort and keep only the latest 100 entries
	index[patientId].sort((a, b) => new Date(b) - new Date(a));
	index[patientId] = index[patientId].slice(0, 100);

	try {
		fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
	} catch (error) {
		console.error('Error updating patient index:', error);
	}
}

// Fetch pain reports from local storage
function fetchLocalPainReports(patientId, timeframe) {
	try {
		const patientDir = path.join(DATA_DIR, patientId);
		if (!fs.existsSync(patientDir)) {
			return [];
		}

		const files = fs.readdirSync(patientDir);
		let reports = [];

		for (const file of files) {
			if (file.endsWith('.json')) {
				try {
					const filePath = path.join(patientDir, file);
					const reportData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
					reports.push(reportData);
				} catch (error) {
					console.error(`Error reading report file ${file}:`, error);
				}
			}
		}

		// Sort by timestamp, newest first
		reports.sort((a, b) => {
			return new Date(b.timestamp) - new Date(a.timestamp);
		});

		// Filter based on timeframe
		const now = new Date();
		let cutoffDate;

		switch (timeframe) {
			case 'day':
				cutoffDate = new Date(now.setDate(now.getDate() - 1));
				break;
			case 'week':
				cutoffDate = new Date(now.setDate(now.getDate() - 7));
				break;
			case 'month':
				cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
				break;
			case 'year':
				cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
				break;
			default:
				// Default to all data
				return reports;
		}

		return reports.filter((report) => new Date(report.timestamp) >= cutoffDate);
	} catch (error) {
		console.error('Error fetching local pain reports:', error);
		return [];
	}
}

// Generate basic insights from local data
function generateLocalInsights(reports) {
	if (!reports || reports.length === 0) {
		return {
			message: 'Not enough data to generate insights',
			insights: [],
		};
	}

	try {
		// Extract pain intensities for trend analysis
		const painIntensities = reports.map((r) => ({
			timestamp: r.timestamp,
			intensity: r.pain_data.intensity || 0,
		}));

		// Sort by timestamp
		painIntensities.sort(
			(a, b) => new Date(a.timestamp) - new Date(b.timestamp)
		);

		// Calculate average pain
		const avgPain =
			painIntensities.reduce((sum, p) => sum + p.intensity, 0) /
			painIntensities.length;

		// Calculate trend
		const firstWeekIntensities = painIntensities.slice(
			0,
			Math.min(7, Math.ceil(painIntensities.length / 4))
		);
		const lastWeekIntensities = painIntensities.slice(
			-Math.min(7, Math.ceil(painIntensities.length / 4))
		);

		const firstWeekAvg =
			firstWeekIntensities.reduce((sum, p) => sum + p.intensity, 0) /
			firstWeekIntensities.length;
		const lastWeekAvg =
			lastWeekIntensities.reduce((sum, p) => sum + p.intensity, 0) /
			lastWeekIntensities.length;

		const trend =
			lastWeekAvg < firstWeekAvg
				? 'improving'
				: lastWeekAvg > firstWeekAvg
				? 'worsening'
				: 'stable';

		// Count frequency of pain locations
		const painLocations = {};
		reports.forEach((report) => {
			if (report.pain_data.locations) {
				report.pain_data.locations.forEach((location) => {
					painLocations[location] = (painLocations[location] || 0) + 1;
				});
			}
		});

		// Sort locations by frequency
		const sortedLocations = Object.entries(painLocations)
			.sort((a, b) => b[1] - a[1])
			.map(([location, count]) => ({ location, count }));

		// Generate recommendations based on data
		const recommendations = [];

		if (avgPain > 7) {
			recommendations.push(
				'Your pain levels are high. Consider consulting with your healthcare provider soon.'
			);
		}

		if (trend === 'worsening') {
			recommendations.push(
				'Your pain appears to be increasing. Track any changes in activities or treatments.'
			);
		} else if (trend === 'improving') {
			recommendations.push(
				'Your pain appears to be improving. Continue with current management strategies.'
			);
		}

		// Look at sleep impact
		const sleepImpact = reports
			.filter((r) => r.context_data && r.context_data.sleep_quality)
			.map((r) => r.context_data.sleep_quality);

		if (sleepImpact.length > 0) {
			const severeImpact = sleepImpact.filter(
				(s) => s === 'severely affected' || s === 'cannot sleep'
			).length;

			if (severeImpact / sleepImpact.length > 0.3) {
				recommendations.push(
					'Your pain is significantly affecting your sleep. Consider discussing sleep management strategies with your healthcare provider.'
				);
			}
		}

		return {
			average_pain: avgPain.toFixed(1),
			trend: trend,
			most_common_locations: sortedLocations.slice(0, 3),
			recommendations: recommendations,
		};
	} catch (error) {
		console.error('Error generating local insights:', error);
		return {
			message: 'Error generating insights',
			insights: [],
		};
	}
}

// Start the server
app.listen(PORT, () => {
	console.log(`Pain tracking service running on port ${PORT}`);
});
