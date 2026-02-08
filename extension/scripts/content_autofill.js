// scripts/content_autofill.js

(function() {
    console.log("JAI: Autofill script injected.");

    // Helper: Calculate similarity (0 to 1)
    function similarity(s1, s2) {
        if (!s1 || !s2) return 0;
        s1 = s1.toLowerCase().replace(/[^a-z0-9]/g, '');
        s2 = s2.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        if (s1 === s2) return 1.0;
        if (s1.includes(s2) || s2.includes(s1)) return 0.8;
        return 0.0;
    }

    // Helper: Get all text associated with an input
    function getInputLabelText(input) {
        let text = "";
        
        // 1. <label for="id">
        if (input.id) {
            const label = document.querySelector(`label[for="${CSS.escape(input.id)}"]`);
            if (label) text += " " + label.innerText;
        }
        
        // 2. Parent <label>
        const parentLabel = input.closest('label');
        if (parentLabel) text += " " + parentLabel.innerText;

        // 3. Attributes
        if (input.name) text += " " + input.name;
        if (input.placeholder) text += " " + input.placeholder;
        if (input.getAttribute('aria-label')) text += " " + input.getAttribute('aria-label');
        
        // 4. Previous Sibling (common in some layouts)
        const prev = input.previousElementSibling;
        if (prev && (prev.tagName === 'LABEL' || prev.tagName === 'SPAN' || prev.tagName === 'DIV')) {
             text += " " + prev.innerText;
        }

        // 5. Parent Element Text (Fallback, can be noisy but helpful)
        if (input.parentElement) {
            // Get direct text of parent, ignoring other inputs? Use carefully.
            // For now, let's skip to avoid "First Name Last Name" bleeding.
        }

        return text.trim();
    }

    // Helper: Smart Select Value Setter
    function setSelectValue(select, value) {
        if (!select || !value) return false;
        const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const target = normalize(value);
        
        let bestOption = null;
        let maxScore = 0;

        // 1. Try exact value match
        for (const option of select.options) {
             if (option.value === value) {
                 select.value = value;
                 return true;
             }
        }

        // 2. Fuzzy Text Match
        const cleanTarget = target.replace(/[^a-z0-9]/g, '');

        for (const option of select.options) {
            const optTextRaw = option.text.toLowerCase();
            const optValRaw = option.value.toLowerCase();
            
            // Handle "Main/Home" -> try "Main" and "Home" separately
            const parts = [optTextRaw, optValRaw, ...optTextRaw.split(/[\/\-]/)]; 
            
            for (const part of parts) {
                const cleanPart = part.replace(/[^a-z0-9]/g, '');
                
                // Exact match on part
                if (cleanPart === cleanTarget) {
                    select.value = option.value;
                    return true;
                }
                
                const score = similarity(cleanPart, cleanTarget);
                if (score > maxScore) {
                    maxScore = score;
                    bestOption = option;
                }
            }
        }

        if (maxScore > 0.75 && bestOption) { // Lower threshold slightly
            console.log(`JAI: Selecting fuzzy match '${bestOption.text}' for '${value}' (Score: ${maxScore})`);
            select.value = bestOption.value;
            // Force React change
            setNativeValue(select, bestOption.value); 
            return true;
        }
        
        return false;
    }

    // Helper: Set value safely (works with React/Angular)
    function setNativeValue(element, value) {
        if (!element) return;
        
        let success = false;
        const events = ['input', 'change', 'blur'];

        const triggerEvents = (el) => {
            events.forEach(eventType => {
                el.dispatchEvent(new Event(eventType, { bubbles: true }));
            });
        };

        try {
            // Method 1: React 15/16+ Value Tracker
            const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
            const prototype = Object.getPrototypeOf(element);
            const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

            if (valueSetter && valueSetter !== prototypeValueSetter) {
                prototypeValueSetter.call(element, value);
                success = true;
            } else if (valueSetter) {
                valueSetter.call(element, value);
                success = true;
            }
        } catch (e) {
            // console.warn("JAI: React setter failed...", e);
        }

        if (!success) {
             // Method 2: Standard Assignment
            try {
                element.value = value;
                success = true;
            } catch (e) {
                console.error("JAI: Standard assignment failed", e);
                // Don't throw, just log
            }
        }
        
        triggerEvents(element);
        return success;
    }

    // Main Message Listener
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "autofill_profile") {
            const profile = request.profile;
            const report = []; 
            
            console.log("JAI: Starting autofill scan...", profile);

            // --- 1. Prepare Profile Data ---
            let firstName = profile.firstName || "";
            let lastName = profile.lastName || "";
            let middleName = profile.middleName || "";
            if (!firstName && profile.name) {
                const parts = profile.name.split(' ');
                firstName = parts[0];
                lastName = parts.slice(1).join(' ');
            }

            // --- 2. Define Supported Fields ---
            const fieldDefinitions = [
                // Identity
                { key: 'firstName', val: firstName, keywords: ['first name', 'given name', 'fname'] },
                { key: 'middleName', val: middleName, keywords: ['middle name', 'mname', 'middle initial'] },
                { key: 'lastName', val: lastName, keywords: ['last name', 'surname', 'family name', 'lname'] },
                { key: 'fullName', val: profile.name, keywords: ['full name', 'your name', 'complete name', 'legal name'] },
                
                // Contact
                { key: 'email', val: profile.email, keywords: ['email', 'e-mail', 'email address'] },
                
                // Explicitly prioritize specific phone parts before generic phone
                { key: 'phoneCountryCode', val: profile.phoneCountryCode, keywords: ['country phone code', 'country code', 'area code', 'prefix'] }, 
                { key: 'phoneExtension', val: profile.phoneExtension, keywords: ['phone extension', 'extension', 'ext'] },
                { key: 'phoneDeviceType', val: profile.phoneDeviceType, keywords: ['phone device type', 'device type', 'phone type', 'line type'] },
                
                { key: 'phone', val: profile.mobile || profile.phone, keywords: ['phone number', 'phone', 'mobile', 'cell', 'telephone', 'contact number'] },

                // Socials
                { key: 'linkedin', val: profile.linkedin || (profile.links ? profile.links.find(l => l.type.includes('linkedin'))?.url : ''), keywords: ['linkedin'] },
                { key: 'portfolio', val: profile.website || (profile.links ? profile.links.find(l => l.type.includes('portfolio') || l.type.includes('website'))?.url : ''), keywords: ['portfolio', 'website', 'personal site'] },
                { key: 'github', val: profile.github || (profile.links ? profile.links.find(l => l.type.includes('github'))?.url : ''), keywords: ['github'] },
                
                // Address (Granular)
                { key: 'addressLine1', val: profile.addressLine1 || profile.address, keywords: ['address line 1', 'street address', 'address 1', 'street'] },
                { key: 'addressLine2', val: profile.addressLine2, keywords: ['address line 2', 'apartment', 'suite', 'unit', 'address 2'] },
                { key: 'city', val: profile.city, keywords: ['city', 'town', 'municipality'] },
                { key: 'state', val: profile.state, keywords: ['state', 'province', 'region'] },
                { key: 'zip', val: profile.zip, keywords: ['zip', 'postal code', 'postcode', 'zip code', 'zip/postal code'] },
                { key: 'country', val: profile.country, keywords: ['country', 'nation', 'country/region'] },
                
                // Demographics & EEOC
                { key: 'gender', val: profile.gender, keywords: ['gender', 'sex'] },
                { key: 'race', val: profile.race, keywords: ['race', 'ethnicity'] },
                { key: 'veteran', val: profile.veteran, keywords: ['veteran', 'military'] },
                { key: 'disability', val: profile.disability, keywords: ['disability', 'handicap'] },
                { key: 'workAuth', val: profile.workAuth, keywords: ['work authorization', 'authorized to work', 'legally authorized'] },
                { key: 'sponsorship', val: profile.sponsorship, keywords: ['sponsorship', 'require visa', 'require sponsorship'] },

                // Job Preferences
                { key: 'desiredSalary', val: profile.desiredSalary, keywords: ['desired salary', 'expected salary', 'compensation', 'pay expectation'] },
                { key: 'noticePeriod', val: profile.noticePeriod, keywords: ['notice period', 'start date', 'available to start', 'earliest start'] },

                // Fallbacks
                { key: 'location', val: profile.location, keywords: ['location', 'residence'] }, 
            ];

            // --- 3. Scan All Inputs ---
            const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select'));
            const matches = [];

            inputs.forEach(input => {
                const labelText = getInputLabelText(input).toLowerCase();
                if (!labelText) return;

                // Score this input against known fields
                let bestMatch = null;
                let maxScore = 0;

                fieldDefinitions.forEach(def => {
                     // EXCLUSIONS:
                     // 1. Phone number should NOT fill Extension, Country Code, or Type
                    if (def.key === 'phone') {
                        if (labelText.includes('extension') || 
                            labelText.includes('device') || 
                            labelText.includes('type') || 
                            (labelText.includes('country') && labelText.includes('code'))) { 
                            return; 
                        }
                    }

                    for (const keyword of def.keywords) {
                        const score = similarity(labelText, keyword);
                        if (score > maxScore) {
                            maxScore = score;
                            bestMatch = def;
                        }
                    }
                });

                // Threshold
                if (maxScore > 0.6 && bestMatch) {
                    matches.push({
                        input: input,
                        fieldDef: bestMatch,
                        score: maxScore,
                        label: labelText
                    });
                }
            });

            // --- 4. Resolve Conflicts & Fill ---
            // Sort matches by score descending to prioritize clear matches
            matches.sort((a, b) => b.score - a.score);

            const filledInputs = new Set();
            const handledFields = new Set(); // Optional: allow multiple inputs for same field? E.g. confirm email? 
            // For now, let's allow filling multiple inputs with same data if they match strongly (e.g. repeated fields)
            
            matches.forEach(match => {
                if (filledInputs.has(match.input)) return; // Input already claimed

                // Filter Overlapping Names: 
                // If we have "Full Name" and "First Name" matches on the same page, we need to be careful.
                // But since we are iterating INPUTS, an input is either Full Name OR First Name.
                // If "First Name" label matches "Full Name" keyword? 
                // "First Name" vs "Full Name" -> 0.8 includes. 
                // "First Name" vs "First Name" -> 1.0. 
                // So correct match wins.

                const { key, val } = match.fieldDef;
                
                try {
                    if (val) {
                        let success = false;
                        if (match.input.tagName === 'SELECT') {
                            success = setSelectValue(match.input, val);
                        } else {
                            setNativeValue(match.input, val);
                            success = true;
                        }
                        
                        if (success) {
                            report.push({ field: key, status: 'filled', value: val });
                            
                            // Visual Success
                            match.input.style.backgroundColor = "#e8f0fe"; 
                            match.input.style.border = "2px solid #10B981"; // Green
                        } else {
                            // Select matching failed
                             report.push({ field: key, status: 'error', error: 'Option not found' });
                             match.input.style.border = "2px solid #EF4444"; // Red
                        }

                    } else {
                        report.push({ field: key, status: 'empty_in_profile' });
                        match.input.style.border = "2px solid #F59E0B"; // Amber
                    }
                } catch (e) {
                    report.push({ field: key, status: 'error', error: e.message });
                }

                filledInputs.add(match.input);
            });
            
            console.log("JAI: Scan complete. Report:", report);
            sendResponse({ success: true, report: report });
        }
    });

})();
