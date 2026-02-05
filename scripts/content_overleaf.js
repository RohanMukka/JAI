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
    // 1. Copy to Clipboard immediately as backup
    navigator.clipboard.writeText(latexCode).then(() => {
        showStatus("JAI: Copied to Clipboard! (Just in case)", "#333");
    });

    // Wait for Editor
    let attempts = 0;
    const interval = setInterval(() => {
        attempts++;
        const aceEditor = document.querySelector('.ace_editor');
        const cmEditor = document.querySelector('.cm-content');
        
        if (aceEditor || cmEditor) {
            clearInterval(interval);
            showStatus("JAI: Attempting Auto-Paste...", "#2196f3");
            
            // Clear storage
            chrome.storage.local.remove('generatedLatex');
            
            // Focus the editor
            if (cmEditor) {
                cmEditor.focus();
                // Select All (Ctrl+A simulation is hard, let's just Select All range)
                document.execCommand('selectAll', false, null);
            } else {
                aceEditor.focus();
            }

                (function() {
                    const latex = ${JSON.stringify(latexCode)};
                    
                    try {
                        const cmContent = document.querySelector('.cm-content');
                        const aceEditor = document.querySelector('.ace_editor');

                        if (cmContent) {
                            console.log("JAI: Focusing CodeMirror...");
                            cmContent.focus();
                            
                            // Method 1: Select All & Insert Text (Browser Native)
                            // This usually forces the editor to handle the input event
                            document.execCommand('selectAll', false, null);
                            document.execCommand('delete', false, null);
                            const success = document.execCommand('insertText', false, latex);
                            
                            console.log("JAI: insertText success?", success);
                            
                            if (!success || cmContent.innerText.length < 50) {
                                // Method 2: Force Paste Event
                                const dt = new DataTransfer();
                                dt.setData('text/plain', latex);
                                const pasteEvt = new ClipboardEvent('paste', {
                                    bubbles: true, cancelable: true, clipboardData: dt
                                });
                                cmContent.dispatchEvent(pasteEvt);
                            }
                        } 
                        else if (window.ace && aceEditor) {
                             const editor = ace.edit(aceEditor);
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
                // Heuristic: Check if editor looks empty or length matches
                // It's hard to read back from CM safely. 
                // Let's just ask the user to verify visually, or Recompile.
                
                showStatus("JAI: Compiled! If empty, CLICK HERE + Ctrl+V", "#ff9800"); // Orange warning
                
                // Add click listener to banner to help paste
                statusBanner.onclick = () => {
                     navigator.clipboard.writeText(latexCode);
                     showStatus("JAI: Copied! Press Ctrl+V in editor now.", "#f44336");
                };

                // Compile
                const recompileBtn = document.querySelector('.recompile-button') || document.querySelector('[aria-label="Recompile"]');
                if(recompileBtn) recompileBtn.click();
                
                // Wait for Download
                setTimeout(() => {
                     // Check if PDF is downloading. 
                     // Only download if we think it worked? Hard to know.
                     // Let's try downloading anyway.
                     showStatus("JAI: Downloading... (Check PDF content)", "#4caf50");
                     checkForDownload();
                }, 4000);
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
