
document.addEventListener('DOMContentLoaded', () => {
    fetchLeads();
    setupIDCard();
    setupNavigation();
    initializeAgent();
});

function initializeAgent() {
    const storedId = localStorage.getItem('agentId');
    if(storedId && document.getElementById('agent-id-display')) {
        document.getElementById('agent-id-display').textContent = storedId;
    }
}

let allApplications = []; // Store fetched data

async function fetchLeads() {
    try {
        const response = await APP.secureFetch(`${CONFIG.API_BASE_URL}/api/applications`);
        if (!response) {
            // Mock Data if fetch fails or auth is bypassed locally (for demo)
            allApplications = [
                { fullName: "Rajesh Kumar", amount: "500000", status: "Approved", date: "2026-01-05" },
                { fullName: "Sunita Devi", amount: "20000", status: "Pending", date: "2026-01-06" }
            ];
        } else {
            allApplications = await response.json();
        }
        
        updateStats(allApplications);
        renderTable(allApplications, 'leads-table-body'); // Recent
        renderTable(allApplications, 'all-leads-table-body'); // All
    } catch (error) {
        console.error('Error fetching leads:', error);
    }
}

function setupNavigation() {
    document.querySelectorAll('.sidebar-link[data-view]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = link.dataset.view;
            switchView(viewName);
        });
    });
}

function switchView(viewName) {
    // Highlights sidebar
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`.sidebar-link[data-view="${viewName}"]`)?.classList.add('active');

    // Show/Hide Content
    document.querySelectorAll('.dashboard-view').forEach(view => {
        view.classList.add('hidden');
    });
    
    // Show selected
    const selectedView = document.getElementById(`view-${viewName}`);
    if(selectedView) {
        selectedView.classList.remove('hidden');
    }
}

function updateStats(applications) {
    const totalLeads = applications.length;
    const activeLeads = applications.filter(app => app.status === 'Approved').length;
    
    let totalCommission = 0;
    applications.forEach(app => {
        if(app.status === 'Approved') {
            const amount = parseFloat(app.amount) || 0;
            totalCommission += (amount * 0.02); // 2% commission
        }
    });

    const earningsEl = document.getElementById('total-earnings');
    const activeEl = document.getElementById('active-leads');
    
    if(earningsEl) earningsEl.textContent = `₹ ${totalCommission.toLocaleString('en-IN')}`;
    if(activeEl) activeEl.textContent = activeLeads;
}

function renderTable(applications, tableId) {
    const tbody = document.getElementById(tableId);
    if(!tbody) return;

    tbody.innerHTML = ''; 

    if(applications.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">No leads found. Start adding applications!</td></tr>';
        return;
    }

    applications.forEach(app => {
        const commission = app.status === 'Approved' ? `₹ ${(parseFloat(app.amount) * 0.02).toLocaleString('en-IN')}` : 'Pending';
        const badgeClass = app.status === 'Approved' ? 'status-approved' : 'status-pending';
        
        const row = `
            <tr>
                <td style="font-weight: 500;">${app.fullName}</td>
                <td>Personal Loan</td> 
                <td>₹ ${parseInt(app.amount).toLocaleString('en-IN')}</td>
                <td>${app.status}</td>
                <td><span class="status-badge ${badgeClass}">${app.status}</span></td>
                <td style="font-weight: 600; color: #15803d;">${commission}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function setupIDCard() {
    const btn = document.getElementById('download-id-btn');
    if(btn) {
        btn.addEventListener('click', () => {
            alert("Generating Sahayak ID Card... (Mock Download)");
        });
    }
}
