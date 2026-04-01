import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Package, Database, BarChart3, ShoppingBasket } from 'lucide-react';
import InputField from './InputField';
import AnimatedButton from './AnimatedButton';

interface InventoryInputFormProps {
  onPredict: (data: { itemName: string; currentStock: number; salesData: number[] }) => void;
}

export default function InventoryInputForm({ onPredict }: InventoryInputFormProps) {
  const [itemName, setItemName] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [salesData, setSalesData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!itemName.trim()) newErrors.itemName = 'Item name is required';
    
    const stockNum = parseInt(currentStock);
    if (!currentStock) newErrors.currentStock = 'Current stock is required';
    else if (isNaN(stockNum) || stockNum < 0) newErrors.currentStock = 'Stock must be a positive number';

    const salesArray = salesData.split(',').map(s => s.trim());
    const validSales = salesArray.map(s => parseInt(s)).filter(n => !isNaN(n));
    
    if (!salesData) newErrors.salesData = 'Sales data is required';
    else if (validSales.length < 5) newErrors.salesData = 'Please enter at least 5 days of valid sales data';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const salesArray = salesData.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    onPredict({
      itemName,
      currentStock: parseInt(currentStock),
      salesData: salesArray
    });
    
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative w-full max-w-[500px]"
    >
      {/* Decorative Background Elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 rotate-3">
            <ShoppingBasket className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Inventory <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">AI</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Enter stock details for smart prediction</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <InputField
            label="Item Name"
            icon={Package}
            placeholder="e.g. Organic Rice"
            value={itemName}
            onChange={(val) => {
              setItemName(val);
              if (errors.itemName) setErrors({ ...errors, itemName: '' });
            }}
            error={errors.itemName}
            required
          />

          <InputField
            label="Current Stock"
            icon={Database}
            type="number"
            placeholder="Enter total units"
            value={currentStock}
            onChange={(val) => {
              setCurrentStock(val);
              if (errors.currentStock) setErrors({ ...errors, currentStock: '' });
            }}
            error={errors.currentStock}
            required
          />

          <InputField
            label="Last 5 Days Sales"
            icon={BarChart3}
            placeholder="e.g. 10, 12, 8, 9, 11"
            value={salesData}
            onChange={(val) => {
              setSalesData(val);
              if (errors.salesData) setErrors({ ...errors, salesData: '' });
            }}
            error={errors.salesData}
            helperText="Enter daily sales separated by commas"
            required
          />

          <div className="pt-4">
            <AnimatedButton
              text="Predict Stock"
              isLoading={isLoading}
            />
          </div>
        </form>

        <p className="text-center text-slate-400 text-xs mt-8 font-medium">
          Powered by Advanced Predictive Analytics
        </p>
      </div>
    </motion.div>
  );
}
