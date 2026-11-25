# InvestIntel — Quantitative Stock Analysis & Equity Research Platform

> A full-stack **Data Analytics & Equity Research Platform** built with **Next.js 16**, **TypeScript**, **MongoDB**, and **Yahoo Finance** (`yahoo-finance2`). Designed to empower retail investors and data analysts to screen NSE equities, compute server-side technical indicators, benchmark multi-stock performance, and evaluate stocks using a transparent, profile-calibrated **100-point quantitative scoring model**.

🔗 **Repository:** [https://github.com/Sachin-pandey13/InvestIntel](https://github.com/Sachin-pandey13/InvestIntel)

---

## 🎯 Project Objective

Retail investors often rely on disconnected tools for market screening, technical charting, fundamental valuation, and personal budget alignment. **InvestIntel** unifies the entire quantitative equity research workflow into a single, explainable analytics platform:

1. **Collect Financial Context:** Users onboard with their income, expenses, EMI, savings, risk appetite (`Low` / `Moderate` / `High`), and investment horizon (`Short-term` / `Mid-term` / `Long-term`).
2. **Screen & Discover:** Filter NSE equities across 8 sectors by P/E ratio, market capitalization tier (Large / Mid / Small cap), and dividend yield — with **CSV export** for external analysis in Excel, Python, or Power BI.
3. **Analyze Quantitatively:** Inspect live OHLCV data, server-side technical indicators (**SMA, EMA, RSI, MACD, Bollinger Bands**), annualized volatility, and fundamental ratios.
4. **Score & Compare:** Evaluate any equity with a deterministic **0–100 Composite Score** (Technical 40 + Fundamental 35 + Profile Fit 25) and compare up to 5 stocks side-by-side against the **NIFTY 50 (`^NSEI`)** benchmark.

---

## 📊 Key Features

| Module | Route | Description |
|---|---|---|
| **Dashboard** | `/dashboard` | Live Indian market indices (`NIFTY 50`, `SENSEX`, `BANK NIFTY`), personal watchlist widget, NSE top gainers/losers, profile-matched stock picks, and recent analysis history |
| **Stock Screener** | `/dashboard/screener` | Multi-criteria equity filter (Sector, Market Cap tier, Min/Max P/E, Min Dividend Yield), sortable data table, and one-click **CSV Export** |
| **Deep Stock Analysis** | `/dashboard/analyze` | Autocomplete stock search, interactive price & moving average overlays (SMA 20/50, Bollinger Bands), dedicated **RSI(14)** & **MACD(12,26,9)** sub-charts, fundamental KPI cards, and 100-point Composite Score breakdown |
| **Multi-Stock Compare** | `/dashboard/compare` | Side-by-side historical return comparison against `^NSEI` benchmark, annualized volatility, and fundamental valuation table |
| **Personal Watchlist** | `/dashboard/watchlist` | MongoDB-persisted watchlist with live quote enrichment, 52-week range tracking, and instant search-to-add |
| **Market Overview** | `/dashboard/market` | Benchmark index sparklines and a live **Sector Performance Heatmap** |
| **Investor Profile** | `/dashboard/profile` | Update financial status (income, expenses, savings, EMI, risk appetite, horizon) with real-time investable surplus calculation |

---

## 🧮 Quantitative Methodology

### 1. Technical Indicators (`src/lib/indicators.ts`)
All indicators are computed deterministically server-side from historical closing prices:
- **SMA (20, 50, 200):** Simple Moving Averages for short-, medium-, and long-term trend identification.
- **EMA (12, 26):** Exponential Moving Averages with smoothing factor $k = \frac{2}{N + 1}$.
- **RSI (14):** Wilder's Relative Strength Index ($0\text{–}100$) to flag overbought ($>70$) and oversold ($<30$) conditions.
- **MACD (12, 26, 9):** $\text{EMA}(12) - \text{EMA}(26)$, 9-period Signal Line, and Histogram for momentum crossovers.
- **Bollinger Bands (20, 2):** $\text{SMA}(20) \pm 2\sigma$ for volatility envelopes.
- **Annualized Volatility:** $\sigma_{\text{daily}} \times \sqrt{252} \times 100\%$.

### 2. Composite Scoring Engine (`src/lib/scoring.ts`)
Every analyzed stock receives an explainable **0–100 score** (Grades `A+` to `D`) across three weighted dimensions:
- **Technical Score (40 pts):** RSI health (10), MACD trend bias (10), Price vs 200-SMA (10), Volatility control (10).
- **Fundamental Score (35 pts):** P/E valuation (10), Positive EPS profitability (10), Dividend yield (8), 52-week range value positioning (7).
- **Profile Fit Score (25 pts):** Volatility alignment with user's `riskAppetite` (12), Market cap & `timeHorizon` fit (8), Share price affordability vs monthly investable surplus (5).

---

## 🏗️ Tech Stack & Architecture

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Recharts, Framer Motion, Lucide Icons
- **Backend / API:** Next.js Route Handlers (`/api/stocks/*`, `/api/watchlist`, `/api/analysis-history`, `/api/auth/*`, `/api/user/profile`)
- **Market Data:** `yahoo-finance2` (live quotes, search, and historical OHLCV)
- **Database:** MongoDB Atlas + Mongoose 9 (`User`, `StockCache`, `Watchlist`, `AnalysisHistory`, `LoginLog`)
- **Security:**
  - `bcryptjs` password hashing & HTTP-only `jsonwebtoken` (JWT) session cookies
  - **AES-256-CBC** field-level encryption (`src/lib/encryption.ts`) for sensitive financial fields (`income`, `expenses`, `savings`, `loans`, `emi`, `pan`)
  - PII masking (`maskPan`, `maskPhone`) in API responses
  - MongoDB TTL caching (`StockCache`) to minimize external API latency and rate-limit exposure

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Sachin-pandey13/InvestIntel.git
cd InvestIntel
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root directory:
```env
MONGODB_URI="your_mongodb_atlas_connection_string"
JWT_SECRET="your_jwt_secret_key"
ENCRYPTION_KEY="your_exact_32_character_aes_key!!"
```

### 4. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💼 Data Analyst Interview Talking Points

- **ETL & Data Enrichment Pipeline:** Fetching raw OHLCV & quote JSON from Yahoo Finance, cleaning missing bars, computing derived financial metrics (annualized volatility, RSI, MACD, P/E), and caching normalized records in MongoDB.
- **Deterministic Multi-Factor Scoring:** Built an explainable weighted scoring model (40/35/25) rather than a black-box score, allowing stakeholders to inspect exact point deductions.
- **Data Exportability:** Added CSV export in the Stock Screener so analysts can pull live filtered NSE datasets directly into Python/Pandas, SQL, or Tableau/Power BI.
- **Data Privacy & Governance:** Implemented AES-256-CBC encryption at rest for user financial attributes and masked PII fields before serialization.
