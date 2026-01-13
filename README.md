# Interview Tools - Android Developer Interview Management System

This is a standalone interview management application extracted from the main portfolio for personal use.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Git Repository
```bash
cd /Users/rorpheeyah/WebstormProjects/rorpheeyah.github.io/.temp-interview-app
git init
git add .
git commit -m "Initial commit - Interview Tools app"
```

### 3. Link to Remote Repository
First, ensure the remote repository is created on GitHub at `https://github.com/rorpdev/rorpdev.git`

```bash
git remote add origin https://github.com/rorpdev/rorpdev.git
git branch -M main
git push -u origin main
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

### 6. Deploy to GitHub Pages
```bash
npm run deploy:gh-pages
```

## Features
- **Interview Scorecard**: Randomly generate questions, score candidates, calculate recommendations
- **Question Management**: Add, edit, delete questions by category
- **Template System**: Different question sets for Junior, Mid, and Senior levels
- **Interview History**: Track past interviews with search and filtering
- **Category Customization**: Create custom question categories

## Local Storage Keys
The app uses localStorage with the following keys:
- `androidInterviewQuestions` - Custom question bank
- `androidInterviewSettings` - Interview settings (max questions, template)
- `androidInterviewDrafts` - Saved interview drafts
- `androidInterviewCurrentDraftId` - Current draft ID
- `androidInterviewHistory` - Completed interviews
- `androidInterviewCustomCategories` - Custom categories
- `interview-app-theme` - Theme preference

## Tech Stack
- React 18 with TypeScript
- Vite
- Tailwind CSS
- Lucide Icons

## Notes
- This app uses the same localStorage keys as the original portfolio, so data from the original app will migrate over automatically
- The questions.json file contains a basic set of questions for junior, mid, and senior templates
- You can add more questions through the "Manage" tab in the app