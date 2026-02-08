# JAI - Job Application Intelligence

JAI is an automated tool designed to streamline the job application process by tailoring your resume to specific job descriptions using AI and automatically generating a professional PDF via Overleaf.

## 🚀 Features

-   **AI-Powered Resume Optimization**: Uses Google Gemini to rewrite your resume content to match a specific Job Description (JD), highlighting relevant skills and experiences.
-   **Automated LaTeX Generation**: Converts the optimized content into a high-quality LaTeX resume.
-   **Overleaf Integration**: Automatically opens Overleaf, creates a new project, and injects the generated LaTeX code to compile a PDF.
-   **Web Dashboard**: A centralized hub to manage your master resume, user profile, and application history.

## 📂 Project Structure

-   **`extension/`**: The Chrome Extension source code.
    -   `manifest.json`: Extension configuration.
    -   `popup/`: The extension popup UI.
    -   `scripts/background.js`: Handles API calls to Gemini and orchestrates the automation.
    -   `scripts/content_overleaf.js`: Automates the Overleaf interface (Project creation, code injection).
    -   `scripts/content_jd.js`: Extracts text from Job Description pages.
-   **`web/`**: The Next.js Web Dashboard.
    -   Built with Next.js 15+, Tailwind CSS, and MongoDB.
    -   Handles User Authentication (NextAuth with Google).
    -   Stores master resume data.
-   **`backend/`**: (Currently Unused) Python backend scaffolding.

## 🛠️ Setup Instructions

### 1. Web Dashboard (Required for Profile Management)

The web dashboard is used to manage your "Master Resume" data which the extension uses as a base.

1.  Navigate to the `web` directory:
    ```bash
    cd web
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    Create a `.env.local` file in the `web` directory with the following keys:
    ```env
    google_client_id=YOUR_GOOGLE_CLIENT_ID
    google_client_secret=YOUR_GOOGLE_CLIENT_SECRET
    NEXTAUTH_SECRET=your_nextauth_secret
    nextauth_url=http://localhost:3000
    mongodb_uri=YOUR_MONGODB_CONNECTION_STRING
    mongodb_db=jaidb
    backend_url=http://localhost:3000
    GOOGLE_API_KEY=YOUR_GEMINI_API_KEY
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
    The dashboard will be available at `http://localhost:3000`.

### 2. Chrome Extension

1.  Navigate to the `extension` directory.
2.  **Configuration**: Ensure `extension/scripts/config.js` exists and contains your Gemini API keys:
    ```javascript
    const JAI_CONFIG = {
        API_KEYS: [
            "YOUR_GEMINI_API_KEY_1",
            "YOUR_GEMINI_API_KEY_2" // Optional rotation
        ]
    };
    ```
3.  **Install in Chrome**:
    -   Open Chrome and go to `chrome://extensions`.
    -   Enable "Developer mode" (top right).
    -   Click "Load unpacked".
    -   Select the `extension` folder.

## 📖 Usage Guide

1.  **Login**: Open the Web Dashboard (`http://localhost:3000`) and log in. Fill out your Master Resume profile.
2.  **Connect Extension**: Open the JAI Extension popup. It should detect your login session from the web app.
3.  **Find a Job**: Navigate to a job posting (e.g., LinkedIn, Indeed).
4.  **Automate**:
    -   Click the JAI Extension icon.
    -   Click **"Automate"**.
    -   JAI will extract the JD, send it to Gemini along with your Master Resume, and generate a tailored LaTeX version.
5.  **Get PDF**:
    -   JAI will automatically open Overleaf in a new tab.
    -   It will create a blank project and paste the generated LaTeX code.
    -   Review the PDF and download it!

## 🔧 Troubleshooting

-   **Extension connection issue**: Ensure the Web App is running on `localhost:3000` and you are logged in. The extension checks for cookies on `localhost`.
-   **Overleaf not pasting**: If the automation stops at Overleaf, click the JAI banner in the Overleaf tab to manually copy the code to your clipboard, then paste it into the editor.
