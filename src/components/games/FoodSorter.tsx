import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES } from '@/src/constants';
import { playCollect, playError, playTap } from '@/src/utils/audio';
import GameWrapper from '@/src/components/GameWrapper';
import { CheckCircle2 } from 'lucide-react';

export default function FoodSorter({ onBack }: { onBack: () => void }) {
  const [score, setScore] = useState(0);
  const [items, setItems] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const loadLevel = () => {
    let all: string[] = [];
    CATEGORIES.forEach(cat => {
      all.push(...cat.items.slice(0, 4));
    });
    setItems(all.sort(() => Math.random() - 0.5));
    setSelectedItem(null);
    setFinished(false);
  };

  useEffect(() => {
    loadLevel();
  }, []);

  const handleSelectItem = (item: string) => {
    setSelectedItem(item === selectedItem ? null : item);
    playTap();
  };

  const handleBinClick = (categoryName: string) => {
    if (!selectedItem) return;

    const category = CATEGORIES.find(c => c.name === categoryName);
    const isCorrect = category?.items.includes(selectedItem);

    if (isCorrect) {
      playCollect();
      setScore(s => s + 10);
      setItems(prev => prev.filter(i => i !== selectedItem));
      setSelectedItem(null);

      if (items.length <= 1) {
        setFinished(true);
      }
    } else {
      playError();
    }
  };

  return (
    <GameWrapper title="Food Sorter" onBack={onBack} score={score}>
      <div className="flex flex-col h-full gap-8 max-w-4xl mx-auto">
        {/* Items to sort */}
        <div className="bg-white p-6 rounded-3xl border-4 border-dashed border-yellow-200 min-h-[160px] flex flex-wrap justify-center gap-4">
          <AnimatePresence>
            {items.map(item => (
              <motion.button
                key={item}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: 1,
                  backgroundColor: selectedItem === item ? '#FEF9C3' : '#FFFFFF',
                  borderColor: selectedItem === item ? '#EAB308' : '#F3F4F6'
                }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => handleSelectItem(item)}
                className="w-16 h-16 text-4xl rounded-2xl border-2 shadow-sm flex items-center justify-center transition-colors"
              >
                {item}
              </motion.button>
            ))}
          </AnimatePresence>
          {items.length === 0 && !finished && (
            <div className="w-full flex items-center justify-center text-gray-400 font-medium">
              Sabh sort ho gaye!
            </div>
          )}
        </div>

        {/* Categories / Bins */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat.name}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleBinClick(cat.name)}
              className="bg-white p-6 rounded-3xl border-4 shadow-lg flex flex-col items-center gap-4 transition-all"
              style={{ borderColor: cat.color }}
            >
              <div className="text-xl font-bold" style={{ color: cat.color }}>
                {cat.name}
              </div>
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-4xl border-2 border-gray-100 italic text-gray-400 group-hover:bg-white">
                📥
              </div>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {finished && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-green-500 text-white p-8 rounded-3xl flex flex-col items-center text-center shadow-2xl"
            >
              <CheckCircle2 size={64} className="mb-4" />
              <h2 className="text-3xl font-bold mb-2">Shaabaash!</h2>
              <p className="text-xl mb-6">Everything is perfectly sorted!</p>
              <button
                onClick={loadLevel}
                className="bg-white text-green-600 px-8 py-3 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-transform"
              >
                Next Level
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameWrapper>
  );
}
