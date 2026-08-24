import React, { useState } from 'react';
import {
  Trophy,
  Coins,
  ChevronRight,
  Flame,
  Zap,
} from 'lucide-react';
import { sound } from '../utils/soundEffects';

export interface GameRoomTier {
  id: string;
  betAmount: number;
  currency: string;
  possibleWin: number;
  status: 'Waiting';
  themeColor: 'emerald' | 'cyan' | 'blue' | 'indigo' | 'purple' | 'amber' | 'rose';
}

const ROOM_TIERS: GameRoomTier[] = [
  {
    id: 'room-10',
    betAmount: 10,
    currency: 'ETB',
    possibleWin: 1200,
    status: 'Waiting',
    themeColor: 'emerald',
  },
  {
    id: 'room-20',
    betAmount: 20,
    currency: 'ETB',
    possibleWin: 2400,
    status: 'Waiting',
    themeColor: 'cyan',
  },
  {
    id: 'room-50',
    betAmount: 50,
    currency: 'ETB',
    possibleWin: 6000,
    status: 'Waiting',
    themeColor: 'blue',
  },
  {
    id: 'room-80',
    betAmount: 80,
    currency: 'ETB',
    possibleWin: 9600,
    status: 'Waiting',
    themeColor: 'indigo',
  },
  {
    id: 'room-100',
    betAmount: 100,
    currency: 'ETB',
    possibleWin: 12000,
    status: 'Waiting',
    themeColor: 'purple',
  },
  {
    id: 'room-150',
    betAmount: 150,
    currency: 'ETB',
    possibleWin: 18000,
    status: 'Waiting',
    themeColor: 'amber',
  },
  {
    id: 'room-300',
    betAmount: 300,
    currency: 'ETB',
    possibleWin: 36000,
    status: 'Waiting',
    themeColor: 'rose',
  },
];

interface GameLobbyProps {
  onEnterCardSelection: () => void;
  onJoinRoom?: (room: GameRoomTier) => void;
  userStars?: number;
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  onEnterCardSelection,
  onJoinRoom,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'LOW' | 'HIGH' | 'VIP'>('ALL');

  const filteredRooms = ROOM_TIERS.filter(room => {
    if (selectedFilter === 'LOW') return room.betAmount <= 50;
    if (selectedFilter === 'HIGH') return room.betAmount > 50 && room.betAmount <= 100;
    if (selectedFilter === 'VIP') return room.betAmount >= 150;
    return true;
  });

  const handleJoinClick = (room: GameRoomTier) => {
    sound.playPop();
    if (onJoinRoom) {
      onJoinRoom(room);
    } else {
      onEnterCardSelection();
    }
  };

  const getThemeStyles = (theme: GameRoomTier['themeColor']) => {
    switch (theme) {
      case 'emerald':
        return {
          border: 'border-emerald-500/30 hover:border-emerald-400/60',
          gradient: 'from-emerald-500/10 via-slate-900 to-slate-900',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          barGradient: 'from-emerald-500 via-teal-400 to-emerald-300',
          buttonGlow: 'hover:shadow-emerald-500/20',
        };
      case 'cyan':
        return {
          border: 'border-cyan-500/30 hover:border-cyan-400/60',
          gradient: 'from-cyan-500/10 via-slate-900 to-slate-900',
          badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          barGradient: 'from-cyan-500 via-sky-400 to-teal-300',
          buttonGlow: 'hover:shadow-cyan-500/20',
        };
      case 'blue':
        return {
          border: 'border-blue-500/30 hover:border-blue-400/60',
          gradient: 'from-blue-500/10 via-slate-900 to-slate-900',
          badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          barGradient: 'from-blue-500 via-indigo-400 to-cyan-300',
          buttonGlow: 'hover:shadow-blue-500/20',
        };
      case 'indigo':
        return {
          border: 'border-indigo-500/30 hover:border-indigo-400/60',
          gradient: 'from-indigo-500/10 via-slate-900 to-slate-900',
          badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          barGradient: 'from-indigo-500 via-purple-400 to-pink-300',
          buttonGlow: 'hover:shadow-indigo-500/20',
        };
      case 'purple':
        return {
          border: 'border-purple-500/30 hover:border-purple-400/60',
          gradient: 'from-purple-500/10 via-slate-900 to-slate-900',
          badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          barGradient: 'from-purple-500 via-pink-500 to-amber-300',
          buttonGlow: 'hover:shadow-purple-500/20',
        };
      case 'amber':
        return {
          border: 'border-amber-500/30 hover:border-amber-400/60',
          gradient: 'from-amber-500/10 via-slate-900 to-slate-900',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          barGradient: 'from-amber-500 via-yellow-400 to-orange-400',
          buttonGlow: 'hover:shadow-amber-500/20',
        };
      case 'rose':
      default:
        return {
          border: 'border-rose-500/30 hover:border-rose-400/60',
          gradient: 'from-rose-500/10 via-slate-900 to-slate-900',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          barGradient: 'from-rose-500 via-red-500 to-amber-300',
          buttonGlow: 'hover:shadow-rose-500/20',
        };
    }
  };

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6 select-none animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-4 sm:p-5 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Game Lobby
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Select a room by bet amount to participate.
          </p>
        </div>

        {/* Navigation to Card Selection */}
        <div className="flex items-center z-10">
          <button
            onClick={onEnterCardSelection}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            Card Selection
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              sound.playPop();
              setSelectedFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              selectedFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Rooms
          </button>
          <button
            onClick={() => {
              sound.playPop();
              setSelectedFilter('LOW');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              selectedFilter === 'LOW'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            10 - 50 ETB
          </button>
          <button
            onClick={() => {
              sound.playPop();
              setSelectedFilter('HIGH');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              selectedFilter === 'HIGH'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            80 - 100 ETB
          </button>
          <button
            onClick={() => {
              sound.playPop();
              setSelectedFilter('VIP');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              selectedFilter === 'VIP'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            150 - 300 ETB
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/80">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>Currency: <strong className="text-white">ETB</strong></span>
        </div>
      </div>

      {/* Game Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {filteredRooms.map(room => {
          const styles = getThemeStyles(room.themeColor);

          return (
            <div
              key={room.id}
              className={`bg-gradient-to-b ${styles.gradient} border ${styles.border} rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden`}
            >
              {/* Card Header: Bet Amount & Status */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className={`px-3 py-1 rounded-2xl font-black text-sm sm:text-base ${styles.badgeBg} flex items-center gap-1.5 shadow-sm`}>
                  <Coins className="w-4 h-4" />
                  <span>{room.betAmount} {room.currency}</span>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  {room.status}
                </span>
              </div>

              {/* Card Body: Possible Win & Jackpot Meter */}
              <div className="space-y-3">
                {/* Possible Win */}
                <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                      <Trophy className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Possible Win
                      </span>
                      <div className="text-base sm:text-lg font-black text-amber-300 leading-tight">
                        {room.possibleWin.toLocaleString()} {room.currency}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Jackpot Progress Bar */}
                <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      Jackpot Progress
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-2 p-0.5 border border-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${styles.barGradient}`}
                      style={{ width: '0%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer: Join Button */}
              <div>
                <button
                  type="button"
                  onClick={() => handleJoinClick(room)}
                  className={`w-full py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-lg ${styles.buttonGlow} flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer`}
                >
                  <Zap className="w-4 h-4 fill-white" />
                  Join Room
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};
