import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RECIPES, ALL_FOODS } from '@/src/constants';
import { playCollect, playError, playTap } from '@/src/utils/audio';
import GameWrapper from '@/src/components/GameWrapper';

export default function CookingHero({ onBack }: { onBack: () => void }) {
  const [currentRecipe, setCurrentRecipe] = useState(RECIPES[0]);
  const [collected, setCollected] = useState<string[]>([]);
  const [pool, setPool] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [finished, setFinished] = useState(false);

  const loadNewRecipe = () => {
    const nextRecipe = RECIPES[Math.floor(Math.random() * RECIPES.length)];
    setCurrentRecipe(nextRecipe);
    setCollected([]);
    setFinished(false);

    // Create pool
    let items = [...nextRecipe.needs];
    const extras = ALL_FOODS.filter(f => !nextRecipe.needs.includes(f));
    while (items.length < 12) {
      items.push(extras[Math.floor(Math.random() * extras.length)]);
    }
    setPool(items.sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    loadNewRecipe();
  }, []);

  const handleCollect = (item: string) => {
    if (currentRecipe.needs.includes(item) && !collected.includes(item)) {
      playCollect();
      const newCollected = [...collected, item];
      setCollected(newCollected);

      if (newCollected.length === currentRecipe.needs.length) {
        setFinished(true);
        setScore(s => s + currentRecipe.points);
        setTimeout(() => {
          setLevel(l => l + 1);
          loadNewRecipe();
        }, 1500);
      }
    } else if (!currentRecipe.needs.includes(item)) {
      playError();
    }
  };

  return (
    <GameWrapper title="Cooking Hero" onBack={onBack} score={score} subtitle={`Level ${level}`}>
      <div className="flex flex-col h-full gap-6 max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-3xl border-4 border-yellow-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col items-center mb-4">
            <motion.div
              animate={finished ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
              className="text-6xl mb-2"
            >
              {finished ? currentRecipe.emoji : '🍲'}
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-800">{currentRecipe.name}</h3>
          </div>

          <div className="flex justify-center gap-3">
            {currentRecipe.needs.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0.5, scale: 0.8 }}
                animate={{
                  opacity: collected.includes(item) ? 1 : 0.4,
                  scale: collected.includes(item) ? 1.1 : 1,
                  backgroundColor: collected.includes(item) ? '#FEF9C3' : '#F3F4F6'
                }}
                className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-yellow-100 text-2xl"
              >
                {item}
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-6 h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(collected.length / currentRecipe.needs.length) * 100}%` }}
              className="h-full bg-green-400"
            />
          </div>
        </div>

        <div className="flex-1 grid grid-cols-4 gap-4 p-4 overflow-y-auto">
          {pool.map((food, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleCollect(food)}
              disabled={collected.includes(food)}
              className={`text-4xl p-4 bg-white rounded-2xl shadow-sm border-2 transition-all ${
                collected.includes(food) ? 'opacity-30 grayscale cursor-default border-gray-100' : 'border-yellow-50 hover:border-yellow-300'
              }`}
            >
              {food}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {finished && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-yellow-400 text-white font-bold text-4xl px-8 py-4 rounded-full shadow-2xl border-4 border-white transform -rotate-6">
                YUMMY! +{currentRecipe.points}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameWrapper>
  );
}
