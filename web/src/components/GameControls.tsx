import React from 'react';
import { Button } from '@/components/ui/button';

interface GameControlsProps {
  onUndo: () => void;
  onReset: () => void;
  onFlipBoard: () => void;
  isBoardFlipped: boolean;
}

export function GameControls({
  onUndo,
  onReset,
  onFlipBoard,
  isBoardFlipped
}: GameControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Button onClick={onUndo} variant="outline" className="flex-1">
          Undo Move
        </Button>
        <Button onClick={onReset} variant="outline" className="flex-1">
          Reset Game
        </Button>
      </div>
      <Button
        onClick={onFlipBoard}
        variant="outline"
        className="w-full"
      >
        {isBoardFlipped ? 'Reset View' : 'Flip Board'}
      </Button>
    </div>
  );
}
