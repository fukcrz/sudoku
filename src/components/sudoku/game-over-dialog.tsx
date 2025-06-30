"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface GameOverDialogProps {
  isOpen: boolean;
  status: 'won' | 'lost';
  time: string;
  onRestart: () => void;
  onNewGame: () => void;
}

export function GameOverDialog({ isOpen, status, time, onRestart, onNewGame }: GameOverDialogProps) {
  const title = status === 'won' ? "挑战成功！" : "挑战失败";
  const description = `用时：${time}`;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-2xl">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-lg pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center pt-4">
          <AlertDialogCancel onClick={onNewGame}>新游戏</AlertDialogCancel>
          <AlertDialogAction onClick={onRestart}>再来一局</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
