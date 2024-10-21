// Mock data for feedback
const mockFeedback = [
    {
        id: 1,
        patientName: "John Smith",
        department: "Reception",
        rating: 4,
        date: "2024-10-20",
        status: "new",
        comment: "Great service at the reception"
    },
    {
        id: 2,
        patientName: "Sarah Johnson",
        department: "Nursing",
        rating: 5,
        date: "2024-10-19",
        status: "resolved",
        comment: "Nurses were very attentive"
    },
    {
        id: 3,
        patientName: "Michael Brown",
        department: "Doctors",
        rating: 3,
        date: "2024-10-18",
        status: "pending",
        comment: "Long waiting time"
    }
    // Add more mock data as needed
];

// Login handler
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Mock authentication - replace with real authentication
    if (username === "admin" && password === "password") {
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid credentials");
    }
}

// Initialize dashboard if on dashboard page
if (document.querySelector('.admin-container')) {
    initializeDashboard();
}

function initializeDashboard() {
    populateFeedbackTable(mockFeedback);
    setupSearchAndFilters();
}

function populateFeedbackTable(feedback) {
    const tableBody = document.getElementById('feedbackTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = feedback.map(item => `
        <tr>
            <td>${item.patientName}</td>
            <td>${item.department}</td>
            <td>
                ${generateStarRating(item.rating)}
            </td>
            <td>${formatDate(item.date)}</td>
            <td>
                <span class="status-badge status-${item.status}">
                    ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
            </td>
            <td>
                <button class="btn-secondary" onclick="viewFeedbackDetails(${item.id})">
                    View Details
                </button>
            </td>
        </tr>
    `).join('');
}

function generateStarRating(rating) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function setupSearchAndFilters() {
    const searchInput = document.getElementById('searchInput');
    const departmentFilter = document.getElementById('departmentFilter');
    const dateFilter = document.getElementById('dateFilter');

    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    if (departmentFilter) {
        departmentFilter.addEventListener('change', handleFilters);
    }

    if (dateFilter) {
        dateFilter.addEventListener('change', handleFilters);
    }
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredFeedback = mockFeedback.filter(item =>
        item.patientName.toLowerCase().includes(searchTerm) ||
        item.department.toLowerCase().includes(searchTerm)
    );
    populateFeedbackTable(filteredFeedback);
}

function handleFilters() {
    const department = document.getElementById('departmentFilter').value;
    const dateRange = document.getElementById('dateFilter').value;

    let filteredFeedback = mockFeedback;

    if (department) {
        filteredFeedback = filteredFeedback.filter(item =>
            item.department.toLowerCase() === department.toLowerCase()
        );
    }

    if (dateRange) {
        const today = new Date();
        const filteredDate = new Date();

        switch(dateRange) {
            case 'today':
                filteredFeedback = filteredFeedback.filter(item =>
                    new Date(item.date).toDateString() === today.toDateString()
                );
                break;
            case 'week':
                filteredDate.setDate(today.getDate() - 7);
                filteredFeedback = filteredFeedback.filter(item =>
                    new Date(item.date) >= filteredDate
                );
                break;
            case 'month':
                filteredDate.setMonth(today.getMonth() - 1);
                filteredFeedback = filteredFeedback.filter(item =>
                    new Date(item.date) >= filteredDate
                );
                break;
        }
    }

    populateFeedbackTable(filteredFeedback);
}

function viewFeedbackDetails(id) {
    const feedback = mockFeedback.find(item => item.id === id);
    if (feedback) {
        alert(`
            Patient: ${feedback.patientName}
            Department: ${feedback.department}
            Rating: ${feedback.rating}/5
            Date: ${formatDate(feedback.date)}
            Status: ${feedback.status}
            Comment: ${feedback.comment}
        `);
        // In a real application, you would show this in a modal or navigate to a details page
    }
}

// Update stats periodically
function updateDashboardStats() {
    // In a real application, this would fetch real-time data
    const stats = {
        totalFeedback: mockFeedback.length,
        averageRating: (mockFeedback.reduce((acc, curr) => acc + curr.rating, 0) / mockFeedback.length).toFixed(1),
        responseTime: '2.3',
        activeCases: mockFeedback.filter(item => item.status === 'pending').length
    };

    // Update stats display
    document.querySelectorAll('.stat-info p').forEach(stat => {
        const statType = stat.parentElement.querySelector('h3').textContent.toLowerCase();
        if (stats[statType]) {
            stat.textContent = stats[statType];
        }
    });
}

// Initialize stats update
if (document.querySelector('.dashboard-stats')) {
    updateDashboardStats();
    setInterval(updateDashboardStats, 30000); // Update every 30 seconds
}