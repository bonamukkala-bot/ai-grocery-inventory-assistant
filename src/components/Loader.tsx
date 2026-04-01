import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Loader({ text = "Analyzing with AI..." }: { text?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center p-12 space-y-4"
    >
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      <p className="text-indigo-600 font-medium animate-pulse">{text}</p>
    </motion.div>
  );
}
