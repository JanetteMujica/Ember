#!/bin/bash
# Script to clean up large directories from Git tracking

# Text colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Git repository cleanup...${NC}"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
  echo -e "${RED}Error: This script must be run at the root of a git repository.${NC}"
  exit 1
fi

# 1. Remove node_modules from Git tracking
echo -e "${YELLOW}Removing node_modules directories from Git tracking...${NC}"
git rm -r --cached --ignore-unmatch node_modules/
git rm -r --cached --ignore-unmatch */node_modules/
git rm -r --cached --ignore-unmatch */*/node_modules/

# 2. Remove Python virtual env from Git tracking
echo -e "${YELLOW}Removing Python virtual environment from Git tracking...${NC}"
git rm -r --cached --ignore-unmatch rasa_env_38/
git rm -r --cached --ignore-unmatch venv/
git rm -r --cached --ignore-unmatch *env*/

# 3. Remove Rasa models from Git tracking
echo -e "${YELLOW}Removing Rasa models from Git tracking...${NC}"
git rm -r --cached --ignore-unmatch rasa/models/
git rm -r --cached --ignore-unmatch */models/*.tar.gz

# 4. Remove log files from Git tracking
echo -e "${YELLOW}Removing log files from Git tracking...${NC}"
git rm -r --cached --ignore-unmatch logs/
git rm -r --cached --ignore-unmatch */logs/
git rm -r --cached --ignore-unmatch *.log

# 5. Remove build output from Git tracking
echo -e "${YELLOW}Removing build output from Git tracking...${NC}"
git rm -r --cached --ignore-unmatch **/public/assets/

echo -e "${GREEN}Finished removing files from Git tracking.${NC}"
echo -e "${YELLOW}Now you should commit these changes to make the cleanup permanent:${NC}"
echo -e "git status  # Verify the changes"
echo -e "git commit -m \"Remove large directories from Git tracking\""

# Create a .gitattributes file to prevent binary files from being tracked
if [ ! -f ".gitattributes" ]; then
  echo -e "${GREEN}Creating .gitattributes file to prevent tracking binary files...${NC}"
  cat > .gitattributes << EOL
# Auto detect text files and perform LF normalization
* text=auto

# Don't diff or merge these files
*.tar.gz binary
*.tar binary
*.gz binary
*.zip binary
*.pdf binary
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.woff binary
*.woff2 binary
*.ttf binary
*.eot binary
*.mp4 binary
*.webm binary
*.mp3 binary
*.ogg binary
EOL
  echo -e "${GREEN}.gitattributes file created. You can add it to your commit.${NC}"
  echo -e "git add .gitattributes"
fi

echo -e "${GREEN}Cleanup script completed successfully.${NC}"