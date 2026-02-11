// API Configuration
let API_BASE_URL = 'http://localhost:8080'; // Default to microservices
let authToken = null;
let currentUser = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set up architecture toggle
    const architectureRadios = document.querySelectorAll('input[name="architecture"]');
    architectureRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'microservices') {
                API_BASE_URL = 'http://localhost:8080';
            } else {
                API_BASE_URL = 'http://localhost:9000';
            }
            console.log('Switched to:', API_BASE_URL);
        });
    });

    // Check for existing token
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
        authToken = savedToken;
        verifyToken();
    }

    // Load categories
    loadCategories();
});

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        ...options
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API call failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Login function
async function login(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const data = await apiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        authToken = data.token;
        localStorage.setItem('authToken', authToken);

        // Fetch user profile after login
        await loadProfile();

        // Update UI
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('userSection').style.display = 'flex';
        document.getElementById('userName').textContent = currentUser.full_name;

        // Load user data
        loadFavorites();
        searchListings();

        showMessage('Login successful!', 'success');
    } catch (error) {
        showMessage('Login failed: ' + error.message, 'error');
    }
}

// Logout function
function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');

    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('userSection').style.display = 'none';

    // Clear forms
    document.getElementById('loginForm').reset();
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('favoritesContent').innerHTML = '';
    document.getElementById('profileInfo').innerHTML = '';
}

// Verify token
async function verifyToken() {
    try {
        await loadProfile();
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('userSection').style.display = 'flex';
        document.getElementById('userName').textContent = currentUser.full_name;

        loadFavorites();
        searchListings();
    } catch (error) {
        logout();
    }
}

// Load categories
async function loadCategories() {
    try {
        const data = await apiCall('/api/search/categories');
        const select = document.getElementById('categoryFilter');

        data.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

// Search listings
async function searchListings() {
    const query = document.getElementById('searchQuery').value;
    const category = document.getElementById('categoryFilter').value;

    try {
        let endpoint = '/api/search/listings?limit=20';
        if (query) endpoint += `&query=${encodeURIComponent(query)}`;
        if (category) endpoint += `&category=${encodeURIComponent(category)}`;

        const data = await apiCall(endpoint);
        displayListings(data.results || data.listings, 'searchResults');
    } catch (error) {
        showMessage('Search failed: ' + error.message, 'error');
    }
}

// Load user profile
async function loadProfile() {
    try {
        const data = await apiCall('/api/user/profile');
        currentUser = data.user || data;

        const profileDiv = document.getElementById('profileInfo');
        profileDiv.innerHTML = `
            <div class="profile-info">
                <p><strong>Name:</strong> ${currentUser.full_name}</p>
                <p><strong>Email:</strong> ${currentUser.email}</p>
                <p><strong>Phone:</strong> ${currentUser.phone || 'Not provided'}</p>
                <p><strong>WhatsApp:</strong> ${currentUser.whatsapp || 'Not provided'}</p>
            </div>
        `;
    } catch (error) {
        console.error('Failed to load profile:', error);
        throw error;
    }
}

// Load favorites
async function loadFavorites() {
    try {
        const data = await apiCall('/api/user/favorites');
        displayListings(data.favorites || [], 'favoritesContent');
    } catch (error) {
        console.error('Failed to load favorites:', error);
        document.getElementById('favoritesContent').innerHTML =
            '<p class="loading">No favorites yet</p>';
    }
}

// Display listings in a grid
function displayListings(listings, containerId) {
    const container = document.getElementById(containerId);

    if (!listings || listings.length === 0) {
        container.innerHTML = '<p class="loading">No listings found</p>';
        return;
    }

    container.innerHTML = listings.map(listing => {
        const imageHtml = listing.image_url
            ? `<img src="${listing.image_url}" alt="${listing.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;">`
            : `<div class="listing-image">📸 No Image</div>`;

        return `
            <div class="listing-card" onclick="viewListing('${listing.id}')">
                ${imageHtml}
                <div class="listing-title">${listing.title}</div>
                <div class="listing-price">$${parseFloat(listing.price).toFixed(2)}</div>
                <div class="listing-description">
                    ${listing.description ? listing.description.substring(0, 100) + '...' : 'No description'}
                </div>
                <div class="listing-meta">
                    <span>${listing.category_id || listing.category || 'N/A'}</span>
                    <span>${listing.condition_id || listing.condition || 'N/A'}</span>
                </div>
            </div>
        `;
    }).join('');
}

// View listing details
async function viewListing(listingId) {
    try {
        // Record view in analytics
        await apiCall('/api/analytics/track/view', {
            method: 'POST',
            body: JSON.stringify({ listing_id: listingId })
        }).catch(err => console.log('Analytics tracking optional'));

        // Get listing details
        const data = await apiCall(`/api/listings/${listingId}`);
        const listing = data.listing || data;

        alert(`
Listing Details:
─────────────────
Title: ${listing.title}
Price: $${parseFloat(listing.price).toFixed(2)}
Category: ${listing.category}
Condition: ${listing.condition || 'N/A'}
Description: ${listing.description || 'No description'}

Seller: ${listing.seller_name || 'Unknown'}
Contact: ${listing.seller_email || 'No email'}
Phone: ${listing.phone || 'No phone'}
WhatsApp: ${listing.whatsapp || 'No WhatsApp'}
        `);

        // In a real app, you'd open a modal or navigate to a detail page
    } catch (error) {
        showMessage('Failed to load listing details: ' + error.message, 'error');
    }
}

// Add to favorites
async function addToFavorites(listingId) {
    try {
        await apiCall('/api/user/favorites', {
            method: 'POST',
            body: JSON.stringify({ listing_id: listingId })
        });

        showMessage('Added to favorites!', 'success');
        loadFavorites();
    } catch (error) {
        showMessage('Failed to add favorite: ' + error.message, 'error');
    }
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;

    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);

    setTimeout(() => messageDiv.remove(), 5000);
}

// Add enter key support for search
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchQuery');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchListings();
            }
        });
    }
});
