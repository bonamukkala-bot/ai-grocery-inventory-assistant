import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface InventoryItem {
  id: number;
  item: string;
  stock: number;
  days_left: number;
  reorder: number;
  urgency: 'URGENT' | 'MEDIUM' | 'SAFE';
}

interface InventoryTableProps {
  items: InventoryItem[];
}

export default function InventoryTable({ items }: InventoryTableProps) {
  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case 'URGENT': return 'bg-red-50 text-red-700 border-red-100';
      case 'MEDIUM': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'SAFE': return 'bg-green-50 text-green-700 border-green-100';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'URGENT': return <AlertCircle size={16} />;
      case 'MEDIUM': return <AlertTriangle size={16} />;
      case 'SAFE': return <CheckCircle2 size={16} />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Item Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Days Left</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-700">{item.item}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-500 font-medium">{item.stock} units</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`font-black text-lg ${
                    item.days_left < 3 ? 'text-red-600' : item.days_left <= 7 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {item.days_left}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getUrgencyStyles(item.urgency)}`}>
                    {getUrgencyIcon(item.urgency)}
                    {item.urgency}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                    Order {item.reorder}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
