import { motion } from 'motion/react';
import { Loader2, Sparkles } from 'lucide-react';

interface AnimatedButtonProps {
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  text: string;
}

export default function AnimatedButton({ onClick, isLoading, disabled, text }: AnimatedButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative w-full py-4 px-6 rounded-full font-bold text-white text-lg
        bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
        transition-all duration-300 overflow-hidden
        disabled:opacity-70 disabled:cursor-not-allowed
        flex items-center justify-center gap-3
      `}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Analyzing...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5" />
          <span>{text}</span>
        </>
      )}
    </motion.button>
  );
}
