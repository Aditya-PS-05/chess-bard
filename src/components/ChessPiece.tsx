
import React from 'react';
import { PieceType, Color } from '../utils/chessLogic';

interface ChessPieceProps {
  type: PieceType;
  color: Color;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (e: React.MouseEvent | React.TouchEvent) => void;
}

const ChessPiece: React.FC<ChessPieceProps> = ({
  type,
  color,
  isDragging = false,
  onDragStart,
  onDragEnd
}) => {
  // Map of piece symbols to Unicode characters
  const pieceSymbols: Record<Color, Record<PieceType, string>> = {
    w: {
      p: '♙', // White Pawn
      n: '♘', // White Knight
      b: '♗', // White Bishop
      r: '♖', // White Rook
      q: '♕', // White Queen
      k: '♔'  // White King
    },
    b: {
      p: '♟', // Black Pawn
      n: '♞', // Black Knight
      b: '♝', // Black Bishop
      r: '♜', // Black Rook
      q: '♛', // Black Queen
      k: '♚'  // Black King
    }
  };

  // SVG paths for pieces (fallback if unicode doesn't render well)
  const getSVGPath = () => {
    switch (`${color}${type}`) {
      case 'wp': return '/pieces/wP.svg';
      case 'wn': return '/pieces/wN.svg';
      case 'wb': return '/pieces/wB.svg';
      case 'wr': return '/pieces/wR.svg';
      case 'wq': return '/pieces/wQ.svg';
      case 'wk': return '/pieces/wK.svg';
      case 'bp': return '/pieces/bP.svg';
      case 'bn': return '/pieces/bN.svg';
      case 'bb': return '/pieces/bB.svg';
      case 'br': return '/pieces/bR.svg';
      case 'bq': return '/pieces/bQ.svg';
      case 'bk': return '/pieces/bK.svg';
      default: return '';
    }
  };

  return (
    <div 
      className={`chess-piece ${isDragging ? 'piece-dragging' : ''}`}
      onMouseDown={onDragStart}
      onMouseUp={onDragEnd}
      onTouchStart={onDragStart}
      onTouchEnd={onDragEnd}
      draggable={false}
    >
      <div className="flex items-center justify-center w-full h-full text-5xl select-none">
        {/* Render both SVG and Unicode fallback */}
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{
            fontSize: '3.5rem', 
            color: color === 'w' ? '#FFFFFF' : '#000000',
            textShadow: color === 'w' ? '0 0 2px #000' : '0 0 2px #fff',
          }}
        >
          {pieceSymbols[color][type]}
        </div>
      </div>
    </div>
  );
};

export default ChessPiece;
