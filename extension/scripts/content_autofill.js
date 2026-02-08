// scripts/content_autofill.js

(function() {
    console.log("JAI: Autofill script injected.");

    // Function to calculate similarity between two strings (simple approach)
    function similarity(s1, s2) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();
        if (s1 === s2) return 1.0;
        if (s1.includes(s2) || s2.includes(s1)) return 0.8;
        return 0.0;
    }

    // Function to find the best matching input field for a given key
    function findBestInput(keywords) {
        const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
        let bestMatch = null;
        let maxScore = 0;

        for (const input of inputs) {
            // Check label
            let labelText = "";
            if (input.id) {
                const label = document.querySelector(`label[for="${input.id}"]`);
                if (label) labelText += label.innerText;
            }
            if (input.name) labelText += " " + input.name;
            if (input.placeholder) labelText += " " + input.placeholder;
            if (input.getAttribute('aria-label')) labelText += " " + input.getAttribute('aria-label');

            // Calculate score based on keywords
            for (const keyword of keywords) {
                const score = similarity(labelText, keyword);
                if (score > maxScore) {
                    maxScore = score;
                    bestMatch = input;
                }
            }
        }

        return maxScore > 0.6 ? bestMatch : null; // Threshold
    }

    // Function to set value and trigger events (Crucial for React/Angular)
    function setNativeValue(element, value) {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

        if (valueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(element, value);
        } else {
            valueSetter.call(element, value);
        }

        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));
    }

    // Main Autofill Logic
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "autofill_profile") {
            const profile = request.profile;
            console.log("JAI: filling form with profile:", profile);

            const mappings = {
                'name': ['name', 'full name', 'first name', 'fullname'],
                'email': ['email', 'email address'],
                'phone': ['phone', 'mobile', 'cell', 'contact number'],
                'linkedin': ['linkedin', 'linkedin profile', 'linkedin url'],
                'portfolio': ['portfolio', 'website', 'personal site'],
                'github': ['github', 'git'],
                'location': ['location', 'city', 'address']
            };

            // 1. Basic Fields
            if (profile.name) {
                const field = findBestInput(mappings['name']);
                if (field) setNativeValue(field, profile.name);
            }
            if (profile.email) {
                const field = findBestInput(mappings['email']);
                if (field) setNativeValue(field, profile.email);
            }
            // Add more fields as needed

            // 2. Links (LinkedIn, Portfolio)
            if (profile.links) {
                // Assuming profile.links is an array or object. Adjust based on actual data structure.
                // Example: profile.links = [{type: 'linkedin', url: '...'}, ...]
                 if (Array.isArray(profile.links)) {
                    profile.links.forEach(link => {
                        const type = link.type.toLowerCase();
                        if (mappings[type]) {
                            const field = findBestInput(mappings[type]);
                            if (field) setNativeValue(field, link.url);
                        }
                    });
                }
            }
            
            sendResponse({ success: true });
        }
    });

})();
