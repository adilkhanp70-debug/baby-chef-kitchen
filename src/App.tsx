/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CookingHero from './components/games/CookingHero';
import CatchingMania from './components/games/CatchingMania';
import KitchenColors from './components/games/KitchenColors';
import MemoryMatch from './components/games/MemoryMatch';
import ChefTap from './components/games/ChefTap';
import FoodSorter from './components/games/FoodSorter';
import { playTap } from './utils/audio';
import { ChefHat, ShoppingBasket, Palette, LayoutGrid, Pointer, Layers } from 'lucide-react';

type GameType = 'cooking' | 'catching' | 'coloring' | 'music' | 'tap' | 'sort' | null;

const MENU_ITEMS = [
  { id: 'cooking', name: 'Cooking Hero', icon: ChefHat, color: 'bg-orange-400', emoji: '👨‍🍳' },
  { id: 'catching', name: 'Catching Mania', icon: ShoppingBasket, color: 'bg-blue-400', emoji: '🧺' },
  { id: 'coloring', name: 'Kitchen Colors', icon: Palette, color: 'bg-pink-400', emoji: '🎨' },
  { id: 'music', name: 'Memory Match', icon: LayoutGrid, color: 'bg-purple-400', emoji: '🧠' },
  { id: 'tap', name: 'Chef Tap', icon: Pointer, color: 'bg-red-400', emoji: '👆' },
  { id: 'sort', name: 'Food Sorter', icon: Layers, color: 'bg-green-400', emoji: '🗂️' },
];

export default function App() {
  const [activeGame, setActiveGame] = useState<GameType>(null);

  const renderGame = () => {
    switch (activeGame) {
      case 'cooking': return <CookingHero onBack={() => setActiveGame(null)} />;
      case 'catching': return <CatchingMania onBack={() => setActiveGame(null)} />;
      case 'coloring': return <KitchenColors onBack={() => setActiveGame(null)} />;
      case 'music': return <MemoryMatch onBack={() => setActiveGame(null)} />;
      case 'tap': return <ChefTap onBack={() => setActiveGame(null)} />;
      case 'sort': return <FoodSorter onBack={() => setActiveGame(null)} />;
      default: return null;
    }
  };

  return (
    <div className="h-full w-full bg-[#FFFDE7] overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {!activeGame ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full flex flex-col p-6 sm:p-10"
          >
            <header className="text-center mb-10 sm:mb-16">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-block text-6xl sm:text-8xl mb-4"
              >
                🍳
              </motion.div>
              <h1 className="text-4xl sm:text-6xl font-black text-yellow-600 tracking-tight">KITCHEN KHAOS</h1>
              <p className="text-lg sm:text-xl font-medium text-yellow-500 mt-2">Ready to be the Little Master Chef?</p>
            </header>

            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto w-full content-center">
              {MENU_ITEMS.map((item, idx) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    playTap();
                    setActiveGame(item.id as GameType);
                  }}
                  className={`${item.color} p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex flex-col items-center justify-center gap-4 transition-all hover:shadow-2xl relative overflow-hidden group`}
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                  <item.icon className="w-12 h-12 text-white" />
                  <span className="text-white font-bold text-lg sm:text-xl text-center leading-tight">
                    {item.name}
                  </span>
                  <div className="text-3xl absolute -bottom-2 -right-2 opacity-20 transform -rotate-12">
                    {item.emoji}
                  </div>
                </motion.button>
              ))}
            </div>

            <footer className="mt-12 text-center text-yellow-600 font-medium">
              Made with ❤️ for little chefs
            </footer>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="h-full"
          >
            {renderGame()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
