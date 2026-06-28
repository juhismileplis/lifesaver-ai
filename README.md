# 🛟 LifeSaver AI

> **AI-Powered Productivity Companion** — Never miss a deadline again.

Built for the [Hackathon Name] Hackathon. LifeSaver AI is a proactive productivity companion that helps students, professionals, and entrepreneurs plan, prioritize, and complete tasks before deadlines are missed.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎯 **Smart Prioritization** | AI analyzes tasks by urgency and importance |
| 📅 **AI Scheduling** | Optimal time slots based on workload and deadlines |
| 🧩 **Task Breakdown** | Automatically breaks complex tasks into subtasks |
| 💬 **AI Companion Chat** | Proactive assistant that monitors deadlines and offers help |
| 📊 **Productivity Insights** | Personalized analytics and recommendations |
| 🎯 **Goal & Habit Tracking** | Set goals, track streaks, build routines |
| 🗓️ **Calendar View** | Visual schedule with task overview |
| 🎤 **Voice Input** | Speech-to-text for hands-free task entry |
| 🔔 **Proactive Alerts** | Context-aware notifications for at-risk deadlines |
| 🔐 **Google Sign-In** | Secure authentication via Google OAuth |

## 🚀 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** [Google Gemini API](https://ai.google.dev/) (gemini-1.5-flash)
- **State:** Zustand
- **Auth:** NextAuth.js with Google Provider
- **Deployment:** [Google Cloud Run](https://cloud.google.com/run)

## 🏗️ Architecture

```
lifesaver-ai/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Dashboard pages
│   │   ├── page.tsx       # Overview
│   │   ├── tasks/         # Task management
│   │   ├── calendar/      # Calendar view
│   │   ├── companion/     # AI chat
│   │   └── insights/      # Analytics & goals
│   └── api/               # API routes
│       ├── gemini/        # AI endpoints
│       └── auth/          # Authentication
├── components/            # React components
│   ├── ui/               # Reusable UI kit
│   ├── layout/           # Navigation & shell
│   ├── dashboard/        # Dashboard widgets
│   ├── tasks/            # Task components
│   └── companion/        # Chat components
└── lib/                  # Core utilities
    ├── gemini.ts         # Gemini AI client
    ├── store.ts          # Zustand stores
    ├── types.ts          # TypeScript types
    └── utils.ts          # Helper functions
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd lifesaver-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.local .env.local
# Edit .env.local with your API keys (see below)

# Run development server
npm run dev
```

### Environment Variables

```env
# Required: Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Required: NextAuth.js Secret
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ☁️ Deployment to Google Cloud Run

### Prerequisites

1. **Google Cloud Account** — Sign up at https://console.cloud.google.com (free tier — $300 credits, no charge)
2. **Google Cloud SDK** — Install from https://cloud.google.com/sdk/docs/install
3. **Docker Desktop** — Install from https://www.docker.com/products/docker-desktop/
4. **Gemini API Key** — Get from https://aistudio.google.com/app/apikey

### Option 1: Deploy via gcloud CLI (Recommended)

```bash
# 1. Login to Google Cloud
gcloud auth login

# 2. Set your project (create one first in Google Cloud Console)
gcloud config set project YOUR_PROJECT_ID

# 3. Enable Cloud Run and Artifact Registry
gcloud services enable run.googleapis.com artifactregistry.googleapis.com

# 4. Deploy directly from source
gcloud run deploy lifesaver-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=your_key_here,NEXTAUTH_SECRET=your_secret_here,NEXTAUTH_URL=https://your-service-url.a.run.app"
```

### Option 2: Deploy via Docker (Build & Push)

```bash
# Build the Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/lifesaver-ai .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/lifesaver-ai

# Deploy to Cloud Run
gcloud run deploy lifesaver-ai \
  --image gcr.io/YOUR_PROJECT_ID/lifesaver-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Required Environment Variables

Set these in Cloud Run Console or via the --set-env-vars flag:

```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=https://your-app-url.a.run.app
```

> **Note:** Your Dockerfile is already configured for Cloud Run (exposes port 8080, standalone Next.js output).

## 📝 Google Technologies Used

| Technology | Usage |
|------------|-------|
| **Gemini API** (gemini-1.5-flash) | Core AI engine for task analysis, scheduling, chat, insights, deadline prediction |
| **Google Cloud Run** | Serverless container deployment |
| **Google Artifact Registry** | Container image storage |
| **Google OAuth** | User authentication (via NextAuth.js) |

## 🏆 Hackathon Submission

### Submission Items

1. **Deployed App Link** — URL of your Cloud Run service (e.g., `https://lifesaver-ai-xxx.a.run.app`)
2. **GitHub Repository** — Source code at `https://github.com/YOUR_USERNAME/lifesaver-ai`
3. **Google Doc** — Project description with:
   - Problem Statement Selected
   - Solution Overview
   - Key Features
   - Technologies Used
   - Google Technologies Utilized

---

Built with ❤️ for the Google AI Hackathon
