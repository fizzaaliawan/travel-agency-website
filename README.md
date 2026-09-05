# 🇵🇰 Pakistan Horizons - Premium Tourism & Tour Booking Web App

A modern, responsive, feature-rich web platform for exploring and booking curated travel expeditions across Pakistan (Hunza, Swat, Skardu, Lahore, Karachi, and Islamabad).

---

## ✨ Key Features & Upgrades

1. **🎨 Modern Luxury UI/UX Design System**:
   - Dark/Light mode switcher with persistent preference (`localStorage`).
   - Glassmorphism sticky navigation, badge chips, and smooth CSS transitions.
   - 100% mobile-responsive design for all screen resolutions.

2. **🧭 Interactive Destination Explorer & Live Filters**:
   - Real-time search by city name or keyword.
   - Dynamic category filter tabs (*Mountains & Treks, Heritage & Culture, Coastal & Beaches, Scenic Valleys*).

3. **📅 Tour Packages & Custom Trip Calculator**:
   - Pre-packaged luxury expeditions (*7-Day Hunza, 5-Day Swat, 8-Day Skardu, 3-Day Lahore, 4-Day Gwadar*).
   - Interactive live quotation calculator adjusting price based on duration, guests, and accommodation tier (*Standard, Deluxe, Luxury*).

4. **⚡ Seamless Booking Engine & WhatsApp Connect**:
   - Interactive modal with real-time price estimation.
   - Generates instant verified booking voucher references (e.g. `PH-817293`).
   - One-click direct dispatch to WhatsApp with pre-filled tour details.

5. **💱 Global Traveler Currency Converter**:
   - Live converter supporting USD, EUR, GBP, AED, SAR, and CAD to PKR.

6. **⭐ Traveler Community & Dynamic Review System**:
   - Interactive 5-star rating submission form that appends reviews directly to the page and stores them locally.

---

## 🚀 How to Run Locally

### Option 1: Double-Click
Simply open `html/index.html` directly in any web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Live Server (Recommended)
If using VS Code / Antigravity IDE:
1. Right-click `html/index.html` -> **Open with Live Server**.
2. Or in terminal:
```bash
npx serve .
```
Visit `http://localhost:3000/html/index.html`.

---

## 🌐 How to Make It Live (Free Deployment in 2 Minutes)

### Method 1: Netlify Drop (Instant & Easiest - No CLI required)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the `TravellingWebsite-main` folder directly into the browser window.
3. Your website is instantly live with a free `https://your-site-name.netlify.app` URL and free SSL!

---

### Method 2: GitHub Pages
1. Create a new repository on [GitHub.com](https://github.com).
2. Push your files to GitHub:
```bash
git init
git add .
git commit -m "Upgrade Pakistan Horizons to full web application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```
3. On GitHub, go to **Settings** -> **Pages** -> under **Branch**, select `main` and `/ (root)` -> Click **Save**.
4. Your website will be live in 1 minute at `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/html/index.html`.

---

### Method 3: Vercel
1. Install Vercel CLI (or connect via GitHub on [vercel.com](https://vercel.com)):
```bash
npx vercel
```
2. Follow the 3-step prompt (select default options) to get an instant live production URL.

---

## 📂 Project Architecture

```
TravellingWebsite-main/
├── html/
│   ├── index.html      # Main Home Landing & Booking Hub
│   ├── packages.html   # Curated Tour Packages Catalog & Custom Estimator
│   ├── about.html      # Company Story, Values & Leadership Team
│   ├── contact.html    # 24/7 Desk, WhatsApp Direct & Inquiry Forms
│   ├── policies.html   # Booking, Cancellation & Safety Regulations
│   ├── lahore.html     # Lahore Mughal Heritage Travel Guide
│   ├── karachi.html    # Karachi Coastal & Marine Guide
│   ├── islamabad.html  # Islamabad Capital & Margalla Guide
│   ├── hunza.html      # Hunza & Karakoram Alpine Guide
│   └── swat.html       # Swat Valley & Malam Jabba Ski Guide
├── css/
│   └── styles.css      # Modern Responsive Design System & CSS Tokens
├── js/
│   └── script.js       # Interactive Navigation, Filters, Calculator, Modal & Reviews
└── images/             # Optimized Destination & UI Photography
```

---
© 2025 - 2026 Pakistan Horizons. All rights reserved.
