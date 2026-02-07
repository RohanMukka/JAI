// content_overleaf.js
console.log("JAI: Overleaf Script Active");

// Create a Status Banner
const statusBanner = document.createElement('div');
Object.assign(statusBanner.style, {
    position: 'fixed', top: '10px', right: '10px', zIndex: '9999',
    padding: '10px 20px', backgroundColor: '#333', color: '#fff',
    borderRadius: '5px', fontSize: '14px', fontFamily: 'sans-serif',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)', display: 'none'
});
document.body.appendChild(statusBanner);

function showStatus(msg, color='#333') {
    statusBanner.textContent = msg;
    statusBanner.style.backgroundColor = color;
    statusBanner.style.display = 'block';
}

chrome.storage.local.get(['generatedLatex'], (items) => {
  if (items.generatedLatex) {
    const url = window.location.href;
    
    // CASE 1: Dashboard (https://www.overleaf.com/project)
    if (url.match(/overleaf\.com\/project$/) || url.match(/overleaf\.com\/project\?/) || url === 'https://www.overleaf.com/') {
        showStatus("JAI: Creating new project...", "#007bff");
        
        // Attempt to find "New Project" button
        setTimeout(() => {
            const btns = Array.from(document.querySelectorAll('button, a'));
            const newProjBtn = btns.find(b => b.textContent.includes('New Project'));
            
            if (newProjBtn) {
                newProjBtn.click();
                showStatus("JAI: Select 'Blank Project'", "#007bff");
                
                // Wait for dropdown "Blank Project"
                setTimeout(() => {
                    const links = Array.from(document.querySelectorAll('a, button'));
                    const blankBtn = links.find(b => b.textContent.includes('Blank Project'));
                    if (blankBtn) {
                        blankBtn.click();
                        // This should navigate to /project/123...
                        // The script will re-run on the new page.
                    } else {
                        showStatus("JAI: Click 'Blank Project' manually!", "#f44336");
                    }
                }, 1000);
            } else {
                showStatus("JAI: Please manually create a New Blank Project.", "#f44336");
            }
        }, 1500);
        
    } 
    // CASE 2: Editor (https://www.overleaf.com/project/65a...)
    else if (url.includes('/project/')) {
        showStatus("JAI: Injecting Resume...", "#4caf50");
        injectAndDownload(items.generatedLatex);
    }
  }
});

function injectAndDownload(latexCode) {
    // 1. Copy to Clipboard immediately (Reliable Failsafe)
    // We do this in the content script context, which has the permission.
    navigator.clipboard.writeText(latexCode).then(() => {
        showStatus("JAI: Copied to Clipboard! (Just in case)", "#333");
    }).catch(err => {
        console.error("JAI: Clipboard Copy Failed", err);
        showStatus("JAI: Clipboard Copy Failed - Click Banner to Retry", "#f44336");
    });

    // Wait for Editor
    let attempts = 0;
    const interval = setInterval(() => {
        attempts++;
        const cmEditor = document.querySelector('.cm-content');     // New Overleaf
        const aceEditor = document.querySelector('.ace_editor');    // Old Overleaf
        
        if (cmEditor || aceEditor) {
            clearInterval(interval);
            showStatus("JAI: Editor found. Injecting...", "#2196f3");
            
            // Clear storage
            chrome.storage.local.remove('generatedLatex');
            
            // Focus the editor
            if (cmEditor) cmEditor.focus();
            else aceEditor.focus();

            // Inject via script tag to access page context
            const script = document.createElement('script');
            script.textContent = `
                (function() {
                    const latex = ${JSON.stringify(latexCode)};
                    
                    try {
                        const cmContent = document.querySelector('.cm-content');
                        const aceDiv = document.querySelector('.ace_editor');

                        if (cmContent) {
                            console.log("JAI: Focusing CodeMirror...");
                            cmContent.focus();
                            
                            // Method 1: Browser Native Insert (Best for CM6)
                            // Select All
                            document.execCommand('selectAll', false, null);
                            // Delete current content
                            document.execCommand('delete', false, null); 
                            // Insert new content
                            const success = document.execCommand('insertText', false, latex);
                            
                            if (!success) {
                                console.warn("JAI: execCommand failed, trying fallback.");
                                // Method 2: Fallback (Set Text - risky but needed)
                                cmContent.innerText = latex; 
                                cmContent.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        } 
                        else if (window.ace && aceDiv) {
                             const editor = ace.edit(aceDiv);
                             editor.setValue(latex);
                             editor.clearSelection();
                        }
                    } catch(e) { console.error("JAI Injection Error:", e); }
                })();
            `;
            document.body.appendChild(script);
            script.remove();
            
            // CHECK SUCCESS AND WAIT
            setTimeout(() => {
                showStatus("JAI: Compiled! If empty, CLICK HERE then Ctrl+V", "#ff9800"); // Orange warning
                
                // Add click listener to banner to help paste manually
                statusBanner.onclick = () => {
                     navigator.clipboard.writeText(latexCode);
                     showStatus("JAI: Re-Copied! Press Ctrl+V in editor now.", "#4caf50");
                     // Also try to focus editor again
                     const cm = document.querySelector('.cm-content');
                     if(cm) cm.focus();
                };

                // Compile
                const recompileBtn = document.querySelector('.recompile-button') || document.querySelector('[aria-label="Recompile"]');
                if(recompileBtn) recompileBtn.click();
                
                showStatus("JAI: Done! Review PDF manually.", "#4caf50");
                // Auto-download removed per user request.
            }, 1000);
            
        } else if (attempts > 30) {
            clearInterval(interval);
            showStatus("JAI: Editor not found. Is it loading?", "#f44336");
        }
    }, 500);
}

function checkForDownload() {
    // 1. Try generic "Download PDF" links
    const links = Array.from(document.querySelectorAll('a'));
    let pdfLink = links.find(a => a.href && a.href.includes('/output/output.pdf')); 
    
    // 2. Try the specific download button icon (often has tooltip or specific class)
    if (!pdfLink) {
        pdfLink = document.querySelector('[aria-label="Download PDF"]');
    }
    
    if (pdfLink) {
        showStatus("JAI: Downloading!", "#4caf50");
        pdfLink.click();
        setTimeout(() => { statusBanner.style.display = 'none'; }, 3000);
    } else {
        // Retry
        setTimeout(checkForDownload, 2000);
    }
}
