document.addEventListener('DOMContentLoaded', () => {
    // Timer Logic
    const timers = document.querySelectorAll('.timer');
    
    timers.forEach(timer => {
        startTimer(timer, 30);
    });

    function startTimer(displayElement, duration) {
        let timer = duration;
        const interval = setInterval(() => {
            const minutes = parseInt(timer / 60, 10);
            const seconds = parseInt(timer % 60, 10);

            const displayMinutes = minutes < 10 ? "0" + minutes : minutes;
            const displaySeconds = seconds < 10 ? "0" + seconds : seconds;

            displayElement.textContent = `Resend in ${displayMinutes}:${displaySeconds}`;

            if (--timer < 0) {
                clearInterval(interval);
                displayElement.textContent = "Resend Code";
                displayElement.style.cursor = "pointer";
                displayElement.style.color = "var(--primary-color)";
                displayElement.style.fontWeight = "600";
                
                // Add click event to restart
                displayElement.onclick = () => {
                    displayElement.onclick = null; // Remove handler
                    displayElement.style.cursor = "default";
                    displayElement.style.color = "var(--text-muted)";
                    displayElement.style.fontWeight = "normal";
                    startTimer(displayElement, 30);
                };
            }
        }, 1000);
    }

    // Auto-focus next input (OTP behavior) - Optional enhancement
    // If you want standard OTP input behavior (auto-tabbing), we can add it here.
    // For now, keeping it simple as requested.
});
