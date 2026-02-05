// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generate_and_automate') {
    handleAutomation(request.jdText, sendResponse);
    return true; // Keep channel open
  }
});

async function handleAutomation(jdText, sendResponse) {
  try {
    const data = await chrome.storage.local.get(['apiKey', 'resumeContent']);
    
    // Call OpenAI
    const latex = await callOpenAI(data.apiKey, data.resumeContent, jdText);
    
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

async function callOpenAI(apiKey, resume, jd) {
    // Renaming internally to generic call, but implementing for Gemini
    const systemInstruction = `
      You are an expert ATS Resume Optimizer and LaTeX Generator.
      
      STRICT RULES:
      1. DO NOT CHANGE THE LAYOUT. Use the provided Base Resume LaTeX code exact structure, spacing, sections, and macros.
      2. ATS IS THE TOP PRIORITY. Optimize for keyword density and repetition across sections. ATS > human reviewer.
      3. TAILOR THE RESUME FOR EVERY JOB. Use job-specific keywords and emphasis.
      4. EXACTLY 3 PROJECTS. Select the top 3 most relevant projects from the base resume.
      5. ADD ALL SKILLS FROM THE JD. Assume the candidate has them. No skill gatekeeping.
      6. EXPERIENCE TITLE MUST MATCH ROLE. (e.g., Software Engineer -> Software Engineer Intern).
      7. DATES MUST BE CORRECT. (Use the dates from the base resume, do not hallucinate).
      8. NO PATCH INSTRUCTIONS. Output the FULL updated LaTeX code.
      9. KEEP IT 1-PAGE AND DENSE. No whitespace expansion. No filler.
    `;

    const prompt = `
      JOB DESCRIPTION:
      ${jd.substring(0, 6000)}
      
      BASE RESUME LATEX CODE:
      ${resume.substring(0, 15000)}
      
      TASK:
      Rewrite the Base Resume LaTeX code to match the Job Description perfectly following the STRICT RULES above. 
      - Select best 3 projects.
      - Rewrite bullet points with JD keywords / action verbs.
      - Add JD skills to the Skills section.
      - Output ONLY the raw LaTeX code starting with \\documentclass.
    `;

    // Gemini API Call
    // Docs: https://ai.google.dev/models
    // Switching to gemini-flash-latest (Standard Free Tier Model)
    // "limit: 0" on other models means they are not enabled for free tier on this account.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemInstruction + "\n\n" + prompt
          }]
        }]
      })
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    // Extract text from Gemini response structure
    let text = result.candidates[0].content.parts[0].text;
    
    // Cleanup
    text = text.replace(/```latex/g, '').replace(/```/g, '').trim();

    // FAILSAFE: Copy to clipboard using the current active tab (JD) before navigating away
    // This runs in the context of the JD page which is active.
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
