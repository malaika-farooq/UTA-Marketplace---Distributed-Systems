// =============================================
// API Configuration
// =============================================
let API_BASE_URL = 'http://localhost:8080';
let authToken = null;
let currentUser = null;

// =============================================
// Initialization
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Architecture toggle
    const architectureRadios = document.querySelectorAll('input[name="architecture"]');
    architectureRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            API_BASE_URL = e.target.value === 'microservices'
                ? 'http://localhost:8080'
                : 'http://localhost:9000';
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

    // Enter key for search
    const searchInput = document.getElementById('searchQuery');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchListings();
        });
    }
});

// =============================================
// Tab Navigation
// =============================================
function switchTab(tabName, evt) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    document.getElementById('tab-' + tabName).classList.add('active');
    if (evt && evt.target) evt.target.classList.add('active');

    // Auto-load data for tabs
    if (tabName === 'analytics') {
        loadTrending();
    } else if (tabName === 'messaging') {
        loadContactHistory();
    }
}

// =============================================
// API Helper
// =============================================
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
        if (!response.ok) throw new Error(data.error || 'API call failed');
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// =============================================
// Auth Functions
// =============================================
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
        await loadProfile();

        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('userSection').style.display = 'flex';
        document.getElementById('userName').textContent = currentUser.full_name;

        loadFavorites();
        searchListings();
        showMessage('Login successful!', 'success');
    } catch (error) {
        showMessage('Login failed: ' + error.message, 'error');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');

    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('userSection').style.display = 'none';
    document.getElementById('loginForm').reset();
}

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

// =============================================
// Search Functions
// =============================================
async function loadCategories() {
    try {
        const data = await apiCall('/api/search/categories');
        const select = document.getElementById('categoryFilter');
        const categories = Array.isArray(data) ? data : (data.categories || []);
        categories.forEach(category => {
            const option = document.createElement('option');
            if (typeof category === 'object') {
                option.value = category.id;
                option.textContent = category.name;
            } else {
                option.value = category;
                option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            }
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

async function searchListings() {
    const query = document.getElementById('searchQuery').value;
    const category = document.getElementById('categoryFilter').value;

    try {
        let endpoint = '/api/search/listings?limit=20';
        if (query) endpoint += `&query=${encodeURIComponent(query)}`;
        if (category) endpoint += `&category_id=${encodeURIComponent(category)}`;

        const data = await apiCall(endpoint);
        displayListings(data.results || data.listings, 'searchResults', true);
    } catch (error) {
        showMessage('Search failed: ' + error.message, 'error');
    }
}

// =============================================
// USER SERVICE: Profile Functions
// =============================================
async function loadProfile() {
    try {
        const data = await apiCall('/api/user/profile');
        currentUser = data.user || data;

        const profileDiv = document.getElementById('profileInfo');
        profileDiv.innerHTML = `
            <div class="profile-info">
                <div class="profile-field"><strong>Name:</strong> <span>${currentUser.full_name}</span></div>
                <div class="profile-field"><strong>Email:</strong> <span>${currentUser.email}</span></div>
                <div class="profile-field"><strong>Phone:</strong> <span>${currentUser.phone || 'Not provided'}</span></div>
                <div class="profile-field"><strong>WhatsApp:</strong> <span>${currentUser.whatsapp || 'Not provided'}</span></div>
            </div>
        `;
    } catch (error) {
        console.error('Failed to load profile:', error);
        throw error;
    }
}

function toggleEditProfile() {
    const form = document.getElementById('editProfileForm');
    const btn = document.getElementById('editProfileBtn');
    const isHidden = form.style.display === 'none';

    form.style.display = isHidden ? 'block' : 'none';
    btn.style.display = isHidden ? 'none' : 'inline-block';

    if (isHidden && currentUser) {
        document.getElementById('editFullName').value = currentUser.full_name || '';
        document.getElementById('editPhone').value = currentUser.phone || '';
        document.getElementById('editWhatsApp').value = currentUser.whatsapp || '';
    }
}

async function updateProfile(event) {
    event.preventDefault();

    try {
        const data = {
            full_name: document.getElementById('editFullName').value,
            phone: document.getElementById('editPhone').value,
            whatsapp: document.getElementById('editWhatsApp').value
        };

        await apiCall('/api/user/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });

        await loadProfile();
        toggleEditProfile();
        document.getElementById('userName').textContent = data.full_name;
        showMessage('Profile updated successfully!', 'success');
    } catch (error) {
        showMessage('Failed to update profile: ' + error.message, 'error');
    }
}

// =============================================
// FAVORITES SERVICE: Favorites Functions
// =============================================
async function loadFavorites() {
    try {
        const data = await apiCall('/api/favorites');
        displayListings(data.favorites || [], 'favoritesContent', false, true);
    } catch (error) {
        console.error('Failed to load favorites:', error);
        document.getElementById('favoritesContent').innerHTML =
            '<p class="loading">No favorites yet</p>';
    }
}

async function addToFavorites(listingId) {
    try {
        await apiCall(`/api/favorites/${listingId}`, {
            method: 'POST'
        });
        showMessage('Added to favorites!', 'success');
        loadFavorites();

        // Update all favorite buttons for this listing to "Favorited" state
        document.querySelectorAll(`[data-fav-id="${listingId}"]`).forEach(btn => {
            btn.textContent = 'Favorited';
            btn.className = 'btn btn-small btn-favorited';
            btn.setAttribute('onclick', btn.getAttribute('onclick').replace('addToFavorites', 'removeFromFavorites'));
        });
        // Also update modal button if present
        const modalFavBtn = document.getElementById('modalFavBtn');
        if (modalFavBtn && modalFavBtn.dataset.listingId === listingId) {
            modalFavBtn.textContent = 'Favorited';
            modalFavBtn.className = 'btn btn-favorited';
            modalFavBtn.onclick = () => removeFromFavorites(listingId);
        }
    } catch (error) {
        showMessage('Failed to add favorite: ' + error.message, 'error');
    }
}

async function removeFromFavorites(listingId) {
    try {
        await apiCall(`/api/favorites/${listingId}`, {
            method: 'DELETE'
        });
        showMessage('Removed from favorites', 'success');
        loadFavorites();

        // Update all favorite buttons for this listing back to "Favorite" state
        document.querySelectorAll(`[data-fav-id="${listingId}"]`).forEach(btn => {
            btn.textContent = 'Favorite';
            btn.className = 'btn btn-small btn-secondary';
            btn.setAttribute('onclick', btn.getAttribute('onclick').replace('removeFromFavorites', 'addToFavorites'));
        });
        // Also update modal button if present
        const modalFavBtn = document.getElementById('modalFavBtn');
        if (modalFavBtn && modalFavBtn.dataset.listingId === listingId) {
            modalFavBtn.textContent = 'Add to Favorites';
            modalFavBtn.className = 'btn btn-secondary';
            modalFavBtn.onclick = () => addToFavorites(listingId);
        }
    } catch (error) {
        showMessage('Failed to remove favorite: ' + error.message, 'error');
    }
}

// =============================================
// MESSAGING SERVICE Functions
// =============================================
async function contactSeller(listingId, sellerId, contactMethod) {
    try {
        await apiCall('/api/messaging/initiate', {
            method: 'POST',
            body: JSON.stringify({
                listing_id: listingId,
                seller_id: sellerId,
                contact_method: contactMethod || 'email'
            })
        });

        showMessage('Contact request sent!', 'success');

        // Get seller contact info
        const contactInfo = await apiCall(`/api/messaging/contact/${sellerId}/${listingId}`);
        const info = contactInfo.contact_info || contactInfo;

        let contactHtml = '<h3>Seller Contact Info</h3>';
        if (info.email) contactHtml += `<p><strong>Email:</strong> ${info.email}</p>`;
        if (info.phone) contactHtml += `<p><strong>Phone:</strong> ${info.phone}</p>`;
        if (info.whatsapp) contactHtml += `<p><strong>WhatsApp:</strong> <a href="https://wa.me/${info.whatsapp}" target="_blank">${info.whatsapp}</a></p>`;

        document.getElementById('modalBody').innerHTML = contactHtml;
        document.getElementById('listingModal').style.display = 'flex';

        loadContactHistory();
    } catch (error) {
        showMessage('Failed to contact seller: ' + error.message, 'error');
    }
}

async function loadContactHistory() {
    try {
        const data = await apiCall('/api/messaging/history');
        const history = data.attempts || [];
        const container = document.getElementById('contactHistory');

        if (!history || !Array.isArray(history) || history.length === 0) {
            container.innerHTML = '<p class="loading">No contact history yet. Browse listings and contact sellers!</p>';
            return;
        }

        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Listing</th>
                        <th>Contact Method</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${history.map(item => `
                        <tr>
                            <td>${item.listing_title || item.listing_id || 'Unknown'}</td>
                            <td>${item.contact_method || 'email'}</td>
                            <td>${item.timestamp && item.timestamp !== '0' ? new Date(parseInt(item.timestamp) * 1000).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Failed to load contact history:', error);
        document.getElementById('contactHistory').innerHTML =
            '<p class="loading">Failed to load contact history.</p>';
    }
}

// =============================================
// ANALYTICS SERVICE Functions
// =============================================
async function loadTrending() {
    try {
        const timeWindow = document.getElementById('trendingTimeWindow').value;
        const data = await apiCall(`/api/analytics/trending?limit=10&time_window=${timeWindow}`);
        const listings = data.listings || data;
        const container = document.getElementById('trendingResults');

        if (!listings || !Array.isArray(listings) || listings.length === 0) {
            container.innerHTML = '<p class="loading">No trending listings yet. Browse some listings first!</p>';
            return;
        }

        container.innerHTML = listings.map((listing, index) => `
            <div class="listing-card trending-card">
                <div class="trending-rank">#${index + 1}</div>
                <div class="listing-title">${listing.title || 'Unknown'}</div>
                <div class="listing-price">$${parseFloat(listing.price).toFixed(2)}</div>
                <div class="listing-meta">
                    <span>Views: ${listing.view_count || 0}</span>
                    <span>Contacts: ${listing.contact_count || 0}</span>
                </div>
                <div class="trend-score">Trend Score: ${parseFloat(listing.trend_score || 0).toFixed(1)}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load trending:', error);
        document.getElementById('trendingResults').innerHTML =
            '<p class="loading">Failed to load trending listings.</p>';
    }
}

async function loadRecommendations() {
    try {
        const data = await apiCall('/api/analytics/recommendations?limit=10');
        const recommendations = data.recommendations || data;
        const container = document.getElementById('recommendationsResults');

        if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
            container.innerHTML = '<p class="loading">No recommendations yet. Add some favorites first to get personalized suggestions!</p>';
            return;
        }

        container.innerHTML = recommendations.map(rec => `
            <div class="listing-card recommendation-card">
                <div class="listing-title">${rec.title || 'Unknown'}</div>
                <div class="listing-price">$${parseFloat(rec.price).toFixed(2)}</div>
                <div class="recommendation-reason">${rec.reason || 'Recommended for you'}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load recommendations:', error);
        document.getElementById('recommendationsResults').innerHTML =
            '<p class="loading">Failed to load recommendations.</p>';
    }
}

async function loadUserStats() {
    try {
        const data = await apiCall('/api/analytics/user/stats');
        const stats = data.analytics || data;
        const container = document.getElementById('userStats');

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${stats.listings_created || 0}</div>
                    <div class="stat-label">Listings Created</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.active_listings || 0}</div>
                    <div class="stat-label">Active Listings</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.total_views_received || 0}</div>
                    <div class="stat-label">Total Views</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.contacts_received || 0}</div>
                    <div class="stat-label">Contacts Received</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.favorites_count || 0}</div>
                    <div class="stat-label">Favorites</div>
                </div>
            </div>
            ${stats.most_viewed_categories && stats.most_viewed_categories.length > 0 ? `
                <div style="margin-top: 15px;">
                    <strong>Most Viewed Categories:</strong>
                    ${stats.most_viewed_categories.map(c => `<span class="category-tag">${c}</span>`).join(' ')}
                </div>
            ` : ''}
        `;
    } catch (error) {
        console.error('Failed to load user stats:', error);
        document.getElementById('userStats').innerHTML =
            '<p class="loading">Failed to load user analytics.</p>';
    }
}

// =============================================
// Display Listings (shared renderer)
// =============================================
function displayListings(listings, containerId, showActions, showRemoveFav) {
    const container = document.getElementById(containerId);

    if (!listings || listings.length === 0) {
        container.innerHTML = '<p class="loading">No listings found</p>';
        return;
    }

    container.innerHTML = listings.map(listing => {
        const imageHtml = listing.image_url
            ? `<img src="${listing.image_url}" alt="${listing.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;">`
            : `<div class="listing-image">No Image</div>`;

        let actionsHtml = '';
        if (showActions) {
            actionsHtml = `
                <div class="listing-actions">
                    <button class="btn btn-small btn-primary" onclick="event.stopPropagation(); viewListing('${listing.id}')">View Details</button>
                    <button class="btn btn-small btn-secondary" data-fav-id="${listing.id}" onclick="event.stopPropagation(); addToFavorites('${listing.id}')">Favorite</button>
                </div>
            `;
        }

        if (showRemoveFav) {
            actionsHtml = `
                <div class="listing-actions">
                    <button class="btn btn-small btn-danger" onclick="event.stopPropagation(); removeFromFavorites('${listing.listing_id || listing.id}')">Remove</button>
                </div>
            `;
        }

        return `
            <div class="listing-card" onclick="viewListing('${listing.id || listing.listing_id}')">
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
                ${actionsHtml}
            </div>
        `;
    }).join('');
}

// =============================================
// Listing Detail Modal with Contact Seller
// =============================================
async function viewListing(listingId) {
    if (!listingId || listingId === 'undefined') return;

    try {
        // Track view (fire and forget)
        apiCall('/api/analytics/track/view', {
            method: 'POST',
            body: JSON.stringify({ listing_id: listingId })
        }).catch(() => {});

        // Get listing details
        const data = await apiCall(`/api/listings/${listingId}`);
        const listing = data.listing || data;

        // Fetch seller contact info and favorite status in parallel
        let sellerName = '';
        let sellerEmail = listing.seller_email || '';
        let sellerPhone = '';
        let sellerWhatsApp = listing.seller_whatsapp || '';
        let isFavorited = false;

        const promises = [];

        if (listing.seller_id) {
            promises.push(
                apiCall(`/api/messaging/contact/${listing.seller_id}/${listingId}`)
                    .then(contactData => {
                        const info = contactData.contact_info || contactData;
                        sellerName = info.full_name || '';
                        sellerEmail = info.email || sellerEmail;
                        sellerPhone = info.phone || '';
                        sellerWhatsApp = info.whatsapp || sellerWhatsApp;
                    })
                    .catch(e => console.log('Could not fetch seller contact info:', e))
            );
        }

        promises.push(
            apiCall(`/api/favorites/${listingId}/check`)
                .then(data => { isFavorited = data.is_favorite; })
                .catch(() => { isFavorited = false; })
        );

        await Promise.all(promises);

        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>${listing.title}</h2>
            ${listing.image_url ? `<img src="${listing.image_url}" alt="${listing.title}" style="width: 100%; max-height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;">` : ''}
            <div class="modal-details">
                <div class="modal-price">$${parseFloat(listing.price).toFixed(2)}</div>
                <div class="modal-meta">
                    <span><strong>Category:</strong> ${listing.category_id || listing.category || 'N/A'}</span>
                    <span><strong>Condition:</strong> ${listing.condition_id || listing.condition || 'N/A'}</span>
                </div>
                <p><strong>Description:</strong> ${listing.description || 'No description'}</p>
                <hr>
                <h3>Seller Information</h3>
                <p><strong>Name:</strong> ${sellerName || 'N/A'}</p>
                <p><strong>Email:</strong> ${sellerEmail || 'N/A'}</p>
                <p><strong>Phone:</strong> ${sellerPhone || 'N/A'}</p>
                <p><strong>WhatsApp:</strong> ${sellerWhatsApp ? `<a href="https://wa.me/${sellerWhatsApp.replace(/\\D/g, '')}" target="_blank">${sellerWhatsApp}</a>` : 'N/A'}</p>
                <hr>
                <h3>Actions</h3>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="contactSeller('${listing.id}', '${listing.seller_id}', 'email')">Contact via Email</button>
                    <button class="btn btn-primary" onclick="contactSeller('${listing.id}', '${listing.seller_id}', 'whatsapp')">Contact via WhatsApp</button>
                    <button id="modalFavBtn" data-listing-id="${listing.id}" class="btn ${isFavorited ? 'btn-favorited' : 'btn-secondary'}" onclick="${isFavorited ? `removeFromFavorites('${listing.id}')` : `addToFavorites('${listing.id}')`}">${isFavorited ? 'Favorited' : 'Add to Favorites'}</button>
                </div>
            </div>
        `;

        document.getElementById('listingModal').style.display = 'flex';
    } catch (error) {
        showMessage('Failed to load listing details: ' + error.message, 'error');
    }
}

function closeModal() {
    document.getElementById('listingModal').style.display = 'none';
}

// Close modal on outside click
window.addEventListener('click', (e) => {
    if (e.target.id === 'listingModal') closeModal();
});

// =============================================
// Utility Functions
// =============================================
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;

    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);

    setTimeout(() => messageDiv.remove(), 5000);
}
