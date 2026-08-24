import React from 'react';
import { CalledBall, WinPattern } from '../types';
import { Sparkles, Trophy, Grid, Disc, ShieldCheck } from 'lucide-react';

interface GameHeaderProps {
  currentBall: CalledBall | null;
  recentBalls: CalledBall[];
  ballsCalledCount: number;
  playersCount: number;
  pattern: WinPattern;
  autoDaub: boolean;
  onToggleAutoDaub: () => void;
  starsPool: number;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  currentBall,
  recentBalls,
  ballsCalledCount,
  playersCount,
  pattern,
  autoDaub,
  onToggleAutoDaub,
  starsPool,
}) => {
  const getBallBg = (letter: string) => {
    switch (letter) {
      case 'B': return 'from-blue-600 to-indigo-700 text-white shadow-blue-500/30';
      case 'I': return 'from-amber-500 to-orange-600 text-white shadow-amber-500/30';
      case 'N': return 'from-emerald-500 to-teal-600 text-white shadow-emerald-500/30';
      case 'G': return 'from-purple-600 to-pink-600 text-white shadow-purple-500/30';
      case 'O': return 'from-rose-500 to-red-600 text-white shadow-rose-500/30';
      default: return 'from-slate-700 to-slate-800 text-slate-100';
    }
  };

  const getPatternLabel = (p: WinPattern) => {
    switch (p) {
      case 'ANY_LINE_OR_CORNERS': return 'Standard Line (Row or Col or Diag OR 4 Corners)';
      case 'ANY_LINE': return 'Line / Column / Diagonal';
      case 'FOUR_CORNERS': return '4 Corner Cells';
      case 'X_PATTERN': return 'X Cross Pattern';
      case 'FULL_HOUSE': return 'Full House (All 24)';
    }
  };

  return (
    <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md px-3 py-2.5">
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 font-semibold px-2 py-0.5 rounded-full border border-amber-500/20">
              <Trophy className="w-3.5 h-3.5" />
              {starsPool} ⭐ Prize Pool
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {playersCount} Players
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleAutoDaub}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition-all text-xs ${
                autoDaub
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Auto-Daub: <span className="font-bold">{autoDaub ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Current & Recent Ball Caller Display */}
        <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800/80 shadow-inner">
          {/* Current Ball */}
          <div className="flex items-center gap-3">
            {currentBall ? (
              <div
                key={currentBall.number}
                className={`w-14 h-14 rounded-full bg-gradient-to-br ${getBallBg(
                  currentBall.letter
                )} flex flex-col items-center justify-center shadow-lg font-black tracking-tight animate-bounce-short border-2 border-white/20`}
              >
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 leading-none">
                  {currentBall.letter}
                </span>
                <span className="text-xl font-extrabold leading-none">{currentBall.number}</span>
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500">
                <Disc className="w-5 h-5 animate-spin" />
              </div>
            )}

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-400" /> LIVE BINGO CALLER
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-extrabold text-white">
                  {currentBall ? `${currentBall.letter}-${currentBall.number}` : 'Preparing...'}
                </span>
                <span className="text-xs text-slate-400">
                  ({ballsCalledCount}/75 called)
                </span>
              </div>
              <span className="text-[11px] text-amber-300/90 font-medium">
                Win Pattern: {getPatternLabel(pattern)}
              </span>
            </div>
          </div>

          {/* Recent Balls Strip */}
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="text-[10px] font-semibold text-slate-400">Recent Calls</span>
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] p-0.5">
              {recentBalls.slice(-5).reverse().map((b, i) => (
                <div
                  key={`${b.number}_${i}`}
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${getBallBg(
                    b.letter
                  )} flex items-center justify-center text-xs font-bold shadow-sm border border-white/10`}
                >
                  {b.number}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
