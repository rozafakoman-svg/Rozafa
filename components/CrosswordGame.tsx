
import React, { useState, useEffect, useRef } from 'react';
import { CrosswordData } from '../types';
import { fetchCrosswordPuzzle } from '../services/geminiService';
import { Loader2, RefreshCw, CheckCircle } from './Icons';

const CrosswordGame: React.FC = () => {
  const [data, setData] = useState<CrosswordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [grid, setGrid] = useState<string[][]>([]);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{x: number, y: number} | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [isSolved, setIsSolved] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  const initGame = async () => {
    setLoading(true);
    setIsSolved(false);
    try {
      const puzzle = await fetchCrosswordPuzzle();
      setData(puzzle);
      
      // Initialize grids
      const newGrid = Array(puzzle.height).fill('').map(() => Array(puzzle.width).fill(''));
      const newUserGrid = Array(puzzle.height).fill('').map(() => Array(puzzle.width).fill(''));
      
      // Fill solution grid
      puzzle.words.forEach(word => {
        for (let i = 0; i < word.word.length; i++) {
          if (word.direction === 'across') {
            if (word.startX + i < puzzle.width) {
               newGrid[word.startY][word.startX + i] = word.word[i].toUpperCase();
            }
          } else {
            if (word.startY + i < puzzle.height) {
               newGrid[word.startY + i][word.startX] = word.word[i].toUpperCase();
            }
          }
        }
      });
      
      setGrid(newGrid);
      setUserGrid(newUserGrid);
      
      // Reset Refs
      inputRefs.current = Array(puzzle.height).fill(null).map(() => Array(puzzle.width).fill(null));

    } catch (e) {
      console.error("Failed to init crossword", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCellClick = (x: number, y: number) => {
    if (grid[y][x] === '') return;
    
    if (selectedCell?.x === x && selectedCell?.y === y) {
      setDirection(direction === 'across' ? 'down' : 'across');
    } else {
      setSelectedCell({x, y});
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, x: number, y: number) => {
    const val = e.target.value.slice(-1).toUpperCase();
    const newUserGrid = [...userGrid.map(row => [...row])];
    newUserGrid[y][x] = val;
    setUserGrid(newUserGrid);

    // Auto-advance
    if (val) {
      if (direction === 'across') {
        if (x + 1 < data!.width && grid[y][x + 1] !== '') {
           setSelectedCell({x: x + 1, y});
           inputRefs.current[y][x + 1]?.focus();
        }
      } else {
        if (y + 1 < data!.height && grid[y + 1][x] !== '') {
           setSelectedCell({x, y: y + 1});
           inputRefs.current[y + 1][x]?.focus();
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, x: number, y: number) => {
    // Backspace Handling
    if (e.key === 'Backspace') {
       e.preventDefault();
       if (userGrid[y][x] === '') {
         // Move back
         if (direction === 'across' && x > 0 && grid[y][x-1] !== '') {
            setSelectedCell({x: x-1, y});
            inputRefs.current[y][x-1]?.focus();
         } else if (direction === 'down' && y > 0 && grid[y-1][x] !== '') {
            setSelectedCell({x, y: y-1});
            inputRefs.current[y-1][x]?.focus();
         }
       } else {
         const newUserGrid = [...userGrid.map(row => [...row])];
         newUserGrid[y][x] = '';
         setUserGrid(newUserGrid);
       }
    }
    // Arrow Key Navigation
    else if (e.key === 'ArrowRight') {
        if (x + 1 < (data?.width || 10) && grid[y][x + 1] !== '') {
            setSelectedCell({ x: x + 1, y });
            inputRefs.current[y][x + 1]?.focus();
        }
    }
    else if (e.key === 'ArrowLeft') {
        if (x > 0 && grid[y][x - 1] !== '') {
            setSelectedCell({ x: x - 1, y });
            inputRefs.current[y][x - 1]?.focus();
        }
    }
    else if (e.key === 'ArrowDown') {
        if (y + 1 < (data?.height || 10) && grid[y + 1][x] !== '') {
            setSelectedCell({ x, y: y + 1 });
            inputRefs.current[y + 1][x]?.focus();
        }
    }
    else if (e.key === 'ArrowUp') {
        if (y > 0 && grid[y - 1][x] !== '') {
            setSelectedCell({ x, y: y - 1 });
            inputRefs.current[y - 1][x]?.focus();
        }
    }
  };

  const checkSolution = () => {
    let correct = true;
    for (let y = 0; y < data!.height; y++) {
      for (let x = 0; x < data!.width; x++) {
        if (grid[y][x] !== '' && grid[y][x] !== userGrid[y][x]) {
          correct = false;
          break;
        }
      }
    }
    if (correct) setIsSolved(true);
    else alert("Keep trying! Some letters are incorrect.");
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center p-12">
      <Loader2 className="w-8 h-8 text-albanian-red animate-spin mb-4" />
      <p className="text-gray-500 font-medium">Generating puzzle...</p>
    </div>
  );

  if (!data) return <div className="p-8 text-center text-red-500">Failed to load crossword. <button onClick={initGame} className="underline">Retry</button></div>;

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full">
       <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-slate-200">Fjalëkryq</h2>
            <p className="text-slate-400 text-sm">{data.title || "Albanian Crossword"}</p>
          </div>
          <button onClick={initGame} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
             <RefreshCw className="w-5 h-5" />
          </button>
       </div>

       <div className="p-6 flex flex-col lg:flex-row gap-8 overflow-y-auto">
          {/* Grid */}
          <div className="flex-shrink-0 mx-auto overflow-x-auto">
            <div 
              className="grid gap-1 bg-gray-200 p-2 rounded-lg border border-gray-300 shadow-inner"
              style={{ 
                gridTemplateColumns: `repeat(${data.width}, minmax(30px, 40px))`,
                width: 'fit-content'
              }}
            >
              {grid.map((row, y) => (
                row.map((cell, x) => (
                   <div key={`${x}-${y}`} className="relative aspect-square">
                     {cell !== '' ? (
                       <input
                         ref={el => {
                            if (!inputRefs.current[y]) inputRefs.current[y] = [];
                            inputRefs.current[y][x] = el;
                         }}
                         type="text"
                         maxLength={1}
                         value={userGrid[y][x]}
                         onChange={(e) => handleInputChange(e, x, y)}
                         onClick={() => handleCellClick(x, y)}
                         onKeyDown={(e) => handleKeyDown(e, x, y)}
                         className={`w-full h-full text-center font-bold text-lg sm:text-xl uppercase focus:outline-none transition-colors rounded-sm
                           ${selectedCell?.x === x && selectedCell?.y === y ? 'bg-yellow-200 text-yellow-900 ring-2 ring-yellow-400 z-10' : 
                             isSolved ? 'bg-green-100 text-green-800' : 'bg-white text-gray-900'}
                           ${userGrid[y][x] && grid[y][x] !== userGrid[y][x] && isSolved === false ? '' : ''}
                           `}
                         readOnly={isSolved}
                       />
                     ) : (
                       <div className="w-full h-full bg-slate-100/50 rounded-sm"></div>
                     )}
                   </div>
                ))
              ))}
            </div>
          </div>

          {/* Clues */}
          <div className="flex-grow">
             <div className="mb-4">
                {isSolved ? (
                    <div className="w-full py-3 bg-green-100 text-green-800 rounded-xl font-bold border border-green-200 flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Puzzle Solved!
                    </div>
                ) : (
                    <button 
                    onClick={checkSolution}
                    className="w-full py-3 bg-albanian-red text-white rounded-xl font-bold hover:bg-red-800 transition-colors disabled:opacity-50"
                    >
                    Check Answers
                    </button>
                )}
             </div>

             <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-6">
                <div>
                   <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">Across</h3>
                   <ul className="space-y-2 text-sm max-h-[200px] overflow-y-auto pr-2">
                      {data.words.filter(w => w.direction === 'across').map((w, i) => (
                        <li key={i} className="text-gray-600">
                           <span className="font-bold text-gray-400 mr-2">{i+1}.</span>
                           {w.clue}
                        </li>
                      ))}
                   </ul>
                </div>
                <div>
                   <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">Down</h3>
                   <ul className="space-y-2 text-sm max-h-[200px] overflow-y-auto pr-2">
                      {data.words.filter(w => w.direction === 'down').map((w, i) => (
                        <li key={i} className="text-gray-600">
                           <span className="font-bold text-gray-400 mr-2">{i+1}.</span>
                           {w.clue}
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default CrosswordGame;
