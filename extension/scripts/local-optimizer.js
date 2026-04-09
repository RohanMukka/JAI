/**
 * Local Resume Optimizer for Chrome Extension — Zero-API fallback.
 *
 * Uses TF-IDF keyword extraction + skill gap detection to optimize
 * LaTeX resume content against a job description. No network calls.
 */

const TECH_SKILLS = [
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "golang",
    "rust", "ruby", "php", "swift", "kotlin", "scala", "sql", "html", "css",
    "react", "next.js", "nextjs", "angular", "vue", "svelte", "express",
    "fastapi", "flask", "django", "spring", "spring boot", "node.js", "nodejs",
    ".net", "rails", "tailwind", "bootstrap",
    "tensorflow", "pytorch", "keras", "scikit-learn", "xgboost", "langchain",
    "openai", "gpt", "llm", "nlp", "deep learning", "machine learning",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins",
    "ci/cd", "github actions", "kafka", "redis", "rabbitmq", "elasticsearch",
    "postgresql", "mysql", "mongodb", "dynamodb", "firebase", "supabase",
    "git", "linux", "graphql", "rest", "grpc", "websocket", "agile",
    "pandas", "numpy", "airflow", "mlflow", "spark", "hadoop",
];

const STOP_WORDS = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "has", "have", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "can", "this", "that", "these", "those",
    "it", "its", "we", "our", "you", "your", "they", "their", "not", "no",
    "if", "as", "so", "up", "out", "about", "who", "which", "when", "where",
    "how", "what", "all", "each", "every", "both", "few", "more", "most",
    "other", "some", "such", "than", "too", "very", "just", "also",
    "work", "working", "experience", "ability", "strong", "required",
    "preferred", "must", "team", "role", "position", "company", "job",
]);

function tokenize(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s.#+\-/]/g, " ").split(/\s+/).filter(t => t.length > 1);
}

function extractKeywords(jdText, topK = 30) {
    const tokens = tokenize(jdText);
    const tf = {};

    // Count unigrams
    for (const t of tokens) {
        tf[t] = (tf[t] || 0) + 1;
    }

    // Count bigrams
    for (let i = 0; i < tokens.length - 1; i++) {
        const bg = tokens[i] + " " + tokens[i + 1];
        tf[bg] = (tf[bg] || 0) + 1;
    }

    const scored = [];
    for (const [term, freq] of Object.entries(tf)) {
        if (STOP_WORDS.has(term)) continue;
        if (term.length < 2) continue;
        let score = freq;
        if (TECH_SKILLS.includes(term)) score *= 5;
        if (term.includes(" ")) score *= 1.5;
        scored.push([term, score]);
    }

    scored.sort((a, b) => b[1] - a[1]);
    return scored.slice(0, topK).map(([term]) => term);
}

function findMissingSkills(jdText, resumeText) {
    const jd = jdText.toLowerCase();
    const resume = resumeText.toLowerCase();
    return TECH_SKILLS.filter(skill => jd.includes(skill) && !resume.includes(skill));
}

/**
 * Optimize a LaTeX resume locally. Returns modified LaTeX with:
 * - Missing skills injected into the Skills section
 * - A comment block listing top JD keywords for manual reference
 */
function optimizeLatexLocally(jdText, latexResume) {
    const keywords = extractKeywords(jdText);
    const missingSkills = findMissingSkills(jdText, latexResume);

    let result = latexResume;

    // 1. Inject missing skills into the Skills section
    if (missingSkills.length > 0) {
        // Try to find "Frameworks" or "Technologies" or "Tools" line and append
        const frameworksPattern = /(\\textbf\{(?:Frameworks|Technologies|Libraries|Tools)[^}]*\}\{[^}]*)/i;
        const languagesPattern = /(\\textbf\{(?:Languages|Programming)[^}]*\}\{[^}]*)/i;

        const toAdd = missingSkills.slice(0, 6).join(", ");

        if (frameworksPattern.test(result)) {
            result = result.replace(frameworksPattern, `$1, ${toAdd}`);
        } else if (languagesPattern.test(result)) {
            result = result.replace(languagesPattern, `$1, ${toAdd}`);
        }
    }

    // 2. Add a helpful comment block at the top
    const commentBlock = [
        `% ===== JAI LOCAL OPTIMIZER (offline mode) =====`,
        `% Top JD Keywords: ${keywords.slice(0, 15).join(", ")}`,
        `% Missing Skills (consider adding): ${missingSkills.slice(0, 8).join(", ") || "None detected"}`,
        `% Tip: For full AI-powered rewriting, configure a Gemini or OpenRouter API key.`,
        `% ================================================`,
        ``,
    ].join("\n");

    result = commentBlock + result;

    return result;
}

// Export for use in background.js (service worker uses importScripts)
if (typeof globalThis !== "undefined") {
    globalThis.optimizeLatexLocally = optimizeLatexLocally;
}
