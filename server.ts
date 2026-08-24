import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { PRESET_CARDS } from './src/data/cardsData.ts';

// Types for server-side game state
interface CalledBall {
  letter: string;
  number: number;
  timestamp: number;
}

interface ServerPlayer {
  id: string;
  name: string;
  username: string;
  avatar: string;
  cardId: number;
  markedIndices: boolean[];
  isUser: boolean;
  isBot: boolean;
  botSpeedMultiplier: number;
  claimedBingo: boolean;
  starsPaid: number;
  status: 'CONNECTED' | 'DISCONNECTED';
  joinedAt: number;
}

interface RoomState {
  id: string;
  gameState: 'LOBBY' | 'STARTING' | 'PLAYING' | 'ENDED';
  roundId: string;
  roundNumber: number;
  deck: number[];
  countdownStartTime: number | null;
  countdownDurationSec: number;
  roundStartTime: number;
  speed: number; // in ms
  players: Map<string, ServerPlayer>;
  winnerAnnouncement: {
    winner: ServerPlayer;
    patternName: string;
    prizeStars: number;
    timestamp?: number;
  } | null;
  winners: ServerPlayer[];
  potStars: number;
}

function getBallLetter(num: number): string {
  if (num <= 15) return 'B';
  if (num <= 30) return 'I';
  if (num <= 45) return 'N';
  if (num <= 60) return 'G';
  return 'O';
}

function createShuffledDeck(): number[] {
  const deck = Array.from({ length: 75 }, (_, i) => i + 1);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Global Rooms Map
const rooms = new Map<string, RoomState>();
const MAX_PLAYERS = 150;

function sanitizePlayer(input: any): ServerPlayer {
  const cardId = Number(input?.cardId);
  return {
    id: String(input?.id || ''),
    name: String(input?.name || 'Bingo Player'),
    username: String(input?.username || ''),
    avatar: String(input?.avatar || '🎮'),
    cardId: Number.isInteger(cardId) && cardId >= 1 && cardId <= 150 ? cardId : 1,
    markedIndices: Array.from({ length: 25 }, (_, i) => !!input?.markedIndices?.[i]),
    isUser: true,
    isBot: false,
    botSpeedMultiplier: 1,
    claimedBingo: false,
    starsPaid: Number(input?.starsPaid || 0),
    status: 'CONNECTED',
    joinedAt: Number(input?.joinedAt || Date.now()),
  };
}

function registerPlayer(room: RoomState, input: any) {
  if (!input?.id) return { ok: false, error: 'PLAYER_ID_REQUIRED' };
  const playerId = String(input.id);
  const existing = room.players.get(playerId);
  const player = existing ? { ...existing, status: 'CONNECTED' as const } : sanitizePlayer(input);

  const duplicateCard = Array.from(room.players.values()).find(
    p => p.id !== playerId && p.cardId === player.cardId
  );
  if (duplicateCard) {
    return { ok: false, error: 'CARD_TAKEN', player: duplicateCard };
  }
  if (!existing && room.players.size >= MAX_PLAYERS) {
    return { ok: false, error: 'ROOM_FULL' };
  }

  room.players.set(playerId, {
    ...player,
    id: playerId,
    status: 'CONNECTED',
  });
  return { ok: true, player: room.players.get(playerId)! };
}

function playerCanClaimWin(room: RoomState, player: ServerPlayer, patternName: string, markedIndices: boolean[]) {
  const called = new Set<number>();
  const snapshot = computeRoomSnapshot(room, Date.now());
  snapshot.calledBalls.forEach(b => called.add(b.number));
  const safeMarks = Array.from({ length: 25 }, (_, i) => !!markedIndices?.[i]);
  safeMarks[12] = true;
  const card = player.cardId;
  const cardData = getPresetCard(card);
  if (!cardData) return { ok: false, error: 'CARD_NOT_FOUND' };

  for (let i = 0; i < 25; i++) {
    const value = cardData[i];
    if (safeMarks[i] && value !== 'FREE' && !called.has(value)) {
      return { ok: false, error: 'UNCALLED_NUMBER_MARKED' };
    }
  }

  const win = checkServerWin(safeMarks, patternName);
  return win.isWin ? { ok: true, winningIndices: win.winningIndices } : { ok: false, error: 'INVALID_BINGO' };
}

function getPresetCard(cardId: number): (number | 'FREE')[] | null {
  const card = PRESET_CARDS.find(c => c.id === cardId);
  return card ? card.cells : null;
}

function checkServerWin(marked: boolean[], patternName: string) {
  const m = [...marked];
  m[12] = true;
  const rows = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24]];
  const cols = [[0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24]];
  const diags = [[0,6,12,18,24],[4,8,12,16,20]];
  const corners = [0,4,20,24];
  const matches = (arr: number[]) => arr.every(i => m[i]);
  const anyLine = [...rows, ...cols, ...diags];
  if (patternName === 'FOUR_CORNERS') return matches(corners) ? {isWin:true, winningIndices:corners} : {isWin:false,winningIndices:[]};
  if (patternName === 'X_PATTERN') { const x=[...new Set([...diags[0],...diags[1]])]; return matches(x) ? {isWin:true,winningIndices:x} : {isWin:false,winningIndices:[]}; }
  if (patternName === 'FULL_HOUSE') return m.every(Boolean) ? {isWin:true,winningIndices:Array.from({length:25},(_,i)=>i)} : {isWin:false,winningIndices:[]};
  if (patternName.includes('Corners')) { if (matches(corners)) return {isWin:true,winningIndices:corners}; }
  for (const line of anyLine) if (matches(line)) return {isWin:true,winningIndices:line};
  return {isWin:false,winningIndices:[]};
}

function getOrCreateRoom(roomId = 'main_room'): RoomState {
  if (!rooms.has(roomId)) {
    const initialDeck = createShuffledDeck();
    rooms.set(roomId, {
      id: roomId,
      gameState: 'LOBBY',
      roundId: `round_${Date.now()}`,
      roundNumber: 1,
      deck: initialDeck,
      countdownStartTime: null,
      countdownDurationSec: 30,
      roundStartTime: 0,
      speed: 3000,
      players: new Map<string, ServerPlayer>(),
      winnerAnnouncement: null,
      winners: [],
      potStars: 768,
    });
  }
  return rooms.get(roomId)!;
}

function resetRoomToNewRound(room: RoomState, speed = 3000) {
  room.deck = createShuffledDeck();
  room.countdownStartTime = null;
  room.countdownDurationSec = 30;
  room.roundStartTime = Date.now();
  room.speed = speed > 0 ? speed : 3000;
  room.gameState = 'PLAYING';
  room.roundId = `round_${Date.now()}`;
  room.roundNumber += 1;
  room.winnerAnnouncement = null;
  room.winners = [];

  // Reset player claims
  room.players.forEach(p => {
    p.claimedBingo = false;
    p.markedIndices = Array(25).fill(false);
  });
}

function computeRoomSnapshot(room: RoomState, now = Date.now()) {
  let remainingCountdownSec = 0;
  if (room.countdownStartTime) {
    const elapsedCountdownMs = now - room.countdownStartTime;
    const remainingMs = Math.max(0, (room.countdownDurationSec * 1000) - elapsedCountdownMs);
    remainingCountdownSec = Math.ceil(remainingMs / 1000);

    if (remainingCountdownSec <= 0 && room.gameState === 'STARTING') {
      room.gameState = 'PLAYING';
      if (room.roundStartTime <= 0) {
        room.roundStartTime = now;
      }
    }
  }

  // If in LOBBY or STARTING, no balls called yet
  if (room.gameState === 'LOBBY' || room.gameState === 'STARTING') {
    return {
      gameState: room.gameState,
      calledBalls: [] as CalledBall[],
      currentBall: null as CalledBall | null,
      nextBallCountdownMs: 0,
      countdownSeconds: remainingCountdownSec,
      countdownStartTime: room.countdownStartTime,
      countdownDurationSec: room.countdownDurationSec,
      speed: room.speed,
    };
  }

  // If roundStartTime was never set or 0, start immediately
  if (room.roundStartTime <= 0 || room.deck.length < 75) {
    room.deck = createShuffledDeck();
    room.roundStartTime = now;
    room.gameState = 'PLAYING';
  }

  // If winner has ended game, snapshot at winner claim time
  if (room.gameState === 'ENDED' && room.winnerAnnouncement?.timestamp) {
    const totalElapsed = Math.max(0, room.winnerAnnouncement.timestamp - room.roundStartTime);
    const count = Math.min(75, Math.max(1, Math.floor(totalElapsed / room.speed) + 1));
    const calledBalls: CalledBall[] = room.deck.slice(0, count).map((num, idx) => ({
      letter: getBallLetter(num),
      number: num,
      timestamp: room.roundStartTime + idx * room.speed,
    }));
    return {
      gameState: 'ENDED' as const,
      calledBalls,
      currentBall: calledBalls[calledBalls.length - 1] || null,
      nextBallCountdownMs: 0,
      countdownSeconds: 0,
      countdownStartTime: room.countdownStartTime,
      countdownDurationSec: room.countdownDurationSec,
      speed: room.speed,
    };
  }

  const elapsed = Math.max(0, now - room.roundStartTime);
  const ballIndex = Math.floor(elapsed / room.speed);
  const count = Math.min(75, Math.max(1, ballIndex + 1));

  const calledBalls: CalledBall[] = room.deck.slice(0, count).map((num, idx) => ({
    letter: getBallLetter(num),
    number: num,
    timestamp: room.roundStartTime + idx * room.speed,
  }));

  const currentBall = calledBalls[calledBalls.length - 1] || null;
  const isEnded = count >= 75 && elapsed >= 75 * room.speed;
  const nextBallCountdownMs = isEnded ? 0 : Math.max(0, (ballIndex + 1) * room.speed - elapsed);

  if (isEnded && room.gameState !== 'ENDED') {
    room.gameState = 'ENDED';
  }

  return {
    gameState: room.gameState,
    calledBalls,
    currentBall,
    nextBallCountdownMs,
    countdownSeconds: 0,
    countdownStartTime: room.countdownStartTime,
    countdownDurationSec: room.countdownDurationSec,
    speed: room.speed,
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable CORS & headers for Telegram WebApp WebView environments
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (_req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json());

  // Health check route
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', playersSupported: MAX_PLAYERS, cards: 150 });
  });

  // Get synchronized game state
  app.get('/api/game/state', (req, res) => {
    const roomId = (typeof req.query.roomId === 'string' && req.query.roomId) || 'main_room';
    const room = getOrCreateRoom(roomId);
    const speed = typeof req.query.speed === 'string' ? parseInt(req.query.speed, 10) : room.speed;

    if (speed && speed > 0 && speed !== room.speed && room.gameState !== 'PLAYING') {
      room.speed = speed;
    }

    const snapshot = computeRoomSnapshot(room);
    const playersList = Array.from(room.players.values());

    res.json({
      status: 'ok',
      roomId: room.id,
      roundId: room.roundId,
      roundNumber: room.roundNumber,
      gameState: snapshot.gameState,
      calledBalls: snapshot.calledBalls,
      currentBall: snapshot.currentBall,
      nextBallCountdownMs: snapshot.nextBallCountdownMs,
      countdownSeconds: snapshot.countdownSeconds,
      countdownStartTime: snapshot.countdownStartTime,
      countdownDurationSec: snapshot.countdownDurationSec,
      speed: snapshot.speed,
      players: playersList,
      winners: room.winners,
      winnerAnnouncement: room.winnerAnnouncement,
      potStars: room.potStars,
      serverTime: Date.now(),
    });
  });

  // Start or Synchronize Shared Room Countdown (30-second starting sequence)
  app.post('/api/game/countdown/start', (req, res) => {
    const roomId = req.body?.roomId || 'main_room';
    const room = getOrCreateRoom(roomId);
    const now = Date.now();
    const durationSec = typeof req.body?.durationSec === 'number' && req.body.durationSec > 0 ? req.body.durationSec : 30;
    const forceNew = !!req.body?.forceNew;

    const registration = registerPlayer(room, req.body?.player);
    if (!registration.ok) {
      return res.status(registration.error === 'ROOM_FULL' ? 409 : 400).json({ status: 'error', error: registration.error, player: registration.player || null });
    }

    // A player joining an active room must join the existing round. Only an empty
    // lobby or an already-ended round starts a new countdown.
    const isCountdownActive = room.gameState === 'STARTING' &&
      room.countdownStartTime !== null &&
      (now - room.countdownStartTime < (room.countdownDurationSec || 30) * 1000);

    if ((room.gameState === 'LOBBY' || room.gameState === 'ENDED') && !isCountdownActive) {
      const wasEnded = room.gameState === 'ENDED';
      room.countdownStartTime = now;
      room.countdownDurationSec = durationSec;
      room.gameState = 'STARTING';
      room.roundStartTime = now + durationSec * 1000;
      room.deck = createShuffledDeck();
      room.winnerAnnouncement = null;
      room.winners = [];
      room.roundId = `round_${now}`;
      if (wasEnded) room.roundNumber += 1;

      room.players.forEach(p => {
        p.claimedBingo = false;
        p.markedIndices = Array(25).fill(false);
      });
    }

    const snapshot = computeRoomSnapshot(room, now);
    const playersList = Array.from(room.players.values());

    res.json({
      status: 'ok',
      roomId: room.id,
      roundId: room.roundId,
      roundNumber: room.roundNumber,
      gameState: snapshot.gameState,
      countdownSeconds: snapshot.countdownSeconds,
      countdownStartTime: snapshot.countdownStartTime,
      countdownDurationSec: snapshot.countdownDurationSec,
      players: playersList,
      serverTime: now,
    });
  });

  // Get current shared countdown state for room
  app.get('/api/game/countdown', (req, res) => {
    const roomId = (typeof req.query.roomId === 'string' && req.query.roomId) || 'main_room';
    const room = getOrCreateRoom(roomId);
    const now = Date.now();
    const snapshot = computeRoomSnapshot(room, now);

    res.json({
      status: 'ok',
      roomId: room.id,
      roundId: room.roundId,
      gameState: snapshot.gameState,
      countdownSeconds: snapshot.countdownSeconds,
      countdownStartTime: snapshot.countdownStartTime,
      countdownDurationSec: snapshot.countdownDurationSec,
      serverTime: now,
    });
  });

  // Start or Synchronize into Live Game
  app.post('/api/game/start', (req, res) => {
    const roomId = req.body?.roomId || 'main_room';
    const forceNew = !!req.body?.forceNew;
    const speed = typeof req.body?.speed === 'number' && req.body.speed > 0 ? req.body.speed : 3000;
    const room = getOrCreateRoom(roomId);

    const registration = registerPlayer(room, req.body?.player);
    if (!registration.ok) {
      return res.status(registration.error === 'ROOM_FULL' ? 409 : 400).json({ status: 'error', error: registration.error, player: registration.player || null });
    }

    // If game ended, or forceNew requested, or game has been running for > 6 minutes
    const now = Date.now();
    const elapsedSinceStart = now - room.roundStartTime;
    if (room.gameState === 'ENDED' || (forceNew && room.gameState !== 'PLAYING' && room.gameState !== 'STARTING') || elapsedSinceStart > 360000) {
      resetRoomToNewRound(room, speed);
    } else if (speed && speed > 0 && room.speed !== speed && elapsedSinceStart < speed) {
      room.speed = speed;
    }

    const snapshot = computeRoomSnapshot(room, now);
    const playersList = Array.from(room.players.values());

    res.json({
      status: 'ok',
      roomId: room.id,
      roundId: room.roundId,
      roundNumber: room.roundNumber,
      gameState: snapshot.gameState,
      calledBalls: snapshot.calledBalls,
      currentBall: snapshot.currentBall,
      nextBallCountdownMs: snapshot.nextBallCountdownMs,
      countdownSeconds: snapshot.countdownSeconds,
      countdownStartTime: snapshot.countdownStartTime,
      countdownDurationSec: snapshot.countdownDurationSec,
      speed: snapshot.speed,
      players: playersList,
      winners: room.winners,
      winnerAnnouncement: room.winnerAnnouncement,
      potStars: room.potStars,
      serverTime: now,
    });
  });

  // Sync player card marks to the authoritative room state. Marks are validated
  // against called numbers when a Bingo claim is submitted.
  app.post('/api/game/player/marks', (req, res) => {
    const room = getOrCreateRoom(req.body?.roomId || 'main_room');
    const playerId = String(req.body?.playerId || '');
    const player = room.players.get(playerId);
    if (!player) return res.status(404).json({ status: 'error', error: 'PLAYER_NOT_FOUND' });
    player.markedIndices = Array.from({ length: 25 }, (_, i) => !!req.body?.markedIndices?.[i]);
    res.json({ status: 'ok' });
  });

  // Claim Bingo - server-authoritative validation
  app.post('/api/game/claim-bingo', (req, res) => {
    const roomId = req.body?.roomId || 'main_room';
    const room = getOrCreateRoom(roomId);
    const playerId = String(req.body?.playerId || '');
    const patternName = String(req.body?.patternName || 'Bingo Line');
    const markedIndices = Array.from({ length: 25 }, (_, i) => !!req.body?.markedIndices?.[i]);

    const player = room.players.get(playerId);
    if (!player) return res.status(404).json({ status: 'error', error: 'PLAYER_NOT_FOUND' });
    if (room.gameState !== 'PLAYING') return res.status(409).json({ status: 'error', error: 'GAME_NOT_PLAYING' });
    if (player.claimedBingo) return res.json({ status: 'ok', gameState: room.gameState, winnerAnnouncement: room.winnerAnnouncement, winners: room.winners });

    const validation = playerCanClaimWin(room, player, patternName, markedIndices);
    if (!validation.ok) {
      if (validation.error === 'UNCALLED_NUMBER_MARKED' || validation.error === 'INVALID_BINGO') {
        player.status = 'DISCONNECTED';
        player.markedIndices = markedIndices;
      }
      return res.status(422).json({ status: 'error', error: validation.error });
    }

    player.markedIndices = markedIndices;
    player.claimedBingo = true;
    const winner = { ...player };
    if (!room.winners.some(w => w.id === winner.id)) room.winners.push(winner);

    if (!room.winnerAnnouncement) {
      room.winnerAnnouncement = {
        winner,
        patternName,
        prizeStars: room.potStars,
        timestamp: Date.now(),
      };
      room.gameState = 'ENDED';
    }

    res.json({
      status: 'ok',
      gameState: room.gameState,
      winnerAnnouncement: room.winnerAnnouncement,
      winners: room.winners,
    });
  });

  // Leave room
  app.post('/api/game/leave', (req, res) => {
    const roomId = req.body?.roomId || 'main_room';
    const room = getOrCreateRoom(roomId);
    const playerId = req.body?.playerId;

    if (playerId && room.players.has(playerId)) {
      room.players.delete(playerId);
    }

    res.json({
      status: 'ok',
      playersCount: room.players.size,
    });
  });

  // Reset room (new round)
  app.post('/api/game/reset', (req, res) => {
    const roomId = req.body?.roomId || 'main_room';
    const room = getOrCreateRoom(roomId);
    const speed = typeof req.body?.speed === 'number' && req.body.speed > 0 ? req.body.speed : 3000;

    resetRoomToNewRound(room, speed);
    const snapshot = computeRoomSnapshot(room);

    res.json({
      status: 'ok',
      gameState: snapshot.gameState,
      calledBalls: snapshot.calledBalls,
      currentBall: snapshot.currentBall,
    });
  });

  // Vite middleware for development vs static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
