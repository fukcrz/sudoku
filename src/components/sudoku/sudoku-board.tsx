"use client";

import type { Board, Position } from '@/types/sudoku';
import { cn } from '@/lib/utils';
import { memo } from 'react';

interface SudokuBoardProps {
  board: Board;
  selectedCell: Position | null;
  onCellSelect: (pos: Position) => void;
  highlightedValue: number | null;
}

const areCellsRelated = (cell1: Position, cell2: Position) => {
    if (!cell1 || !cell2) return false;
    const box1 = { row: Math.floor(cell1.row / 3), col: Math.floor(cell1.col / 3) };
    const box2 = { row: Math.floor(cell2.row / 3), col: Math.floor(cell2.col / 3) };
    return cell1.row === cell2.row || cell1.col === cell2.col || (box1.row === box2.row && box1.col === box2.col);
}

export const SudokuBoard = memo(function SudokuBoard({ board, selectedCell, onCellSelect, highlightedValue }: SudokuBoardProps) {
  return (
    <div className="grid grid-cols-9 grid-rows-9 gap-0.5 bg-border rounded-md overflow-hidden shadow-lg aspect-square w-full">
      {board.map((row, r) =>
        row.map((cell, c) => {
          const pos = { row: r, col: c };
          const isSelected = selectedCell?.row === r && selectedCell?.col === c;
          const isRelated = areCellsRelated(selectedCell, pos);
          const isHighlighted = highlightedValue !== null && cell.value === highlightedValue;
          
          return (
            <button
              key={`${r}-${c}`}
              onClick={() => onCellSelect(pos)}
              className={cn(
                "relative flex items-center justify-center aspect-square text-[clamp(24px,6vw,48px)] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary z-0",
                "bg-card text-card-foreground",
                cell.isInitial ? "font-bold" : "font-bold text-primary",
                cell.isError && "text-destructive",
                isRelated && !isSelected && "bg-secondary",
                isHighlighted && !cell.isInitial && "bg-primary/20",
                isSelected && "bg-primary/40 ring-2 ring-primary z-10",
                (c + 1) % 3 === 0 && c !== 8 && "border-r-[clamp(1px,0.75vw,3px)] border-primary/50",
                (r + 1) % 3 === 0 && r !== 8 && "border-b-[clamp(1px,0.75vw,3px)] border-primary/50",
                c === 0 && "border-l-0",
                r === 0 && "border-t-0",
                c === 8 && "border-r-0",
                r === 8 && "border-b-0",
                !cell.isInitial && "cursor-pointer",
              )}
              disabled={cell.isInitial}
              aria-label={`Cell ${r+1}, ${c+1}, value ${cell.value || 'empty'}`}
            >
              {cell.value !== 0 ? (
                <span>{cell.value}</span>
              ) : (
                <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-0.5">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-center text-[clamp(12px,3vw,24px)] text-muted-foreground">
                      {cell.notes.has(i + 1) ? i + 1 : ''}
                    </div>
                  ))}
                </div>
              )}
            </button>
          );
        })
      )}
    </div>
  );
});
