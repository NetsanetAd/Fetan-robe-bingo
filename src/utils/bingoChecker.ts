import { BingoCard, WinPattern } from '../types';

export const WIN_PATTERNS_COMBINATIONS = {
  // 5 Rows
  rows: [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
  ],
  // 5 Columns
  cols: [
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
  ],
  // 2 Diagonals
  diagonals: [
    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20],
  ],
  // 4 Corners
  fourCorners: [0, 4, 20, 24],
  // Full House
  fullHouse: Array.from({ length: 25 }, (_, i) => i),
};

export function checkBingoWin(
  markedIndices: boolean[],
  pattern: WinPattern = 'ANY_LINE'
): { isWin: boolean; winningIndices: number[] } {
  // Ensure FREE index (12) is always treated as true if not marked
  const effectiveMarks = [...markedIndices];
  effectiveMarks[12] = true;

  if (pattern === 'ANY_LINE') {
    // Check all rows
    for (const row of WIN_PATTERNS_COMBINATIONS.rows) {
      if (row.every(idx => effectiveMarks[idx])) {
        return { isWin: true, winningIndices: row };
      }
    }
    // Check all cols
    for (const col of WIN_PATTERNS_COMBINATIONS.cols) {
      if (col.every(idx => effectiveMarks[idx])) {
        return { isWin: true, winningIndices: col };
      }
    }
    // Check diagonals
    for (const diag of WIN_PATTERNS_COMBINATIONS.diagonals) {
      if (diag.every(idx => effectiveMarks[idx])) {
        return { isWin: true, winningIndices: diag };
      }
    }
  } else if (pattern === 'FOUR_CORNERS') {
    if (WIN_PATTERNS_COMBINATIONS.fourCorners.every(idx => effectiveMarks[idx])) {
      return { isWin: true, winningIndices: WIN_PATTERNS_COMBINATIONS.fourCorners };
    }
  } else if (pattern === 'ANY_LINE_OR_CORNERS') {
    // Check 4 corners first
    if (WIN_PATTERNS_COMBINATIONS.fourCorners.every(idx => effectiveMarks[idx])) {
      return { isWin: true, winningIndices: WIN_PATTERNS_COMBINATIONS.fourCorners };
    }
    // Check rows
    for (const row of WIN_PATTERNS_COMBINATIONS.rows) {
      if (row.every(idx => effectiveMarks[idx])) {
        return { isWin: true, winningIndices: row };
      }
    }
    // Check cols
    for (const col of WIN_PATTERNS_COMBINATIONS.cols) {
      if (col.every(idx => effectiveMarks[idx])) {
        return { isWin: true, winningIndices: col };
      }
    }
    // Check diagonals
    for (const diag of WIN_PATTERNS_COMBINATIONS.diagonals) {
      if (diag.every(idx => effectiveMarks[idx])) {
        return { isWin: true, winningIndices: diag };
      }
    }
  } else if (pattern === 'X_PATTERN') {
    const diag1 = WIN_PATTERNS_COMBINATIONS.diagonals[0];
    const diag2 = WIN_PATTERNS_COMBINATIONS.diagonals[1];
    if (
      diag1.every(idx => effectiveMarks[idx]) &&
      diag2.every(idx => effectiveMarks[idx])
    ) {
      return { isWin: true, winningIndices: Array.from(new Set([...diag1, ...diag2])) };
    }
  } else if (pattern === 'FULL_HOUSE') {
    if (WIN_PATTERNS_COMBINATIONS.fullHouse.every(idx => effectiveMarks[idx])) {
      return { isWin: true, winningIndices: WIN_PATTERNS_COMBINATIONS.fullHouse };
    }
  }

  return { isWin: false, winningIndices: [] };
}

/**
 * Calculates distance to closest win (e.g. 1 means 1-away / "BINGO in 1!")
 */
export function getDistanceToWin(
  markedIndices: boolean[],
  pattern: WinPattern = 'ANY_LINE'
): number {
  const effectiveMarks = [...markedIndices];
  effectiveMarks[12] = true;

  if (pattern === 'ANY_LINE') {
    let minMissing = 5;
    const allLines = [
      ...WIN_PATTERNS_COMBINATIONS.rows,
      ...WIN_PATTERNS_COMBINATIONS.cols,
      ...WIN_PATTERNS_COMBINATIONS.diagonals,
    ];
    for (const line of allLines) {
      const missing = line.filter(idx => !effectiveMarks[idx]).length;
      if (missing < minMissing) minMissing = missing;
    }
    return minMissing;
  } else if (pattern === 'FOUR_CORNERS') {
    return WIN_PATTERNS_COMBINATIONS.fourCorners.filter(idx => !effectiveMarks[idx]).length;
  } else if (pattern === 'ANY_LINE_OR_CORNERS') {
    let minMissing = 5;
    const allLines = [
      ...WIN_PATTERNS_COMBINATIONS.rows,
      ...WIN_PATTERNS_COMBINATIONS.cols,
      ...WIN_PATTERNS_COMBINATIONS.diagonals,
    ];
    for (const line of allLines) {
      const missing = line.filter(idx => !effectiveMarks[idx]).length;
      if (missing < minMissing) minMissing = missing;
    }
    const cornersMissing = WIN_PATTERNS_COMBINATIONS.fourCorners.filter(idx => !effectiveMarks[idx]).length;
    return Math.min(minMissing, cornersMissing);
  } else if (pattern === 'X_PATTERN') {
    const xIndices = Array.from(new Set([...WIN_PATTERNS_COMBINATIONS.diagonals[0], ...WIN_PATTERNS_COMBINATIONS.diagonals[1]]));
    return xIndices.filter(idx => !effectiveMarks[idx]).length;
  } else if (pattern === 'FULL_HOUSE') {
    return WIN_PATTERNS_COMBINATIONS.fullHouse.filter(idx => !effectiveMarks[idx]).length;
  }

  return 5;
}

export function getBallLetter(num: number): 'B' | 'I' | 'N' | 'G' | 'O' {
  if (num >= 1 && num <= 15) return 'B';
  if (num >= 16 && num <= 30) return 'I';
  if (num >= 31 && num <= 45) return 'N';
  if (num >= 46 && num <= 60) return 'G';
  return 'O';
}

export function createShuffledDeck(): number[] {
  const numbers = Array.from({ length: 75 }, (_, i) => i + 1);
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = numbers[i];
    numbers[i] = numbers[j];
    numbers[j] = temp;
  }
  return numbers;
}
