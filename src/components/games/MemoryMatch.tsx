import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playNote, playMatch, playTap } from '@/src/utils/audio';
import GameWrapper from '@/src/components/GameWrapper';

const CARD_EMOJIS = ['🍕', '🧁', '🍎', '🥕', '🍓', '🧀', '🥦', '🍇'];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

export default function MemoryMatch({ onBack }: { onBack: () => void }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [canFlip, setCanFlip] = useState(true);

  const initGame = () => {
    const shuffled = [...CARD_EMOJIS, ...CARD_EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({
        id: idx,
        emoji,
        flipped: false,
        matched: false,
      }));
    setCards(shuffled);
    setScore(0);
    setFlippedIds([]);
    setCanFlip(true);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleFlip = (id: number) => {
    if (!canFlip || flippedIds.includes(id) || cards[id].matched) return;

    playNote(600 + flippedIds.length * 100, 0.1, 'triangle');
    const newFlippedIds = [...flippedIds, id];
    setFlippedIds(newFlippedIds);

    if (newFlippedIds.length === 2) {
      setCanFlip(false);
      const [id1, id2] = newFlippedIds;
      if (cards[id1].emoji === cards[id2].emoji) {
        // Match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === id1 || c.id === id2) ? { ...c, matched: true } : c
          ));
          setScore(s => s + 5);
          playMatch();
          setFlippedIds([]);
          setCanFlip(true);
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setFlippedIds([]);
          setCanFlip(true);
          playNote(200, 0.2, 'sawtooth');
        }, 1000);
      }
    }
  };

  const isGameComplete = cards.length > 0 && cards.every(c => c.matched);

  return (
    <GameWrapper title="Memory Match" onBack={onBack} score={score}>
      <div className="flex flex-col h-full gap-6 items-center">
        <div className="grid grid-cols-4 gap-3 max-w-md w-full">
          {cards.map(card => (
            <motion.button
              key={card.id}
              whileHover={canFlip && !card.matched ? { scale: 1.05 } : {}}
              whileTap={canFlip && !card.matched ? { scale: 0.95 } : {}}
              onClick={() => handleFlip(card.id)}
              className={`aspect-square rounded-2xl text-4xl flex items-center justify-center shadow-lg transition-all duration-300 relative preserve-3d
                ${card.matched ? 'bg-green-100 opacity-60' : 'bg-white'}`}
            >
              <AnimatePresence mode="wait">
                {(flippedIds.includes(card.id) || card.matched) ? (
                  <motion.div
                    key="front"
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: 0 }}
                    exit={{ rotateY: 90 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {card.emoji}
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ rotateY: -90 }}
                    animate={{ rotateY: 0 }}
                    exit={{ rotateY: -90 }}
                    className="absolute inset-0 bg-yellow-400 rounded-2xl flex items-center justify-center border-4 border-white"
                  >
                    <span className="text-white font-bold text-3xl">?</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {isGameComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.1 }}
              className="bg-white p-8 rounded-3xl border-4 border-yellow-400 shadow-2xl text-center"
            >
              <h2 className="text-3xl font-bold text-yellow-600 mb-4">Waah! Gazab!</h2>
              <p className="text-xl mb-6">Sab dhoodh liye! Score: {score}</p>
              <button
                onClick={() => { initGame(); playTap(); }}
                className="bg-yellow-400 text-white px-8 py-3 rounded-full font-bold text-lg hover:shadow-xl transition-all"
              >
                Let's Play Again!
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameWrapper>
  );
}
