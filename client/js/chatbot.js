// chatbot.js - Enhanced AI Chatbot with Voice Support
// Features: Multilingual (Hindi/English), Voice Input, Voice Output

(function() {
    'use strict';

    const API_URL = `${CONFIG.API_BASE_URL}/api/chat/gemini`;
    
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;
    
    // Check if chatbot already exists
    if (document.getElementById('neo-chatbot-container')) return;

    // Multilingual text
    const TRANSLATIONS = {
        en: {
            greeting: "Namaste! 🙏 I'm Neo, your loan assistant. I can help you with:<br>• Loan information & eligibility<br>• Application process<br>• Navigating the app<br><br>How can I help you today?",
            placeholder: "Type or speak your question...",
            chatWithNeo: "Chat with Neo",
            online: "Online • AI Assistant",
            listening: "Listening...",
            speakNow: "Speak now...",
            errorConnect: "Sorry, I'm having trouble connecting. Please try again!",
            voiceNotSupported: "Voice not supported in this browser"
        },
        hi: {
            greeting: "नमस्ते! 🙏 मैं नियो हूं, आपका लोन सहायक। मैं इसमें मदद कर सकता हूं:<br>• लोन की जानकारी और पात्रता<br>• आवेदन प्रक्रिया<br>• ऐप नेविगेशन<br><br>मैं आज आपकी कैसे मदद कर सकता हूं?",
            placeholder: "अपना प्रश्न टाइप या बोलें...",
            chatWithNeo: "Neo से बात करें",
            online: "ऑनलाइन • AI सहायक",
            listening: "सुन रहा हूं...",
            speakNow: "अभी बोलें...",
            errorConnect: "माफ़ करें, कनेक्शन में समस्या है। कृपया पुनः प्रयास करें!",
            voiceNotSupported: "इस ब्राउज़र में वॉइस सपोर्ट नहीं है"
        }
    };

    // Get current language
    function getCurrentLang() {
        return localStorage.getItem('lang') || 'en';
    }

    function t(key) {
        const lang = getCurrentLang();
        return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key];
    }

    // Fallback responses when backend is not available
    const FALLBACK_RESPONSES = {
        loan: {
            en: "We offer Personal Loans (₹50,000 - ₹10 Lakh), Business Loans (₹1 Lakh - ₹50 Lakh), and an Agent Network Program. Interest rates start from 10.5% p.a. Would you like to know more about any of these?",
            hi: "हम पर्सनल लोन (₹50,000 - ₹10 लाख), बिजनेस लोन (₹1 लाख - ₹50 लाख), और एजेंट नेटवर्क प्रोग्राम प्रदान करते हैं। ब्याज दर 10.5% प्रति वर्ष से शुरू होती है। क्या आप इनमें से किसी के बारे में और जानना चाहेंगे?"
        },
        apply: {
            en: "To apply for a loan, click 'Get Started' on the homepage or navigate to the Apply page. You'll need to: 1) Sign up, 2) Verify OTP, 3) Complete KYC, 4) Fill the loan application.",
            hi: "लोन के लिए आवेदन करने के लिए, होमपेज पर 'Get Started' पर क्लिक करें। आपको: 1) साइन अप करना होगा, 2) OTP वेरीफाई करना होगा, 3) KYC पूरा करना होगा, 4) लोन आवेदन भरना होगा।"
        },
        eligibility: {
            en: "Eligibility: Age 21-60 years, Minimum income ₹15,000/month (salaried) or ₹2 Lakh/year (self-employed). Documents needed: Aadhaar, PAN, Bank statements, Salary slips.",
            hi: "पात्रता: आयु 21-60 वर्ष, न्यूनतम आय ₹15,000/माह (नौकरीपेशा) या ₹2 लाख/वर्ष (स्व-रोजगार)। दस्तावेज: आधार, पैन, बैंक स्टेटमेंट, सैलरी स्लिप।"
        },
        interest: {
            en: "Interest rates: Personal Loans 10.5% - 18% p.a., Business Loans 12% - 20% p.a. The exact rate depends on your credit profile and loan amount.",
            hi: "ब्याज दर: पर्सनल लोन 10.5% - 18% प्रति वर्ष, बिजनेस लोन 12% - 20% प्रति वर्ष। सटीक दर आपकी क्रेडिट प्रोफाइल और लोन राशि पर निर्भर करती है।"
        },
        default: {
            en: "I'm Neo, your loan assistant! I can help you with loan information, eligibility, interest rates, and the application process. What would you like to know?",
            hi: "मैं नियो हूं, आपका लोन सहायक! मैं लोन की जानकारी, पात्रता, ब्याज दर और आवेदन प्रक्रिया में मदद कर सकता हूं। आप क्या जानना चाहेंगे?"
        }
    };

    function getFallbackResponse(message) {
        const lang = getCurrentLang();
        const msg = message.toLowerCase();
        
        if (msg.includes('loan') || msg.includes('लोन') || msg.includes('ऋण')) {
            return FALLBACK_RESPONSES.loan[lang] || FALLBACK_RESPONSES.loan.en;
        } else if (msg.includes('apply') || msg.includes('आवेदन') || msg.includes('अप्लाई')) {
            return FALLBACK_RESPONSES.apply[lang] || FALLBACK_RESPONSES.apply.en;
        } else if (msg.includes('eligible') || msg.includes('पात्र') || msg.includes('योग्य') || msg.includes('document') || msg.includes('दस्तावेज')) {
            // Document questions also map to Eligibility fallback which lists documents
            return FALLBACK_RESPONSES.eligibility[lang] || FALLBACK_RESPONSES.eligibility.en;
        } else if (msg.includes('interest') || msg.includes('ब्याज') || msg.includes('rate')) {
            return FALLBACK_RESPONSES.interest[lang] || FALLBACK_RESPONSES.interest.en;
        }
        return FALLBACK_RESPONSES.default[lang] || FALLBACK_RESPONSES.default.en;
    }

    // Inject Chatbot HTML with voice button
    const chatbotHTML = `
        <div id="neo-chatbot-container" class="neo-chatbot-container neo-hidden">
            <div class="neo-chat-header">
                <div class="neo-chat-title">
                    <div class="neo-avatar">🤖</div>
                    <div>
                        <strong>Neo</strong>
                        <span class="neo-status" id="neo-status">${t('online')}</span>
                    </div>
                </div>
                <div class="neo-header-actions">
                    <button id="neo-stop-speech" class="neo-stop-btn" title="Stop Speaking" style="display: none;">⏹</button>
                    <button id="neo-lang-toggle" class="neo-lang-btn" title="Switch Language">🌐</button>
                    <button id="neo-close-chat" class="neo-close-btn">✕</button>
                </div>
            </div>
            <div id="neo-chat-messages" class="neo-chat-messages">
                <div class="neo-message neo-bot-message">
                    <div class="neo-msg-avatar">🤖</div>
                    <div class="neo-msg-content">${t('greeting')}</div>
                </div>
            </div>
            <div class="neo-chat-input-area">
                <input type="text" id="neo-chat-input" placeholder="${t('placeholder')}" autocomplete="off">
                <button id="neo-voice-btn" class="neo-voice-btn" title="Voice Input">
                    <svg class="neo-mic-svg" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                        <path fill="currentColor" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                </button>
                <button id="neo-send-btn" class="neo-send-btn">➤</button>
            </div>
        </div>
        <button id="neo-chat-toggle" class="neo-chat-toggle">
            <span class="neo-toggle-icon">💬</span>
            <span class="neo-toggle-text">${t('chatWithNeo')}</span>
        </button>
    `;

    // Inject Chatbot Styles
    const chatbotStyles = `
        <style>
            .neo-chatbot-container {
                position: fixed;
                bottom: 100px;
                right: 20px;
                width: 380px;
                max-width: calc(100vw - 40px);
                height: 520px;
                max-height: calc(100vh - 140px);
                background: var(--white, #ffffff);
                border-radius: 16px;
                box-shadow: 0 10px 50px rgba(0,0,0,0.15);
                display: flex;
                flex-direction: column;
                z-index: 10000;
                overflow: hidden;
                transition: all 0.3s ease;
                border: 1px solid rgba(0,0,0,0.05);
            }

            body.dark-mode .neo-chatbot-container {
                background: #1E293B;
                border-color: rgba(255,255,255,0.1);
            }

            .neo-chatbot-container.neo-hidden {
                opacity: 0;
                transform: translateY(20px) scale(0.95);
                pointer-events: none;
            }

            .neo-chat-header {
                background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%);
                color: white;
                padding: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .neo-chat-title {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .neo-avatar {
                width: 40px;
                height: 40px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
            }

            .neo-status {
                font-size: 0.75rem;
                opacity: 0.8;
                display: block;
            }

            .neo-header-actions {
                display: flex;
                gap: 8px;
            }

            .neo-close-btn, .neo-lang-btn {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1rem;
                transition: background 0.2s;
            }

            .neo-close-btn:hover, .neo-lang-btn:hover, .neo-stop-btn:hover {
                background: rgba(255,255,255,0.3);
            }

            .neo-stop-btn {
                background: #EF4444;
                border: none;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 0.8rem;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                border: 1px solid rgba(255,255,255,0.2);
            }

            .neo-stop-btn:hover {
                transform: scale(1.1);
                background: #DC2626;
            }

            .neo-chat-messages {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 16px;
                background: var(--bg-color, #f8fafc);
            }

            body.dark-mode .neo-chat-messages {
                background: #0F172A;
            }

            .neo-message {
                display: flex;
                gap: 10px;
                max-width: 90%;
            }

            .neo-bot-message {
                align-self: flex-start;
            }

            .neo-user-message {
                align-self: flex-end;
                flex-direction: row-reverse;
            }

            .neo-msg-avatar {
                width: 32px;
                height: 32px;
                background: #e2e8f0;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.9rem;
                flex-shrink: 0;
            }

            body.dark-mode .neo-msg-avatar {
                background: #334155;
            }

            .neo-user-message .neo-msg-avatar {
                background: #2563EB;
            }

            .neo-msg-content {
                background: white;
                padding: 12px 16px;
                border-radius: 16px;
                border-top-left-radius: 4px;
                color: var(--text-main, #1E293B);
                font-size: 0.95rem;
                line-height: 1.5;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }

            body.dark-mode .neo-msg-content {
                background: #1E293B;
                color: #F1F5F9;
            }

            .neo-user-message .neo-msg-content {
                background: #2563EB;
                color: white;
                border-top-left-radius: 16px;
                border-top-right-radius: 4px;
            }

            .neo-chat-input-area {
                padding: 12px 16px;
                background: white;
                border-top: 1px solid #e2e8f0;
                display: flex;
                gap: 8px;
                align-items: center;
            }

            body.dark-mode .neo-chat-input-area {
                background: #1E293B;
                border-top-color: #334155;
            }

            #neo-chat-input {
                flex: 1;
                padding: 12px 16px;
                border: 1px solid #e2e8f0;
                border-radius: 24px;
                outline: none;
                font-size: 0.95rem;
                background: var(--bg-color, #f8fafc);
                color: var(--text-main, #1E293B);
            }

            body.dark-mode #neo-chat-input {
                background: #0F172A;
                border-color: #334155;
                color: #F1F5F9;
            }

            #neo-chat-input:focus {
                border-color: #2563EB;
            }

            .neo-send-btn {
                width: 44px;
                height: 44px;
                background: #2563EB;
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.1rem;
                transition: all 0.2s;
            }

            .neo-send-btn:hover {
                background: #1E40AF;
                transform: scale(1.05);
            }

            .neo-send-btn:disabled {
                background: #94a3b8;
                cursor: not-allowed;
            }

            .neo-voice-btn {
                width: 44px;
                height: 44px;
                background: #10B981;
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
            }

            .neo-mic-svg {
                width: 20px;
                height: 20px;
            }

            .neo-voice-btn:hover {
                background: #059669;
                transform: scale(1.08) rotate(-5deg);
                box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3);
            }

            .neo-voice-btn.neo-listening {
                background: #EF4444;
                animation: neo-pulse 1s infinite;
            }

            @keyframes neo-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            .neo-chat-toggle {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%);
                color: white;
                border: none;
                padding: 14px 24px;
                border-radius: 30px;
                cursor: pointer;
                font-size: 1rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
                transition: all 0.3s;
                z-index: 9999;
            }

            .neo-chat-toggle:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(37, 99, 235, 0.5);
            }

            .neo-toggle-icon {
                font-size: 1.2rem;
            }

            .neo-typing {
                display: flex;
                gap: 4px;
                padding: 8px 0;
            }

            .neo-typing span {
                width: 8px;
                height: 8px;
                background: #64748b;
                border-radius: 50%;
                animation: neo-bounce 1.4s infinite ease-in-out;
            }

            .neo-typing span:nth-child(1) { animation-delay: 0s; }
            .neo-typing span:nth-child(2) { animation-delay: 0.2s; }
            .neo-typing span:nth-child(3) { animation-delay: 0.4s; }

            @keyframes neo-bounce {
                0%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-6px); }
            }

            /* Speaker icon for bot messages */
            .neo-speak-btn {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 1rem;
                opacity: 0.6;
                margin-left: 8px;
                transition: opacity 0.2s;
            }

            .neo-speak-btn:hover {
                opacity: 1;
            }

            @media (max-width: 480px) {
                .neo-chatbot-container {
                    width: calc(100vw - 20px);
                    right: 10px;
                    bottom: 80px;
                    height: calc(100vh - 100px);
                }

                .neo-toggle-text {
                    display: none;
                }

                .neo-chat-toggle {
                    padding: 14px;
                    border-radius: 50%;
                }
            }
        </style>
    `;

    // Append to body
    document.body.insertAdjacentHTML('beforeend', chatbotStyles);
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    // Get elements
    const chatContainer = document.getElementById('neo-chatbot-container');
    const toggleBtn = document.getElementById('neo-chat-toggle');
    const closeBtn = document.getElementById('neo-close-chat');
    const messagesContainer = document.getElementById('neo-chat-messages');
    const chatInput = document.getElementById('neo-chat-input');
    const sendBtn = document.getElementById('neo-send-btn');
    const voiceBtn = document.getElementById('neo-voice-btn');
    const langToggle = document.getElementById('neo-lang-toggle');
    const statusEl = document.getElementById('neo-status');
    const stopSpeechBtn = document.getElementById('neo-stop-speech');

    // Voice state
    let isListening = false;
    let isWakeWordMode = false;
    let recognition = null;
    let wakeWordRecognition = null;
    let preferredVoice = null;

    // Load preferred voice for TTS
    function loadVoices() {
        if (!SpeechSynthesis) return;
        const voices = SpeechSynthesis.getVoices();
        const lang = getCurrentLang();
        
        // Find voice for current language
        if (lang === 'hi') {
            preferredVoice = voices.find(v => v.lang.includes('hi')) || 
                             voices.find(v => v.lang.includes('en'));
        } else {
            preferredVoice = voices.find(v => v.name.includes('Google UK English Female')) ||
                             voices.find(v => v.lang.startsWith('en')) ||
                             voices[0];
        }
    }

    if (SpeechSynthesis) {
        loadVoices();
        SpeechSynthesis.onvoiceschanged = loadVoices;
    }

    // Toggle chat visibility
    toggleBtn.addEventListener('click', () => {
        chatContainer.classList.toggle('neo-hidden');
        updateWakeWordState();
        if (!chatContainer.classList.contains('neo-hidden')) {
            chatInput.focus();
        }
    });

    closeBtn.addEventListener('click', () => {
        chatContainer.classList.add('neo-hidden');
        updateWakeWordState();
    });

    // Language toggle
    langToggle.addEventListener('click', () => {
        const currentLang = getCurrentLang();
        const newLang = currentLang === 'en' ? 'hi' : 'en';
        localStorage.setItem('lang', newLang);
        
        // Update UI
        chatInput.placeholder = t('placeholder');
        statusEl.textContent = t('online');
        loadVoices();
        
        // Add language change message
        addMessage(newLang === 'hi' ? 'भाषा हिंदी में बदल गई 🇮🇳' : 'Language changed to English 🇬🇧', 'bot');
    });

    // Check if we're on a secure context (HTTPS or localhost)
    const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';

    // --- Voice Input Logic (Speech-to-Text) ---
    function startVoiceInput() {
        if (!SpeechRecognition) {
            addMessage(t('voiceNotSupported'), 'bot');
            return;
        }
        
        if (!isSecureContext) {
            addMessage('Voice input requires HTTPS or localhost.', 'bot');
            return;
        }
        
        if (isListening) {
            stopVoiceInput();
            return;
        }

        // Cancel any ongoing speech first
        if (SpeechSynthesis && SpeechSynthesis.speaking) {
            SpeechSynthesis.cancel();
        }
        
        // Stop wake word if it's running - and WAIT a bit for hardware release
        if (wakeWordRecognition) {
            try { 
                wakeWordRecognition.abort(); // abort is faster than stop
            } catch(e) {}
        }

        // Small delay to allow hardware release
        setTimeout(() => {
            try {
                if (recognition) {
                    try { recognition.abort(); } catch(e) {}
                }
                
                // Set listening state BEFORE creating instance to block wake word restart
                isListening = true;
                
                recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = true;
                recognition.lang = getCurrentLang() === 'hi' ? 'hi-IN' : 'en-US';
                
                recognition.onstart = () => {
                    if (voiceBtn) {
                        voiceBtn.classList.add('neo-listening');
                    }
                    statusEl.textContent = t('listening');
                };
                
                recognition.onresult = (event) => {
                    let transcript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        transcript += event.results[i][0].transcript;
                    }
                    chatInput.value = transcript;
                    
                    if (event.results[event.results.length - 1].isFinal) {
                        setTimeout(() => {
                            if (chatInput.value.trim()) {
                                sendMessage();
                            }
                        }, 300);
                    }
                };
                
                recognition.onerror = (event) => {
                    console.error('Speech recognition error:', event.error);
                    if (event.error === 'not-allowed') {
                        addMessage('🎤 Please allow microphone access to use voice input.', 'bot');
                    } else if (event.error !== 'aborted') {
                        addMessage('Voice recognition error. Please try again.', 'bot');
                    }
                    stopVoiceInput();
                };
                
                recognition.onend = () => {
                    stopVoiceInput();
                };

                try {
                    recognition.start();
                } catch (e) {
                    console.error('Recognition start failed:', e);
                    if (e.name !== 'InvalidStateError') {
                        stopVoiceInput();
                    }
                }
            } catch (e) {
                console.error('Could not create/start voice recognition:', e);
                stopVoiceInput();
            }
        }, 400); // Slightly longer delay for stability
    }
    
    function stopVoiceInput() {
        isListening = false;
        if (voiceBtn) {
            voiceBtn.classList.remove('neo-listening');
        }
        statusEl.textContent = t('online');
        if (recognition) {
            try {
                recognition.stop();
            } catch (e) {}
        }
        // Resume wake word detection if it's supposed to be active (chat open)
        if (isWakeWordMode && !chatContainer.classList.contains('neo-hidden')) {
            setTimeout(() => {
                if (isWakeWordMode && !chatContainer.classList.contains('neo-hidden')) {
                    try { wakeWordRecognition.start(); } catch(e) {}
                }
            }, 500);
        }
    }
    
    // Add voice button event listener
    if (voiceBtn) {
        voiceBtn.addEventListener('click', startVoiceInput);
    }
    
    // --- Wake Word Logic (Hi Neo) ---
    function startWakeWordDetection() {
        if (!SpeechRecognition || !isSecureContext) return;

        wakeWordRecognition = new SpeechRecognition();
        wakeWordRecognition.continuous = true;
        wakeWordRecognition.interimResults = false;
        wakeWordRecognition.lang = 'en-US'; // Listen for "Hi Neo" in English primarily

        wakeWordRecognition.onresult = (event) => {
            const lastResultIndex = event.results.length - 1;
            const transcript = event.results[lastResultIndex][0].transcript.toLowerCase().trim();
            console.log("Wake word heard:", transcript);

            if (transcript.includes('neo') || transcript.includes('niyo') || transcript.includes('hello')) {
                // Wake word detected!
                if (chatContainer.classList.contains('neo-hidden')) {
                    chatContainer.classList.remove('neo-hidden');
                    const greetMsg = getCurrentLang() === 'hi' ? "नमस्ते! मैं सुन रहा हूं।" : "Hi there! I'm listening...";
                    addMessage("👋 " + greetMsg, 'bot');
                    speak(greetMsg);
                }
            }
        };

        wakeWordRecognition.onstart = () => {
            if (voiceIndicator) {
                voiceIndicator.classList.remove('neo-hidden');
                voiceIndicator.classList.add('neo-listening');
            }
        };

        wakeWordRecognition.onerror = (e) => {
            console.log("Wake word error (ignoring):", e.error);
        };

        wakeWordRecognition.onend = () => {
            // Auto-restart wake word detection only if not manually listening
            if (isWakeWordMode && !isListening) {
                try {
                    wakeWordRecognition.start();
                } catch(e) {}
            }
        };

        try {
            wakeWordRecognition.start();
            isWakeWordMode = true;
            console.log("Wake word detection started");
        } catch (e) {
            console.error("Could not start wake word detection", e);
        }
    }

    // Wake word detection only happens when chat is visible
    function updateWakeWordState() {
        if (!chatContainer.classList.contains('neo-hidden') && isSecureContext && SpeechRecognition) {
            if (!isWakeWordMode) startWakeWordDetection();
        } else {
            stopWakeWordDetection(false);
        }
    }

    function stopWakeWordDetection(permanent = false) {
        if (permanent) isWakeWordMode = false;
        if (wakeWordRecognition) {
            try {
                wakeWordRecognition.stop();
            } catch(e) {}
        }
    }

    // Wake word button removed as per user request

    // Text-to-Speech
    function speak(text) {
        if (!SpeechSynthesis) return;
        
        // Cancel any ongoing speech
        SpeechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0; // Slightly faster for responsiveness
        utterance.pitch = 1.1; // Friendly tone
        utterance.volume = 1.0;
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        // Set language
        utterance.lang = getCurrentLang() === 'hi' ? 'hi-IN' : 'en-US';

        utterance.onstart = () => {
            // Stop wake word if it's running while bot is talking
            stopWakeWordDetection();
            if (stopSpeechBtn) stopSpeechBtn.style.display = 'flex';
        };

        utterance.onend = () => {
            if (stopSpeechBtn) stopSpeechBtn.style.display = 'none';
            // After speaking, if we were in voice mode, start listening again
            if (isWakeWordMode) {
                // Return to wake word mode first, then wait for trigger? 
                // Or start listening for user input directly?
                // User said "fixed in chatbot but whole site not triggering"
                // So let's resume wake word detection after speaking.
                setTimeout(() => {
                    // Re-initialize wake word detection
                    if (!chatContainer.classList.contains('neo-hidden')) {
                        // If chat is open, maybe start voice input directly?
                        // Let's go back to wake word for consistency
                    }
                    if (isWakeWordMode) {
                         try { wakeWordRecognition.start(); } catch(e) {}
                    }
                }, 500);
            }
        };

        SpeechSynthesis.speak(utterance);
    }

    // Handle navigation commands from AI
    function handleNavigation(path) {
        if (!path) return;
        
        // Close the chatbot before navigating
        chatContainer.classList.add('neo-hidden');
        
        // Small delay for smooth transition
        setTimeout(() => {
            if (path.startsWith('#')) {
                // Scroll to element
                const element = document.querySelector(path);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                // Navigate to page
                window.location.href = path;
            }
        }, 300);
    }

    // Send message
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, 'user');
        chatInput.value = '';
        sendBtn.disabled = true;

        // Show typing indicator
        const typingId = showTyping();

        try {
            // Call backend API
            console.log("Sending message to backend:", message);
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    language: getCurrentLang()
                })
            });

            console.log("Backend response status:", response.status);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            console.log("Backend data received:", data);
            
            removeTyping(typingId);
            
            // Handle Navigation Command
            if (data.navigation) {
                console.log("Navigating to:", data.navigation);
                handleNavigation(data.navigation);
            }

            // Show Response
            addMessage(data.response, 'bot');
            speak(data.response);

        } catch (error) {
            console.error('Chat error details:', error);
            removeTyping(typingId);
            
            // Use fallback response
            const fallbackResponse = getFallbackResponse(message);
            addMessage(fallbackResponse, 'bot');
            speak(fallbackResponse);
        }

        sendBtn.disabled = false;
    }

    function addMessage(text, type, addSpeaker = false) {
        const avatar = type === 'bot' ? '🤖' : '👤';
        const speakerBtn = (type === 'bot' && addSpeaker && SpeechSynthesis) 
            ? `<button class="neo-speak-btn" onclick="window.neoSpeak('${text.replace(/'/g, "\\'")}')">🔊</button>` 
            : '';
        
        const messageHTML = `
            <div class="neo-message neo-${type}-message">
                <div class="neo-msg-avatar">${avatar}</div>
                <div class="neo-msg-content">${text}${speakerBtn}</div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Global speak function for speaker button
    window.neoSpeak = function(text) {
        speak(text);
    };

    // Global voice assistant trigger
    window.startNeoVoice = function() {
        if (chatContainer.classList.contains('neo-hidden')) {
            chatContainer.classList.remove('neo-hidden');
            updateWakeWordState();
        }
        addMessage("👋 Namaste! I'm listening...", 'bot');
        speak(getCurrentLang() === 'hi' ? "नमस्ते! मैं सुन रहा हूं।" : "Namaste! I'm listening.");
        
        // Start voice input after a short delay to let the bot finish greeting or at least start it
        setTimeout(() => {
            startVoiceInput();
        }, 1000);
    };

    function showTyping() {
        const id = 'typing-' + Date.now();
        const typingHTML = `
            <div class="neo-message neo-bot-message" id="${id}">
                <div class="neo-msg-avatar">🤖</div>
                <div class="neo-msg-content">
                    <div class="neo-typing">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return id;
    }

    function removeTyping(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    // Stop speech button
    if (stopSpeechBtn) {
        stopSpeechBtn.addEventListener('click', () => {
            if (SpeechSynthesis) {
                SpeechSynthesis.cancel();
                stopSpeechBtn.style.display = 'none';
                // Resume wake word detection if we were in voice mode
                if (isWakeWordMode) {
                    setTimeout(() => {
                        updateWakeWordState();
                    }, 100);
                }
            }
        });
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    console.log('💬 Neo Chatbot initialized with voice support');
})();
