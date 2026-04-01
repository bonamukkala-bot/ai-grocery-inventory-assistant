# 🛒 AI Grocery Inventory Assistant

> **Live Demo:** [aigroceryinventoryassistant.vercel.app](https://aigroceryinventoryassistant.vercel.app)

An AI-powered inventory intelligence dashboard that helps grocery store owners predict stock shortages, calculate reorder quantities, and receive AI-generated insights — all in real time.

---

## 📌 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [File-by-File Code Explanation](#file-by-file-code-explanation)
6. [How It Works](#how-it-works)
7. [Business Logic](#business-logic)
8. [Local Setup Guide](#local-setup-guide)
9. [Deployment on Vercel](#deployment-on-vercel)
10. [Environment Variables](#environment-variables)
11. [API Reference](#api-reference)
12. [Screenshots](#screenshots)

---

## 📖 Project Overview

Small grocery store owners often face two major inventory problems:

- **Stockouts** — running out of items and losing sales
- **Overstocking** — buying too much, causing waste and cash flow problems

This system solves both by letting store owners input current stock and recent sales data. The AI then calculates exactly **when stock will run out**, **how much to reorder**, and **when to act** — all explained in simple, business-friendly language.

---

## ✨ Features

- ➕ Add multiple grocery items with name, stock, sales data, and unit
- 📊 Bulk analysis of all items in one click
- 🔴🟡🟢 Color-coded urgency: Critical / Low / Healthy
- 🔃 Auto-sort by most urgent items first
- 🤖 AI-generated item-wise insights using Google Gemini
- 📦 Unit-aware outputs (kg, liters, packets, dozen, grams, units)
- ⏳ Smart reorder timing recommendations
- 💅 Production-grade SaaS UI with animations
- 📱 Fully responsive (mobile + desktop)
- ☁️ Deployed on Vercel

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (TypeScript) + Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion (motion/react) |
| Icons | Lucide React |
| Backend | Express.js (Node.js) via `server.ts` |
| AI | Google Gemini API (`gemini-2.5-flash`) |
| Deployment | Vercel (Serverless) |

---

## 📁 Project Structure

```
ai-grocery-inventory-assistant/
│
├── src/                          # React frontend source
│   ├── App.tsx                   # Main app component (state + logic)
│   └── components/
│       ├── InventoryForm.tsx     # Add item form with unit dropdown
│       ├── InventoryTable.tsx    # Results table with status badges
│       ├── Loader.tsx            # Loading spinner component
│       ├── ResultCard.tsx        # Single item result card (legacy)
│       └── premium/
│           ├── InventoryInputForm.tsx  # Premium styled input form
│           ├── InputField.tsx          # Reusable animated input
│           └── AnimatedButton.tsx      # Gradient button with shimmer
│
├── server.ts                     # Express backend (API logic)
├── vercel.json                   # Vercel routing configuration
├── vite.config.ts                # Vite + proxy configuration
├── .env                          # Local environment variables (not committed)
├── package.json                  # Dependencies and scripts
└── tailwind.config.js            # Tailwind CSS configuration
```

---

## 🔍 File-by-File Code Explanation

---

### 1. `server.ts` — Express Backend

This is the brain of the application. It receives all inventory items from the frontend, runs the prediction math, and sends back structured results.

**What it does:**
- Listens for `POST /api/analyze` requests
- Accepts a list of grocery items (name, stock, sales array, unit)
- For each item, it calculates:
  - Average daily sales
  - Days remaining before stockout
  - Recommended reorder quantity
  - Urgency status (Critical / Low / Healthy)
- Returns all items sorted by urgency (most critical first)

**Key logic:**

```typescript
// Average daily sales from last 5 days
const avg_sales = sales.reduce((a, b) => a + b, 0) / sales.length;

// How many days before stock runs out
const days_left = stock / avg_sales;

// How much to reorder (7-day supply + 20% safety buffer)
const reorder = Math.ceil(avg_sales * 7 * 1.2);

// Urgency classification
const status =
  days_left < 3 ? "Critical" :
  days_left <= 7 ? "Low" : "Healthy";
```

**Endpoint:**

```
POST /api/analyze
Body: { items: [{ name, stock, sales, unit }] }
Response: [{ name, stock, unit, avg_sales, days_left, reorder, status }]
```

---

### 2. `src/App.tsx` — Main Application Component

This is the root component that manages all application state and orchestrates the full workflow: input → backend call → AI call → display results.

**State it manages:**

```typescript
const [items, setItems] = useState<InventoryItem[]>([]);       // Items added by user
const [isLoading, setIsLoading] = useState(false);             // Loading state
const [results, setResults] = useState<AnalyzedItem[] | null>(null); // Backend results
const [aiInsights, setAiInsights] = useState<string | null>(null);   // Gemini AI text
const [error, setError] = useState<string | null>(null);       // Error messages
```

**Main flow (`handleAnalyze` function):**

1. Sends items to `/api/analyze` (Express backend)
2. Gets back analyzed data with days_left, reorder quantities, status
3. Sends that data to Google Gemini AI for natural language insights
4. Updates the UI with results

**AI call with retry logic:**

```typescript
// Retries up to 3 times if Gemini server is busy (503/429)
let retries = 2;
while (retries >= 0) {
  try {
    aiResponse = await ai.models.generateContent({ model, contents: prompt });
    break; // Success — exit loop
  } catch (e) {
    if (e.message?.includes('503') || e.message?.includes('429')) {
      await new Promise(r => setTimeout(r, 2000)); // Wait 2 seconds
      retries--;
    } else {
      throw e; // Non-retryable error
    }
  }
}
```

**Layout:**
- Left column (5/12): `InventoryForm` + items list + Analyze button
- Right column (7/12): Results table + AI insights panel

---

### 3. `src/components/InventoryForm.tsx` — Add Item Form

This component renders the form where users add new grocery items to the analysis list.

**Fields:**
- **Item Name** — text input (e.g., "Milk", "Rice")
- **Current Stock** — number input (e.g., 50)
- **Last 5 Days Sales** — comma-separated input (e.g., `10, 12, 8, 9, 11`)
- **Unit** — dropdown select

**Unit dropdown options:**

```typescript
const UNIT_OPTIONS = ["kg", "liters", "grams", "packets", "dozen", "units"];
```

**Smart unit auto-suggestion:** When you type an item name, it automatically suggests the correct unit:

```typescript
// Auto-suggest unit based on item name
const suggestUnit = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("milk") || lower.includes("oil")) return "liters";
  if (lower.includes("rice") || lower.includes("sugar") || lower.includes("onion")) return "kg";
  if (lower.includes("egg")) return "dozen";
  if (lower.includes("bread")) return "packets";
  return "units"; // Default
};
```

**Validation:** Ensures sales data contains at least 3 valid numbers before allowing submission.

---

### 4. `src/components/InventoryTable.tsx` — Results Table

Displays the analyzed inventory data in a professional, color-coded table.

**Columns shown:**
- Item Name
- Current Stock (with unit)
- Avg Daily Sales (with unit/day)
- Days Remaining (color-coded)
- Reorder Quantity (with unit)
- Status Badge

**Color coding for Days Remaining:**

```typescript
const getDaysColor = (days: number) => {
  if (days < 3) return "text-red-600 font-black";    // 🔴 Critical
  if (days <= 7) return "text-yellow-600 font-bold"; // 🟡 Low
  return "text-green-600 font-bold";                  // 🟢 Healthy
};
```

**Status badges:**

```typescript
// Badge styling based on urgency
Critical → red background, red text
Low      → yellow background, yellow text
Healthy  → green background, green text
```

Rows with "Critical" status get a red highlighted background for instant visual attention.

---

### 5. `src/components/Loader.tsx` — Loading Spinner

A simple, reusable animated loading component shown during API calls.

```tsx
// Displays a spinning circle with custom text
<div className="animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
<p>{text}</p>  // e.g., "Analyzing Inventory..."
```

---

### 6. `vercel.json` — Vercel Configuration

This file is **critical for deployment**. Without it, Vercel won't know how to route API requests to your Express server.

```json
{
  "version": 2,
  "builds": [
    { "src": "server.ts", "use": "@vercel/node" },
    { "src": "package.json", "use": "@vercel/static-build" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server.ts" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

**What this does:**
- Routes all `/api/*` requests → Express server (`server.ts`)
- Routes everything else → React frontend (`index.html`)

---

### 7. `vite.config.ts` — Vite Configuration

Configures the development server and passes environment variables to the frontend.

```typescript
export default defineConfig({
  plugins: [react()],
  define: {
    // Makes GEMINI_API_KEY available as process.env in browser
    'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY)
  },
  server: {
    proxy: {
      // In dev, forward /api calls to Express on port 3001
      '/api': 'http://localhost:3001'
    }
  }
});
```

---

### 8. `.env` — Environment Variables (Local Only)

This file is **never committed to GitHub**. It stores secret keys locally.

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

> ⚠️ **Important:** Add this to `.gitignore` to prevent accidentally pushing your API key to GitHub.

---

## ⚙️ How It Works

```
User adds items
      ↓
Clicks "Analyze Inventory"
      ↓
Frontend sends POST /api/analyze
      ↓
Express server calculates:
  - avg_sales = sum(sales) / 5
  - days_left = stock / avg_sales
  - reorder   = avg_sales × 7 × 1.2
  - status    = Critical / Low / Healthy
      ↓
Results sorted by days_left (ascending)
      ↓
Frontend receives analyzed data → renders table
      ↓
Gemini AI generates item-wise natural language insights
      ↓
AI panel shows detailed report for each item
```

---

## 🧮 Business Logic

### Average Daily Sales
```
avg_sales = (day1 + day2 + day3 + day4 + day5) / 5
```

### Days Remaining
```
days_left = current_stock / avg_sales
```

### Reorder Quantity
```
reorder = avg_sales × 7 × 1.2   (7-day supply + 20% safety buffer)
```

### Urgency Status
| Days Left | Status | Color |
|-----------|--------|-------|
| < 3 days | Critical | 🔴 Red |
| 3–7 days | Low | 🟡 Yellow |
| > 7 days | Healthy | 🟢 Green |

### Reorder Timing (AI Prompt Logic)
| Days Left | Recommendation |
|-----------|---------------|
| < 2 days | Immediately (today) |
| 2–5 days | Within 1–2 days |
| 5–10 days | Within this week |
| > 10 days | No urgent action required |

---

## 💻 Local Setup Guide

### Prerequisites
- Node.js v18 or higher → [nodejs.org](https://nodejs.org)
- A Google Gemini API key → [aistudio.google.com](https://aistudio.google.com)

### Step-by-Step Commands

**Step 1: Clone the repository**
```bash
git clone https://github.com/bonamukkala-bot/ai-grocery-inventory-assistant.git
cd ai-grocery-inventory-assistant
```

**Step 2: Install dependencies**
```bash
npm install
```

**Step 3: Create your `.env` file**

In the root folder, create a file named `.env` and add:
```env
GEMINI_API_KEY=AIzaSy_your_actual_key_here
```

**Step 4: Start the development server**
```bash
npm run dev
```

**Step 5: Open your browser**
```
http://localhost:3000
```

---

## ☁️ Deployment on Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **Add New Project**
3. Import your GitHub repository
4. Click **Deploy**

### Step 3: Add Environment Variable
1. Go to your project → **Settings** → **Environment Variables**
2. Add:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** `AIzaSy...your_key`
3. Click **Save**

### Step 4: Redeploy
Click **Redeploy** on the latest deployment for the environment variable to take effect.

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key for AI insights |

**How to get a Gemini API key:**
1. Visit [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **Get API Key**
4. Copy the key (starts with `AIzaSy...`)

---

## 📡 API Reference

### `POST /api/analyze`

Analyzes all inventory items and returns predictions.

**Request Body:**
```json
{
  "items": [
    {
      "name": "Milk",
      "stock": 20,
      "sales": [8, 9, 7, 10, 8],
      "unit": "liters"
    },
    {
      "name": "Rice",
      "stock": 100,
      "sales": [5, 6, 4, 7, 5],
      "unit": "kg"
    }
  ]
}
```

**Response:**
```json
[
  {
    "name": "Milk",
    "stock": 20,
    "unit": "liters",
    "avg_sales": 8.4,
    "days_left": 2.38,
    "reorder": 71,
    "status": "Critical"
  },
  {
    "name": "Rice",
    "stock": 100,
    "unit": "kg",
    "avg_sales": 5.4,
    "days_left": 18.5,
    "reorder": 46,
    "status": "Healthy"
  }
]
```

> Items are sorted by `days_left` ascending (most critical first).

---

## 🤖 AI Insights Format

For each item, the Gemini AI generates a structured report like:

```
📦 Milk

Current Stock: 20 liters
Daily Usage: 8.4 liters/day

⏳ Days Remaining: 2.38 days

🛒 Reorder Quantity: 71 liters
📅 Reorder Timing: Immediately

💡 Insight:
Milk has very high demand and will run out in about 2 days.
Reorder 71 liters today to avoid a stockout.
```

---

## 🐛 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Unexpected token 'T'... is not valid JSON` | API route not found (404 HTML returned) | Add `GEMINI_API_KEY` in Vercel env vars and redeploy |
| `models/gemini-1.5-flash is not found` | Wrong model name | Use `gemini-2.5-flash` |
| `API key not valid` | Missing or incorrect `.env` file | Create `.env` with correct key and restart server |
| `503 Service Unavailable` | Gemini server busy | Retry logic handles this automatically (3 retries) |
| `src refspec main does not match` | No commits made yet | Run `git add . && git commit -m "msg"` first |

---

## 👨‍💻 Author

**Bonamukkala Charan Reddy**
- GitHub: [@bonamukkala-bot](https://github.com/bonamukkala-bot)
- YouTube/Instagram: **charanreddysinsights**
- B.Tech — NIAT, Hyderabad (Generative AI)

*Built with ❤️ using React, Express, Tailwind CSS, and Google Gemini AI*
