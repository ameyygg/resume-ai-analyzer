# Resume AI Analyzer

An AI-powered web application that analyzes resumes and provides insights, feedback, and recommendations to help users improve their CVs. Built with Next.js, TypeScript, and modern web technologies.

## Link
https://resumindd.netlify.app/ (uses google gemini)

## Features
- Upload PDF resumes securely
- AI-driven resume analysis and feedback
- Clean, modern UI with dark mode
- Fast, serverless backend (Next.js API routes)
- Supports multiple resume uploads

## Tech Stack
- **Frontend:** Next.js (App Router), React, TypeScript, Inter font, Lucide icons
- **Backend:** Next.js API routes
- **Styling:** CSS (dark theme)
- **Other:** Vercel (recommended deployment)

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ameyygg/resume-ai-analyzer.git
   cd resume-ai-analyzer
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Folder Structure
```
resume-ai-analyzer/
  app/           # Next.js app directory (pages, layout, styles)
  lib/           # Utility functions
  pages/api/     # API routes for upload, analysis, etc.
  public/        # Static files (SVGs, uploads)
  ...
```

## Usage
- Upload your resume as a PDF.
- The AI will analyze your resume and provide feedback.
- Download or view suggestions to improve your CV.

## Contributing
Contributions are welcome! Please open issues or pull requests for improvements or bug fixes.

## License
[MIT](LICENSE)

## Contact
Created by [ameyygg](https://github.com/ameyygg). For questions, open an issue or contact via GitHub.
