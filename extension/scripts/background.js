// background.js
try {
    importScripts('config.js');
} catch (e) {
    console.error("JAI: Failed to load config.js. Make sure it exists!", e);
}

// Side Panel Logic
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generate_and_automate') {
    handleAutomation(request.jdText, sendResponse);
    return true; // Keep channel open
  }
});

async function handleAutomation(jdText, sendResponse) {
  try {
    const data = await chrome.storage.local.get(['resumeContent']);
    
    // Load API Keys from config.js
    const keys = (typeof JAI_CONFIG !== 'undefined' && JAI_CONFIG.API_KEYS) ? JAI_CONFIG.API_KEYS : [];

    if (keys.length === 0 || keys[0] === "YOUR_API_KEY_1") {
        console.warn("JAI: No API keys found in config.js. Please populate extension/scripts/config.js");
    }
    
    // Call Gemini with Key Rotation (Pass the whole array)
    const latex = await callOpenAI(keys, data.resumeContent, jdText);
    
    // Save LaTeX for the Content Script to pick up
    await chrome.storage.local.set({ generatedLatex: latex });
    
    // Open Overleaf (New Project Page)
    // Using simple /project url, assuming user is logged in.
    // The content script will handle the "New Project" click if possible, or just expect the user to be in the editor.
    // User requested "directly ask overleaf". 
    // Best automated path: Open a NEW project link if one exists, or the main dashboard.
    // Let's stick to opening the project dashboard. 
    // Wait, if we want to "download directly", we need to be in an editor.
    // A reliable way is to CREATE a project.
    // Since we don't have the Overleaf API, we rely on the user having a project or creating one quickly.
    // BUT, we can use the "Docs" hack: https://www.overleaf.com/docs?snip_uri=...
    // This creates a temporary project from a snippet.
    // However, the resume code is huge. URL limits might block it.
    
    // Let's open the main page. The content script will look for "New Project" button? 
    // That's risky.
    // Let's assume the user is logged in.
    // We open https://www.overleaf.com/project
    
    chrome.tabs.create({ url: 'https://www.overleaf.com/project' }, (tab) => {
        // We can listen for the tab to load in the content script.
    });

    sendResponse({ success: true });
    
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function callOpenAI(apiKeys, resume, jd) {
    // Ensure keys is always an array
    const keys = Array.isArray(apiKeys) ? apiKeys : [apiKeys];
    // Renaming internally to generic call, but implementing for Gemini
    const systemInstruction = `
      You are an expert ATS Resume Optimizer and LaTeX Generator.
      
      CRITICAL INSTRUCTIONS (THE 10 COMMANDMENTS):
      1. DO NOT CHANGE THE LAYOUT: Use the provided Base Resume LaTeX code exact structure, spacing, macros.
      2. COMMAND STRUCTURE:
         - \resumeSubheading{Title}{Location}{Role}{Date} (4 arguments)
         - \resumeProjectHeading{Title | Tech Stack | Links}{} (2 arguments)
         - NEVER use '&' inside these arguments. Use '$|$'.
      3. LIST MACROS (CRITICAL):
         - ALWAYS start lists with \resumeItemListStart
         - ALWAYS end lists with \resumeItemListEnd (NEVER use \end{itemize})
      4. SANITY CHECK (CRITICAL):
         - In Extracurriculars, NEVER write "\item \small{\item ...}".
         - Correct: "\item \small{...}"
      5. REWRITE SKILLS:
         - Add ANY technical skill from the JD (e.g., PyTorch, AWS, Pandas) into "Languages" or "Frameworks".
         - In "Concepts", list ONLY the top 5-6 most relevant concepts for the job.
      6. DYNAMIC TITLES:
         - Rewrite Experience Role to match JD (e.g., "Software Engineer Intern").
      7. STRICT SINGLE-LINE BULLETS:
         - Projects & Extracurriculars items must be SINGLE LINE.
         - APPEND command "\\vspace{-3pt}" (backslashed) to the end of every item.
         - Example: \resumeItem{Built X using Y.}\vspace{-3pt}
      8. STRICT 1-PAGE LIMIT: Do not increase whitespace.
      9. NO VISUAL CHANGES: Do not add \hrule or change colors.
      10. Every sentence should be human written and should not sound like it is AI generated.
      11. Once check all the above instructions and make sure the resume is ATS friendly and also good for humans to read.
      12. use the same vspace as the base resume.
    Your job is to MODIFY CONTENT ONLY, not layout structure.

You must strictly preserve:
- The existing LaTeX document class, packages, commands, and macros
- All custom commands such as \resumeProjectHeading, \resumeItem, \resumeSubheading
- Section order and formatting
- Spacing commands unless explicitly told to change them

Your goals are:
1. Ensure the resume fits on EXACTLY one page (letterpaper).
2. Fix any misaligned or poorly grouped project entries.
3. Improve clarity and alignment WITHOUT adding new sections.
4. Maintain a strong software engineering focus.

DO NOT add filler text.
DO NOT invent experience.
DO NOT remove metrics unless necessary to fit one page.
DO NOT change font size, margins, or document class.
    `;

    const prompt = `
      CANDIDATE PROJECTS PORTFOLIO (SELECT 3 FROM HERE):
      [... Same Portfolio as before, abbreviated here for clarity but full in code ...]
      1. BEneFIT (Decentralized Fitness): Tech: Solidity, Ethereum, React, Node.js. Accountability app with staking. Best for: Blockchain, Full-stack, Security.
      2. IPMS (Internship Management): Tech: React, Node, MongoDB. Workflow automation, approvals, dashboards. Best for: Full-stack, Enterprise, APIs.
      3. Hospital Database (Patient Network): Tech: Java, JDBC, SQL. Relational DB design, complex queries. Best for: Backend, SQL, Database roles.
      4. Diagnostic System (ML + Knowledge): Tech: Python, SWRL, Protégé. Hybrid AI (Rules + ML). Best for: AI/ML, Research.
      5. SpendSmart (Expense Tracker): Tech: TypeScript, React. Finance app, responsive UI. Best for: Frontend, Product, React.
      6. Portfolio Website: Tech: Next.js, TS. Deployment, UI/UX. Best for: Frontend, Web.
      7. EEG Emotion Recognition: Tech: Python, ML, Signal Processing. Multiclass classification. Best for: Data Science, ML Research.
      8. Multilingual Polarization Detection: Tech: Python, NLP. Text processing pipelines. Best for: NLP, AI.
      9. FitPrep: Tech: JS, HTML, CSS. Fitness web app. Best for: General Web.
      10. FeeAutomation: Tech: JS. Business automation. Best for: Scripts, Automation.

      JOB DESCRIPTION:
      ${jd.substring(0, 8000)}
      
      BASE RESUME LATEX:
      ${resume.substring(0, 15000)}
      
      TASK:
      Rewrite the Base Resume to match the Job Description perfectly, following the 10 COMMANDMENTS.
      - IMPORTANT: Do NOT use '&' in \resumeProjectHeading. Use '$|$'.
      - Ensure \resumeProjectHeading has exactly 2 sets of braces: {Content}{Date}.
    `;

    // State for Cancellation
    let processAborted = false;

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'cancel_automation') {
            processAborted = true;
            console.log("JAI: Process Cancelled by User");
             chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                if (tabs[0]) {
                    chrome.scripting.executeScript({
                        target: {tabId: tabs[0].id},
                        func: () => { 
                            const b = document.getElementById('jai-status-banner'); 
                            if(b) b.remove();
                            alert("Process Cancelled.");
                        }
                    });
                }
            });
        }
    });

    function updateStatusBanner(message, type = 'info') {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) {
                chrome.scripting.executeScript({
                    target: {tabId: tabs[0].id},
                    func: (msg, type) => {
                        let banner = document.getElementById('jai-status-banner');
                        if (!banner) {
                            banner = document.createElement('div');
                            banner.id = 'jai-status-banner';
                            banner.style.cssText = `
                                position: fixed; top: 0; left: 0; width: 100%; height: auto;
                                padding: 12px 0; text-align: center; font-family: 'Segoe UI', sans-serif; 
                                font-weight: 500; font-size: 14px; color: white;
                                z-index: 2147483647; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                                display: flex; justify-content: center; align-items: center; gap: 15px;
                            `;
                            banner.dataset.state = 'expanded';
                            
                            const content = document.createElement('span');
                            content.id = 'jai-banner-text';
                            banner.appendChild(content);
                            
                            // Cancel Btn
                            const cancelBtn = document.createElement('button');
                            cancelBtn.innerText = "Cancel";
                            cancelBtn.style.cssText = "background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.5); color: white; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;";
                            cancelBtn.onclick = () => { chrome.runtime.sendMessage({action: 'cancel_automation'}); };
                            banner.appendChild(cancelBtn);

                            // Min Btn
                            const minBtn = document.createElement('button');
                            minBtn.innerText = "Minimize _";
                            minBtn.style.cssText = "background: transparent; border: none; color: white; cursor: pointer; font-size: 12px; text-decoration: underline;";
                            minBtn.onclick = () => {
                                if (banner.dataset.state === 'expanded') {
                                    banner.style.width = '40px'; banner.style.height = '40px'; banner.style.borderRadius = '50%'; banner.style.overflow = 'hidden'; banner.style.top = '20px'; banner.style.left = '20px'; banner.style.padding = '0'; content.style.display = 'none'; cancelBtn.style.display = 'none'; minBtn.innerText = "□"; banner.dataset.state = 'minimized';
                                } else {
                                    banner.style.width = '100%'; banner.style.height = 'auto'; banner.style.borderRadius = '0'; banner.style.top = '0'; banner.style.left = '0'; banner.style.padding = '12px 0'; content.style.display = 'inline'; cancelBtn.style.display = 'inline-block'; minBtn.innerText = "Minimize _"; banner.dataset.state = 'expanded';
                                }
                            };
                            banner.appendChild(minBtn);
                            document.body.prepend(banner);
                        }
                        
                        document.getElementById('jai-banner-text').textContent = `JAI: ${msg}`;
                        
                        const colors = { 'info': '#2196f3', 'warning': '#ff9800', 'error': '#f44336', 'success': '#4caf50' };
                        banner.style.background = colors[type] || colors['info'];
                        
                        if (type === 'success') { setTimeout(() => { const b = document.getElementById('jai-status-banner'); if(b) b.remove(); }, 5000); }
                    },
                    args: [message, type]
                });
            }
        });
    }

    async function fetchWithRotation(retries = 3, keyIndex = 0) {
        // Status Updates
        if (keyIndex > 0) {
            updateStatusBanner(`Using Key ${keyIndex+1} (Backup)...`, 'info');
        } else if(retries === 3 && keyIndex === 0) { 
            processAborted = false; 
            updateStatusBanner("Optimizing Resume via Gemini...", 'info'); 
        }

        if(processAborted) return null;

        const currentKey = keys[keyIndex];
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${currentKey}`;

        try {
            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: systemInstruction + "\n\n" + prompt }] }],
                generationConfig: { maxOutputTokens: 8192, temperature: 0.2 }
              })
            });

            const result = await response.json();
            
            if(processAborted) return null;

            if (result.error) {
                // Check if it's a Quota/Rate Limit error (429)
                if (result.error.code === 429 || result.error.message.toLowerCase().includes('quota')) {
                    console.warn(`JAI: Key ${keyIndex+1} Limit Hit.`);
                    
                    if (keyIndex < keys.length - 1) {
                         const nextKey = keyIndex + 1;
                         updateStatusBanner(`Quota Hit on Key ${keyIndex+1}. Switching to Key ${nextKey+1}...`, 'warning');
                         await new Promise(r => setTimeout(r, 1500)); // Short visibility pause
                         return fetchWithRotation(retries, nextKey);
                    }
                    
                    // IF NO MORE KEYS, WAIT (Patient Mode)
                    if (retries > 0) {
                        const waitSec = 25;
                        // COUNTDOWN
                        for(let i = waitSec; i > 0; i--) {
                            if(processAborted) return null;
                            updateStatusBanner(`All Keys Exhausted. Waiting ${i}s for reset...`, 'warning');
                            await new Promise(r => setTimeout(r, 1000));
                        }
                        
                        if(processAborted) return null;
                        updateStatusBanner(`Retrying with Key 1...`, 'info');
                        return fetchWithRotation(retries - 1, 0); // Restart with Key 0
                    }
                }
                updateStatusBanner(`Error: ${result.error.message}`, 'error');
                throw new Error(result.error.message);
            }
            
            updateStatusBanner("Success! Opening Overleaf...", 'success');
            return result;

        } catch (err) {
            if(!processAborted) updateStatusBanner(`Network Error: ${err.message}`, 'error');
            throw err;
        }
    }

    const result = await fetchWithRotation();
    
    // Extract text from Gemini response structure
    let text = result.candidates[0].content.parts[0].text;
    
    // Cleanup Markdown
    text = text.replace(/```latex/gi, '').replace(/```/g, '').trim();

    // INTEGRITY CHECK
    if (!text.includes('\\end{document}')) {
        console.warn("JAI: Generated code seems truncated. Appending \\end{document}");
        text += '\n\\end{document}';
    }

    // FAILSAFE: Copy to clipboard using the current active tab (JD) before navigating away
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if(tabs[0]) {
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                func: (code) => {
                    navigator.clipboard.writeText(code).catch(e => console.error(e));
                },
                args: [text]
            });
        }
    });

    return text;
}
