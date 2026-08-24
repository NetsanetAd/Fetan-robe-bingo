import React from 'react';
import { AlertTriangle, LogOut, ShieldAlert } from 'lucide-react';

interface FalseBingoPenaltyModalProps {
  reason: string;
  onReturnToLobby: () => void;
}

export const FalseBingoPenaltyModal: React.FC<FalseBingoPenaltyModalProps> = ({
  reason,
  onReturnToLobby,
}) => {
  return (
    <div id="false-bingo-penalty-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in select-none">
      <div id="false-bingo-penalty-container" className="w-full max-w-md bg-slate-900 border-2 border-rose-500/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Warning Icon */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-600 via-red-600 to-rose-700 flex items-center justify-center text-white shadow-xl ring-4 ring-rose-500/40 animate-pulse">
          <ShieldAlert className="w-9 h-9 text-white" />
        </div>

        {/* Title & Description */}
        <div>
          <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 font-extrabold text-[11px] px-3 py-1 rounded-full border border-rose-500/40 uppercase tracking-widest mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> ANTI-CHEAT DISQUALIFICATION
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            False Bingo Claim Penalty!
          </h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {reason || 'You clicked "BINGO!" without completing a valid winning pattern. You have been disqualified and removed from this active match session.'}
          </p>
        </div>

        {/* Penalty details box */}
        <div className="w-full bg-slate-950 border border-rose-500/30 rounded-2xl p-3.5 text-left text-xs space-y-1.5">
          <div className="font-black text-rose-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Penalty Consequences:
          </div>
          <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px]">
            <li>Disqualified from winning the current match prize pool.</li>
            <li>Card locked out of active cell marking.</li>
            <li>Disconnected from active matchroom participants.</li>
          </ul>
        </div>

        {/* Return to Lobby Button */}
        <button
          id="acknowledge-penalty-btn"
          onClick={onReturnToLobby}
          className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 border border-rose-400/40 mt-1"
        >
          <LogOut className="w-4 h-4" />
          Acknowledge & Return to Lobby
        </button>
      </div>
    </div>
  );
};
