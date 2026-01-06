const APP = {
    init: () => {
        console.log("ShriNeo Vittiyam App Loaded");
        
        // DEBUG: Visual Auth State Indicator (Temporary)
        // const debugEl = document.createElement('div');
        // debugEl.style.cssText = "position: fixed; top: 0; left: 0; background: yellow; color: black; z-index: 9999; padding: 2px 5px; font-size: 10px;";
        // const token = localStorage.getItem('token');
        // debugEl.textContent = token ? "LOGGED IN" : "GUEST";
        // document.body.appendChild(debugEl);

        APP.checkAuthState();
        APP.attachListeners();
    },

    checkAuthState: () => {
        // Check for token or demo flag
        const token = localStorage.getItem('token');
        const isDemo = localStorage.getItem('demo_mode');
        const isAuthenticated = token || isDemo;

        const authItems = document.querySelectorAll('.auth-view');
        const guestItems = document.querySelectorAll('.guest-view');

        if (isAuthenticated) {
            authItems.forEach(el => el.style.display = 'flex'); // Flex for nav items
            guestItems.forEach(el => el.style.display = 'none');
        } else {
            authItems.forEach(el => el.style.display = 'none');
            guestItems.forEach(el => el.style.display = 'flex'); // Flex for nav items
        }
    },

    attachListeners: () => {
        // Logout Logic
        const logoutBtns = document.querySelectorAll('.logout-btn');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                APP.logout();
            });
        });
    },

    logout: () => {
        if(confirm("Are you sure you want to logout?")) {
            localStorage.removeItem('token');
            localStorage.removeItem('demo_mode');
            window.location.href = 'index.html';
        }
    },

    requireAuth: () => {
        const token = localStorage.getItem('token');
        const isDemo = localStorage.getItem('demo_mode');
        
        if (!token && !isDemo) {
            console.warn("Unauthorized access. Redirecting to login.");
            window.location.href = 'login.html';
            window.location.href = 'login.html';
        }
    },

    // Validation Helpers
    validateEmail: (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    },

    disposableDomains: [
        "tempmail.com", "10minutemail.com", "guerrillamail.com", "mailinator.com",
        "yopmail.com", "throwawaymail.com", "temp-mail.org", "fake-email.com",
        "sharklasers.com", "guerrillamail.net", "guerrillamail.org", "grr.la",
        "spam4.me", "maildrop.cc", "dispostable.com", "mail.tm", "emailondeck.com"
    ],

    isDisposableEmail: (email) => {
        if (!email) return false;
        const domain = email.split('@')[1];
        if (!domain) return false;
        return APP.disposableDomains.includes(domain.toLowerCase());
    },

    validatePhone: (phone) => {
        const re = /^\d{10}$/; // Exactly 10 digits
        return re.test(phone.replace(/\D/g, '')); // Check digits only
    },

    validatePassword: (password) => {
        return password && password.length >= 6;
    },

    validateAmount: (amount) => {
        return !isNaN(amount) && amount > 0;
    },

    sanitizeInput: (input) => {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    // Secure Fetch Wrapper
    secureFetch: async (url, options = {}) => {
        const token = localStorage.getItem('token');
        
        // If no token and not login/signup, maybe warn? 
        // But some endpoints might be public.
        // For this app, we assume secureFetch is only used for protected routes.
        
        if (!options.headers) options.headers = {};
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, options);

        if (response.status === 401) {
            console.warn("Session expired or unauthorized. Redirecting...");
            APP.logout(); // Clear token
            return null; // Handle smoothly
        }

        return response;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    APP.init();
    // Chatbot logic has been moved to chatbot.js
});

// Credit Score Logic
window.checkCreditScore = async function() {
    const panInput = document.getElementById('pan-input');
    const pan = panInput.value.toUpperCase();
    const resultDiv = document.getElementById('score-result');
    const scoreValue = document.getElementById('score-value');
    const scoreRating = document.getElementById('score-rating');
    const scoreDesc = document.getElementById('score-desc');
    
    console.log("Checking Credit Score for PAN:", pan);

    if (!pan || pan.length !== 10) {
        alert("Please enter a valid 10-character PAN number.");
        return;
    }

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/check-credit-score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pan: pan })
        });
        const data = await response.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        // Display Result
        resultDiv.style.display = 'block';
        scoreValue.textContent = data.score;
        scoreRating.textContent = data.rating;
        scoreDesc.textContent = data.description;
        
        // Color coding
        const circle = document.querySelector('.score-circle');
        if (data.score >= 750) {
            circle.style.borderColor = '#16a34a'; // Green
            scoreValue.style.color = '#16a34a';
        } else if (data.score >= 650) {
            circle.style.borderColor = '#ca8a04'; // Yellow
            scoreValue.style.color = '#ca8a04';
        } else {
            circle.style.borderColor = '#dc2626'; // Red
            scoreValue.style.color = '#dc2626';
        }

    } catch (error) {
        console.error(error);
        alert("Could not fetch credit score. Ensure backend is running.");
    }
};
