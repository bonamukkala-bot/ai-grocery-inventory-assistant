import { motion } from 'motion/react';
import { Calendar, ShoppingCart, Info, TrendingDown } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface PredictionData {
  itemName: string;
  days_left: number;
  reorder: number;
  explanation: string;
}

export default function PredictionCard({ data }: { data: PredictionData }) {
  const getDaysColor = (days: number) => {
    if (days < 3) return "text-red-600";
    if (days <= 7) return "text-yellow-600";
    return "text-green-600";
  };

  const stockHealth = Math.min(100, (data.days_left / 14) * 100);
  const healthColor = data.days_left < 3 ? "bg-red-500" : data.days_left <= 7 ? "bg-yellow-500" : "bg-green-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col"
    >
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Prediction for</h3>
          <h2 className="text-2xl font-bold text-gray-800">{data.itemName}</h2>
        </div>
        <StatusBadge days={data.days_left} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Calendar size={18} />
            <span className="text-sm font-medium">Days Remaining</span>
          </div>
          <div className={`text-5xl font-black ${getDaysColor(data.days_left)}`}>
            {data.days_left}
          </div>
          <p className="text-xs text-gray-400 mt-2">Estimated depletion time</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <ShoppingCart size={18} />
            <span className="text-sm font-medium">Reorder Recommendation</span>
          </div>
          <div className="text-5xl font-black text-indigo-600">
            {data.reorder}
          </div>
          <p className="text-xs text-gray-400 mt-2">Units suggested for restock</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <TrendingDown size={16} className="text-indigo-500" />
            Stock Health
          </span>
          <span className="text-sm font-bold text-gray-800">{Math.round(stockHealth)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${stockHealth}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${healthColor}`}
          />
        </div>
      </div>

      <div className="mt-auto bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
        <div className="flex items-center gap-2 text-indigo-700 mb-2">
          <Info size={18} />
          <span className="text-sm font-bold">AI Insights</span>
        </div>
        <p className="text-indigo-900/80 leading-relaxed text-sm">
          {data.explanation}
        </p>
      </div>
    </motion.div>
  );
}
