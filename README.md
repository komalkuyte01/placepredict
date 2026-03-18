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
2. **Predicts placement probability** using a Random Forest + Logistic Regression ML ensemble trained on candidate data.
3. **Provides personalized feedback** — highlighting strengths, weaknesses, and an actionable improvement plan.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **AI Resume Parsing** | Upload a PDF resume — Gemini AI extracts skills, GPA, experience automatically |
| 📊 **ML Prediction Engine** | Ensemble of Random Forest (70%) + Logistic Regression (30%) |
| 🧠 **Engineered Rule Signals** | Adds 4 binary threshold features (e.g., CGPA < 7.5) directly into the feature vector |
| 🧪 **Cross-Validation Metrics** | Reports 5-fold CV metrics (accuracy, precision, recall, F1) in model insights |
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
| **ML Models** | ml-random-forest, ml-logistic-regression, ml-matrix | Placement probability prediction |
| **Charts** | Recharts | Interactive data visualizations |
| **PDF Parsing** | pdf-parse | Extracting text from uploaded resumes |
| **Linting** | Biome | Code quality & formatting |
| **Runtime / Package Manager** | Node.js + npm (Bun optional) | Dependency management & script runner |

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
│   │       ├── predict/            # Placement prediction endpoint
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

- Node.js 18+
- npm 9+
- (Optional) [Bun](https://bun.sh/) v1.0+
- A [Google Gemini API Key](https://aistudio.google.com/apikey)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd gradesight

# 2. Install dependencies
npm install
```

Create a `.env.local` file in the project root and add:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

```bash
# 4. Start the development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📖 How to Use

1. **Upload Resume** — Upload your PDF resume for AI-powered data extraction.
2. **Review & Edit** — Confirm or update the auto-filled profile fields.
3. **Run Prediction** — Click **"Run ML Prediction"** to get your placement probability.
4. **Analyze Results** — Review your score, strengths, weaknesses, and improvement plan.

---

## 🤖 ML Pipeline (Current)

The current prediction flow in `src/lib/ml/placement-ml-engine.ts` is:

1. Build a **21-feature vector**:
  - 17 base features (academics, technical, experience, soft skills)
  - 4 engineered binary flags:
    - `Is CGPA Below 7.5`
    - `Is 12th Below 60%`
    - `Is Skills Below 5`
    - `Is Projects Below 2`
2. Apply **min-max normalization** (clamped to `[0, 1]` for inference safety).
3. Train models using **5-fold cross-validation** for metrics:
  - Random Forest
  - Logistic Regression
4. Train final models on full data and predict with a weighted ensemble:
  - `RF * 0.7 + LR * 0.3`
5. Return:
  - probability (0–100)
  - risk category
  - strengths/weaknesses/suggestions
  - feature importance
  - CV metrics (`modelInsights.cvMetrics`)

> Note: The bundled training data is synthetic/prototype data and should not be treated as production ground truth.

---

## 🧪 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run Biome linter |
| `npm run format` | Format code with Biome |

---
