import React, { useState } from 'react';
import { PRESET_CARDS } from '../data/cardsData';
import { BingoCard } from '../types';
import { Search, Shuffle, Check, Play, Trophy, Users } from 'lucide-react';

interface CardPickerModalProps {
  isOpen: boolean;
  onSelectCard: (cardId: number) => void;
  selectedCardId: number;
}

export const CardPickerModal: React.FC<CardPickerModalProps> = ({
  isOpen,
  onSelectCard,
  selectedCardId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [previewCardId, setPreviewCardId] = useState<number>(selectedCardId);

  if (!isOpen) return null;

  const filteredCards = PRESET_CARDS.filter(c =>
    c.id.toString().includes(searchTerm)
  );

  const previewCard = PRESET_CARDS.find(c => c.id === previewCardId) || PRESET_CARDS[0];

  const handleRandomize = () => {
    const randomId = Math.floor(Math.random() * 150) + 1;
    setPreviewCardId(randomId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Select Your Bingo Card (150 Cards Available)
            </h2>
            <p className="text-xs text-slate-400">
              Each card has a unique 75-ball matrix generated from preset data
            </p>
          </div>

          <button
            onClick={handleRandomize}
            className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-500/30 transition-all active:scale-95"
          >
            <Shuffle className="w-3.5 h-3.5" /> Random
          </button>
        </div>

        {/* Content Body: Grid of numbers on left, Preview on right */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
          {/* Left Column: List/Search of Card #1 to #150 */}
          <div className="p-3 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col gap-2 overflow-hidden">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search card # (1 - 150)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-5 gap-1.5 p-1 max-h-[220px] md:max-h-full">
              {filteredCards.map(card => {
                const isSelected = previewCardId === card.id;

                return (
                  <button
                    key={card.id}
                    onClick={() => setPreviewCardId(card.id)}
                    className={`py-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-400/50 shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    #{card.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Card Preview */}
          <div className="p-4 flex flex-col items-center justify-between bg-slate-950/50 overflow-y-auto">
            <div className="w-full max-w-[260px] flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs font-bold text-slate-300">
                  Preview Card #{previewCard.id}
                </span>
                <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Ready to Play
                </span>
              </div>

              {/* 5x5 Mini Grid */}
              <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 shadow-xl">
                <div className="grid grid-cols-5 gap-1 mb-1 text-center font-black text-xs text-amber-400">
                  <span>B</span><span>I</span><span>N</span><span>G</span><span>O</span>
                </div>
                <div className="grid grid-cols-5 gap-1 aspect-square">
                  {previewCard.cells.map((val, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-center rounded text-[11px] font-extrabold ${
                        idx === 12 || val === 'FREE'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-200 border border-slate-700/50'
                      }`}
                    >
                      {val === 'FREE' ? '⭐' : val}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full mt-4 flex flex-col gap-2">
              <button
                onClick={() => onSelectCard(previewCardId)}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" />
                Select Card #{previewCardId} & Play
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
