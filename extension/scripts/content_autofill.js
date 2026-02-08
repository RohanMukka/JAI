// scripts/content_autofill.js

(function() {
    console.log("JAI: Autofill script injected.");

    const normalizeText = (text) => (text || '')
        .toString()
        .toLowerCase()
        .replace(/[_\-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Function to calculate similarity between two strings (simple approach)
    function similarity(s1, s2) {
        const a = normalizeText(s1);
        const b = normalizeText(s2);
        if (!a || !b) return 0.0;
        if (a === b) return 1.0;
        if (a.includes(b) || b.includes(a)) return 0.8;
        const aTokens = new Set(a.split(' '));
        const bTokens = new Set(b.split(' '));
        const common = [...aTokens].filter((token) => bTokens.has(token));
        if (common.length >= Math.min(2, aTokens.size, bTokens.size)) {
            return 0.6;
        }
        return 0.0;
    }

    function getLabelText(input) {
        let labelText = "";
        if (input.id) {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) labelText += label.innerText;
        }
        if (input.name) labelText += " " + input.name;
        if (input.placeholder) labelText += " " + input.placeholder;
        if (input.getAttribute('aria-label')) labelText += " " + input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        if (ariaLabelledBy) {
            const ariaLabelEl = document.getElementById(ariaLabelledBy);
            if (ariaLabelEl) labelText += " " + ariaLabelEl.innerText;
        }
        return labelText;
    }

    function getBestCandidate(elements, keywords) {
        let bestMatch = null;
        let maxScore = 0;

        for (const element of elements) {
            const labelText = getLabelText(element);
            for (const keyword of keywords) {
                const score = similarity(labelText, keyword);
                if (score > maxScore) {
                    maxScore = score;
                    bestMatch = element;
                }
            }
        }

        return maxScore > 0.4 ? bestMatch : null; // Threshold
    }

    // Function to find the best matching input field for a given key
    function findBestInput(keywords) {
        const inputs = Array.from(document.querySelectorAll('input, textarea, select'))
            .filter((input) => !['hidden', 'submit', 'button', 'image', 'reset'].includes(input.type));
        return getBestCandidate(inputs, keywords);
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

    function setSelectValue(element, value) {
        const normalizedValue = normalizeText(value);
        const options = Array.from(element.options || []);
        const match = options.find((option) => {
            const optionText = normalizeText(option.text);
            const optionValue = normalizeText(option.value);
            return optionText === normalizedValue
                || optionValue === normalizedValue
                || optionText.includes(normalizedValue)
                || optionValue.includes(normalizedValue);
        });
        if (match) {
            element.value = match.value;
            element.dispatchEvent(new Event('change', { bubbles: true }));
            element.dispatchEvent(new Event('blur', { bubbles: true }));
        }
    }

    function fillChoiceField(keywords, value) {
        if (!value) return;
        const normalizedValue = normalizeText(value);
        const selects = Array.from(document.querySelectorAll('select'));
        const selectMatch = getBestCandidate(selects, keywords);
        if (selectMatch) {
            setSelectValue(selectMatch, value);
            return;
        }

        const choiceInputs = Array.from(document.querySelectorAll('input[type="radio"], input[type="checkbox"]'));
        const candidateInputs = choiceInputs.filter((input) => {
            const labelText = normalizeText(getLabelText(input));
            return keywords.some((keyword) => labelText.includes(normalizeText(keyword)));
        });

        if (candidateInputs.length === 0) {
            return;
        }

        const exactMatch = candidateInputs.find((input) => {
            const labelText = normalizeText(getLabelText(input));
            const valueText = normalizeText(input.value);
            return labelText.includes(normalizedValue) || valueText.includes(normalizedValue);
        });

        const target = exactMatch || candidateInputs[0];
        if (target) {
            target.checked = true;
            target.dispatchEvent(new Event('change', { bubbles: true }));
            target.dispatchEvent(new Event('blur', { bubbles: true }));
        }
    }

    // Main Autofill Logic
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "autofill_profile") {
            const profile = request.profile;
            console.log("JAI: filling form with profile:", profile);

            const fullName = [profile.firstName, profile.middleName, profile.lastName]
                .filter(Boolean)
                .join(' ')
                .trim();

            const latestEducation = Array.isArray(profile.education) && profile.education.length > 0
                ? profile.education[0]
                : null;
            const latestExperience = Array.isArray(profile.experience) && profile.experience.length > 0
                ? profile.experience[0]
                : null;

            const mappings = {
                fullName: ['full name', 'name'],
                firstName: ['first name', 'given name'],
                middleName: ['middle name', 'middle initial'],
                lastName: ['last name', 'surname', 'family name'],
                email: ['email', 'email address'],
                phone: ['phone', 'mobile', 'cell', 'contact number', 'telephone'],
                phoneCountryCode: ['country code', 'phone code', 'dial code'],
                phoneExtension: ['extension', 'ext'],
                phoneDeviceType: ['phone type', 'device type', 'phone device'],
                linkedin: ['linkedin', 'linkedin profile', 'linkedin url'],
                portfolio: ['portfolio', 'website', 'personal site', 'personal website'],
                github: ['github', 'git', 'github profile'],
                location: ['location', 'current location'],
                addressLine1: ['address line 1', 'street address', 'address'],
                addressLine2: ['address line 2', 'apt', 'apartment', 'suite', 'unit'],
                city: ['city', 'town'],
                state: ['state', 'province', 'region'],
                zip: ['zip', 'postal code', 'postcode'],
                country: ['country'],
                desiredSalary: ['desired salary', 'salary expectation', 'salary requirements', 'compensation'],
                noticePeriod: ['notice period', 'availability', 'start date'],
                workAuth: ['work authorization', 'work authorization status', 'authorized to work'],
                sponsorship: ['sponsorship', 'visa sponsorship', 'require sponsorship'],
                disability: ['disability', 'self identify disability'],
                gender: ['gender', 'gender identity'],
                lgbtq: ['lgbtq', 'sexual orientation', 'lgbtqia'],
                veteran: ['veteran', 'protected veteran'],
                race: ['race', 'ethnicity', 'ethnic'],
                hispanic: ['hispanic', 'latino', 'latinx'],
                sexualOrientation: ['sexual orientation']
            };

            const fieldEntries = [
                { value: fullName || profile.name, keywords: mappings.fullName },
                { value: profile.firstName, keywords: mappings.firstName },
                { value: profile.middleName, keywords: mappings.middleName },
                { value: profile.lastName, keywords: mappings.lastName },
                { value: profile.email, keywords: mappings.email },
                { value: profile.phone, keywords: mappings.phone },
                { value: profile.phoneCountryCode, keywords: mappings.phoneCountryCode },
                { value: profile.phoneExtension, keywords: mappings.phoneExtension },
                { value: profile.linkedin, keywords: mappings.linkedin },
                { value: profile.portfolio, keywords: mappings.portfolio },
                { value: profile.github, keywords: mappings.github },
                { value: profile.location, keywords: mappings.location },
                { value: profile.addressLine1, keywords: mappings.addressLine1 },
                { value: profile.addressLine2, keywords: mappings.addressLine2 },
                { value: profile.city, keywords: mappings.city },
                { value: profile.state, keywords: mappings.state },
                { value: profile.zip, keywords: mappings.zip },
                { value: profile.country, keywords: mappings.country },
                { value: profile.desiredSalary, keywords: mappings.desiredSalary },
                { value: profile.noticePeriod, keywords: mappings.noticePeriod },
                { value: latestEducation?.school, keywords: ['school', 'university', 'college'] },
                { value: latestEducation?.degree, keywords: ['degree', 'major', 'field of study'] },
                { value: latestEducation?.startDate, keywords: ['education start date', 'school start date'] },
                { value: latestEducation?.endDate, keywords: ['education end date', 'graduation date'] },
                { value: latestExperience?.company, keywords: ['company', 'employer', 'organization'] },
                { value: latestExperience?.role, keywords: ['job title', 'position', 'role'] },
                { value: latestExperience?.startDate, keywords: ['employment start date', 'job start date'] },
                { value: latestExperience?.endDate, keywords: ['employment end date', 'job end date'] },
                { value: latestExperience?.description, keywords: ['responsibilities', 'job description', 'summary'] }
            ];

            fieldEntries.forEach(({ value, keywords }) => {
                if (!value) return;
                const field = findBestInput(keywords);
                if (field) {
                    if (field.tagName === 'SELECT') {
                        setSelectValue(field, value);
                    } else {
                        setNativeValue(field, value);
                    }
                }
            });

            fillChoiceField(mappings.phoneDeviceType, profile.phoneDeviceType);
            fillChoiceField(mappings.workAuth, profile.workAuth);
            fillChoiceField(mappings.sponsorship, profile.sponsorship);
            fillChoiceField(mappings.disability, profile.disability);
            fillChoiceField(mappings.gender, profile.gender);
            fillChoiceField(mappings.lgbtq, profile.lgbtq);
            fillChoiceField(mappings.veteran, profile.veteran);
            fillChoiceField(mappings.race, profile.race);
            fillChoiceField(mappings.hispanic, profile.hispanic);

            if (Array.isArray(profile.sexualOrientation)) {
                profile.sexualOrientation.forEach((orientation) => {
                    fillChoiceField(mappings.sexualOrientation, orientation);
                });
            }

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
