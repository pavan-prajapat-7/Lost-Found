// Modal functions
function openLostItemModal() {
    const modal = document.getElementById('lostItemModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // IMPORTANT: Clear editing state and reset form for a new submission
    editingItem = null; 
    document.getElementById('lostItemForm').reset();
    removePhoto();

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('lostDate').value = today;

    // Set modal title and submit button for new item submission
    modal.querySelector('.modal-header h2').textContent = 'Report Lost Item'; 
    const submitButton = document.getElementById('lostItemForm').querySelector('button[type="submit"]');
    // submitButton.textContent = 'Submit Report'; // Keep text, but remove onclick
    // submitButton.onclick = handleLostItemSubmit; // REMOVE THIS LINE
}

function closeLostItemModal() {
    const modal = document.getElementById('lostItemModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset form and editing state
        document.getElementById('lostItemForm').reset();
        removePhoto();
        editingItem = null; // Ensure editing item state is cleared

        // Revert button text and handler for next new item submission (redundant, but safe)
        modal.querySelector('.modal-header h2').textContent = 'Report Lost Item'; 
        const submitButton = document.getElementById('lostItemForm').querySelector('button[type="submit"]');
        submitButton.textContent = 'Submit Report'; 
    }
}

function previewPhoto(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('previewImage').src = e.target.result;
            document.getElementById('photoPreview').style.display = 'inline-block';
            document.querySelector('#lostItemModal .upload-placeholder').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

function removePhoto() {
    document.getElementById('itemPhoto').value = '';
    document.getElementById('photoPreview').style.display = 'none';
    document.querySelector('#lostItemModal .upload-placeholder').style.display = 'block';
}

// Found Item Modal functions
function openFoundItemModal() {
    const modal = document.getElementById('foundItemModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // IMPORTANT: Clear editing state and reset form for a new submission
    editingItem = null;
    document.getElementById('foundItemForm').reset();
    removeFoundPhoto();

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('foundDate').value = today;

    // Set modal title and submit button for new item submission
    modal.querySelector('.modal-header h2').textContent = 'Report Found Item'; 
    const submitButton = document.getElementById('foundItemForm').querySelector('button[type="submit"]');
    // submitButton.textContent = 'Submit Report'; // Keep text, but remove onclick
    // submitButton.onclick = handleFoundItemSubmit; // REMOVE THIS LINE
}

function closeFoundItemModal() {
    const modal = document.getElementById('foundItemModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';

        // Reset form and editing state
        document.getElementById('foundItemForm').reset();
        removeFoundPhoto();
        editingItem = null; // Ensure editing item state is cleared

        // Revert button text and handler for next new item submission (redundant, but safe)
        modal.querySelector('.modal-header h2').textContent = 'Report Found Item'; 
        const submitButton = document.getElementById('foundItemForm').querySelector('button[type="submit"]');
        submitButton.textContent = 'Submit Report'; 
    }
}

function previewFoundPhoto(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('foundPreviewImage').src = e.target.result;
            document.getElementById('foundPhotoPreview').style.display = 'inline-block';
            document.querySelector('#foundItemModal .upload-placeholder').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

function removeFoundPhoto() {
    document.getElementById('foundItemPhoto').value = '';
    document.getElementById('foundPhotoPreview').style.display = 'none';
    document.querySelector('#foundItemModal .upload-placeholder').style.display = 'block';
}

// Storage for lost and found items - MOVED TO GLOBAL SCOPE
let lostItems = [];
let foundItems = [];

// API base (dev: localhost; change to your deployed API URL in prod)
const API_BASE = (() => {
  if (location.protocol === 'file:') return 'http://localhost:5000';
  const h = location.hostname || '';
  if (h === 'localhost' || h.startsWith('127.')) return 'http://localhost:5000';
  return 'https://api.example.com'; // TODO: set your production API URL when deploying
})();

function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

function getAuthToken() {
  const u = getCurrentUser();
  return u && u.token ? u.token : null;
}

async function apiFetch(path, options = {}) {
  const headers = Object.assign({}, options.headers || {});
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!headers['Content-Type'] && options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const resp = await fetch(`${API_BASE}${path}`, Object.assign({}, options, { headers }));
  return resp;
}

// Inline SVG placeholders to avoid external network calls
const LOST_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect width="100%" height="100%" fill="%23ff6b6b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="20" fill="%23ffffff">Lost</text></svg>';
const FOUND_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect width="100%" height="100%" fill="%2328a745"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="20" fill="%23ffffff">Found</text></svg>';

function fillFoundItemForm(item) {
    const foundItemModal = document.getElementById('foundItemModal');
    foundItemModal.querySelector('.modal-header h2').textContent = 'Edit Found Item';

    document.getElementById('foundItemName').value = item.name;
    document.getElementById('foundItemDescription').value = item.description;
    document.getElementById('foundItemCategory').value = item.category;
    document.getElementById('foundLocation').value = item.location;
    document.getElementById('foundDate').value = item.date;
    document.getElementById('foundTime').value = item.time || '';
    document.getElementById('finderName').value = item.finderName || '';
    document.getElementById('finderContact').value = item.finderContact || '';
    document.getElementById('finderEmail').value = item.finderEmail || '';
    document.getElementById('itemCondition').value = item.condition || '';
    document.getElementById('additionalFoundInfo').value = item.additionalInfo || '';
    const hvFound = document.getElementById('foundHighValue');
    if (hvFound) hvFound.checked = !!item.highValue;
    
    // Reset file input and show existing preview if any
    const fileInput = document.getElementById('foundItemPhoto');
    if (fileInput) fileInput.value = '';
    const previewImg = document.getElementById('foundPreviewImage');
    const previewContainer = document.getElementById('foundPhotoPreview');
    const uploadPlaceholder = document.querySelector('#foundItemModal .upload-placeholder');
    if (item.photo) {
        previewImg.src = item.photo;
        previewContainer.style.display = 'inline-block';
        uploadPlaceholder.style.display = 'none';
    } else {
        previewImg.src = '';
        previewContainer.style.display = 'none';
        uploadPlaceholder.style.display = 'block';
    }

    // Change submit button behavior for edit
    const submitButton = document.getElementById('foundItemForm').querySelector('button[type="submit"]');
    submitButton.textContent = 'Update Item';

    // Set global editing item
    editingItem = { id: item.id, itemType: 'found' };
}

// Navigation and Header Functions
function navigateToSection(section, ev) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Add active class based on link href or the event target when available
    if (ev && ev.currentTarget) {
        ev.currentTarget.classList.add('active');
        if (ev.preventDefault) ev.preventDefault();
    } else {
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href') || '';
            if (href === '#' + section) {
                link.classList.add('active');
            }
        });
    }
    
    // Handle different sections
    switch(section) {
        case 'home':
            showSection('hero-section'); // Explicitly show home section
            window.scrollTo({ top: 0, behavior: 'smooth' });
            break;
        case 'found-items':
            showSection('items-section'); // Explicitly show found items section
            scrollToFoundItems();
            break;
        case 'dashboard':
            showSection('dashboard'); // Explicitly show dashboard section
            showDashboard();
            break;
        case 'profile':
            showDashboard();
            showDashboardTab('profile');
            break;
        case 'my-items':
            showDashboard();
            showDashboardTab('my-items');
            break;
        case 'notifications':
            showDashboard();
            showDashboardTab('claims');
            break;
        case 'settings':
            showDashboard();
            showDashboardTab('settings');
            break;
    }
}

// Helper function to show only one main section and hide others
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        if (section.id === sectionId) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
    // Specific handling for lost-items-section, which is usually tied to search/found items area
    // We need to ensure lost-items-section is visible if it's part of the main content flow
    // And hidden if we go to dashboard or modals.
    if (sectionId === 'hero-section' || sectionId === 'items-section') {
        document.querySelector('.lost-items-section').style.display = 'block';
        document.querySelector('.search-section').style.display = 'block';
    } else {
        document.querySelector('.lost-items-section').style.display = 'none';
        document.querySelector('.search-section').style.display = 'none';
    }
}

// Smooth scroll function
function scrollToFoundItems() {
    const foundItemsSection = document.querySelector('.items-section');
    if (foundItemsSection) {
        showSection('items-section'); // Ensure it's visible before scrolling
        foundItemsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// User Authentication Functions
function signInWithGoogle() {
    // Simulate Google sign-in
    const mockUser = {
        name: 'John Doe',
        email: 'john.doe@surana.edu.in',
        avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="100%" height="100%" fill="%230066cc"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%23ffffff">J</text></svg>'
    };
    
    // Update UI to signed-in state
    document.getElementById('notSignedIn').style.display = 'none';
    document.getElementById('signedIn').style.display = 'flex';
    
    // Update user info
    document.getElementById('userName').textContent = mockUser.name;
    document.getElementById('userEmail').textContent = mockUser.email;
    document.getElementById('userAvatar').src = mockUser.avatar;
    
    // Store user data
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    
    alert(`Welcome back, ${mockUser.name}! You are now signed in.`);
}

function signOut() {
    // Clear user data
    localStorage.removeItem('currentUser');
    
    // Update UI to signed-out state
    document.getElementById('signedIn').style.display = 'none';
    document.getElementById('notSignedIn').style.display = 'flex';
    
    // Reset navigation
    navigateToSection('home');
    
    alert('You have been signed out successfully.');
}

// User Menu Functions
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('userDropdown');
    const userProfile = document.querySelector('.user-profile');
    
    if (dropdown && (!userProfile || !userProfile.contains(event.target))) {
        dropdown.classList.remove('show');
    }
});

// Mobile Menu Functions
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('show');
}

// Dashboard Functions
function showDashboard() {
    // showSection('dashboard') is now called by navigateToSection
    // Only load data and set active tab here
    
    // Load dashboard data
    loadDashboardData();
    
    // Show overview tab by default
    showDashboardTab('overview');

    // Show user email in dashboard header
    const user = getCurrentUser();
    const dashHeader = document.querySelector('.dashboard-header');
    let userEmailSpan = document.getElementById('dashboardUserEmail');

    if (user) {
        if (!userEmailSpan) {
            userEmailSpan = document.createElement('span');
            userEmailSpan.id = 'dashboardUserEmail';
            userEmailSpan.style.float = 'right';
            userEmailSpan.style.fontSize = '16px';
            userEmailSpan.style.color = '#e3f2fd'; // Adjust color to fit blue gradient
            dashHeader.appendChild(userEmailSpan);
        }
        userEmailSpan.textContent = 'Logged in as: ' + user.email;
    } else {
        if (userEmailSpan) {
            userEmailSpan.remove();
        }
    }
}

function showDashboardTab(tabName, ev) {
    // Hide all tabs
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all sidebar items
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to clicked sidebar item or infer by onclick attribute
    if (ev && ev.currentTarget) {
        ev.currentTarget.classList.add('active');
    } else {
        document.querySelectorAll('.sidebar-item').forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick') || '';
            if (onclickAttr.includes(`'${tabName}'`)) {
                btn.classList.add('active');
            }
        });
    }
    
    // Load specific tab data
    switch(tabName) {
        case 'overview':
            loadOverviewData();
            break;
        case 'my-items':
            loadMyItemsData();
            break;
        case 'claims':
            loadClaimsData();
            break;
        case 'profile':
            loadProfileData();
            break;
        case 'settings':
            loadSettingsData();
            break;
        case 'watchlist':
            loadWatchlistData();
            break;
    }
}

function loadDashboardData() {
    // Update statistics
    updateDashboardStats();
    
    // Load recent activity
    loadRecentActivity();
}

function updateDashboardStats() {
    const user = getCurrentUser();
    let userLostItemsCount = 0;
    let userFoundItemsCount = 0;
    let userPendingClaims = 0;
    let userResolvedItems = 0;

    if (user) {
        // Only count items reported by the logged-in user for their dashboard overview
        userLostItemsCount = lostItems.filter(item => item.userEmail === user.email).length;
        userFoundItemsCount = foundItems.filter(item => item.userEmail === user.email).length;
        
        // Filter claims relevant to the logged-in user
        const claimRequests = JSON.parse(localStorage.getItem('claimRequests') || '[]');
        userPendingClaims = claimRequests.filter(claim => 
            ((claim.itemType === 'lost' && lostItems.find(item => item.id === claim.itemId && item.userEmail === user.email)) || 
             (claim.itemType === 'found' && foundItems.find(item => item.id === claim.itemId && item.userEmail === user.email))) && 
            claim.status === 'pending'
        ).length;
        userResolvedItems = claimRequests.filter(claim => 
            ((claim.itemType === 'lost' && lostItems.find(item => item.id === claim.itemId && item.userEmail === user.email)) || 
             (claim.itemType === 'found' && foundItems.find(item => item.id === claim.itemId && item.userEmail === user.email))) && 
            claim.status === 'approved'
        ).length;
    }

    // Update statistics based on user's items or 0 if logged out
    document.getElementById('totalLostItems').textContent = userLostItemsCount;
    document.getElementById('totalFoundItems').textContent = userFoundItemsCount;
    document.getElementById('pendingClaims').textContent = userPendingClaims;
    document.getElementById('resolvedItems').textContent = userResolvedItems;
    
    // Update system statistics (this is for the separate 'System Stats' tab, which remains global)
    updateSystemStats();
}

function updateSystemStats() {
    // This function for the 'settings-tab' should remain global counts for overall system stats
    const totalItems = lostItems.length + foundItems.length;
    document.getElementById('totalSystemItems').textContent = totalItems;
    
    const claimRequests = JSON.parse(localStorage.getItem('claimRequests') || '[]');
    const resolvedClaims = claimRequests.filter(claim => claim.status === 'approved');
    document.getElementById('totalResolvedItems').textContent = resolvedClaims.length;
    
    // Calculate success rate
    const successRate = totalItems > 0 ? Math.round((resolvedClaims.length / totalItems) * 100) : 0;
    document.getElementById('successRate').textContent = successRate + '%';
}

function loadRecentActivity() {
    const activityFeed = document.getElementById('activityFeed');
    
    // Get system-wide recent activities
    const activities = [];
    
    // Add recent lost items
    lostItems.slice(0, 5).forEach(item => {
        activities.push({
            type: 'lost',
            message: `"${item.name}" reported as lost`,
            date: new Date(item.date),
            item: item
        });
    });
    
    // Add recent found items
    foundItems.slice(0, 5).forEach(item => {
        activities.push({
            type: 'found',
            message: `"${item.name}" reported as found`,
            date: new Date(item.date),
            item: item
        });
    });
    
    // Add recent claim activities
    const claimRequests = JSON.parse(localStorage.getItem('claimRequests') || '[]');
    claimRequests.slice(0, 5).forEach(claim => {
        activities.push({
            type: 'claim',
            message: `Claim request ${claim.status} for item`,
            date: new Date(claim.dateSubmitted),
            claim: claim
        });
    });
    
    // Sort by date (most recent first)
    activities.sort((a, b) => b.date - a.date);
    
    if (activities.length === 0) {
        activityFeed.innerHTML = `
            <div class="no-activity">
                <p>No recent activity</p>
            </div>
        `;
        return;
    }
    
    const activitiesHTML = activities.slice(0, 10).map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${getActivityIcon(activity.type)}</div>
            <div class="activity-content">
                <p>${activity.message}</p>
                <small>${formatDate(activity.date)}</small>
            </div>
        </div>
    `).join('');
    
    activityFeed.innerHTML = activitiesHTML;
}

function getActivityIcon(type) {
    switch(type) {
        case 'lost': return '📦';
        case 'found': return '🔍';
        case 'claim': return '🔐';
        default: return '📝';
    }
}

function loadMyItemsData() {
    const user = getCurrentUser();
    if (!user) {
        document.getElementById('myLostItemsContent').innerHTML = '<div class="no-items"><p>Please log in to see your lost items.</p></div>';
        document.getElementById('myFoundItemsContent').innerHTML = '<div class="no-items"><p>Please log in to see your found items.</p></div>';
        return;
    }
    // Filter items based on the userEmail stored with the item
    const myLost = lostItems.filter(item => item.userEmail === user.email);
    const myFound = foundItems.filter(item => item.userEmail === user.email);
    displayMyLostItems(myLost);
    displayMyFoundItems(myFound);
}

function displayMyLostItems(items) {
    const content = document.getElementById('myLostItemsContent');
    content.innerHTML = ''; // Clear content before rendering
    
    if (items.length === 0) {
        content.innerHTML = `
            <div class="no-items">
                <p>You haven't reported any lost items yet.</p>
                <button class="btn btn-primary" onclick="openLostItemModal()">Report Lost Item</button>
            </div>
        `;
        return;
    }
    
    const itemsHTML = items.map(item => `
        <div class="item-card lost-item-card">
            <div class="item-image">
                <img src="${item.photo || LOST_PLACEHOLDER}" alt="${item.name}">
            </div>
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="item-description">${item.description}</p>
                <div class="item-meta">
                    ${item.highValue ? `<span class="item-badge high-value">High Value</span>` : ``}
                    <span class="item-category">${getCategoryDisplayName(item.category)}</span>
                    <span class="item-location">${getLocationDisplayName(item.location)}</span>
                    <span class="item-date">${formatDate(item.date)}</span>
                </div>
                ${item.userEmail ? `<p class="reporter-info"><strong>Reported by:</strong> ${item.userEmail}</p>` : ''}
                <div class="item-actions">
                    <button class="btn btn-secondary" onclick="editItem(${item.id}, 'lost')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteItem(${item.id}, 'lost')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
    
    content.innerHTML = `
        <div class="items-grid">
            ${itemsHTML}
        </div>
    `;
}

function displayMyFoundItems(items) {
    const content = document.getElementById('myFoundItemsContent');
    content.innerHTML = ''; // Clear content before rendering
    
    if (items.length === 0) {
        content.innerHTML = `
            <div class="no-items">
                <p>You haven't reported any found items yet.</p>
                <button class="btn btn-primary" onclick="openFoundItemModal()">Report Found Item</button>
            </div>
        `;
        return;
    }
    
    const itemsHTML = items.map(item => `
        <div class="item-card found-item-card">
            <div class="item-image">
                <img src="${item.photo || FOUND_PLACEHOLDER}" alt="${item.name}">
            </div>
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="item-description">${item.description}</p>
                <div class="item-meta">
                    ${item.highValue ? `<span class="item-badge high-value">High Value</span>` : ``}
                    <span class="item-category">${getCategoryDisplayName(item.category)}</span>
                    <span class="item-location">${getLocationDisplayName(item.location)}</span>
                    <span class="item-date">${formatDate(item.date)}</span>
                </div>
                ${item.userEmail ? `<p class="reporter-info"><strong>Reported by:</strong> ${item.userEmail}</p>` : ''}
                <div class="item-actions">
                    <button class="btn btn-secondary" onclick="editItem(${item.id}, 'found')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteItem(${item.id}, 'found')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
    
    content.innerHTML = `
        <div class="items-grid">
            ${itemsHTML}
        </div>
    `;
}

function showItemType(type, ev) {
    // Remove active class from all item tabs
    document.querySelectorAll('.item-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all content areas
    document.querySelectorAll('.my-items-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to clicked tab or infer by onclick
    if (ev && ev.currentTarget) {
        ev.currentTarget.classList.add('active');
    } else {
        document.querySelectorAll('.item-tab').forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick') || '';
            if (onclickAttr.includes(`'${type}'`)) {
                btn.classList.add('active');
            }
        });
    }
    
    // Show corresponding content
    if (type === 'lost') {
        document.getElementById('my-lost-items').classList.add('active');
    } else {
        document.getElementById('my-found-items').classList.add('active');
    }
}

function loadClaimsData() {
    const claimsContent = document.getElementById('claimsContent');
    
    // Get all claims in system
    const claimRequests = JSON.parse(localStorage.getItem('claimRequests') || '[]');
    
    if (claimRequests.length === 0) {
        claimsContent.innerHTML = `
            <div class="no-claims">
                <p>No claim requests in the system.</p>
            </div>
        `;
        return;
    }
    
    const claimsHTML = claimRequests.map(claim => {
        const item = [...lostItems, ...foundItems].find(item => item.id === claim.itemId);
        return `
            <div class="claim-item">
                <div class="claim-header">
                    <h4>${item ? item.name : 'Unknown Item'}</h4>
                    <span class="claim-status-badge ${claim.status}">${claim.status}</span>
                </div>
                <p><strong>Claimant:</strong> ${claim.claimantName}</p>
                <p><strong>Contact:</strong> ${claim.claimantContact}</p>
                <p><strong>Proof:</strong> ${claim.proofOfOwnership}</p>
                <p><strong>Date:</strong> ${formatDate(claim.dateSubmitted)}</p>
                ${claim.status === 'pending' ? `
                    <div class="claim-actions">
                        <button class="btn btn-success" onclick="approveClaim(${claim.itemId}, '${claim.itemType}')">Approve</button>
                        <button class="btn btn-danger" onclick="denyClaim(${claim.itemId}, '${claim.itemType}')">Deny</button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    claimsContent.innerHTML = claimsHTML;
}

function loadProfileData() {
    // This function is now just a placeholder for system info
    // The content is loaded directly in HTML
}

function loadSettingsData() {
    // This function is now just a placeholder for system stats
    // The content is loaded directly in HTML
}

// ---------------- Watchlist & Saved Search ----------------
function getSavedSearches() {
    try { return JSON.parse(localStorage.getItem('savedSearches') || '[]'); } catch (e) { return []; }
}
function setSavedSearches(list) {
    localStorage.setItem('savedSearches', JSON.stringify(list));
}
function currentSearchSnapshot() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const locationFilter = document.getElementById('locationFilter');
    const dateFilter = document.getElementById('dateFilter');
    const sortFilter = document.getElementById('sortFilter');
    const highValueOnly = document.getElementById('highValueOnly');
    return {
        q: searchInput ? searchInput.value : '',
        category: categoryFilter ? categoryFilter.value : '',
        location: locationFilter ? locationFilter.value : '',
        date: dateFilter ? dateFilter.value : '',
        sort: sortFilter ? sortFilter.value : 'recent',
        highValueOnly: highValueOnly ? !!highValueOnly.checked : false
    };
}
function saveCurrentSearch() {
    const snapshot = currentSearchSnapshot();
    const defaultName = `Search ${new Date().toLocaleString()}`;
    const name = prompt('Name this search', defaultName);
    if (!name) return;
    const list = getSavedSearches();
    list.push({ id: Date.now(), name, filters: snapshot, createdAt: new Date().toISOString() });
    setSavedSearches(list);
    showToast('Search saved to Watchlist', 'success');
}
function loadWatchlistData() {
    const container = document.getElementById('watchlistContent');
    const list = getSavedSearches();
    if (!container) return;
    if (!list.length) {
        container.innerHTML = '<div class="no-items"><p>No saved searches yet. Use "Save Search" in the search bar.</p></div>';
        return;
    }
    const items = list.map(s => {
        const matchCount = countMatchesForSavedSearch(s);
        const f = s.filters;
        const summary = [f.q && `"${f.q}"`, f.category, f.location, f.date && `date:${f.date}`, f.sort && `sort:${f.sort}`].filter(Boolean).join(' • ');
        return `
        <div class="item-card">
            <div class="item-details">
                <h3>${s.name}</h3>
                <p class="item-description">${summary || 'All items'}</p>
                <div class="item-meta">
                    <span class="item-category">Matches: ${matchCount}</span>
                </div>
                <div class="item-actions">
                    <button class="btn btn-primary" onclick="runSavedSearch(${s.id})">Run</button>
                    <button class="btn btn-secondary" onclick="deleteSavedSearch(${s.id})">Delete</button>
                </div>
            </div>
        </div>`;
    }).join('');
    container.innerHTML = `<div class="items-grid">${items}</div>`;
}
function runSavedSearch(id) {
    const s = getSavedSearches().find(x => x.id === id);
    if (!s) return;
    const f = s.filters;
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const locationFilter = document.getElementById('locationFilter');
    const dateFilter = document.getElementById('dateFilter');
    const sortFilter = document.getElementById('sortFilter');
    const highValueOnly = document.getElementById('highValueOnly');
    if (searchInput) searchInput.value = f.q || '';
    if (categoryFilter) categoryFilter.value = f.category || '';
    if (locationFilter) locationFilter.value = f.location || '';
    if (dateFilter) dateFilter.value = f.date || '';
    if (sortFilter) sortFilter.value = f.sort || 'recent';
    if (highValueOnly) highValueOnly.checked = !!f.highValueOnly;
    // Show items section and apply filters
    navigateToSection('found-items');
    filterItems();
}
function deleteSavedSearch(id) {
    const list = getSavedSearches().filter(x => x.id !== id);
    setSavedSearches(list);
    loadWatchlistData();
    showToast('Saved search deleted', 'success');
}
function countMatchesForSavedSearch(s) {
    const f = s.filters || {};
    let filtered = foundItems.slice();
    const q = (f.q || '').toLowerCase();
    if (q) {
        filtered = filtered.filter(item =>
            (item.name || '').toLowerCase().includes(q) ||
            (item.description || '').toLowerCase().includes(q) ||
            (item.location || '').toLowerCase().includes(q)
        );
    }
    if (f.category) filtered = filtered.filter(i => i.category === f.category);
    if (f.location) filtered = filtered.filter(i => i.location === f.location);
    if (f.date) filtered = filtered.filter(i => filterByDate(i.date, f.date));
    if (f.highValueOnly) filtered = filtered.filter(i => !!i.highValue);
    filtered = sortItems(filtered, f.sort || 'recent');
    filtered = filtered.filter(i => i.status !== 'claimRequested');
    return filtered.length;
}

// Simple toast helper
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return alert(message);
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => { el.remove(); }, 2500);
}

// Legacy functions for backward compatibility
function showProfile() {
    showDashboard();
    showDashboardTab('profile');
}

function showMyItems() {
    showDashboard();
    showDashboardTab('my-items');
}

function showNotifications() {
    showDashboard();
    showDashboardTab('claims');
}

function showSettings() {
    showDashboard();
    showDashboardTab('settings');
}

// Sample data for demonstration
const sampleLostItems = [
    {
        id: 3,
        name: "College ID Card",
        description: "Lost my student ID card near the main gate. It has a blue lanyard.",
        category: "personal",
        location: "gate",
        date: "2024-08-10",
        contact: "9988776655",
        status: 'lost',
        userEmail: "sample@example.com" // Associate with a sample user
    }
];
const sampleFoundItems = [
    {
        id: 1,
        name: "iPhone 13",
        description: "Black iPhone 13 with clear case, found near the library entrance",
        category: "electronics",
        location: "library",
        date: "2024-08-07",
        image: "https://via.placeholder.com/150x150/0066cc/ffffff?text=iPhone",
        finderName: "John Smith",
        finderContact: "9876543210",
        condition: "excellent",
        highValue: true,
        status: 'found',
        userEmail: "john.smith@example.com" // Associate with a sample user
    },
    {
        id: 2,
        name: "Student ID Card",
        description: "Student ID card belonging to John Doe, Computer Science Department",
        category: "personal",
        location: "canteen",
        date: "2024-08-06",
        image: "https://via.placeholder.com/150x150/28a745/ffffff?text=ID+Card",
        finderName: "Sarah Johnson",
        finderContact: "8765432109",
        condition: "good",
        status: 'found',
        userEmail: "sarah.j@example.com" // Associate with a sample user
    }
];

// Initialize with data from localStorage or sample data if empty
async function initializeItems() {
    try {
        const res = await apiFetch('/items');
        const items = await res.json();
        const normalized = items.map(i => Object.assign({}, i, { id: i._id }));
        // Split into lost and found
        lostItems = normalized.filter(i => i.type === 'lost');
        foundItems = normalized.filter(i => i.type === 'found');
        console.log('Loaded items from API:', { lostItems, foundItems });
    } catch (e) {
        // Fallback to samples if API unreachable
        lostItems = [...sampleLostItems];
        foundItems = [...sampleFoundItems];
        console.warn('API unreachable, using sample data.');
    }
}

// DOM elements are queried when needed to avoid null references before DOM is ready.

// --- User Session Management ---
function setCurrentUser(userOrEmail) {
    const user = typeof userOrEmail === 'string' ? { email: userOrEmail } : userOrEmail;
    localStorage.setItem('currentUser', JSON.stringify(user));
    updateAuthUI();
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

function clearCurrentUser() {
    localStorage.removeItem('currentUser');
    updateAuthUI();
}

function updateAuthUI() {
    const user = getCurrentUser();
    const loginBtn = document.querySelector('.btn-login');
    let logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) {
        // Create logout button if not present
        logoutBtn = document.createElement('button');
        logoutBtn.id = 'logoutBtn';
        logoutBtn.className = 'btn btn-login nav-link';
        logoutBtn.style.marginLeft = '10px';
        logoutBtn.textContent = '🚪 Logout';
        logoutBtn.onclick = function() { clearCurrentUser(); alert('You have been logged out.'); navigateToSection('home'); };
        loginBtn.parentNode.appendChild(logoutBtn);
    }
    if (user) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
    } else {
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    // Add event listeners
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const locationFilter = document.getElementById('locationFilter');
    const dateFilter = document.getElementById('dateFilter');
    const sortFilter = document.getElementById('sortFilter');

    if (searchInput) searchInput.addEventListener('input', filterItems);
    if (categoryFilter) categoryFilter.addEventListener('change', filterItems);
    if (locationFilter) locationFilter.addEventListener('change', filterItems);
    if (dateFilter) dateFilter.addEventListener('change', filterItems);
    if (sortFilter) sortFilter.addEventListener('change', filterItems);
    const highValueOnly = document.getElementById('highValueOnly');
    if (highValueOnly) highValueOnly.addEventListener('change', filterItems);
    const saveSearchBtn = document.getElementById('saveSearchBtn');
    if (saveSearchBtn) saveSearchBtn.addEventListener('click', saveCurrentSearch);
    
    // Add button event listeners
    const signinBtn = document.querySelector('.signin-btn');
    
    if (signinBtn) {
        signinBtn.addEventListener('click', () => {
            alert('Google Sign-in would be implemented here');
        });
    }
    
    // Load data from localStorage
    initializeItems(); // This is now called here
    
    // Initial display
    displayLostItems();
    displayFoundItems();
    
    // Form submission
    const lostItemForm = document.getElementById('lostItemForm');
    if (lostItemForm) {
        lostItemForm.addEventListener('submit', handleLostItemSubmit);
    }
    
    const foundItemForm = document.getElementById('foundItemForm');
    if (foundItemForm) {
        foundItemForm.addEventListener('submit', handleFoundItemSubmit);
    }
    
    // Close modal when clicking outside
    const lostModal = document.getElementById('lostItemModal');
    if (lostModal) {
        lostModal.addEventListener('click', function(e) {
            if (e.target === lostModal) {
                closeLostItemModal();
            }
        });
    }
    
    const foundModal = document.getElementById('foundItemModal');
    if (foundModal) {
        foundModal.addEventListener('click', function(e) {
            if (e.target === foundModal) {
                closeFoundItemModal();
            }
        });
    }
    
    // Handle email verification redirect
    const urlParams = new URLSearchParams(window.location.search);
    const isVerified = urlParams.get('verified');
    const errorParam = urlParams.get('error');

    if (isVerified === 'true') {
        openEmailAuthModal();
        showLoginForm(); // Ensure login form is shown
        const loginMessage = document.getElementById('loginMessage');
        loginMessage.textContent = 'Your email has been verified! Please log in.';
        loginMessage.style.color = 'green';
        // Clear the query parameter to prevent re-triggering on refresh
        history.replaceState(null, '', window.location.pathname);
    } else if (errorParam === 'invalid_token') {
        openEmailAuthModal();
        showLoginForm();
        const loginMessage = document.getElementById('loginMessage');
        loginMessage.textContent = 'Verification failed: Invalid or expired link.';
        loginMessage.style.color = 'red';
        history.replaceState(null, '', window.location.pathname);
    }
});

// Helper function to convert a File object to a Base64 string
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null); // Resolve with null if no file
            return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Handle lost item form submission
async function handleLostItemSubmit(e) {
    console.log('handleLostItemSubmit triggered. editingItem:', editingItem); // Added log
    e.preventDefault();
    
    if (editingItem && editingItem.itemType === 'lost') {
        console.log('Calling handleUpdateLostItem...'); // Added log
        await handleUpdateLostItem(e); // If in edit mode for lost item, call update handler
        return;
    }

    console.log('Proceeding with new lost item submission...'); // Added log
    const formData = new FormData(e.target);
    const currentUser = getCurrentUser();
    if (!currentUser || !getAuthToken()) {
    alert('Please log in before submitting a lost item.');
    return;
    }
    const itemPhotoFile = formData.get('itemPhoto');
    const itemPhotoBase64 = await readFileAsBase64(itemPhotoFile);
    const payload = {
    type: 'lost',
    name: formData.get('itemName'),
    description: formData.get('itemDescription'),
    category: formData.get('itemCategory'),
    location: formData.get('lostLocation'),
    date: formData.get('lostDate'),
    contact: formData.get('contactNumber'),
    photo: itemPhotoBase64,
    additionalInfo: formData.get('additionalInfo'),
    highValue: !!formData.get('highValue'),
    status: 'available'
    };
    const res = await apiFetch('/items', { method: 'POST', body: JSON.stringify(payload) });
    if (!res.ok) {
    const msg = await res.text();
    alert('Failed to submit lost item: ' + msg);
    return;
    }
    alert('Thank you! Your lost item report has been submitted successfully.');
    closeLostItemModal();
    await initializeItems();
    displayLostItems();
    displayFoundItems();
    loadDashboardData();
}

// Handle found item form submission
async function handleFoundItemSubmit(e) {
    console.log('handleFoundItemSubmit triggered. editingItem:', editingItem); // Added log
    e.preventDefault();

    if (editingItem && editingItem.itemType === 'found') {
        console.log('Calling handleUpdateFoundItem...'); // Added log
        await handleUpdateFoundItem(e); // If in edit mode for found item, call update handler
        return;
    }
    
    console.log('Proceeding with new found item submission...'); // Added log
    const formData = new FormData(e.target);
    const currentUser = getCurrentUser();
    if (!currentUser || !getAuthToken()) {
        alert('Please log in before submitting a found item.');
        return;
    }
    const foundItemPhotoFile = formData.get('foundItemPhoto');
    const foundItemPhotoBase64 = await readFileAsBase64(foundItemPhotoFile);
    const payload = {
        type: 'found',
        name: formData.get('foundItemName'),
        description: formData.get('foundItemDescription'),
        category: formData.get('foundItemCategory'),
        location: formData.get('foundLocation'),
        date: formData.get('foundDate'),
        time: formData.get('foundTime'),
        photo: foundItemPhotoBase64,
        finderName: formData.get('finderName'),
        finderContact: formData.get('finderContact'),
        finderEmail: formData.get('finderEmail'),
        condition: formData.get('itemCondition'),
        additionalInfo: formData.get('additionalFoundInfo'),
        highValue: !!formData.get('highValue'),
        status: 'available'
    };
    const res = await apiFetch('/items', { method: 'POST', body: JSON.stringify(payload) });
    if (!res.ok) {
        const msg = await res.text();
        alert('Failed to submit found item: ' + msg);
        return;
    }
    alert('Thank you! Your found item report has been submitted successfully.');
    closeFoundItemModal();
    await initializeItems();
    displayLostItems();
    displayFoundItems();
    loadDashboardData();
}

// Claim item function - Now with verification system
function claimItem(itemId, itemType) {
    if (itemType === 'found') {
        // Open claim verification modal for found items
        openClaimVerificationModal(itemId, 'found');
    } else if (itemType === 'lost') {
        // Open claim verification modal for lost items
        openClaimVerificationModal(itemId, 'lost');
    }
}

// Open claim verification modal
function openClaimVerificationModal(itemId, itemType) {
    const item = itemType === 'found' ? 
        foundItems.find(item => item.id === itemId) : 
        lostItems.find(item => item.id === itemId);
    
    if (!item) return;
    
    // Create and show verification modal
    const modalHTML = `
        <div id="claimVerificationModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Claim Verification Required</h2>
                    <span class="close" onclick="closeClaimVerificationModal()">&times;</span>
                </div>
                <div class="verification-content">
                    <div class="item-summary">
                        <h3>${item.name}</h3>
                        <p><strong>Description:</strong> ${item.description}</p>
                        <p><strong>Category:</strong> ${getCategoryDisplayName(item.category)}</p>
                        <p><strong>Location:</strong> ${getLocationDisplayName(item.location)}</p>
                    </div>
                    
                    <form id="claimVerificationForm" class="verification-form">
                        <div class="form-group">
                            <label for="claimantName">Your Full Name *</label>
                            <input type="text" id="claimantName" name="claimantName" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="claimantContact">Contact Number *</label>
                            <input type="tel" id="claimantContact" name="claimantContact" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="claimantEmail">Email Address</label>
                            <input type="email" id="claimantEmail" name="claimantEmail">
                        </div>
                        
                        <div class="form-group">
                            <label for="proofOfOwnership">Proof of Ownership *</label>
                            <textarea id="proofOfOwnership" name="proofOfOwnership" required 
                                placeholder="Describe how you can prove this item belongs to you (e.g., specific details, receipts, photos, unique marks, etc.)"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="additionalProof">Additional Evidence</label>
                            <textarea id="additionalProof" name="additionalProof" 
                                placeholder="Any other details that prove ownership"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="meetingPreference">Meeting Preference</label>
                            <select id="meetingPreference" name="meetingPreference">
                                <option value="">Select preference</option>
                                <option value="campus">On Campus</option>
                                <option value="public">Public Place</option>
                                <option value="police">Police Station</option>
                                <option value="other">Other (specify below)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="meetingDetails">Meeting Details</label>
                            <textarea id="meetingDetails" name="meetingDetails" 
                                placeholder="Preferred time, location, or any special arrangements"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="closeClaimVerificationModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Submit Claim Request</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = document.getElementById('claimVerificationModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Add form submission handler
    const form = document.getElementById('claimVerificationForm');
    form.addEventListener('submit', (e) => submitClaimRequest(e, itemId, itemType));
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeClaimVerificationModal();
        }
    });
}

// Close claim verification modal
function closeClaimVerificationModal() {
    const modal = document.getElementById('claimVerificationModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Submit claim request
async function submitClaimRequest(e, itemId, itemType) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const payload = {
        itemId,
        itemType,
        claimantName: formData.get('claimantName'),
        claimantContact: formData.get('claimantContact'),
        claimantEmail: formData.get('claimantEmail'),
        proofOfOwnership: formData.get('proofOfOwnership'),
        additionalProof: formData.get('additionalProof'),
        meetingPreference: formData.get('meetingPreference'),
        meetingDetails: formData.get('meetingDetails')
    };
    try {
        const res = await apiFetch('/claims', { method: 'POST', body: JSON.stringify(payload) });
        if (!res.ok) {
            const msg = await res.text();
            alert('Failed to submit claim: ' + msg);
            return;
        }
        alert('Claim request submitted successfully!');
        closeClaimVerificationModal();
        await initializeItems();
        displayFoundItems();
        displayLostItems();
        loadDashboardData();
    } catch (e) {
        alert('Error submitting claim.');
    }
}

// Review claim request
function reviewClaim(itemId, itemType) {
    const item = itemType === 'found' ? 
        foundItems.find(item => item.id === itemId) : 
        lostItems.find(item => item.id === itemId);
    
    if (!item || !item.claimRequestId) return;
    
    // Get claim request details
    const claimRequests = JSON.parse(localStorage.getItem('claimRequests') || '[]');
    const claimRequest = claimRequests.find(claim => claim.id === item.claimRequestId);
    
    if (!claimRequest) return;
    
    // Show claim review modal
    const modalHTML = `
        <div id="claimReviewModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Review Claim Request</h2>
                    <span class="close" onclick="closeClaimReviewModal()">&times;</span>
                </div>
                <div class="claim-review-content">
                    <div class="item-summary">
                        <h3>${item.name}</h3>
                        <p><strong>Description:</strong> ${item.description}</p>
                    </div>
                    
                    <div class="claimant-details">
                        <h4>Claimant Information:</h4>
                        <p><strong>Name:</strong> ${claimRequest.claimantName}</p>
                        <p><strong>Contact:</strong> ${claimRequest.claimantContact}</p>
                        <p><strong>Email:</strong> ${claimRequest.claimantEmail || 'Not provided'}</p>
                        
                        <h4>Proof of Ownership:</h4>
                        <p>${claimRequest.proofOfOwnership}</p>
                        
                        ${claimRequest.additionalProof ? `<h4>Additional Evidence:</h4><p>${claimRequest.additionalProof}</p>` : ''}
                        
                        <h4>Meeting Preference:</h4>
                        <p>${claimRequest.meetingPreference}</p>
                        
                        ${claimRequest.meetingDetails ? `<h4>Meeting Details:</h4><p>${claimRequest.meetingDetails}</p>` : ''}
                    </div>
                    
                    <div class="verification-actions">
                        <h4>Verification Required:</h4>
                        <p>Please verify this person's ownership before proceeding:</p>
                        
                        <div class="verification-options">
                            <button class="btn btn-success" onclick="approveClaim(${itemId}, '${itemType}')">
                                ✅ Approve Claim - Item is theirs
                            </button>
                            <button class="btn btn-danger" onclick="denyClaim(${itemId}, '${itemType}')">
                                ❌ Deny Claim - Not the owner
                            </button>
                            <button class="btn btn-warning" onclick="requestMoreProof(${itemId}, '${itemType}')">
                                🔍 Request More Proof
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = document.getElementById('claimReviewModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeClaimReviewModal();
        }
    });
}

// Close claim review modal
function closeClaimReviewModal() {
    const modal = document.getElementById('claimReviewModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Approve claim
function approveClaim(itemId, itemType) {
    if (confirm('Are you sure you want to approve this claim? This will transfer ownership of the item.')) {
        // Remove item from respective list
        if (itemType === 'found') {
            foundItems = foundItems.filter(item => item.id !== itemId);
            localStorage.setItem('foundItems', JSON.stringify(foundItems));
            displayFoundItems();
        } else {
            lostItems = lostItems.filter(item => item.id !== itemId);
            localStorage.setItem('lostItems', JSON.stringify(lostItems));
            displayLostItems();
        }
        
        // Update claim request status
        const claimRequests = JSON.parse(localStorage.getItem('claimRequests') || '[]');
        const claimRequest = claimRequests.find(claim => 
            claim.itemId === itemId && claim.itemType === itemType
        );
        if (claimRequest) {
            claimRequest.status = 'approved';
            claimRequest.dateApproved = new Date().toISOString();
            localStorage.setItem('claimRequests', JSON.stringify(claimRequests));
        }
        
        alert('Claim approved! The item has been transferred to the claimant.');
        closeClaimReviewModal();
    }
}

// Deny claim
function denyClaim(itemId, itemType) {
    if (confirm('Are you sure you want to deny this claim? The item will remain available for the real owner.')) {
        // Reset item status
        if (itemType === 'found') {
            const item = foundItems.find(item => item.id === itemId);
            if (item) {
                item.status = 'available';
                delete item.claimRequestId;
                localStorage.setItem('foundItems', JSON.stringify(foundItems));
                displayFoundItems();
            }
        } else {
            const item = lostItems.find(item => item.id === itemId);
            if (item) {
                item.status = 'available';
                delete item.claimRequestId;
                localStorage.setItem('lostItems', JSON.stringify(lostItems));
                displayLostItems();
            }
        }
        
        // Update claim request status
        const claimRequests = JSON.parse(localStorage.getItem('claimRequests') || '[]');
        const claimRequest = claimRequests.find(claim => 
            claim.itemId === itemId && claim.itemType === itemType
        );
        if (claimRequest) {
            claimRequest.status = 'denied';
            claimRequest.dateDenied = new Date().toISOString();
            localStorage.setItem('claimRequests', JSON.stringify(claimRequests));
        }
        
        alert('Claim denied. The item remains available for the real owner.');
        closeClaimReviewModal();
    }
}

// Request more proof
function requestMoreProof(itemId, itemType) {
    const additionalProof = prompt('What additional proof do you need from the claimant?');
    if (additionalProof) {
        // Update claim request with additional proof request
        const claimRequests = JSON.parse(localStorage.getItem('claimRequests') || '[]');
        const claimRequest = claimRequests.find(claim => 
            claim.itemId === itemId && claim.itemType === itemType
        );
        if (claimRequest) {
            claimRequest.status = 'moreProofRequested';
            claimRequest.additionalProofRequest = additionalProof;
            claimRequest.dateProofRequested = new Date().toISOString();
            localStorage.setItem('claimRequests', JSON.stringify(claimRequests));
        }
        
        alert('Additional proof requested. The claimant will be notified.');
        closeClaimReviewModal();
    }
}

// Display lost items
function displayLostItems() {
    const lostItemsContent = document.getElementById('lostItemsContent');
    lostItemsContent.innerHTML = ''; // Clear content before rendering
    
    const visibleLost = lostItems.filter(item => item.status !== 'claimRequested');
    if (visibleLost.length === 0) {
        lostItemsContent.innerHTML = `
            <div class="no-items">
                <div class="no-items-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No lost items reported</h3>
                <p>No one has reported lost items yet. Be the first to report a lost item!</p>
            </div>
        `;
        return;
    }
    
    const itemsHTML = visibleLost.map(item => `
        <div class="item-card lost-item-card">
            <div class="item-image">
                <img src="${item.photo || LOST_PLACEHOLDER}" alt="${item.name}">
            </div>
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="item-description">${item.description}</p>
                <div class="item-meta">
                    ${item.highValue ? `<span class="item-badge high-value">High Value</span>` : ``}
                    <span class="item-category">${getCategoryDisplayName(item.category)}</span>
                    <span class="item-location">${getLocationDisplayName(item.location)}</span>
                    <span class="item-date">${formatDate(item.date)}</span>
                </div>
                <p class="contact-info"><strong>Contact:</strong> ${item.contact}</p>
                ${item.additionalInfo ? `<p class="additional-info"><strong>Additional Info:</strong> ${item.additionalInfo}</p>` : ''}
                ${item.userEmail ? `<p class="reporter-info"><strong>Reported by:</strong> ${item.userEmail}</p>` : ''}
                ${item.status === 'claimRequested' ? 
                    `<div class="claim-status">
                        <span class="status-badge claim-requested">Claim Requested</span>
                        <button class="btn btn-success" onclick="navigateToSection('dashboard'); showDashboardTab('claims')">Review Claims</button>
                    </div>` : 
                    `<button class="claim-btn" onclick="claimItem(${item.id}, 'lost')">Mark as Found</button>`
                }
            </div>
        </div>
    `).join('');
    
    lostItemsContent.innerHTML = `
        <div class="items-grid">
            ${itemsHTML}
        </div>
    `;
}

// Display found items
function displayFoundItems() {
    const itemsContent = document.getElementById('itemsContent');
    itemsContent.innerHTML = ''; // Clear content before rendering
    
    const visibleFound = foundItems.filter(item => item.status !== 'claimRequested');
    if (visibleFound.length === 0) {
        itemsContent.innerHTML = `
            <div class="items-grid">
                <div class="no-items">
                    <div class="no-items-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>No items found</h3>
                    <p>No one has reported found items yet. Be the first to report a found item!</p>
                </div>
            </div>
        `;
        return;
    }
    
    const itemsHTML = visibleFound.map(item => `
        <div class="item-card found-item-card">
            <div class="item-image">
                <img src="${item.photo || FOUND_PLACEHOLDER}" alt="${item.name}">
            </div>
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="item-description">${item.description}</p>
                <div class="item-meta">
                    ${item.highValue ? `<span class="item-badge high-value">High Value</span>` : ``}
                    <span class="item-category">${getCategoryDisplayName(item.category)}</span>
                    <span class="item-location">${getLocationDisplayName(item.location)}</span>
                    <span class="item-date">${formatDate(item.date)}</span>
                </div>
                <p class="finder-info"><strong>Found by:</strong> ${item.finderName}</p>
                <p class="contact-info"><strong>Contact:</strong> ${item.finderContact}</p>
                ${item.condition ? `<p class="condition-info"><strong>Condition:</strong> ${getConditionDisplayName(item.condition)}</p>` : ''}
                ${item.additionalInfo ? `<p class="additional-info"><strong>Additional Info:</strong> ${item.additionalInfo}</p>` : ''}
                ${item.userEmail ? `<p class="reporter-info"><strong>Reported by:</strong> ${item.userEmail}</p>` : ''}
                ${item.status === 'claimRequested' ? 
                    `<div class="claim-status">
                        <span class="status-badge claim-requested">Claim Requested</span>
                        <button class="btn btn-success" onclick="navigateToSection('dashboard'); showDashboardTab('claims')">Review Claims</button>
                    </div>` : 
                    `<button class="claim-btn" onclick="claimItem(${item.id}, 'found')">Claim Item</button>`
                }
            </div>
        </div>
    `).join('');
    
    itemsContent.innerHTML = `
        <div class="items-grid">
            ${itemsHTML}
        </div>
    `;
}

// Filter and display items (for search functionality)
function filterItems() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const locationFilter = document.getElementById('locationFilter');
    const dateFilter = document.getElementById('dateFilter');
    const sortFilter = document.getElementById('sortFilter');
    const highValueOnly = document.getElementById('highValueOnly');
    if (!searchInput || !categoryFilter || !locationFilter || !dateFilter || !sortFilter) {
        return;
    }
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedLocation = locationFilter.value;
    const selectedDate = dateFilter.value;
    const selectedSort = sortFilter.value;
    const hvOnly = highValueOnly && highValueOnly.checked;
    
    // Filter found items
    let filteredItems = foundItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                            item.description.toLowerCase().includes(searchTerm) ||
                            item.location.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !selectedCategory || item.category === selectedCategory;
        const matchesLocation = !selectedLocation || item.location === selectedLocation;
        const matchesDate = !selectedDate || filterByDate(item.date, selectedDate);
        const matchesHV = !hvOnly || !!item.highValue;
        
        return matchesSearch && matchesCategory && matchesLocation && matchesDate && matchesHV;
    });
    
    // Sort items
    filteredItems = sortItems(filteredItems, selectedSort);
    
    // Display filtered found items
    displayFilteredFoundItems(filteredItems);
}

// Filter by date
function filterByDate(itemDate, filterType) {
    const itemDateTime = new Date(itemDate);
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    switch (filterType) {
        case 'today':
            return itemDateTime >= startOfDay;
        case 'week':
            return itemDateTime >= startOfWeek;
        case 'month':
            return itemDateTime >= startOfMonth;
        default:
            return true;
    }
}

// Sort items
function sortItems(items, sortType) {
    return items.sort((a, b) => {
        switch (sortType) {
            case 'recent':
                return new Date(b.date) - new Date(a.date);
            case 'oldest':
                return new Date(a.date) - new Date(b.date);
            case 'name':
                return a.name.localeCompare(b.name);
            case 'location':
                return a.location.localeCompare(b.location);
            default:
                return 0;
        }
    });
}

// Display filtered found items
function displayFilteredFoundItems(filteredItems) {
    const itemsContent = document.getElementById('itemsContent');
    
    const visible = filteredItems.filter(item => item.status !== 'claimRequested');
    if (visible.length === 0) {
        itemsContent.innerHTML = `
            <div class="no-items">
                <div class="no-items-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No items found</h3>
                <p>Try adjusting your search filters or check back later for new items.</p>
            </div>
        `;
        return;
    }
    
    const itemsHTML = visible.map(item => `
        <div class="item-card found-item-card">
            <div class="item-image">
                <img src="${item.photo || FOUND_PLACEHOLDER}" alt="${item.name}">
            </div>
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="item-description">${item.description}</p>
                <div class="item-meta">
                    ${item.highValue ? `<span class="item-badge high-value">High Value</span>` : ``}
                    <span class="item-category">${getCategoryDisplayName(item.category)}</span>
                    <span class="item-location">${getLocationDisplayName(item.location)}</span>
                    <span class="item-date">${formatDate(item.date)}</span>
                </div>
                <p class="finder-info"><strong>Found by:</strong> ${item.finderName}</p>
                <p class="contact-info"><strong>Contact:</strong> ${item.finderContact}</p>
                ${item.condition ? `<p class="condition-info"><strong>Condition:</strong> ${getConditionDisplayName(item.condition)}</p>` : ''}
                ${item.additionalInfo ? `<p class="additional-info"><strong>Additional Info:</strong> ${item.additionalInfo}</p>` : ''}
                <button class="claim-btn" onclick="claimItem(${item.id}, 'found')">Claim Item</button>
            </div>
        </div>
    `).join('');
    
    itemsContent.innerHTML = `
        <div class="items-grid">
            ${itemsHTML}
        </div>
    `;
}

// Helper functions
function getCategoryDisplayName(category) {
    const categories = {
        'electronics': 'Electronics',
        'accessories': 'Accessories',
        'clothing': 'Clothing',
        'books': 'Books',
        'personal': 'Personal Items',
        'other': 'Other'
    };
    return categories[category] || category;
}

function getLocationDisplayName(location) {
    const locations = {
        'library': 'Library',
        'canteen': 'Food Canteen',
        'basement': 'Basement',
        'parking': 'Parking',
        'surroundings': 'Near the College Surroundings',
        'gate': 'College Gate',
        '1st-floor': '1st Floor',
        '2nd-floor': '2nd Floor',
        '3rd-floor': '3rd Floor',
        'computer-lab': 'Computer Lab'
    };
    return locations[location] || location;
}

function getConditionDisplayName(condition) {
    const conditions = {
        'excellent': 'Excellent - Like New',
        'good': 'Good - Minor Wear',
        'fair': 'Fair - Some Damage',
        'poor': 'Poor - Significant Damage'
    };
    return conditions[condition] || condition;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Add CSS for item cards
const style = document.createElement('style');
style.textContent = `
    .items-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    
    .item-card {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .item-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .item-image {
        width: 100%;
        height: 200px;
        overflow: hidden;
        background-color: #f5f5f5;
    }
    
    .item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .item-details {
        padding: 20px;
    }
    
    .item-details h3 {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin-bottom: 10px;
    }
    
    .item-description {
        color: #666;
        margin-bottom: 15px;
        line-height: 1.5;
    }
    
    .item-meta {
        display: flex;
        gap: 15px;
        margin-bottom: 15px;
        flex-wrap: wrap;
    }
    
    .item-category,
    .item-location,
    .item-date {
        background-color: #f0f0f0;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 12px;
        color: #666;
        font-weight: 500;
    }
    
    .claim-btn {
        background-color: #0066cc;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    
    .claim-btn:hover {
        background-color: #0052a3;
    }
    
    @media (max-width: 768px) {
        .items-grid {
            grid-template-columns: 1fr;
        }
        
        .item-meta {
            flex-direction: column;
            gap: 8px;
        }
    }
`;
document.head.appendChild(style);

// Extra styles for badges and toasts
const extraStyle = document.createElement('style');
extraStyle.textContent = `
  .item-badge.high-value { background-color: #ffe08a; color: #7a4d00; padding: 5px 10px; border-radius: 14px; font-size: 12px; font-weight: 600; }
  .toast-container { position: fixed; top: 20px; right: 20px; z-index: 2000; display: flex; flex-direction: column; gap: 8px; }
  .toast { background: #333; color: #fff; padding: 10px 14px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); opacity: 0.95; }
  .toast.success { background: #28a745; }
  .toast.error { background: #dc3545; }
`;
document.head.appendChild(extraStyle);

// Email Auth Modal functions
function openEmailAuthModal() {
    document.getElementById('emailAuthModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    showLoginForm();
}

function closeEmailAuthModal() {
    document.getElementById('emailAuthModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showSignUpForm(event) {
    if (event) event.preventDefault();
    document.getElementById('emailLoginForm').style.display = 'none';
    document.getElementById('emailSignUpForm').style.display = 'block';
    document.getElementById('authModalTitle').textContent = 'Sign Up';
    document.getElementById('loginMessage').textContent = '';
    document.getElementById('signUpMessage').textContent = '';
}

function showLoginForm(event) {
    if (event) event.preventDefault();
    document.getElementById('emailLoginForm').style.display = 'block';
    document.getElementById('emailSignUpForm').style.display = 'none';
    document.getElementById('authModalTitle').textContent = 'Login';
    document.getElementById('loginMessage').textContent = '';
    document.getElementById('signUpMessage').textContent = '';
}

function togglePassword(inputId, el) {
    const input = document.getElementById(inputId);
    const icon = el.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// --- Email Auth Modal functions (backend integration) ---
async function handleEmailSignUp() {
    const email = document.getElementById('signUpEmail').value.trim();
    const password = document.getElementById('signUpPassword').value;
    const signUpMessage = document.getElementById('signUpMessage');
    signUpMessage.textContent = '';
    signUpMessage.style.color = '';
    if (!email || !password) {
        signUpMessage.textContent = 'Please fill in all fields.';
        signUpMessage.style.color = 'red';
        return;
    }
    if (!validateEmail(email)) {
        signUpMessage.textContent = 'Invalid email address.';
        signUpMessage.style.color = 'red';
        return;
    }
    if (password.length < 6) {
        signUpMessage.textContent = 'Password must be at least 6 characters.';
        signUpMessage.style.color = 'red';
        return;
    }
    try {
        const res = await apiFetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        let data;
        try {
            data = await res.json();
        } catch (e) {
            const text = await res.text();
            data = { message: text || 'Server error. Check backend logs.' };
        }
        signUpMessage.textContent = data.message || 'Check your email to verify your account.';
        signUpMessage.style.color = res.ok ? 'green' : 'red';
        if (res.ok) {
            setTimeout(() => {
                showLoginForm();
                document.getElementById('loginEmail').value = email;
            }, 1500);
        }
    } catch (err) {
        signUpMessage.textContent = `Cannot reach backend at ${API_BASE}. Start the server (node server.js) and ensure MongoDB is running.`;
        signUpMessage.style.color = 'red';
    }
}

async function handleEmailLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const loginMessage = document.getElementById('loginMessage');
    loginMessage.textContent = '';
    loginMessage.style.color = '';
    if (!email || !password) {
        loginMessage.textContent = 'Please fill in all fields.';
        loginMessage.style.color = 'red';
        return;
    }
    try {
        const res = await apiFetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        let data;
        try {
            data = await res.json();
        } catch (e) {
            const text = await res.text();
            data = { message: text || 'Server error. Check backend logs.' };
        }
        loginMessage.textContent = data.message || (res.ok ? 'Login successful!' : 'Login failed');
        loginMessage.style.color = res.ok ? 'green' : 'red';
        if (res.ok) {
            setCurrentUser({ email, token: data.token });
            setTimeout(() => {
                closeEmailAuthModal();
                alert('You are now logged in!');
                navigateToSection('dashboard');
            }, 500);
        }
    } catch (err) {
        loginMessage.textContent = `Cannot reach backend at ${API_BASE}. Start the server (node server.js) and ensure MongoDB is running.`;
        loginMessage.style.color = 'red';
    }
}

function validateEmail(email) {
    // Simple email validation regex
    return /^\S+@\S+\.\S+$/.test(email);
}

// Optionally, add a button somewhere to open the email auth modal
// Example: document.getElementById('emailLoginBtn').addEventListener('click', openEmailAuthModal);

async function deleteItem(itemId, itemType) {
    if (!confirm(`Are you sure you want to delete this ${itemType} item? This action cannot be undone.`)) return;
    try {
        const res = await apiFetch(`/items/${itemId}`, { method: 'DELETE' });
        if (!res.ok) {
            const msg = await res.text();
            alert('Failed to delete item: ' + msg);
            return;
        }
        alert('Item deleted successfully!');
        await initializeItems();
        displayLostItems();
        displayFoundItems();
        loadDashboardData();
    } catch (e) {
        alert('Error deleting item.');
    }
}

// New global variable to store the item being edited
let editingItem = null;

function editItem(itemId, itemType) {
    const itemToEdit = itemType === 'lost' ? 
        lostItems.find(item => item.id === itemId) : 
        foundItems.find(item => item.id === itemId);

    if (!itemToEdit) {
        alert('Item not found for editing.');
        return;
    }

    editingItem = { ...itemToEdit, itemType }; // Store item and type in global variable

    if (itemType === 'lost') {
        openLostItemModal();
        fillLostItemForm(itemToEdit);
    } else if (itemType === 'found') {
        openFoundItemModal();
        fillFoundItemForm(itemToEdit);
    }
}

function fillLostItemForm(item) {
    const lostItemModal = document.getElementById('lostItemModal');
    lostItemModal.querySelector('.modal-header h2').textContent = 'Edit Lost Item'; // Set title for edit mode

    document.getElementById('itemName').value = item.name;
    document.getElementById('itemDescription').value = item.description;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('lostLocation').value = item.location;
    document.getElementById('lostDate').value = item.date;
    document.getElementById('contactNumber').value = item.contact;
    document.getElementById('additionalInfo').value = item.additionalInfo;
    const hvLost = document.getElementById('highValue');
    if (hvLost) hvLost.checked = !!item.highValue;

    // Display existing photo
    const previewImg = document.getElementById('previewImage');
    const previewContainer = document.getElementById('photoPreview');
    const uploadPlaceholder = document.querySelector('#lostItemModal .upload-placeholder');
    if (item.photo) {
        if (previewImg) previewImg.src = item.photo;
        if (previewContainer) previewContainer.style.display = 'inline-block';
        if (uploadPlaceholder) uploadPlaceholder.style.display = 'none';
    } else {
        if (previewImg) previewImg.src = '';
        if (previewContainer) previewContainer.style.display = 'none';
        if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
    }

    // Change submit button behavior for edit
    const submitButton = document.getElementById('lostItemForm').querySelector('button[type="submit"]');
    submitButton.textContent = 'Update Item';
    // submitButton.onclick = handleUpdateLostItem; // REMOVE THIS LINE
    
    // Set global editing item
    editingItem = { id: item.id, itemType: 'lost' };
}


async function handleUpdateLostItem(e) {
    console.log('handleUpdateLostItem triggered.');
    e.preventDefault();

    if (!editingItem || editingItem.itemType !== 'lost') {
        console.error('Not in lost item edit mode.');
        alert('Error: Not in lost item edit mode.');
        return;
    }

    const formData = new FormData(e.target);
    const itemPhotoFile = formData.get('itemPhoto');
    let itemPhotoBase64 = null;

    // If a new photo file is provided, convert it to Base64
    if (itemPhotoFile && itemPhotoFile.size > 0) {
        itemPhotoBase64 = await readFileAsBase64(itemPhotoFile);
    } else {
        // Otherwise, retain the existing photo if available
        const existingItem = lostItems.find(item => item.id === editingItem.id);
        if (existingItem) {
            itemPhotoBase64 = existingItem.photo;
        }
    }

    const updatedItemData = {
        id: editingItem.id,
        name: formData.get('itemName'),
        description: formData.get('itemDescription'),
        category: formData.get('itemCategory'),
        location: formData.get('lostLocation'),
        date: formData.get('lostDate'),
        contact: formData.get('contactNumber'),
        photo: itemPhotoBase64, // Use new photo or existing Base64
        additionalInfo: formData.get('additionalInfo'),
        status: 'lost',
        userEmail: getCurrentUser() ? getCurrentUser().email : null
    };

    console.log('Updating lost item with data:', updatedItemData); // Added log

    try {
        const res = await apiFetch(`/items/${editingItem.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                type: 'lost',
                name: updatedItemData.name,
                description: updatedItemData.description,
                category: updatedItemData.category,
                location: updatedItemData.location,
                date: updatedItemData.date,
                contact: updatedItemData.contact,
                photo: updatedItemData.photo,
                additionalInfo: updatedItemData.additionalInfo,
                highValue: !!formData.get('highValue'),
                status: 'available'
            })
        });
        if (!res.ok) {
            const msg = await res.text();
            alert('Failed to update lost item: ' + msg);
            return;
        }
        alert(`Lost item "${updatedItemData.name}" updated successfully!`);
        closeLostItemModal();
        editingItem = null;
        await initializeItems();
        displayLostItems();
        displayFoundItems();
        loadDashboardData();
    } catch (err) {
        alert('Error updating lost item.');
    }
}

async function handleUpdateFoundItem(e) {
    console.log('handleUpdateFoundItem triggered.');
    e.preventDefault();

    if (!editingItem || editingItem.itemType !== 'found') {
        console.error('Not in found item edit mode.');
        alert('Error: Not in found item edit mode.');
        return;
    }

    const formData = new FormData(e.target);
    const foundItemPhotoFile = formData.get('foundItemPhoto');
    let foundItemPhotoBase64 = null;

    // If a new photo file is provided, convert it to Base64
    if (foundItemPhotoFile && foundItemPhotoFile.size > 0) {
        foundItemPhotoBase64 = await readFileAsBase64(foundItemPhotoFile);
    } else {
        // Otherwise, retain the existing photo if available
        const existingItem = foundItems.find(item => item.id === editingItem.id);
        if (existingItem) {
            foundItemPhotoBase64 = existingItem.photo;
        }
    }

    const updatedItemData = {
        id: editingItem.id,
        name: formData.get('foundItemName'),
        description: formData.get('foundItemDescription'),
        category: formData.get('foundItemCategory'),
        location: formData.get('foundLocation'),
        date: formData.get('foundDate'),
        time: formData.get('foundTime'),
        photo: foundItemPhotoBase64,
        finderName: formData.get('finderName'),
        finderContact: formData.get('finderContact'),
        finderEmail: formData.get('finderEmail'),
        condition: formData.get('itemCondition'),
        additionalInfo: formData.get('additionalFoundInfo'),
        status: 'found',
        userEmail: getCurrentUser() ? getCurrentUser().email : null
    };

    console.log('Updating found item with data:', updatedItemData); // Added log

    try {
        const res = await apiFetch(`/items/${editingItem.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                type: 'found',
                name: updatedItemData.name,
                description: updatedItemData.description,
                category: updatedItemData.category,
                location: updatedItemData.location,
                date: updatedItemData.date,
                time: updatedItemData.time,
                photo: updatedItemData.photo,
                finderName: updatedItemData.finderName,
                finderContact: updatedItemData.finderContact,
                finderEmail: updatedItemData.finderEmail,
                condition: updatedItemData.condition,
                additionalInfo: updatedItemData.additionalInfo,
                status: updatedItemData.status
            })
        });
        if (!res.ok) {
            const msg = await res.text();
            alert('Failed to update found item: ' + msg);
            return;
        }
        alert(`Found item "${updatedItemData.name}" updated successfully!`);
        closeFoundItemModal();
        editingItem = null;
        await initializeItems();
        displayLostItems();
        displayFoundItems();
        loadDashboardData();
    } catch (err) {
        alert('Error updating found item.');
    }
}

// Helper to refresh all relevant parts of the UI
function refreshAllDisplays() {
    displayLostItems();
    displayFoundItems();
    loadDashboardData();
    updateAuthUI();
}

// Ensure overview tab has a loader function referenced by showDashboardTab
function loadOverviewData() {
    updateDashboardStats();
    loadRecentActivity();
}

// Global Escape handler to close any open modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        try {
            const modals = [
                { id: 'lostItemModal', close: closeLostItemModal },
                { id: 'foundItemModal', close: closeFoundItemModal },
                { id: 'emailAuthModal', close: closeEmailAuthModal },
                { id: 'claimVerificationModal', close: closeClaimVerificationModal },
                { id: 'claimReviewModal', close: closeClaimReviewModal }
            ];
            modals.forEach(m => {
                const el = document.getElementById(m.id);
                if (el && (el.style.display === 'block' || el.style.display === '')) {
                    // Heuristic: if visible, attempt to close
                    // Some dynamic modals are inserted/removed; guard with try
                    try { m.close(); } catch {}
                }
            });
        } catch {}
    }
});


