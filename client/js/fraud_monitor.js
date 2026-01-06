/**
 * fraud_monitor.js
 * "Invisible Security" Layer for ShriNeo Vittiyam
 * Tracks behavioral metrics to detect potential bot/fraud activity.
 */

const FRAUD_MONITOR = {
    startTime: Date.now(),
    signals: {
        paste_count: 0,
        tab_switches: 0,
        keystrokes: 0,
        backspaces: 0,
        time_to_fill: 0, // seconds
        device_hash: null,
        user_agent: navigator.userAgent,
        screen_res: `${window.screen.width}x${window.screen.height}`,
        is_bot: false
    },

    init: () => {
        console.log("🛡️ Fraud Monitor Active");
        FRAUD_MONITOR.startTime = Date.now();
        FRAUD_MONITOR.generateDeviceHash();
        FRAUD_MONITOR.attachListeners();
        
        // Expose globally
        window.FRAUD_SIGNALS = FRAUD_MONITOR.signals;
    },

    attachListeners: () => {
        // Track Focus Loss (Tab Switching)
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                FRAUD_MONITOR.signals.tab_switches++;
            }
        });

        // Track Input Behavior
        document.querySelectorAll("input, textarea").forEach(el => {
            el.addEventListener("paste", () => {
                FRAUD_MONITOR.signals.paste_count++;
                console.log("⚠️ Paste Detected");
            });

            el.addEventListener("keydown", (e) => {
                FRAUD_MONITOR.signals.keystrokes++;
                if (e.key === "Backspace" || e.key === "Delete") {
                    FRAUD_MONITOR.signals.backspaces++;
                }
            });
        });
    },

    generateDeviceHash: () => {
        // Simple synchronous hash of stable device identifiers
        const str = navigator.userAgent + 
                    navigator.language + 
                    window.screen.colorDepth + 
                    window.screen.width +
                    new Date().getTimezoneOffset();
        
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        FRAUD_MONITOR.signals.device_hash = Math.abs(hash).toString(16);
    },

    collect: () => {
        // Finalize Metrics
        const endTime = Date.now();
        FRAUD_MONITOR.signals.time_to_fill = Math.round((endTime - FRAUD_MONITOR.startTime) / 1000);
        
        // Basic Bot Check
        if (FRAUD_MONITOR.signals.time_to_fill < 5 && FRAUD_MONITOR.signals.keystrokes < 10) {
            FRAUD_MONITOR.signals.is_bot = true; 
        }

        return FRAUD_MONITOR.signals;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    FRAUD_MONITOR.init();
});
