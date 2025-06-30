"use client";

import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';

interface ControlsProps {
  onNumberPress: (num: number) => void;
  onErase: () => void;
}

export function Controls({ onNumberPress, onErase }: ControlsProps) {
  return (
    <div className="grid grid-cols-5 gap-2 w-full">
      {Array.from({ length: 9 }).map((_, i) => (
        <Button
          key={i + 1}
          onClick={() => onNumberPress(i + 1)}
          className="aspect-square h-auto text-xl font-bold"
          variant="secondary"
        >
          {i + 1}
        </Button>
      ))}
      <Button
        onClick={onErase}
        className="aspect-square h-auto"
        variant="secondary"
      >
        <Eraser className="w-6 h-6" />
        <span className="sr-only">清除</span>
      </Button>
    </div>
  );
}
