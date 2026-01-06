document.addEventListener('DOMContentLoaded', () => {
    const formSteps = document.querySelectorAll('.form-step');
    const nextBtns = document.querySelectorAll('.next-btn');
    const prevBtns = document.querySelectorAll('.prev-btn');
    const progressFill = document.getElementById('progress-fill');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const form = document.getElementById('loan-form');
    

    // Auto-Fill Logic from LocalStorage
    const storedName = localStorage.getItem('user_name');
    const storedEmail = localStorage.getItem('user_email');
    const storedPhone = localStorage.getItem('user_phone');
    
    if(storedName) {
        const nameInput = document.querySelector('input[name="fullName"]');
        if(nameInput) nameInput.value = storedName;
    }
    if(storedEmail) {
        const emailInput = document.querySelector('input[name="email"]');
        if(emailInput) emailInput.value = storedEmail;
    }
    if(storedPhone) {
        const phoneInput = document.querySelector('input[name="phone"]');
        if(phoneInput) phoneInput.value = storedPhone;
    }

    // Loan Type Visual Feedback & State Capture
    const typeRadios = document.querySelectorAll('input[name="loanType"]');
    typeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            // Visual Reset
            typeRadios.forEach(r => {
                r.parentElement.style.borderColor = '#e2e8f0';
                r.parentElement.style.background = 'rgba(255,255,255,0.5)';
            });
            // Visual Highlight
            if(radio.checked) {
                radio.parentElement.style.borderColor = '#2563EB';
                radio.parentElement.style.background = 'rgba(37, 99, 235, 0.1)';
                selectedLoanType = radio.value; // Update state immediately
            }
        });
    });

    // --- Identity Verification Logic ---
    const verifyVideo = document.getElementById('verify-video');
    const verifyCanvas = document.getElementById('verify-canvas');
    const consentCheckbox = document.getElementById('video-consent');
    let verificationInterval = null;
    let sessionId = Math.random().toString(36).substring(7);

    async function startIdentityVerification() {
        if (!consentCheckbox || !consentCheckbox.checked) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            if (verifyVideo) {
                verifyVideo.srcObject = stream;
                verificationInterval = setInterval(captureAndUploadFrame, 20000); // Every 20 seconds
                console.log("Identity verification monitoring started.");
            }
        } catch (err) {
            console.error("Identity verification camera access denied:", err);
            // We proceed but log that verification might be incomplete
        }
    }

    async function captureAndUploadFrame() {
        if (!verifyVideo || !verifyCanvas || verifyVideo.paused || verifyVideo.ended) return;

        const context = verifyCanvas.getContext('2d');
        context.drawImage(verifyVideo, 0, 0, verifyCanvas.width, verifyCanvas.height);
        
        const blob = await new Promise(resolve => verifyCanvas.toBlob(resolve, 'image/jpeg', 0.7));
        if (!blob) return;

        const formData = new FormData();
        formData.append('frame', blob, `frame_${Date.now()}.jpg`);
        formData.append('session_id', sessionId);
        formData.append('user_id', localStorage.getItem('user_id') || 'guest');

        try {
            await fetch(`${CONFIG.API_BASE_URL}/api/verify/live-session`, {
                method: 'POST',
                body: formData
            });
            console.log("Verification frame uploaded.");
        } catch (err) {
            console.error("Frame upload failed:", err);
        }
    }

    function stopIdentityVerification() {
        if (verificationInterval) {
            clearInterval(verificationInterval);
            verificationInterval = null;
        }
        if (verifyVideo && verifyVideo.srcObject) {
            verifyVideo.srcObject.getTracks().forEach(track => track.stop());
        }
    }
    
    let currentStep = 0;
    let selectedLoanType = ''; // Store selected loan type explicitly


    // Offer Generation Logic
    window.generateMockOffers = function() {
        const amount = document.getElementById('amount').value || 500000;
        const income = document.getElementById('income').value || 50000;
        const loanType = selectedLoanType || document.querySelector('input[name="loanType"]:checked')?.value || 'Personal Loan';
        
        let multiplier = 0.022; // Base for Personal
        let rateOffset = 0;
        
        if (loanType === 'Home Loan') {
            multiplier = 0.008; // Long tenure (Approx EMI factor)
            rateOffset = -2;
        } else if (loanType === 'Mortgage Loan') {
            multiplier = 0.012;
            rateOffset = -1.5;
        } else if (loanType === 'Business Loan') {
            multiplier = 0.025;
            rateOffset = 2;
        }

        // Mock Offers
        const offers = [
            { bank: 'HDFC Bank', rate: (10.5 + rateOffset).toFixed(1), emi: Math.round(amount * (multiplier + 0.001)), logo: 'H' },
            { bank: 'ICICI Bank', rate: (11.2 + rateOffset).toFixed(1), emi: Math.round(amount * (multiplier + 0.002)), logo: 'I' },
            { bank: 'SBI', rate: (9.8 + rateOffset).toFixed(1), emi: Math.round(amount * multiplier), logo: 'S' }
        ];

        const list = document.getElementById('offer-list');
        list.innerHTML = '';

        offers.forEach((offer, index) => {
            const card = document.createElement('div');
            card.className = 'offer-card';
            card.onclick = () => selectOffer(card, offer.bank, offer.rate, offer.emi);
            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="offer-logo">${offer.logo}</div>
                    <div style="text-align: left;">
                        <h4 style="margin: 0; color: #1e293b;">${offer.bank}</h4>
                        <p style="margin: 0; font-size: 0.85rem; color: #64748B;">Pre-approved</p>
                    </div>
                </div>
                <div style="text-align: right;">
                    <h3 style="margin: 0; color: #2563EB;">${offer.rate}%</h3>
                    <p style="margin: 0; font-size: 0.85rem; color: #64748B;">Interest p.a.</p>
                </div>
                <div style="text-align: right;">
                    <h4 style="margin: 0; color: #1e293b;">₹${offer.emi}/mo</h4>
                    <p style="margin: 0; font-size: 0.85rem; color: #64748B;">EMI</p>
                </div>
            `;
            list.appendChild(card);
        });
    }

    function selectOffer(card, bank, rate, emi) {
        // Deselect others
        document.querySelectorAll('.offer-card').forEach(c => c.classList.remove('selected'));
        // Select this
        card.classList.add('selected');
        
        // Store data
        document.getElementById('selectedLender').value = bank;
        document.getElementById('selectedInterest').value = rate;
        
        // Validation for Next Button
        document.getElementById('offer-next-btn').disabled = false;

        // Store for review
        window.selectedOfferData = { bank, rate, emi };
    }

    function updateForm() {
        // Show active step
        formSteps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStep);
        });

        // Update Progress Bar
        const progressPercentage = (currentStep / (formSteps.length - 1)) * 100;
        progressFill.style.width = `${progressPercentage}%`;

        // Update Indicators
        stepIndicators.forEach((indicator, index) => {
            if (index <= currentStep) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
            
            if (index < currentStep) {
                indicator.classList.add('completed');
                indicator.innerHTML = '✓';
            } else {
                indicator.classList.remove('completed');
                indicator.innerHTML = index + 1;
            }
        });

        // Populate Review Step
        if (currentStep === 3) {
            document.getElementById('review-name').textContent = document.querySelector('input[name="fullName"]').value;
            document.getElementById('review-amount').textContent = document.querySelector('input[name="amount"]').value;
            
            // Loan Type Review
            if (selectedLoanType) {
                document.getElementById('review-type').textContent = selectedLoanType;
            } else {
                const selectedType = document.querySelector('input[name="loanType"]:checked');
                if (selectedType) {
                    selectedLoanType = selectedType.value; // Sync if somehow missed
                    document.getElementById('review-type').textContent = selectedLoanType;
                }
            }

            // From Offers
            if(window.selectedOfferData) {
                document.getElementById('review-lender').textContent = window.selectedOfferData.bank;
                document.getElementById('review-interest').textContent = window.selectedOfferData.rate;
                document.getElementById('review-emi').textContent = window.selectedOfferData.emi;
            }
        }
    }

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
             // Simple Validation
            const currentStepEl = formSteps[currentStep];
            const inputs = currentStepEl.querySelectorAll('input, select');
            let valid = true;
            inputs.forEach(input => {
                if (input.type === 'radio') {
                    const radios = document.getElementsByName(input.name);
                    const isChecked = Array.from(radios).some(r => r.checked);
                    if (input.required && !isChecked) valid = false;
                } else {
                    if(input.required && !input.value) valid = false;
                }
            });
            
            // Step 1 Specific Validation
            if (currentStep === 0) {
                if (consentCheckbox && !consentCheckbox.checked) {
                    alert('Please consent to identity verification to continue with your loan application.');
                    return;
                }
            }

            // Step 2 Specific Validation (previously currentStep 1)
            if (currentStep === 1) {
                const amount = document.getElementById('amount').value;
                const income = document.getElementById('income').value;
                
                if (!APP.validateAmount(amount)) {
                    alert('Please enter a valid amount');
                    return;
                }
                if (!APP.validateAmount(income)) {
                    alert('Please enter a valid annual income');
                    return;
                }
            }

            if(!valid) {
                alert('Please fill all required fields');
                return;
            }

            // Move to next step
            if (currentStep < formSteps.length - 1) {
                // If moving from Step 1, start verification if consented
                if (currentStep === 0) {
                    const typeInput = document.querySelector('input[name="loanType"]:checked');
                    if (typeInput) selectedLoanType = typeInput.value;
                    startIdentityVerification();
                }
                currentStep++;
                updateForm();
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                updateForm();
            }
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Manually build clean data object
        const data = {
            fullName: APP.sanitizeInput(document.querySelector('input[name="fullName"]').value),
            phone: APP.sanitizeInput(document.querySelector('input[name="phone"]').value),
            pan: APP.sanitizeInput(document.querySelector('input[name="pan"]').value),
            employmentType: APP.sanitizeInput(document.getElementById('employment').value),
            income: APP.sanitizeInput(document.getElementById('income').value),
            amount: APP.sanitizeInput(document.getElementById('amount').value),
            loanType: selectedLoanType || document.querySelector('input[name="loanType"]:checked')?.value || 'Not Specified',
            // FRAUD DETECTION SIGNALS
            fraud_signals: window.FRAUD_SIGNALS ? FRAUD_MONITOR.collect() : {},
            session_id: sessionId
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        try {
            const response = await APP.secureFetch(`${CONFIG.API_BASE_URL}/api/submit-application`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            // Stop verification recording
            stopIdentityVerification();

            if (result.status === 'success' || result.application_id) {
                const appId = result.application_id || 'APP-12345';
                alert(`Application Submitted Successfully!\nYou are an authenticated user.\nTrust Score: ${result.trust_score}\nStatus: ${result.status}`);
                window.location.href = `loan_tracking.html?id=${appId}`; 
            } else {
                alert('Submission Failed: ' + (result.message || 'Unknown Error'));
                submitBtn.textContent = 'Submit Application';
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error:', error);
            // Mock Success for Demo
            alert('Application Submitted Successfully (Demo Mode)!');
            window.location.href = 'index.html';
        }
    });

    // File Upload Visual Feedback
    document.querySelectorAll('.file-upload-box').forEach(box => {
        const input = box.querySelector('input');
        box.addEventListener('click', () => input.click());
        input.addEventListener('change', () => {
            if (input.files.length > 0) {
                box.querySelector('p').textContent = `Selected: ${input.files[0].name}`;
                box.style.borderColor = 'var(--accent-color)';
                box.style.background = 'rgba(16, 185, 129, 0.1)';
            }
        });
    });
});
