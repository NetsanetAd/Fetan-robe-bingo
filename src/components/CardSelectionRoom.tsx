import React, { useState, useRef, useEffect } from 'react';
import { PRESET_CARDS, getCardById } from '../data/cardsData';
import { Search, Shuffle, ArrowLeft, Sparkles, Trophy, Lock, Minimize2, Maximize2, Coins, CheckCircle, Check } from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { GameRoomTier } from './GameLobby';

interface CardSelectionRoomProps {
  selectedCardId: number | null;
  onSelectCard: (cardId: number) => void;
  onConfirmCard: (cardId: number) => void;
  onConfirmAndJoin?: (cardId: number) => void;
  onBackToLobby: () => void;
  isCardConfirmed?: boolean;
  userStars: number;
  occupiedCardsMap?: Record<number, string>; // cardId -> playerName
  fillWithBots?: boolean;
  onToggleFillWithBots?: (fill: boolean) => void;
  selectedRoom?: GameRoomTier | null;
  selectedBetAmount?: number;
}

export const CardSelectionRoom: React.FC<CardSelectionRoomProps> = ({
  selectedCardId,
  onSelectCard,
  onConfirmCard,
  onConfirmAndJoin,
  onBackToLobby,
  isCardConfirmed = false,
  userStars,
  occupiedCardsMap = {},
  fillWithBots = false,
  onToggleFillWithBots,
  selectedRoom,
  selectedBetAmount,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [lockedToast, setLockedToast] = useState<string | null>(null);
  const [isGridMinimized, setIsGridMinimized] = useState(false);
  const cardGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isGridMinimized && cardGridRef.current) {
      cardGridRef.current.scrollTop = 0;
    }
  }, [isGridMinimized, searchTerm]);

  const filteredCards = PRESET_CARDS.filter(c =>
    c.id.toString().includes(searchTerm)
  );

  const previewCard = selectedCardId !== null ? getCardById(selectedCardId) : null;

  // Available cards that are NOT occupied by other players
  const availableCardIds = PRESET_CARDS.map(c => c.id).filter(id => {
    const occupant = occupiedCardsMap[id];
    return !occupant || occupant === 'YOU' || occupant === 'You (Telegram User)';
  });

  const handleRandomize = () => {
    sound.playPop();
    if (availableCardIds.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCardIds.length);
      onSelectCard(availableCardIds[randomIndex]);
    } else {
      const randomId = Math.floor(Math.random() * 150) + 1;
      onSelectCard(randomId);
    }
  };

  const handleCardClick = (cardId: number) => {
    const occupant = occupiedCardsMap[cardId];
    const isOccupiedByOther =
      occupant && occupant !== 'YOU' && occupant !== 'You (Telegram User)';

    if (isOccupiedByOther) {
      sound.playError();
      setLockedToast(`Card #${cardId} is LOCKED and taken by ${occupant}! Please pick an available card.`);
      setTimeout(() => setLockedToast(null), 3000);
      return;
    }

    sound.playPop();
    onSelectCard(cardId);
  };

  const handleConfirm = () => {
    if (selectedCardId !== null) {
      sound.playPop();
      if (onConfirmAndJoin) {
        onConfirmAndJoin(selectedCardId);
      } else {
        onConfirmCard(selectedCardId);
      }
    }
  };

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-3 py-2 sm:py-3 flex flex-col gap-2.5 sm:gap-3 select-none animate-fade-in">
      {/* Top Navigation & Status Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2.5 sm:p-3 rounded-2xl shadow-xl">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 font-bold text-xs px-2.5 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-2">
          {selectedRoom ? (
            <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span>Room: {selectedRoom.betAmount} {selectedRoom.currency}</span>
            </div>
          ) : selectedBetAmount ? (
            <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span>Room: {selectedBetAmount} ETB</span>
            </div>
          ) : null}

          {selectedCardId !== null ? (
            <div className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
              isCardConfirmed
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-950 border-slate-800 text-amber-400'
            }`}>
              <Trophy className="w-3.5 h-3.5" />
              <span>{isCardConfirmed ? `Card #${selectedCardId} Reserved` : `Card #${selectedCardId} Selected`}</span>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400">
              <span>No Card Selected</span>
            </div>
          )}

          <div className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1.5 rounded-xl text-xs font-extrabold">
            {userStars} ⭐ Stars
          </div>
        </div>
      </div>

      {/* Main Room Banner */}
      <div className="text-center space-y-0.5 my-0.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[11px] border border-amber-500/20">
          <Sparkles className="w-3 h-3" /> Card Selection Room (150 Preset Cards)
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Pick Your Unique Cartela Card
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-400 max-w-md mx-auto">
          Each card is strictly 1-of-1. Select your card and confirm reservation.
        </p>
      </div>

      {/* Toast Warning for Locked Cards */}
      {lockedToast && (
        <div className="bg-rose-500/20 border border-rose-500/50 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-bold text-center shadow-lg animate-bounce">
          {lockedToast}
        </div>
      )}

      {/* Main Content Layout: Grid of 150 Cards + Selected Card Preview Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Left Column: 150 Cards Grid Selector */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl flex flex-col gap-2">
          <div className="flex items-center justify-between gap-1.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search card # (1-150)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-2.5 py-1.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleRandomize}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1.5 rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" /> Random
            </button>

            <button
              onClick={() => setIsGridMinimized(!isGridMinimized)}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1.5 rounded-xl text-xs font-bold border border-slate-700/80 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              title={isGridMinimized ? "Expand card matrix window" : "Minimize card matrix window"}
            >
              {isGridMinimized ? (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Expand Grid</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Minimize</span>
                </>
              )}
            </button>
          </div>

          {/* Minimized Banner State */}
          {isGridMinimized ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs font-bold text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-300">150-Card Grid Minimized</span>
                {selectedCardId !== null && (
                  <span className="text-emerald-400 font-extrabold">(Card #{selectedCardId} Selected)</span>
                )}
              </div>
              <button
                onClick={() => setIsGridMinimized(false)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
              >
                Show Grid
              </button>
            </div>
          ) : (
            <>
              {/* Legend & Scroll Info */}
              <div className="flex items-center justify-between text-[10px] font-bold px-1 text-slate-400 border-b border-slate-800 pb-1.5">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Selected
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-slate-800 inline-block" /> Available
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Lock className="w-2.5 h-2.5 text-slate-500" /> Locked
                </span>
              </div>

              {/* 150 Card Selector Matrix - Compact Scrollable Height (160px-180px max) */}
              <div
                ref={cardGridRef}
                className="bg-slate-950 border border-slate-800 rounded-xl p-2 max-h-[160px] sm:max-h-[180px] overflow-y-auto scroll-smooth touch-pan-y shadow-inner scrollbar-thin scrollbar-thumb-slate-700"
              >
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 sm:gap-1.5">
                  {filteredCards.map(card => {
                    const isSelected = selectedCardId === card.id;
                    const occupant = occupiedCardsMap[card.id];
                    const isOccupiedByOther =
                      occupant && occupant !== 'YOU' && occupant !== 'You (Telegram User)';

                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => handleCardClick(card.id)}
                        title={
                          isOccupiedByOther
                            ? `Locked by ${occupant}`
                            : isSelected
                            ? 'Your Selected Card'
                            : 'Click to select'
                        }
                        className={`relative py-1.5 rounded-lg text-[11px] font-black transition-all flex flex-col items-center justify-center border active:scale-95 min-h-[34px] cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-300 ring-2 ring-emerald-400 shadow-md scale-105 z-10'
                            : isOccupiedByOther
                            ? 'bg-slate-950/80 text-slate-600 border-slate-900 cursor-not-allowed opacity-60'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-indigo-500 hover:text-white'
                        }`}
                      >
                        <span>#{card.id}</span>
                        {isOccupiedByOther && (
                          <Lock className="w-2 h-2 text-slate-500 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Selected Card Preview & Confirm Action */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col items-center gap-2.5 sm:gap-3">
          {previewCard ? (
            <>
              <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 font-black text-sm flex items-center justify-center border border-amber-500/40">
                    #{previewCard.id}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-white">Cartela #{previewCard.id}</h3>
                    <p className="text-[10px] text-emerald-400 font-semibold">
                      {isCardConfirmed ? 'Card Reserved Locally' : 'Ready to Confirm'}
                    </p>
                  </div>
                </div>

                <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                  isCardConfirmed
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {isCardConfirmed ? 'Reserved For You' : 'Selected'}
                </span>
              </div>

              {/* 5x5 Card Matrix Preview */}
              <div className="w-full max-w-[240px] sm:max-w-[260px] bg-slate-950 border border-slate-800 rounded-xl p-2.5 shadow-md">
                <div className="grid grid-cols-5 gap-1 mb-1 text-center font-black text-xs text-amber-400">
                  <span>B</span><span>I</span><span>N</span><span>G</span><span>O</span>
                </div>
                <div className="grid grid-cols-5 gap-1 aspect-square">
                  {previewCard.cells.map((val, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-center rounded-lg text-xs font-black transition-all ${
                        idx === 12 || val === 'FREE'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800/90 text-slate-100 border border-slate-700/60'
                      }`}
                    >
                      {val === 'FREE' ? '⭐' : val}
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm & Join Button */}
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 text-slate-950" />
                Confirm & Join
              </button>
            </>
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center gap-3 text-center text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">No Card Selected</p>
                <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto mt-0.5">
                  Select any card from the grid to preview and confirm reservation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
