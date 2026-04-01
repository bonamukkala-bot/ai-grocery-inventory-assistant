import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import InventoryForm from './components/InventoryForm';
import InventoryTable from './components/InventoryTable';
import Loader from './components/Loader';
import { Sparkles, AlertCircle, RefreshCw, ListPlus, Trash2, BrainCircuit } from 'lucide-react';

interface InventoryItem {
  name: string;
  stock: number;
  sales: number[];
  unit: string;
}

interface AnalyzedItem {
  name: string;
  stock: number;
  unit: string;
  avg_sales: number;
  days_left: number;
  reorder: number;
  status: string;
}

export default function App() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnalyzedItem[] | null>(null);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddItem = (newItem: InventoryItem) => {
    setItems(prev => [...prev, newItem]);
    setResults(null);
    setAiInsights(null);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
    setResults(null);
    setAiInsights(null);
  };

  const handleAnalyze = async () => {
    if (items.length === 0) {
      setError("Please add at least one item to analyze.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);
    setAiInsights(null);

    try {
      // 1. Call Backend for Bulk Analysis
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response received:", text);
        throw new Error("The server returned an invalid response. Please check if the backend is running correctly.");
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to analyze inventory.');
      }

      const analyzedData: AnalyzedItem[] = await response.json();
      setResults(analyzedData);

      // 2. Generate AI Insights on Frontend with simple retry
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const model = "gemini-2.5-flash";
      
      const criticalItems = analyzedData.filter(i => i.status === 'Critical').map(i => i.name);
      const lowItems = analyzedData.filter(i => i.status === 'Low').map(i => i.name);
      const prompt = `
          You are an expert AI inventory assistant helping a grocery store owner.
          Analyze the following inventory data and provide a detailed, item-wise explanation for EACH item.
          IMPORTANT: Use the correct units (kg, liters, packets, etc.) provided for each item in your response.

          Input Data: ${JSON.stringify(analyzedData)}

          ---
          STRICT OUTPUT FORMAT FOR EACH ITEM:
          📦 [Item Name]

          Current Stock: [X] [unit]
          Daily Usage: [Y] [unit]/day

          ⏳ Days Remaining: [Z] days

          🛒 Reorder Quantity: [N] [unit]
          📅 Reorder Timing: [Timing based on logic below]

          💡 Insight:
          [1-2 line simple, professional, and actionable explanation using the correct unit]
          ---

          REORDER TIMING LOGIC:
          - If days_left < 2 → "Immediately"
          - If 2 ≤ days_left < 5 → "Within 1–2 days"
          - If 5 ≤ days_left < 10 → "Within this week"
          - If > 10 → "No urgent action required"

          URGENCY LOGIC:
          - Critical: days_left < 3
          - Medium: 3–7
          - Safe: >7

          FINAL STRUCTURE:
          1. Process all items one by one in the specified format.
          2. Clearly highlight items with "Critical" urgency.
          3. Use simple, business-friendly language.
          4. Keep it clean and easy to read.
        `;

      let aiResponse;
      let retries = 2;
      while (retries >= 0) {
        try {
          aiResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
          });
          break;
        } catch (e: any) {
          if (retries === 0) throw e;
          // If it's a 503 or 429, wait and retry
          if (e.message?.includes('503') || e.message?.includes('429')) {
            await new Promise(r => setTimeout(r, 2000));
            retries--;
          } else {
            throw e;
          }
        }
      }

      if (aiResponse) {
        setAiInsights(aiResponse.text || "Analysis complete. Please review the table above.");
      }
    } catch (err) {
      console.error('Analysis Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/5 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-16 md:py-24">
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-6"
          >
            <Sparkles size={14} />
            AI-Powered Intelligence
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-800 mb-6">
            Inventory <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">Intelligence</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Add your grocery items and let our AI analyze your stock levels with precision.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-8">
            <InventoryForm onAddItem={handleAddItem} isLoading={isLoading} />
            
            {/* Added Items List */}
            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-slate-100 rounded-2xl text-slate-600">
                  <ListPlus size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Items to Analyze</h2>
              </div>
              
              {items.length > 0 && (
                <button 
                  onClick={() => { setItems([]); setResults(null); setAiInsights(null); }}
                  className="absolute top-8 right-8 text-xs font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                >
                  Clear All
                </button>
              )}
              
              {items.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-slate-400 font-bold">No items added yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map((item, index) => (
                      <motion.div
                        key={`${item.name}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group"
                      >
                        <div>
                          <p className="font-bold text-slate-700">{item.name}</p>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Stock: {item.stock} {item.unit}</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  <motion.button
                    whileHover={items.length > 0 ? { scale: 1.02 } : {}}
                    whileTap={items.length > 0 ? { scale: 0.98 } : {}}
                    onClick={handleAnalyze}
                    disabled={isLoading || items.length === 0}
                    className="w-full mt-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing...
                      </div>
                    ) : (
                      <>
                        <BrainCircuit size={22} />
                        Analyze Inventory
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-12">
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-24 gap-6"
                >
                  <Loader text="Analyzing Inventory..." />
                  <p className="text-slate-400 font-bold animate-pulse">Running backend computations & AI analysis...</p>
                </motion.div>
              )}

              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-8 flex flex-col items-center text-center gap-4"
                >
                  <div className="p-4 bg-red-100 text-red-600 rounded-2xl">
                    <AlertCircle size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-800">Error Occurred</h3>
                    <p className="text-red-600/80 font-medium mt-1">{error}</p>
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="mt-2 px-6 py-2 bg-red-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-700 transition-colors"
                  >
                    <RefreshCw size={16} />
                    Try Again
                  </button>
                </motion.div>
              )}

              {results && (
                <div key="results" className="space-y-8">
                  <InventoryTable results={results} />
                  
                  {/* AI Insights Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 border border-slate-800 relative overflow-hidden shadow-2xl"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <BrainCircuit size={120} className="text-indigo-400" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 text-indigo-400 mb-6">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                          <Sparkles size={20} />
                        </div>
                        <span className="font-black text-sm uppercase tracking-[0.2em]">AI Inventory Insights</span>
                      </div>
                      <div className="text-slate-300 leading-relaxed font-medium text-lg whitespace-pre-wrap">
                        {aiInsights || "Generating insights..."}
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
              
              {!results && !isLoading && !error && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-32 text-center"
                >
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
                    <BrainCircuit size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-300">Ready for Analysis</h3>
                  <p className="text-slate-400 font-medium mt-2 max-w-xs">Add items on the left and click analyze to see results.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-12 text-center text-slate-400 text-sm font-bold border-t border-slate-100">
        &copy; 2026 Inventory AI Assistant. Built for Smarter Retail.
      </footer>
    </div>
  );
}
