// CAFYP main JavaScript file

document.addEventListener('DOMContentLoaded', function () {
	// Mobile navigation toggle functionality
	const setupMobileNav = () => {
		// The menu button is now in the HTML, we just need to add the event listener
		const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
		const nav = document.querySelector('.ho-header__navigation');

		if (!mobileMenuBtn || !nav) return;

		// Hide the navigation by default on mobile
		if (window.innerWidth < 768) {
			nav.style.display = 'none';
		}

		// Toggle navigation on button click
		mobileMenuBtn.addEventListener('click', function () {
			const expanded = this.getAttribute('aria-expanded') === 'true';
			const newExpandedState = !expanded;

			this.setAttribute('aria-expanded', newExpandedState);
			nav.style.display = newExpandedState ? 'block' : 'none';
			this.innerHTML = newExpandedState ? 'Close' : 'Menu';
		});
	};

	// Call the function when the DOM loads
	setupMobileNav();

	// Re-initialize on window resize
	window.addEventListener('resize', function () {
		const nav = document.querySelector('.ho-header__navigation');
		const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');

		// Reset navigation display on larger screens
		if (window.innerWidth >= 768) {
			if (nav) nav.style.display = 'flex';
		} else {
			if (nav && mobileMenuBtn) {
				// On small screens, display depends on menu state
				const isExpanded =
					mobileMenuBtn.getAttribute('aria-expanded') === 'true';
				nav.style.display = isExpanded ? 'block' : 'none';
			}
		}
	});

	// Example: Add placeholder chart to the visualization area
	const setupPlaceholderChart = () => {
		const chartContainer = document.getElementById('pain-chart');
		if (!chartContainer) return;

		// If Chart.js is loaded, create a simple chart
		if (typeof Chart !== 'undefined') {
			new Chart(chartContainer, {
				type: 'line',
				data: {
					labels: [
						'Monday',
						'Tuesday',
						'Wednesday',
						'Thursday',
						'Friday',
						'Saturday',
						'Sunday',
					],
					datasets: [
						{
							label: 'Pain Level',
							data: [3, 5, 2, 6, 4, 3, 5],
							borderColor: '#65CDE3',
							backgroundColor: 'rgba(101, 205, 227, 0.2)',
							fill: true,
							tension: 0.1,
						},
					],
				},
				options: {
					responsive: true,
					plugins: {
						title: {
							display: true,
							text: 'Weekly Pain Level Tracking',
						},
					},
					scales: {
						y: {
							min: 0,
							max: 10,
							title: {
								display: true,
								text: 'Pain Intensity (0-10)',
							},
						},
					},
				},
			});
		}
	};

	// Initialize any charts if the visualization page is being displayed
	if (document.getElementById('pain-chart')) {
		setupPlaceholderChart();
	}
});
