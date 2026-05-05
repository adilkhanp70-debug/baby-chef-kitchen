import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playTap, playNote } from '@/src/utils/audio';
import GameWrapper from '@/src/components/GameWrapper';
import { Timer } from 'lucide-react';

const CHEFS = ['👨‍🍳', '👩‍🍳', '🍳', '🥘', '🫕', '🍲', '🎂', '🧁'];

export default function ChefTap({ onBack }: { onBack: () => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [activeTarget, setActiveTarget] = useState<{ id: number, x: number, y: number, emoji: string } | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const timerRef = useRef<any>(null);
  const nextId = useRef(0);

  const spawnTarget = () => {
    setActiveTarget({
      id: nextId.current++,
      x: Math.random() * 80 + 10,
      y: Math.random() * 70 + 15,
      emoji: CHEFS[Math.floor(Math.random() * CHEFS.length)]
    });
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameState('playing');
    spawnTarget();
    playTap();
  };

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setGameState('ended');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing' && !activeTarget) {
      const timeout = setTimeout(spawnTarget, 200 + Math.random() * 500);
      return () => clearTimeout(timeout);
    }
  }, [gameState, activeTarget]);

  const handleTap = () => {
    if (gameState !== 'playing' || !activeTarget) return;
    setScore(s => s + 1);
    setActiveTarget(null);
    playTap();
    playNote(800, 0.05, 'sine', 0.1);
  };

  return (
    <GameWrapper title="Chef Tap" onBack={onBack} score={score}>
      <div className="relative h-full w-full overflow-hidden bg-orange-50 rounded-3xl border-4 border-orange-200">
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md text-orange-600 font-bold">
          <Timer className="w-5 h-5" />
          <span>{timeLeft}s</span>
        </div>

        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white/40 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-orange-700 mb-4">Tap Fast!</h2>
            <p className="text-xl text-orange-600 mb-8">Tap as many chefs and treats as you can before time runs out!</p>
            <button
              onClick={startGame}
              className="bg-orange-500 text-white px-10 py-4 rounded-full font-bold text-2xl shadow-xl hover:scale-105 active:scale-95 transition-transform"
            >
              Start Game!
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <AnimatePresence mode="popLayout">
            {activeTarget && (
              <motion.button
                key={activeTarget.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                style={{
                  position: 'absolute',
                  left: `${activeTarget.x}%`,
                  top: `${activeTarget.y}%`
                }}
                onClick={handleTap}
                className="text-6xl p-4 bg-white/20 rounded-full hover:bg-white/40 active:scale-90 transition-all select-none -translate-x-1/2 -translate-y-1/2"
              >
                {activeTarget.emoji}
              </motion.button>
            )}
          </AnimatePresence>
        )}

        {gameState === 'ended' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute inset-x-8 top-1/4 bg-white p-8 rounded-3xl border-4 border-orange-500 shadow-2xl text-center flex flex-col items-center"
          >
            <div className="text-6xl mb-4">🥇</div>
            <h2 className="text-4xl font-bold text-orange-600 mb-2">Time's Up!</h2>
            <p className="text-2xl font-medium mb-8">Final Score: {score}</p>
            <button
              onClick={startGame}
              className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold text-xl shadow-lg hover:shadow-2xl transition-all"
            >
              Try Again!
            </button>
          </motion.div>
        )}
      </div>
    </GameWrapper>
  );
}
