document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('table-body');
    const userNameEl = document.getElementById('user-name');
    
    // Set User Name
    if (userNameEl) {
        userNameEl.textContent = localStorage.getItem('user_name') || "User";
    }

    try {
        const response = await APP.secureFetch(`${CONFIG.API_BASE_URL}/api/applications`);
        if (!response) return; // Auth failure
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const applications = await response.json();

        // Populate Table
        if (applications.length === 0) {
            if(tableBody) tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 1rem;">No applications found.</td></tr>';
        } else {
            if(tableBody) {
                tableBody.innerHTML = applications.map(app => {
                    const statusClass = app.status === 'Approved' ? 'approved' : 'pending';
                    const loanType = app.loanType || "Personal Loan"; 
                    
                    // Risk Score Badge
                    const riskScore = app.risk_score !== undefined ? app.risk_score : 15;
                    let riskLevelClass = 'risk-low';
                    if (riskScore > 60) riskLevelClass = 'risk-high';
                    else if (riskScore > 30) riskLevelClass = 'risk-medium';

                    return `
                        <tr>
                            <td style="font-family: monospace; color: var(--primary-color);">#${app.id}</td>
                            <td>${loanType}</td>
                            <td style="font-weight: 500;">₹${Number(app.amount).toLocaleString()}</td>
                            <td><span class="risk-badge ${riskLevelClass}">${riskScore}%</span></td>
                            <td><span class="badge ${statusClass}">${app.status}</span></td>
                            <td><a href="loan_tracking.html?id=${app.id}" style="color: var(--primary-color); text-decoration: none; font-weight: 500;">View &rarr;</a></td>
                        </tr>
                    `;
                }).join('');

                // Update Risk Widget with latest application data
                const latestApp = applications[0]; // Assuming newest is first or just pick one
                if (latestApp && document.getElementById('risk-score-value')) {
                    const rs = latestApp.risk_score !== undefined ? latestApp.risk_score : 15;
                    document.getElementById('risk-score-value').textContent = `${rs}/100`;
                    
                    const bar = document.getElementById('risk-progress-bar');
                    bar.style.width = `${rs}%`;
                    
                    const badge = document.getElementById('overall-risk-badge');
                    if (rs > 60) {
                        badge.textContent = "High Risk";
                        badge.className = "risk-badge risk-high";
                        bar.style.background = "#dc2626";
                    } else if (rs > 30) {
                        badge.textContent = "Medium Risk";
                        badge.className = "risk-badge risk-medium";
                        bar.style.background = "#ca8a04";
                    } else {
                        badge.textContent = "Low Risk";
                        badge.className = "risk-badge risk-low";
                        bar.style.background = "#16a34a";
                    }

                    // Check Verification Status
                    const isVer = document.getElementById('is-verified');
                    if (latestApp.verification && latestApp.verification.status === "Verified") {
                        isVer.textContent = "YES";
                        isVer.style.color = "#16a34a";
                    } else {
                        isVer.textContent = "NO";
                        isVer.style.color = "#dc2626";
                    }
                }
            }
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        if(tableBody) tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red; padding: 1rem;">Failed to load data: ${error.message}. Ensure backend is running.</td></tr>`;
    }
});
