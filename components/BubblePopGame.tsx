import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../App';
import { Volume2, Trophy, RefreshCw, PlayCircle, PauseCircle } from './Icons';

interface BubblePopGameProps {
  lang: Language;
}

interface Bubble {
  id: number;
  char: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100 (100 is bottom, 0 is top)
  size: number; // px
  color: string;
  speed: number;
  wobbleOffset: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

const ALPHABET = [
  'A', 'B', 'C', 'Ç', 'D', 'Dh', 'E', 'Ë', 'F', 'G', 'Gj', 'H', 
  'I', 'J', 'K', 'L', 'Ll', 'M', 'N', 'Nj', 'O', 'P', 'Q', 'R', 
  'Rr', 'S', 'Sh', 'T', 'Th', 'U', 'V', 'X', 'Xh', 'Y', 'Z', 'Zh',
  'Â', 'Ê', 'Î', 'Ô', 'Û'
];

const COLORS = [
  'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-green-400', 'bg-emerald-400', 
  'bg-teal-400', 'bg-cyan-400', 'bg-sky-400', 'bg-blue-400', 'bg-indigo-400', 
  'bg-violet-400', 'bg-purple-400', 'bg-fuchsia-400', 'bg-pink-400', 'bg-rose-400'
];

const BubblePopGame: React.FC<BubblePopGameProps> = ({ lang }) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mode, setMode] = useState<'zen' | 'challenge' | 'menu'>('menu');
  const [score, setScore] = useState(0);
  const [targetLetter, setTargetLetter] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const lastSpawnTime = useRef<number>(0);
  const bubbleIdCounter = useRef<number>(0);

  // Game Loop
  useEffect(() => {
    if (!isPlaying) return;

    const loop = (time: number) => {
      // Spawn Bubbles
      if (time - lastSpawnTime.current > (mode === 'challenge' ? 800 : 600)) {
        spawnBubble();
        lastSpawnTime.current = time;
      }

      // Move Bubbles
      setBubbles(prevBubbles => {
        return prevBubbles
          .map(b => ({
            ...b,
            y: b.y - b.speed,
            // Simple sine wave wobble
            x: b.x + Math.sin(time * 0.002 + b.wobbleOffset) * 0.2
          }))
          .filter(b => b.y > -20); // Remove if floats off top
      });

      // Update Particles (Explosion effects)
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.05,
            vy: p.vy + 0.1 // Gravity
          }))
          .filter(p => p.life > 0)
      );

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, mode]);

  // Challenge Mode Logic
  useEffect(() => {
    if (mode === 'challenge' && isPlaying && !targetLetter) {
      setNewTarget();
    }
  }, [mode, isPlaying, targetLetter]);

  const setNewTarget = () => {
    const randomChar = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    setTargetLetter(randomChar);
    speak(lang === 'geg' ? `Gjeje shkronjën ${randomChar}` : `Find the letter ${randomChar}`);
  };

  const spawnBubble = () => {
    const char = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    const id = bubbleIdCounter.current++;
    const size = Math.random() * 40 + 60; // 60-100px
    const x = Math.random() * 90 + 5; // 5-95%
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    // In challenge mode, occasionally ensure the target letter spawns
    let finalChar = char;
    if (mode === 'challenge' && targetLetter && Math.random() < 0.2) {
      finalChar = targetLetter;
    }

    setBubbles(prev => [...prev, {
      id,
      char: finalChar,
      x,
      y: 110, // Start below screen
      size,
      color,
      speed: Math.random() * 0.3 + 0.2,
      wobbleOffset: Math.random() * 10
    }]);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'sq-AL';
      utterance.rate = 1; // slightly slower for kids
      window.speechSynthesis.speak(utterance);
    }
  };

  const createExplosion = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 10, // Velocity X
        vy: (Math.random() - 0.5) * 10, // Velocity Y
        color,
        life: 1.0
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const handlePop = (bubble: Bubble) => {
    // 1. Audio
    speak(bubble.char);

    // 2. Visuals
    createExplosion(bubble.x, bubble.y, bubble.color);
    setBubbles(prev => prev.filter(b => b.id !== bubble.id));

    // 3. Game Logic
    if (mode === 'challenge') {
      if (bubble.char === targetLetter) {
        setScore(prev => prev + 10);
        // Success sound or feedback?
        setTargetLetter(null); // Trigger next target
      } else {
        setScore(prev => Math.max(0, prev - 5));
      }
    } else {
      setScore(prev => prev + 1); // Points just for popping in Zen
    }
  };

  const startGame = (selectedMode: 'zen' | 'challenge') => {
    setMode(selectedMode);
    setIsPlaying(true);
    setBubbles([]);
    setScore(0);
    setTargetLetter(null);
  };

  const stopGame = () => {
    setIsPlaying(false);
    setMode('menu');
  };

  // --- RENDER ---

  if (mode === 'menu') {
    return (
      <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-3xl shadow-xl p-8 min-h-[500px] flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Decorative Background Bubbles */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-300 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-300 rounded-full opacity-20 animate-pulse"></div>

        <h1 className="text-5xl font-black text-blue-900 mb-2 tracking-tight">
          {lang === 'geg' ? 'Flluska Shkronjash' : 'Bubble Pop'}
        </h1>
        <p className="text-xl text-blue-700 mb-10 font-medium max-w-md">
          {lang === 'geg' 
           ? 'Mësoni alfabetin tuj plasë flluska shumëngjyrëshe!' 
           : 'Learn the alphabet by popping colorful bubbles!'}
        </p>

        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl justify-center">
          <button 
            onClick={() => startGame('zen')}
            className="flex-1 bg-white p-6 rounded-2xl shadow-lg border-b-4 border-blue-200 hover:border-blue-400 hover:-translate-y-1 transition-all group"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <PlayCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{lang === 'geg' ? 'Lojë e Lirë' : 'Free Play'}</h3>
            <p className="text-gray-500 text-sm">{lang === 'geg' ? 'Pa siklet, veç mësim.' : 'No stress, just popping.'}</p>
          </button>

          <button 
             onClick={() => startGame('challenge')}
             className="flex-1 bg-white p-6 rounded-2xl shadow-lg border-b-4 border-orange-200 hover:border-orange-400 hover:-translate-y-1 transition-all group"
          >
            <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <Trophy className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{lang === 'geg' ? 'Sfidë' : 'Challenge'}</h3>
            <p className="text-gray-500 text-sm">{lang === 'geg' ? 'Gjeni shkronjën e duhun!' : 'Find the right letter!'}</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-b from-sky-200 via-blue-100 to-white rounded-3xl shadow-xl border-4 border-white overflow-hidden h-[600px] select-none cursor-crosshair">
       {/* HUD */}
       <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-white/30 backdrop-blur-sm border-b border-white/50">
          <button 
             onClick={stopGame}
             className="bg-white p-2 rounded-full shadow-sm hover:bg-gray-100 text-gray-600"
          >
             <PauseCircle className="w-6 h-6" />
          </button>
          
          {mode === 'challenge' && targetLetter && (
             <div className="bg-white/90 px-6 py-2 rounded-xl shadow-lg border border-blue-200 animate-pulse">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mr-2">{lang === 'geg' ? 'Gjeje:' : 'Find:'}</span>
                <span className="text-3xl font-black text-blue-600">{targetLetter}</span>
                <button onClick={() => speak(targetLetter)} className="ml-2 text-gray-400 hover:text-blue-500"><Volume2 className="w-4 h-4" /></button>
             </div>
          )}

          <div className="bg-yellow-400/90 text-yellow-900 px-4 py-2 rounded-xl font-black shadow-md flex items-center gap-2">
             <Trophy className="w-5 h-5" />
             <span className="text-xl">{score}</span>
          </div>
       </div>

       {/* Game Area */}
       <div ref={containerRef} className="absolute inset-0 z-10">
          {bubbles.map(bubble => (
             <div
               key={bubble.id}
               onClick={() => handlePop(bubble)}
               style={{
                 left: `${bubble.x}%`,
                 top: `${bubble.y}%`, // Use Top with percentages greater than 100 for entrance? No, CSS positioning logic: y goes 100 -> -20
                 width: `${bubble.size}px`,
                 height: `${bubble.size}px`,
                 position: 'absolute',
                 transform: 'translate(-50%, -50%)', // Center on coords
                 transition: 'top 0s linear' // Managed by JS loop
               }}
               className={`
                 ${bubble.color} 
                 rounded-full shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.1),inset_4px_4px_8px_rgba(255,255,255,0.4)]
                 flex items-center justify-center
                 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-75
                 border-2 border-white/30
               `}
             >
                {/* Shine Effect */}
                <div className="absolute top-[15%] left-[15%] w-[25%] h-[15%] bg-white/60 rounded-full transform -rotate-45"></div>
                <div className="absolute bottom-[15%] right-[15%] w-[10%] h-[10%] bg-white/20 rounded-full"></div>
                
                <span className="text-white font-black drop-shadow-md select-none" style={{ fontSize: `${bubble.size * 0.5}px` }}>
                   {bubble.char}
                </span>
             </div>
          ))}

          {/* Particles */}
          {particles.map(p => (
             <div 
               key={p.id}
               style={{
                 left: `${p.x}%`,
                 top: `${p.y}%`,
                 backgroundColor: p.color.replace('bg-', 'text-').replace('400', '500'), // Hacky way to get color, better to store hex
                 opacity: p.life,
                 transform: 'scale(' + p.life + ')',
                 width: '8px',
                 height: '8px',
                 position: 'absolute',
                 borderRadius: '50%'
               }}
               className="bg-white" // Fallback
             />
          ))}
       </div>

       {/* Clouds Background Decoration */}
       <div className="absolute bottom-0 left-0 w-full h-32 bg-white/30 rounded-t-[100%] z-0 blur-xl"></div>
       <div className="absolute bottom-[-20px] left-[20%] w-64 h-64 bg-white/40 rounded-full z-0 blur-2xl"></div>
    </div>
  );
};

export default BubblePopGame;