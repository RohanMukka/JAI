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
        if (!select) return false;
        
        // 1. Special Case: Referral Source (if value is generic or null, try to pick a common one)
        if (value === '___REFERRAL_FALLBACK___') {
             for (const option of select.options) {
                 const t = option.text.toLowerCase();
                 if (t.includes('linkedin') || t.includes('indeed') || t.includes('glassdoor')) {
                     select.value = option.value;
                     setNativeValue(select, option.value);
                     return true;
                 }
             }
             return false;
        }

        if (!value) return false;

        const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const target = normalize(value);
        
        let bestOption = null;
        let maxScore = 0;

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

        if (maxScore > 0.65 && bestOption) { // Lowered threshold slightly to catch "Asian (Not Hispanic)" for "Asian"
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

            // Education Extraction
            let latestSchool = "";
            let latestMajor = "";
            if (profile.education && Array.isArray(profile.education) && profile.education.length > 0) {
                // Assuming education is sorted or we take the first as "most recent/relevant"
                latestSchool = profile.education[0].institution || profile.education[0].school || "";
                latestMajor = profile.education[0].major || profile.education[0].degree || ""; 
            }

            // --- 2. Define Supported Fields ---
            const fieldDefinitions = [
                // Identity
                { key: 'firstName', val: firstName, keywords: ['first name', 'given name', 'fname', 'preferred first name', 'preferred name'] },
                { key: 'middleName', val: middleName, keywords: ['middle name', 'mname', 'middle initial'] },
                { key: 'lastName', val: lastName, keywords: ['last name', 'surname', 'family name', 'lname'] },
                { key: 'fullName', val: profile.name, keywords: ['full name', 'your name', 'complete name', 'legal name'] },
                
                // Education (New)
                { key: 'school', val: latestSchool, keywords: ['school', 'university', 'college', 'institution', 'attended', 'education'] },
                { key: 'major', val: latestMajor, keywords: ['major', 'degree', 'field of study', 'discipline'] },

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
                { key: 'city', val: profile.city, keywords: ['city', 'town', 'municipality', 'your location', 'search by city'] },
                { key: 'state', val: profile.state, keywords: ['state', 'province', 'region'] },
                { key: 'zip', val: profile.zip, keywords: ['zip', 'postal code', 'postcode', 'zip code', 'zip/postal code'] },
                { key: 'country', val: profile.country, keywords: ['country', 'nation', 'country/region'] },
                
                // Demographics & EEOC -- IMPROVED KEYWORDS
                { key: 'gender', val: profile.gender, keywords: ['gender', 'sex', 'gender identity'] },
                { key: 'race', val: profile.race, keywords: ['race', 'ethnicity', 'racial'] },
                { key: 'veteran', val: profile.veteran, keywords: ['veteran', 'military'] },
                { key: 'disability', val: profile.disability, keywords: ['disability', 'handicap'] },
                { key: 'workAuth', val: profile.workAuth, keywords: ['work authorization', 'authorized to work', 'legally authorized', 'work in the united states'] },
                { key: 'sponsorship', val: profile.sponsorship, keywords: ['sponsorship', 'require visa', 'require sponsorship', 'future sponsorship'] },

                // Job Preferences
                { key: 'desiredSalary', val: profile.desiredSalary, keywords: ['desired salary', 'expected salary', 'compensation', 'pay expectation', 'target salary'] },
                { key: 'noticePeriod', val: profile.noticePeriod, keywords: ['notice period', 'start date', 'available to start', 'earliest start'] },

                // Boolean / Choice Questions
                { key: 'workAuthBoolean', type: 'boolean', keywords: ['authorized to work', 'legally authorized', 'work authorization'] },
                { key: 'sponsorshipBoolean', type: 'boolean', keywords: ['sponsorship', 'require visa', 'will you now or in the future require'] },
                { key: 'isStudentBoolean', type: 'boolean', keywords: ['enrolled in a degree', 'student', 'currently enrolled'] },
                { key: 'relocationBoolean', type: 'boolean', keywords: ['relocate', 'commute'] },
                { key: 'officeLocationBoolean', type: 'boolean', keywords: ['available to work', 'commit to this requirement', 'commutable distance'] },

                 // Referral Fallback
                { key: 'referralSource', val: '___REFERRAL_FALLBACK___', keywords: ['how did you learn', 'hear about this job', 'source'] },

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
            matches.sort((a, b) => b.score - a.score); // Best matches first

            const filledInputs = new Set();
            // const handledFields = new Set(); 

            matches.forEach(match => {
                if (filledInputs.has(match.input)) return; 

                const { key, val, type } = match.fieldDef;
                
                try {
                    // Handle Boolean/Choice Logic (Yes/No questions)
                    if (type === 'boolean') {
                        // For boolean fields, val is a function returning true/false/'yes'/'no' string
                        // OR val is a string we need to map to Yes/No options
                        handleBooleanInput(match.input, key, profile);
                        report.push({ field: key, status: 'filled_boolean' });
                    } 
                    else if (val) {
                        let success = false;
                        if (match.input.tagName === 'SELECT') {
                            success = setSelectValue(match.input, val);
                        } else {
                            // Logic for text search inputs (e.g. City search)
                             if (key === 'city' || key === 'school') {
                                simulateTyping(match.input, val);
                                success = true;
                             } else {
                                success = setNativeValue(match.input, val);
                             }
                        }
                        
                        if (success) {
                            report.push({ field: key, status: 'filled', value: val });
                            match.input.style.backgroundColor = "#e8f0fe"; 
                            match.input.style.border = "2px solid #10B981"; 
                        } else {
                             report.push({ field: key, status: 'error', error: 'Option not found' });
                             match.input.style.border = "2px solid #EF4444"; 
                        }

                    } else {
                        report.push({ field: key, status: 'empty_in_profile' });
                        match.input.style.border = "2px solid #F59E0B"; 
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

    // --- Helpers ---

    function handleBooleanInput(input, key, profile) {
        // Logic to determine Yes/No answer based on profile
        let answer = null; // true (Yes), false (No), or null

        if (key === 'workAuthBoolean') {
            // "Are you authorized to work?"
            const auth = (profile.workAuth || '').toLowerCase();
            // Assume Yes if citizen, pr, or authorized is mentioned
            if (auth.includes('citizen') || auth.includes('permanent') || auth.includes('yes') || auth.includes('authorized')) {
                answer = true;
            } else if (auth) {
                 // Check explicitly for 'No'
                 if (auth.includes('no') || auth.includes('not')) answer = false;
            }
        }
        else if (key === 'sponsorshipBoolean') {
             // "Will you require sponsorship?"
             const spons = (profile.sponsorship || '').toLowerCase();
             if (spons.includes('no') || spons.includes('not')) answer = false;
             else if (spons.includes('yes') || spons.includes('require')) answer = true;
        }
        else if (key === 'isStudentBoolean') {
            // "Are you a student?" or "Enrolled in CS?"
             if (profile.education && profile.education.length > 0) answer = true;
        }
        else if (key === 'relocationBoolean') {
            // "Willing to relocate?"
            answer = true; 
        }
        else if (key === 'officeLocationBoolean') {
            // "Commit to work in Raleigh?"
            answer = true;
        }

        if (answer === null) return;

        // Apply Answer to Input (Radio or Select)
        if (input.tagName === 'SELECT') {
            // Look for Yes/No options
            for (const opt of input.options) {
                const text = opt.text.toLowerCase();
                const val = opt.value.toLowerCase();
                
                if (answer === true && (text === 'yes' || text.includes('authorized') || text.includes('agree') || val === 'yes')) {
                    input.value = opt.value;
                    setNativeValue(input, opt.value);
                    break;
                }
                if (answer === false && (text === 'no' || text.includes('not') || val === 'no')) {
                    input.value = opt.value;
                    setNativeValue(input, opt.value);
                    break;
                }
            }
        } else if (input.type === 'radio' || input.type === 'checkbox') {
             const label = getInputLabelText(input).toLowerCase();
             const val = input.value.toLowerCase();
             
             // Check if THIS radio is the one we want
             const isYes = val === 'yes' || label === 'yes' || val === 'true' || label.includes('yes');
             const isNo = val === 'no' || label === 'no' || val === 'false' || label.includes('no');

             if (answer === true && isYes) input.click();
             if (answer === false && isNo) input.click();
        }
    }

    function simulateTyping(element, value) {
        element.focus();
        element.value = value;
        setNativeValue(element, value);
        
        // Dispatch key events to trigger listeners
        element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
        element.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true }));
        element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Blur might close dropdown, so maybe keep focus? 
        // element.blur(); 
    }

})();
