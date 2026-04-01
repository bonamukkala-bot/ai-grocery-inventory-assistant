import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Hash, BarChart3, Sparkles, AlertCircle } from 'lucide-react';

interface InventoryFormProps {
  onAddItem: (data: { name: string; stock: number; sales: number[]; unit: string }) => void;
  isLoading: boolean;
}

const UNIT_OPTIONS = ['kg', 'liters', 'grams', 'packets', 'dozen', 'units'];

const AUTO_UNIT_MAP: Record<string, string> = {
  'rice': 'kg',
  'sugar': 'kg',
  'onion': 'kg',
  'tomato': 'kg',
  'salt': 'kg',
  'milk': 'liters',
  'oil': 'liters',
  'egg': 'dozen',
  'bread': 'packets',
  'butter': 'grams'
};

export default function InventoryForm({ onAddItem, isLoading }: InventoryFormProps) {
  const [name, setName] = useState('');
  const [stock, setStock] = useState('');
  const [sales, setSales] = useState('');
  const [unit, setUnit] = useState('units');
  const [error, setError] = useState<string | null>(null);

  // Auto-map unit based on name
  const handleNameChange = (val: string) => {
    setName(val);
    const lowerVal = val.toLowerCase();
    for (const [key, mappedUnit] of Object.entries(AUTO_UNIT_MAP)) {
      if (lowerVal.includes(key)) {
        setUnit(mappedUnit);
        break;
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!name.trim() || !stock || !sales.trim()) {
      setError('All fields are required.');
      return;
    }

    const stockNum = parseInt(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      setError('Stock must be a valid non-negative number.');
      return;
    }

    const salesArray = sales.split(',')
      .map(s => s.trim())
      .filter(s => s !== '')
      .map(s => parseInt(s));

    if (salesArray.some(isNaN)) {
      setError('Sales data must contain only numbers separated by commas.');
      return;
    }

    if (salesArray.length < 3) {
      setError('Please provide at least 3 days of sales data.');
      return;
    }

    onAddItem({
      name: name.trim(),
      stock: stockNum,
      sales: salesArray,
      unit
    });

    // Reset form
    setName('');
    setStock('');
    setSales('');
    setUnit('units');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-8 md:p-10"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
          <Package size={24} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Predict Stock</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Item Name</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Package size={20} />
            </div>
            <input
              type="text"
              placeholder="e.g. Organic Sugar"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-slate-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Current Stock</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Hash size={20} />
              </div>
              <input
                type="number"
                placeholder="e.g. 150"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Unit</label>
            <div className="relative group">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-slate-700 appearance-none cursor-pointer"
              >
                {UNIT_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <BarChart3 size={16} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Last 5 Days Sales</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <BarChart3 size={20} />
            </div>
            <input
              type="text"
              placeholder="e.g. 10, 12, 8, 9, 11"
              value={sales}
              onChange={(e) => setSales(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-slate-700"
            />
          </div>
          <p className="text-xs text-slate-400 font-medium ml-1">Enter numbers separated by commas (min 3 values)</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          className="w-full py-5 bg-slate-800 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50 transition-all"
        >
          <Package size={22} />
          Add to Inventory
        </motion.button>
      </form>
    </motion.div>
  );
}
