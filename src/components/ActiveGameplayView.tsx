import React, { useState } from 'react';
import { CalledBall, BingoCard, GameState } from '../types';
import {
  Trophy,
  Users,
  RefreshCw,
  LogOut,
  Sparkles,
  Check,
  Disc,
  Eye,
  Clock,
} from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface ActiveGameplayViewProps {
  // 1. Top Stats Bar metrics
  gameRoundNumber: number; // e.g., 3
  derashPot: number; // e.g., 768
  playersCount: number; // e.g., 97
  activePlayersCount?: number;
  betAmount: number; // e.g., 0
  callCount: number; // e.g., 28

  // 2. Master Board & Status state
  gameState: GameState;
  currentBall: CalledBall | null;
  calledBalls: CalledBall[];
  startingCountdownSeconds?: number;

  // 3. Player Bingo Card & Action Controls
  userCard: BingoCard;
  userMarkedIndices: boolean[];
  cartelaNumber: number; // Cartela Number: e.g. 1
  distanceToWin: number;
  hasClaimedBingo: boolean;
  winningIndices?: number[];

  // Event Handlers
  onToggleCell: (index: number) => void;
  onClaimBingo: () => void;
  onLeaveGame: () => void;
  onRefresh: () => void;

  // Additional options
  autoDaub: boolean;
  onToggleAutoDaub: () => void;
  onOpenPlayersDrawer: () => void;
  winnersCount: number;

  // Spectator / Late-join mode
  isSpectator?: boolean;
  onQueueNextMatch?: () => void;

  // Disqualification / Anti-cheat
  isUserDisconnected?: boolean;
  disconnectedReason?: string;

  // Server-side Synchronization Timer
  nextBallCountdownMs?: number;
  callSpeed?: number;
}

export const ActiveGameplayView: React.FC<ActiveGameplayViewProps> = ({
  gameRoundNumber,
  derashPot,
  playersCount,
  activePlayersCount,
  betAmount,
  callCount,
  gameState,
  currentBall,
  calledBalls,
  startingCountdownSeconds,
  userCard,
  userMarkedIndices,
  cartelaNumber,
  distanceToWin,
  hasClaimedBingo,
  winningIndices = [],
  onToggleCell,
  onClaimBingo,
  onLeaveGame,
  onRefresh,
  autoDaub,
  onToggleAutoDaub,
  onOpenPlayersDrawer,
  winnersCount,
  isSpectator = false,
  onQueueNextMatch,
  isUserDisconnected = false,
  disconnectedReason,
  nextBallCountdownMs = 0,
  callSpeed = 3000,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Set of called ball numbers for quick lookup
  const calledNumbersSet = new Set(calledBalls.map(b => b.number));
  const latestBallNumber = currentBall?.number;

  const handleRefreshClick = () => {
    sound.playPop();
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Master Board Vertical Columns (B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75)
  const masterColumns = [
    { letter: 'B', min: 1, max: 15, headerStyle: 'text-blue-400 bg-[#13284c] border-[#1d4ed8]/40' },
    { letter: 'I', min: 16, max: 30, headerStyle: 'text-amber-400 bg-[#332211] border-[#b45309]/40' },
    { letter: 'N', min: 31, max: 45, headerStyle: 'text-emerald-400 bg-[#0d3326] border-[#047857]/40' },
    { letter: 'G', min: 46, max: 60, headerStyle: 'text-purple-300 bg-[#2a1745] border-[#6b21a8]/40' },
    { letter: 'O', min: 61, max: 75, headerStyle: 'text-rose-400 bg-[#3b1223] border-[#be123c]/40' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-2 py-3 flex flex-col gap-3 text-slate-100 select-none">
      {/* DISQUALIFICATION / ANTI-CHEAT BANNER */}
      {isUserDisconnected && (
        <div className="bg-rose-500/20 border-2 border-rose-500/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-rose-200 shadow-xl animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white font-black flex items-center justify-center shrink-0 ring-2 ring-rose-400">
              ⚠️
            </div>
            <div>
              <div className="text-xs font-black text-rose-300 uppercase tracking-wider">
                DISQUALIFIED FROM CURRENT MATCH
              </div>
              <p className="text-[11px] text-slate-300">
                {disconnectedReason || 'False Bingo Claim penalty applied. Card operations locked.'}
              </p>
            </div>
          </div>
          <button
            onClick={onLeaveGame}
            className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs px-3.5 py-2 rounded-xl border border-rose-400 shadow-md shrink-0"
          >
            Leave Match
          </button>
        </div>
      )}

      {/* SPECTATOR / LATE JOIN BANNER */}
      {isSpectator && (
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-indigo-500/20 border border-amber-500/40 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>SPECTATOR MODE</span>
                <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                  LATE JOIN LOCKED
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Match #{gameRoundNumber} is in progress. You can spectate calls or reserve your card for Game #{gameRoundNumber + 1}!
              </p>
            </div>
          </div>

          {onQueueNextMatch && (
            <button
              onClick={onQueueNextMatch}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <Clock className="w-4 h-4" /> Queue Card For Next Game
            </button>
          )}
        </div>
      )}

      {/* 1. TOP STATS BAR (GAMES, DERASH, PLAYERS, BET, CALL) */}
      <section className="bg-[#091121] border border-slate-800/90 rounded-2xl p-2 sm:p-2.5 shadow-xl backdrop-blur-md">
        <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center">
          {/* Games Box */}
          <div className="bg-[#040914] border border-slate-800/80 rounded-xl p-1.5 sm:p-2 flex flex-col items-center justify-center transition-all hover:border-slate-700">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">
              GAMES
            </span>
            <span className="text-xs sm:text-base font-black text-indigo-400 mt-0.5">
              {gameRoundNumber}
            </span>
          </div>

          {/* Derash (Pot/Pool) Box */}
          <div className="bg-[#040914] border border-amber-500/30 rounded-xl p-1.5 sm:p-2 flex flex-col items-center justify-center transition-all hover:border-amber-500/50 shadow-inner">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">DERASH</span>
              <span className="sm:hidden">POT</span>
            </span>
            <span className="text-xs sm:text-base font-black text-amber-300 mt-0.5 drop-shadow">
              {derashPot}
            </span>
          </div>

          {/* Players Count Box */}
          <button
            onClick={onOpenPlayersDrawer}
            className="bg-[#040914] border border-slate-800/80 rounded-xl p-1.5 sm:p-2 flex flex-col items-center justify-center transition-all hover:border-cyan-500/40 active:scale-95"
          >
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400 shrink-0" />
              <span className="hidden sm:inline">PLAYERS</span>
              <span className="sm:hidden">PLRS</span>
            </span>
            <span className="text-xs sm:text-base font-black text-cyan-300 mt-0.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {activePlayersCount ?? playersCount}
            </span>
          </button>

          {/* Bet Amount Box */}
          <div className="bg-[#040914] border border-slate-800/80 rounded-xl p-1.5 sm:p-2 flex flex-col items-center justify-center transition-all hover:border-slate-700">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">
              BET
            </span>
            <span className="text-xs sm:text-base font-black text-slate-200 mt-0.5">
              {betAmount}
            </span>
          </div>

          {/* Call Count Box */}
          <div className="bg-[#040914] border border-slate-800/80 rounded-xl p-1.5 sm:p-2 flex flex-col items-center justify-center transition-all hover:border-emerald-500/40">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-400">
              CALL
            </span>
            <span className="text-xs sm:text-base font-black text-emerald-300 mt-0.5">
              {callCount}
            </span>
          </div>
        </div>
      </section>

      {/* 2. SIDE-BY-SIDE MINIMIZED PORTRAIT LAYOUT */}
      <div className="grid grid-cols-12 gap-1.5 sm:gap-3 items-start">
        {/* LEFT CONTAINER: Minimized Master Board (75 Balls) */}
        <div className="col-span-5 bg-[#070e1b] border border-slate-800/90 rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-2xl flex flex-col gap-1.5 sm:gap-2.5 h-full">
          {/* Top Bar: MASTER BOARD (75 BALLS) + 20/75 Badge */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs font-black px-0.5 border-b border-slate-800/80 pb-1.5 sm:pb-2.5">
            <span className="tracking-wider uppercase text-amber-400 font-extrabold text-[10px] sm:text-xs truncate">
              MASTER BOARD
            </span>
            <span className="text-[#00b894] font-black bg-[#0d3326] px-1.5 sm:px-2.5 py-0.5 rounded-full border border-emerald-500/40 text-[9px] sm:text-xs shadow-inner shrink-0">
              {calledNumbersSet.size}/75
            </span>
          </div>

          {/* 5 Vertical Columns (B, I, N, G, O) */}
          <div className="grid grid-cols-5 gap-1 sm:gap-1.5 flex-1">
            {masterColumns.map(col => (
              <div key={col.letter} className="flex flex-col gap-1 items-center">
                {/* Column Header Letter Pill */}
                <div className={`w-full py-0.5 sm:py-1 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs flex items-center justify-center border shadow-sm ${col.headerStyle}`}>
                  {col.letter}
                </div>

                {/* 15 Numbers vertically for this column */}
                <div className="flex flex-col gap-0.5 sm:gap-1 w-full">
                  {Array.from({ length: 15 }, (_, i) => col.min + i).map(num => {
                    const isCalled = calledNumbersSet.has(num);
                    const isLatest = num === latestBallNumber;

                    return (
                      <div
                        key={num}
                        className={`h-5 sm:h-7 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-extrabold flex items-center justify-center transition-all ${
                          isLatest
                            ? 'bg-[#d97706] text-slate-950 font-black border border-amber-300 ring-1 ring-amber-400/50 shadow-md z-10 scale-105'
                            : isCalled
                            ? 'bg-[#00b894] text-slate-950 font-black border border-emerald-300/80 shadow-sm'
                            : 'bg-[#0a1120] text-slate-400 border border-slate-800/80'
                        }`}
                      >
                        {num}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CONTAINER: Minimized Status Banner, Player Cartela & Actions */}
        <div className="col-span-7 flex flex-col gap-1.5 sm:gap-3">
          {/* Game Status Header with Auto-daub Toggle */}
          <div className="bg-[#070e1b] border border-slate-800/90 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-xl flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-black text-[10px] sm:text-xs uppercase tracking-wider text-emerald-400">
                {gameState === 'STARTING'
                  ? 'Starting'
                  : gameState === 'PLAYING'
                  ? isSpectator
                    ? 'Spectating'
                    : 'Running'
                  : 'Ended'}
              </span>
              {gameState === 'STARTING' && typeof startingCountdownSeconds === 'number' && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] sm:text-[10px] font-mono font-black px-1.5 py-0.5 rounded ml-1">
                  {startingCountdownSeconds}s
                </span>
              )}
            </div>

            <button
              onClick={onToggleAutoDaub}
              disabled={isSpectator}
              className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all border ${
                autoDaub
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              } ${isSpectator ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Sparkles className="w-3 h-3" />
              Auto: <span className="font-black">{autoDaub ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Current Call Banner */}
          <div className="bg-[#070e1b] border border-slate-800/90 rounded-xl sm:rounded-2xl p-2.5 shadow-xl flex items-center justify-between gap-2">
            {/* Prominent Floating Current Call Indicator */}
            <div className="flex items-center gap-2.5">
              {currentBall ? (
                <div
                  key={currentBall.number}
                  className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-slate-950 font-black flex flex-col items-center justify-center shadow-lg shadow-orange-500/20 ring-2 ring-amber-300/40"
                >
                  <span className="text-[8px] tracking-widest font-extrabold uppercase leading-none opacity-80">
                    {currentBall.letter}
                  </span>
                  <span className="text-sm sm:text-base font-black leading-none mt-0.5">
                    {currentBall.number}
                  </span>
                </div>
              ) : (
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#030712] border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600">
                  <Disc className="w-4 h-4 animate-spin text-slate-500" />
                </div>
              )}

              <div>
                <div className="text-[9px] sm:text-[10px] font-extrabold text-amber-400 uppercase flex items-center gap-1">
                  <span>{gameState === 'STARTING' ? 'Match Status' : 'Current Call'}</span>
                  {gameState === 'PLAYING' && (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono px-1 rounded ml-1">
                      Next in {(nextBallCountdownMs / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm font-black text-white tracking-tight">
                  {gameState === 'STARTING'
                    ? typeof startingCountdownSeconds === 'number'
                      ? `Starting in ${startingCountdownSeconds}s`
                      : 'Starting...'
                    : currentBall
                    ? `${currentBall.letter}-${currentBall.number}`
                    : 'Waiting...'}
                </div>
              </div>
            </div>

            {/* Recent Calls Row */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-[120px] sm:max-w-full">
              {calledBalls.slice(-3).reverse().map((ball, idx) => (
                <div
                  key={`${ball.number}-${idx}`}
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-black border transition-all ${
                    idx === 0
                      ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                      : 'bg-[#030712] text-slate-300 border-slate-800'
                  }`}
                >
                  {ball.number}
                </div>
              ))}
            </div>
          </div>

          {/* Minimized Player Cartela Container */}
          <div className="bg-[#070e1b] border border-slate-800/90 rounded-2xl sm:rounded-3xl p-2 sm:p-3.5 shadow-2xl flex flex-col items-center gap-2 sm:gap-3">
            {/* Header: #1 Badge, Title "Player Cartela #1", Subtitle, "2 AWAY!" Badge */}
            <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-1.5 sm:pb-2.5 gap-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-[#38260b] text-amber-400 font-black text-[10px] sm:text-xs flex items-center justify-center border border-amber-500/40 shadow-sm shrink-0">
                  #{cartelaNumber}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-xs sm:text-sm text-white truncate">Player Cartela #{cartelaNumber}</h3>
                  <p className="text-[9px] sm:text-[11px] text-slate-400 font-medium truncate">
                    {isSpectator ? 'Preview card for next game' : 'Match lines or corners to win'}
                  </p>
                </div>
              </div>

              {!isSpectator && distanceToWin > 0 && distanceToWin <= 3 && (
                <span className="bg-[#38260b] text-amber-400 text-[9px] sm:text-xs font-black px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-amber-500/40 shadow-sm shrink-0">
                  {distanceToWin} AWAY!
                </span>
              )}
            </div>

            {/* Inner Dark Card Box */}
            <div className="w-full bg-[#030712] border border-slate-800/90 rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5 shadow-2xl flex flex-col gap-1.5">
              {/* Columns Header Pills (B, I, N, G, O) */}
              <div className="grid grid-cols-5 gap-1 text-center font-black text-[10px] sm:text-xs tracking-wider">
                {masterColumns.map(col => (
                  <span key={col.letter} className={`py-0.5 sm:py-1 rounded-md sm:rounded-lg border ${col.headerStyle}`}>
                    {col.letter}
                  </span>
                ))}
              </div>

              {/* 5x5 Cells Grid */}
              <div className="grid grid-cols-5 gap-1 sm:gap-1.5 aspect-square">
                {userCard.cells.map((cellValue, idx) => {
                  const isFreeSpace = idx === 12 || cellValue === 'FREE';
                  const isDaubed = userMarkedIndices[idx] || isFreeSpace;
                  const isWinningCell = winningIndices.includes(idx);

                  return (
                    <button
                      key={idx}
                      disabled={isSpectator || isUserDisconnected}
                      onClick={() => !isSpectator && !isUserDisconnected && onToggleCell(idx)}
                      className={`relative flex flex-col items-center justify-center rounded-lg sm:rounded-xl text-xs sm:text-sm font-black transition-all active:scale-95 border ${
                        isWinningCell
                          ? 'bg-amber-400 text-slate-950 border-amber-200 ring-2 ring-amber-400/50 shadow-lg animate-bounce z-10'
                          : isDaubed
                          ? 'bg-[#00b894] text-slate-950 border-emerald-300/80 shadow-sm scale-95'
                          : 'bg-[#0b1322] hover:bg-slate-800 text-white border-slate-800/80'
                      } ${isUserDisconnected ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      {isFreeSpace ? (
                        <span className="text-amber-300 font-black text-xs sm:text-sm drop-shadow">⭐ *</span>
                      ) : (
                        <span>{cellValue}</span>
                      )}

                      {/* Daub Stamp Icon */}
                      {isDaubed && !isFreeSpace && (
                        <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-slate-950/80 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
                          <Check className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cartela Number Indicator */}
            <div className="bg-[#030712] border border-slate-800 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black text-amber-400 flex items-center gap-1.5 shadow-inner">
              <span>Cartela Number:</span>
              <span className="text-white font-extrabold">{cartelaNumber}</span>
            </div>

            {/* Orange "Bingo" Action Button */}
            {isUserDisconnected ? (
              <button
                disabled
                className="w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-500/50 shadow-lg cursor-not-allowed flex items-center justify-center gap-2"
              >
                ⚠️ Disqualified - False Claim
              </button>
            ) : isSpectator ? (
              <div className="w-full py-3 rounded-xl sm:rounded-2xl font-extrabold text-xs text-slate-400 bg-slate-900 border border-slate-800 text-center uppercase tracking-wider">
                Spectating Live Match
              </div>
            ) : (
              <button
                onClick={onClaimBingo}
                disabled={hasClaimedBingo}
                className={`w-full py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl font-black text-sm sm:text-lg uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xl transition-all transform active:scale-95 border ${
                  hasClaimedBingo
                    ? 'bg-emerald-600 text-white border-emerald-400 opacity-90 cursor-default'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-slate-950 border-amber-300 shadow-orange-500/30 animate-pulse'
                }`}
              >
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950" />
                {hasClaimedBingo ? 'Bingo Claimed!' : 'BINGO!'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. FOOTER CONTROLS */}
      <footer className="flex items-center justify-between gap-3 pt-1">
        {/* Red "Leave Game" Button */}
        <button
          onClick={onLeaveGame}
          className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 text-sm transition-all active:scale-95 border border-rose-400/30"
        >
          <LogOut className="w-4 h-4" />
          Leave Game
        </button>

        {/* Cyan "Refresh" Button */}
        <button
          onClick={handleRefreshClick}
          className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black py-3.5 px-4 rounded-2xl shadow-lg shadow-cyan-400/30 flex items-center justify-center gap-2 text-sm transition-all active:scale-95 border border-cyan-200"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </footer>
    </div>
  );
};
