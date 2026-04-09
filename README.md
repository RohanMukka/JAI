# JAI — Job Application Intelligence

AI-powered Chrome extension and Next.js dashboard that auto-tailors resumes to job descriptions using Google Gemini, with Overleaf LaTeX integration and one-click job application autofill.

## Architecture

```
┌──────────────────┐      ┌──────────────────────────┐      ┌──────────────┐
│  Chrome Extension│◄────►│  Next.js Web Dashboard   │◄────►│   MongoDB    │
│  (Manifest V3)   │      │  (App Router + API Routes)│      │  (Atlas)     │
└────────┬─────────┘      └────────────┬─────────────┘      └──────────────┘
         │                             │
         ▼                             ▼
┌──────────────────┐      ┌──────────────────────────┐
│  Google Gemini   │      │  Google OAuth (NextAuth)  │
│  (Resume AI)     │      │  + Gmail API              │
└──────────────────┘      └──────────────────────────┘
         │
         ▼
┌──────────────────┐
│  Overleaf        │
│  (LaTeX → PDF)   │
└──────────────────┘
```

## Features

- **AI Resume Tailoring** — Gemini rewrites your LaTeX resume to match any job description, preserving layout and formatting while optimizing content for ATS systems.
- **Overleaf Automation** — Auto-opens Overleaf, injects generated LaTeX, and triggers compilation for instant PDF download.
- **Job Application Autofill** — Scans application forms and fills fields (name, email, education, demographics, work authorization) from your saved profile using fuzzy matching.
- **API Key Rotation** — Extension supports multiple Gemini API keys with automatic failover on rate limits, countdown retry, and cancellation.
- **Web Dashboard** — Full-stack Next.js app with Google OAuth, resume upload/parsing, job search (JSearch/RapidAPI), application tracking, and Gmail inbox scanning.
- **Profile Management** — Onboarding flow captures education, work history, skills, and demographics. Data drives both the autofill engine and resume generation.

## Project Structure

```
extension/                    # Chrome Extension (Manifest V3)
├── manifest.json             # Permissions, content scripts, service worker
├── popup/                    # Side panel UI (login, automate, autofill)
├── options/                  # Settings page (LaTeX resume editor)
├── scripts/
│   ├── background.js         # Service worker — Gemini API calls, key rotation
│   ├── content_jd.js         # Extracts JD text from active tab
│   ├── content_overleaf.js   # Automates Overleaf editor injection
│   └── content_autofill.js   # Smart form-filling with field detection
└── icons/

web/                          # Next.js 16 Web Dashboard
├── src/
│   ├── app/
│   │   ├── api/              # Server-side API routes
│   │   │   ├── auth/         # NextAuth Google OAuth
│   │   │   ├── profile/      # User profile CRUD
│   │   │   ├── resume/       # Upload, parse, generate, view
│   │   │   ├── sessions/     # Resume generation sessions
│   │   │   ├── jobs/         # JSearch job search proxy
│   │   │   ├── email/        # Gmail integration + AI scan
│   │   │   └── onboarding/   # New user setup
│   │   ├── dashboard/        # Protected pages (jobs, tracker, inbox, profile)
│   │   ├── login/            # OAuth sign-in/sign-up
│   │   └── onboarding/       # Multi-step profile setup
│   ├── components/           # Sidebar, filters, editors, notifications
│   ├── context/              # AI agent + application state
│   └── lib/                  # MongoDB, Gemini, OpenRouter clients
└── package.json

docs/                         # Project documentation
└── devpost.md                # Hackathon submission writeup
```

## Setup

### 1. Web Dashboard

```bash
cd web
npm install
```

Create `web/.env.local`:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=jaidb
GOOGLE_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key    # Optional — fallback model provider
RAPIDAPI_KEY=your_rapidapi_key                # Optional — for JSearch job listings
```

```bash
npm run dev
# Dashboard at http://localhost:3000
```

### 2. Chrome Extension

Create `extension/scripts/config.js` (gitignored):
```javascript
const JAI_CONFIG = {
    API_KEYS: [
        "YOUR_GEMINI_API_KEY_1",    // Optional — leave empty if using OpenRouter only
        "YOUR_GEMINI_API_KEY_2"     // Optional rotation key
    ],
    OPENROUTER_KEY: "YOUR_OPENROUTER_KEY"  // Free fallback — get one at openrouter.ai (no credit card)
};
```

Load in Chrome:
1. Navigate to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `extension/` folder

### Usage

1. **Login** — Open `http://localhost:3000` and sign in with Google. Complete the onboarding profile.
2. **Configure Resume** — Open the extension settings and paste your LaTeX resume (a default template is pre-loaded).
3. **Optimize** — Navigate to a job posting, open the JAI side panel, and click **Generate & Download PDF**. The extension extracts the JD, sends it to Gemini, and opens Overleaf with the tailored LaTeX.
4. **Autofill** — On any job application form, click **Autofill Application** to auto-fill form fields from your profile.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Extension | Chrome Manifest V3, Service Workers, Content Scripts |
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Heroicons |
| Backend | Next.js API Routes (serverless), NextAuth |
| AI | Google Gemini 2.0 Flash, OpenRouter (fallback) |
| Database | MongoDB Atlas |
| Auth | Google OAuth 2.0, NextAuth.js |
| PDF | Overleaf (LaTeX compilation) |
| Jobs API | JSearch via RapidAPI |

## AI Provider Fallback

JAI automatically falls back through available AI providers:

| Priority | Provider | Requirement | Quality |
|----------|----------|-------------|---------|
| 1st | Google Gemini | `GOOGLE_API_KEY` | Best — full AI rewrite, PDF support |
| 2nd | OpenRouter (paid) | `OPENROUTER_API_KEY` | Excellent — Gemini 2.0 Flash via API |
| 3rd | OpenRouter (free) | Same key, no credit card | Great — Llama 3.3 70B, rate-limited |
| 4th | Local NLP Engine | Nothing — built in | Good — TF-IDF keywords, skill injection, bullet enhancement |

The local NLP engine runs with zero API keys and zero internet. It uses TF-IDF keyword extraction to identify important JD terms, detects skills mentioned in the JD but missing from your resume, strengthens weak action verbs, and injects relevant skills into your Skills section.

For the best experience, configure at least a free OpenRouter key. But the app works completely offline as a last resort.

## Troubleshooting

- **Extension not connecting** — Make sure the web app is running on `localhost:3000` and you're logged in. The extension detects the session via cookies.
- **Overleaf not pasting** — Click the JAI status banner in the Overleaf tab to re-copy the LaTeX to your clipboard, then paste manually with `Ctrl+V`.
- **Gemini 429 errors** — Add a second API key in `config.js` for automatic rotation. The extension retries with countdown on quota exhaustion.
- **No API key at all** — Set `OPENROUTER_KEY` in `config.js` (extension) or `OPENROUTER_API_KEY` in `.env.local` (web). Free models work with no credit card.
