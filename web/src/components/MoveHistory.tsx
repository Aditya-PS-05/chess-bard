import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Move {
  san: string;  // Standard Algebraic Notation
  color: 'w' | 'b';
  number: number;
}

interface MoveHistoryProps {
  moves: Move[];
  whiteScore?: number;
  blackScore?: number;
}

export function MoveHistory({ moves, whiteScore = 0, blackScore = 0 }: MoveHistoryProps) {
  const movesByNumber = moves.reduce((acc, move) => {
    const number = move.number;
    if (!acc[number]) {
      acc[number] = { white: null, black: null };
    }
    acc[number][move.color === 'w' ? 'white' : 'black'] = move.san;
    return acc;
  }, {} as Record<number, { white: string | null; black: string | null; }>);

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium">
          <span className="text-white">White</span>
          <span className="text-gray-400 mx-2">vs</span>
          <span className="text-white">Black</span>
        </div>
        <div className="text-sm">
          <span className="text-white">{whiteScore}</span>
          <span className="text-gray-400 mx-2">-</span>
          <span className="text-white">{blackScore}</span>
        </div>
      </div>
      
      <ScrollArea className="h-[300px]">
        <div className="space-y-1">
          {Object.entries(movesByNumber).map(([number, { white, black }]) => (
            <div key={number} className="flex text-sm">
              <span className="w-8 text-gray-500">{number}.</span>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <span className="text-white">{white || ''}</span>
                <span className="text-white">{black || ''}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
