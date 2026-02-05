document.getElementById('statsLink').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});

document.getElementById('automateBtn').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  const btn = document.getElementById('automateBtn');
  
  // Check settings first
  const settings = await chrome.storage.local.get(['apiKey', 'resumeContent']);
  if (!settings.apiKey || !settings.resumeContent) {
      statusEl.textContent = 'Please configure API Key and Resume in Settings first!';
      statusEl.style.color = 'red';
      setTimeout(() => chrome.runtime.openOptionsPage(), 1500);
      return;
  }

  btn.disabled = true;
  statusEl.textContent = '1. Extracting JD...';

  // 1. Get Active Tab & Extract JD
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['scripts/content_jd.js']
  }, (results) => {
    if (chrome.runtime.lastError || !results || !results[0]) {
      statusEl.textContent = 'Error: Could not read page.';
      btn.disabled = false;
      return;
    }

    const jdText = results[0].result;
    statusEl.textContent = '2. Generating LaTeX (LLM)...';

    // 2. Send to Background for LLM + Overleaf
    chrome.runtime.sendMessage({ action: 'generate_and_automate', jdText: jdText }, (response) => {
      if (response && response.success) {
        statusEl.textContent = '3. Opening Overleaf...';
        // The background script handles the tab opening.
        // We just update status here.
        setTimeout(() => {
            statusEl.textContent = 'Done! Check Overleaf tab.';
            btn.disabled = false;
        }, 1000);
      } else {
        statusEl.textContent = 'Error: ' + (response ? response.error : 'Unknown');
        btn.disabled = false;
      }
    });
  });
});
