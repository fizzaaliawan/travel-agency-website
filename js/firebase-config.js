/**
 * Pakistan Horizons - Real Firebase Authentication & Firestore Service
 * Connects directly to Google Firebase (Auth & Firestore).
 * 
 * To connect your live Firebase project:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a project and register a Web App.
 * 3. Replace the `firebaseConfig` object below with your Firebase keys.
 * 4. In Firebase Console -> Authentication -> Sign-in method, enable 'Email/Password' and 'Google'.
 */

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// Check if real keys are configured
const isLiveFirebaseConfigured = () => {
  return firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("YOUR_FIREBASE_API_KEY") && !firebaseConfig.apiKey.includes("DemoKey");
};

let authInstance = null;
let dbInstance = null;
let currentUser = null;
const authListeners = [];

// Initialize Firebase if SDK is available
function initFirebase() {
  if (typeof firebase !== 'undefined' && !firebase.apps.length && isLiveFirebaseConfigured()) {
    try {
      firebase.initializeApp(firebaseConfig);
      authInstance = firebase.auth();
      dbInstance = firebase.firestore();

      authInstance.onAuthStateChanged(user => {
        if (user) {
          currentUser = {
            uid: user.uid,
            displayName: user.displayName || user.email.split('@')[0],
            email: user.email,
            photoURL: user.photoURL,
            provider: user.providerData?.[0]?.providerId || 'password'
          };
          localStorage.setItem('ph_auth_user', JSON.stringify(currentUser));
        } else {
          currentUser = null;
          localStorage.removeItem('ph_auth_user');
        }
        notifyAuthListeners(currentUser);
      });
      console.log("🔥 Live Firebase initialized successfully.");
      return;
    } catch (e) {
      console.warn("Firebase initialization error:", e);
    }
  }

  // Fallback / Offline Local Session
  try {
    const saved = localStorage.getItem('ph_auth_user');
    if (saved) {
      currentUser = JSON.parse(saved);
    }
  } catch (e) {}
}

function notifyAuthListeners(user) {
  authListeners.forEach(listener => {
    try {
      listener(user);
    } catch (err) {
      console.error("Auth listener error:", err);
    }
  });
}

/**
 * Subscribe to Auth state across all pages
 */
function onAuthStateChanged(callback) {
  authListeners.push(callback);
  callback(currentUser);
}

/**
 * Register user with Email & Password
 */
async function registerUser(name, email, password) {
  if (!name || !email || !password) {
    throw new Error("Please fill in all registration fields.");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  // If live Firebase is initialized
  if (authInstance && isLiveFirebaseConfigured()) {
    try {
      const cred = await authInstance.createUserWithEmailAndPassword(email.trim(), password);
      await cred.user.updateProfile({ displayName: name.trim() });
      currentUser = {
        uid: cred.user.uid,
        displayName: name.trim(),
        email: cred.user.email,
        photoURL: null
      };
      localStorage.setItem('ph_auth_user', JSON.stringify(currentUser));
      notifyAuthListeners(currentUser);
      return currentUser;
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error("This email is already registered. Please sign in instead.");
      } else if (err.code === 'auth/invalid-email') {
        throw new Error("Please enter a valid email address.");
      } else if (err.code === 'auth/weak-password') {
        throw new Error("Password is too weak. Please use at least 6 characters.");
      }
      throw err;
    }
  }

  // Client-side local registration fallback
  const users = JSON.parse(localStorage.getItem('ph_registered_users') || '[]');
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error("An account with this email already exists. Please sign in instead.");
  }

  const newUser = {
    uid: 'usr_' + Math.random().toString(36).substr(2, 9),
    displayName: name.trim(),
    email: email.trim().toLowerCase(),
    photoURL: null,
    createdAt: new Date().toISOString()
  };

  users.push({ ...newUser, password: btoa(password) });
  localStorage.setItem('ph_registered_users', JSON.stringify(users));

  currentUser = newUser;
  localStorage.setItem('ph_auth_user', JSON.stringify(currentUser));
  notifyAuthListeners(currentUser);

  return newUser;
}

/**
 * Sign in existing user with Email & Password
 */
async function loginUser(email, password) {
  if (!email || !password) {
    throw new Error("Please enter both email and password.");
  }

  // If live Firebase is initialized
  if (authInstance && isLiveFirebaseConfigured()) {
    try {
      const cred = await authInstance.signInWithEmailAndPassword(email.trim(), password);
      currentUser = {
        uid: cred.user.uid,
        displayName: cred.user.displayName || cred.user.email.split('@')[0],
        email: cred.user.email,
        photoURL: cred.user.photoURL
      };
      localStorage.setItem('ph_auth_user', JSON.stringify(currentUser));
      notifyAuthListeners(currentUser);
      return currentUser;
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        throw new Error("Invalid email or password. Please check your credentials.");
      }
      throw err;
    }
  }

  // Client-side local login fallback
  const users = JSON.parse(localStorage.getItem('ph_registered_users') || '[]');
  const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!found) {
    throw new Error("No account found with this email. Please register first.");
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
 * One-Click Google Authentication
 */
async function loginWithGoogle() {
  if (authInstance && isLiveFirebaseConfigured() && typeof firebase !== 'undefined') {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await authInstance.signInWithPopup(provider);
      currentUser = {
        uid: result.user.uid,
        displayName: result.user.displayName || 'Traveler',
        email: result.user.email,
        photoURL: result.user.photoURL,
        provider: 'google.com'
      };
      localStorage.setItem('ph_auth_user', JSON.stringify(currentUser));
      notifyAuthListeners(currentUser);
      return currentUser;
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error("Google Auth error:", err);
      }
      throw err;
    }
  }

  // Demo Google Login
  const googleDemoUser = {
    uid: 'google_' + Math.random().toString(36).substr(2, 9),
    displayName: 'Sarah Traveler',
    email: 'traveler.sarah@gmail.com',
    photoURL: null,
    provider: 'google.com',
    createdAt: new Date().toISOString()
  };

  currentUser = googleDemoUser;
  localStorage.setItem('ph_auth_user', JSON.stringify(currentUser));
  notifyAuthListeners(currentUser);

  return currentUser;
}

/**
 * Sign Out
 */
async function logoutUser() {
  if (authInstance && isLiveFirebaseConfigured()) {
    try {
      await authInstance.signOut();
    } catch (e) {}
  }
  currentUser = null;
  localStorage.removeItem('ph_auth_user');
  notifyAuthListeners(null);
}

/**
 * Send Password Reset Email
 */
async function resetPassword(email) {
  if (!email) {
    throw new Error("Please enter your registered email address.");
  }
  if (authInstance && isLiveFirebaseConfigured()) {
    await authInstance.sendPasswordResetEmail(email.trim());
  }
  return true;
}

/**
 * Save booking to Firestore / Cloud
 */
async function saveBookingToCloud(bookingData) {
  const enriched = {
    ...bookingData,
    id: 'BK-' + Math.floor(100000 + Math.random() * 900000),
    userEmail: currentUser ? currentUser.email : bookingData.email,
    userId: currentUser ? currentUser.uid : 'guest',
    timestamp: new Date().toISOString()
  };

  if (dbInstance && isLiveFirebaseConfigured()) {
    try {
      await dbInstance.collection('bookings').add(enriched);
    } catch (e) {
      console.warn("Could not save to live Firestore:", e);
    }
  }

  // Save locally
  const allBookings = JSON.parse(localStorage.getItem('ph_cloud_bookings') || '[]');
  allBookings.unshift(enriched);
  localStorage.setItem('ph_cloud_bookings', JSON.stringify(allBookings));

  return enriched;
}

/**
 * Save review to Firestore / Cloud
 */
async function submitCloudReview(reviewData) {
  const newReview = {
    ...reviewData,
    id: 'REV-' + Date.now(),
    userEmail: currentUser ? currentUser.email : null,
    createdAt: new Date().toISOString()
  };

  if (dbInstance && isLiveFirebaseConfigured()) {
    try {
      await dbInstance.collection('reviews').add(newReview);
    } catch (e) {
      console.warn("Could not write to live Firestore:", e);
    }
  }

  const reviews = JSON.parse(localStorage.getItem('ph_cloud_reviews') || '[]');
  reviews.unshift(newReview);
  localStorage.setItem('ph_cloud_reviews', JSON.stringify(reviews));

  return newReview;
}

function getCloudReviews() {
  return JSON.parse(localStorage.getItem('ph_cloud_reviews') || '[]');
}

// Auto-initialize
initFirebase();

window.PHAuth = {
  config: firebaseConfig,
  isLiveFirebaseConfigured,
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
