
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Square, ChevronLeft } from 'lucide-react';

interface GameControlsProps {
  onReset: () => void;
  onUndo?: () => void;
  onFlipBoard?: () => void;
  canUndo: boolean;
  gameMode: 'human-vs-human' | 'human-vs-ai';
}

const GameControls: React.FC<GameControlsProps> = ({
  onReset,
  onUndo,
  onFlipBoard,
  canUndo,
  gameMode
}) => {
  return (
    <div className="flex flex-wrap gap-2 md:flex-nowrap">
      <Button 
        variant="default" 
        onClick={onReset} 
        className="flex-1 bg-gray-800 hover:bg-gray-700"
      >
        <Square size={18} className="mr-2" />
        New Game
      </Button>
      
      {onUndo && (
        <Button 
          variant="outline" 
          onClick={onUndo} 
          disabled={!canUndo} 
          className="flex-1 border-gray-700 text-white"
        >
          <ChevronLeft size={18} className="mr-2" />
          Undo
          {gameMode === 'human-vs-ai' && " (2 Moves)"}
        </Button>
      )}
      
      {onFlipBoard && (
        <Button 
          variant="outline" 
          onClick={onFlipBoard} 
          className="flex-1 border-gray-700 text-white"
        >
          <RotateCcw size={18} className="mr-2" />
          Flip Board
        </Button>
      )}
    </div>
  );
};

export default GameControls;
