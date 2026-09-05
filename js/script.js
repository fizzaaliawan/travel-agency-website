/**
 * Pakistan Horizons - Main Interactive Engine
 * Handles Navigation, Theme Toggle, Destination Filters, Booking Modal,
 * Package Calculator, Currency Converter, Reviews & Toast Notifications.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initThemeToggle();
  initDestinationFilters();
  initBookingModal();
  initTripCalculator();
  initCurrencyConverter();
  initFAQAccordion();
  initReviewSystem();
  initFloatingActions();
  initContactForms();
});

/* ==========================================================================
   1. NAVBAR & MOBILE NAVIGATION
   ========================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking outside or on a link
    document.querySelectorAll('.nav-link:not(.dropdown-toggle), .dropdown-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navMenu.classList.remove('active');
      });
    });
  }

  // Active page highlight
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .dropdown-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ==========================================================================
   2. DARK / LIGHT THEME TOGGLE
   ========================================================================== */
function initThemeToggle() {
  const themeBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('ph_theme') || 'light';

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(themeBtn, savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('ph_theme', newTheme);
      updateThemeIcon(themeBtn, newTheme);
      showToast(`Switched to ${newTheme} mode`, 'info');
    });
  }
}

function updateThemeIcon(btn, theme) {
  if (!btn) return;
  if (theme === 'dark') {
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>`;
  } else {
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>`;
  }
}

/* ==========================================================================
   3. DESTINATION FILTERS & LIVE SEARCH
   ========================================================================== */
function initDestinationFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.destination-card');
  const searchInput = document.getElementById('destSearchInput');
  const categorySelect = document.getElementById('destCategorySelect');

  function filterCards() {
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    const filterCat = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
    const selectCat = categorySelect ? categorySelect.value : 'all';
    const query = (searchInput?.value || '').toLowerCase().trim();

    cards.forEach(card => {
      const cardCategory = card.dataset.category || '';
      const cardTitle = (card.querySelector('.card-title')?.textContent || '').toLowerCase();
      const cardText = (card.querySelector('.card-text')?.textContent || '').toLowerCase();
      const cardLocation = (card.querySelector('.card-location')?.textContent || '').toLowerCase();

      const matchesBtnCat = filterCat === 'all' || cardCategory.includes(filterCat);
      const matchesSelectCat = selectCat === 'all' || cardCategory.includes(selectCat);
      const matchesQuery = !query || cardTitle.includes(query) || cardText.includes(query) || cardLocation.includes(query);

      if (matchesBtnCat && matchesSelectCat && matchesQuery) {
        card.style.display = 'flex';
        card.style.animation = 'fadeInDown 0.4s ease';
      } else {
        card.style.display = 'none';
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterCards();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', filterCards);
  }

  // Quick Hero Search Form
  const heroSearchForm = document.getElementById('heroSearchForm');
  if (heroSearchForm) {
    heroSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const destTarget = document.getElementById('destinations');
      if (destTarget) {
        destTarget.scrollIntoView({ behavior: 'smooth' });
      }
      filterCards();
    });
  }
}

/* ==========================================================================
   4. INTERACTIVE BOOKING MODAL & FLOW
   ========================================================================== */
let selectedBookingItem = {
  title: 'Custom Pakistan Tour',
  basePrice: 45000,
  days: 5
};

function initBookingModal() {
  const modalOverlay = document.getElementById('bookingModal');
  const closeBtn = document.getElementById('closeBookingModal');
  const bookingForm = document.getElementById('tourBookingForm');

  // Trigger buttons
  document.querySelectorAll('[data-open-booking]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = btn.dataset.tourTitle || 'Pakistan Horizons Tour';
      const price = parseInt(btn.dataset.tourPrice || '45000', 10);
      const days = parseInt(btn.dataset.tourDays || '5', 10);

      selectedBookingItem = { title, basePrice: price, days };
      openBookingModal(selectedBookingItem);
    });
  });

  if (closeBtn && modalOverlay) {
    closeBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }

  // Form step calculations & submission
  if (bookingForm) {
    const adultsInput = document.getElementById('modalAdults');
    const tierSelect = document.getElementById('modalTier');

    function updateModalPricing() {
      const adults = parseInt(adultsInput?.value || '1', 10);
      const tier = tierSelect?.value || 'standard';
      let multiplier = 1;
      if (tier === 'deluxe') multiplier = 1.35;
      if (tier === 'luxury') multiplier = 1.75;

      const total = Math.round(selectedBookingItem.basePrice * adults * multiplier);
      const totalEl = document.getElementById('modalEstimatedTotal');
      if (totalEl) {
        totalEl.textContent = `PKR ${total.toLocaleString()}`;
      }
    }

    adultsInput?.addEventListener('input', updateModalPricing);
    tierSelect?.addEventListener('change', updateModalPricing);

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('modalName')?.value;
      const email = document.getElementById('modalEmail')?.value;
      const phone = document.getElementById('modalPhone')?.value;
      const date = document.getElementById('modalDate')?.value;
      const adults = document.getElementById('modalAdults')?.value;
      const tier = document.getElementById('modalTier')?.value;
      const total = document.getElementById('modalEstimatedTotal')?.textContent;
      const refCode = 'PH-' + Math.floor(100000 + Math.random() * 900000);

      // Render confirmation voucher
      const container = document.getElementById('modalStepContainer');
      if (container) {
        container.innerHTML = `
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <div style="width: 60px; height: 60px; background: #10b981; color: white; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 1rem;">
              ✓
            </div>
            <h3 style="font-size: 1.6rem; margin-bottom: 0.25rem;">Booking Confirmed!</h3>
            <p style="color: var(--text-muted);">Thank you, <strong>${name}</strong>. Your reservation request has been processed.</p>
          </div>

          <div class="booking-voucher">
            <div class="voucher-header">
              <div>
                <strong>${selectedBookingItem.title}</strong>
                <p style="font-size: 0.8rem; color: var(--text-muted);">${selectedBookingItem.days} Days Tour</p>
              </div>
              <span class="badge badge-accent">${refCode}</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.9rem;">
              <div><strong>Traveler:</strong> ${name}</div>
              <div><strong>Contact:</strong> ${phone}</div>
              <div><strong>Start Date:</strong> ${date || 'Flexible'}</div>
              <div><strong>Guests:</strong> ${adults} Person(s)</div>
              <div><strong>Package Tier:</strong> ${tier.toUpperCase()}</div>
              <div><strong>Total Estimate:</strong> <span style="color: var(--primary); font-weight: 800;">${total}</span></div>
            </div>
          </div>

          <div style="display: flex; gap: 1rem; flex-direction: column;">
            <a href="https://wa.me/923001234567?text=Hello%20Pakistan%20Horizons%2C%20I%20just%20booked%20${encodeURIComponent(selectedBookingItem.title)}%20(Ref%3A%20${refCode})%20for%20${adults}%20people.%20Please%20guide%20me%20on%20the%20next%20steps." 
               target="_blank" 
               class="btn btn-primary" 
               style="background: #25d366; border: none; font-weight: 700;">
               💬 Chat with Tour Guide on WhatsApp
            </a>
            <button onclick="document.getElementById('bookingModal').classList.remove('active'); window.location.reload();" class="btn btn-outline">
              Close & Browse More
            </button>
          </div>
        `;
      }

      showToast(`Booking ${refCode} successfully created!`, 'success');
    });
  }
}

function openBookingModal(item) {
  const modalOverlay = document.getElementById('bookingModal');
  const titleEl = document.getElementById('modalTourTitle');
  const priceEl = document.getElementById('modalBasePrice');
  const totalEl = document.getElementById('modalEstimatedTotal');

  if (titleEl) titleEl.textContent = item.title;
  if (priceEl) priceEl.textContent = `PKR ${item.basePrice.toLocaleString()}`;
  if (totalEl) totalEl.textContent = `PKR ${item.basePrice.toLocaleString()}`;

  modalOverlay?.classList.add('active');
}

/* ==========================================================================
   5. INTERACTIVE TRIP ESTIMATOR / CALCULATOR
   ========================================================================== */
function initTripCalculator() {
  const citySelect = document.getElementById('calcCity');
  const daysInput = document.getElementById('calcDays');
  const travelersInput = document.getElementById('calcTravelers');
  const hotelSelect = document.getElementById('calcHotel');
  const transportCheckbox = document.getElementById('calcTransport');
  const guideCheckbox = document.getElementById('calcGuide');

  if (!citySelect) return;

  const cityRates = {
    lahore: 8000,
    karachi: 8500,
    islamabad: 9000,
    hunza: 14000,
    swat: 11000,
    skardu: 16000
  };

  function calculateTrip() {
    const city = citySelect.value || 'hunza';
    const baseDaily = cityRates[city] || 10000;
    const days = parseInt(daysInput?.value || '5', 10);
    const travelers = parseInt(travelersInput?.value || '2', 10);
    const hotelTier = hotelSelect?.value || '3star';
    const includeTransport = transportCheckbox?.checked ? 4500 * days : 0;
    const includeGuide = guideCheckbox?.checked ? 3000 * days : 0;

    let hotelMultiplier = 1;
    if (hotelTier === '4star') hotelMultiplier = 1.45;
    if (hotelTier === '5star') hotelMultiplier = 2.2;

    const baseCost = baseDaily * days * travelers * hotelMultiplier;
    const subtotal = Math.round(baseCost + includeTransport + includeGuide);
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;

    document.getElementById('calcDaysCount') && (document.getElementById('calcDaysCount').textContent = `${days} Days`);
    document.getElementById('calcGuestsCount') && (document.getElementById('calcGuestsCount').textContent = `${travelers} Person(s)`);
    document.getElementById('calcHotelTierText') && (document.getElementById('calcHotelTierText').textContent = hotelTier.toUpperCase());
    document.getElementById('calcTotalOutput') && (document.getElementById('calcTotalOutput').textContent = `PKR ${total.toLocaleString()}`);

    const bookBtn = document.getElementById('calcBookNowBtn');
    if (bookBtn) {
      bookBtn.dataset.tourTitle = `Custom Tour: ${city.toUpperCase()} (${days} Days)`;
      bookBtn.dataset.tourPrice = total;
      bookBtn.dataset.tourDays = days;
    }
  }

  [citySelect, daysInput, travelersInput, hotelSelect, transportCheckbox, guideCheckbox].forEach(el => {
    el?.addEventListener('input', calculateTrip);
    el?.addEventListener('change', calculateTrip);
  });

  calculateTrip();
}

/* ==========================================================================
   6. CURRENCY CONVERTER WIDGET
   ========================================================================== */
function initCurrencyConverter() {
  const amountInput = document.getElementById('currencyAmount');
  const fromSelect = document.getElementById('currencyFrom');
  const resultOutput = document.getElementById('currencyOutput');

  if (!amountInput || !fromSelect || !resultOutput) return;

  const ratesToPKR = {
    USD: 280,
    EUR: 305,
    GBP: 360,
    AED: 76.5,
    SAR: 74.8,
    CAD: 205
  };

  function convert() {
    const amount = parseFloat(amountInput.value) || 0;
    const from = fromSelect.value;
    const rate = ratesToPKR[from] || 280;
    const converted = Math.round(amount * rate);

    resultOutput.textContent = `${amount} ${from} = PKR ${converted.toLocaleString()}`;
  }

  amountInput.addEventListener('input', convert);
  fromSelect.addEventListener('change', convert);
  convert();
}

/* ==========================================================================
   7. FAQ ACCORDION
   ========================================================================== */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question?.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close other items
      faqItems.forEach(other => {
        other.classList.remove('active');
        const otherAns = other.querySelector('.faq-answer');
        if (otherAns) otherAns.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('active');
        if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ==========================================================================
   8. REVIEW & TESTIMONIAL SYSTEM
   ========================================================================== */
function initReviewSystem() {
  const reviewForm = document.getElementById('submitReviewForm');
  const grid = document.getElementById('dynamicReviewsGrid');

  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('revName')?.value;
      const location = document.getElementById('revLocation')?.value || 'Pakistan';
      const rating = document.getElementById('revRating')?.value || '5';
      const text = document.getElementById('revText')?.value;

      const newReview = { name, location, rating: parseInt(rating, 10), text, date: 'Just now' };

      // Save locally
      const stored = JSON.parse(localStorage.getItem('ph_reviews') || '[]');
      stored.unshift(newReview);
      localStorage.setItem('ph_reviews', JSON.stringify(stored));

      appendReviewCard(newReview, true);
      reviewForm.reset();
      showToast('Thank you for your feedback! Review posted.', 'success');
    });
  }

  // Load stored reviews if grid exists
  if (grid) {
    const stored = JSON.parse(localStorage.getItem('ph_reviews') || '[]');
    stored.forEach(rev => appendReviewCard(rev, false));
  }
}

function appendReviewCard(rev, prepend) {
  const grid = document.getElementById('dynamicReviewsGrid');
  if (!grid) return;

  const card = document.createElement('div');
  card.className = 'testimonial-card';
  const stars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);

  card.innerHTML = `
    <div class="testimonial-stars">${stars}</div>
    <p class="testimonial-quote">"${rev.text}"</p>
    <div class="testimonial-author-wrap">
      <div class="author-avatar">${rev.name.charAt(0).toUpperCase()}</div>
      <div class="author-info">
        <h4>${rev.name}</h4>
        <p>${rev.location} • Verified Traveler</p>
      </div>
    </div>
  `;

  if (prepend && grid.firstChild) {
    grid.insertBefore(card, grid.firstChild);
  } else {
    grid.appendChild(card);
  }
}

/* ==========================================================================
   9. FLOATING ACTION BUTTONS
   ========================================================================== */
function initFloatingActions() {
  const topBtn = document.getElementById('floatTopBtn');
  if (topBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        topBtn.classList.add('visible');
      } else {
        topBtn.classList.remove('visible');
      }
    });

    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* ==========================================================================
   10. CONTACT & NEWSLETTER FORMS
   ========================================================================== */
function initContactForms() {
  const contactForm = document.getElementById('mainContactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactForm.querySelector('input[name="name"]')?.value || 'Traveler';
      showToast(`Thank you, ${name}! Your inquiry has been dispatched to our travel desk.`, 'success');
      contactForm.reset();
    });
  }

  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast('Subscribed! Check your inbox for exclusive Pakistan travel deals.', 'success');
        input.value = '';
      }
    });
  });
}

/* ==========================================================================
   11. TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <div>${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
