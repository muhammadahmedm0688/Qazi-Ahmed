/**
 * Readora Online Bookstore - Core Client Application
 * Premium, interactive, client-ready e-commerce logic
 */

(function () {
  'use strict';

  // State Management
  const state = {
    cart: JSON.parse(localStorage.getItem('readora_cart') || '[]'),
    wishlist: JSON.parse(localStorage.getItem('readora_wishlist') || '[]'),
    activeCategory: 'all',
    activeTab: 'featured',
    searchQuery: '',
    selectedBookForModal: null,
    currentTestimonialIndex: 0,
    currentView: 'home', // 'home', 'shop', 'product'
    selectedProductId: null
  };

  // Helper to persist state
  function saveCart() {
    localStorage.setItem('readora_cart', JSON.stringify(state.cart));
    updateBadges();
  }

  function saveWishlist() {
    localStorage.setItem('readora_wishlist', JSON.stringify(state.wishlist));
    updateBadges();
  }

  // Toast Notification
  function showToast(message, icon = 'check-circle') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, 2800);
  }

  // Update Header Badges
  function updateBadges() {
    const cartCountEl = document.getElementById('cartBadgeCount');
    const wishlistCountEl = document.getElementById('wishlistBadgeCount');

    const totalCartItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountEl) {
      cartCountEl.textContent = totalCartItems;
      cartCountEl.style.display = totalCartItems > 0 ? 'flex' : 'none';
    }

    if (wishlistCountEl) {
      wishlistCountEl.textContent = state.wishlist.length;
      wishlistCountEl.style.display = state.wishlist.length > 0 ? 'flex' : 'none';
    }
  }

  // Star Rating Helper
  function renderStars(rating) {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let starsHtml = '';

    for (let i = 0; i < full; i++) {
      starsHtml += `<svg width="14" height="14" fill="#F59E0B" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    }
    if (hasHalf) {
      starsHtml += `<svg width="14" height="14" fill="#F59E0B" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" opacity="0.6"></polygon></svg>`;
    }
    const emptyCount = 5 - full - (hasHalf ? 1 : 0);
    for (let i = 0; i < emptyCount; i++) {
      starsHtml += `<svg width="14" height="14" fill="#E5E7EB" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    }
    return starsHtml;
  }

  // 5. Render Sidebar Categories
  function renderCategories() {
    const list = document.getElementById('sidebarCategoryList');
    if (!list) return;

    list.innerHTML = BOOKSTORE_DATA.categories.map(cat => `
      <li>
        <button class="category-item-btn ${state.activeCategory === cat.id ? 'active' : ''}" data-category-id="${cat.id}">
          <span class="category-btn-left">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            ${cat.name}
          </span>
          <span class="category-count">${cat.count}</span>
        </button>
      </li>
    `).join('');

    // Fill the Category Dropdown inside Search Bar
    const select = document.getElementById('searchCategorySelect');
    if (select && select.children.length <= 1) {
      BOOKSTORE_DATA.categories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        select.appendChild(opt);
      });
    }

    // Attach click events
    list.querySelectorAll('.category-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.getAttribute('data-category-id');
        filterByCategory(catId);
      });
    });
  }

  // 6. Render Weekly Ranking Card (#1 to #5)
  function renderWeeklyRanking() {
    const container = document.getElementById('sidebarWeeklyRanking');
    if (!container) return;

    const ranked = BOOKSTORE_DATA.books.slice(0, 5);
    container.innerHTML = ranked.map((book, idx) => `
      <div class="ranking-item" data-book-id="${book.id}">
        <span class="rank-badge ${idx === 0 ? 'top-1' : idx === 1 ? 'top-2' : idx === 2 ? 'top-3' : ''}">#${idx + 1}</span>
        <div class="ranking-thumb" style="background: ${book.coverGradient};">
          <span>${book.title.slice(0, 15)}..</span>
        </div>
        <div class="ranking-info">
          <div class="ranking-title">${book.title}</div>
          <div class="ranking-author">${book.author}</div>
          <div class="ranking-price">$${book.price.toFixed(2)}</div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.ranking-item').forEach(item => {
      item.addEventListener('click', () => {
        openQuickView(item.getAttribute('data-book-id'));
      });
    });
  }

  // 7. Render Sidebar Bestseller Card
  function renderSidebarBestsellers() {
    const container = document.getElementById('sidebarBestsellerList');
    if (!container) return;

    const bestsellers = BOOKSTORE_DATA.books.filter(b => b.tags.includes('bestseller')).slice(0, 3);
    container.innerHTML = bestsellers.map(book => `
      <div class="sidebar-bestseller-item" data-book-id="${book.id}">
        <div class="ranking-thumb" style="background: ${book.coverGradient};">
          <span>${book.title.slice(0, 12)}..</span>
        </div>
        <div class="ranking-info">
          <div class="ranking-title">${book.title}</div>
          <div class="ranking-author">${book.author}</div>
          <div style="display:flex; align-items:center; gap:4px; margin-top:2px;">
            <span style="display:flex; color:#F59E0B;">${renderStars(book.rating)}</span>
            <span class="ranking-price" style="margin-left:auto;">$${book.price.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.sidebar-bestseller-item').forEach(item => {
      item.addEventListener('click', () => {
        openQuickView(item.getAttribute('data-book-id'));
      });
    });
  }

  // 9. Render Store Stats
  function renderStoreStats() {
    const container = document.getElementById('sidebarStoreStats');
    if (!container) return;

    container.innerHTML = BOOKSTORE_DATA.storeStats.map(stat => `
      <div class="stat-mini-card">
        <div class="stat-mini-icon" style="background-color: ${stat.bg}; color: ${stat.color};">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div class="stat-mini-val">${stat.value}</div>
        <div class="stat-mini-lbl">${stat.label}</div>
      </div>
    `).join('');
  }

  // 11. Render Featured Products Grid
  function renderFeaturedProducts() {
    const grid = document.getElementById('featuredProductGrid');
    if (!grid) return;

    let filtered = BOOKSTORE_DATA.books;

    // Filter by Active Tab
    if (state.activeTab === 'new') {
      filtered = filtered.filter(b => b.tags.includes('new') || b.year === 2024);
    } else if (state.activeTab === 'rated') {
      filtered = filtered.filter(b => b.rating >= 4.8);
    } else if (state.activeTab === 'bestsellers') {
      filtered = filtered.filter(b => b.tags.includes('bestseller'));
    }

    // Filter by Category if selected
    if (state.activeCategory !== 'all') {
      filtered = filtered.filter(b => b.category === state.activeCategory);
    }

    // Filter by search query if any
    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.author.toLowerCase().includes(q) || 
        b.categoryName.toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-box" style="grid-column: 1 / -1;">
          <div class="empty-box-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <h3 style="font-size:1.15rem; font-weight:700; color:var(--color-primary); margin-bottom:6px;">No Books Found</h3>
          <p style="font-size:0.875rem;">Try selecting a different category or clearing your search keywords.</p>
          <button class="btn-primary" style="margin-top:16px; padding:8px 20px; font-size:0.85rem;" onclick="window.readora.resetFilters()">Clear Filters</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(book => {
      const isWishlisted = state.wishlist.includes(book.id);
      return `
        <div class="product-card" data-book-id="${book.id}">
          <div class="card-cover-wrapper" onclick="window.readora.openQuickView('${book.id}')">
            ${book.badge ? `<span class="card-badge" style="background-color: ${book.badgeColor || '#F45A50'};">${book.badge}</span>` : ''}
            
            <button class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" 
                    aria-label="Add to wishlist" 
                    onclick="event.stopPropagation(); window.readora.toggleWishlist('${book.id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="${isWishlisted ? '#F45A50' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>

            <div class="card-book-art" style="background: ${book.coverGradient};">
              <div class="art-category">${book.categoryName}</div>
              <div class="art-title">${book.title}</div>
              <div class="art-author">${book.author}</div>
            </div>

            <div class="card-hover-actions">
              <button class="quick-view-btn" onclick="event.stopPropagation(); window.readora.openQuickView('${book.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Quick View
              </button>
            </div>
          </div>

          <div class="card-details">
            <span class="card-category-label">${book.categoryName}</span>
            <h4 class="card-title" onclick="window.readora.openQuickView('${book.id}')">${book.title}</h4>
            <span class="card-author">${book.author}</span>

            <div class="card-rating-row">
              <div class="rating-stars">${renderStars(book.rating)}</div>
              <span class="rating-count">(${book.reviewsCount})</span>
            </div>

            <div class="card-price-row">
              <div class="price-box">
                <span class="current-price">$${book.price.toFixed(2)}</span>
                ${book.originalPrice ? `<span class="original-price">$${book.originalPrice.toFixed(2)}</span>` : ''}
              </div>
              <button class="add-cart-icon-btn" 
                      aria-label="Add to cart"
                      onclick="window.readora.addToCart('${book.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 14. Deals of the Week
  function renderDealsOfWeek() {
    const container = document.getElementById('dealsContainer');
    if (!container) return;

    const deals = BOOKSTORE_DATA.books.filter(b => b.isDeal).slice(0, 2);
    container.innerHTML = deals.map(book => `
      <div class="deal-large-card" data-book-id="${book.id}">
        <div class="deal-cover-box" style="background: ${book.coverGradient}; cursor:pointer;" onclick="window.readora.openQuickView('${book.id}')">
          <span style="font-size:0.6rem; font-weight:700; text-transform:uppercase; color:rgba(255,255,255,0.7);">${book.categoryName}</span>
          <div style="font-weight:800; font-size:0.95rem; line-height:1.2; margin-top:auto;">${book.title}</div>
          <span style="font-size:0.7rem; color:rgba(255,255,255,0.85);">${book.author}</span>
        </div>

        <div class="deal-content">
          <div>
            <span class="deal-discount-pill">${book.dealDiscount || '25% Off'}</span>
            <h4 class="deal-title" style="cursor:pointer;" onclick="window.readora.openQuickView('${book.id}')">${book.title}</h4>
            <div class="deal-author">By ${book.author}</div>
            <p class="deal-synopsis">${book.description}</p>
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px;">
            <div class="price-box">
              <span class="current-price" style="font-size:1.25rem;">$${book.price.toFixed(2)}</span>
              <span class="original-price" style="font-size:0.9rem;">$${book.originalPrice.toFixed(2)}</span>
            </div>
            <button class="btn-primary" style="padding:8px 18px; font-size:0.85rem;" onclick="window.readora.addToCart('${book.id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Real-Time Countdown Timer for Deals
  function startCountdownTimer() {
    let secondsLeft = 14 * 3600 + 42 * 60 + 18; // 14h 42m 18s

    const hoursEl = document.getElementById('dealHours');
    const minsEl = document.getElementById('dealMinutes');
    const secsEl = document.getElementById('dealSeconds');

    setInterval(() => {
      if (secondsLeft <= 0) {
        secondsLeft = 24 * 3600; // Reset next cycle
      } else {
        secondsLeft--;
      }

      const h = Math.floor(secondsLeft / 3600);
      const m = Math.floor((secondsLeft % 3600) / 60);
      const s = secondsLeft % 60;

      if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
      if (minsEl) minsEl.textContent = String(m).padStart(2, '0');
      if (secsEl) secsEl.textContent = String(s).padStart(2, '0');
    }, 1000);
  }

  // 16. Three-Column Product Summary
  function renderThreeColumnSummaries() {
    const topSellingEl = document.getElementById('summaryTopSelling');
    const trendingEl = document.getElementById('summaryTrending');
    const recentEl = document.getElementById('summaryRecent');

    if (topSellingEl) {
      const topSelling = BOOKSTORE_DATA.books.slice(0, 4);
      topSellingEl.innerHTML = topSelling.map(book => createSummaryRow(book)).join('');
    }

    if (trendingEl) {
      const trending = BOOKSTORE_DATA.books.slice(4, 8);
      trendingEl.innerHTML = trending.map(book => createSummaryRow(book)).join('');
    }

    if (recentEl) {
      const recent = BOOKSTORE_DATA.books.slice(8, 12);
      recentEl.innerHTML = recent.map(book => createSummaryRow(book)).join('');
    }
  }

  function createSummaryRow(book) {
    return `
      <div class="summary-row-item" onclick="window.readora.openQuickView('${book.id}')">
        <div class="summary-thumb" style="background: ${book.coverGradient};">
          <span style="font-weight:700;">${book.title.slice(0, 10)}</span>
        </div>
        <div class="summary-info">
          <div class="summary-book-title">${book.title}</div>
          <div class="summary-book-author">${book.author}</div>
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; color:#F59E0B;">${renderStars(book.rating)}</div>
            <div class="summary-book-price">$${book.price.toFixed(2)}</div>
          </div>
        </div>
      </div>
    `;
  }

  // 18. Featured Bookstores
  function renderFeaturedBookstores() {
    const container = document.getElementById('bookstoresGrid');
    if (!container) return;

    container.innerHTML = BOOKSTORE_DATA.featuredBookstores.map(store => `
      <div class="bookstore-card">
        <img class="bookstore-img-top" src="${store.image}" alt="${store.name} interior" loading="lazy">
        <div class="bookstore-body">
          <span class="bookstore-badge" style="background-color: ${store.badgeColor};">${store.badge}</span>
          <div class="bookstore-name">${store.name}</div>
          <div class="bookstore-loc">${store.location}</div>
          <div class="bookstore-count">${store.titlesCount}</div>
        </div>
      </div>
    `).join('');
  }

  // 19. Testimonial Slider
  function renderTestimonials() {
    const container = document.getElementById('testimonialCard');
    const dotsContainer = document.getElementById('testimonialDots');
    if (!container) return;

    const t = BOOKSTORE_DATA.testimonials[state.currentTestimonialIndex];
    container.innerHTML = `
      <div class="testimonial-quote-icon">“</div>
      <p class="testimonial-text">"${t.quote}"</p>
      <div class="testimonial-author-box">
        <div class="testimonial-avatar">${t.avatarInitials}</div>
        <div class="testimonial-info">
          <div class="testimonial-name">${t.author}</div>
          <div class="testimonial-role">${t.role} • ${t.location}</div>
        </div>
      </div>
    `;

    if (dotsContainer) {
      dotsContainer.innerHTML = BOOKSTORE_DATA.testimonials.map((_, i) => `
        <div class="t-dot ${i === state.currentTestimonialIndex ? 'active' : ''}" onclick="window.readora.setTestimonial(${i})"></div>
      `).join('');
    }
  }

  function setTestimonial(index) {
    state.currentTestimonialIndex = index;
    renderTestimonials();
  }

  // 21. Cart Drawer Logic
  function addToCart(bookId) {
    const book = BOOKSTORE_DATA.books.find(b => b.id === bookId);
    if (!book) return;

    const existing = state.cart.find(item => item.id === bookId);
    if (existing) {
      existing.quantity += 1;
    } else {
      state.cart.push({
        id: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        coverGradient: book.coverGradient,
        quantity: 1
      });
    }

    saveCart();
    showToast(`Added "${book.title}" to cart!`);
    renderCartDrawer();
  }

  function updateCartQuantity(bookId, delta) {
    const item = state.cart.find(i => i.id === bookId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      state.cart = state.cart.filter(i => i.id !== bookId);
    }

    saveCart();
    renderCartDrawer();
  }

  function removeFromCart(bookId) {
    state.cart = state.cart.filter(i => i.id !== bookId);
    saveCart();
    renderCartDrawer();
    showToast('Item removed from cart.');
  }

  function renderCartDrawer() {
    const body = document.getElementById('cartDrawerBody');
    const subtotalEl = document.getElementById('cartSubtotalAmount');
    if (!body) return;

    if (state.cart.length === 0) {
      body.innerHTML = `
        <div class="empty-box">
          <div class="empty-box-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h4 style="font-weight:700; color:var(--color-primary); margin-bottom:4px;">Your cart is empty</h4>
          <p style="font-size:0.85rem; color:var(--color-text-muted);">Explore our curated collection to discover your next favorite read.</p>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = '$0.00';
      return;
    }

    let subtotal = 0;
    body.innerHTML = state.cart.map(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      return `
        <div class="drawer-item">
          <div class="drawer-item-thumb" style="background: ${item.coverGradient};">
            <span>${item.title.slice(0, 10)}</span>
          </div>
          <div class="drawer-item-info">
            <div class="drawer-item-title">${item.title}</div>
            <div class="drawer-item-price">$${item.price.toFixed(2)}</div>
            <div class="drawer-qty-controls">
              <button class="qty-btn" onclick="window.readora.updateCartQuantity('${item.id}', -1)">-</button>
              <span style="font-weight:700; font-size:0.875rem;">${item.quantity}</span>
              <button class="qty-btn" onclick="window.readora.updateCartQuantity('${item.id}', 1)">+</button>
              <button style="margin-left:auto; color:#EF4444; font-size:0.75rem; font-weight:600;" onclick="window.readora.removeFromCart('${item.id}')">Remove</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  }

  // Wishlist Logic
  function toggleWishlist(bookId) {
    const book = BOOKSTORE_DATA.books.find(b => b.id === bookId);
    if (!book) return;

    const idx = state.wishlist.indexOf(bookId);
    if (idx >= 0) {
      state.wishlist.splice(idx, 1);
      showToast(`Removed "${book.title}" from wishlist.`);
    } else {
      state.wishlist.push(bookId);
      showToast(`Saved "${book.title}" to wishlist!`);
    }

    saveWishlist();
    renderFeaturedProducts();
    renderWishlistDrawer();
  }

  function renderWishlistDrawer() {
    const body = document.getElementById('wishlistDrawerBody');
    if (!body) return;

    if (state.wishlist.length === 0) {
      body.innerHTML = `
        <div class="empty-box">
          <div class="empty-box-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <h4 style="font-weight:700; color:var(--color-primary); margin-bottom:4px;">No saved books yet</h4>
          <p style="font-size:0.85rem; color:var(--color-text-muted);">Tap the heart icon on any book to curate your personal reading wishlist.</p>
        </div>
      `;
      return;
    }

    const savedBooks = BOOKSTORE_DATA.books.filter(b => state.wishlist.includes(b.id));
    body.innerHTML = savedBooks.map(book => `
      <div class="drawer-item">
        <div class="drawer-item-thumb" style="background: ${book.coverGradient};">
          <span>${book.title.slice(0, 10)}</span>
        </div>
        <div class="drawer-item-info">
          <div class="drawer-item-title">${book.title}</div>
          <div class="drawer-item-price">$${book.price.toFixed(2)}</div>
          <div style="display:flex; gap:8px; margin-top:8px;">
            <button class="btn-primary" style="padding:4px 12px; font-size:0.75rem;" onclick="window.readora.addToCart('${book.id}')">Add to Cart</button>
            <button style="color:#6B7280; font-size:0.75rem;" onclick="window.readora.toggleWishlist('${book.id}')">Remove</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Quick View Modal
  function openQuickView(bookId) {
    const book = BOOKSTORE_DATA.books.find(b => b.id === bookId);
    if (!book) return;

    const modalBackdrop = document.getElementById('quickViewModal');
    const modalContent = document.getElementById('modalBookContent');
    if (!modalBackdrop || !modalContent) return;

    const isWishlisted = state.wishlist.includes(book.id);

    modalContent.innerHTML = `
      <div class="modal-cover-preview" style="background: ${book.coverGradient};">
        <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:rgba(255,255,255,0.7);">${book.categoryName}</span>
        <div style="font-size:1.35rem; font-weight:800; line-height:1.2; margin-top:auto;">${book.title}</div>
        <span style="font-size:0.85rem; color:rgba(255,255,255,0.85);">${book.author}</span>
        <span style="font-size:0.75rem; background:rgba(255,255,255,0.2); padding:3px 8px; border-radius:4px; margin-top:10px; align-self:flex-start;">${book.format}</span>
      </div>

      <div style="display:flex; flex-direction:column;">
        <span style="font-size:0.75rem; font-weight:700; color:var(--color-accent); text-transform:uppercase; margin-bottom:4px;">${book.categoryName}</span>
        <h3 class="modal-book-title">${book.title}</h3>
        <div class="modal-book-author">By <strong style="color:var(--color-primary);">${book.author}</strong></div>

        <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
          <div style="display:flex; color:#F59E0B;">${renderStars(book.rating)}</div>
          <span style="font-size:0.85rem; font-weight:700; color:var(--color-text-main);">${book.rating}</span>
          <span style="font-size:0.8rem; color:var(--color-text-muted);">(${book.reviewsCount} customer reviews)</span>
        </div>

        <div class="price-box" style="margin-bottom:16px;">
          <span class="current-price" style="font-size:1.6rem;">$${book.price.toFixed(2)}</span>
          ${book.originalPrice ? `<span class="original-price" style="font-size:1.05rem;">$${book.originalPrice.toFixed(2)}</span>` : ''}
          ${book.dealDiscount ? `<span style="background:#FFF1F0; color:var(--color-accent); padding:2px 8px; border-radius:99px; font-size:0.75rem; font-weight:700;">${book.dealDiscount}</span>` : ''}
        </div>

        <p class="modal-book-desc">${book.description}</p>

        <table class="modal-specs-table">
          <tbody>
            <tr><td>Publisher</td><td>${book.publisher} (${book.year})</td></tr>
            <tr><td>ISBN-13</td><td>${book.isbn}</td></tr>
            <tr><td>Pages & Format</td><td>${book.pages} pages, ${book.format}</td></tr>
            <tr><td>Language</td><td>${book.language}</td></tr>
          </tbody>
        </table>

        <div style="display:flex; gap:12px; margin-top:auto;">
          <button class="btn-primary" style="flex:1; justify-content:center;" onclick="window.readora.addToCart('${book.id}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Add to Cart
          </button>
          <button class="btn-secondary" style="color:var(--color-primary); border-color:var(--color-border);" onclick="window.readora.toggleWishlist('${book.id}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? '#F45A50' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('active');
  }

  function closeModal() {
    const modalBackdrop = document.getElementById('quickViewModal');
    if (modalBackdrop) modalBackdrop.classList.remove('active');
  }

  // Drawers Toggle
  function openCartDrawer() {
    renderCartDrawer();
    document.getElementById('cartDrawer')?.classList.add('active');
    document.getElementById('drawerBackdrop')?.classList.add('active');
  }

  function openWishlistDrawer() {
    renderWishlistDrawer();
    document.getElementById('wishlistDrawer')?.classList.add('active');
    document.getElementById('drawerBackdrop')?.classList.add('active');
  }

  function closeAllDrawers() {
    document.getElementById('cartDrawer')?.classList.remove('active');
    document.getElementById('wishlistDrawer')?.classList.remove('active');
    document.getElementById('drawerBackdrop')?.classList.remove('active');
    document.getElementById('mobileNavDrawer')?.classList.remove('active');
  }

  function toggleMobileNav() {
    const drawer = document.getElementById('mobileNavDrawer');
    const backdrop = document.getElementById('drawerBackdrop');
    drawer?.classList.toggle('active');
    backdrop?.classList.toggle('active');
  }

  // Filter Handlers
  function filterByCategory(catId) {
    state.activeCategory = catId;
    renderCategories();
    renderFeaturedProducts();

    // Scroll smoothly to featured section
    const sec = document.getElementById('featuredSection');
    if (sec) sec.scrollIntoView({ behavior: 'smooth' });
  }

  function resetFilters() {
    state.activeCategory = 'all';
    state.activeTab = 'featured';
    state.searchQuery = '';
    const searchInput = document.getElementById('headerSearchInput');
    if (searchInput) searchInput.value = '';
    renderCategories();
    renderFeaturedProducts();
  }

  function switchTab(tabName) {
    state.activeTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });
    renderFeaturedProducts();
  }

  // Checkout Simulation
  function proceedToCheckout() {
    if (state.cart.length === 0) {
      showToast('Your cart is empty.');
      return;
    }
    const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    showToast(`Order placed for $${total.toFixed(2)}! Thank you for ordering.`);
    state.cart = [];
    saveCart();
    closeAllDrawers();
  }

  // Newsletter Validation
  function setupNewsletter() {
    const form = document.getElementById('newsletterForm');
    const input = document.getElementById('newsletterEmail');
    const successBox = document.getElementById('newsletterSuccess');

    if (!form || !input) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = input.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address.');
        input.focus();
        return;
      }

      form.style.display = 'none';
      if (successBox) {
        successBox.style.display = 'block';
      }
      showToast('Welcome to Readora! 10% discount coupon applied.');
    });
  }

  // Header Scroll Effect
  function setupStickyHeader() {
    const header = document.getElementById('mainHeader');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    });
  }

  // Search Input Setup
  function setupSearch() {
    const searchInput = document.getElementById('headerSearchInput');
    const searchBtn = document.getElementById('headerSearchBtn');
    const categorySelect = document.getElementById('searchCategorySelect');

    function performSearch() {
      state.searchQuery = searchInput?.value || '';
      if (categorySelect && categorySelect.value) {
        state.activeCategory = categorySelect.value;
      }
      renderFeaturedProducts();
      document.getElementById('featuredSection')?.scrollIntoView({ behavior: 'smooth' });
    }

    searchBtn?.addEventListener('click', performSearch);
    searchInput?.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') performSearch();
    });
  }

  // Expose global methods
  window.readora = {
    addToCart,
    updateCartQuantity,
    removeFromCart,
    toggleWishlist,
    openQuickView,
    closeModal,
    openCartDrawer,
    openWishlistDrawer,
    closeAllDrawers,
    toggleMobileNav,
    filterByCategory,
    resetFilters,
    switchTab,
    setTestimonial,
    proceedToCheckout
  };

  // Initialization
  document.addEventListener('DOMContentLoaded', () => {
    updateBadges();
    renderCategories();
    renderWeeklyRanking();
    renderSidebarBestsellers();
    renderStoreStats();
    renderFeaturedProducts();
    renderDealsOfWeek();
    renderThreeColumnSummaries();
    renderFeaturedBookstores();
    renderTestimonials();
    startCountdownTimer();
    setupNewsletter();
    setupStickyHeader();
    setupSearch();

    // Backdrop click close
    document.getElementById('drawerBackdrop')?.addEventListener('click', closeAllDrawers);
    document.getElementById('quickViewModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'quickViewModal') closeModal();
    });

    // Escape key listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        closeAllDrawers();
      }
    });
  });

})();
