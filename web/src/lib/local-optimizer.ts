/**
 * Local Resume Optimizer — Zero-API fallback using NLP techniques.
 *
 * When all cloud providers (Gemini, OpenRouter) are unavailable, this module
 * optimizes a resume against a job description using:
 *   1. TF-IDF keyword extraction from the JD
 *   2. Skill gap detection (JD skills missing from resume)
 *   3. Bullet-point enhancement with JD-relevant action verbs
 *   4. Section reordering based on JD relevance scoring
 *
 * No external API calls. Runs entirely on the server in < 100ms.
 */

// ─── Skill Taxonomy ──────────────────────────────────────────────────────────

const TECH_SKILLS: Record<string, string[]> = {
    languages: [
        "python", "javascript", "typescript", "java", "c++", "c#", "go", "golang",
        "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "sql",
        "html", "css", "bash", "shell", "perl", "lua", "dart", "elixir", "haskell",
    ],
    frameworks: [
        "react", "next.js", "nextjs", "angular", "vue", "vue.js", "svelte",
        "express", "fastapi", "flask", "django", "spring", "spring boot",
        "node.js", "nodejs", ".net", "rails", "ruby on rails", "laravel",
        "tailwind", "bootstrap", "material ui", "chakra", "remix",
    ],
    ml_ai: [
        "tensorflow", "pytorch", "keras", "scikit-learn", "sklearn", "xgboost",
        "lightgbm", "hugging face", "transformers", "langchain", "llamaindex",
        "openai", "gpt", "llm", "nlp", "computer vision", "deep learning",
        "machine learning", "neural network", "reinforcement learning", "rag",
        "fine-tuning", "mlflow", "mlops", "feature engineering", "model serving",
        "onnx", "spacy", "nltk", "pandas", "numpy", "scipy", "matplotlib",
    ],
    cloud_infra: [
        "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
        "terraform", "ansible", "jenkins", "ci/cd", "github actions",
        "cloudformation", "lambda", "ec2", "s3", "sagemaker", "databricks",
        "airflow", "kafka", "redis", "rabbitmq", "elasticsearch", "nginx",
    ],
    databases: [
        "postgresql", "postgres", "mysql", "mongodb", "redis", "dynamodb",
        "cassandra", "neo4j", "sqlite", "supabase", "firebase", "prisma",
        "sequelize", "typeorm", "mongoose",
    ],
    tools: [
        "git", "linux", "jira", "confluence", "figma", "postman", "swagger",
        "graphql", "rest", "grpc", "websocket", "oauth", "jwt", "agile", "scrum",
    ],
};

const ALL_SKILLS = Object.values(TECH_SKILLS).flat();

// Strong action verbs categorized by impact
const ACTION_VERBS: Record<string, string[]> = {
    building: ["Architected", "Built", "Developed", "Engineered", "Implemented", "Designed"],
    improving: ["Optimized", "Accelerated", "Enhanced", "Streamlined", "Reduced", "Improved"],
    leading: ["Led", "Spearheaded", "Orchestrated", "Drove", "Directed", "Managed"],
    analyzing: ["Analyzed", "Evaluated", "Identified", "Diagnosed", "Assessed", "Measured"],
    delivering: ["Delivered", "Deployed", "Shipped", "Launched", "Released", "Published"],
};

// ─── Text Processing ─────────────────────────────────────────────────────────

function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s.#+\-/]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length > 1);
}

function extractNgrams(tokens: string[], n: number): string[] {
    const ngrams: string[] = [];
    for (let i = 0; i <= tokens.length - n; i++) {
        ngrams.push(tokens.slice(i, i + n).join(" "));
    }
    return ngrams;
}

/**
 * TF-IDF-style keyword extraction: find terms that are frequent in the JD
 * but less common generally (approximated by term length and casing signals).
 */
function extractKeywords(text: string, topK: number = 30): string[] {
    const tokens = tokenize(text);
    const unigrams = tokens;
    const bigrams = extractNgrams(tokens, 2);
    const trigrams = extractNgrams(tokens, 3);

    // Term frequency
    const tf = new Map<string, number>();
    for (const t of [...unigrams, ...bigrams, ...trigrams]) {
        tf.set(t, (tf.get(t) || 0) + 1);
    }

    // Stop words (common English)
    const stopWords = new Set([
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
        "has", "have", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "can", "this", "that", "these", "those",
        "it", "its", "we", "our", "you", "your", "they", "their", "he", "she",
        "his", "her", "not", "no", "if", "as", "so", "up", "out", "about",
        "who", "which", "when", "where", "how", "what", "all", "each", "every",
        "both", "few", "more", "most", "other", "some", "such", "than", "too",
        "very", "just", "also", "into", "over", "after", "before", "between",
        "through", "during", "while", "any", "work", "working", "experience",
        "ability", "strong", "including", "required", "preferred", "etc",
        "must", "team", "role", "position", "company", "job", "looking",
    ]);

    // Score terms: frequency * (is it a known skill? bonus)
    const scored: [string, number][] = [];
    for (const [term, freq] of tf.entries()) {
        if (stopWords.has(term)) continue;
        if (term.length < 2) continue;

        let score = freq;
        // Boost known tech skills significantly
        if (ALL_SKILLS.includes(term)) score *= 5;
        // Boost multi-word terms (more specific)
        if (term.includes(" ")) score *= 1.5;

        scored.push([term, score]);
    }

    scored.sort((a, b) => b[1] - a[1]);
    return scored.slice(0, topK).map(([term]) => term);
}

/**
 * Find skills mentioned in JD but missing from resume.
 */
function findSkillGaps(jdText: string, resumeText: string): { category: string; skills: string[] }[] {
    const jdLower = jdText.toLowerCase();
    const resumeLower = resumeText.toLowerCase();
    const gaps: { category: string; skills: string[] }[] = [];

    for (const [category, skills] of Object.entries(TECH_SKILLS)) {
        const missing = skills.filter(
            (skill) => jdLower.includes(skill) && !resumeLower.includes(skill)
        );
        if (missing.length > 0) {
            gaps.push({ category, skills: missing });
        }
    }

    return gaps;
}

/**
 * Compute a relevance score for a text block against JD keywords.
 */
function relevanceScore(text: string, keywords: string[]): number {
    const lower = text.toLowerCase();
    let score = 0;
    for (const kw of keywords) {
        if (lower.includes(kw)) score++;
    }
    return score;
}

// ─── Resume Section Parser ───────────────────────────────────────────────────

interface ResumeSection {
    heading: string;
    content: string;
    originalIndex: number;
}

function parseMarkdownSections(resumeText: string): ResumeSection[] {
    const lines = resumeText.split("\n");
    const sections: ResumeSection[] = [];
    let currentHeading = "Header";
    let currentContent: string[] = [];
    let idx = 0;

    for (const line of lines) {
        // Detect markdown headings (## or ###)
        const headingMatch = line.match(/^#{1,3}\s+(.+)/);
        if (headingMatch) {
            if (currentContent.length > 0 || currentHeading === "Header") {
                sections.push({
                    heading: currentHeading,
                    content: currentContent.join("\n"),
                    originalIndex: idx++,
                });
            }
            currentHeading = headingMatch[1].trim();
            currentContent = [];
        } else {
            currentContent.push(line);
        }
    }
    // Don't forget the last section
    sections.push({
        heading: currentHeading,
        content: currentContent.join("\n"),
        originalIndex: idx,
    });

    return sections;
}

// ─── Bullet Enhancement ──────────────────────────────────────────────────────

function enhanceBullet(bullet: string, jdKeywords: string[]): string {
    let enhanced = bullet.trim();
    if (!enhanced) return enhanced;

    // Skip if it's not actually a bullet point
    if (!enhanced.startsWith("-") && !enhanced.startsWith("*") && !enhanced.startsWith("•")) {
        return enhanced;
    }

    const prefix = enhanced.charAt(0);
    let text = enhanced.slice(1).trim();

    // 1. Strengthen weak opening verbs
    const weakVerbs = [
        "worked on", "helped with", "assisted in", "was responsible for",
        "tasked with", "involved in", "participated in",
    ];
    for (const weak of weakVerbs) {
        if (text.toLowerCase().startsWith(weak)) {
            // Pick a strong verb based on content
            const verbCategory = text.toLowerCase().includes("lead") || text.toLowerCase().includes("team")
                ? "leading"
                : text.toLowerCase().includes("analyz") || text.toLowerCase().includes("data")
                ? "analyzing"
                : text.toLowerCase().includes("deploy") || text.toLowerCase().includes("ship")
                ? "delivering"
                : text.toLowerCase().includes("improv") || text.toLowerCase().includes("optim")
                ? "improving"
                : "building";

            const verbs = ACTION_VERBS[verbCategory];
            const verb = verbs[Math.floor(Math.random() * verbs.length)];
            text = verb + " " + text.slice(weak.length).trim();
            break;
        }
    }

    // 2. Inject JD-relevant keywords if they're contextually appropriate
    const textLower = text.toLowerCase();
    const relevantMissing = jdKeywords
        .filter((kw) => ALL_SKILLS.includes(kw) && !textLower.includes(kw))
        .slice(0, 2);

    // Only add skills if the bullet is about technical work
    const technicalIndicators = [
        "built", "developed", "implemented", "designed", "created", "using",
        "integrated", "deployed", "architected", "engineered", "utilized",
    ];
    const isTechnical = technicalIndicators.some((t) => textLower.includes(t));

    if (isTechnical && relevantMissing.length > 0 && !text.includes("using")) {
        // Append "utilizing X and Y" if the bullet doesn't already mention tools
        text = text.replace(/\.$/, "") + `, utilizing ${relevantMissing.join(" and ")}`;
        if (!text.endsWith(".")) text += ".";
    }

    return `${prefix} ${text}`;
}

// ─── Main Optimizer ──────────────────────────────────────────────────────────

export interface LocalOptimizerResult {
    optimizedResume: string;
    analysis: {
        topKeywords: string[];
        skillGaps: { category: string; skills: string[] }[];
        relevanceScores: { section: string; score: number }[];
        suggestedSkillsToAdd: string[];
    };
}

/**
 * Optimize a resume against a job description using local NLP.
 * No external API calls — runs in < 100ms.
 */
export function optimizeResumeLocally(
    jobDescription: string,
    resumeText: string
): LocalOptimizerResult {
    // 1. Extract keywords from JD
    const jdKeywords = extractKeywords(jobDescription, 40);

    // 2. Find skill gaps
    const skillGaps = findSkillGaps(jobDescription, resumeText);
    const suggestedSkillsToAdd = skillGaps.flatMap((g) => g.skills).slice(0, 10);

    // 3. Parse resume into sections
    const sections = parseMarkdownSections(resumeText);

    // 4. Score each section's relevance to JD
    const scoredSections = sections.map((s) => ({
        ...s,
        score: relevanceScore(s.content, jdKeywords),
    }));

    // 5. Reorder sections: Header stays first, then by relevance (descending)
    const header = scoredSections.find((s) => s.heading === "Header");
    const rest = scoredSections
        .filter((s) => s.heading !== "Header")
        .sort((a, b) => b.score - a.score);

    // 6. Enhance bullet points in each section
    const optimizedSections = (header ? [header, ...rest] : rest).map((section) => {
        const lines = section.content.split("\n");
        const enhancedLines = lines.map((line) => {
            if (line.trim().startsWith("-") || line.trim().startsWith("*") || line.trim().startsWith("•")) {
                return enhanceBullet(line, jdKeywords);
            }
            return line;
        });

        return {
            heading: section.heading,
            content: enhancedLines.join("\n"),
            score: section.score,
        };
    });

    // 7. Build the skills suggestion block
    let skillsSuggestion = "";
    if (suggestedSkillsToAdd.length > 0) {
        skillsSuggestion = `\n\n---\n**Skills to Consider Adding** (found in JD but missing from resume):\n${suggestedSkillsToAdd.map((s) => `- ${s}`).join("\n")}\n---\n`;
    }

    // 8. Reassemble the resume
    const optimizedResume = optimizedSections
        .map((s) => {
            if (s.heading === "Header") return s.content;
            return `## ${s.heading}\n${s.content}`;
        })
        .join("\n\n")
        + skillsSuggestion;

    return {
        optimizedResume,
        analysis: {
            topKeywords: jdKeywords.slice(0, 15),
            skillGaps,
            relevanceScores: optimizedSections.map((s) => ({
                section: s.heading,
                score: s.score,
            })),
            suggestedSkillsToAdd,
        },
    };
}
