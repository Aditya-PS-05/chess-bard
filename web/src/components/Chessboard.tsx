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
  initializeChessGame
} from '../utils/chessLogic';
import { getAIMove, LLMConfig } from '../utils/llmUtils';
import { useToast } from '@/hooks/use-toast';

interface ChessboardProps {
  gameMode: 'human-vs-human' | 'human-vs-ai';
  llmConfig?: LLMConfig;
  playerColor?: Color;
  onMove?: (move: { from: string, to: string, notation: string }) => void;
  onGameEnd?: (result: 'checkmate' | 'stalemate', winner?: Color) => void;
}

const Chessboard: React.FC<ChessboardProps> = ({
  gameMode = 'human-vs-human',
  llmConfig,
  playerColor = 'w',
  onMove,
  onGameEnd
}) => {
  const [gameState, setGameState] = useState<GameState>(initializeChessGame());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square, to: Square } | null>(null);
  const [isFlipped, setIsFlipped] = useState(playerColor === 'b');
  const [isDragging, setIsDragging] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  
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
              setGameState(newGameState);
              setLastMove({ from: move.from as Square, to: move.to as Square });
              
              const lastMoveNotation = newGameState.history[newGameState.history.length - 1].notation;
              if (onMove) {
                onMove({ 
                  from: move.from, 
                  to: move.to, 
                  notation: lastMoveNotation 
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
    }
  }, [gameState.checkmate, gameState.stalemate]);

  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [gameState.turn]);

  const handleSquareClick = (square: Square) => {
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
          setGameState(newGameState);
          setLastMove({ from: selectedSquare, to: square });
          
          const lastMoveNotation = newGameState.history[newGameState.history.length - 1].notation;
          if (onMove) {
            onMove({ 
              from: selectedSquare, 
              to: square, 
              notation: lastMoveNotation 
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
          setGameState(newGameState);
          setLastMove({ from: fromSquare, to: targetSquare });
          
          const lastMoveNotation = newGameState.history[newGameState.history.length - 1].notation;
          if (onMove) {
            onMove({ 
              from: fromSquare, 
              to: targetSquare, 
              notation: lastMoveNotation 
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

      setGameState(newState);
      setLastMove({ from: move.from, to: move.to });
      onMove?.({ from: move.from, to: move.to, notation: newState.history[newState.history.length - 1].notation });

      // Check for game end conditions
      if (newState.checkmate || newState.stalemate) {
        onGameEnd?.(newState.checkmate ? 'checkmate' : 'stalemate', newState.checkmate ? (newState.turn === 'w' ? 'b' : 'w') : undefined);
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
            <span className="text-lg font-medium">AI is thinking...</span>
          </div>
        </div>
      )}
      
      {/* AI Thinking Indicator */}
      {isAiThinking && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <span className="text-white font-medium">AI is thinking...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chessboard;
