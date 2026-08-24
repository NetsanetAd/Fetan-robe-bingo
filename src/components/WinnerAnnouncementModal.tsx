import React from 'react';
import { Player } from '../types';
import { Trophy, Award, Sparkles, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WinnerAnnouncementModalProps {
  winner: Player;
  isUserWinner: boolean;
  patternName: string;
  prizeStars: number;
  onPlayAgain: () => void;
  onClose: () => void;
}

export const WinnerAnnouncementModal: React.FC<WinnerAnnouncementModalProps> = ({
  winner,
  isUserWinner,
  patternName,
  prizeStars,
  onPlayAgain,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Trophy Icon Badge */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-xl ring-4 ring-amber-300/40 animate-bounce">
          <Trophy className="w-9 h-9 fill-slate-950" />
        </div>

        {/* Winner Title */}
        <div>
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 font-extrabold text-[11px] px-3 py-1 rounded-full border border-amber-500/30 uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" /> BINGO WINNER DECLARED!
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isUserWinner ? '🎉 YOU WON BINGO!' : `${winner.name} Won!`}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Matched winning pattern: <span className="text-amber-300 font-extrabold">{patternName}</span>
          </p>
        </div>

        {/* Winner Profile Box */}
        <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl ${winner.avatar || 'bg-amber-500'} flex items-center justify-center font-black text-lg text-white border border-white/20 shadow`}>
              {winner.isUser ? '🎮' : winner.name.charAt(0)}
            </div>
            <div className="text-left">
              <div className="text-sm font-black text-white flex items-center gap-1.5">
                {winner.name}
                {isUserWinner && (
                  <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black px-1.5 py-0.2 rounded border border-indigo-500/30">
                    YOU
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400">
                Cartela Card <span className="text-white font-bold">#{winner.cardId}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Prize Won
            </div>
            <div className="text-sm font-black text-amber-300 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> {prizeStars} ⭐
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2 mt-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4 stroke-[3]" />
            Queue For Next Match
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
          >
            Close & View Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};
