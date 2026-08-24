import React from 'react';
import { BingoCard, CalledBall } from '../types';
import { sound } from '../utils/soundEffects';
import { CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

interface BingoCardViewProps {
  card: BingoCard;
  markedIndices: boolean[];
  calledBalls: CalledBall[];
  onToggleCell: (index: number) => void;
  onClaimBingo: () => void;
  distanceToWin: number;
  hasClaimed: boolean;
  winningIndices?: number[];
  autoDaub: boolean;
  isDisconnected?: boolean;
  disconnectedReason?: string;
}

export const BingoCardView: React.FC<BingoCardViewProps> = ({
  card,
  markedIndices,
  calledBalls,
  onToggleCell,
  onClaimBingo,
  distanceToWin,
  hasClaimed,
  winningIndices = [],
  autoDaub,
  isDisconnected = false,
  disconnectedReason,
}) => {
  const calledNumbersSet = new Set(calledBalls.map(b => b.number));
  const columns = ['B', 'I', 'N', 'G', 'O'];

  const getColColor = (colName: string) => {
    switch (colName) {
      case 'B': return 'bg-blue-600 text-white';
      case 'I': return 'bg-amber-500 text-white';
      case 'N': return 'bg-emerald-600 text-white';
      case 'G': return 'bg-purple-600 text-white';
      case 'O': return 'bg-rose-600 text-white';
      default: return 'bg-slate-700 text-white';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-2">
      {/* Disconnection Banner if False Bingo claimed */}
      {isDisconnected && (
        <div className="w-full bg-rose-950/90 border-2 border-rose-500/80 rounded-2xl p-4 text-center shadow-xl backdrop-blur-md animate-pulse">
          <div className="flex items-center justify-center gap-2 text-rose-400 font-black text-base mb-1">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            DISCONNECTED & DISQUALIFIED
          </div>
          <p className="text-xs font-bold text-rose-200">
            {disconnectedReason || 'False Bingo Claim! You pressed BINGO before completing the required winning pattern.'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            You are removed from active play in this match.
          </p>
        </div>
      )}

      {/* Card Header & Status */}
      <div className="flex items-center justify-between w-full text-slate-200 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            Card #{card.id}
          </span>
          {isDisconnected ? (
            <span className="text-xs font-bold text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-lg border border-rose-500/40">
              🚫 Disqualified
            </span>
          ) : distanceToWin === 0 ? (
            <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/50 animate-pulse flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> BINGO READY!
            </span>
          ) : distanceToWin === 1 ? (
            <span className="text-xs font-bold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-500/40">
              🔥 1 Away (BINGO in 1!)
            </span>
          ) : (
            <span className="text-xs font-medium text-slate-400">
              {distanceToWin} to Bingo
            </span>
          )}
        </div>

        {autoDaub && !isDisconnected && (
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Auto-Daubing
          </span>
        )}
      </div>

      {/* The 5x5 Bingo Board */}
      <div className={`w-full bg-slate-900 border-2 rounded-2xl p-2.5 shadow-2xl backdrop-blur-xl relative transition-all ${
        isDisconnected ? 'border-rose-900/60 opacity-60' : 'border-slate-800'
      }`}>
        {/* Column Headers B-I-N-G-O */}
        <div className="grid grid-cols-5 gap-1.5 mb-1.5 text-center">
          {columns.map(col => (
            <div
              key={col}
              className={`${getColColor(
                col
              )} font-black text-lg sm:text-xl py-1 rounded-xl shadow-md tracking-wider`}
            >
              {col}
            </div>
          ))}
        </div>

        {/* Grid Cells (25 Total) */}
        <div className="grid grid-cols-5 gap-1.5 aspect-square">
          {card.cells.map((cellValue, idx) => {
            const isFree = cellValue === 'FREE' || idx === 12;
            const isMarked = markedIndices[idx] || isFree;
            const isCalled = isFree || (typeof cellValue === 'number' && calledNumbersSet.has(cellValue));
            const isWinningCell = winningIndices.includes(idx);

            return (
              <button
                key={idx}
                type="button"
                disabled={hasClaimed || isDisconnected || isFree}
                onClick={() => {
                  sound.playDaub();
                  onToggleCell(idx);
                }}
                className={`relative flex flex-col items-center justify-center rounded-xl font-bold transition-all transform active:scale-95 select-none aspect-square p-1 ${
                  isWinningCell
                    ? 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-slate-950 ring-4 ring-amber-300 shadow-lg shadow-amber-500/50 animate-bounce'
                    : isMarked
                    ? 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white ring-2 ring-blue-400/80 shadow-md shadow-blue-600/30'
                    : isCalled
                    ? 'bg-slate-800/90 hover:bg-slate-700/90 text-amber-300 border-2 border-amber-500/60 shadow-sm animate-pulse'
                    : 'bg-slate-800/50 hover:bg-slate-800 text-slate-200 border border-slate-700/50'
                }`}
              >
                {/* Stamp/Dauber effect */}
                {isMarked && !isWinningCell && (
                  <span className="absolute inset-1 rounded-lg bg-blue-500/20 border-2 border-blue-400/50 pointer-events-none" />
                )}

                {isFree ? (
                  <div className="flex flex-col items-center justify-center leading-none">
                    <Sparkles className="w-5 h-5 text-amber-300 mb-0.5 animate-spin-slow" />
                    <span className="text-[10px] uppercase font-black tracking-tighter text-amber-200">
                      FREE
                    </span>
                  </div>
                ) : (
                  <span className="text-base sm:text-lg font-extrabold tracking-tight">
                    {cellValue}
                  </span>
                )}

                {/* Indication if called but not yet daubed by player (when auto-daub is OFF) */}
                {!autoDaub && !isMarked && isCalled && !isDisconnected && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* BINGO Claim Button */}
      <div className="w-full flex justify-center mt-1">
        <button
          onClick={() => {
            if (distanceToWin === 0) {
              sound.playFanfare();
            } else {
              sound.playError();
            }
            onClaimBingo();
          }}
          disabled={hasClaimed || isDisconnected}
          className={`w-full py-3.5 px-6 rounded-2xl font-black text-xl tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 transform active:scale-95 ${
            isDisconnected
              ? 'bg-rose-900/80 text-rose-300 border border-rose-500/50 cursor-not-allowed opacity-80'
              : distanceToWin === 0
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 text-slate-950 shadow-emerald-500/50 animate-pulse border-2 border-emerald-300 ring-4 ring-emerald-400/30'
              : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-500/30 hover:brightness-110 border border-amber-400/40'
          } ${hasClaimed ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isDisconnected ? (
            <>
              <AlertCircle className="w-6 h-6 text-rose-400" />
              DISQUALIFIED (FALSE BINGO)
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6 animate-spin" />
              {hasClaimed ? 'BINGO CLAIMED!' : 'CLAIM BINGO!'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
