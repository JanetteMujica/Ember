// webpack.config.js (at the root of your project)
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	mode: 'development',
	entry: {
		app: './frontend/src/index.jsx',
		painChatbot: './frontend/js/pain-chatbot-entry.js',
		painVisualization: './frontend/js/pain-visualization-entry.js',
		journalEntry: './frontend/js/journal-entry.js',
	},
	output: {
		filename: 'assets/js/[name].js',
		path: path.resolve(__dirname, 'frontend/public'),
		publicPath: '', // Changed from '/' to empty string for relative paths
		clean: false,
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
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: 'asset/resource',
				generator: {
					filename: 'assets/img/[name][ext]',
				},
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: 'asset/resource',
				generator: {
					filename: 'assets/fonts/[name][ext]',
				},
			},
			{
				test: /\.html$/,
				loader: 'html-loader',
				options: {
					minimize: false,
					sources: false, // This prevents processing of sources in HTML
				},
			},
		],
	},
	resolve: {
		extensions: ['.js', '.jsx', '.html'],
		modules: [
			path.resolve(__dirname, 'frontend'),
			path.resolve(__dirname, 'frontend/public'),
			path.resolve(__dirname, 'frontend/src'),
			'node_modules',
		],
		alias: {
			'@components': path.resolve(__dirname, 'frontend/src/components'),
			'@pages': path.resolve(__dirname, 'frontend/src/pages'),
			'@services': path.resolve(__dirname, 'frontend/src/services'),
			'@styles': path.resolve(__dirname, 'frontend/src/components/styles'),
			'@utils': path.resolve(__dirname, 'frontend/src/utils'),
		},
		fallback: {
			path: require.resolve('path-browserify'),
			stream: require.resolve('stream-browserify'),
			zlib: require.resolve('browserify-zlib'),
			util: require.resolve('util/'),
			buffer: require.resolve('buffer/'),
			assert: require.resolve('assert/'),
		},
	},
	plugins: [
		// Main app page
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, 'frontend/src/templates/index.html'), // Changed path
			filename: 'index.html',
			chunks: ['app'],
			inject: 'body',
			minify: false,
			scriptLoading: 'defer', // Use defer for scripts
		}),
		// Track page
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, 'frontend/src/templates/track.html'), // Changed path
			filename: 'track.html',
			chunks: ['painChatbot'],
			inject: 'body',
			minify: false,
			scriptLoading: 'defer', // Use defer for scripts
		}),
		// Visualize page
		new HtmlWebpackPlugin({
			template: path.resolve(
				__dirname,
				'frontend/src/templates/visualize.html'
			), // Changed path
			filename: 'visualize.html',
			chunks: ['painVisualization'],
			inject: 'body',
			minify: false,
			scriptLoading: 'defer', // Use defer for scripts
		}),
		// Journal page
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, 'frontend/src/templates/journal.html'), // Changed path
			filename: 'journal.html',
			chunks: ['journalEntry'],
			inject: 'body',
			minify: false,
			scriptLoading: 'defer', // Use defer for scripts
		}),
		new MiniCssExtractPlugin({
			filename: 'assets/css/[name].css',
		}),
		new webpack.DefinePlugin({
			'process.env': JSON.stringify(process.env),
		}),
		new webpack.ProvidePlugin({
			process: 'process/browser',
			Buffer: ['buffer', 'Buffer'],
		}),
	],
	devServer: {
		static: {
			directory: path.join(__dirname, 'frontend/public'),
		},
		port: 8080,
		historyApiFallback: true,
		hot: true,
		devMiddleware: {
			stats: 'errors-warnings', // Only show errors and warnings
		},
	},
	stats: 'errors-warnings', // Reduce console output
};
