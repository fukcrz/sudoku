"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Board, Position, Difficulty } from '@/types/sudoku';
import { DIFFICULTY_LEVELS } from '@/types/sudoku';
import { generateSudoku } from '@/lib/sudoku';
import { SudokuBoard } from '@/components/sudoku/sudoku-board';
import { Controls } from '@/components/sudoku/controls';
import { GameOverDialog } from '@/components/sudoku/game-over-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Timer, Skull } from 'lucide-react';

type GameState = 'menu' | 'playing' | 'won' | 'lost';
type Mode = 'input' | 'note';

const MAX_ERRORS = 3;
const LOCAL_STORAGE_KEY = 'sudokuGameState';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function getPossibleValues(board: Board, pos: Position): Set<number> {
  const possible = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  for (let i = 0; i < 9; i++) {
    if (board[pos.row][i].value !== 0) {
      possible.delete(board[pos.row][i].value);
    }
    if (board[i][pos.col].value !== 0) {
      possible.delete(board[i][pos.col].value);
    }
  }

  const boxRowStart = Math.floor(pos.row / 3) * 3;
  const boxColStart = Math.floor(pos.col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cellValue = board[boxRowStart + r][boxColStart + c].value;
      if (cellValue !== 0) {
        possible.delete(cellValue);
      }
    }
  }
  
  return possible;
}

export function SudokuGame() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [solution, setSolution] = useState<number[][] | null>(null);
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [errors, setErrors] = useState(0);
  const [mode, setMode] = useState<Mode>('input');
  const [time, setTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [savedGameExists, setSavedGameExists] = useState(false);

  useEffect(() => {
    try {
      const savedGame = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedGame) {
        setSavedGameExists(true);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
  }, []);

  useEffect(() => {
    try {
      if (gameState === 'playing' && board && solution && difficulty) {
        const gameStateToSave = {
          difficulty,
          board: board.map(row => row.map(cell => ({...cell, notes: Array.from(cell.notes)}))),
          solution,
          errors,
          time,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gameStateToSave));
        setSavedGameExists(true);
      } else if (gameState === 'won' || gameState === 'lost') {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setSavedGameExists(false);
      }
    } catch (error) {
      console.error("Could not save to localStorage:", error);
    }
  }, [gameState, difficulty, board, solution, errors, time]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  const startGame = useCallback((level: Difficulty) => {
    const { puzzle, solution } = generateSudoku(level);
    const initialBoard: Board = puzzle.map((row) =>
      row.map((value) => ({
        value,
        notes: new Set(),
        isInitial: value !== 0,
        isError: false,
      }))
    );
    setBoard(initialBoard);
    setSolution(solution);
    setDifficulty(level);
    setErrors(0);
    setSelectedCell(null);
    setMode('input');
    setGameState('playing');
    setTime(0);
    setTimerRunning(true);
  }, []);

  const continueGame = useCallback(() => {
    try {
      const savedGameJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedGameJSON) {
        const savedGame = JSON.parse(savedGameJSON);
        const loadedBoard: Board = savedGame.board.map((row: any) =>
          row.map((cell: any) => ({
            ...cell,
            notes: new Set(cell.notes),
          }))
        );

        setBoard(loadedBoard);
        setSolution(savedGame.solution);
        setDifficulty(savedGame.difficulty);
        setErrors(savedGame.errors);
        setTime(savedGame.time);
        
        setSelectedCell(null);
        setMode('input');
        setGameState('playing');
        setTimerRunning(true);
      }
    } catch (error) {
      console.error("Could not load game from localStorage:", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setSavedGameExists(false);
    }
  }, []);

  const handleCellSelect = useCallback((pos: Position) => {
    if (board && !board[pos.row][pos.col].isInitial) {
      setSelectedCell(pos);
    } else {
        setSelectedCell(null);
    }
  }, [board]);

  const handleNumberInput = useCallback((num: number) => {
    if (!selectedCell || !board || !solution) return;

    const { row, col } = selectedCell;
    const currentCell = board[row][col];
    if (currentCell.isInitial) return;

    const newBoard = board.map(r => r.map(c => ({...c, notes: new Set(c.notes)})));

    if (mode === 'note') {
      const notes = newBoard[row][col].notes;
      if (notes.has(num)) {
        notes.delete(num);
      } else {
        notes.add(num);
      }
    } else {
      newBoard[row][col].value = num;
      newBoard[row][col].isError = false;
      newBoard[row][col].notes.clear();

      if (num !== solution[row][col]) {
        newBoard[row][col].isError = true;
        const newErrors = errors + 1;
        setErrors(newErrors);
        if (newErrors >= MAX_ERRORS) {
          setGameState('lost');
          setTimerRunning(false);
        }
      } else {
        // Auto-remove notes
        for (let i = 0; i < 9; i++) {
          newBoard[row][i].notes.delete(num); // Row
          newBoard[i][col].notes.delete(num); // Column
        }
        const boxRowStart = Math.floor(row / 3) * 3;
        const boxColStart = Math.floor(col / 3) * 3;
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            newBoard[boxRowStart + r][boxColStart + c].notes.delete(num);
          }
        }
      }
    }
    setBoard(newBoard);
    
    // Check for win condition
    if (mode === 'input' && num === solution[row][col]) {
        let isComplete = true;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (newBoard[r][c].value === 0 || newBoard[r][c].value !== solution[r][c]) {
                    isComplete = false;
                    break;
                }
            }
            if (!isComplete) break;
        }

        if (isComplete) {
            setGameState('won');
            setTimerRunning(false);
        }
    }

  }, [selectedCell, board, solution, mode, errors]);

  const handleErase = useCallback(() => {
    if (!selectedCell || !board) return;
    const { row, col } = selectedCell;
    if (board[row][col].isInitial) return;
    
    const newBoard = board.map(r => r.map(c => ({...c, notes: new Set(c.notes)})));
    newBoard[row][col].value = 0;
    newBoard[row][col].notes.clear();
    newBoard[row][col].isError = false;
    setBoard(newBoard);
  }, [selectedCell, board]);

  const handleRestart = useCallback(() => {
    if (difficulty) {
      startGame(difficulty);
    }
  }, [difficulty, startGame]);

  const handleBackToMenu = useCallback(() => {
    setGameState('menu');
    setTimerRunning(false);
  }, []);

  const handleNewGame = useCallback(() => {
    setGameState('menu');
    setBoard(null);
    setSolution(null);
    setDifficulty(null);
    setTimerRunning(false);
    setTime(0);
  }, []);

  const highlightedValue = useMemo(() => {
    if (selectedCell && board) {
        const val = board[selectedCell.row][selectedCell.col].value;
        return val !== 0 ? val : null;
    }
    return null;
  }, [selectedCell, board]);

  const determinedValue = useMemo<number | null>(() => {
    if (!selectedCell || !board || mode !== 'input') {
        return null;
    }
    const cell = board[selectedCell.row][selectedCell.col];
    if (cell.value !== 0 || cell.isInitial) {
        return null;
    }
    
    const { row, col } = selectedCell;

    let rowCount = 0;
    for (let i = 0; i < 9; i++) {
        if (board[row][i].value !== 0) rowCount++;
    }
    if (rowCount === 8) {
      const possible = getPossibleValues(board, selectedCell);
      if (possible.size === 1) return possible.values().next().value;
    }

    let colCount = 0;
    for (let i = 0; i < 9; i++) {
        if (board[i][col].value !== 0) colCount++;
    }
    if (colCount === 8) {
      const possible = getPossibleValues(board, selectedCell);
      if (possible.size === 1) return possible.values().next().value;
    }

    const boxRowStart = Math.floor(row / 3) * 3;
    const boxColStart = Math.floor(col / 3) * 3;
    let boxCount = 0;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[boxRowStart + r][boxColStart + c].value !== 0) {
                boxCount++;
            }
        }
    }
    if (boxCount === 8) {
      const possible = getPossibleValues(board, selectedCell);
      if (possible.size === 1) return possible.values().next().value;
    }

    return null;
  }, [selectedCell, board, mode]);


  if (gameState === 'menu') {
    return (
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">选择难度</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 p-6">
          {savedGameExists && (
            <Button onClick={continueGame} size="lg" variant="secondary">
              继续游戏
            </Button>
          )}
          {Object.entries(DIFFICULTY_LEVELS).map(([key, { label }]) => (
            <Button key={key} onClick={() => startGame(key as Difficulty)} size="lg" variant="default">
              {label}
            </Button>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      <div className="w-full flex justify-between items-center px-2 text-sm text-foreground/80">
        <Button variant="ghost" size="sm" onClick={handleBackToMenu}>
            <ArrowLeft className="w-4 h-4" />
            返回
        </Button>
        <div>{difficulty ? DIFFICULTY_LEVELS[difficulty].label : ''}</div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
                <Skull className="w-4 h-4 text-destructive" />
                <span>{errors} / {MAX_ERRORS}</span>
            </div>
            <div className="flex items-center gap-1">
                <Timer className="w-4 h-4" />
                <span>{formatTime(time)}</span>
            </div>
        </div>
      </div>
      
      {board && <SudokuBoard board={board} selectedCell={selectedCell} onCellSelect={handleCellSelect} highlightedValue={highlightedValue} />}
      
      <div className="flex items-center space-x-2 my-2">
        <Label htmlFor="mode-switch" className={mode === 'note' ? 'text-primary font-bold' : ''}>笔记</Label>
        <Switch id="mode-switch" checked={mode === 'input'} onCheckedChange={(checked) => setMode(checked ? 'input' : 'note')} />
        <Label htmlFor="mode-switch" className={mode === 'input' ? 'text-primary font-bold' : ''}>填入</Label>
      </div>

      <Controls onNumberPress={handleNumberInput} onErase={handleErase} determinedValue={determinedValue} />

      <GameOverDialog
        isOpen={gameState === 'won' || gameState === 'lost'}
        status={gameState === 'won' ? 'won' : 'lost'}
        time={formatTime(time)}
        onRestart={handleRestart}
        onNewGame={handleNewGame}
      />
    </div>
  );
}
