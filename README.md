# Ember Fresh

A virtual assistant application for pain tracking and management with Rasa AI integration.

## Getting Started

Please refer to the `instructionServer.md` file for detailed setup instructions for all components of the application.

## Repository Maintenance

### Fixing Git Large File Issues

If you're experiencing issues with large files being tracked by Git despite being in .gitignore, run the included cleanup script:

```bash
# Navigate to the project root
cd "D:\Redirection session\Documents\DTI\VirtualAssistant\ember-fresh"

# Run the cleanup script
./git-clean.sh

# After reviewing the changes, commit them
git commit -m "Remove large directories from Git tracking"
```

The script will:
1. Remove `node_modules/` directories from Git tracking
2. Remove Python virtual environments from Git tracking
3. Remove Rasa model files from Git tracking
4. Remove log files from Git tracking
5. Remove build output from Git tracking

This will make your Git operations much faster and prevent large files from being included in commits.
