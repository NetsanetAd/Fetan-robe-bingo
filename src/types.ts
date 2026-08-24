export type BallLetter = 'B' | 'I' | 'N' | 'G' | 'O';

export interface CalledBall {
  letter: BallLetter;
  number: number; // 1-75
  timestamp: number;
}

export type GridCell = number | 'FREE';

export interface BingoCard {
  id: number;
  // 5x5 matrix or 25-length array
  cells: GridCell[]; // Length 25: 5 rows of B,I,N,G,O
}

export type WinPattern = 'ANY_LINE' | 'FOUR_CORNERS' | 'ANY_LINE_OR_CORNERS' | 'X_PATTERN' | 'FULL_HOUSE';

export interface Player {
  id: string;
  name: string;
  username: string;
  avatar: string;
  cardId: number;
  markedIndices: boolean[]; // 25 booleans
  isUser: boolean;
  isBot: boolean;
  botSpeedMultiplier: number; // For bot daubing delay simulation
  claimedBingo: boolean;
  claimTimestamp?: number;
  rank?: number;
  starsPaid?: number;
  isDisconnected?: boolean;
  disconnectedReason?: string;
  status?: 'CONNECTED' | 'DISCONNECTED' | 'LEFT';
  joinedAt?: number;
}

export type GameState = 'LOBBY' | 'CARD_SELECTION' | 'WAITING' | 'STARTING' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'ENDED';

export interface TelegramUser {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface GameStats {
  ballsCalledCount: number;
  winnersCount: number;
  prizePoolStars: number;
  startTime?: number;
  endTime?: number;
}
