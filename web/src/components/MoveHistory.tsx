
import React from 'react';
import { Move } from '../utils/chessLogic';

interface MoveHistoryProps {
  moves: Move[];
  startingMoveNumber?: number;
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ 
  moves, 
  startingMoveNumber = 1 
}) => {
  // Group moves by pairs (white and black)
  const groupedMoves = [];
  for (let i = 0; i < moves.length; i += 2) {
    groupedMoves.push({
      moveNumber: Math.floor(i / 2) + startingMoveNumber,
      white: moves[i],
      black: i + 1 < moves.length ? moves[i + 1] : undefined
    });
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full overflow-auto">
      <h3 className="text-white font-bold mb-3 text-lg">Move History</h3>
      
      <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-1 text-white">
        <div className="font-medium text-gray-400">#</div>
        <div className="font-medium text-gray-400">White</div>
        <div className="font-medium text-gray-400">Black</div>
        
        {groupedMoves.length === 0 ? (
          <div className="col-span-3 text-center text-gray-400 my-4">
            No moves yet
          </div>
        ) : (
          groupedMoves.map((group, index) => (
            <React.Fragment key={group.moveNumber}>
              <div className="text-gray-400">{group.moveNumber}.</div>
              <div className={group.white?.isCheck ? "text-yellow-300" : "text-white"}>
                {group.white?.notation}
                {group.white?.isCheckmate && <span className="ml-1 text-red-400">♛</span>}
              </div>
              <div className={group.black?.isCheck ? "text-yellow-300" : "text-white"}>
                {group.black?.notation}
                {group.black?.isCheckmate && <span className="ml-1 text-red-400">♛</span>}
              </div>
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
};

export default MoveHistory;
