import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface InputFieldProps {
  label: string;
  icon: LucideIcon;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export default function InputField({
  label,
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <div className="relative w-full space-y-1.5">
      {/* Floating Label Logic */}
      <motion.label
        initial={false}
        animate={{
          y: isFocused || hasValue ? -24 : 12,
          x: isFocused || hasValue ? 0 : 40,
          scale: isFocused || hasValue ? 0.85 : 1,
          color: error ? '#ef4444' : isFocused ? '#6366f1' : '#94a3b8',
        }}
        className="absolute left-0 top-0 pointer-events-none font-medium z-10 origin-left"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </motion.label>

      <motion.div
        animate={{
          scale: isFocused ? 1.01 : 1,
          boxShadow: isFocused 
            ? error ? '0 0 0 4px rgba(239, 68, 68, 0.1)' : '0 0 0 4px rgba(99, 102, 241, 0.1)'
            : '0 0 0 0px rgba(0,0,0,0)',
        }}
        className={`
          relative flex items-center bg-white/50 backdrop-blur-sm border-2 rounded-2xl transition-colors duration-200
          ${error ? 'border-red-400' : isFocused ? 'border-indigo-500' : 'border-slate-200'}
          overflow-hidden
        `}
      >
        <div className={`pl-4 flex items-center justify-center ${error ? 'text-red-400' : isFocused ? 'text-indigo-500' : 'text-slate-400'}`}>
          <Icon size={20} />
        </div>
        
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ''}
          className="w-full py-4 px-3 bg-transparent outline-none text-slate-700 font-medium placeholder:text-slate-300"
        />
      </motion.div>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs font-semibold text-red-500 pl-2"
          >
            {error}
          </motion.p>
        ) : helperText ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs font-medium text-slate-400 pl-2"
          >
            {helperText}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
