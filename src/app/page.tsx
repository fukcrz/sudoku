import { SudokuGame } from '@/components/sudoku-game';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-2 sm:p-4">
      <SudokuGame />
    </main>
  );
}
