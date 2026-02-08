const JAI_WEB_URL = "http://localhost:3000";

document.addEventListener('DOMContentLoaded', async () => {
    // Initial UI State
    document.getElementById('connectionStatus').textContent = 'Connecting...';
    
    // Check local storage for token
    const { authToken } = await chrome.storage.local.get(['authToken']);
    
    if (authToken) {
        console.log("JAI: Auth token found in storage.");
        showMainUI();
    } else {
        console.log("JAI: No token in storage, checking active session...");
        await checkWebSession(); 
    }
});

function showMainUI() {
    console.log("JAI: Switching to Main UI");
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('loginSection').style.display = 'none';
    
    document.getElementById('mainSection').classList.remove('hidden');
    document.getElementById('mainSection').style.display = 'block';
    
    document.getElementById('connectionStatus').textContent = 'Connected';
    document.getElementById('connectionStatus').style.opacity = '1';
    document.getElementById('connectionStatus').style.color = '#10B981'; // Green
}

function showLoginUI() {
    console.log("JAI: Switching to Login UI");
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('loginSection').style.display = 'block';
    
    document.getElementById('mainSection').classList.add('hidden');
    document.getElementById('mainSection').style.display = 'none';
    
    document.getElementById('connectionStatus').textContent = 'Not Connected';
    document.getElementById('connectionStatus').style.opacity = '0.5';
    document.getElementById('connectionStatus').style.color = '#9CA3AF';
}

async function checkWebSession(manual = false) {
    console.log("JAI: Checking session...", manual ? "(Manual)" : "(Auto)");
    const statusEl = document.getElementById('connectionStatus');
    statusEl.textContent = 'Connecting...';
    statusEl.style.color = '#F59E0B'; // Amber

    try {
        // Method 1: Direct API Call (Most Reliable)
        console.log("JAI: Fetching /api/auth/session...");
        const res = await fetch(`${JAI_WEB_URL}/api/auth/session`, { 
            credentials: 'include',
            cache: 'no-store'
        });
        
        if (res.ok) {
            const data = await res.json();
            if (data && (data.user || Object.keys(data).length > 0)) {
                console.log("JAI: Session verified via API!");
                await chrome.storage.local.set({ authToken: "verified-session" });
                showMainUI();
                if (manual) alert("Successfully connected to JAI!");
                return;
            }
        }
    } catch (e) {
        console.warn("JAI: API check failed.", e);
    }

    // Method 2: Cookie Scan (Fallback)
    console.log("JAI: Scanning cookies...");
    // Check both specific URLs and general domains
    const checks = [
        { url: 'http://localhost:3000' },
        { url: 'http://127.0.0.1:3000' },
        { domain: 'localhost' } 
    ];
    
    for (const check of checks) {
        try {
            const cookies = await chrome.cookies.getAll(check);
            for (const cookie of cookies) {
                if (cookie.name.includes('next-auth.session-token') || 
                    cookie.name.includes('JaiAuth') || 
                    cookie.name.includes('secure-next-auth')) {
                    
                    console.log(`JAI: Found token in cookie: ${cookie.name}`);
                    await chrome.storage.local.set({ authToken: "cookie-session" });
                    showMainUI();
                    if (manual) alert("Successfully connected via Cookies!");
                    return;
                }
            }
        } catch (e) { console.error(e); }
    }

    console.log("JAI: No session found.");
    showLoginUI();
    
    if (manual) {
        statusEl.textContent = 'Connection Failed';
        statusEl.style.color = '#EF4444'; // Red
        alert("Could not find a logged-in session on localhost:3000.\n\nPlease ensure you are logged into the JAI Dashboard in this browser.");
    }
}

// Event Listeners
document.getElementById('loginBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: `${JAI_WEB_URL}/login` });
});

document.getElementById('checkCxnBtn').addEventListener('click', () => {
    checkWebSession(true);
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
        const response = await fetch(`${JAI_WEB_URL}/api/profile`, { 
            cache: "no-store",
            credentials: 'include'
        });
        
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
            // Check for report
            if (response && response.report) {
                renderReport(response.report);
                statusEl.textContent = 'Done! Check report below.';
            } else {
                statusEl.textContent = 'Done!';
            }
            
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

function renderReport(report) {
    const list = document.getElementById('reportList');
    if (!list) return;
    
    list.innerHTML = '';
    list.classList.remove('hidden');

    if (!report || report.length === 0) {
        list.innerHTML = '<div style="padding:5px; text-align:center; color: var(--text-secondary);">No fields processed.</div>';
        return;
    }

    report.forEach(item => {
        const div = document.createElement('div');
        div.className = 'report-item';
        
        let icon = '';
        let statusClass = '';
        
        switch (item.status) {
            case 'filled': 
                icon = '\u2705'; // ✅
                statusClass = 'filled'; 
                break;
            case 'not_found': 
                icon = '\u274C'; // ❌
                statusClass = 'not_found'; 
                break;
            case 'error': 
                icon = '\u26A0\uFE0F'; // ⚠️
                statusClass = 'error'; 
                break;
            case 'empty_in_profile': 
                icon = '\u26AA'; // ⚪
                statusClass = 'empty_in_profile'; 
                break;
        }

        // Clean up field name for display
        const fieldName = item.field.charAt(0).toUpperCase() + item.field.slice(1);
        const titleText = item.error ? item.error : item.status;

        div.innerHTML = `
            <span style="font-weight:500;">${fieldName}</span>
            <span class="report-status ${statusClass}" title="${titleText}">${icon}</span>
        `;
        list.appendChild(div);
    });
}
