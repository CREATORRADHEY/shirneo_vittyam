document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    // Create Mobile Toggle Button
    const toggleBtn = document.createElement('button');
    toggleBtn.innerHTML = '☰';
    toggleBtn.className = 'mobile-menu-btn';
    toggleBtn.style.cssText = `
        position: fixed;
        top: 1rem;
        left: 1rem;
        z-index: 200;
        background: #1e293b;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 1.5rem;
        cursor: pointer;
        display: none; /* Hidden on desktop */
    `;
    
    document.body.appendChild(toggleBtn);
    
    // Add Event Listener
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !toggleBtn.contains(e.target) &&
            sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
});
