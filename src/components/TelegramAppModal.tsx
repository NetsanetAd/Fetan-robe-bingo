import React, { useState } from 'react';
import { Send, CheckCircle, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

interface TelegramAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStars: number;
  onAddStars: (amount: number) => void;
}

export const TelegramAppModal: React.FC<TelegramAppModalProps> = ({
  isOpen,
  onClose,
  userStars,
  onAddStars,
}) => {
  const [activeTab, setActiveTab] = useState<'PAYMENT' | 'BOT_COMMANDS' | 'INLINE_SHARE'>('PAYMENT');
  const [copiedLink, setCopiedLink] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = (stars: number) => {
    onAddStars(stars);
    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
    }, 3000);
  };

  const handleCopyInlineLink = () => {
    navigator.clipboard.writeText('https://t.me/Bingo75Bot/game?startapp=card_42');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Telegram Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Telegram Integration & Bot API</h3>
              <p className="text-[11px] text-blue-100">Telegram Stars • Inline Keyboards • Mini App</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 bg-slate-950 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('PAYMENT')}
            className={`flex-1 py-2.5 px-3 border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'PAYMENT'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ⭐ Telegram Stars
          </button>
          <button
            onClick={() => setActiveTab('BOT_COMMANDS')}
            className={`flex-1 py-2.5 px-3 border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'BOT_COMMANDS'
                ? 'border-blue-400 text-blue-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🤖 Bot Inline Keyboard
          </button>
          <button
            onClick={() => setActiveTab('INLINE_SHARE')}
            className={`flex-1 py-2.5 px-3 border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'INLINE_SHARE'
                ? 'border-indigo-400 text-indigo-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📲 Invite Friends
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 space-y-4 max-h-[65vh] overflow-y-auto">
          {activeTab === 'PAYMENT' && (
            <div className="space-y-4 text-xs">
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 font-medium">Your Stars Balance:</span>
                  <div className="text-xl font-black text-amber-300 flex items-center gap-1">
                    {userStars} ⭐
                  </div>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-bold border border-amber-500/30">
                  Telegram Bot Payments API
                </span>
              </div>

              {paymentSuccess && (
                <div className="bg-emerald-950/60 border border-emerald-500/50 p-2.5 rounded-xl text-emerald-300 flex items-center gap-2 font-bold animate-bounce-short">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Telegram Stars Invoice Paid Successfully!
                </div>
              )}

              <p className="text-slate-300 leading-relaxed">
                In a production Telegram Mini App, entry tickets are purchased via Telegram Stars using
                <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded ml-1">
                  Telegram.WebApp.openInvoice()
                </code>. Select a test bundle below:
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { stars: 50, price: '$0.99', popular: false },
                  { stars: 250, price: '$4.99', popular: true },
                  { stars: 1000, price: '$18.99', popular: false },
                ].map((pack, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSimulatePayment(pack.stars)}
                    className="relative bg-slate-950 border border-slate-800 hover:border-amber-500/60 rounded-xl p-3 flex flex-col items-center justify-between transition-all transform active:scale-95 group"
                  >
                    {pack.popular && (
                      <span className="absolute -top-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full uppercase">
                        Best Value
                      </span>
                    )}
                    <span className="text-lg font-black text-amber-300 group-hover:scale-110 transition-transform">
                      {pack.stars} ⭐
                    </span>
                    <span className="text-slate-400 text-[11px] font-semibold mt-1">
                      {pack.price}
                    </span>
                    <span className="mt-2 bg-amber-500/10 text-amber-300 group-hover:bg-amber-500 group-hover:text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] transition-colors w-full text-center">
                      Buy Now
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'BOT_COMMANDS' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Interactive inline buttons sent by <code className="text-blue-300">@Bingo75Bot</code> in Telegram chats:
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                    🤖
                  </div>
                  <div>
                    <span className="font-bold text-white">Bingo 75 Bot</span>
                    <span className="text-[10px] text-slate-500 ml-2">bot</span>
                  </div>
                </div>

                <p className="text-slate-300 text-[11px]">
                  🎉 <strong>75-Ball Bingo Room #104 is LIVE!</strong><br />
                  150/150 players joined • Prize Pool: 1,500 ⭐
                </p>

                {/* Simulated Telegram Inline Keyboard */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button className="bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 py-1.5 px-2 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3" /> Quick Join Game
                  </button>
                  <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 px-2 rounded-lg font-semibold text-[11px]">
                    🎟️ Pick My Card
                  </button>
                  <button className="col-span-2 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 py-1.5 px-2 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1">
                    🏆 View Global Leaderboard
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'INLINE_SHARE' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Share this 75-ball game directly with friends or Telegram groups using inline queries:
              </p>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <code className="text-indigo-300 text-[11px] truncate mr-2">
                  t.me/Bingo75Bot/game?startapp=card_42
                </code>
                <button
                  onClick={handleCopyInlineLink}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1"
                >
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </button>
              </div>

              <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl flex items-start gap-2 text-indigo-200">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  Uses <code className="text-white">Telegram.WebApp.switchInlineQuery()</code> to prompt user to choose a chat and challenge 149 other players.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-1.5 rounded-xl text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
