import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CalledBall, WinPattern, Player, GameState } from './types';
import { PRESET_CARDS, getCardById } from './data/cardsData';
import { checkBingoWin, getDistanceToWin, getBallLetter, createShuffledDeck } from './utils/bingoChecker';
import { sound } from './utils/soundEffects';
import { generate150Players, createNewParticipant } from './utils/telegramBots';
import { PlayersDrawer } from './components/PlayersDrawer';
import { TelegramAppModal } from './components/TelegramAppModal';
import { CardPickerModal } from './components/CardPickerModal';
import { CardSelectionRoom } from './components/CardSelectionRoom';
import { MatchCountdownView } from './components/MatchCountdownView';
import { GameLobby, GameRoomTier } from './components/GameLobby';
import { ActiveGameplayView } from './components/ActiveGameplayView';
import { WinnerAnnouncementModal } from './components/WinnerAnnouncementModal';
import { FalseBingoPenaltyModal } from './components/FalseBingoPenaltyModal';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Send,
  Grid,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // Game Setup & State
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [selectedRoom, setSelectedRoom] = useState<GameRoomTier | null>(null);
  const [selectedBetAmount, setSelectedBetAmount] = useState<number>(10);
  const [gamesCount, setGamesCount] = useState<number>(1);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [isCardConfirmed, setIsCardConfirmed] = useState<boolean>(false);
  const [pattern, setPattern] = useState<WinPattern>('ANY_LINE_OR_CORNERS');
  const [callSpeed, setCallSpeed] = useState<number>(3000); // 3 sec per ball default
  const [autoDaub, setAutoDaub] = useState<boolean>(true);
  const [fillWithBots, setFillWithBots] = useState<boolean>(false); // Matchroom mode (150 bots vs solo mode)

  // Spectator Mode
  const [isSpectator, setIsSpectator] = useState<boolean>(false);

  // Ball Calling State & Refs
  const deckRef = useRef<number[]>([]);
  const countdownStartTimeRef = useRef<number | null>(null);
  const localCountdownStartRef = useRef<number | null>(null);
  const serverTimeOffsetRef = useRef<number>(0);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(30);
  const [nextBallCountdownMs, setNextBallCountdownMs] = useState<number>(0);
  const lastBallNumberRef = React.useRef<number | null>(null);

  // Audio settings
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [speechOn, setSpeechOn] = useState<boolean>(true);

  // Unique local player ID for multi-client room identification
  const [myUserId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
        if (tgUser?.id) return `tg_${tgUser.id}`;
        const stored = localStorage.getItem('fetan_bingo_uid');
        if (stored) return stored;
        const newId = `user_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('fetan_bingo_uid', newId);
        return newId;
      } catch {}
    }
    return `user_${Math.random().toString(36).substring(2, 9)}`;
  });

  const [myUserName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
        if (tgUser?.first_name) return `${tgUser.first_name} ${tgUser.last_name || ''}`.trim();
      } catch {}
    }
    return 'You (Telegram User)';
  });

  // Initialize Telegram Mini App SDK and unlock mobile audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Audio unlock on user touch/click for mobile webviews (iOS/Android Telegram)
      const handleFirstInteraction = () => {
        try {
          sound.playPop();
        } catch {}
      };
      window.addEventListener('touchstart', handleFirstInteraction, { once: true, passive: true });
      window.addEventListener('click', handleFirstInteraction, { once: true, passive: true });

      if ((window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp;
        try {
          tg.ready();
          tg.expand();
          if (tg.enableClosingConfirmation) tg.enableClosingConfirmation();
        } catch (err) {
          console.log('Telegram WebApp SDK init:', err);
        }
      }
    }
  }, []);

  // Balls draw pool
  const [calledBalls, setCalledBalls] = useState<CalledBall[]>([]);
  const [currentBall, setCurrentBall] = useState<CalledBall | null>(null);

  // Participants (150 Total)
  const [players, setPlayers] = useState<Player[]>([]);
  const [winners, setWinners] = useState<Player[]>([]);

  // Winner Modal state
  const [winnerAnnouncement, setWinnerAnnouncement] = useState<{
    winner: Player;
    patternName: string;
    prizeStars: number;
  } | null>(null);

  // False Bingo Penalty Modal state
  const [falseBingoPenalty, setFalseBingoPenalty] = useState<{
    show: boolean;
    reason: string;
  }>({ show: false, reason: '' });

  // Modals & Drawers
  const [isPlayersOpen, setIsPlayersOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isCardPickerOpen, setIsCardPickerOpen] = useState(false);

  // User Stars Balance
  const [userStars, setUserStars] = useState<number>(100);

  // Sync Audio Settings
  useEffect(() => {
    sound.soundEnabled = soundOn;
    sound.speechEnabled = speechOn;
  }, [soundOn, speechOn]);

  const occupiedCardsMap = useMemo(() => {
    const map: Record<number, string> = {};
    players.forEach(p => {
      map[p.cardId] = p.isUser ? 'YOU' : p.name;
    });
    return map;
  }, [players]);

  // Active Connected Players Count
  const activePlayersCount = useMemo(() => {
    return players.filter(p => !p.isDisconnected && p.status === 'CONNECTED').length;
  }, [players]);

  // Handle Dynamic New Player Join (Manual or Simulated)
  const handleSimulateJoin = () => {
    const assignedIds = players.map(p => p.cardId);
    const newParticipant = createNewParticipant(undefined, undefined, assignedIds);
    setPlayers(prev => [...prev, newParticipant]);
    sound.playPop();
  };

  // Start Live Match Playing State (Running)
  const startLiveMatchPlay = (overridePlayers?: Player[]) => {
    deckRef.current = createShuffledDeck();
    setCalledBalls([]);
    setCurrentBall(null);
    setWinners([]);
    setWinnerAnnouncement(null);
    lastBallNumberRef.current = null;
    setCountdownSeconds(0);
    setNextBallCountdownMs(callSpeed);

    const currentPlayers = overridePlayers || players;
    const userPlayer = currentPlayers.find(p => p.isUser) || {
      id: myUserId,
      name: myUserName,
      username: '@bingo_champion',
      avatar: '🎮',
      cardId: selectedCardId || 1,
      markedIndices: Array(25).fill(false),
      isUser: true,
      isBot: false,
      botSpeedMultiplier: 1.0,
      claimedBingo: false,
      starsPaid: selectedBetAmount || 10,
      status: 'CONNECTED' as const,
      joinedAt: Date.now(),
    };

    if (currentPlayers.length === 0) {
      const initialPlayers: Player[] = fillWithBots
        ? generate150Players(selectedCardId || 1, myUserName)
        : [userPlayer];
      setPlayers(initialPlayers);
    }

    setGameState('PLAYING');
    sound.playBingo();
  };

  // Start Room & Synchronized Countdown
  const handleStartGame = (cardIdToUse?: number) => {
    const cardId = cardIdToUse || selectedCardId || 1;
    setSelectedCardId(cardId);
    setIsCardConfirmed(true);

    // Complete reset of round state and timer refs
    deckRef.current = [];
    countdownStartTimeRef.current = null;
    localCountdownStartRef.current = Date.now();
    setCountdownSeconds(30);
    setCalledBalls([]);
    setCurrentBall(null);
    setWinners([]);
    setWinnerAnnouncement(null);
    lastBallNumberRef.current = null;

    const userPlayer: Player = {
      id: myUserId,
      name: myUserName,
      username: '@bingo_champion',
      avatar: '🎮',
      cardId: cardId,
      markedIndices: Array(25).fill(false),
      isUser: true,
      isBot: false,
      botSpeedMultiplier: 1.0,
      claimedBingo: false,
      starsPaid: selectedBetAmount || 10,
      status: 'CONNECTED',
      joinedAt: Date.now(),
    };

    setPlayers([userPlayer]);
    setIsSpectator(false);
    setFalseBingoPenalty({ show: false, reason: '' });
    setGameState('STARTING');
    sound.playPop();

    // Trigger or join the official server countdown start time
    fetch('/api/game/countdown/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: 'main_room',
        durationSec: 30,
        player: userPlayer,
        forceNew: false,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (typeof data.serverTime === 'number') {
            serverTimeOffsetRef.current = data.serverTime - Date.now();
          }
          if (typeof data.countdownStartTime === 'number') {
            countdownStartTimeRef.current = data.countdownStartTime;
          }
          if (typeof data.countdownSeconds === 'number') {
            setCountdownSeconds(data.countdownSeconds);
          }
          // Joining an already-running match must enter PLAYING immediately;
          // never start a second local 30-second countdown.
          if (data.gameState === 'PLAYING' || data.gameState === 'ENDED') {
            setGameState(data.gameState);
          } else if (data.gameState === 'STARTING') {
            setGameState('STARTING');
          }
        }
      })
      .catch(err => console.warn('Countdown start fetch error:', err));
  };

  // Shared Room Countdown Synchronizer: Poll server for countdown start & remaining time
  useEffect(() => {
    if (gameState !== 'LOBBY' && gameState !== 'STARTING' && gameState !== 'COUNTDOWN') return;

    let isSubscribed = true;

    const syncCountdownState = async () => {
      try {
        const res = await fetch(`/api/game/countdown?roomId=main_room&t=${Date.now()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!isSubscribed || !data) return;

        if (typeof data.serverTime === 'number') {
          serverTimeOffsetRef.current = data.serverTime - Date.now();
        }

        if (data.gameState === 'STARTING' && typeof data.countdownStartTime === 'number') {
          countdownStartTimeRef.current = data.countdownStartTime;
          const nowOnServer = Date.now() + serverTimeOffsetRef.current;
          const targetEnd = data.countdownStartTime + (data.countdownDurationSec || 30) * 1000;
          const remainingMs = Math.max(0, targetEnd - nowOnServer);
          const remainingSec = Math.ceil(remainingMs / 1000);

          setCountdownSeconds(remainingSec);
          if (gameState === 'LOBBY') {
            setGameState('STARTING');
          }
        }
      } catch (err) {
        console.warn('Countdown sync error:', err);
      }
    };

    syncCountdownState();
    const interval = setInterval(syncCountdownState, 800);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [gameState]);

  // Synchronized 30-Second Countdown Timer: Calculated from official start time
  useEffect(() => {
    if (gameState !== 'STARTING' && gameState !== 'COUNTDOWN') return;

    const updateRemaining = () => {
      const serverStartTime = countdownStartTimeRef.current;
      const effectiveStartTime = serverStartTime
        ? serverStartTime - serverTimeOffsetRef.current
        : (localCountdownStartRef.current || Date.now());

      const now = Date.now();
      const elapsedMs = Math.max(0, now - effectiveStartTime);
      const remainingMs = Math.max(0, 30000 - elapsedMs);
      const remainingSec = Math.ceil(remainingMs / 1000);

      setCountdownSeconds(remainingSec);

      if (remainingSec <= 0) {
        startLiveMatchPlay(players);
      }
    };

    updateRemaining();
    const timer = setInterval(updateRemaining, 200);
    return () => clearInterval(timer);
  }, [gameState, players]);

  // Authoritative multiplayer room synchronizer. Every connected client reads the
  // same server round, deck-derived call list, players, and winner state.
  useEffect(() => {
    if (gameState === 'LOBBY' || gameState === 'CARD_SELECTION') return;
    let active = true;

    const syncRoom = async () => {
      try {
        const res = await fetch(`/api/game/state?roomId=main_room&t=${Date.now()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active || data.status !== 'ok') return;

        if (typeof data.serverTime === 'number') {
          serverTimeOffsetRef.current = data.serverTime - Date.now();
        }
        if (data.roundId && data.roundId !== (window as any).__fetanRoundId) {
          (window as any).__fetanRoundId = data.roundId;
        }

        setCalledBalls(Array.isArray(data.calledBalls) ? data.calledBalls : []);
        setCurrentBall(data.currentBall || null);
        setNextBallCountdownMs(typeof data.nextBallCountdownMs === 'number' ? data.nextBallCountdownMs : 0);

        if (Array.isArray(data.players)) {
          setPlayers(prev => data.players.map((serverPlayer: Player) => ({
            ...serverPlayer,
            isUser: serverPlayer.id === myUserId,
            isBot: !!serverPlayer.isBot,
            isDisconnected: serverPlayer.status === 'DISCONNECTED',
          })));
        }

        if (Array.isArray(data.winners)) setWinners(data.winners);

        if (data.winnerAnnouncement) {
          const announcement = {
            ...data.winnerAnnouncement,
            winner: {
              ...data.winnerAnnouncement.winner,
              isUser: data.winnerAnnouncement.winner?.id === myUserId,
            },
          };
          setWinnerAnnouncement(announcement);
          setGameState('ENDED');
        } else if (data.gameState) {
          setGameState(data.gameState === 'STARTING' ? 'STARTING' : data.gameState);
        }

        if (data.gameState === 'STARTING' && typeof data.countdownStartTime === 'number') {
          countdownStartTimeRef.current = data.countdownStartTime;
          const nowOnServer = Date.now() + serverTimeOffsetRef.current;
          const duration = Number(data.countdownDurationSec || 30) * 1000;
          const remaining = Math.max(0, data.countdownStartTime + duration - nowOnServer);
          setCountdownSeconds(Math.ceil(remaining / 1000));
        }
      } catch (err) {
        console.warn('Room sync error:', err);
      }
    };

    syncRoom();
    const interval = setInterval(syncRoom, 700);
    return () => { active = false; clearInterval(interval); };
  }, [gameState, myUserId]);

  // Smooth Countdown ticker for Next Ball (e.g. Next in 2.8s)
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const timer = setInterval(() => {
      setNextBallCountdownMs(prev => {
        if (prev <= 100) return 0;
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameState]);

  // Ball calling is server-authoritative. The client only renders the synchronized call list.

  // Apply auto-daub locally for this user's card, then synchronize marks to the server.
  useEffect(() => {
    if (calledBalls.length === 0 || gameState !== 'PLAYING') return;
    const calledNumbersSet = new Set(calledBalls.map(b => b.number));
    const user = players.find(p => p.isUser);
    if (!user || user.isDisconnected) return;

    let nextMarks = [...user.markedIndices];
    const card = getCardById(user.cardId);
    let changed = false;
    card.cells.forEach((val, idx) => {
      if (calledNumbersSet.has(val) && autoDaub && !nextMarks[idx]) {
        nextMarks[idx] = true;
        changed = true;
      }
    });
    if (!changed) return;

    setPlayers(prev => prev.map(p => p.isUser ? { ...p, markedIndices: nextMarks } : p));
    fetch('/api/game/player/marks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: 'main_room', playerId: user.id, markedIndices: nextMarks }),
    }).catch(err => console.warn('Mark sync error:', err));
  }, [calledBalls, autoDaub, gameState, players]);

  // Monitor winners list
  useEffect(() => {
    const newlyClaimed = players.filter(p => p.claimedBingo);
    if (newlyClaimed.length > winners.length) {
      setWinners(newlyClaimed);
    }
  }, [players, winners.length]);

  // Manual Daub click by user
  const handleToggleUserCell = (index: number) => {
    if (gameState !== 'PLAYING' || isSpectator) return;

    setPlayers(prev => {
      const updated = prev.map(p => {
        if (!p.isUser || p.isDisconnected) return p;
        const newMarks = [...p.markedIndices];
        newMarks[index] = !newMarks[index];
        fetch('/api/game/player/marks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: 'main_room', playerId: p.id, markedIndices: newMarks }),
        }).catch(err => console.warn('Manual mark sync error:', err));
        return { ...p, markedIndices: newMarks };
      });
      return updated;
    });
  };

  // User BINGO Manual Claim Trigger - server is the final authority.
  const handleUserClaimBingo = async () => {
    const user = players.find(p => p.isUser);
    if (!user || user.isDisconnected || isSpectator) return;

    try {
      const response = await fetch('/api/game/claim-bingo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: 'main_room',
          playerId: user.id,
          markedIndices: user.markedIndices,
          patternName: pattern === 'ANY_LINE_OR_CORNERS' ? 'Standard Line (Row or Col or Diag OR 4 Corners)' : pattern,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        sound.playError();
        if (data.error === 'INVALID_BINGO' || data.error === 'UNCALLED_NUMBER_MARKED') {
          const reason = 'Disqualification: the server rejected your Bingo claim because the card did not have a valid server-verified win.';
          setPlayers(prev => prev.map(p => p.isUser ? { ...p, isDisconnected: true, status: 'DISCONNECTED', disconnectedReason: reason } : p));
          setFalseBingoPenalty({ show: true, reason });
        }
        return;
      }

      const winner = data.winnerAnnouncement?.winner || { ...user, claimedBingo: true };
      setPlayers(prev => prev.map(p => p.id === winner.id ? { ...p, ...winner, isUser: p.id === myUserId, claimedBingo: true } : p));
      setWinners(data.winners || [winner]);
      setWinnerAnnouncement({
        winner: { ...winner, isUser: winner.id === myUserId },
        patternName: data.winnerAnnouncement?.patternName || pattern,
        prizeStars: data.winnerAnnouncement?.prizeStars || 768,
      });
      if (winner.id === myUserId) {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        sound.playFanfare();
        setUserStars(v => v + (data.winnerAnnouncement?.prizeStars || 768));
      } else {
        sound.playBingo();
      }
      setGameState('ENDED');
    } catch (err) {
      console.warn('Claim bingo sync:', err);
    }
  };

  // Leave Game Handler
  const handleLeaveGame = () => {
    sound.playPop();
    setGameState('LOBBY');
    countdownStartTimeRef.current = null;
    localCountdownStartRef.current = null;
    setCountdownSeconds(30);
    setCalledBalls([]);
    setCurrentBall(null);
    setPlayers([]);
    setFalseBingoPenalty({ show: false, reason: '' });
    lastBallNumberRef.current = null;

    // Notify server of player leaving without destroying room for other players
    fetch('/api/game/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: 'main_room', playerId: myUserId }),
    }).catch(err => console.warn('Leave room sync:', err));
  };

  const currentUser = players.find(p => p.isUser) || {
    id: myUserId,
    name: myUserName,
    username: '@bingo_champion',
    avatar: '🎮',
    cardId: selectedCardId || 1,
    markedIndices: Array(25).fill(false),
    isUser: true,
    isBot: false,
    botSpeedMultiplier: 1.0,
    claimedBingo: false,
    starsPaid: 10,
  };

  const currentCard = getCardById(selectedCardId || 1);

  const distanceToWin = currentUser
    ? getDistanceToWin(currentUser.markedIndices, pattern)
    : 5;

  const winResult = currentUser
    ? checkBingoWin(currentUser.markedIndices, pattern)
    : { isWin: false, winningIndices: [] };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-12">
      {/* Top Main Navigation Bar */}
      <nav className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-black text-xl text-white shadow-md shadow-indigo-500/30 border border-white/20">
            75
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white leading-none flex items-center gap-1.5">
              Telegram Bingo 75
              <span className="bg-blue-500/20 text-blue-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-500/30">
                MINI APP
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              150 Players • 150 Preset Cards
            </p>
          </div>
        </div>

        {/* Audio controls & Telegram menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundOn(!soundOn)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Toggle Sound Effects"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={() => setSpeechOn(!speechOn)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Toggle Voice Caller"
          >
            {speechOn ? <Mic className="w-4 h-4 text-amber-400" /> : <MicOff className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={() => setIsTelegramModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-md shadow-blue-600/30 transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bot & Stars</span> ({userStars} ⭐)
          </button>
        </div>
      </nav>

      {/* GAME LOBBY ROOMS SCREEN (APPEARS BEFORE CARD SELECTION) */}
      {gameState === 'LOBBY' && (
        <GameLobby
          onEnterCardSelection={() => setGameState('CARD_SELECTION')}
          onJoinRoom={room => {
            setSelectedRoom(room);
            setSelectedBetAmount(room.betAmount);
            setGameState('CARD_SELECTION');
          }}
          userStars={userStars}
        />
      )}

      {/* CARD SELECTION ROOM VIEW */}
      {gameState === 'CARD_SELECTION' && (
        <CardSelectionRoom
          selectedCardId={selectedCardId}
          isCardConfirmed={isCardConfirmed}
          onSelectCard={cardId => {
            setSelectedCardId(cardId);
            setIsCardConfirmed(false);
          }}
          onConfirmCard={cardId => {
            handleStartGame(cardId);
          }}
          onConfirmAndJoin={cardId => {
            handleStartGame(cardId);
          }}
          onBackToLobby={() => setGameState('LOBBY')}
          userStars={userStars}
          occupiedCardsMap={occupiedCardsMap}
          fillWithBots={fillWithBots}
          onToggleFillWithBots={setFillWithBots}
          selectedRoom={selectedRoom}
          selectedBetAmount={selectedBetAmount}
        />
      )}

      {/* ACTIVE GAMEPLAY / SPECTATING / STARTING VIEW */}
      {(gameState === 'STARTING' || gameState === 'COUNTDOWN' || gameState === 'PLAYING' || gameState === 'SPECTATING' || gameState === 'ENDED') && (
        <ActiveGameplayView
          gameRoundNumber={gamesCount}
          derashPot={768}
          playersCount={players.length > 0 ? players.length : 1}
          activePlayersCount={activePlayersCount}
          betAmount={selectedBetAmount || 10}
          callCount={calledBalls.length}
          gameState={gameState === 'SPECTATING' ? 'PLAYING' : gameState}
          currentBall={currentBall}
          calledBalls={calledBalls}
          startingCountdownSeconds={countdownSeconds}
          userCard={currentCard}
          userMarkedIndices={currentUser.markedIndices}
          cartelaNumber={selectedCardId || 1}
          distanceToWin={distanceToWin}
          hasClaimedBingo={currentUser.claimedBingo}
          winningIndices={winResult.winningIndices}
          isUserDisconnected={currentUser.isDisconnected}
          disconnectedReason={currentUser.disconnectedReason}
          onToggleCell={handleToggleUserCell}
          onClaimBingo={handleUserClaimBingo}
          onLeaveGame={handleLeaveGame}
          onRefresh={() => {
            sound.playPop();
          }}
          autoDaub={autoDaub}
          onToggleAutoDaub={() => setAutoDaub(!autoDaub)}
          onOpenPlayersDrawer={() => setIsPlayersOpen(true)}
          winnersCount={winners.length}
          isSpectator={isSpectator}
          onQueueNextMatch={() => setGameState('CARD_SELECTION')}
          nextBallCountdownMs={nextBallCountdownMs}
          callSpeed={callSpeed}
        />
      )}

      {/* WINNER ANNOUNCEMENT OVERLAY */}
      {winnerAnnouncement && (
        <WinnerAnnouncementModal
          winner={winnerAnnouncement.winner}
          isUserWinner={winnerAnnouncement.winner.isUser}
          patternName={winnerAnnouncement.patternName}
          prizeStars={winnerAnnouncement.prizeStars}
          onPlayAgain={() => {
            setWinnerAnnouncement(null);
            setGamesCount(prev => prev + 1);
            handleStartGame();
          }}
          onClose={() => setWinnerAnnouncement(null)}
        />
      )}

      {/* ANTI-CHEAT FALSE BINGO PENALTY MODAL */}
      {falseBingoPenalty.show && (
        <FalseBingoPenaltyModal
          reason={falseBingoPenalty.reason}
          onReturnToLobby={handleLeaveGame}
        />
      )}

      {/* MODALS & DRAWERS */}
      <PlayersDrawer
        players={players}
        isOpen={isPlayersOpen}
        onClose={() => setIsPlayersOpen(false)}
        userCardId={selectedCardId}
        onSimulateJoin={handleSimulateJoin}
      />

      <TelegramAppModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        userStars={userStars}
        onAddStars={amount => setUserStars(s => s + amount)}
      />

      <CardPickerModal
        isOpen={isCardPickerOpen}
        onSelectCard={cardId => {
          setSelectedCardId(cardId);
          setIsCardPickerOpen(false);
        }}
        selectedCardId={selectedCardId}
      />
    </div>
  );
}
