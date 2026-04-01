import { LayoutDashboard } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full py-12 px-4 text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
          <LayoutDashboard size={40} className="text-blue-100" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          AI Grocery Inventory Assistant
        </h1>
        <p className="text-lg md:text-xl text-blue-100 font-light max-w-2xl">
          Predict stock. Prevent losses. Optimize inventory.
        </p>
      </div>
    </header>
  );
}
