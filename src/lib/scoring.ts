/**
 * Stock Scoring Algorithm
 * Composite scoring system combining technical, fundamental, and profile-fit analysis.
 */

export interface UserProfile {
  riskAppetite: "Low" | "Moderate" | "High";
  preferredInvestmentType: string[];
  financialGoals: string[];
  timeHorizon: "Short-term" | "Mid-term" | "Long-term";
  monthlyBudget?: number;
}

export interface StockMetrics {
  price: number;
  changePercent: number;
  volatility: number; // as percentage
  pe: number | null;
  eps: number | null;
  dividendYield: number | null;
  marketCap: number | null;
  high52: number | null;
  low52: number | null;
  sector: string;
  rsiValue: number | null;
  macdSignal: "bullish" | "bearish" | "neutral";
  priceVsSma200: "above" | "below" | "na";
}

interface ScoreDetail {
  label: string;
  score: number;
  maxScore: number;
}

interface CategoryScore {
  score: number;
  details: ScoreDetail[];
}

/**
 * Technical Score — out of 40 max
 * Evaluates RSI, MACD signal, price vs SMA(200), and volatility.
 */
export function calculateTechnicalScore(metrics: StockMetrics): CategoryScore {
  const details: ScoreDetail[] = [];

  // --- RSI (max 10) ---
  let rsiScore: number;
  if (metrics.rsiValue === null) {
    rsiScore = 5; // neutral when unavailable
  } else if (metrics.rsiValue >= 30 && metrics.rsiValue <= 70) {
    rsiScore = 10; // healthy range
  } else if (metrics.rsiValue >= 20 && metrics.rsiValue < 30) {
    rsiScore = 8; // oversold — potential buying opportunity
  } else if (metrics.rsiValue > 70 && metrics.rsiValue <= 80) {
    rsiScore = 4; // mildly overbought
  } else {
    rsiScore = 2; // deeply overbought or deeply oversold
  }
  details.push({ label: "RSI Health", score: rsiScore, maxScore: 10 });

  // --- MACD (max 10) ---
  let macdScore: number;
  switch (metrics.macdSignal) {
    case "bullish":
      macdScore = 10;
      break;
    case "neutral":
      macdScore = 5;
      break;
    case "bearish":
      macdScore = 2;
      break;
    default:
      macdScore = 5;
  }
  details.push({ label: "MACD Signal", score: macdScore, maxScore: 10 });

  // --- Price vs SMA(200) (max 10) ---
  let smaScore: number;
  switch (metrics.priceVsSma200) {
    case "above":
      smaScore = 10;
      break;
    case "below":
      smaScore = 3;
      break;
    case "na":
      smaScore = 5;
      break;
    default:
      smaScore = 5;
  }
  details.push({
    label: "Price vs SMA(200)",
    score: smaScore,
    maxScore: 10,
  });

  // --- Volatility (max 10) ---
  let volScore: number;
  if (metrics.volatility < 20) {
    volScore = 10; // low volatility
  } else if (metrics.volatility < 35) {
    volScore = 7; // medium volatility
  } else {
    volScore = 4; // high volatility
  }
  details.push({ label: "Volatility", score: volScore, maxScore: 10 });

  const totalScore = details.reduce((sum, d) => sum + d.score, 0);
  return { score: totalScore, details };
}

/**
 * Fundamental Score — out of 35 max
 * Evaluates PE ratio, EPS, dividend yield, and 52-week position.
 */
export function calculateFundamentalScore(
  metrics: StockMetrics
): CategoryScore {
  const details: ScoreDetail[] = [];

  // --- PE Ratio (max 10) ---
  let peScore: number;
  if (metrics.pe === null || metrics.pe <= 0) {
    peScore = 2; // N/A or negative PE
  } else if (metrics.pe >= 5 && metrics.pe <= 25) {
    peScore = 10; // sweet spot
  } else if (metrics.pe > 25 && metrics.pe <= 40) {
    peScore = 6; // somewhat high
  } else {
    peScore = 2; // very high PE or very low (possibly distressed)
  }
  details.push({ label: "PE Ratio", score: peScore, maxScore: 10 });

  // --- EPS (max 10) ---
  let epsScore: number;
  if (metrics.eps === null) {
    epsScore = 3; // unknown
  } else if (metrics.eps > 0) {
    epsScore = 10; // profitable
  } else {
    epsScore = 0; // loss-making
  }
  details.push({ label: "Earnings (EPS)", score: epsScore, maxScore: 10 });

  // --- Dividend Yield (max 8) ---
  let divScore: number;
  if (metrics.dividendYield === null) {
    divScore = 2;
  } else if (metrics.dividendYield >= 2) {
    divScore = 8; // strong dividend
  } else if (metrics.dividendYield >= 1) {
    divScore = 5; // moderate dividend
  } else {
    divScore = 2; // low/no dividend
  }
  details.push({ label: "Dividend Yield", score: divScore, maxScore: 8 });

  // --- 52-Week Position (max 7) ---
  let weekScore: number;
  if (metrics.high52 === null || metrics.low52 === null) {
    weekScore = 3; // unknown
  } else {
    const range = metrics.high52 - metrics.low52;
    if (range <= 0) {
      weekScore = 3;
    } else {
      const positionInRange =
        (metrics.price - metrics.low52) / range; // 0 = at low, 1 = at high
      if (positionInRange <= 0.2) {
        weekScore = 7; // near 52-week low — value opportunity
      } else if (positionInRange <= 0.4) {
        weekScore = 6;
      } else if (positionInRange <= 0.6) {
        weekScore = 5;
      } else if (positionInRange <= 0.8) {
        weekScore = 4;
      } else {
        weekScore = 3; // near 52-week high
      }
    }
  }
  details.push({
    label: "52-Week Position",
    score: weekScore,
    maxScore: 7,
  });

  const totalScore = details.reduce((sum, d) => sum + d.score, 0);
  return { score: totalScore, details };
}

/**
 * Profile Fit Score — out of 25 max
 * Evaluates how well the stock matches the user's investment profile.
 */
export function calculateProfileFitScore(
  metrics: StockMetrics,
  profile: UserProfile
): CategoryScore {
  const details: ScoreDetail[] = [];

  // --- Risk Alignment (max 10) ---
  let riskScore: number;
  switch (profile.riskAppetite) {
    case "Low":
      // Low-risk users want: low volatility, positive dividends, large-cap stability
      if (metrics.volatility < 20) riskScore = 10;
      else if (metrics.volatility < 30) riskScore = 6;
      else riskScore = 2;
      break;
    case "Moderate":
      // Moderate users want: balanced volatility
      if (metrics.volatility < 30) riskScore = 10;
      else if (metrics.volatility < 45) riskScore = 7;
      else riskScore = 4;
      break;
    case "High":
      // High-risk users are okay with volatility, reward momentum
      if (metrics.changePercent > 2) riskScore = 10;
      else if (metrics.changePercent > 0) riskScore = 8;
      else if (metrics.changePercent > -2) riskScore = 6;
      else riskScore = 4;
      break;
    default:
      riskScore = 5;
  }
  details.push({
    label: "Risk Alignment",
    score: riskScore,
    maxScore: 10,
  });

  // --- Income/Dividend Fit (max 8) ---
  let incomeFitScore: number;
  const wantsIncome =
    profile.financialGoals.some((g) =>
      /income|dividend|retire|passive/i.test(g)
    ) ||
    profile.preferredInvestmentType.some((t) =>
      /dividend|fixed.?income|bond/i.test(t)
    );

  if (wantsIncome) {
    // Income-focused: high dividend and positive EPS rewarded
    if (
      metrics.dividendYield !== null &&
      metrics.dividendYield >= 2 &&
      metrics.eps !== null &&
      metrics.eps > 0
    ) {
      incomeFitScore = 8;
    } else if (
      metrics.dividendYield !== null &&
      metrics.dividendYield >= 1
    ) {
      incomeFitScore = 5;
    } else {
      incomeFitScore = 2;
    }
  } else {
    // Growth-focused: momentum and positive change matter more
    if (metrics.changePercent > 0 && metrics.eps !== null && metrics.eps > 0) {
      incomeFitScore = 8;
    } else if (metrics.changePercent > 0) {
      incomeFitScore = 6;
    } else {
      incomeFitScore = 3;
    }
  }
  details.push({
    label: "Income/Growth Fit",
    score: incomeFitScore,
    maxScore: 8,
  });

  // --- Sector Match (max 7) ---
  let sectorScore: number;
  const sectorLower = metrics.sector.toLowerCase();
  const preferredLower = profile.preferredInvestmentType.map((t) =>
    t.toLowerCase()
  );

  // Check if the stock's sector matches any preferred investment type
  const sectorMatch = preferredLower.some(
    (pref) =>
      sectorLower.includes(pref) ||
      pref.includes(sectorLower) ||
      matchesSectorAlias(sectorLower, pref)
  );

  if (sectorMatch) {
    sectorScore = 7; // direct match
  } else if (preferredLower.length === 0) {
    sectorScore = 5; // no preference set
  } else {
    sectorScore = 3; // doesn't match preferences
  }
  details.push({ label: "Sector Match", score: sectorScore, maxScore: 7 });

  const totalScore = details.reduce((sum, d) => sum + d.score, 0);
  return { score: totalScore, details };
}

/**
 * Maps common sector aliases to canonical categories for matching.
 */
function matchesSectorAlias(sector: string, preference: string): boolean {
  const aliases: Record<string, string[]> = {
    technology: ["tech", "it", "software", "digital", "saas"],
    finance: ["banking", "bank", "financial", "fintech", "insurance", "nbfc"],
    healthcare: ["health", "pharma", "pharmaceutical", "biotech", "medical"],
    energy: ["oil", "gas", "power", "renewable", "solar", "wind", "utilities"],
    "consumer goods": [
      "fmcg",
      "consumer",
      "retail",
      "ecommerce",
      "e-commerce",
    ],
    industrials: [
      "manufacturing",
      "industrial",
      "infrastructure",
      "construction",
      "auto",
      "automobile",
    ],
    "real estate": ["realty", "property", "reit", "housing"],
    materials: ["metals", "mining", "steel", "chemicals", "cement"],
    telecom: ["telecommunication", "communications", "5g"],
  };

  for (const [canonical, aliasList] of Object.entries(aliases)) {
    const allTerms = [canonical, ...aliasList];
    const sectorMatches = allTerms.some(
      (t) => sector.includes(t) || t.includes(sector)
    );
    const prefMatches = allTerms.some(
      (t) => preference.includes(t) || t.includes(preference)
    );
    if (sectorMatches && prefMatches) return true;
  }

  return false;
}

type Grade = "A+" | "A" | "B+" | "B" | "C" | "D";

/**
 * Composite Score — out of 100 max
 * Combines technical (40), fundamental (35), and profile fit (25) scores.
 */
export function calculateCompositeScore(
  metrics: StockMetrics,
  profile: UserProfile
): {
  totalScore: number;
  grade: Grade;
  technical: CategoryScore;
  fundamental: CategoryScore;
  profileFit: CategoryScore;
  recommendation: string;
} {
  const technical = calculateTechnicalScore(metrics);
  const fundamental = calculateFundamentalScore(metrics);
  const profileFit = calculateProfileFitScore(metrics, profile);

  const totalScore = technical.score + fundamental.score + profileFit.score;

  // Determine grade
  let grade: Grade;
  if (totalScore >= 85) grade = "A+";
  else if (totalScore >= 75) grade = "A";
  else if (totalScore >= 65) grade = "B+";
  else if (totalScore >= 50) grade = "B";
  else if (totalScore >= 35) grade = "C";
  else grade = "D";

  // Generate recommendation string based on score and profile
  const recommendation = generateRecommendation(
    totalScore,
    grade,
    metrics,
    profile,
    technical,
    fundamental
  );

  return {
    totalScore,
    grade,
    technical,
    fundamental,
    profileFit,
    recommendation,
  };
}

/**
 * Generates a human-readable recommendation string.
 */
function generateRecommendation(
  totalScore: number,
  grade: Grade,
  metrics: StockMetrics,
  profile: UserProfile,
  technical: CategoryScore,
  fundamental: CategoryScore
): string {
  const riskLabel = profile.riskAppetite.toLowerCase();
  const horizon = profile.timeHorizon.toLowerCase();

  if (grade === "A+" || grade === "A") {
    if (profile.riskAppetite === "Low") {
      return `Strong pick for conservative investors — solid fundamentals (${fundamental.score}/35) with manageable volatility, well-suited for ${horizon} holding.`;
    }
    return `Highly rated (${totalScore}/100) — strong technicals and fundamentals make this a compelling opportunity for ${riskLabel}-risk ${horizon} investors.`;
  }

  if (grade === "B+" || grade === "B") {
    if (technical.score >= 30) {
      return `Decent technical momentum (${technical.score}/40) but mixed fundamentals — consider adding to watchlist and entering on pullbacks for ${horizon} gains.`;
    }
    if (fundamental.score >= 25) {
      return `Solid fundamentals (${fundamental.score}/35) but weak technicals — may be a good value buy for patient ${horizon} investors with ${riskLabel} risk tolerance.`;
    }
    return `Moderate score (${totalScore}/100) — neither a strong buy nor sell; monitor for improved signals before committing capital.`;
  }

  if (grade === "C") {
    return `Below-average score (${totalScore}/100) — multiple weaknesses detected; not ideal for ${riskLabel}-risk profiles targeting ${horizon} goals.`;
  }

  return `Low score (${totalScore}/100) — significant concerns across technicals and fundamentals; consider avoiding or only for high-risk speculative positions.`;
}
