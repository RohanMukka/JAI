
# JAI Web App

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Copy `.env.example` to `.env.local` and fill in the values:
    - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`.
    - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: From Google Cloud Console.
    - `MONGODB_URI`: Connection string to your MongoDB Atlas cluster.
    - `MONGODB_DB`: Database name (e.g., `jai_db`).
    - `BACKEND_URL`: URL of the Python backend (default: `http://localhost:8000`).

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## Features

- **Authentication**: Sign in with Google.
- **Dashboard**: Manage your job application sessions.
- **Profile**: Store your base resume and personal details.
- **Session Workflow**:
    1.  Create a session with job details.
    2.  Generate a tailored resume (calls backend).
    3.  Edit resume JSON and cover letter.
    4.  Export to PDF (calls backend).
    5.  Autofill application (opens URL with session ID).

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: NextAuth.js (Auth.js)
- **Database**: MongoDB
