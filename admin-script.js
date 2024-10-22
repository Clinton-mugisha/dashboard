const mockFeedback = [
    {
        id: 1,
        patientName: "John Smith",
        departments: [
            {
                name: "Reception",
                rating: 4,
                comment: "Great service at the reception"
            },
            {
                name: "Nursing",
                rating: 5,
                comment: "Excellent nursing staff"
            },
            {
                name: "Triage",
                rating: 5,
                comment: "Excellent triage service"
            }
        ],
        recommendationScore: 9,
        date: "2024-10-20",
        status: "new"
    },
    {
        id: 2,
        patientName: "Sarah Johnson",
        departments: [
            {
                name: "Nursing",
                rating: 5,
                comment: "Nurses were very attentive"
            },
            {
                name: "Doctors",
                rating: 4,
                comment: "Doctor was thorough"
            }
        ],
        recommendationScore: 8,
        date: "2024-10-19",
        status: "resolved"
    },
    {
        id: 3,
        patientName: "Michael Brown",
        departments: [
            {
                name: "Doctors",
                rating: 3,
                comment: "Long waiting time"
            },
            {
                name: "Reception",
                rating: 4,
                comment: "Friendly reception"
            }
        ],
        recommendationScore: 6,
        date: "2024-10-18",
        status: "pending"
    }
];

function calculateDashboardStats() {
    // Calculate total feedback entries
    const totalFeedback = mockFeedback.reduce((acc, curr) => acc + curr.departments.length, 0);
    
    // Calculate average rating
    const allRatings = mockFeedback.flatMap(item => 
        item.departments.map(dept => dept.rating)
    );
    const averageRating = (allRatings.reduce((acc, curr) => acc + curr, 0) / allRatings.length).toFixed(1);
    
    // Calculate NPS
    const npsScores = mockFeedback.map(item => item.recommendationScore);
    const promoters = npsScores.filter(score => score >= 9).length;
    const detractors = npsScores.filter(score => score <= 6).length;
    const npsScore = Math.round(((promoters - detractors) / npsScores.length) * 100);
    
    // Calculate active cases
    const activeCases = mockFeedback.filter(item => item.status === "pending").length;

    return {
        totalFeedback,
        averageRating,
        npsScore,
        activeCases
    };
}

// Login handler remains the same
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

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

    tableBody.innerHTML = feedback.map(item => {
        const primaryDepartment = item.departments[0];
        
        return `
            <tr data-feedback-id="${item.id}">
                <td>${item.patientName}</td>
                <td>
                    <select class="department-selector" onchange="handleDepartmentChange(this, ${item.id})">
                        ${item.departments.map((dept, index) => `
                            <option value="${index}">${dept.name}</option>
                        `).join('')}
                    </select>
                </td>
                <td class="rating-cell">
                    ${generateStarRating(primaryDepartment.rating)}
                </td>
                <td class="nps-cell">
                    ${generateNPSDisplay(item.recommendationScore)}
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
        `;
    }).join('');
}

function handleDepartmentChange(selectElement, feedbackId) {
    const selectedIndex = selectElement.value;
    const feedback = mockFeedback.find(item => item.id === feedbackId);
    const selectedDepartment = feedback.departments[selectedIndex];
    
    // Update the rating display
    const row = selectElement.closest('tr');
    const ratingCell = row.querySelector('.rating-cell');
    ratingCell.innerHTML = generateStarRating(selectedDepartment.rating);
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
        item.departments.some(dept => 
            dept.name.toLowerCase().includes(searchTerm) ||
            dept.comment.toLowerCase().includes(searchTerm)
        )
    );
    populateFeedbackTable(filteredFeedback);
}

function handleFilters() {
    const department = document.getElementById('departmentFilter').value;
    const dateRange = document.getElementById('dateFilter').value;

    let filteredFeedback = mockFeedback;

    if (department) {
        filteredFeedback = filteredFeedback.filter(item =>
            item.departments.some(dept => 
                dept.name.toLowerCase() === department.toLowerCase()
            )
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

function generateNPSDisplay(score) {
    const npsClass = score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor';
    return `<span class="nps-score ${npsClass}">${score}/10</span>`;
}

function viewFeedbackDetails(id) {
    const feedback = mockFeedback.find(item => item.id === id);
    if (!feedback) return;

    const npsClass = feedback.recommendationScore >= 9 ? 'promoter' : 
                    feedback.recommendationScore >= 7 ? 'passive' : 'detractor';

    const generateStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <div class="patient-info">
            <div class="info-row">
                <div class="info-label">Patient Name</div>
                <div class="info-value">${feedback.patientName}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Date</div>
                <div class="info-value">${formatDate(feedback.date)}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Status</div>
                <div class="info-value">
                    <span class="status-badge status-${feedback.status}">
                        ${feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                    </span>
                </div>
            </div>
            <div class="info-row">
                <div class="info-label">Recommendation</div>
                <div class="info-value">
                    <span class="nps-score nps-${npsClass}">
                        ${feedback.recommendationScore}/10
                    </span>
                </div>
            </div>
        </div>

        <h3>Department Feedback</h3>
        <div class="departments-feedback">
            ${feedback.departments.map(dept => `
                <div class="department-card">
                    <div class="department-header">
                        <span class="department-name">${dept.name}</span>
                        <span class="rating-stars">${generateStars(dept.rating)}</span>
                    </div>
                    <p class="feedback-comment">${dept.comment}</p>
                </div>
            `).join('')}
        </div>
    `;

    const modal = document.getElementById('feedbackModal');
    modal.classList.add('modal-open');
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeFeedbackModal();
        }
    });
}

function closeFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    modal.classList.remove('modal-open');
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeFeedbackModal();
    }
});

function updateDashboardStats() {
    const stats = calculateDashboardStats();
    
    // Update DOM elements
    document.getElementById('totalFeedback').textContent = stats.totalFeedback;
    document.getElementById('averageRating').textContent = stats.averageRating;
    document.getElementById('npsScore').textContent = `${stats.npsScore}%`;
    document.getElementById('activeCases').textContent = stats.activeCases;
}

// Initialize stats on page load
document.addEventListener('DOMContentLoaded', () => {
    updateDashboardStats();
    // Update stats every 30 seconds
    setInterval(updateDashboardStats, 30000);
});