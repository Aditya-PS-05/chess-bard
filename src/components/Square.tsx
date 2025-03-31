import { Square as ChessSquare, Piece } from '../utils/chessLogic';

interface SquareProps {
  square: ChessSquare;
  piece: Piece | null;
  isSelected?: boolean;
  isLegalMove?: boolean;
  isDangerSquare?: boolean;
  isEscapeSquare?: boolean;
  onClick: () => void;
}

export function Square({
  square,
  piece,
  isSelected,
  isLegalMove,
  isDangerSquare,
  isEscapeSquare,
  onClick
}: SquareProps) {
  const file = square.charCodeAt(0) - 97;
  const rank = 8 - parseInt(square[1]);
  const isLight = (file + rank) % 2 === 0;
  
  let bgColor = isLight ? 'bg-chess-light' : 'bg-chess-dark';
  if (isSelected) {
    bgColor = 'bg-chess-selected';
  } else if (isDangerSquare) {
    bgColor = 'bg-chess-danger';
  } else if (isEscapeSquare) {
    bgColor = 'bg-chess-escape';
  }
  
  return (
    <div
      className={`relative aspect-square ${bgColor} transition-colors duration-150`}
      onClick={onClick}
    >
      {isLegalMove && !piece && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-chess-legal opacity-50" />
        </div>
      )}
      
      {isLegalMove && piece && (
        <div className="absolute inset-0 ring-2 ring-chess-legal ring-opacity-50" />
      )}
      
      {piece && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={`/pieces/${piece.color}${piece.type}.svg`}
            alt={`${piece.color === 'w' ? 'White' : 'Black'} ${piece.type.toUpperCase()}`}
            className="w-4/5 h-4/5 pointer-events-none"
          />
        </div>
      )}
    </div>
  );
}
