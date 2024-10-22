// Updated mock data structure to support multiple departments per patient
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
            }
        ],
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
        date: "2024-10-18",
        status: "pending"
    }
];

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
        // Get the first department to show initially
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

function viewFeedbackDetails(id) {
    const feedback = mockFeedback.find(item => item.id === id);
    if (feedback) {
        const departmentsInfo = feedback.departments.map(dept => 
            `\n${dept.name}:\nRating: ${dept.rating}/5\nComment: ${dept.comment}`
        ).join('\n');
        
        alert(`
Patient: ${feedback.patientName}
Date: ${formatDate(feedback.date)}
Status: ${feedback.status}

Departments Feedback:${departmentsInfo}
        `);
    }
}

function updateDashboardStats() {
    // Calculate total ratings across all departments
    const allRatings = mockFeedback.flatMap(item => 
        item.departments.map(dept => dept.rating)
    );
    
    const stats = {
        totalFeedback: mockFeedback.reduce((acc, curr) => acc + curr.departments.length, 0),
        averageRating: (allRatings.reduce((acc, curr) => acc + curr, 0) / allRatings.length).toFixed(1),
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