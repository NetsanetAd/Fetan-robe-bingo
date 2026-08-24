import React, { useEffect } from 'react';
import { getCardById } from '../data/cardsData';
import { Clock, Users, ShieldCheck, Trophy } from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface MatchCountdownViewProps {
  countdownSeconds: number;
  selectedCardId: number;
  playersCount: number;
  activePlayersCount?: number;
  onChangeCard: () => void;
  derashPot: number;
}

export const MatchCountdownView: React.FC<MatchCountdownViewProps> = ({
  countdownSeconds,
  selectedCardId,
  playersCount,
  activePlayersCount,
  onChangeCard,
  derashPot,
}) => {
  const card = getCardById(selectedCardId);

  // Play countdown beep sound during last 5 seconds
  useEffect(() => {
    if (countdownSeconds > 0 && countdownSeconds <= 5) {
      sound.playPop();
    }
  }, [countdownSeconds]);

  // Calculate percentage for circular/linear progress bar
  const progressPercent = Math.max(0, Math.min(100, ((30 - countdownSeconds) / 30) * 100));

  return (
    <main className="flex-1 max-w-xl mx-auto w-full px-4 py-6 flex flex-col justify-center gap-5 select-none animate-fade-in">
      {/* Top Pre-Game Badge */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-extrabold text-xs border border-amber-500/20 shadow-sm">
          <Clock className="w-3.5 h-3.5 animate-pulse" /> STATUS: STARTING
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Game Starting
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Starting countdown in progress. Card #{card.id} locked in!
        </p>
      </div>

      {/* Main Countdown Timer Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-5 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Large Prominent Countdown Number Badge */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-slate-950 border-4 border-slate-800 flex flex-col items-center justify-center shadow-inner">
            {/* SVG Circular Progress Ring */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-slate-800"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-amber-400 transition-all duration-1000 ease-linear"
                strokeWidth="6"
                strokeDasharray={276}
                strokeDashoffset={276 - (276 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <span className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tighter drop-shadow-lg">
              {countdownSeconds}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
              SECONDS
            </span>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Live Status Indicators */}
        <div className="w-full grid grid-cols-2 gap-2 text-center">
          <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 flex flex-col items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3 h-3 text-cyan-400" /> Players Joined
            </span>
            <span className="text-sm font-black text-cyan-300 mt-0.5 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {playersCount} Player{playersCount === 1 ? '' : 's'}
            </span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 flex flex-col items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" /> Prize Pool
            </span>
            <span className="text-sm font-black text-amber-300 mt-0.5">
              {derashPot} ⭐ Stars
            </span>
          </div>
        </div>

        {/* Selected Card Cardlet */}
        <div className="w-full bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-black text-base flex items-center justify-center border border-amber-500/40 shadow-sm shrink-0">
              #{card.id}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-white truncate">Your Card #{card.id}</div>
              <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Locked & Ready
              </div>
            </div>
          </div>

          <button
            onClick={onChangeCard}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-700 transition-all shrink-0"
          >
            Switch Card
          </button>
        </div>
      </div>
    </main>
  );
};
