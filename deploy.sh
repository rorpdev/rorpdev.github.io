#!/bin/bash
set -e

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment to GitHub Pages...${NC}"

# Step 1: Make sure we're on the main branch
echo -e "${YELLOW}Checking out main branch...${NC}"
git checkout main

# Step 2: Build the app with correct base path
echo -e "${YELLOW}Building the app...${NC}"
npm run build

# Step 3: Create temporary directory and copy the entire repo
echo -e "${YELLOW}Creating temporary copy of the repository...${NC}"
mkdir -p tmp_deploy
cp -R .git tmp_deploy/
for file in package.json package-lock.json README.md LICENSE; do
  if [ -f "$file" ]; then
    cp "$file" tmp_deploy/
  fi
done
# Add more important non-build files if needed

# Step 4: Copy build files to tmp directory
echo -e "${YELLOW}Copying build files...${NC}"
cp -R dist/* tmp_deploy/

# Step 5: Remove everything except the tmp directory
echo -e "${YELLOW}Preparing for deployment...${NC}"
find . -maxdepth 1 -not -name "tmp_deploy" -not -name "." -not -name ".git" -exec rm -rf {} \;

# Step 6: Move everything from tmp back to root
echo -e "${YELLOW}Moving build files to root...${NC}"
cp -R tmp_deploy/* .
rm -rf tmp_deploy

# Step 7: Add all files to git
echo -e "${YELLOW}Adding files to git...${NC}"
git add -A

# Step 8: Commit
echo -e "${YELLOW}Committing changes...${NC}"
git commit -m "Deploy to GitHub Pages"

# Step 9: Push
echo -e "${YELLOW}Pushing to GitHub...${NC}"
git push origin main

echo -e "${GREEN}Deployment complete! Your site should be live at https://rorpdev.github.io${NC}"