import { Player } from '../types';
import { PRESET_CARDS } from '../data/cardsData';

const FIRST_NAMES = [
  'Alex', 'Sophia', 'Dmitry', 'Elena', 'Lucas', 'Mia', 'Mateo', 'Aria',
  'Ethan', 'Layla', 'Pavel', 'Anna', 'Viktor', 'Olga', 'Liam', 'Zoe',
  'Noah', 'Chloe', 'Ivan', 'Yana', 'Maxim', 'Svetlana', 'Gabriel', 'Nora',
  'Leo', 'Maya', 'Arthur', 'Inna', 'Kira', 'Danil', 'Ekaterina', 'Sergey'
];

const LAST_NAMES = [
  'V.', 'S.', 'K.', 'M.', 'B.', 'T.', 'R.', 'P.', 'D.', 'G.', 'N.', 'L.'
];

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500',
  'bg-rose-500', 'bg-indigo-500', 'bg-teal-500', 'bg-pink-500'
];

export function generate150Players(
  userCardId: number,
  userName: string = 'You (Telegram User)',
  userAvatar: string = '🎮',
  userHandle: string = '@bingo_champion'
): Player[] {
  const players: Player[] = [];
  const now = Date.now();

  // 1. Primary Detected Telegram User
  players.push({
    id: 'user_main',
    name: userName,
    username: userHandle,
    avatar: userAvatar,
    cardId: userCardId,
    markedIndices: Array(25).fill(false),
    isUser: true,
    isBot: false,
    botSpeedMultiplier: 1.0,
    claimedBingo: false,
    starsPaid: 10,
    status: 'CONNECTED',
    joinedAt: now,
  });

  // Available card IDs for bots (1 to 150 except user's cardId)
  const availableCardIds = PRESET_CARDS.map(c => c.id).filter(id => id !== userCardId);

  // Shuffle available card IDs
  for (let i = availableCardIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableCardIds[i], availableCardIds[j]] = [availableCardIds[j], availableCardIds[i]];
  }

  // 2. 149 Registered Participants
  for (let i = 0; i < 149; i++) {
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const ln = LAST_NAMES[i % LAST_NAMES.length];
    const botCardId = availableCardIds[i % availableCardIds.length];

    // Give varied reaction/daub speed to bots (some fast, some relaxed)
    const speed = 0.5 + Math.random() * 1.5; // 0.5s to 2.0s delay

    players.push({
      id: `bot_${i + 1}`,
      name: `${fn} ${ln}`,
      username: `@${fn.toLowerCase()}_${i + 1}`,
      avatar: AVATAR_COLORS[i % AVATAR_COLORS.length],
      cardId: botCardId,
      markedIndices: Array(25).fill(false),
      isUser: false,
      isBot: true,
      botSpeedMultiplier: speed,
      claimedBingo: false,
      starsPaid: 10,
      status: 'CONNECTED',
      joinedAt: now - Math.floor(Math.random() * 60000), // joined in last 60s
    });
  }

  return players;
}

export function createNewParticipant(
  customName?: string,
  customCardId?: number,
  assignedCardIds: number[] = []
): Player {
  const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const name = customName || `${fn} ${ln}`;
  const username = `@${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_tg`;

  // Find unused card ID
  const available = PRESET_CARDS.map(c => c.id).filter(id => !assignedCardIds.includes(id));
  const cardId = customCardId && !assignedCardIds.includes(customCardId)
    ? customCardId
    : available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : Math.floor(Math.random() * 150) + 1;

  return {
    id: `dynamic_user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name,
    username,
    avatar: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    cardId,
    markedIndices: Array(25).fill(false),
    isUser: false,
    isBot: true,
    botSpeedMultiplier: 0.8 + Math.random() * 1.2,
    claimedBingo: false,
    starsPaid: 10,
    status: 'CONNECTED',
    joinedAt: Date.now(),
  };
}
