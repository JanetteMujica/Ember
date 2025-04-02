// frontend/src/components/common/Footer.jsx
import React from 'react';

const Footer = () => {
	return (
		<footer className='ho-footer'>
			<div className='ho-width-container'>
				<div className='ho-footer__meta'>
					<div className='ho-footer__meta-item'>
						<h2 className='ho-visually-hidden'>Support links</h2>
						<ul className='ho-footer__inline-list'>
							<li className='ho-footer__inline-list-item'>
								<a
									className='ho-footer__link'
									href='/https://github.com/JanetteMujica/Ember'
									target='_blank'
									rel='noopener noreferrer'
								>
									GitHub
								</a>
							</li>
							<li className='ho-footer__inline-list-item'>
								<a className='ho-footer__link' href='/accessiblity'>
									Accessibility
								</a>
							</li>
						</ul>
						<div className='ho-footer__meta-custom'>
							<p className='ho-body-s'>
								PROTOTYPE - Developed by Janette Mujica for CSI5180 AI:Virtual
								Assistant, Faculty of engineering @uOttawa
							</p>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
