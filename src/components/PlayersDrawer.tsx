import React, { useState } from 'react';
import { Player } from '../types';
import { Users, Search, Award, Bot, User as UserIcon } from 'lucide-react';

interface PlayersDrawerProps {
  players: Player[];
  isOpen: boolean;
  onClose: () => void;
  userCardId: number;
  onSimulateJoin?: () => void;
}

export const PlayersDrawer: React.FC<PlayersDrawerProps> = ({
  players,
  isOpen,
  onClose,
  userCardId,
  onSimulateJoin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'CONNECTED' | 'DISCONNECTED' | 'WINNERS'>('ALL');

  if (!isOpen) return null;

  const activeConnectedCount = players.filter(p => !p.isDisconnected).length;
  const disconnectedCount = players.filter(p => p.isDisconnected).length;
  const winnersCount = players.filter(p => p.claimedBingo).length;

  const filteredPlayers = players.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cardId.toString().includes(searchTerm);

    if (!matchesSearch) return false;
    if (filter === 'CONNECTED') return !p.isDisconnected;
    if (filter === 'DISCONNECTED') return p.isDisconnected;
    if (filter === 'WINNERS') return p.claimedBingo;
    return true;
  });

  return (
    <div id="players-drawer-overlay" className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div id="players-drawer-content" className="w-full max-w-md bg-slate-900 h-full border-l border-slate-800 flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                Live Room Participants
              </h2>
              <p className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {activeConnectedCount} / {players.length} Active Sessions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 text-xs font-bold px-2.5"
          >
            ✕ Close
          </button>
        </div>

        {/* Stats bar */}
        <div className="bg-slate-950/60 px-4 py-2 flex items-center justify-between border-b border-slate-800 text-xs text-slate-300">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Award className="w-4 h-4" />
            {winnersCount} Winners
          </span>
          <span className="text-rose-400 font-semibold">
            {disconnectedCount} Disqualified
          </span>
          <span className="text-slate-400 font-medium">Card #{userCardId}</span>
        </div>

        {/* Search & Filter & Actions */}
        <div className="p-3 border-b border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search name or Card #..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {onSimulateJoin && (
              <button
                onClick={onSimulateJoin}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black px-2.5 py-1.5 rounded-xl border border-indigo-400 transition-all shrink-0"
                title="Simulate a new player joining the matchroom"
              >
                + Simulate Join
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(['ALL', 'CONNECTED', 'DISCONNECTED', 'WINNERS'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all shrink-0 ${
                  filter === f
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {f === 'ALL' ? `All (${players.length})` : f === 'CONNECTED' ? `Connected (${activeConnectedCount})` : f === 'DISCONNECTED' ? `Disqualified (${disconnectedCount})` : `Winners (${winnersCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Players List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredPlayers.map(p => (
            <div
              key={p.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                p.isDisconnected
                  ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                  : p.isUser
                  ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-100'
                  : p.claimedBingo
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-950/50 border-slate-800/80 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                      p.isDisconnected
                        ? 'bg-rose-700'
                        : p.isUser
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
                        : p.avatar
                    }`}
                  >
                    {p.isUser ? <UserIcon className="w-4 h-4" /> : p.name.charAt(0)}
                  </div>
                  {/* Status Indicator Dot */}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                      p.isDisconnected ? 'bg-rose-500' : 'bg-emerald-400 ring-1 ring-emerald-400/50'
                    }`}
                  />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white leading-none">
                      {p.name}
                    </span>
                    {p.isUser && (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-extrabold border border-indigo-500/30">
                        YOU
                      </span>
                    )}
                    {p.isBot && <Bot className="w-3 h-3 text-slate-500" />}
                  </div>
                  <span className="text-[10px] text-slate-400">{p.username}</span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[11px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  Card #{p.cardId}
                </span>
                {p.isDisconnected ? (
                  <span className="text-[10px] font-extrabold text-rose-400 mt-0.5 flex items-center gap-1">
                    🚫 Disqualified
                  </span>
                ) : p.claimedBingo ? (
                  <span className="text-[10px] font-extrabold text-emerald-400 mt-0.5 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Winner #{p.rank}
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                    🟢 Connected
                  </span>
                )}
              </div>
            </div>
          ))}

          {filteredPlayers.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              No participants found matching &quot;{searchTerm}&quot;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
