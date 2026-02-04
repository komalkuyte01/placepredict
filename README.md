# GradeSight

A modern, responsive Student Performance Prediction Dashboard built with Next.js 16. This application uses machine learning to analyze student data and predict academic outcomes.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)

## Features

- **📊 AI-Powered Predictions**: Uses multivariate linear regression to predict student grades based on various factors
- **📁 File Upload**: Drag-and-drop support for CSV and Excel files
- **📈 Interactive Analytics**: Comprehensive charts and visualizations powered by Recharts
- **🎯 Risk Assessment**: Identifies at-risk students with detailed contributing factors
- **🌙 Dark Mode**: Automatic dark mode support based on system preferences
- **📱 Responsive Design**: Fully fluid layout from mobile to ultra-wide monitors

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **UI Components**: Ark UI (headless) + Tailwind CSS 4
- **Charts**: Recharts
- **ML Engine**: ml-regression (TypeScript-native)
- **File Parsing**: xlsx (CSV/Excel support)
- **Icons**: Lucide React
- **Linting/Formatting**: Biome
- **Package Manager**: Bun

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page (RSC)
│   └── globals.css         # Global styles & Tailwind config
├── components/
│   ├── charts/             # Recharts visualization components
│   ├── dashboard/          # Dashboard & analytics components
│   ├── ui/                 # Reusable UI primitives
│   └── upload/             # File upload components
└── lib/
    ├── actions/            # Server Actions
    ├── ml/                 # Prediction engine
    ├── parsers/            # File parsing utilities
    ├── types/              # TypeScript type definitions
    └── utils/              # Utility functions
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- Node.js 18+ (for compatibility)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd gradesight

# Install dependencies
bun install

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

1. **Upload Data**: Drag and drop a CSV or Excel file containing student data
2. **View Analytics**: Explore grade distributions, correlations, and trends
3. **Identify At-Risk Students**: Review students flagged as high-risk with contributing factors

### Data Format

The application expects data following the [Student Performance Prediction Dataset](https://www.kaggle.com/datasets/prajwalkanade/student-performance-prediction-dataset) schema:

| Field | Type | Description |
|-------|------|-------------|
| StudentID | string/number | Unique identifier |
| Age | number | Student age (15-22) |
| Gender | string | "Male" or "Female" |
| Ethnicity | number | 0-3 |
| ParentalEducation | string | Education level |
| StudyTimeWeekly | number | Hours per week |
| Absences | number | Number of absences |
| Tutoring | string | "Yes" or "No" |
| ParentalSupport | string | "Low", "Medium", "High" |
| Extracurricular | string | "Yes" or "No" |
| Sports | string | "Yes" or "No" |
| Music | string | "Yes" or "No" |
| Volunteering | string | "Yes" or "No" |
| GPA | number | 0.0 - 4.0 |
| GradeClass | number | 0-4 (optional, for training) |

A sample file is available at `/public/sample-student-data.csv`.

## Scripts

```bash
bun run dev      # Start development server
bun run build    # Build for production
bun run start    # Start production server
bun run lint     # Run Biome linter
bun run format   # Format code with Biome
```

## Prediction Engine

The prediction engine uses a combination of:

1. **Multivariate Linear Regression**: When sufficient labeled data is provided
2. **Heuristic Scoring**: Fallback algorithm based on educational research

Key factors influencing predictions:
- **GPA** (45% weight): Current academic performance
- **Study Time** (35% weight): Weekly study hours
- **Absences** (-25% weight): Negative correlation with performance
- **Tutoring** (15% weight): Additional academic support
- **Parental Support** (12% weight): Family involvement

## Design Philosophy

**Calm Dashboard Aesthetic**: The UI uses a muted, professional color palette with slate tones. This creates a focused, academic environment that minimizes visual distractions while maintaining excellent readability.

## License

MIT License

---

Built with ❤️ for Data Science education
