import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { playTap } from '@/src/utils/audio';
import { ReactNode } from 'react';

interface GameWrapperProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
  score?: number;
  subtitle?: string;
}

export default function GameWrapper({ title, onBack, children, score, subtitle }: GameWrapperProps) {
  const handleBack = () => {
    playTap();
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full bg-[#FFFDE7]"
    >
      <header className="flex items-center justify-between p-4 bg-white border-b-4 border-yellow-200">
        <button
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-yellow-100 transition-colors"
          aria-label="Back to menu"
        >
          <ArrowLeft className="w-6 h-6 text-yellow-600" />
        </button>
        <div className="text-center">
          <h2 className="font-sans font-bold text-xl text-yellow-700">{title}</h2>
          {subtitle && <p className="text-sm font-medium text-yellow-500">{subtitle}</p>}
        </div>
        <div className="bg-yellow-400 px-4 py-1 rounded-full border-2 border-yellow-600">
          <span className="font-mono font-bold text-white">Score: {score ?? 0}</span>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden p-4">
        {children}
      </main>
    </motion.div>
  );
}
