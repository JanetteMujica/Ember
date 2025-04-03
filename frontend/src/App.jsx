// frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import TrackPage from './pages/TrackPage';
import VisualizePage from './pages/VisualizePage';
import JournalPage from './pages/JournalPage';

function App() {
	return (
		<>
			<Header />
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/track' element={<TrackPage />} />
				<Route path='/visualize' element={<VisualizePage />} />
				<Route path='/journal' element={<JournalPage />} />
			</Routes>
			<Footer />
		</>
	);
}

export default App;
