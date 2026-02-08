const JAI_WEB_URL = "http://localhost:3000";

document.addEventListener('DOMContentLoaded', async () => {
    // Check local storage for token
    const { authToken } = await chrome.storage.local.get(['authToken']);
    
    if (authToken) {
        showMainUI();
    } else {
        // Auto-check on load, but don't show login UI yet to avoid flash? 
        // Actually, just show login UI for now, let auto-check happen.
        showLoginUI();
        checkWebSession(); 
    }
});

function showMainUI() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('mainSection').classList.remove('hidden');
    // Update header status
    document.getElementById('connectionStatus').style.opacity = '1';
}

function showLoginUI() {
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('mainSection').classList.add('hidden');
    document.getElementById('connectionStatus').style.opacity = '0.3';
}

async function checkWebSession() {
    console.log("JAI: Checking session...");
    const domainsToCheck = ['localhost', '127.0.0.1'];
    
    for (const domain of domainsToCheck) {
        try {
            const cookies = await chrome.cookies.getAll({ domain });
            for (const cookie of cookies) {
                // Check for common auth cookies
                if (cookie.name.includes('next-auth.session-token') || cookie.name.includes('JaiAuth')) {
                    console.log(`JAI: Found token in cookie: ${cookie.name}`);
                    await chrome.storage.local.set({ authToken: "cookie-session" });
                    showMainUI();
                    return;
                }
            }
        } catch (e) {
            console.error(`JAI: Error checking ${domain}`, e);
        }
    }
    console.log("JAI: No session found.");
}

// Event Listeners
document.getElementById('loginBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: `${JAI_WEB_URL}/login` });
});

document.getElementById('checkCxnBtn').addEventListener('click', () => {
    checkWebSession();
});

// Manual Fallback Toggle
document.getElementById('manualLink').addEventListener('click', () => {
    const container = document.getElementById('manualInput');
    container.style.display = (container.style.display === 'block') ? 'none' : 'block';
});

// Manual Save
document.getElementById('saveTokenBtn').addEventListener('click', async () => {
    const token = document.getElementById('tokenInput').value.trim();
    if (token) {
        await chrome.storage.local.set({ authToken: "manual-" + token });
        showMainUI();
    }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await chrome.storage.local.remove(['authToken']);
    showLoginUI();
});

document.getElementById('statsLink').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});

// Main Action Button Logic
document.getElementById('automateBtn').addEventListener('click', async () => {
    const statusEl = document.getElementById('status');
    const btn = document.getElementById('automateBtn');
    
    // Check settings
    const settings = await chrome.storage.local.get(['resumeContent']);
    if (!settings.resumeContent) {
         statusEl.textContent = 'Please configure Resume in Settings first!';
         statusEl.style.color = 'var(--error-color)';
         setTimeout(() => chrome.runtime.openOptionsPage(), 1500);
         return;
    }

    btn.disabled = true;
    btn.innerHTML = 'Extracting...';
    statusEl.textContent = 'Analyzing Page...';

    // 1. Get JD
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['scripts/content_jd.js']
        });

        if (!results || !results[0] || !results[0].result) {
            throw new Error("Could not read page content");
        }

        const jdText = results[0].result;
        statusEl.textContent = 'Generating Optimization...';
        btn.innerHTML = 'Optimizing...';

        // 2. Send to Background
        chrome.runtime.sendMessage({ action: 'generate_and_automate', jdText: jdText }, (response) => {
            if (response && response.success) {
                statusEl.textContent = 'Opening Overleaf...';
                setTimeout(() => {
                    statusEl.textContent = 'Done! Check new tab.';
                    btn.disabled = false;
                    btn.innerHTML = 'Generate & Download PDF';
                }, 1000);
            } else {
                statusEl.textContent = 'Error: ' + (response ? response.error : 'Unknown');
                btn.disabled = false;
                btn.innerHTML = 'Try Again';
            }
        });

    } catch (e) {
        statusEl.textContent = 'Error: ' + e.message;
        btn.disabled = false;
        btn.innerHTML = 'Try Again';
    }
});

// Autofill Button Logic
document.getElementById('autofillBtn').addEventListener('click', async () => {
    const statusEl = document.getElementById('status');
    const btn = document.getElementById('autofillBtn');
    
    // Check Auth
    const { authToken } = await chrome.storage.local.get(['authToken']);
    if (!authToken) {
         statusEl.textContent = 'Please Login first!';
         statusEl.style.color = 'red';
         return;
    }

    btn.disabled = true;
    btn.innerHTML = 'Filling...';
    statusEl.textContent = 'Fetching Profile...';

    try {
        // 1. Fetch Profile
        console.log("JAI: Fetching profile from", `${JAI_WEB_URL}/api/profile`);
        const response = await fetch(`${JAI_WEB_URL}/api/profile`);
        if (!response.ok) throw new Error("Failed to fetch profile. " + response.statusText);
        
        const profile = await response.json();
        console.log("JAI: Profile fetched successfully:", profile);
        
        statusEl.textContent = 'Injecting Script...';

        // 2. Inject & Fill
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log("JAI: Injecting content script into tab:", tab.id);
        
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['scripts/content_autofill.js']
        });
        
        chrome.tabs.sendMessage(tab.id, { action: "autofill_profile", profile: profile }, (response) => {
            statusEl.textContent = 'Done!';
            btn.innerHTML = 'Autofill Application';
            btn.disabled = false;
        });

    } catch (e) {
        console.error(e);
        statusEl.textContent = 'Error: ' + e.message;
        btn.disabled = false;
        btn.innerHTML = 'Try Again';
    }
});
