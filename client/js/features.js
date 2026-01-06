// features.js - Dark Mode & Multilingual Support

// Dictionary for translations
const translations = {
    en: {
        brand: "ShriNeo Vittiyam",
        home: "Home",
        kyc: "KYC Verification",
        apply: "Apply Loan",
        dash: "Dashboard",
        agent_dash: "Agent Dashboard",
        login: "Login",
        logout: "Logout",
        signup: "Sign Up",
        welcome: "Simplifying Your Financial/Legal Journey",
        features: "Features",
        services: "Services",
        about: "About",
        verify: "Verify",
        
        // Home Page
        hero_title: "Your Dreams, Our <br>Responsibility",
        hero_tagline: "Built for customers. Designed for agents. Supported by banks. Powered by trust.",
        hero_subtitle: "India's only platform for all your financial needs",
        apply_loan: "Apply for Loan →",
        track_loan: "Track Your Loan",
        check_score: "Free Credit Score Check",
        
        // Form Placeholders & Labels
        email_addr: "Email Address",
        email_ph: "name@example.com",
        password: "Password",
        pass_ph: "••••••••",
        confirm_pass: "Confirm Password",
        first_name: "First Name",
        middle_name: "Middle Name (Optional)",
        last_name: "Last Name",
        phone: "Phone",
        phone_ph: "+91 XXXXX XXXXX",
        verify_human: "Verify you are human",
        refresh_captcha: "Refresh CAPTCHA",
        captcha_ph: "Enter characters from image",
        next_verify: "Next: Verification →",
        already_acc: "Already have an account?",
        dont_have_acc: "Don't have an account?",
        signin_link: "Sign in",
        signup_link: "Sign up",

        // Features
        why_choose: "Why Choose ShriNeo Vittiyam?",
        empowering: "Empowering Bharat with accessible and transparent credit.",
        fast_app: "Fast Approvals",
        fast_app_desc: "Get your loan approved in minutes with our AI-driven risk engine.",
        secure: "Secure & Private",
        secure_desc: "Bank-grade encryption ensures your data remains safe and confidential.",
        multi: "Multilingual Support",
        multi_desc: "Access financial services in your local language without barriers.",
        digital: "100% Digital",
        digital_desc: "Paperless process from application to disbursement.",

        // Services Cards
        p_loan: "Personal Loans",
        p_loan_1: "Low Interest Rates",
        p_loan_2: "Flexible Tenure",
        p_loan_3: "Instant Disbursal",
        
        b_loan: "Business Loans",
        b_loan_1: "High Collateral Free Amount",
        b_loan_2: "GST Based Loans",
        b_loan_3: "Line of Credit",

        agent_prog: "Agent Program",
        agent_1: "Earn Commissions",
        agent_2: "Verified Partners",
        agent_3: "Dashboard Access",

        // Footer Services
        loan_app: "Loan Application",
        loan_track: "Loan Tracking",
        emi_pay: "EMI Payment",
        agent_supp: "Agent Support",
        fin_serv: "Financial Services",
        
        // Footer Support
        help_cen: "Help Center",
        contact_us: "Contact Us",
        faq: "FAQ",
        terms: "Terms of Service",
        
        // Footer Company
        about_us: "About Us",
        priv_pol: "Privacy Policy",
        careers: "Careers",
        blog: "Blog",
        
        copyright: "© 2026 ShriNeo Vittiyam. All rights reserved.",

        // KYC Page
        kyc_title: "KYC Verification",
        kyc_step: "Step 3: Identity Verification",
        kyc_aadhaar: "Aadhaar Card",
        kyc_pan: "PAN Card",
        kyc_liveness: "Live Liveness Check",
        kyc_complete: "Complete Registration",

        // Auth Titles
        welcome_back: "Welcome Back to ShriNeo",
        step1: "Step 1: Personal Details",
        step2: "Step 2: Verify details",
        mobile_otp: "Mobile OTP",
        email_otp: "Email OTP",
        verify_proceed: "Verify & Proceed to KYC"
    },
    hi: {
        brand: "श्रीनिओ वित्तियम",
        home: "होम",
        kyc: "केवाईसी सत्यापन",
        apply: "ऋण आवेदन",
        dash: "डैशबोर्ड",
        agent_dash: "एजेंट डैशबोर्ड",
        login: "लॉग इन",
        logout: "लॉग आउट",
        signup: "साइन अप",
        welcome: "आपकी वित्तीय/कानूनी यात्रा को सरल बनाना",
        features: "विशेषताएं",
        services: "सेवाएं",
        about: "हमारे बारे में",
        verify: "सत्यापित करें",

        // Home Page
        hero_title: "आपके सपने, हमारी <br>जिम्मेदारी",
        hero_tagline: "ग्राहकों के लिए निर्मित। एजेंटों के लिए डिज़ाइन किया गया। बैंकों द्वारा समर्थित। विश्वास द्वारा संचालित।",
        hero_subtitle: "आपकी सभी वित्तीय आवश्यकताओं के लिए भारत का एकमात्र मंच",
        apply_loan: "ऋण के लिए आवेदन करें →",
        track_loan: "अपना ऋण ट्रैक करें",
        check_score: "मुफ्त क्रेडिट स्कोर जांचें",

        // Form Placeholders & Labels
        email_addr: "ईमेल पता",
        email_ph: "name@example.com",
        password: "पासवर्ड",
        pass_ph: "••••••••",
        confirm_pass: "पासवर्ड की पुष्टि करें",
        first_name: "पहला नाम",
        middle_name: "मध्य नाम (वैकल्पिक)",
        last_name: "अंतिम नाम",
        phone: "फ़ोन नंबर",
        phone_ph: "+91 XXXXX XXXXX",
        verify_human: "सत्यापित करें कि आप मानव हैं",
        refresh_captcha: "कैप्चा रिफ्रेश करें",
        captcha_ph: "छवि से अक्षर दर्ज करें",
        next_verify: "अगला: सत्यापन →",
        already_acc: "क्या पहले से खाता है?",
        dont_have_acc: "खाता नहीं है?",
        signin_link: "साइन इन करें",
        signup_link: "साइन अप करें",

        // Features
        why_choose: "श्रीनिओ वित्तियम क्यों चुनें?",
        empowering: "सुलभ और पारदर्शी क्रेडिट के साथ भारत को सशक्त बनाना।",
        fast_app: "तेज़ स्वीकृति",
        fast_app_desc: "हमारे AI-संचालित जोखिम इंजन के साथ कुछ ही मिनटों में अपना ऋण स्वीकृत करवाएं।",
        secure: "सुरक्षित और निजी",
        secure_desc: "बैंक-ग्रेड एन्क्रिप्शन सुनिश्चित करता है कि आपका डेटा सुरक्षित और गोपनीय रहे।",
        multi: "बहुभाषी समर्थन",
        multi_desc: "बिना किसी बाधा के अपनी स्थानीय भाषा में वित्तीय सेवाओं का लाभ उठाएं।",
        digital: "100% डिजिटल",
        digital_desc: "आवेदन से संवितरण तक कागज रहित प्रक्रिया।",

        // Services Cards
        p_loan: "व्यक्तिगत ऋण",
        p_loan_1: "कम ब्याज दरें",
        p_loan_2: "लचीली अवधि",
        p_loan_3: "तत्काल वितरण",
        
        b_loan: "व्यापार ऋण",
        b_loan_1: "उच्च संपार्श्विक मुक्त राशि",
        b_loan_2: "जीएसटी आधारित ऋण",
        b_loan_3: "क्रेडिट लाइन",

        agent_prog: "एजेंट कार्यक्रम",
        agent_1: "कमीशन कमाएं",
        agent_2: "सत्यापित भागीदार",
        agent_3: "डैशबोर्ड एक्सेस",

        // Footer Services
        loan_app: "ऋण आवेदन",
        loan_track: "ऋण ट्रैकिंग",
        emi_pay: "ईएमआई भुगतान",
        agent_supp: "एजेंट सहायता",
        fin_serv: "वित्तीय सेवाएं",
        
        // Footer Support
        help_cen: "सहायता केंद्र",
        contact_us: "संपर्क करें",
        faq: "सामान्य प्रश्न",
        terms: "सेवा की शर्तें",
        
        // Footer Company
        about_us: "हमारे बारे में",
        priv_pol: "गोपनीयता नीति",
        careers: "करियर",
        blog: "ब्लॉग",
        
        copyright: "© 2026 श्रीनिओ वित्तियम। सर्वाधिकार सुरक्षित।",

        // KYC Page
        kyc_title: "केवाईसी सत्यापन",
        kyc_step: "चरण 3: पहचान सत्यापन",
        kyc_aadhaar: "आधार कार्ड",
        kyc_pan: "पैन कार्ड",
        kyc_liveness: "लाइव जाँच",
        kyc_complete: "पंजीकरण पूरा करें",

        // Auth Titles
        welcome_back: "श्रीनिओ में वापसी पर स्वागत है",
        step1: "चरण 1: व्यक्तिगत विवरण",
        step2: "चरण 2: विवरण सत्यापित करें",
        mobile_otp: "मोबाइल ओटीपी",
        email_otp: "ईमेल ओटीपी",
        verify_proceed: "सत्यापित करें और केवाईसी पर जाएं"
    },
    mr: {
        brand: "श्रीनिओ वितीयम",
        home: "होम",
        kyc: "केवायसी पडताळणी",
        apply: "कर्ज अर्ज",
        dash: "डॅशबोर्ड",
        agent_dash: "एजंट डॅशबोर्ड",
        login: "लॉग इन",
        logout: "लॉग आउट",
        signup: "साइन अप",
        welcome: "तुमचा आर्थिक/कायदेशीर प्रवास सोपा करणे",
        features: "वैशिष्ट्ये",
        services: "सेवा",
        about: "आमच्याबद्दल",
        verify: "सत्यापित करा",

        // Home Page
        hero_title: "तुमची स्वप्ने, आमची <br>जबाबदारी",
        hero_tagline: "ग्राहकांसाठी बनवलेले. एजंटसाठी डिझाइन केलेले. बँकांद्वारे समर्थित. विश्वासावर चालणारे.",
        hero_subtitle: "तुमच्या सर्व आर्थिक गरजांसाठी भारताचे एकमेव प्लॅटफॉर्म",
        apply_loan: "कर्जासाठी अर्ज करा →",
        track_loan: "तुमचे कर्ज ट्रॅक करा",
        check_score: "मोफत क्रेडिट स्कोर तपासा",

        // Form Placeholders & Labels
        email_addr: "ईमेल पत्ता",
        email_ph: "name@example.com",
        password: "पासवर्ड",
        pass_ph: "••••••••",
        confirm_pass: "पासवर्डची पुष्टी करा",
        first_name: "पहिले नाव",
        middle_name: "मधले नाव (पर्यायी)",
        last_name: "आडनाव",
        phone: "फोन नंबर",
        phone_ph: "+91 XXXXX XXXXX",
        verify_human: "तुम्ही माणूस आहात हे सत्यापित करा",
        refresh_captcha: "कॅप्चा रिफ्रेश करा",
        captcha_ph: "प्रतिमेतील अक्षरे टाका",
        next_verify: "पुढील: पडताळणी →",
        already_acc: "आधीच खाते आहे का?",
        dont_have_acc: "खाते नाही?",
        signin_link: "साइन इन करा",
        signup_link: "साइन अप करा",

        // Features
        why_choose: "श्रीनिओ वितीयम का निवडावे?",
        empowering: "सुलभ आणि पारदर्शक क्रेडिटसह भारताला सक्षम करणे.",
        fast_app: "जलद मंजुरी",
        fast_app_desc: "आमच्या AI-चलित जोखीम इंजिनसह काही मिनिटांत तुमचे कर्ज मंजूर करा.",
        secure: "सुरक्षित आणि खाजगी",
        secure_desc: "बँक-ग्रेड एन्क्रिप्शन तुमची माहिती सुरक्षित आणि गोपनीय ठेवते.",
        multi: "बहुभाषिक समर्थन",
        multi_desc: "कोणत्याही अडथळ्याशिवाय तुमच्या स्थानिक भाषेत आर्थिक सेवा मिळवा.",
        digital: "100% डिजिटल",
        digital_desc: "अर्जापासून वितरणापर्यंत पेपरलेस प्रक्रिया.",

        // Services Cards
        p_loan: "वैयक्तिक कर्ज",
        p_loan_1: "कमी व्याज दर",
        p_loan_2: "लवचिक कालावधी",
        p_loan_3: "त्वरित वितरण",
        
        b_loan: "व्यवसाय कर्ज",
        b_loan_1: "उच्च तारण मुक्त रक्कम",
        b_loan_2: "जीएसटी आधारित कर्ज",
        b_loan_3: "क्रेडिट लाइन",

        agent_prog: "एजंट प्रोग्राम",
        agent_1: "कमिशन कमवा",
        agent_2: "सत्यापित भागीदार",
        agent_3: "डॅशबोर्ड ऍक्सेस",

        // Footer Services
        loan_app: "कर्ज अर्ज",
        loan_track: "कर्ज ट्रॅकिंग",
        emi_pay: "ईएमआय पेमेंट",
        agent_supp: "एजंट सपोर्ट",
        fin_serv: "आर्थिक सेवा",
        
        // Footer Support
        help_cen: "मदत केंद्र",
        contact_us: "संपर्क साधा",
        faq: "सामान्य प्रश्न",
        terms: "सेवा अटी",
        
        // Footer Company
        about_us: "आमच्याबद्दल",
        priv_pol: "गोपनीयता धोरण",
        careers: "करिअर",
        blog: "ब्लॉग",
        
        copyright: "© 2026 श्रीनिओ वितीयम. सर्व हक्क राखीव.",

        // KYC Page
        kyc_title: "केवायसी पडताळणी",
        kyc_step: "चरण 3: ओळख पडताळणी",
        kyc_aadhaar: "आधार कार्ड",
        kyc_pan: "पॅन कार्ड",
        kyc_liveness: "लाइव्ह तपासणी",
        kyc_complete: "नोंदणी पूर्ण करा",

        // Auth Titles
        welcome_back: "श्रीनिओ मध्ये परत स्वागत आहे",
        step1: "चरण 1: वैयक्तिक तपशील",
        step2: "चरण 2: तपशील सत्यापित करा",
        mobile_otp: "मोबाईल ओटीपी",
        email_otp: "ईमेल ओटीपी",
        verify_proceed: "सत्यापित करा आणि केवायसी वर जा"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject Toggles into Navbar
    const nav = document.querySelector('.glass-nav');
    if (nav) {
        // Check if actions already exist to avoid double injection
        if (!document.querySelector('.nav-actions')) {
            const toggleContainer = document.createElement('div');
            toggleContainer.className = 'nav-actions';
            toggleContainer.style.position = 'relative'; // For dropdown positioning
            
            toggleContainer.innerHTML = `
                <button id="theme-toggle" class="icon-btn" title="Toggle Dark Mode" style="color: white;">🌙</button>
                <div class="lang-container" style="position: relative; display: inline-block;">
                    <button id="lang-toggle" class="icon-btn" title="Switch Language" style="color: white;">🌐</button>
                    <div id="lang-dropdown" class="lang-dropdown" style="display: none;">
                        <div class="lang-option" onclick="setLanguage('en')">English</div>
                        <div class="lang-option" onclick="setLanguage('hi')">हिंदी</div>
                        <div class="lang-option" onclick="setLanguage('mr')">मराठी</div>
                    </div>
                </div>
            `;
            nav.appendChild(toggleContainer);
        }

        // Event Listeners
        document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
        
        const langToggle = document.getElementById('lang-toggle');
        const langDropdown = document.getElementById('lang-dropdown');
        
        // Toggle Dropdown
        langToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = langDropdown.style.display === 'block';
            langDropdown.style.display = isVisible ? 'none' : 'block';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!langDropdown.contains(e.target) && e.target !== langToggle) {
                langDropdown.style.display = 'none';
            }
        });
    }

    // 2. Initialize Theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const btn = document.getElementById('theme-toggle');
        if(btn) btn.textContent = '☀️';
    }

    // 3. Initialize Language
    const savedLang = localStorage.getItem('lang') || 'en';
    applyLanguage(savedLang);
});

function toggleTheme() {
    console.log('Theme toggle clicked');
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    const btn = document.getElementById('theme-toggle');
    if(btn) btn.textContent = isDark ? '☀️' : '🌙';
}

// Global function to set language from dropdown
window.setLanguage = function(lang) {
    console.log('Language selected:', lang);
    localStorage.setItem('lang', lang);
    applyLanguage(lang);
    document.getElementById('lang-dropdown').style.display = 'none';
}

function applyLanguage(lang) {
    const t = translations[lang];
    if(!t) return;

    // 1. Data Attributes (Universal)
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(t[key]) {
            // Check if it's an Input (Placeholder)
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = t[key];
            } 
            // Check for HTML content
            else if (t[key].includes('<span') || t[key].includes('<br')) {
                el.innerHTML = t[key];
            } else {
                el.textContent = t[key];
            }
        }
    });

    // 2. Fallbacks for elements without attributes (Safe to enable now)
    const brand = document.querySelector('.logo span:not([data-i18n])');
    if(brand) brand.textContent = t.brand;
    
    // Explicitly target Hero H1 if it doesn't have data-i18n but matches structure
    const heroH1 = document.querySelector('.hero-content h1');
    if(heroH1 && !heroH1.hasAttribute('data-i18n')) {
        // Only translate if we have a valid translation for it
        // We assign data-i18n dynamically to prevent future overwrites
        heroH1.setAttribute('data-i18n', 'hero_title');
        heroH1.innerHTML = t.hero_title;
    }
}
