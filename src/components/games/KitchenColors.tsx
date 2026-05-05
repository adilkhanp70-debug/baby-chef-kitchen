import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { PALETTE_COLORS } from '@/src/constants';
import { playTap, playNote } from '@/src/utils/audio';
import GameWrapper from '@/src/components/GameWrapper';
import { Eraser, Trash2, Camera } from 'lucide-react';

export default function KitchenColors({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(PALETTE_COLORS[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(15);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initial clear
    ctx.fillStyle = '#FFFDE7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawOutline(ctx);
  }, []);

  const drawOutline = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Cupcake
    ctx.beginPath();
    ctx.roundRect(150, 180, 200, 120, 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(170, 130, 160, 60, 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(195, 100, 110, 35, 10);
    ctx.stroke();

    // Candles
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.rect(215 + i * 30, 80, 12, 22);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(221 + i * 30, 77, 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const getPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    playTap();
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    // Redraw outline to stay on top
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) drawOutline(ctx);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFDE7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawOutline(ctx);
    playNote(400, 0.2);
  };

  return (
    <GameWrapper title="Kitchen Colors" onBack={onBack}>
      <div className="flex flex-col h-full gap-4 max-w-2xl mx-auto">
        <div className="relative bg-white rounded-3xl border-4 border-yellow-200 overflow-hidden shadow-inner flex-1 aspect-[4/3] sm:aspect-video">
          <canvas
            ref={canvasRef}
            width={500}
            height={350}
            className="w-full h-full touch-none cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <div className="bg-white p-4 rounded-3xl border-2 border-yellow-100 flex flex-wrap justify-center gap-2">
          {PALETTE_COLORS.map(c => (
            <motion.button
              key={c}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setColor(c); playTap(); }}
              className={`w-10 h-10 rounded-full border-4 shadow-sm ${color === c ? 'border-gray-800 scale-110' : 'border-white'}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <div className="w-px h-10 bg-gray-200 mx-2" />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setColor('#FFFDE7'); playTap(); }}
            className={`w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center ${color === '#FFFDE7' ? 'bg-yellow-100 border-yellow-500' : ''}`}
          >
            <Eraser className="w-5 h-5 text-gray-600" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={clearCanvas}
            className="w-10 h-10 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </motion.button>
        </div>
      </div>
    </GameWrapper>
  );
}
