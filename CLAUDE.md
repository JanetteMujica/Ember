# Ember Project Guidelines

## Build & Run Commands
- Frontend build: `npx webpack`
- Frontend dev server: `npx webpack serve`
- Node.js backend: `cd server && node pain-tracking-service.js`
- Rasa server: `cd rasa && rasa run` (requires Python 3.8 env: `rasa_env_38\Scripts\activate`)
- Rasa actions: `cd rasa && rasa run actions`
- Rasa train: `cd rasa && python -m rasa train`

## Code Style

### JavaScript/React
- Imports: React first, then components, then services
- Components: Functional with hooks, not classes
- Naming: PascalCase for components, camelCase for functions/variables
- Error handling: Try/catch with console.error and fallbacks
- Path aliases: Use @components, @pages, @services, etc. (see webpack config)

### Python (Rasa)
- Imports: Standard library first, third-party next, local last
- Naming: PascalCase for classes, snake_case for methods/variables
- Classes: Inherit from base classes when possible
- Type hints: Use consistently (e.g., `def name(self) -> Text:`)
- Error handling: Specific exception catching with logging

## Project Structure
Frontend React app, Node.js backend, and Rasa chatbot must run simultaneously.
See instructionServer.md for detailed setup instructions.