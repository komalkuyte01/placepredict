<p align="center">
  <h1 align="center">GradeSight</h1>
  <p align="center">
    AI-Powered Student Placement Probability Predictor
    <br />
    <em>Know your chances. Improve your profile. Get placed.</em>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" />
</p>

---

## 📌 About

**GradeSight** is a smart web application that predicts a student's chances of getting placed (hired) in the tech industry as a Software Developer.

A student simply uploads their resume or fills in their profile, and the system:
1. **Reads the resume** using Google Gemini AI — just like a human recruiter would.
2. **Predicts placement probability** using Machine Learning algorithms trained on candidate data.
3. **Provides personalized feedback** — highlighting strengths, weaknesses, and an actionable improvement plan.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **AI Resume Parsing** | Upload a PDF resume — Gemini AI extracts skills, GPA, experience automatically |
| 📊 **ML Prediction Engine** | Ensemble of Logistic Regression, Random Forest & KNN models |
| 💡 **Smart Feedback** | Strengths, weaknesses, and prioritized improvement suggestions |
| 📈 **Feature Contributions** | Visual breakdown of which factors impact placement the most |
| 📱 **Fully Responsive** | Works seamlessly on mobile, tablet, and desktop |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16, React 19 | Server-rendered, fast & interactive UI |
| **Styling** | Tailwind CSS 4 | Modern, responsive design system |
| **AI / NLP** | Google Gemini API | Resume parsing & AI-powered suggestions |
| **ML Models** | ml-random-forest, ml-logistic-regression, ml-knn, ml-matrix | Placement probability prediction |
| **Charts** | Recharts | Interactive data visualizations |
| **PDF Parsing** | pdf-parse | Extracting text from uploaded resumes |
| **Linting** | Biome | Code quality & formatting |
| **Package Manager** | Bun | Fast dependency management & script runner |

---

## 📁 Project Structure

```
gradesight/
├── public/                         # Static assets
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout & metadata
│   │   ├── page.tsx                # Home page
│   │   ├── globals.css             # Global styles & Tailwind config
│   │   └── api/                    # Backend API routes
│   │       ├── parse-resume/       # Gemini AI resume parsing endpoint
│   │       ├── ai-suggestions/     # AI-generated improvement suggestions
│   │       └── check-relevance/    # Resume relevance scoring
│   │
│   ├── components/                 # React components
│   │   ├── dashboard/              # Main placement dashboard
│   │   ├── forms/                  # Candidate profile input form
│   │   ├── results/                # Prediction results display
│   │   ├── landing/                # Landing page hero section
│   │   ├── shared/                 # Shared/common components
│   │   └── ui/                     # Reusable UI primitives (Button, Input, etc.)
│   │
│   └── lib/                        # Core logic & utilities
│       ├── ml/                     # ML prediction engine (models & training)
│       ├── types/                  # TypeScript type definitions
│       └── utils/                  # Helper functions
│
├── .env.local                      # Environment variables (Gemini API key)
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
└── next.config.ts                  # Next.js configuration
```

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.0+ (or Node.js 18+)
- A [Google Gemini API Key](https://aistudio.google.com/apikey)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd gradesight

# 2. Install dependencies
bun install

# 3. Set up environment variables
cp .env.example .env.local
```

Add your API key to `.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

```bash
# 4. Start the development server
bun run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📖 How to Use

1. **Upload Resume** — Upload your PDF resume for AI-powered data extraction.
2. **Review & Edit** — Confirm or update the auto-filled profile fields.
3. **Run Prediction** — Click **"Run ML Prediction"** to get your placement probability.
4. **Analyze Results** — Review your score, strengths, weaknesses, and improvement plan.

---

## 🧪 Available Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start development server |
| `bun run build` | Create production build |
| `bun run start` | Start production server |
| `bun run lint` | Run Biome linter |
| `bun run format` | Format code with Biome |

---
