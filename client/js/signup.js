// --- CAPTCHA LOGIC ---
let currentCaptcha = '';

function generateCaptcha() {
    const canvas = document.getElementById('captcha-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let captcha = '';
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background noise (random lines)
    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.2)`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }
    
    // Draw text
    ctx.font = 'bold 30px Outfit';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < 6; i++) {
        const char = chars.charAt(Math.floor(Math.random() * chars.length));
        captcha += char;
        
        ctx.save();
        ctx.translate(25 + i * 22, canvas.height / 2);
        ctx.rotate((Math.random() - 0.5) * 0.4);
        ctx.fillStyle = `rgb(${Math.random()*100}, ${Math.random()*100}, ${Math.random()*100})`;
        ctx.fillText(char, 0, 0);
        ctx.restore();
    }
    
    currentCaptcha = captcha;
    console.log("New CAPTCHA generated:", currentCaptcha);
}

// 3. Form Validation Handler
function handleSignup(event) {
    event.preventDefault(); // Stop form from submitting immediately
    
    // Select Inputs
    const firstName = document.querySelector('input[data-i18n="first_name"]')?.value || "User";
    const lastName = document.querySelector('input[data-i18n="last_name"]')?.value || "";
    const emailInput = document.querySelector('input[type="email"]');
    const phoneInput = document.querySelector('input[type="tel"]');
    const passInputs = document.querySelectorAll('input[type="password"]');
    const password = passInputs[0];
    const confirmPass = passInputs[1];
    
    const captchaInput = document.getElementById('captcha-input');
    const errorMsg = document.getElementById('signup-error');
    
    // Reset error
    if (errorMsg) {
        errorMsg.style.display = 'none';
        errorMsg.textContent = '';
    }

    // 1. Email Basic Validation
    if (!APP.validateEmail(emailInput.value)) {
        showError("Invalid email address format.");
        return false;
    }

    // 2. Temp Mail Check
    if (APP.isDisposableEmail(emailInput.value)) {
        showError("Temporary email addresses are not allowed. Please use a valid email.");
        return false;
    }

    // 3. Phone Validation (10 Digits)
    if (!APP.validatePhone(phoneInput.value)) {
        showError("Phone number must be exactly 10 digits.");
        return false;
    }

    // 4. Password Validation (Min 6 chars)
    if (!APP.validatePassword(password.value)) {
        showError("Password must be at least 6 characters long.");
        return false;
    }

    // 5. Password Match
    if (password.value !== confirmPass.value) {
        showError("Passwords do not match.");
        return false;
    }

    // CAPTCHA Check
    if (captchaInput.value !== currentCaptcha) {
        showError("Invalid CAPTCHA. Please try again.");
        generateCaptcha(); // Regenerate on failure
        captchaInput.value = '';
        return false;
    }

    // Save Data for Auto-fill in Loan Application
    localStorage.setItem('user_name', firstName + " " + lastName);
    localStorage.setItem('user_email', emailInput.value);
    localStorage.setItem('user_phone', phoneInput.value);

    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = "Creating Account...";
        submitBtn.disabled = true;
    }

    // MOCK REGISTRATION DELAY
    setTimeout(() => {
        window.location.href = 'verification.html?email=' + emailInput.value;
    }, 1000);

    return true; // Form submission prevented by default logic, this is fine
}

function showError(msg) {
    const errorMsg = document.getElementById('signup-error');
    if (errorMsg) {
        errorMsg.textContent = msg;
        errorMsg.style.display = 'block';
        errorMsg.style.color = '#ef4444';
        errorMsg.style.marginBottom = '1rem';
        errorMsg.style.textAlign = 'left';
        errorMsg.style.fontSize = '0.9rem';
    } else {
        alert(msg);
    }
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    generateCaptcha();
    
    // Attach listener to form
    const form = document.querySelector('form');
    if (form) {
        form.onsubmit = handleSignup;
    }

    // Refresh button logic
    const refreshBtn = document.getElementById('refresh-captcha');
    if (refreshBtn) {
        refreshBtn.onclick = (e) => {
            e.preventDefault();
            generateCaptcha();
        };
    }

    // --- DEMO MODE LOGIC ---
    const demoBtn = document.createElement('button');
    demoBtn.innerHTML = "⚡ Run Demo Mode";
    demoBtn.style.cssText = "position: fixed; top: 100px; right: 20px; background: #f59e0b; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 2rem; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 1000;";
    document.body.appendChild(demoBtn);

    demoBtn.addEventListener('click', async () => {
        // SET GLOBAL DEMO FLAG
        localStorage.setItem('demo_mode', 'true');
        
        demoBtn.disabled = true;
        demoBtn.innerHTML = "⚡ Auto-Filling...";
        
        const inputs = document.querySelectorAll('input');
        
        // Simulate typing
        const dummyData = {
            0: "Raj",           // First Name
            1: "Kumar",         // Middle Name
            2: "Sharma",        // Last Name
            3: "+91 98765 43210", // Phone
            4: `raj.sharma.${Math.floor(Math.random() * 10000)}@example.com`, // Email (Randomized)
            5: "password123",   // Password
            6: "password123",   // Confirm Password
            7: currentCaptcha   // Captcha
        };

        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].type !== 'submit' && inputs[i].type !== 'button') {
                inputs[i].value = dummyData[i] || "";
                await new Promise(r => setTimeout(r, 100)); // typing effect
            }
        }

        await new Promise(r => setTimeout(r, 500));
        
        await new Promise(r => setTimeout(r, 500));
        
        // Auto Submit
        // form.dispatchEvent(new Event('submit')); // Redundant
        document.querySelector('button[type="submit"]').click();
    });
});
