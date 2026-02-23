# PlacePredict

A modern, responsive Student Placement Probability Prediction system built with Next.js 16. This application uses machine learning to analyze candidate profiles and predict placement chances for Software Developer roles.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)

## Features

- **AI Resume Parsing**: Upload your resume (PDF) and Gemini AI automatically extracts relevant information
- **Resume ATS Score**: AI-calculated ATS (Applicant Tracking System) compatibility score
- **ML-Powered Predictions**: Ensemble machine learning models (Logistic Regression, Random Forest, KNN) for accurate probability prediction
- **Personalized Insights**: Identifies strengths, weaknesses, and provides actionable improvement suggestions
- **Feature Contribution Analysis**: Understand which factors impact your placement probability most
- **Responsive Design**: Fully fluid layout from mobile to ultra-wide monitors

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **AI Resume Parser**: Google Gemini AI
- **ML Libraries**: ml-logistic-regression, ml-random-forest, ml-knn, ml-pca, ml-kmeans
- **UI Components**: Ark UI (headless) + Tailwind CSS 4
- **Charts**: Recharts
- **PDF Parsing**: pdf-parse
- **Icons**: Lucide React
- **Linting/Formatting**: Biome
- **Package Manager**: Bun

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page (Placement Dashboard)
│   ├── globals.css         # Global styles & Tailwind config
│   └── api/
│       └── parse-resume/   # Gemini AI resume parsing endpoint
├── components/
│   ├── dashboard/          # Placement dashboard component
│   ├── forms/              # Candidate profile form
│   ├── results/            # Prediction results display
│   └── ui/                 # Reusable UI primitives
└── lib/
    ├── ml/                 # ML prediction engine
    ├── parsers/            # Resume parsing utilities
    ├── types/              # TypeScript type definitions
    └── utils/              # Utility functions
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- Node.js 18+ (for compatibility)
- Google Gemini API Key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd gradesight

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

Create a `.env.local` file with:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## Usage

1. **Upload Resume (Optional)**: Upload your PDF resume for AI-powered data extraction
2. **Fill Profile**: Complete any missing fields in the candidate profile form
3. **Run Prediction**: Click Run ML Prediction to get your placement probability
4. **Review Results**: Analyze your strengths, weaknesses, and improvement suggestions

### Profile Fields

| Section | Field | Description |
|---------|-------|-------------|
| **Academic** | CGPA | Grade Point Average (0-10) |
| | 10th Percentage | Secondary school percentage |
| | 12th Percentage | Higher secondary percentage |
| | Degree Branch | Engineering branch |
| | Active Backlogs | Number of failed subjects |
| **Technical** | Programming Languages | Languages you know |
| | DSA Level | Data Structures and Algorithms proficiency |
| | Projects Count | Number of projects completed |
| | Has Internship | Internship experience |
| | Certifications | Professional certifications |
| **Experience** | Hackathons | Number of hackathons participated |
| | Open Source | Open source contributions |
| | Resume ATS Score | AI-calculated ATS compatibility (0-100) |
| **Soft Skills** | Aptitude Score | Aptitude test score (0-100) |
| | Communication | Communication skills (1-10) |
| | Mock Interview | Mock interview performance (1-10) |
| | English Fluency | English proficiency (1-10) |

## Scripts

```bash
bun run dev      # Start development server
bun run build    # Build for production
bun run start    # Start production server
bun run lint     # Run Biome linter
bun run format   # Format code with Biome
```

## License

MIT
