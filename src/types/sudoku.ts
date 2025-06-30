export type Cell = {
  value: number; // 0 for empty
  notes: Set<number>;
  isInitial: boolean;
  isError: boolean;
};
export type Board = Cell[][];
export type Position = { row: number; col: number };
export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_LEVELS: Record<Difficulty, { label: string; holes: number }> = {
  easy: { label: '简单', holes: 35 },
  medium: { label: '中等', holes: 45 },
  hard: { label: '困难', holes: 55 },
};
