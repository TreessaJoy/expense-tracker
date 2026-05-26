# RupeeFlow &bull; Personal Expense Tracker

RupeeFlow is a robust, responsive, and full-stack personal ledger application. Built with **React**, **TypeScript**, **Tailwind CSS**, and **Firebase (Firestore & Authentication)**, it balances instant client-side performance with secure real-time cloud data synchronization.

---

## 🎨 Enterprise Product Design

Aesthetically inspired by high-end financial dashboard UI, RupeeFlow utilizes elegant display layout ratios:
- **Intelligent Negative Space**: Layout flows on a clean desktop-first work grid that fluidly stacks vertically on narrow phone layouts.
- **Micro-Animations & Visual State Cues**: Staggered transition sequences built via `motion/react` provide natural user feedback when changing categories, handling popups, or completing inputs.
- **Contrast Enforced Typography**: Standardizes on **Inter** with **sans-serif** headings paired with **JetBrains Mono** tracking numbers.

---

## 🛠️ Stack Choices & Architectural Decisions

| Technology | Selected For | Architectural Advantage / Trade-off |
| :--- | :--- | :--- |
| **Vite + React (v19)** | Single Page Application (SPA) Engine | **Advantage:** Provides outstanding client-side speed, micro-second route redraws, and instant interactive state response compared to static layouts.<br>**Trade-off:** Client-side rendering places rendering load on the local device, but for personal ledger volumes, this is negligible and guarantees lightning performance. |
| **Tailwind CSS (v4)** | Fluid Utility Styling Sheet | **Advantage:** Blazing-fast compilation using Vite's direct CSS parsing plugin. Keeps design systems locked to semantic variables without bloated custom CSS stylesheets.<br>**Trade-off:** Requires writing multiple HTML attribute class lists, but heavily aids visual modularity. |
| **Google Firebase Firestore** | Full Serverless Document Store | **Advantage:** Fully reactive client-side SDK utilizing real-time collection streams (`onSnapshot`), sub-second transactions, and offline write caching out of the box.<br>**Trade-off:** Binds query structures to simple NoSQL document hierarchies, but ideal for relational isolation using keyed indices. |
| **Firebase Auth (Google OAuth)** | Secure Tenant Authentication | **Advantage:** Relies completely on client-side popups bypassing complex backend session management. Encrypts and validates authentication tokens safely.<br>**Trade-off:** Users must have active Google identities, providing the cleanest low-friction onboarding experience. |

---

## 🚀 Step-by-Step Local Execution Guide

Follow these steps exactly to run this project natively on your laptop:

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### 2. Enter Project Root
Open your preferred terminal window, navigate into the directory containing this source code folder:
```bash
cd personal-expense-tracker
```

### 3. Install Dependencies
Restore and configure all designated packages from the local lock files:
```bash
npm install
```

### 4. Running the App Local Development Server
Boot up the high-speed local development server:
```bash
npm run dev
```
Upon a successful build, the terminal will log the server address. Open your browser and navigate to:
```
http://localhost:3000
```

### 5. Compiling for Production Deployment
Validate type constraints and bundle optimized static HTML/JS assets inside the `/dist` directory for single-command deployments:
```bash
# Compiles typescript and compresses production builds
npm run build
```

---

## 🛡️ Done vs. Skipped & Design Invariants

### What is Completed (Done)
1. **Flawless State Synchronization (The Core Engine)**:
   - A single-source-of-truth state array (`expenses`) feeds both listing rows and dashboard modules.
   - Any mutate operation (Create, update details, delete record) utilizes transactional operations updating local view states, synchronizing LocalStorage buffers, and appending modifications directly to Firestore live streams.
2. **Double-Mode Form Guard**:
   - The same clean log form intelligently switches states between *Add* and *Edit*. Modifying values changes headers, button icons, and action handlers dynamically with a clean, un-polluted cancel link layout.
3. **Automatic Offline Migrations**:
   - Unauthenticated users can log expenses locally. Upon logging in with Google, a dynamic notice alerts them to sync their local transactions, migrating them to Firestore before wiping the local cache to prevent duplicates.
4. **Resilient Edge-Case Math**:
   - Every input amount is parsed through `parseFloat()`, verified as a positive value, and rounded strictly to 2 decimal places using `Number.EPSILON` calculations to bypass standard float precision bugs inside JavaScript (e.g., `100.1 + 0.2 = 100.30000000000001`).
5. **Real-time Chronological Inversion Resolvers**:
   - If a user inputs a *From Date* range later than a *To Date*, the filtering engine automatically swaps active range bounds behind the scenes and throws an inline informational validation warning to preserve UI experience.

### What was intentionally Skipped & Why
1. **Multi-Currency Converter Conversions**:
   - **Why:** The ledger is locked entirely to Indian Rupees (₹) to enforce aesthetic consistency and limit dependency size. Mixing currency configurations creates domain complexity that distracts from core auditing mechanics.
2. **Custom Budget Tag Creation**:
   - **Why:** Restricted strictly to standard enum pools ('Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other') to match technical brief conditions and prevent visual noise from bloated user-defined categorizations.
3. **Database Relational Tables**:
   - **Why:** The project implements flat, indexed Document schemas instead of relational joints. Personal finance trackers thrive on flat document histories; creating complex relational structures on NoSQL models creates redundant query cycles.

---

## ⚡ Robust Security Measures Enforced (`firestore.rules`)
Firestore operations are fully locked down at the database server level to enforce bulletproof safety:
- **Zero Public Access**: Default global route checks are locked to `false`.
- **Identity Isolation Shield**: Users can only perform reads or writes on expense documents whose `userId` field matches their verified Google Auth token UID.
- **Rogue Payload Defense**: Security rules enforce strict schema type matching, block non-matching ID parameters, and validate that values, lengths, and dates match strict formats.
- **Temporal Invariants**: The `createdAt` timestamp is immutable after creation, validated via server-determined time comparisons.

---

## 📌 Technical Rough Edges
- **IFrame Pop-up Constraints**: Inside strict embedded layouts, third-party authentication redirects are blocked by default unless the frame contains `allow-popups` privileges. Running the app directly in a standalone browser tab completely bypasses this.
- **Index Dependencies**: Filtering lists by complex custom compound parameters in Firestore requires indexes to be generated by Google, but our sorting is handled gracefully on-the-fly client-side to prevent network transaction limits.
