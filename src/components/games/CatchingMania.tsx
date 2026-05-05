import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GOOD_FOODS, BAD_FOODS } from '@/src/constants';
import { playCollect, playError, playTap } from '@/src/utils/audio';
import GameWrapper from '@/src/components/GameWrapper';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FallingItem {
  id: number;
  emoji: string;
  x: number;
  isGood: boolean;
  speed: number;
}

export default function CatchingMania({ onBack }: { onBack: () => void }) {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [basketPos, setBasketPos] = useState(50);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  useEffect(() => {
    if (gameOver) return;

    const spawnInterval = setInterval(() => {
      const isGood = Math.random() > 0.25;
      const emoji = isGood 
        ? GOOD_FOODS[Math.floor(Math.random() * GOOD_FOODS.length)] 
        : BAD_FOODS[Math.floor(Math.random() * BAD_FOODS.length)];
      
      const newItem: FallingItem = {
        id: nextId.current++,
        emoji,
        x: Math.random() * 80 + 10,
        isGood,
        speed: Math.random() * 2 + 3 + (score / 10),
      };

      setItems(prev => [...prev, newItem]);
    }, 1200);

    return () => clearInterval(spawnInterval);
  }, [gameOver, score]);

  const handleCatch = (item: FallingItem) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    if (item.isGood) {
      setScore(s => s + 1);
      playCollect();
    } else {
      setLives(l => Math.max(0, l - 1));
      playError();
      if (lives <= 1) setGameOver(true);
    }
  };

  const handleMiss = (item: FallingItem) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    if (item.isGood) {
      setLives(l => Math.max(0, l - 1));
      playError();
      if (lives <= 1) setGameOver(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setBasketPos(p => Math.max(10, p - 8));
      if (e.key === 'ArrowRight') setBasketPos(p => Math.min(90, p + 8));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <GameWrapper title="Catching Mania" onBack={onBack} score={score} subtitle={`Lives: ${'❤️'.repeat(Math.max(0, lives))}`}>
      <div className="relative h-full w-full bg-blue-50 border-x-8 border-yellow-200" ref={gameAreaRef}>
        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ y: -50, x: `${item.x}%`, opacity: 0 }}
              animate={{ y: 800, opacity: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: item.speed, ease: "linear" }}
              onUpdate={(latest) => {
                if (typeof latest.y === 'number' && latest.y > 650) {
                  const basketLeft = basketPos - 12;
                  const basketRight = basketPos + 12;
                  if (item.x >= basketLeft && item.x <= basketRight) {
                    handleCatch(item);
                  } else if (latest.y > 750) {
                    handleMiss(item);
                  }
                }
              }}
              className="absolute text-4xl pointer-events-none select-none"
            >
              {item.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Basket */}
        <motion.div
          animate={{ x: `${basketPos}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute bottom-12 w-24 h-16 bg-yellow-600 rounded-b-3xl -ml-12 flex items-center justify-center border-t-8 border-yellow-800 shadow-lg"
        >
          <div className="text-3xl">🧺</div>
        </motion.div>

        {/* Controls for Touch/Mouse */}
        <div className="absolute bottom-0 inset-x-0 h-24 flex justify-between px-8 items-center bg-white/50 backdrop-blur-sm border-t border-yellow-100">
          <button 
            onMouseDown={() => setBasketPos(p => Math.max(10, p - 10))}
            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-yellow-600 hover:scale-110 active:scale-95 transition-transform"
          >
            <ChevronLeft size={32} />
          </button>
          <p className="text-yellow-700 font-bold hidden sm:block">Use Arrows or Buttons!</p>
          <button 
            onMouseDown={() => setBasketPos(p => Math.min(90, p + 10))}
            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-yellow-600 hover:scale-110 active:scale-95 transition-transform"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-yellow-500/90 flex flex-col items-center justify-center z-50 text-white p-8 text-center"
            >
              <h2 className="text-4xl font-bold mb-4">Maza Aa Gaya!</h2>
              <p className="text-2xl mb-8">Sab kuch khatam! Your Final Score: {score}</p>
              <button
                onClick={() => {
                  setScore(0);
                  setLives(3);
                  setItems([]);
                  setGameOver(false);
                  playTap();
                }}
                className="bg-white text-yellow-600 px-8 py-3 rounded-full font-bold text-xl shadow-xl hover:scale-105 active:scale-95 transition-transform"
              >
                Phir Se Khelo!
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameWrapper>
  );
}
