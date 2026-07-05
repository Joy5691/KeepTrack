<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:4F46E5,100:F59E0B&height=180&section=header&text=KeepTrack&fontSize=60&fontColor=ffffff&fontAlignY=38&animation=fadeIn&desc=Navigate%20your%20finances%20with%20clarity&descAlignY=58&descSize=18" width="100%" alt="KeepTrack banner" />

<img src="public/logo.svg" width="130" alt="KeepTrack animated compass logo" />

### 🧭 A premium financial compass for your money

<a href="https://readme-typing-svg.demolab.com/">
  <img src="https://readme-typing-svg.demolab.com/?font=Fira+Code&size=20&duration=2800&pause=900&color=6366F1&center=true&vCenter=true&width=560&lines=Track+every+dollar.+Trust+every+number.;Real-time+sync.+Real-time+clarity.;Budgets+that+glow+red+before+you+overspend." alt="Typing SVG" />
</a>

<br />

[![Live App](https://img.shields.io/badge/🚀_LIVE_DEMO-keeptrack2.netlify.app-4F46E5?style=for-the-badge&labelColor=0B1120)](https://keeptrack2.netlify.app/)

<br />

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white&labelColor=0B1120)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=0B1120)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite&logoColor=white&labelColor=0B1120)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white&labelColor=0B1120)
![Firebase](https://img.shields.io/badge/Firebase-Auth_%7C_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=white&labelColor=0B1120)
![Motion](https://img.shields.io/badge/Motion-Framer-EF476F?style=for-the-badge&logo=framer&logoColor=white&labelColor=0B1120)

<br />

![Stars](https://img.shields.io/github/stars/Joy5691/KeepTrack?style=social)
![Forks](https://img.shields.io/github/forks/Joy5691/KeepTrack?style=social)
![License](https://img.shields.io/github/license/Joy5691/KeepTrack?style=flat-square&color=90EE90&labelColor=0B1120)

</div>

<br />

## 📖 Table of Contents

- [Introduction](#-introduction--theme-philosophy)
- [Screenshots](#-screenshots)
- [Key Features](#-key-features)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Installation & Quick Start](#-installation--quick-start)
- [Firestore Security Rules](#-firestore-security-rules)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

<br />

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0B1120,100:0B1120&height=3&section=header" width="100%" />

## 🧭 Introduction & Theme Philosophy

KeepTrack is built around a single idea: **your financial dashboard should feel less like a spreadsheet and more like an instrument panel.**

The entire product is designed under the **"Financial Compass"** visual language — a design system that borrows from three disciplines:

| Principle | Application in KeepTrack |
|---|---|
| 🅰️ **Swiss Typographic Rigor** | Strict type scales, generous whitespace, and high-contrast numerals so balances and figures are legible at a glance — no squinting at your net worth. |
| 📡 **Instrument-Grade Visual Feedback** | Every core metric — balance, spending pace, budget health — is represented by a *living* visual (waves, pulses, radars) rather than a static number, so trends are felt before they're read. |
| 🌊 **Lightweight, Purposeful Motion** | Powered by `motion`, animations are spring-based and physically believable — subtle enough to never distract, present enough to make the interface feel alive. |

The result is an app that behaves less like a ledger and more like a **compass** — always orienting you toward where your money is actually going.

> 🔗 **Experience it live:** [**keeptrack2.netlify.app**](https://keeptrack2.netlify.app/)

<br />

## 📸 Screenshots

<div align="center">

<table>
<tr>
<td width="50%" align="center">
<img src="./screenshots/Loginpage.png" alt="Login Page" width="100%"/>
<br/>
<b>🔐 Login Page</b>
<br/>
<sub>Animated compass emblem · Email &amp; Google SSO</sub>
</td>
<td width="50%" align="center">
<img src="./screenshots/LoadingScrren.png" alt="Loading Screen" width="100%"/>
<br/>
<b>🧭 Loading Screen</b>
<br/>
<sub>"Syncing financial compass…"</sub>
</td>
</tr>
</table>

<br/>

<img src="./screenshots/Dashboard.png" alt="KeepTrack Dashboard" width="92%"/>
<br/>
<b>🏠 Dashboard</b> — Balance Waves · Spending Pulse · Daily Average · Monthly Budget
<br/><br/>

<table>
<tr>
<td width="50%" align="center">
<img src="./screenshots/QuickAddExpenseFeature.png" alt="Quick Add Expense" width="100%"/>
<br/>
<b>⚡ Quick Add Expense</b>
<br/>
<sub>Log a transaction in seconds, synced instantly</sub>
</td>
<td width="50%" align="center">
<img src="./screenshots/AnalyticsSection.png" alt="Analytics Section" width="100%"/>
<br/>
<b>📊 Analytics</b>
<br/>
<sub>Category breakdowns powered by Recharts &amp; D3</sub>
</td>
</tr>
<tr>
<td width="50%" align="center">
<img src="./screenshots/TransactionHistorySection.png" alt="Transaction History" width="100%"/>
<br/>
<b>📜 Transaction History</b>
<br/>
<sub>Filterable, real-time transaction ledger</sub>
</td>
<td width="50%" align="center">
<img src="./screenshots/Calenderwisetransaction.png" alt="Calendar-wise Transactions" width="100%"/>
<br/>
<b>📅 Calendar View</b>
<br/>
<sub>Transactions mapped day-by-day across the month</sub>
</td>
</tr>
</table>

</div>

> 💡 Place the corresponding image files inside a `screenshots/` folder at the project root, matching the filenames referenced above.

<br />

## ✨ Key Features

### 🧭 The Financial Compass Logo
A custom, hand-crafted SVG compass mark that reacts to hover with gentle spring physics — the needle subtly re-orients as if sensing the cursor, reinforcing the "navigation" metaphor across the entire product.

### 📊 Dynamic Dashboard
The homepage is composed of four signature instrument cards, each with a bespoke animated visualization:

| Card | Visualization | What It Communicates |
|---|---|---|
| **Balance Card** | Fluid, animated cash-flow waves | Your available balance, rendered like water in motion — rising and settling as funds move. |
| **Spending Pulse Card** | Live ECG-style cardiogram wave | The "heartbeat" of your spending activity in real time. |
| **Daily Average Card** | Charging lightning-bolt animation | Your average daily spend/output, visualized as stored energy being discharged. |
| **Monthly Budget Card** | Concentric, rotating radar rings | Progress toward your monthly budget target, read like a targeting reticle closing in. |

### 🔄 Real-Time Transaction Management
Add, edit, delete, and filter transactions with **instant Firestore synchronization** — changes reflect across devices without a manual refresh.

### 💰 Smart Budgets
A fully interactive budget configurator that lets you set per-category limits. Overspending is never ambiguous — categories that blow past their limit are flagged in **high-contrast crimson**, immediately and unmissably.

### 📈 Analytics View
Clean, responsive breakdowns of income vs. expense, category distribution, and trends over time — powered by Recharts and D3 for smooth, data-accurate visualizations at any screen size.

### 🔐 Auth Barrier
A refined login/signup experience anchored by a large-format animated compass emblem, supporting both **Email/Password** and **Google Single Sign-On**, backed by Firebase Authentication.

### 🌗 Dark / Light Theming
A first-class theme context drives the entire app's palette — both modes are tuned for high-contrast legibility, not just an inverted color scheme.

### ⏳ Signature Loading Experience
A custom loading screen featuring multiple concentric rotating rings around a central compass pointer, labeled **"Syncing financial compass…"** — turning even the wait state into part of the brand experience.

<br />

## 🏗 Tech Stack & Architecture

### Core Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | React 18+ (Vite) | Fast HMR dev environment, optimized production builds |
| **Language** | TypeScript | End-to-end type safety across components, hooks, and Firestore models |
| **Styling** | Tailwind CSS | Utility-first, fully responsive design across mobile & desktop breakpoints |
| **Animation** | `motion` (Framer Motion v11) | Spring-based transitions and micro-interactions |
| **Auth & Database** | Firebase Authentication + Firestore | Email/Google sign-in, cloud-synced, per-user structured data |
| **Data Visualization** | Recharts + D3 | Responsive cashflow charts and category breakdowns |
| **Icons** | Lucide React | Consistent, lightweight iconography |

### Architectural Overview

```
┌─────────────────────────────────────────────────────────┐
│                         Client (React)                   │
│                                                            │
│   ┌────────────┐   ┌───────────────┐   ┌──────────────┐  │
│   │  Auth Layer │→│  Theme Context │→│  Dashboard UI  │  │
│   └────────────┘   └───────────────┘   └──────────────┘  │
│                                              │             │
│                     ┌────────────────────────┴─────────┐  │
│                     │   Recharts / D3 Visualizations    │  │
│                     └────────────────────────────────────┘ │
└──────────────────────────────┬─────────────────────────────┘
                                │
                     Firebase SDK (Auth + Firestore)
                                │
┌───────────────────────────────▼───────────────────────────┐
│                          Firebase                          │
│   ┌───────────────┐        ┌────────────────────────────┐ │
│   │ Authentication │        │ Firestore (per-user paths) │ │
│   └───────────────┘        └────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Project Structure

```
keeptrack/
├── assets/
│   └── logo.svg              # Animated compass logo
├── screenshots/               # README screenshots
├── src/
│   ├── assets/                # Compass logo SVGs, static illustrations
│   ├── components/
│   │   ├── dashboard/         # Balance, Pulse, Average, Budget cards
│   │   ├── charts/            # Recharts/D3 chart wrappers
│   │   ├── auth/              # Login/Signup UI
│   │   └── ui/                # Shared primitives (buttons, modals, inputs)
│   ├── context/                # ThemeContext, AuthContext
│   ├── hooks/                  # useTransactions, useBudgets, useFirestore
│   ├── lib/                    # firebase.ts (SDK init), utils
│   ├── types/                  # TypeScript models (Transaction, Budget, User)
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── firestore.rules
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

<br />

## 🚀 Installation & Quick Start

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A **Firebase project** with Authentication (Email/Password + Google) and Firestore enabled

### 1. Clone the repository

```bash
git clone https://github.com/Joy5691/KeepTrack.git
cd KeepTrack
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root using the template below:

```bash
cp .env.example .env
```

```env
# .env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> ⚠️ **Never commit your `.env` file.** Ensure it's listed in `.gitignore` before pushing to a remote repository.

### 4. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 5. Build for production

```bash
npm run build
```

Optimized static assets are output to the `dist/` directory, ready for deployment (e.g. Netlify, Vercel).

### 6. Preview the production build locally

```bash
npm run preview
```

<br />

## 🔐 Firestore Security Rules

KeepTrack isolates every user's financial data behind their authenticated UID. No user can read or write another user's transactions, budgets, or profile data — enforced at the database layer, not just the client.

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only access their own document
    match /users/{userId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;

      // Transactions are nested under the owning user
      match /transactions/{transactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      // Budgets follow the same user-isolated pattern
      match /budgets/{budgetId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Deny everything else by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Design principles:**

- 🔒 **User-isolated paths** — all sensitive data lives under `users/{userId}/...`, never at the collection root.
- ✅ **Explicit allow, implicit deny** — the catch-all rule at the bottom denies any path not explicitly matched above.
- 🧾 **UID-bound ownership** — every read/write checks `request.auth.uid` against the path's `userId`, preventing cross-account data access even if a document ID is guessed.

<br />

## 🤝 Contributing

Contributions are welcome and appreciated. To propose a change:

1. **Fork** the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes with clear, descriptive messages
   ```bash
   git commit -m "Add: category-level spending forecast"
   ```
4. Push to your fork and open a **Pull Request** against `main`

Please keep PRs focused — one feature or fix per pull request — and ensure `npm run build` completes cleanly before submitting.

<br />

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for full terms.

```
MIT License

Copyright (c) 2026 Khalid Mahmud Joy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files, to deal in the Software
without restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software, subject to the inclusion of the above copyright notice in all
copies or substantial portions of the Software.
```

<br />

## 👤 Author

<div align="center">

<img src="public/logo.svg" width="70" alt="KeepTrack compass mark"/>

**Khalid Mahmud Joy**

Computer Science & Engineering · East West University

Designed, engineered, and navigated into existence by the author below.

[![GitHub](https://img.shields.io/badge/GitHub-Joy5691-181717?style=for-the-badge&logo=github&logoColor=white&labelColor=0B1120)](https://github.com/Joy5691)
[![Live App](https://img.shields.io/badge/Live_App-keeptrack2.netlify.app-4F46E5?style=for-the-badge&labelColor=0B1120)](https://keeptrack2.netlify.app/)

</div>

<br />

<div align="center">

### ⭐ If KeepTrack helped you find your financial north, consider starring the repo!

<a href="#-keeptrack">⬆ Back to top</a>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:F59E0B,100:4F46E5&height=120&section=footer" width="100%" alt="footer wave" />

</div>
