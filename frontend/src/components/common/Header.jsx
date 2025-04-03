// frontend/src/components/common/Header.jsx
import React, { useState } from 'react';
import TextToSpeech from './TextToSpeech';

const Header = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	return (
		<header className='ho-header ho-header--sticky'>
			<div className='ho-header__container'>
				<div className='ho-header__logo'>
					<a href='/' className='ho-header__logo-link'>
						<img
							src='/img/smileyRobo_color.svg'
							alt='Ember Logo'
							className='ho-header__logo-image'
						/>
						<span className='ho-visually-hidden'>Ember</span>
					</a>
				</div>

				<button
					className='mobile-menu-toggle'
					aria-expanded={mobileMenuOpen}
					aria-controls='navigation'
					onClick={toggleMobileMenu}
				>
					{mobileMenuOpen ? 'Close' : 'Menu'}
				</button>

				<nav
					className={`ho-header__navigation ${mobileMenuOpen ? 'is-open' : ''}`}
					id='navigation'
				>
					<ul className='ho-header__navigation-list'>
						<li className='ho-header__navigation-item'>
							<a href='/track.html' className='ho-header__navigation-link'>
								Track
							</a>
						</li>
						<li className='ho-header__navigation-item'>
							<a href='/visualize.html' className='ho-header__navigation-link'>
								Visualize
							</a>
						</li>
						<li className='ho-header__navigation-item'>
							<a href='/journal.html' className='ho-header__navigation-link'>
								Journal
							</a>
						</li>
					</ul>
				</nav>
			</div>

			{/* Add TextToSpeech component */}
			<TextToSpeech />
		</header>
	);
};

export default Header;
