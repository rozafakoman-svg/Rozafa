
import React, { useState, useEffect, useRef } from 'react';
import { Language, GameScore } from '../types';
// Added missing X and CheckCircle icon to the import list from Icons
import { Volume2, Trophy, RefreshCw, PlayCircle, PauseCircle, Star, User, Medal, Clock, ArrowRight, X, CheckCircle } from './Icons';
import { db, Stores } from '../services/db';

interface BubblePopGameProps {
  lang: Language;
}

interface Bubble {
  id: number;
  char: string;
  x: number;
  y: number;
  size: number;
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

interface FloatingScore {
    id: number;
    x: number;
    y: number;
    value: string;
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
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [mode, setMode] = useState<'zen' | 'challenge' | 'menu' | 'leaderboard' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [targetLetter, setTargetLetter] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [topScores, setTopScores] = useState<GameScore[]>([]);
  const [playerName, setPlayerName] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const lastSpawnTime = useRef<number>(0);
  const bubbleIdCounter = useRef<number>(0);
  // FIX: Using ReturnType<typeof setTimeout> instead of NodeJS.Timeout to avoid namespace errors in browser environments
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
      const all = await db.getAll<GameScore>(Stores.Scores);
      setTopScores(all.sort((a, b) => b.score - a.score).slice(0, 5));
  };

  useEffect(() => {
    if (!isPlaying) return;

    if (mode === 'challenge') {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }

    const loop = (time: number) => {
      if (time - lastSpawnTime.current > (mode === 'challenge' ? 800 : 600)) {
        spawnBubble();
        lastSpawnTime.current = time;
      }

      setBubbles(prevBubbles => {
        return prevBubbles
          .map(b => ({
            ...b,
            y: b.y - b.speed,
            x: b.x + Math.sin(time * 0.002 + b.wobbleOffset) * 0.2
          }))
          .filter(b => b.y > -20);
      });

      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.05,
            vy: p.vy + 0.1
          }))
          .filter(p => p.life > 0)
      );

      setFloatingScores(prev => 
        prev
          .map(fs => ({ ...fs, y: fs.y - 1, life: fs.life - 0.02 }))
          .filter(fs => fs.life > 0)
      );

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, mode]);

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
    // Larger size for touch friendliness
    const size = Math.random() * 40 + 70;
    const x = Math.random() * 85 + 7.5;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    let finalChar = char;
    if (mode === 'challenge' && targetLetter && Math.random() < 0.25) {
      finalChar = targetLetter;
    }

    setBubbles(prev => [...prev, {
      id,
      char: finalChar,
      x,
      y: 110,
      size,
      color,
      speed: Math.random() * 0.3 + 0.25,
      wobbleOffset: Math.random() * 10
    }]);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'sq-AL';
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePop = (e: React.MouseEvent | React.TouchEvent, bubble: Bubble) => {
    // Prevent default browser touch behaviors
    if (e.type === 'touchstart') e.preventDefault();
    
    speak(bubble.char);
    createExplosion(bubble.x, bubble.y, bubble.color);
    
    let points = 0;
    if (mode === 'challenge') {
      if (bubble.char === targetLetter) {
        points = 10;
        setNewTarget();
      } else {
        points = -5;
      }
    } else {
      points = 1;
    }

    addFloatingScore(bubble.x, bubble.y, points > 0 ? `+${points}` : `${points}`);
    setScore(prev => Math.max(0, prev + points));
    setBubbles(prev => prev.filter(b => b.id !== bubble.id));
  };

  const createExplosion = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 10; i++) {
      newParticles.push({
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color,
        life: 1.0
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const addFloatingScore = (x: number, y: number, value: string) => {
      setFloatingScores(prev => [...prev, { id: Date.now(), x, y, value, life: 1.0 }]);
  };

  const startGame = (selectedMode: 'zen' | 'challenge') => {
    setMode(selectedMode);
    setIsPlaying(true);
    setBubbles([]);
    setScore(0);
    setTimeLeft(60);
    setTargetLetter(null);
  };

  const endGame = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (mode === 'challenge') {
        setMode('gameover');
    } else {
        setMode('menu');
    }
  };

  const saveScore = async () => {
      const name = playerName.trim() || (lang === 'geg' ? 'Lojtar' : 'Player');
      const newScore: GameScore = {
          id: `score_${Date.now()}`,
          name,
          score,
          date: new Date().toLocaleDateString(),
          mode: 'challenge'
      };
      await db.put(Stores.Scores, newScore);
      await loadLeaderboard();
      setMode('leaderboard');
  };

  // VIEWS
  if (mode === 'menu') {
    return (
      <div className="bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-3xl shadow-xl p-8 min-h-[550px] flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-300 dark:bg-blue-700 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-300 dark:bg-purple-700 rounded-full opacity-20 animate-pulse"></div>

        <h1 className="text-5xl font-black text-blue-900 dark:text-blue-200 mb-2 tracking-tight">
          {lang === 'geg' ? 'Flluska Shkronjash' : 'Bubble Pop'}
        </h1>
        <p className="text-xl text-blue-700 dark:text-blue-400 mb-10 font-medium max-w-md">
          {lang === 'geg' 
           ? 'Mësoni alfabetin tuj plasë flluska shumëngjyrëshe!' 
           : 'Learn the alphabet by popping colorful bubbles!'}
        </p>

        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl justify-center mb-8">
          <button 
            onClick={() => startGame('zen')}
            className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-b-4 border-blue-200 dark:border-blue-900 hover:border-blue-400 hover:-translate-y-1 transition-all group"
          >
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <PlayCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{lang === 'geg' ? 'Lojë e Lirë' : 'Free Play'}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{lang === 'geg' ? 'Pa siklet, veç mësim.' : 'No stress, just popping.'}</p>
          </button>

          <button 
             onClick={() => startGame('challenge')}
             className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-b-4 border-orange-200 dark:border-orange-900 hover:border-orange-400 hover:-translate-y-1 transition-all group"
          >
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <Trophy className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{lang === 'geg' ? 'Sfidë 60s' : '60s Challenge'}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{lang === 'geg' ? 'Gjeni shkronjën e duhun!' : 'Find the right letter!'}</p>
          </button>
        </div>

        <button 
            onClick={() => setMode('leaderboard')}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:underline"
        >
            <Medal className="w-5 h-5" /> {lang === 'geg' ? 'Tabela e Nderit' : 'Leaderboard'}
        </button>
      </div>
    );
  }

  if (mode === 'gameover') {
      return (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 min-h-[550px] flex flex-col items-center justify-center text-center animate-fade-in border border-gray-100 dark:border-gray-700">
              <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6">
                  <Trophy className="w-12 h-12 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{lang === 'geg' ? 'Lojë e Kryeme!' : 'Game Over!'}</h2>
              <div className="text-6xl font-black text-blue-600 dark:text-blue-400 mb-8">{score}</div>
              
              <div className="w-full max-w-sm space-y-4">
                  <p className="text-gray-500 dark:text-gray-400 font-medium">{lang === 'geg' ? 'Shkruani emnin tuej për tabelë:' : 'Enter your name for the leaderboard:'}</p>
                  <input 
                    autoFocus
                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-center font-bold text-xl dark:text-white"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder={lang === 'geg' ? 'Emni juej' : 'Your Name'}
                  />
                  <button 
                    onClick={saveScore}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all"
                  >
                      {lang === 'geg' ? 'Ruaj Rezultatin' : 'Save Score'}
                  </button>
                  <button onClick={() => setMode('menu')} className="w-full py-2 text-gray-400 hover:text-gray-600 font-bold">
                    {lang === 'geg' ? 'Anulo' : 'Cancel'}
                  </button>
              </div>
          </div>
      );
  }

  if (mode === 'leaderboard') {
      return (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 min-h-[550px] flex flex-col border border-gray-100 dark:border-gray-700 animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                      <Medal className="w-8 h-8 text-yellow-500" />
                      {lang === 'geg' ? 'Mjeshtrat e Flluskave' : 'Bubble Masters'}
                  </h2>
                  <button onClick={() => setMode('menu')} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200"><X className="w-5 h-5 text-gray-500"/></button>
              </div>

              <div className="space-y-3 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                  {topScores.length === 0 ? (
                      <div className="text-center py-20 text-gray-400 italic">No scores recorded yet!</div>
                  ) : (
                      topScores.map((s, idx) => (
                        <div key={s.id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 group hover:scale-[1.01] transition-transform">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                {idx + 1}
                            </div>
                            <div className="flex-grow">
                                <div className="font-bold text-gray-900 dark:text-white">{s.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{s.date}</div>
                            </div>
                            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{s.score}</div>
                        </div>
                      ))
                  )}
              </div>

              <button 
                onClick={() => startGame('challenge')}
                className="mt-8 py-4 bg-orange-500 text-white rounded-xl font-black shadow-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
              >
                  <RefreshCw className="w-5 h-5" /> {lang === 'geg' ? 'Provo nji tjetër' : 'Try Again'}
              </button>
          </div>
      );
  }

  return (
    <div 
        className="relative bg-gradient-to-b from-sky-200 via-blue-100 to-white dark:from-sky-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-xl border-4 border-white dark:border-gray-700 overflow-hidden h-[600px] select-none touch-none cursor-crosshair"
        style={{ touchAction: 'none' }} // Critical for touch friendliness
    >
       <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-white/30 dark:bg-black/30 backdrop-blur-sm border-b border-white/50 dark:border-gray-700">
          <button 
             onClick={endGame}
             className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
             <PauseCircle className="w-6 h-6" />
          </button>
          
          <div className="flex gap-3">
              {mode === 'challenge' && targetLetter && (
                <div className="bg-white/90 dark:bg-gray-800/90 px-6 py-2 rounded-xl shadow-lg border border-blue-200 dark:border-blue-900 flex items-center gap-3">
                    <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{targetLetter}</span>
                    <button onClick={() => speak(targetLetter)} className="text-gray-400 hover:text-blue-500"><Volume2 className="w-4 h-4" /></button>
                </div>
              )}

              {mode === 'challenge' && (
                  <div className={`px-4 py-2 rounded-xl font-black flex items-center gap-2 shadow-md ${timeLeft < 10 ? 'bg-red-500 text-white animate-pulse' : 'bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white'}`}>
                      <Clock className="w-5 h-5" />
                      <span className="text-xl font-mono">{timeLeft}s</span>
                  </div>
              )}
          </div>

          <div className="bg-yellow-400/90 dark:bg-yellow-600/90 text-yellow-900 dark:text-white px-4 py-2 rounded-xl font-black shadow-md flex items-center gap-2">
             <Trophy className="w-5 h-5" />
             <span className="text-xl">{score}</span>
          </div>
       </div>

       <div ref={containerRef} className="absolute inset-0 z-10 overflow-hidden">
          {bubbles.map(bubble => (
             <div
               key={bubble.id}
               onMouseDown={(e) => handlePop(e, bubble)}
               onTouchStart={(e) => handlePop(e, bubble)}
               style={{
                 left: `${bubble.x}%`,
                 top: `${bubble.y}%`,
                 width: `${bubble.size}px`,
                 height: `${bubble.size}px`,
                 position: 'absolute',
                 transform: 'translate(-50%, -50%)',
                 transition: 'top 0s linear',
                 // Extra hit area for fingers
                 padding: '10px'
               }}
               className={`
                 ${bubble.color} 
                 rounded-full shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.1),inset_4px_4px_8px_rgba(255,255,255,0.4)]
                 flex items-center justify-center
                 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-75
                 border-2 border-white/30 group
               `}
             >
                <div className="absolute top-[15%] left-[15%] w-[25%] h-[15%] bg-white/60 rounded-full transform -rotate-45 pointer-events-none"></div>
                <div className="absolute bottom-[15%] right-[15%] w-[10%] h-[10%] bg-white/20 rounded-full pointer-events-none"></div>
                
                <span className="text-white font-black drop-shadow-md select-none pointer-events-none" style={{ fontSize: `${bubble.size * 0.45}px` }}>
                   {bubble.char}
                </span>
             </div>
          ))}

          {particles.map(p => (
             <div 
               key={p.id}
               style={{
                 left: `${p.x}%`,
                 top: `${p.y}%`,
                 backgroundColor: p.color.replace('bg-', '').split('-')[0], // simplified color mapping
                 opacity: p.life,
                 transform: 'scale(' + p.life + ')',
                 width: '10px',
                 height: '10px',
                 position: 'absolute',
                 borderRadius: '50%',
                 pointerEvents: 'none'
               }}
             />
          ))}

          {floatingScores.map(fs => (
              <div 
                key={fs.id}
                className={`absolute font-black text-2xl drop-shadow-md pointer-events-none ${fs.value.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}
                style={{ 
                    left: `${fs.x}%`, 
                    top: `${fs.y}%`, 
                    opacity: fs.life,
                    transform: `translate(-50%, -100%) scale(${0.8 + fs.life * 0.5})` 
                }}
              >
                  {fs.value}
              </div>
          ))}
       </div>

       {/* Decorative Water Layer */}
       <div className="absolute bottom-0 left-0 w-full h-32 bg-white/30 dark:bg-black/20 rounded-t-[100%] z-0 blur-xl pointer-events-none"></div>
       <div className="absolute bottom-[-20px] left-[20%] w-64 h-64 bg-white/40 dark:bg-black/30 rounded-full z-0 blur-2xl pointer-events-none"></div>
    </div>
  );
};

export default BubblePopGame;
