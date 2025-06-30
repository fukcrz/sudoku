import type { Difficulty } from '@/types/sudoku';
import { DIFFICULTY_LEVELS } from '@/types/sudoku';

const SIZE = 9;

function shuffle(array: number[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function isSafe(board: number[][], row: number, col: number, num: number): boolean {
  for (let x = 0; x < SIZE; x++) {
    if (board[row][x] === num || board[x][col] === num) {
      return false;
    }
  }

  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) {
        return false;
      }
    }
  }

  return true;
}

function fillBoard(board: number[][]): boolean {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (board[row][col] === 0) {
        const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of numbers) {
          if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) {
              return true;
            }
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function createSolution(): number[][] {
  const board = Array(SIZE)
    .fill(0)
    .map(() => Array(SIZE).fill(0));
  fillBoard(board);
  return board;
}

function createPuzzle(solution: number[][], difficulty: Difficulty): number[][] {
  const puzzle = solution.map((row) => [...row]);
  const holes = DIFFICULTY_LEVELS[difficulty].holes;
  
  let attempts = holes;
  while (attempts > 0) {
    const row = Math.floor(Math.random() * SIZE);
    const col = Math.floor(Math.random() * SIZE);

    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      attempts--;
    }
  }
  return puzzle;
}

export function generateSudoku(difficulty: Difficulty): { puzzle: number[][]; solution: number[][] } {
  const solution = createSolution();
  const puzzle = createPuzzle(solution, difficulty);
  return { puzzle, solution };
}
