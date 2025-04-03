# Ember Pain Tracking Application Setup Guide

This guide provides step-by-step instructions for setting up and running the Ember Pain Tracking application. The application consists of four components that must all run simultaneously.

## Prerequisites

- Python 3.8 (already installed)
- Node.js and npm (for frontend and server)
- MongoDB Atlas connection (already configured in `.env`)

## 1. Set Up the Rasa Environment

```bash
# Navigate to the project directory
cd "D:\Redirection session\Documents\DTI\VirtualAssistant\ember-fresh"

# Activate the Python 3.8 virtual environment
rasa_env_38\Scripts\activate

# Verify the environment is activated - you should see (rasa_env_38) in your prompt
```

## 2. Start the Rasa Components

### Option 1: Start Both Servers with a Single Script (Recommended)

```bash
# Make sure the environment is activated
cd "D:\Redirection session\Documents\DTI\VirtualAssistant\ember-fresh"
rasa_env_38\Scripts\activate

# Navigate to the Rasa project directory
cd rasa

# Run the combined startup script
./start_rasa.sh
```

This script will:

1. Start the action server in the background
2. Start the main Rasa server in the foreground
3. Automatically stop both servers when you press Ctrl+C

### Option 2: Start Servers Separately (2 terminals needed)

#### Terminal 1: Rasa Main Server

```bash
# Make sure the environment is activated
cd "D:\Redirection session\Documents\DTI\VirtualAssistant\ember-fresh"
rasa_env_38\Scripts\activate

# Navigate to the Rasa project directory
cd rasa

# Start the Rasa server
rasa run --enable-api --cors "*"
```

**Running at:** http://localhost:5005

#### Terminal 2: Rasa Action Server

```bash
# Make sure the environment is activated
cd "D:\Redirection session\Documents\DTI\VirtualAssistant\ember-fresh"
rasa_env_38\Scripts\activate

# Navigate to the Rasa project directory
cd rasa

# Start the action server (standard way)
rasa run actions

# OR use the enhanced action server with detailed logging
python run_action_server.py
```

python minimal_action_server.py (mimiman server since the other one is not working)

**Running at:** http://localhost:5055

## 3. Start the Backend Server

### Terminal 3: Node.js Backend

```bash
# Navigate to the project directory
cd "D:\Redirection session\Documents\DTI\VirtualAssistant\ember-fresh"

# Go to the server directory
cd server

# Start the Node.js server
node pain-tracking-service.js
```

**Running at:** http://localhost:5000

- API endpoints are available at http://localhost:5000/api/...

## 4. Start the Frontend (React with Webpack)

### Terminal 4: Frontend Development Server

```bash
# Navigate to the project directory
cd "D:\Redirection session\Documents\DTI\VirtualAssistant\ember-fresh"

# Go to the frontend directory
cd frontend

# Install dependencies if needed
npm install

# Start the development server
npm start
```

**Running at:** http://localhost:8080

### Alternative: Building for Production

If you want to build the application for production deployment:

```bash
# Navigate to the project directory
cd "D:\Redirection session\Documents\DTI\VirtualAssistant\ember-fresh"

# Go to the frontend directory
cd frontend

# Set NODE_ENV to production for optimized build
set NODE_ENV=production

# Build the application with webpack in production mode
npm run build

# The built files will be in public/assets
# You can serve them with any static file server
# For example:
cd public
npx http-server
```

## Accessing the Application

Open your web browser and navigate to http://localhost:8080 to access the complete application.

## Component Overview

| Component      | Port | URL                   | Purpose                             |
| -------------- | ---- | --------------------- | ----------------------------------- |
| Frontend       | 8080 | http://localhost:8080 | User interface (React)              |
| Backend Server | 5000 | http://localhost:5000 | Data persistence and business logic |
| Rasa Main      | 5005 | http://localhost:5005 | Conversational AI                   |
| Rasa Actions   | 5055 | http://localhost:5055 | Custom actions processing           |

## Webpack Development Features

- **Hot Module Replacement (HMR)**: Changes to your React components will be reflected in the browser without a full page refresh
- **Source Maps**: Makes debugging easier by mapping minified code back to original source
- **Development Server**: Serves the application with support for client-side routing
- **Automatic Rebuilds**: Detects file changes and rebuilds automatically

## Troubleshooting

- Check that all four terminals are running without errors
- Verify that your `endpoints.yml` in the Rasa directory has the action endpoint uncommented:
  ```yaml
  action_endpoint:
    url: 'http://localhost:5055/webhook'
  ```
- Ensure your `credentials.yml` has REST API support enabled
- Check that your frontend's `rasaServices.js` points to the correct Rasa URL (http://localhost:5005)
- If you see only a blue background in your React app, check browser console for errors
- Make sure your webpack.config.js has the correct paths for your project structure

## Integration Points

1. **Rasa Actions to Backend Server**:

   - The Rasa actions server (actions.py) connects to the backend API at http://localhost:5000/api/
   - Make sure BASE_URL in actions.py is set to "http://localhost:5000/api"

2. **Frontend to Rasa Server**:

   - The frontend connects to the Rasa server at http://localhost:5005/webhooks/rest/webhook
   - This is configured in rasaServices.js

3. **Frontend to Backend Server**:
   - The frontend connects directly to the backend API at http://localhost:5000/api/
   - For webpack development, you might need to set up a proxy if you encounter CORS issues

## React Development Tips

- Component updates will be hot-reloaded when using `webpack serve`
- Use React DevTools browser extension for easier debugging
- Check the browser console for errors if components don't render as expected

## Shutting Down

To stop any service, press `Ctrl+C` in the respective terminal window.
To deactivate the Python virtual environment, run `deactivate` in terminals 1 and 2.

## Updating Git

```bash
git status
git add .
git commit -m "Your commit message"
git push origin master
```

## Train Rasa model

```bash
# Make sure the environment is activated
cd "D:\Redirection session\Documents\DTI\VirtualAssistant\ember-fresh"
rasa_env_38\Scripts\activate

# Navigate to the Rasa project directory
cd rasa

# Train the model
python -m rasa train
```

## Troubleshooting Rasa Action Server Issues

If you encounter issues with the Rasa action server not recognizing actions:

1. Verify that all actions are properly registered:

   ```bash
   cd rasa
   python actions/test_rasa_actions.py
   ```

2. Check if the `actions.py` file properly imports all action classes from the modular files.

3. Review the action server logs for detailed error information:

   ```bash
   # When using the enhanced action server
   cat action_server.log
   ```

4. If you make changes to action files, restart both servers to apply the changes.

You can delete them using Windows Explorer or with this command in your
terminal:
del \*.bat

1. For the Rasa action server:
   cd "D:\Redirection session\Documents\DTI\VirtualAssistant\ember-fresh\rasa"
   python minimal_action_server.py
2. For the Rasa main server:
   cd "D:\Redirection session\Documents\DTI\VirtualAssistant\ember-fresh\rasa"
   python -m rasa run --enable-api --cors "\*"

3. Always use .\train_and_run.bat to ensure proper training and startup It only:

4. Activates the Python virtual environment
5. Trains the Rasa model
6. Starts the Rasa action server
7. Starts the main Rasa server

8. For the backend server:
   cd "D:\Redirection session\Documents\DTI\VirtualAssistant\ember-fresh\server"
   node pain-tracking-service.js
9. For the frontend:
   cd "D:\Redirection session\Documents\DTI\VirtualAssistant\ember-fresh"
   npx webpack
   npx webpack serve

---

cd rasa
rasa train

After training, restart all three components:

1. Node.js server:
   cd server
   node pain-tracking-service.js

2. Action server:
   root: rasa_env_38\Scripts\activate
   cd rasa
   python run_action_server.py
3. Main Rasa server:
   root: rasa_env_38\Scripts\activate
   cd rasa
   rasa run --enable-api --cors "\*"
4. Front-end
   npx webpack
   npx webpack serve

http://localhost:8080
