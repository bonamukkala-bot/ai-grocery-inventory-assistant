import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface AnalyzedItem {
  name: string;
  stock: number;
  unit: string;
  avg_sales: number;
  days_left: number;
  reorder: number;
  status: string;
}

interface InventoryTableProps {
  results: AnalyzedItem[];
}

export default function InventoryTable({ results }: InventoryTableProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Low':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Critical':
        return <AlertCircle size={14} />;
      case 'Low':
        return <Clock size={14} />;
      default:
        return <CheckCircle2 size={14} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Item Name</th>
              <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Stock</th>
              <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Avg Sales</th>
              <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Days Left</th>
              <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Reorder Qty</th>
              <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item, index) => (
              <motion.tr
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${item.status === 'Critical' ? 'bg-red-50/60' : ''}`}
              >
                <td className="px-6 py-5 font-bold text-slate-700">{item.name}</td>
                <td className="px-6 py-5 font-medium text-slate-600">
                  {item.stock} <span className="text-[10px] text-slate-400 uppercase font-bold ml-1">{item.unit}</span>
                </td>
                <td className="px-6 py-5 font-medium text-slate-600">
                  {item.avg_sales} <span className="text-[10px] text-slate-400 uppercase font-bold ml-1">{item.unit}/day</span>
                </td>
                <td className="px-6 py-5 font-black text-slate-800">
                  {item.days_left} <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">days</span>
                </td>
                <td className="px-6 py-5 font-bold text-indigo-600">
                  {item.reorder} <span className="text-[10px] text-indigo-400 uppercase font-bold ml-1">{item.unit}</span>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyles(item.status)}`}>
                    {getStatusIcon(item.status)}
                    {item.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
