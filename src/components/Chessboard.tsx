import React, { useState, useEffect, useRef } from 'react';
import ChessPiece from './ChessPiece';
import { 
  Board, 
  GameState, 
  Square, 
  Piece, 
  Color,
  PieceType,
  getLegalMoves,
  makeMove,
  getKingSafety
} from '../utils/chessLogic';
import { getAIMove, LLMConfig } from '../utils/llmUtils';
import { useToast } from '@/hooks/use-toast';

interface ChessboardProps {
  gameMode: 'human-vs-human' | 'human-vs-ai';
  llmConfig?: LLMConfig;
  playerColor?: Color;
  onGameEnd?: (result: 'checkmate' | 'stalemate' | 'king-captured', winner?: Color) => void;
  onMove?: (move: { from: string, to: string, san: string, color: Color }) => void;
  onUndo?: () => void;
  isBoardFlipped?: boolean;
  key?: number;
  gameState: GameState;
  onGameStateChange: (newState: GameState) => void;
}

const Chessboard: React.FC<ChessboardProps> = ({
  gameMode = 'human-vs-human',
  llmConfig,
  playerColor = 'w',
  onGameEnd,
  onMove,
  onUndo,
  isBoardFlipped = false,
  key,
  gameState,
  onGameStateChange
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square, to: Square } | null>(null);
  const [isFlipped, setIsFlipped] = useState(isBoardFlipped);
  const [isDragging, setIsDragging] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [kingSafety, setKingSafety] = useState<{ kingSquare: Square, dangerSquares: Square[], attackPaths: Square[] } | null>(null);

  // Update king safety whenever the game state changes
  useEffect(() => {
    const safety = getKingSafety(gameState, gameState.turn);
    setKingSafety(safety);
  }, [gameState]);

  // Reset local state when key changes
  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setAiThinking(false);
  }, [key]);
  
  const boardRef = useRef<HTMLDivElement>(null);
  const draggedPieceRef = useRef<{ square: Square, piece: Piece } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const isAITurn = gameMode === 'human-vs-ai' && gameState.turn !== playerColor;
    
    if (isAITurn && !gameState.checkmate && !gameState.stalemate && llmConfig) {
      const getMove = async () => {
        setAiThinking(true);
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const move = await getAIMove(gameState, llmConfig);
          
          if (move) {
            const newGameState = makeMove(gameState, {
              from: move.from as Square,
              to: move.to as Square,
              promotion: move.promotion as PieceType
            });
            
            if (newGameState !== gameState) {
              onGameStateChange(newGameState);
              setLastMove({ from: move.from as Square, to: move.to as Square });
              
              const lastMoveNotation = newGameState.history[newGameState.history.length - 1].notation;
              if (onMove) {
                onMove({ 
                  from: move.from, 
                  to: move.to, 
                  san: lastMoveNotation,
                  color: gameState.turn
                });
              }
            } else {
              console.error('AI returned invalid move:', move);
              toast({
                title: "AI Error",
                description: "The AI attempted an invalid move. Please try again.",
                variant: "destructive"
              });
            }
          } else {
            console.error('Failed to get AI move');
            toast({
              title: "AI Error",
              description: "Failed to get a move from the AI. Please check your API key.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Error during AI move:', error);
          toast({
            title: "AI Error",
            description: "An error occurred while getting the AI's move.",
            variant: "destructive"
          });
        } finally {
          setAiThinking(false);
        }
      };
      
      getMove();
    }
  }, [gameState.turn, gameMode, playerColor, llmConfig, gameState.checkmate, gameState.stalemate]);

  useEffect(() => {
    if (gameState.checkmate && onGameEnd) {
      const winner: Color = gameState.turn === 'w' ? 'b' : 'w';
      onGameEnd('checkmate', winner);
    } else if (gameState.stalemate && onGameEnd) {
      onGameEnd('stalemate');
    } else if (gameState.gameOver && gameState.winner) {
      onGameEnd?.('king-captured', gameState.winner);
    }
  }, [gameState.checkmate, gameState.stalemate, gameState.gameOver, gameState.winner]);

  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [gameState.turn]);

  const handleSquareClick = (square: Square) => {
    if (gameState.gameOver) return;

    const piece = gameState.board[square];
    
    if (gameMode === 'human-vs-ai' && gameState.turn !== playerColor) {
      return;
    }
    
    if (selectedSquare) {
      if (legalMoves.includes(square)) {
        const newGameState = makeMove(gameState, { 
          from: selectedSquare, 
          to: square,
          promotion: shouldPromote(selectedSquare, square, gameState.board) ? ('q' as PieceType) : undefined 
        });
        
        if (newGameState !== gameState) {
          onGameStateChange(newGameState);
          setLastMove({ from: selectedSquare, to: square });
          
          const lastMoveNotation = newGameState.history[newGameState.history.length - 1].notation;
          if (onMove) {
            onMove({ 
              from: selectedSquare, 
              to: square, 
              san: lastMoveNotation,
              color: gameState.turn
            });
          }
        }
      }
      
      setSelectedSquare(null);
      setLegalMoves([]);
    } else if (piece && piece.color === gameState.turn) {
      setSelectedSquare(square);
      setLegalMoves(getLegalMoves(gameState, square));
    }
  };

  const handlePieceDragStart = (square: Square) => {
    const piece = gameState.board[square];
    
    if ((gameMode === 'human-vs-ai' && gameState.turn !== playerColor) || 
        !piece || piece.color !== gameState.turn) {
      return;
    }
    
    setIsDragging(true);
    draggedPieceRef.current = { square, piece };
    setSelectedSquare(square);
    setLegalMoves(getLegalMoves(gameState, square));
  };

  const handlePieceDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !draggedPieceRef.current || !boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    const squareSize = boardRect.width / 8;
    
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = 0;
        clientY = 0;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const boardX = clientX - boardRect.left;
    const boardY = clientY - boardRect.top;
    
    if (boardX >= 0 && boardX < boardRect.width && boardY >= 0 && boardY < boardRect.height) {
      let fileIdx = Math.floor(boardX / squareSize);
      let rankIdx = 7 - Math.floor(boardY / squareSize);
      
      if (isFlipped) {
        fileIdx = 7 - fileIdx;
        rankIdx = 7 - rankIdx;
      }
      
      const file = String.fromCharCode(97 + fileIdx);
      const rank = rankIdx + 1;
      const targetSquare = `${file}${rank}` as Square;
      
      if (legalMoves.includes(targetSquare)) {
        const fromSquare = draggedPieceRef.current.square;
        const newGameState = makeMove(gameState, { 
          from: fromSquare, 
          to: targetSquare,
          promotion: shouldPromote(fromSquare, targetSquare, gameState.board) ? ('q' as PieceType) : undefined 
        });
        
        if (newGameState !== gameState) {
          onGameStateChange(newGameState);
          setLastMove({ from: fromSquare, to: targetSquare });
          
          const lastMoveNotation = newGameState.history[newGameState.history.length - 1].notation;
          if (onMove) {
            onMove({ 
              from: fromSquare, 
              to: targetSquare, 
              san: lastMoveNotation,
              color: gameState.turn
            });
          }
        }
      }
    }
    
    setIsDragging(false);
    draggedPieceRef.current = null;
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  const shouldPromote = (from: Square, to: Square, board: Board): boolean => {
    const piece = board[from];
    if (!piece || piece.type !== 'p') return false;
    
    const toRank = parseInt(to.charAt(1));
    return (piece.color === 'w' && toRank === 8) || (piece.color === 'b' && toRank === 1);
  };

  const renderSquares = () => {
    const squares = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
    
    const orderedFiles = isFlipped ? [...files].reverse() : files;
    const orderedRanks = isFlipped ? ranks : [...ranks].reverse();
    
    for (let rankIdx = 0; rankIdx < 8; rankIdx++) {
      for (let fileIdx = 0; fileIdx < 8; fileIdx++) {
        const file = orderedFiles[fileIdx];
        const rank = orderedRanks[rankIdx];
        const square = `${file}${rank}` as Square;
        const isLightSquare = (fileIdx + rankIdx) % 2 === 0;
        
        const piece = gameState.board[square];
        
        const isSelected = selectedSquare === square;
        const isLegalMove = legalMoves.includes(square);
        const isLastMoveFrom = lastMove && lastMove.from === square;
        const isLastMoveTo = lastMove && lastMove.to === square;
        
        const isCheck = gameState.check && piece?.type === 'k' && piece.color === gameState.turn;
        
        let highlightClass = '';
        if (isSelected) {
          highlightClass = 'bg-chess-highlight';
        } else if (isLegalMove) {
          highlightClass = 'bg-chess-highlight/50';
        } else if (isLastMoveFrom || isLastMoveTo) {
          highlightClass = 'bg-chess-last-move';
        } else if (isCheck) {
          highlightClass = 'bg-chess-check';
        } else if (kingSafety?.attackPaths.includes(square)) {
          highlightClass = 'bg-red-500'; // Brighter, more dangerous red for attack path
        }
        
        squares.push(
          <div 
            key={square}
            className={`chess-square ${isLightSquare ? 'bg-chess-light-square' : 'bg-chess-dark-square'} ${highlightClass}`}
            onClick={() => handleSquareClick(square)}
          >
            {piece && (
              <ChessPiece 
                type={piece.type} 
                color={piece.color} 
                isDragging={isDragging && selectedSquare === square}
                onDragStart={() => handlePieceDragStart(square)}
                onDragEnd={handlePieceDragEnd}
              />
            )}
            
            {isLegalMove && !piece && (
              <div className="move-indicator" />
            )}
            
            {fileIdx === 0 && (
              <div className="board-row-label">{rank}</div>
            )}
            
            {rankIdx === 7 && (
              <div className="board-col-label">{file}</div>
            )}
          </div>
        );
      }
    }
    
    return squares;
  };

  const [isAiThinking, setIsAiThinking] = useState(false);

  // Get move from AI
  const getMove = async () => {
    if (!llmConfig) return;
    
    try {
      setIsAiThinking(true);
      const move = await getAIMove(gameState, llmConfig);
      setIsAiThinking(false);
      
      if (!move) {
        toast({
          title: "AI Error",
          description: "Failed to get a move from the AI. Please check your API key.",
          variant: "destructive"
        });
        return;
      }

      // Make the AI's move
      const newState = makeMove(gameState, move);
      if (!newState) {
        toast({
          title: "Invalid Move",
          description: "The AI suggested an invalid move. Please try again.",
          variant: "destructive"
        });
        return;
      }

      onGameStateChange(newState);
      setLastMove({ from: move.from, to: move.to });
      onMove?.({ from: move.from, to: move.to, san: newState.history[newState.history.length - 1].notation, color: gameState.turn });

      // Check for game end conditions
      if (newState.checkmate || newState.stalemate || newState.gameOver) {
        onGameEnd?.(newState.checkmate ? 'checkmate' : newState.stalemate ? 'stalemate' : 'king-captured', newState.checkmate ? (newState.turn === 'w' ? 'b' : 'w') : newState.gameOver ? newState.winner : undefined);
      }
    } catch (error) {
      console.error('Error getting AI move:', error);
      setIsAiThinking(false);
      toast({
        title: "AI Error",
        description: error instanceof Error ? error.message : "Failed to get a move from the AI",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="relative">
      <div 
        ref={boardRef}
        className="chess-board relative"
        onMouseMove={(e: React.MouseEvent) => {
          // Event handler intentionally left empty but receives event parameter
        }}
        onMouseUp={handlePieceDragEnd}
        onMouseLeave={handlePieceDragEnd}
        onTouchMove={(e: React.TouchEvent) => {
          // Event handler intentionally left empty but receives event parameter
        }}
        onTouchEnd={(e: React.TouchEvent | React.MouseEvent) => handlePieceDragEnd(e)}
      >
        {renderSquares()}
      </div>
      
      {aiThinking && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
            <div className="w-4 h-4 bg-chess-ai-purple rounded-full thinking-indicator"></div>
            <span className="text-lg font-medium text-black">AI is thinking...</span>
          </div>
        </div>
      )}
      
      {/* AI Thinking Indicator */}
      {isAiThinking && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <span className="text-black font-medium">AI is thinking...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chessboard;
