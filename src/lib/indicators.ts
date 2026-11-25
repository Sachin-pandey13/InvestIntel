/**
 * Technical Indicator Calculations
 * Pure functions for computing standard stock market indicators.
 */

/**
 * Simple Moving Average
 * For each point, returns the average of the last `period` values.
 * Returns null for the first (period - 1) points.
 */
export function sma(closes: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += closes[j];
      }
      result.push(sum / period);
    }
  }

  return result;
}

/**
 * Exponential Moving Average
 * Multiplier = 2 / (period + 1). First EMA value = SMA of first `period` values.
 * Returns null for the first (period - 1) points.
 */
export function ema(closes: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);

  if (closes.length < period) {
    return closes.map(() => null);
  }

  // Fill nulls for the first (period - 1) points
  for (let i = 0; i < period - 1; i++) {
    result.push(null);
  }

  // First EMA value = SMA of first `period` values
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += closes[i];
  }
  let prevEma = sum / period;
  result.push(prevEma);

  // Subsequent EMA values
  for (let i = period; i < closes.length; i++) {
    const currentEma = (closes[i] - prevEma) * multiplier + prevEma;
    result.push(currentEma);
    prevEma = currentEma;
  }

  return result;
}

/**
 * Relative Strength Index
 * Returns values 0–100. null for the first `period` points.
 */
export function rsi(closes: number[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];

  if (closes.length < period + 1) {
    return closes.map(() => null);
  }

  // Step 1: Calculate daily gains and losses
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // Fill nulls for the first `period` points (index 0 through period-1)
  for (let i = 0; i <= period - 1; i++) {
    result.push(null);
  }

  // Step 2: First average gain/loss = simple average of first `period` changes
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }
  avgGain /= period;
  avgLoss /= period;

  // Step 3: RSI = 100 - 100 / (1 + RS)
  if (avgLoss === 0) {
    result.push(100);
  } else {
    const rs = avgGain / avgLoss;
    result.push(100 - 100 / (1 + rs));
  }

  // Step 4: Smoothed average for subsequent values
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    if (avgLoss === 0) {
      result.push(100);
    } else {
      const rs = avgGain / avgLoss;
      result.push(100 - 100 / (1 + rs));
    }
  }

  return result;
}

/**
 * MACD (Moving Average Convergence Divergence)
 * MACD Line = EMA(12) - EMA(26)
 * Signal Line = EMA(9) of MACD Line
 * Histogram = MACD Line - Signal Line
 */
export function macd(closes: number[]): {
  macdLine: (number | null)[];
  signalLine: (number | null)[];
  histogram: (number | null)[];
} {
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);

  // MACD Line = EMA(12) - EMA(26)
  const macdLine: (number | null)[] = closes.map((_, i) => {
    const e12 = ema12[i];
    const e26 = ema26[i];
    if (e12 === null || e26 === null) return null;
    return e12 - e26;
  });

  // Signal Line = EMA(9) of the non-null MACD values
  // We need to compute EMA(9) over the MACD line values
  const macdValues: number[] = [];
  const macdStartIndex = macdLine.findIndex((v) => v !== null);

  if (macdStartIndex === -1) {
    return {
      macdLine: closes.map(() => null),
      signalLine: closes.map(() => null),
      histogram: closes.map(() => null),
    };
  }

  for (let i = macdStartIndex; i < macdLine.length; i++) {
    macdValues.push(macdLine[i] as number);
  }

  const signalEma = ema(macdValues, 9);

  // Map signal line back to full-length array
  const signalLine: (number | null)[] = closes.map(() => null);
  for (let i = 0; i < signalEma.length; i++) {
    signalLine[macdStartIndex + i] = signalEma[i];
  }

  // Histogram = MACD Line - Signal Line
  const histogram: (number | null)[] = closes.map((_, i) => {
    const m = macdLine[i];
    const s = signalLine[i];
    if (m === null || s === null) return null;
    return m - s;
  });

  return { macdLine, signalLine, histogram };
}

/**
 * Bollinger Bands
 * Middle = SMA(period)
 * Upper = Middle + stdDevMultiplier * StdDev(period)
 * Lower = Middle - stdDevMultiplier * StdDev(period)
 */
export function bollingerBands(
  closes: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
} {
  const middle = sma(closes, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < closes.length; i++) {
    const mid = middle[i];
    if (mid === null) {
      upper.push(null);
      lower.push(null);
    } else {
      // Calculate standard deviation over the last `period` values
      let sumSqDiff = 0;
      for (let j = i - period + 1; j <= i; j++) {
        const diff = closes[j] - mid;
        sumSqDiff += diff * diff;
      }
      const stdDev = Math.sqrt(sumSqDiff / period);
      upper.push(mid + stdDevMultiplier * stdDev);
      lower.push(mid - stdDevMultiplier * stdDev);
    }
  }

  return { upper, middle, lower };
}

/**
 * Annualized Volatility
 * StdDev of daily returns * sqrt(252) * 100 (as percentage)
 */
export function calculateVolatility(closes: number[]): number {
  if (closes.length < 2) return 0;

  // Calculate daily returns
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i - 1] !== 0) {
      returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    }
  }

  if (returns.length === 0) return 0;

  // Mean return
  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

  // Standard deviation
  const sumSqDiff = returns.reduce(
    (sum, r) => sum + (r - meanReturn) ** 2,
    0
  );
  const stdDev = Math.sqrt(sumSqDiff / returns.length);

  // Annualize: multiply by sqrt(252 trading days) and convert to percentage
  return stdDev * Math.sqrt(252) * 100;
}

/**
 * Generate composite trading signals using RSI, MACD, and SMA crossover.
 */
export function generateSignals(closes: number[]): {
  signal: "BUY" | "SELL" | "HOLD";
  reasons: string[];
} {
  const reasons: string[] = [];
  let buySignals = 0;
  let sellSignals = 0;

  if (closes.length === 0) {
    return { signal: "HOLD", reasons: ["Insufficient data"] };
  }

  const currentPrice = closes[closes.length - 1];

  // --- RSI Analysis ---
  const rsiValues = rsi(closes, 14);
  const latestRsi = rsiValues[rsiValues.length - 1];

  if (latestRsi !== null) {
    if (latestRsi < 30) {
      buySignals++;
      reasons.push(`RSI is ${latestRsi.toFixed(1)} (oversold, below 30)`);
    } else if (latestRsi > 70) {
      sellSignals++;
      reasons.push(`RSI is ${latestRsi.toFixed(1)} (overbought, above 70)`);
    } else {
      reasons.push(`RSI is ${latestRsi.toFixed(1)} (neutral range)`);
    }
  }

  // --- MACD Analysis ---
  const macdResult = macd(closes);
  const latestMacd = macdResult.macdLine[macdResult.macdLine.length - 1];
  const latestSignal = macdResult.signalLine[macdResult.signalLine.length - 1];
  const latestHistogram = macdResult.histogram[macdResult.histogram.length - 1];
  const prevHistogram =
    macdResult.histogram.length >= 2
      ? macdResult.histogram[macdResult.histogram.length - 2]
      : null;

  if (
    latestHistogram !== null &&
    prevHistogram !== null &&
    latestMacd !== null &&
    latestSignal !== null
  ) {
    // Bullish crossover: histogram goes from negative to positive
    if (prevHistogram <= 0 && latestHistogram > 0) {
      buySignals++;
      reasons.push("MACD bullish crossover detected");
    }
    // Bearish crossover: histogram goes from positive to negative
    else if (prevHistogram >= 0 && latestHistogram < 0) {
      sellSignals++;
      reasons.push("MACD bearish crossover detected");
    } else if (latestHistogram > 0) {
      reasons.push("MACD in bullish territory");
    } else {
      reasons.push("MACD in bearish territory");
    }
  }

  // --- SMA(200) Analysis ---
  const sma200 = sma(closes, 200);
  const latestSma200 = sma200[sma200.length - 1];

  if (latestSma200 !== null) {
    if (currentPrice > latestSma200) {
      buySignals++;
      reasons.push(
        `Price (${currentPrice.toFixed(2)}) is above SMA(200) (${latestSma200.toFixed(2)})`
      );
    } else {
      sellSignals++;
      reasons.push(
        `Price (${currentPrice.toFixed(2)}) is below SMA(200) (${latestSma200.toFixed(2)})`
      );
    }
  } else {
    reasons.push("Insufficient data for SMA(200) analysis");
  }

  // --- Composite Signal ---
  if (buySignals > sellSignals) {
    return { signal: "BUY", reasons };
  } else if (sellSignals > buySignals) {
    return { signal: "SELL", reasons };
  }

  return { signal: "HOLD", reasons };
}
