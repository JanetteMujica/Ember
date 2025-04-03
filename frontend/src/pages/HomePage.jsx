// frontend/src/pages/HomePage.jsx - FIXED
import React from 'react';

const HomePage = () => {
	return (
		<>
			{/* Hero Section */}
			<section className='hero'>
				<div className='hero__container'>
					<h1 className='ho-heading-xl'>
						<span className='cafyp-emphasis'>Ember</span>
					</h1>
					<h1 className='ho-heading-xl'>
						Helps you track your everyday life with journaling and
						visualization.
					</h1>
					<p className='ho-body-l'>
						A digital assistant designed to empower people living with
						Parkinson's.
					</p>

					<div className='button-group'>
						<a href='/track' className='ho-button'>
							Start tracking
						</a>
						<a href='/visualize' className='ho-button ho-button--secondary'>
							View visualizations
						</a>
						<a href='/journal' className='ho-button ho-button--secondary'>
							Start journaling
						</a>
					</div>
				</div>
			</section>

			{/* Main Content */}
			<main className='ho-main'>
				<div className='ho-width-container'>
					<div className='ho-grid-row'>
						{/* First section */}
						<div className='ho-grid-column-two-thirds'>
							<h2 className='ho-heading-l'>How Ember works</h2>
							<p className='ho-body'>
								Ember helps you track your daily life with Parkinson's. By
								recording your experiences, you can identify patterns, make
								informed decisions about your well-being, and share detailed
								information with your caregivers, support groups or/and
								healthcare providers.
							</p>

							<h3 className='ho-heading-m'>
								Track Your Daily Life with Parkinson's
							</h3>
							<p className='ho-body'>
								Choose care priorities that you would like to track in relation
								to physical health, mental health, or lifestyle and well-being.
								Then, use our simple form to track your experiences based on the
								selected care priorities.
							</p>
							<p className='ho-body'>
								<a href='/track' className='ho-link'>
									Start tracking
								</a>
							</p>

							<h3 className='ho-heading-m'>Visualize patterns</h3>
							<p className='ho-body'>
								See your data displayed in easy-to-understand charts and graphs.
								Identify patterns in your life with Parkinson's and log them in
								your journal.
							</p>
							<p className='ho-body'>
								<a href='/visualize' className='ho-link'>
									View your visualizations
								</a>
							</p>

							<h3 className='ho-heading-m'>Journaling</h3>
							<p className='ho-body'>
								Document your experiences, including thoughts, daily
								reflections, physical sensations, or events such as medication
								or symptoms changes. Generate summaries for doctor consultations
								or support group meetings.
							</p>
							<p className='ho-body'>
								<a href='/journal' className='ho-link'>
									Start journaling
								</a>
							</p>
						</div>

						{/* Side panel */}
						<div className='ho-grid-column-one-third'>
							<div className='ho-panel'>
								<h2 className='ho-heading-m'>Help and support</h2>
								<p className='ho-body'>Get assistance with using Ember.</p>
								<a
									href='/help'
									className='ho-button ho-button--secondary ho-width-full'
								>
									Contact support
								</a>
								<h3 className='ho-heading-s'>Useful resources</h3>
								<ul className='ho-list ho-list--bullet'>
									<li>
										<a href='#' className='ho-link'>
											Understanding patient knowledge
										</a>
									</li>
									<li>
										<a href='#' className='ho-link'>
											Self-Management Strategies for Parkinson
										</a>
									</li>
									<li>
										<a href='#' className='ho-link'>
											Having meaningful consultation with your doctor
										</a>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	);
};

export default HomePage;
