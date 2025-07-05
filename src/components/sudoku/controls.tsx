"use client";

import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';

interface ControlsProps {
  onNumberPress: (num: number) => void;
  onErase: () => void;
  determinedValue: number | null;
}

export function Controls({ onNumberPress, onErase, determinedValue }: ControlsProps) {
  return (
    <div className="grid grid-cols-5 gap-2 w-full">
      {Array.from({ length: 9 }).map((_, i) => {
        const num = i + 1;
        const isDisabled = determinedValue !== null && determinedValue !== num;
        return (
          <Button
            key={num}
            onClick={() => onNumberPress(num)}
            className="aspect-square h-auto text-[clamp(1.125rem,5vw,1.25rem)] font-bold"
            variant="secondary"
            disabled={isDisabled}
          >
            {num}
          </Button>
        );
      })}
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
