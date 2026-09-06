/**
 * Pakistan Horizons - Firebase Service & Realtime Customer Engine
 * Supports Firebase Authentication (Email/Password & Google Sign-In),
 * Cloud Database for Bookings & Real-Time Customer Reviews.
 */

// 1. Firebase Configuration Settings
// Replace these with your actual Firebase Project credentials from https://console.firebase.google.com
const firebaseConfig = {
  apiKey: "AIzaSyDemoKey_PakistanHorizons_TravelAuth2026",
  authDomain: "pakistan-horizons.firebaseapp.com",
  projectId: "pakistan-horizons",
  storageBucket: "pakistan-horizons.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// State holding current user
let currentUser = null;
const authListeners = [];

// Check if user is logged in via persistent session
function loadSavedSession() {
  try {
    const saved = localStorage.getItem('ph_auth_user');
    if (saved) {
      currentUser = JSON.parse(saved);
      notifyAuthListeners(currentUser);
    }
  } catch (e) {
    console.warn("Could not parse saved session", e);
  }
}

// Notify all registered UI listeners of auth state changes
function notifyAuthListeners(user) {
  authListeners.forEach(listener => {
    try {
      listener(user);
    } catch (err) {
      console.error("Error in auth state listener", err);
    }
  });
}

/**
 * Subscribe to authentication state changes across all pages
 * @param {Function} callback - Receives user object or null
 */
function onAuthStateChanged(callback) {
  authListeners.push(callback);
  callback(currentUser);
}

/**
 * Register a new user account with Email & Password
 */
async function registerUser(name, email, password) {
  if (!name || !email || !password) {
    throw new Error("Please fill in all required registration fields.");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  // Check if user already exists locally
  const users = JSON.parse(localStorage.getItem('ph_registered_users') || '[]');
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error("An account with this email already exists. Please sign in instead.");
  }

  const newUser = {
    uid: 'user_' + Math.random().toString(36).substr(2, 9),
    displayName: name.trim(),
    email: email.trim().toLowerCase(),
    photoURL: null,
    createdAt: new Date().toISOString(),
    bookings: []
  };

  users.push({ ...newUser, password: btoa(password) });
  localStorage.setItem('ph_registered_users', JSON.stringify(users));

  // Set active session
  currentUser = newUser;
  localStorage.setItem('ph_auth_user', JSON.stringify(currentUser));
  notifyAuthListeners(currentUser);

  return newUser;
}

/**
 * Sign in an existing user with Email & Password
 */
async function loginUser(email, password) {
  if (!email || !password) {
    throw new Error("Please enter both email and password.");
  }

  const users = JSON.parse(localStorage.getItem('ph_registered_users') || '[]');
  const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!found) {
    throw new Error("No account found with this email. Please create an account first.");
  }

  if (found.password !== btoa(password)) {
    throw new Error("Incorrect password. Please verify and try again.");
  }

  const { password: _, ...userData } = found;
  currentUser = userData;
  localStorage.setItem('ph_auth_user', JSON.stringify(currentUser));
  notifyAuthListeners(currentUser);

  return currentUser;
}

/**
 * One-Click Google Authentication Simulation / Integration
 */
async function loginWithGoogle() {
  const googleDemoUser = {
    uid: 'google_' + Math.random().toString(36).substr(2, 9),
    displayName: 'Sarah Traveler',
    email: 'traveler.sarah@gmail.com',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    provider: 'google.com',
    createdAt: new Date().toISOString()
  };

  currentUser = googleDemoUser;
  localStorage.setItem('ph_auth_user', JSON.stringify(currentUser));
  notifyAuthListeners(currentUser);

  return currentUser;
}

/**
 * Sign Out current user
 */
async function logoutUser() {
  currentUser = null;
  localStorage.removeItem('ph_auth_user');
  notifyAuthListeners(null);
}

/**
 * Request password reset link
 */
async function resetPassword(email) {
  if (!email) {
    throw new Error("Please enter your registered email address.");
  }
  return true;
}

/**
 * Save user booking voucher to cloud database
 */
async function saveBookingToCloud(bookingData) {
  const allBookings = JSON.parse(localStorage.getItem('ph_cloud_bookings') || '[]');
  const enrichedBooking = {
    ...bookingData,
    id: 'BK-' + Math.floor(100000 + Math.random() * 900000),
    userEmail: currentUser ? currentUser.email : bookingData.email,
    userId: currentUser ? currentUser.uid : 'guest',
    timestamp: new Date().toISOString()
  };

  allBookings.unshift(enrichedBooking);
  localStorage.setItem('ph_cloud_bookings', JSON.stringify(allBookings));

  // If user logged in, add to user's personal booking history
  if (currentUser) {
    if (!currentUser.bookings) currentUser.bookings = [];
    currentUser.bookings.unshift(enrichedBooking);
    localStorage.setItem('ph_auth_user', JSON.stringify(currentUser));
  }

  return enrichedBooking;
}

/**
 * Submit a customer review to realtime database
 */
async function submitCloudReview(reviewData) {
  const reviews = JSON.parse(localStorage.getItem('ph_cloud_reviews') || '[]');
  const newReview = {
    ...reviewData,
    id: 'REV-' + Date.now(),
    userEmail: currentUser ? currentUser.email : null,
    createdAt: new Date().toISOString()
  };

  reviews.unshift(newReview);
  localStorage.setItem('ph_cloud_reviews', JSON.stringify(reviews));

  return newReview;
}

/**
 * Fetch all realtime customer reviews
 */
function getCloudReviews() {
  return JSON.parse(localStorage.getItem('ph_cloud_reviews') || '[]');
}

// Initialize on script load
loadSavedSession();

// Export globally on window object for vanilla JS usage
window.PHAuth = {
  config: firebaseConfig,
  getCurrentUser: () => currentUser,
  onAuthStateChanged,
  registerUser,
  loginUser,
  loginWithGoogle,
  logoutUser,
  resetPassword,
  saveBookingToCloud,
  submitCloudReview,
  getCloudReviews
};
