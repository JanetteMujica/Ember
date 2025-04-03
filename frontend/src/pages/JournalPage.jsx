import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
// Comment out problematic imports for now
// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';

const JournalPage = () => {
	const [journalEntries, setJournalEntries] = useState([]);
	const [filteredEntries, setFilteredEntries] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [dateRange, setDateRange] = useState({ start: '', end: '' });
	const [entryType, setEntryType] = useState('all'); // 'all', 'experience', or 'event'
	const [sortBy, setSortBy] = useState('date-desc');
	const printContentRef = useRef(null);

	// Add state for editing entries
	const [editingEntry, setEditingEntry] = useState(null);
	const [editedContent, setEditedContent] = useState('');
	const [editedTags, setEditedTags] = useState('');

	// Add state for success/error messages
	const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

	// HARD-CODED JOURNAL ENTRIES FOR DEMO - Based on James Kane persona
	const HARD_CODED_ENTRIES = [
		// Experience entries - chronological order
		{
			id: 'journal-1',
			type: 'experience',
			timestamp: '2025-03-01T20:15:00.000Z',
			content:
				"Wine tasting event today with the local sommelier club. Noticed my tremor was more pronounced while trying to hold the glass. My friend John suggested using stemless glasses which worked better. I need to remember this adaptation for future tastings. Despite the tremor challenges, I was still able to distinguish the subtle notes in the Cabernet - my sense of taste hasn't been affected.",
			tags: ['wine tasting', 'tremor', 'adaptation'],
		},
		{
			id: 'journal-2',
			type: 'experience',
			timestamp: '2025-03-03T21:30:00.000Z',
			content:
				'Felt very lightheaded this morning when getting out of bed. Had to sit back down for about 2 minutes before standing again more slowly. This has been happening more frequently in the mornings. I should mention this pattern to Dr. Williams at my appointment on the 8th. Timing my first medication dose better might help with this.',
			tags: ['lightheadedness', 'morning', 'medication timing'],
		},
		{
			id: 'journal-3',
			type: 'event',
			eventType: 'exercise_session',
			timestamp: '2025-03-05T11:45:00.000Z',
			content:
				"Attended the Parkinson's-specific exercise class at the community center. Focused on balance and core strength today. The instructor showed us techniques for getting up safely when we feel unsteady. The exercise definitely helped reduce my stiffness for several hours afterward. Need to be more consistent with the home exercises between classes.",
			tags: ['exercise', 'balance', 'stiffness'],
		},
		{
			id: 'journal-4',
			type: 'experience',
			timestamp: '2025-03-07T19:00:00.000Z',
			content:
				"Preparing for tomorrow's neurology appointment. I've been tracking my symptoms more carefully this month. Main concerns to discuss: 1) Morning tremor is consistently worse before first medication dose, 2) Lightheadedness upon standing has increased, 3) Sleep disruption - waking around 5am with increased tremor. My goals are to adjust medication timing and discuss strategies for the lightheadedness.",
			tags: ['appointment prep', 'symptoms', 'medication'],
		},
		{
			id: 'journal-5',
			type: 'event',
			eventType: 'doctor_appointment',
			timestamp: '2025-03-08T16:00:00.000Z',
			content:
				'Dr. Williams appointment went well. She suggested taking my first Carbidopa/Levodopa dose earlier (6am instead of 8am) to address the morning tremor. We also discussed the lightheadedness. She recommended standing up more slowly and sitting on the edge of the bed for 30 seconds before standing. Blood pressure was slightly low which could be contributing. For sleep issues, she suggested moving my evening dose earlier to 7pm instead of 8pm. Overall I feel good about these adjustments.',
			tags: ['appointment', 'medication timing', 'tremor', 'lightheadedness'],
		},
		{
			id: 'journal-6',
			type: 'experience',
			timestamp: '2025-03-10T09:30:00.000Z',
			content:
				'Started the new medication schedule today. Taking first dose at 6am required setting an alarm, but I was able to go back to sleep afterward. By the time I got up at 7:30, I noticed less tremor than usual. Will continue monitoring this change. Had some constipation issues this morning - need to increase my water and fiber intake.',
			tags: ['medication', 'tremor', 'constipation'],
		},
		{
			id: 'journal-7',
			type: 'event',
			eventType: 'physical_therapy',
			timestamp: '2025-03-12T13:00:00.000Z',
			content:
				"Physical therapy session with Sarah focused on balance exercises today. We practiced strategies for preventing falls, including the 'clock stepping' technique when turning. She also showed me exercises to strengthen my hip flexors which should help with stability. I need to practice these daily. She was pleased with my progress on core strength since last session.",
			tags: ['physical therapy', 'balance', 'exercises', 'falls prevention'],
		},
		{
			id: 'journal-8',
			type: 'experience',
			timestamp: '2025-03-14T19:45:00.000Z',
			content:
				'Margaret and I worked in the garden today. I found that the repetitive motions of planting seedlings actually helped reduce my tremor temporarily. The gardening gloves with extra grip were helpful when handling small seeds. I did notice increased fatigue after about an hour. Need to remember to take breaks every 30-45 minutes during physical activities.',
			tags: ['gardening', 'tremor', 'fatigue', 'adaptation'],
		},
		{
			id: 'journal-9',
			type: 'event',
			eventType: 'family_activity',
			timestamp: '2025-03-15T18:30:00.000Z',
			content:
				"Grandchildren visited today. Played board games and noticed my tremor was less noticeable when I was mentally engaged with the game. This is consistent with what I've read about how focused attention can temporarily reduce tremor. I did have one episode of lightheadedness when I stood up too quickly after sitting on the floor with the kids. Used the technique Dr. Williams suggested of pausing before fully standing and it helped.",
			tags: ['family', 'tremor', 'mental engagement', 'lightheadedness'],
		},
		{
			id: 'journal-10',
			type: 'experience',
			timestamp: '2025-03-18T21:15:00.000Z',
			content:
				"The new medication schedule is definitely helping with morning tremors. They're still present but less severe. Sleep is still disrupted though - waking around 4:30-5am with increased tremor. I'm going to try moving my last dose to exactly 7pm as Dr. Williams suggested to see if that helps. Started using a weighted blanket last night which seemed to help with the restlessness in my legs.",
			tags: ['medication', 'tremor', 'sleep', 'adaptation'],
		},
		{
			id: 'journal-11',
			type: 'event',
			eventType: 'medication_change',
			timestamp: '2025-03-20T08:45:00.000Z',
			content:
				'Adjusted my evening medication dose to 7pm exactly as recommended. Will monitor how this affects my sleep over the next week. Also started taking the midday dose with a small protein snack instead of with a full lunch - read that this might help with more consistent absorption.',
			tags: ['medication timing', 'sleep', 'self-management'],
		},
		{
			id: 'journal-12',
			type: 'experience',
			timestamp: '2025-03-21T17:30:00.000Z',
			content:
				"Went grocery shopping today. Used the cart for support which helped with stability. I've started organizing my shopping list by store layout to minimize unnecessary walking - an efficient strategy I learned from the Parkinson's support group. Noticed tremor increases when reaching for items on higher shelves. May need to ask for assistance with those items in the future.",
			tags: ['shopping', 'adaptation', 'tremor', 'energy conservation'],
		},
		{
			id: 'journal-13',
			type: 'event',
			eventType: 'wine_tasting',
			timestamp: '2025-03-22T20:00:00.000Z',
			content:
				"Wine tasting club meeting at John's house. Used the stemless glasses as planned and it made a significant difference! Also found that holding the glass with both hands helped stabilize it. Shared these adaptations with another member who has essential tremor, and he found them helpful too. I was able to fully participate in the tasting notes discussion. Small adaptations are making it possible to continue with my hobby.",
			tags: ['wine tasting', 'adaptation', 'hobby', 'tremor'],
		},
		{
			id: 'journal-14',
			type: 'experience',
			timestamp: '2025-03-24T12:30:00.000Z',
			content:
				"Sleep has improved since changing the evening medication timing. Getting about 30 more minutes of solid sleep before the early morning tremor begins. The weighted blanket continues to help with the restless legs sensation. Energy levels feel better with the improved sleep quality. I've scheduled a follow-up with Dr. Williams next month to discuss these improvements.",
			tags: ['sleep', 'medication', 'energy', 'tremor'],
		},
		{
			id: 'journal-15',
			type: 'event',
			eventType: 'support_group',
			timestamp: '2025-03-25T16:15:00.000Z',
			content:
				"Parkinson's support group today. Topic was 'Managing Medication Timing for Optimal Effect.' I shared my recent experience with adjusting my morning dose earlier and how it's helped with my morning tremors. Learned about medication timing apps from another member - going to try 'MedTimer' which sends reminders and tracks symptoms in relation to doses. Great discussion about balance techniques as well.",
			tags: ['support group', 'medication timing', 'learning', 'technology'],
		},
		{
			id: 'journal-16',
			type: 'experience',
			timestamp: '2025-03-26T19:45:00.000Z',
			content:
				'Downloaded the MedTimer app recommended at the support group. Spent some time setting up my medication schedule and symptom tracking categories. This should help me provide more specific information to Dr. Williams at my next appointment. The app also has a feature to track water intake which might help with my constipation issues.',
			tags: [
				'technology',
				'medication timing',
				'self-management',
				'adaptation',
			],
		},
		{
			id: 'journal-17',
			type: 'event',
			eventType: 'fall_incident',
			timestamp: '2025-03-28T08:30:00.000Z',
			content:
				"Had a minor fall this morning when getting out of bed. I forgot to sit at the edge for a moment before standing, and the lightheadedness caused me to lose balance. No injuries, but it was a good reminder to follow the techniques from physical therapy. I'll be more careful about this, especially in the morning when lightheadedness is worse. Added a note on my bedside table as a reminder.",
			tags: ['fall', 'lightheadedness', 'morning', 'safety'],
		},
		{
			id: 'journal-18',
			type: 'experience',
			timestamp: '2025-03-30T14:00:00.000Z',
			content:
				'Sunday afternoon with Margaret. We went for a short walk in the neighborhood - about 20 minutes. I used my walking stick for stability. Noticed less freezing of gait when I focused on taking slightly wider steps as the physical therapist suggested. The visual cues of sidewalk cracks also seemed to help prevent freezing. Beautiful spring day, which lifted my mood considerably.',
			tags: ['walking', 'freezing', 'adaptation', 'mood'],
		},
		{
			id: 'journal-19',
			type: 'event',
			eventType: 'nutrition_change',
			timestamp: '2025-04-01T10:15:00.000Z',
			content:
				'Starting a new approach to manage constipation today. Adding prune juice to my morning routine and increasing vegetable intake at lunch. Also ordered psyllium husk supplement as recommended by the dietitian at the PD support center. Will track if these changes help with digestion issues over the next couple of weeks.',
			tags: ['nutrition', 'constipation', 'self-management'],
		},
		{
			id: 'journal-20',
			type: 'experience',
			timestamp: '2025-04-02T18:30:00.000Z',
			content:
				'Overall reflection on the past month: The medication timing adjustments have definitely helped with morning tremors and somewhat improved sleep. Lightheadedness is still challenging but manageable with proper techniques when changing positions. The adaptations for wine tasting have been very successful - proves I can still enjoy my hobby with some modifications. Next goals: 1) Continue working on balance exercises daily, 2) Be more consistent with the constipation management plan, 3) Try using voice recording rather than typing for some journal entries when tremor makes typing difficult.',
			tags: ['reflection', 'adaptation', 'goals', 'progress'],
		},
	];

	// Use hard-coded entries instead of fetching from API for demo
	useEffect(() => {
		// Simulate API fetch with hard-coded data
		console.log('Loading hard-coded journal entries for demo...');

		// Short timeout to simulate loading
		setTimeout(() => {
			try {
				setJournalEntries(HARD_CODED_ENTRIES);
				setFilteredEntries(HARD_CODED_ENTRIES);
				showStatusMessage(
					'Demo journal entries loaded successfully!',
					'success'
				);
			} catch (error) {
				console.error('Error loading demo entries:', error);
				setJournalEntries([]);
				setFilteredEntries([]);
				showStatusMessage(
					'Unable to load journal entries. Please try again later.',
					'error'
				);
			} finally {
				setLoading(false);
			}
		}, 800); // Simulate API delay
	}, []);

	// Comment out refresh parameter handling for demo
	// This would normally re-fetch data when redirected from chatbot
	// useEffect(() => {
	// 	const urlParams = new URLSearchParams(window.location.search);
	// 	const refresh = urlParams.get('refresh');

	// 	if (refresh === 'true') {
	// 		// Force a re-fetch when redirected from chatbot
	// 		const fetchJournalEntries = async () => {
	// 			try {
	// 				const response = await fetch('http://localhost:5000/api/journal');
	// 				if (response.ok) {
	// 					const data = await response.json();
	// 					if (data.success && data.journals) {
	// 						setJournalEntries(data.journals);
	// 						setFilteredEntries(data.journals);
	// 					}
	// 				}
	// 			} catch (error) {
	// 				console.error('Error refreshing journal entries:', error);
	// 			}
	// 		};

	// 		fetchJournalEntries();

	// 		// Clean up the URL to remove the refresh parameter
	// 		if (window.history.replaceState) {
	// 			const newUrl = window.location.pathname;
	// 			window.history.replaceState(null, '', newUrl);
	// 		}
	// 	}
	// }, []);

	// Apply filters when search term, date range, entry type, or sort option changes
	useEffect(() => {
		let filtered = [...journalEntries];

		// Filter by search term
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			filtered = filtered.filter(
				(entry) =>
					entry.content.toLowerCase().includes(term) ||
					entry.tags.some((tag) => tag.toLowerCase().includes(term))
			);
		}

		// Filter by date range
		if (dateRange.start) {
			const startDate = new Date(dateRange.start);
			filtered = filtered.filter(
				(entry) => new Date(entry.timestamp) >= startDate
			);
		}
		if (dateRange.end) {
			const endDate = new Date(dateRange.end);
			endDate.setHours(23, 59, 59); // Include the entire end day
			filtered = filtered.filter(
				(entry) => new Date(entry.timestamp) <= endDate
			);
		}

		// Filter by entry type
		if (entryType !== 'all') {
			filtered = filtered.filter((entry) => entry.type === entryType);
		}

		// Sort entries
		filtered.sort((a, b) => {
			const dateA = new Date(a.timestamp);
			const dateB = new Date(b.timestamp);

			if (sortBy === 'date-asc') {
				return dateA - dateB;
			} else if (sortBy === 'date-desc') {
				return dateB - dateA;
			}
			return 0;
		});

		setFilteredEntries(filtered);
	}, [journalEntries, searchTerm, dateRange, entryType, sortBy]);

	// Format date for display
	const formatDate = (timestamp) => {
		const date = new Date(timestamp);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	// Print functionality (replaces PDF generation)
	const handlePrint = () => {
		window.print();
	};

	// Handle download of journal entries as CSV
	const handleDownloadCSV = () => {
		// Create CSV content
		let csvContent = 'data:text/csv;charset=utf-8,';
		csvContent += 'Date,Type,Content,Tags\n';

		filteredEntries.forEach((entry) => {
			const formattedDate = formatDate(entry.timestamp);
			const type =
				entry.type === 'event' ? `Event (${entry.eventType})` : 'Experience';
			const content = `"${entry.content.replace(/"/g, '""')}"`;
			const tags = entry.tags.join(', ');

			csvContent += `${formattedDate},${type},${content},${tags}\n`;
		});

		// Create download link and trigger click
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement('a');
		link.setAttribute('href', encodedUri);
		link.setAttribute(
			'download',
			`ember-journal-${new Date().toISOString().split('T')[0]}.csv`
		);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// Function to start editing an entry
	const startEditing = (entry) => {
		setEditingEntry(entry);
		setEditedContent(entry.content);
		setEditedTags(entry.tags.join(', '));
	};

	// Function to cancel editing
	const cancelEditing = () => {
		setEditingEntry(null);
		setEditedContent('');
		setEditedTags('');
	};

	// Modified for demo - update entries without API calls
	const saveEditedEntry = async () => {
		if (!editingEntry) return;

		try {
			const updatedEntry = {
				...editingEntry,
				content: editedContent,
				tags: editedTags
					.split(',')
					.map((tag) => tag.trim())
					.filter((tag) => tag),
			};

			// For demo purposes, just update the entry in local state
			// without actually calling the API
			const updatedEntries = journalEntries.map((entry) =>
				(entry._id || entry.id) === (editingEntry._id || editingEntry.id)
					? updatedEntry
					: entry
			);

			setJournalEntries(updatedEntries);
			setEditingEntry(null);
			setEditedContent('');
			setEditedTags('');
			showStatusMessage('Journal entry updated successfully!', 'success');

			// Simulate API delay for realistic demo
			await new Promise((resolve) => setTimeout(resolve, 300));
		} catch (error) {
			console.error('Error updating entry:', error);
			showStatusMessage('Error updating entry. Please try again.', 'error');
		}
	};

	// Modified for demo - delete entries without API calls
	const deleteEntry = async (entryId) => {
		if (
			!window.confirm(
				'Are you sure you want to delete this journal entry? This action cannot be undone.'
			)
		) {
			return;
		}

		try {
			// For demo purposes, just remove the entry from local state
			// without actually calling the API

			// Simulate API delay for realistic demo
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Remove the entry from the local state
			const updatedEntries = journalEntries.filter(
				(entry) => (entry._id || entry.id) !== entryId
			);

			setJournalEntries(updatedEntries);
			setFilteredEntries(
				filteredEntries.filter((entry) => (entry._id || entry.id) !== entryId)
			);

			showStatusMessage('Journal entry deleted successfully!', 'success');
		} catch (error) {
			console.error('Error deleting entry:', error);
			showStatusMessage('Error deleting entry. Please try again.', 'error');
		}
	};

	// Modified for demo - add entries without API calls
	const addJournalEntry = async (content) => {
		if (!content) return;

		try {
			// Create a new entry with a unique ID
			const newEntry = {
				id: `journal-${Date.now()}`, // Generate a unique ID based on timestamp
				type: 'experience',
				content: content,
				timestamp: new Date().toISOString(),
				tags: ['manual-entry'],
				userId: 'default_user',
			};

			// Simulate API delay for realistic demo
			await new Promise((resolve) => setTimeout(resolve, 600));

			// Add the new entry to the local state
			const updatedEntries = [newEntry, ...journalEntries];
			setJournalEntries(updatedEntries);

			// Update filtered entries if needed
			if (entryType === 'all' || entryType === 'experience') {
				setFilteredEntries([newEntry, ...filteredEntries]);
			}

			showStatusMessage('Journal entry added successfully!', 'success');
		} catch (error) {
			console.error('Error adding entry:', error);
			showStatusMessage('Error adding entry. Please try again.', 'error');
		}
	};

	// Function to show status messages
	const showStatusMessage = (text, type) => {
		setStatusMessage({ text, type });

		// Clear the message after 5 seconds
		setTimeout(() => {
			setStatusMessage({ text: '', type: '' });
		}, 5000);
	};

	return (
		<div className='journal-page'>
			<Header />
			<div className='journal-content'>
				<div className='ho-width-container'>
					<h1>Your Health Journal</h1>
					<p className='journal-intro'>
						Track and review your experiences and health events. Use the filters
						below to search for specific entries, dates, or types of records.
					</p>

					{/* Status Message Display */}
					{statusMessage.text && (
						<div className={`status-message ${statusMessage.type}`}>
							{statusMessage.text}
						</div>
					)}

					<div className='journal-container'>
						<div className='journal-filters'>
							<div className='search-container'>
								<label htmlFor='search' className='visually-hidden'>
									Search journal entries
								</label>
								<input
									type='text'
									id='search'
									placeholder='Search journal entries...'
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className='search-input'
								/>
							</div>

							<div className='filter-row'>
								<div className='date-filter'>
									<label htmlFor='start-date'>From:</label>
									<input
										type='date'
										id='start-date'
										value={dateRange.start}
										onChange={(e) =>
											setDateRange({ ...dateRange, start: e.target.value })
										}
									/>

									<label htmlFor='end-date'>To:</label>
									<input
										type='date'
										id='end-date'
										value={dateRange.end}
										onChange={(e) =>
											setDateRange({ ...dateRange, end: e.target.value })
										}
									/>
								</div>

								<div className='type-sort-row'>
									<div className='type-filter'>
										<label htmlFor='entry-type'>Entry type:</label>
										<select
											id='entry-type'
											value={entryType}
											onChange={(e) => setEntryType(e.target.value)}
										>
											<option value='all'>All entries</option>
											<option value='experience'>Experiences</option>
											<option value='event'>Events</option>
										</select>
									</div>

									<div className='sort-filter'>
										<label htmlFor='sort-by'>Sort by:</label>
										<select
											id='sort-by'
											value={sortBy}
											onChange={(e) => setSortBy(e.target.value)}
										>
											<option value='date-desc'>Newest first</option>
											<option value='date-asc'>Oldest first</option>
										</select>
									</div>
								</div>
							</div>

							<div className='download-buttons'>
								<button
									className='download-button'
									onClick={handlePrint}
									aria-label='Print journal entries'
								>
									Print Journal
								</button>
								<button
									className='download-button secondary'
									onClick={handleDownloadCSV}
									aria-label='Download filtered journal entries as CSV'
								>
									Download as CSV
								</button>

								{/*  <button
									className='add-entry-button'
									onClick={() => {
										const content = prompt('Enter your journal entry:');
										if (content) {
											addJournalEntry(content);
										}
									}}
								>
									Add New Entry
								</button> */}
							</div>
						</div>

						<div className='journal-entries' ref={printContentRef}>
							{loading ? (
								<p className='loading-message'>
									Loading your journal entries...
								</p>
							) : filteredEntries.length > 0 ? (
								filteredEntries.map((entry) => (
									<div
										key={entry._id || entry.id} // Use _id (MongoDB's default) or fall back to id
										className={`journal-entry ${
											entry.type === 'event'
												? 'event-entry'
												: 'experience-entry'
										}`}
									>
										<div className='entry-header'>
											<span className='entry-type'>
												{entry.type === 'event'
													? `Event (${
															entry.eventType
																? entry.eventType.replace('_', ' ')
																: 'Other'
													  })`
													: 'Experience'}
											</span>
											<span className='entry-date'>
												{formatDate(entry.timestamp)}
											</span>
											<div className='entry-actions'>
												<button
													className='edit-button'
													onClick={() => startEditing(entry)}
													aria-label='Edit entry'
												>
													Edit
												</button>
												<button
													className='delete-button'
													onClick={() => deleteEntry(entry._id || entry.id)}
													aria-label='Delete entry'
												>
													Delete
												</button>
											</div>
										</div>

										{editingEntry &&
										(editingEntry._id || editingEntry.id) ===
											(entry._id || entry.id) ? (
											<div className='entry-edit-form'>
												<textarea
													value={editedContent}
													onChange={(e) => setEditedContent(e.target.value)}
													rows={5}
													className='edit-content-textarea'
												/>
												<div className='edit-tags-container'>
													<label htmlFor='edit-tags'>
														Tags (comma-separated):
													</label>
													<input
														type='text'
														id='edit-tags'
														value={editedTags}
														onChange={(e) => setEditedTags(e.target.value)}
														className='edit-tags-input'
													/>
												</div>
												<div className='edit-actions'>
													<button
														onClick={saveEditedEntry}
														className='save-button'
													>
														Save
													</button>
													<button
														onClick={cancelEditing}
														className='cancel-button'
													>
														Cancel
													</button>
												</div>
											</div>
										) : (
											<>
												<div className='entry-content'>
													<p>{entry.content}</p>
												</div>
												<div className='entry-tags'>
													{entry.tags && Array.isArray(entry.tags)
														? entry.tags.map((tag, index) => (
																<span
																	key={`${entry._id || entry.id}-tag-${index}`}
																	className='tag'
																>
																	{tag}
																</span>
														  ))
														: null}
												</div>
											</>
										)}
									</div>
								))
							) : (
								<p className='no-entries-message'>
									No journal entries found matching your filters.
								</p>
							)}
						</div>
					</div>

					<div className='navigation-links'>
						<a href='track.html' className='nav-link'>
							Track New Experiences
						</a>
						<a href='visualize.html' className='nav-link'>
							View Visualizations
						</a>
						<a href='index.html' className='nav-link'>
							Home
						</a>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default JournalPage;
