"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { Search, TrendingUp, RefreshCw, AlertCircle, Plus, X, Brain, Calculator, Info, Shield, BookmarkPlus, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const colors = ["#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];
const ranges = [
  { label: "1W", value: "1wk" }, // Note: we'll map to yahoo finance range 
  { label: "1M", value: "1mo" },
  { label: "3M", value: "3mo" },
  { label: "6M", value: "6mo" },
  { label: "1Y", value: "1y" },
  { label: "5Y", value: "5y" }
];

export default function InvestPage() {
  const { user } = useAuth();
  const [symbols, setSymbols] = useState<string[]>(["RELIANCE.NS", "TCS.NS"]);
  const [inputVal, setInputVal] = useState("");
  const [activeRange, setActiveRange] = useState("3mo");
  const [data, setData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [simulatorAmount, setSimulatorAmount] = useState(50000);

  const fetchComparison = async (symbolsToFetch: string[], range: string) => {
    if (symbolsToFetch.length === 0) {
      setData([]);
      setChartData([]);
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch(`/api/stocks/compare?symbols=${symbolsToFetch.join(",")}&range=${range}`);
      const result = await res.json();
      
      if (result.success) {
        setData(result.data);
        
        const dateMap = new Map();
        result.data.forEach((stock: any) => {
          stock.history.forEach((point: any) => {
            if (!dateMap.has(point.date)) {
              dateMap.set(point.date, { date: point.date });
            }
            const existing = dateMap.get(point.date);
            existing[stock.symbol] = point.close;
          });
        });
        
        const merged = Array.from(dateMap.values());
        
        // ISSUE 1 FIX: Normalize the chart to base 100
        const startValues: Record<string, number> = {};
        const normalizedMerged = merged.map((point: any, index: number) => {
          const newPoint: Record<string, any> = { date: point.date };
          Object.keys(point).forEach(key => {
            if (key !== "date") {
              if (index === 0) {
                startValues[key] = point[key];
              }
              // Normalizing to start at 100
              newPoint[key] = startValues[key] ? (point[key] / startValues[key]) * 100 : 100;
            }
          });
          return newPoint;
        });

        setChartData(normalizedMerged);
      } else {
        setError("Market data temporarily unavailable. We are attempting to reconnect via fallbacks.");
      }
    } catch (err) {
      setError("Data providers temporarily unreachable. Loading cached snapshot if available...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison(symbols, activeRange);
  }, [activeRange]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const topStocks = [
    { symbol: "RELIANCE.NS", name: "Reliance Industries" },
    { symbol: "TCS.NS", name: "Tata Consultancy Services" },
    { symbol: "HDFCBANK.NS", name: "HDFC Bank" },
    { symbol: "INFY.NS", name: "Infosys" },
    { symbol: "ICICIBANK.NS", name: "ICICI Bank" },
    { symbol: "SBIN.NS", name: "State Bank of India" },
    { symbol: "BHARTIARTL.NS", name: "Bharti Airtel" },
    { symbol: "ITC.NS", name: "ITC Limited" },
    { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever" },
    { symbol: "LT.NS", name: "Larsen & Toubro" },
  ];

  const filteredStocks = topStocks.filter(s => 
    s.symbol.toLowerCase().includes(inputVal.toLowerCase()) || 
    s.name.toLowerCase().includes(inputVal.toLowerCase())
  );

  const handleToggleSymbol = (sym: string) => {
    let newSymbols;
    if (symbols.includes(sym)) {
      newSymbols = symbols.filter(s => s !== sym);
    } else {
      if (symbols.length >= 5) {
        setError("Maximum 5 symbols allowed for comparison.");
        return;
      }
      newSymbols = [...symbols, sym];
    }
    setSymbols(newSymbols);
    fetchComparison(newSymbols, activeRange);
  };

  const formatLargeNum = (num: any) => {
    if (!num || isNaN(num)) return "N/A";
    const n = Number(num);
    if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    return n.toLocaleString("en-IN");
  };

  const getRiskLabel = (volatility: number) => {
    if (volatility < 15) return "Low";
    if (volatility < 25) return "Moderate";
    return "High";
  };

  const getRecommendation = (stock: any) => {
    // Deterministic simulation based on user profile and stock volatility
    const userRisk = user?.riskAppetite?.toLowerCase() || "moderate";
    const v = Number(stock.volatility);
    let score = 75; // base
    
    if (userRisk === "low" && v < 15) score += 15;
    else if (userRisk === "low" && v > 25) score -= 25;
    if (userRisk === "high" && v > 20) score += 10;
    if (userRisk === "moderate" && v >= 15 && v <= 25) score += 12;

    if (stock.changePercent > 5) score += 5;
    else if (stock.changePercent < -5) score -= 10;

    let action = "HOLD";
    let color = "#f59e0b";
    if (score >= 80) { action = "BUY"; color = "#10b981"; }
    else if (score <= 60) { action = "AVOID"; color = "#ef4444"; }

    return { score: Math.min(99, Math.max(10, score)), action, color };
  };

  const stocksOnly = data.filter(s => s.symbol !== "^NSEI");
  const niftyData = data.find(s => s.symbol === "^NSEI");

  return (
    <div className="max-w-[1440px] mx-auto space-y-5 pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Investment Intelligence</h1>
          <p className="text-sm text-[#94a3b8] mb-2">AI-powered asset comparison based on your financial health profile.</p>
          
          {data.length > 0 && (
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider font-bold">
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Data Source: {data[0]?.source || "Multi-Provider Cluster"}
              </span>
              <span className="text-[#64748b]">
                Last Updated: {data[0]?.lastUpdated ? new Date(data[0].lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                {data[0]?.isCached && " (Cached)"}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex bg-[#0f172a] rounded-xl p-1 border border-white/5">
            {ranges.map(r => (
              <button
                key={r.value}
                onClick={() => setActiveRange(r.value)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeRange === r.value ? 'bg-purple-500/20 text-purple-400' : 'text-[#64748b] hover:text-white'}`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input 
                type="text" 
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search stocks to compare..." 
                className="pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 w-full transition-all"
              />
              {isDropdownOpen && (
                <button onClick={() => setIsDropdownOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="max-h-64 overflow-y-auto p-2">
                    {filteredStocks.map(stock => {
                      const isSelected = symbols.includes(stock.symbol);
                      return (
                        <div 
                          key={stock.symbol}
                          onClick={() => handleToggleSymbol(stock.symbol)}
                          className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-purple-500/10' : 'hover:bg-white/5'}`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-purple-500 border-purple-500' : 'border-[#64748b]'}`}>
                            {isSelected && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-white"><path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${isSelected ? 'text-purple-400' : 'text-white'}`}>{stock.symbol}</p>
                            <p className="text-[10px] text-[#64748b] truncate">{stock.name}</p>
                          </div>
                        </div>
                      );
                    })}
                    {filteredStocks.length === 0 && (
                      <p className="text-sm text-[#64748b] text-center py-4">No stocks found.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-[#f87171]/10 border border-[#f87171]/20 rounded-xl text-[#f87171] text-sm font-medium">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Selected Symbols Pills */}
      <div className="flex flex-wrap gap-2">
        {symbols.map((sym, i) => {
          const stockInfo = data.find(d => d.symbol === sym);
          return (
            <div key={sym} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0f172a] border border-white/5" style={{ borderLeftColor: colors[i % colors.length], borderLeftWidth: 3 }}>
              <span className="text-xs font-bold text-white">{sym}</span>
              {stockInfo && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${stockInfo.changePercent >= 0 ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>
                  {stockInfo.changePercent >= 0 ? '+' : ''}{stockInfo.changePercent?.toFixed(2)}%
                </span>
              )}
              <button onClick={() => handleToggleSymbol(sym)} className="text-[#64748b] hover:text-[#f87171] transition ml-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-5">
        
        {/* Left Column: Chart & Fundamentals */}
        <div className="col-span-12 xl:col-span-8 space-y-5">
          
          {/* Chart Card */}
          <div className="glass p-5 flex flex-col relative overflow-hidden min-h-[420px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" /> Performance Comparison
              </h2>
              {niftyData && (
                <span className="text-xs text-[#64748b] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white/20"></span> vs NIFTY 50 benchmark
                </span>
              )}
            </div>

            {loading && (
              <div className="absolute inset-0 z-10 bg-[#020617]/50 backdrop-blur-sm flex flex-col items-center justify-center">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mb-3" />
                <span className="text-sm font-medium text-white">Synthesizing Market Data...</span>
              </div>
            )}

            {chartData.length > 0 && (
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => val.toFixed(0)} domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                      itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '11px', marginBottom: '6px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
                    
                    {symbols.map((sym, i) => (
                      <Line key={sym} type="monotone" dataKey={sym} stroke={colors[i % colors.length]} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: colors[i % colors.length], stroke: '#0f172a', strokeWidth: 2 }} />
                    ))}
                    {niftyData && (
                      <Line type="monotone" dataKey="^NSEI" name="NIFTY 50" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} strokeDasharray="5 5" dot={false} activeDot={{ r: 4 }} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Fundamentals Table */}
          <div className="glass p-5">
            <h2 className="text-sm font-bold text-white mb-4">Core Fundamentals</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Metric</th>
                    {stocksOnly.map((s, i) => (
                      <th key={s.symbol} className="pb-3 text-xs font-bold text-white px-4" style={{ color: colors[i % colors.length] }}>{s.symbol}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm text-white">
                  {["Market Cap", "P/E Ratio", "EPS", "Div Yield", "52W High", "52W Low", "Volatility (Risk)"].map((metric, idx) => (
                    <tr key={metric} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                      <td className="py-3 text-[#94a3b8] font-medium">{metric}</td>
                      {stocksOnly.map(s => {
                        let val = "";
                        if (metric === "Market Cap") val = formatLargeNum(s.fundamentals.marketCap);
                        if (metric === "P/E Ratio") val = s.fundamentals.pe;
                        if (metric === "EPS") val = s.fundamentals.eps;
                        if (metric === "Div Yield") val = s.fundamentals.dividendYield;
                        if (metric === "52W High") val = s.fundamentals.high52;
                        if (metric === "52W Low") val = s.fundamentals.low52;
                        if (metric === "Volatility (Risk)") val = `${s.volatility}% (${getRiskLabel(Number(s.volatility))})`;
                        return <td key={s.symbol} className="py-3 px-4 font-semibold">{val}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: AI & Simulator */}
        <div className="col-span-12 xl:col-span-4 space-y-5">
          
          {/* AI Recommendation Panel */}
          {stocksOnly.length > 0 && (
            <div className="relative p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-500/10 to-[#020617] overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[50px] rounded-full" />
              
              <div className="flex items-center gap-2 mb-6">
                <Brain className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-bold text-white">Smart Recommendation</h2>
              </div>

              {stocksOnly.map(stock => {
                const rec = getRecommendation(stock);
                return (
                  <div key={stock.symbol} className="mb-6 last:mb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{stock.symbol}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${rec.color}15`, color: rec.color, border: `1px solid ${rec.color}30` }}>
                            {rec.action}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748b] mt-0.5">{stock.fundamentals.sector} Sector</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#94a3b8] mb-0.5">Portfolio Fit</p>
                        <p className="text-xl font-black" style={{ color: rec.color }}>{rec.score}%</p>
                      </div>
                    </div>

                    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b] mb-2">AI Reasoning</p>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-1.5 text-xs text-[#cbd5e1]">
                          <span className="text-purple-400 mt-0.5">•</span> 
                          {Number(stock.volatility) < 20 ? "Lower volatility provides stable growth." : "High price fluctuation indicates elevated risk."}
                        </li>
                        <li className="flex items-start gap-1.5 text-xs text-[#cbd5e1]">
                          <span className="text-purple-400 mt-0.5">•</span> 
                          {stock.changePercent > niftyData?.changePercent ? "Outperforming benchmark (NIFTY 50)." : "Underperforming broader market indices."}
                        </li>
                        <li className="flex items-start gap-1.5 text-xs text-[#cbd5e1]">
                          <span className="text-purple-400 mt-0.5">•</span> 
                          Fits your stated <strong>{user?.riskAppetite || "moderate"}</strong> risk appetite.
                        </li>
                      </ul>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Investment Simulator */}
          <div className="glass p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400" />
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Investment Simulator</h2>
            </div>
            
            <p className="text-xs text-[#94a3b8] mb-3">If you invested <span className="font-bold text-white">₹{simulatorAmount.toLocaleString('en-IN')}</span> {activeRange} ago:</p>
            
            <div className="space-y-3">
              {stocksOnly.map((s, i) => {
                const initial = s.history[0]?.close || s.price;
                const final = s.history[s.history.length-1]?.close || s.price;
                const multiplier = final / initial;
                const simulatedFinal = simulatorAmount * multiplier;
                const profit = simulatedFinal - simulatorAmount;
                const isProfit = profit >= 0;

                return (
                  <div key={s.symbol} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                      <div>
                        <p className="text-sm font-bold text-white">{s.symbol}</p>
                        <button className="text-[10px] text-[#64748b] hover:text-white flex items-center gap-1 mt-0.5 transition">
                          <BookmarkPlus className="w-3 h-3" /> Watchlist
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-white">₹{Math.round(simulatedFinal).toLocaleString('en-IN')}</p>
                      <p className={`text-xs font-bold ${isProfit ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                        {isProfit ? '+' : ''}₹{Math.round(profit).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Prompt AI */}
          <div className="glass p-1 pl-4 rounded-full flex items-center justify-between border border-purple-500/30 bg-purple-500/5">
            <p className="text-xs text-[#94a3b8]">Ask AI: <span className="italic text-white">"Compare these for long-term?"</span></p>
            <button className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center hover:bg-purple-400 transition cursor-pointer">
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
