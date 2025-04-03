// scripts/restore-html.js
const fs = require('fs');
const path = require('path');

// Define the HTML templates with NO references to CSS or JS files
const templates = {
	'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ember - A digital assistant for Parkinson's</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,

	'journal.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Journal | Ember - A digital assistant for Parkinson's</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,

	'track.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Track | Ember - A digital assistant for Parkinson's</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,

	'visualize.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Visualize | Ember - A digital assistant for Parkinson's</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
};

// Create templates directory if it doesn't exist
const templatesDir = path.resolve(__dirname, '../frontend/src/templates');
if (!fs.existsSync(templatesDir)) {
	fs.mkdirSync(templatesDir, { recursive: true });
	console.log('Created templates directory');
}

// Save templates to files
Object.entries(templates).forEach(([filename, content]) => {
	const templatePath = path.join(templatesDir, filename);
	fs.writeFileSync(templatePath, content);
	console.log(`Saved template for ${filename}`);
});

// Copy templates to public directory
const publicDir = path.resolve(__dirname, '../frontend/public');
Object.keys(templates).forEach((filename) => {
	const templatePath = path.join(templatesDir, filename);
	const outputPath = path.join(publicDir, filename);
	fs.copyFileSync(templatePath, outputPath);
	console.log(`Restored ${filename} from template`);
});

console.log('All HTML files have been restored to their clean versions.');
