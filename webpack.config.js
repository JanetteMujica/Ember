const path = require('path');

module.exports = {
	mode: 'development',
	entry: {
		'pain-chatbot-bundle': './frontend/js/pain-chatbot-entry.js',
		'pain-visualization-bundle': './frontend/js/pain-visualization-entry.js',
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'frontend/dist'),
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env', '@babel/preset-react'],
					},
				},
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
		],
	},
	resolve: {
		extensions: ['.js', '.jsx'],
	},
};
