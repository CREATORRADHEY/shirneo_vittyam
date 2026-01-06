const CONFIG = {
    API_BASE_URL: 'http://localhost:8000',
    // API_BASE_URL: 'https://api.shrineo.in', // Production URL example
    
    // Feature Flags
    ENABLE_DEMO_MODE: true,
    ENABLE_LOGS: true
};

// Freeze to prevent modification
Object.freeze(CONFIG);
