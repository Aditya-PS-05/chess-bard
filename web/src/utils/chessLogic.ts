export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Color = 'w' | 'b';
export type Piece = {
  type: PieceType;
  color: Color;
};

export type Square = string; // e.g., "a1", "e4"
export type Board = { [square: string]: Piece | null };

export interface GameState {
  board: Board;
  turn: Color;
  castling: { 
    w: { kingSide: boolean; queenSide: boolean }; 
    b: { kingSide: boolean; queenSide: boolean }; 
  };
  enPassant: Square | null;
  halfMoveClock: number;
  fullMoveNumber: number;
  check: boolean;
  checkmate: boolean;
  stalemate: boolean;
  history: Move[];
  capturedPieces: { w: PieceType[], b: PieceType[] };
  winner: Color | null;
  gameOver: boolean;
}

export interface Move {
  from: Square;
  to: Square;
  promotion?: PieceType;
  piece: Piece;
  capturedPiece?: Piece;
  isCheck?: boolean;
  isCheckmate?: boolean;
  isEnPassant?: boolean;
  isCastle?: 'kingside' | 'queenside';
  notation: string; // algebraic notation e.g. "e4", "Nf3", "O-O"
}

export function initializeChessGame(): GameState {
  const board: Board = {};
  
  for (let row = 1; row <= 8; row++) {
    for (let col = 0; col < 8; col++) {
      const file = String.fromCharCode(97 + col);
      const square = `${file}${row}`;
      board[square] = null;
    }
  }

  for (let col = 0; col < 8; col++) {
    const file = String.fromCharCode(97 + col);
    board[`${file}2`] = { type: 'p', color: 'w' };
    board[`${file}7`] = { type: 'p', color: 'b' };
  }

  board.a1 = { type: 'r', color: 'w' };
  board.b1 = { type: 'n', color: 'w' };
  board.c1 = { type: 'b', color: 'w' };
  board.d1 = { type: 'q', color: 'w' };
  board.e1 = { type: 'k', color: 'w' };
  board.f1 = { type: 'b', color: 'w' };
  board.g1 = { type: 'n', color: 'w' };
  board.h1 = { type: 'r', color: 'w' };
  
  board.a8 = { type: 'r', color: 'b' };
  board.b8 = { type: 'n', color: 'b' };
  board.c8 = { type: 'b', color: 'b' };
  board.d8 = { type: 'q', color: 'b' };
  board.e8 = { type: 'k', color: 'b' };
  board.f8 = { type: 'b', color: 'b' };
  board.g8 = { type: 'n', color: 'b' };
  board.h8 = { type: 'r', color: 'b' };

  return {
    board,
    turn: 'w',
    castling: {
      w: { kingSide: true, queenSide: true },
      b: { kingSide: true, queenSide: true }
    },
    enPassant: null,
    halfMoveClock: 0,
    fullMoveNumber: 1,
    check: false,
    checkmate: false,
    stalemate: false,
    history: [],
    capturedPieces: { w: [], b: [] },
    winner: null,
    gameOver: false
  };
}

export function getLegalMoves(state: GameState, square: Square): Square[] {
  const piece = state.board[square];
  if (!piece || piece.color !== state.turn) return [];

  // Return all potential moves without filtering for check
  return getPotentialMoves(state, square);
}

function wouldBeInCheck(state: GameState, from: Square, to: Square): boolean {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  
  const piece = newState.board[from];
  newState.board[to] = piece;
  newState.board[from] = null;
  
  return isInCheck(newState, state.turn);
}

function isInCheck(state: GameState, color: Color): boolean {
  let kingSquare: Square | null = null;
  
  for (const [square, piece] of Object.entries(state.board)) {
    if (piece && piece.type === 'k' && piece.color === color) {
      kingSquare = square as Square;
      break;
    }
  }
  
  if (!kingSquare) return false;
  
  for (const [square, piece] of Object.entries(state.board)) {
    if (piece && piece.color !== color) {
      const potentialMoves = getPotentialMoves(state, square as Square, true);
      if (potentialMoves.includes(kingSquare)) {
        return true;
      }
    }
  }
  
  return false;
}

function getPotentialMoves(state: GameState, square: Square, ignoringCheck = false): Square[] {
  const piece = state.board[square];
  if (!piece) return [];
  
  const [file, rank] = square.split('');
  const fileIdx = file.charCodeAt(0) - 97;
  const rankIdx = parseInt(rank) - 1;
  
  const moves: Square[] = [];
  
  switch (piece.type) {
    case 'p':
      if (piece.color === 'w') {
        const oneAhead = `${file}${rankIdx + 2}`;
        if (!state.board[oneAhead]) {
          moves.push(oneAhead);
          
          if (rankIdx === 1) {
            const twoAhead = `${file}${rankIdx + 3}`;
            if (!state.board[twoAhead]) {
              moves.push(twoAhead);
            }
          }
        }
        
        for (const offset of [-1, 1]) {
          if (fileIdx + offset >= 0 && fileIdx + offset < 8) {
            const captureFile = String.fromCharCode(97 + fileIdx + offset);
            const captureSquare = `${captureFile}${rankIdx + 2}`;
            const targetPiece = state.board[captureSquare];
            
            if (targetPiece && targetPiece.color === 'b') {
              moves.push(captureSquare);
            }
            
            if (state.enPassant === captureSquare) {
              moves.push(captureSquare);
            }
          }
        }
      } else {
        const oneAhead = `${file}${rankIdx}`;
        if (!state.board[oneAhead]) {
          moves.push(oneAhead);
          
          if (rankIdx === 6) {
            const twoAhead = `${file}${rankIdx - 1}`;
            if (!state.board[twoAhead]) {
              moves.push(twoAhead);
            }
          }
        }
        
        for (const offset of [-1, 1]) {
          if (fileIdx + offset >= 0 && fileIdx + offset < 8) {
            const captureFile = String.fromCharCode(97 + fileIdx + offset);
            const captureSquare = `${captureFile}${rankIdx}`;
            const targetPiece = state.board[captureSquare];
            
            if (targetPiece && targetPiece.color === 'w') {
              moves.push(captureSquare);
            }
            
            if (state.enPassant === captureSquare) {
              moves.push(captureSquare);
            }
          }
        }
      }
      break;
      
    case 'n':
      const knightOffsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      
      for (const [fileOffset, rankOffset] of knightOffsets) {
        const newFileIdx = fileIdx + fileOffset;
        const newRankIdx = rankIdx + rankOffset;
        
        if (newFileIdx >= 0 && newFileIdx < 8 && newRankIdx >= 0 && newRankIdx < 8) {
          const newFile = String.fromCharCode(97 + newFileIdx);
          const newRank = newRankIdx + 1;
          const newSquare = `${newFile}${newRank}`;
          const targetPiece = state.board[newSquare];
          
          if (!targetPiece || targetPiece.color !== piece.color) {
            moves.push(newSquare);
          }
        }
      }
      break;
      
    case 'b':
      const bishopDirections = [
        [-1, -1], [-1, 1], [1, -1], [1, 1]
      ];
      
      for (const [fileOffset, rankOffset] of bishopDirections) {
        let newFileIdx = fileIdx + fileOffset;
        let newRankIdx = rankIdx + rankOffset;
        
        while (newFileIdx >= 0 && newFileIdx < 8 && newRankIdx >= 0 && newRankIdx < 8) {
          const newFile = String.fromCharCode(97 + newFileIdx);
          const newRank = newRankIdx + 1;
          const newSquare = `${newFile}${newRank}`;
          const targetPiece = state.board[newSquare];
          
          if (!targetPiece) {
            moves.push(newSquare);
          } else if (targetPiece.color !== piece.color) {
            moves.push(newSquare);
            break;
          } else {
            break;
          }
          
          newFileIdx += fileOffset;
          newRankIdx += rankOffset;
        }
      }
      break;
      
    case 'r':
      const rookDirections = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
      ];
      
      for (const [fileOffset, rankOffset] of rookDirections) {
        let newFileIdx = fileIdx + fileOffset;
        let newRankIdx = rankIdx + rankOffset;
        
        while (newFileIdx >= 0 && newFileIdx < 8 && newRankIdx >= 0 && newRankIdx < 8) {
          const newFile = String.fromCharCode(97 + newFileIdx);
          const newRank = newRankIdx + 1;
          const newSquare = `${newFile}${newRank}`;
          const targetPiece = state.board[newSquare];
          
          if (!targetPiece) {
            moves.push(newSquare);
          } else if (targetPiece.color !== piece.color) {
            moves.push(newSquare);
            break;
          } else {
            break;
          }
          
          newFileIdx += fileOffset;
          newRankIdx += rankOffset;
        }
      }
      break;
      
    case 'q':
      const queenDirections = [
        [-1, -1], [-1, 0], [-1, 1], [0, -1],
        [0, 1], [1, -1], [1, 0], [1, 1]
      ];
      
      for (const [fileOffset, rankOffset] of queenDirections) {
        let newFileIdx = fileIdx + fileOffset;
        let newRankIdx = rankIdx + rankOffset;
        
        while (newFileIdx >= 0 && newFileIdx < 8 && newRankIdx >= 0 && newRankIdx < 8) {
          const newFile = String.fromCharCode(97 + newFileIdx);
          const newRank = newRankIdx + 1;
          const newSquare = `${newFile}${newRank}`;
          const targetPiece = state.board[newSquare];
          
          if (!targetPiece) {
            moves.push(newSquare);
          } else if (targetPiece.color !== piece.color) {
            moves.push(newSquare);
            break;
          } else {
            break;
          }
          
          newFileIdx += fileOffset;
          newRankIdx += rankOffset;
        }
      }
      break;
      
    case 'k':
      const kingDirections = [
        [-1, -1], [-1, 0], [-1, 1], [0, -1],
        [0, 1], [1, -1], [1, 0], [1, 1]
      ];
      
      for (const [fileOffset, rankOffset] of kingDirections) {
        const newFileIdx = fileIdx + fileOffset;
        const newRankIdx = rankIdx + rankOffset;
        
        if (newFileIdx >= 0 && newFileIdx < 8 && newRankIdx >= 0 && newRankIdx < 8) {
          const newFile = String.fromCharCode(97 + newFileIdx);
          const newRank = newRankIdx + 1;
          const newSquare = `${newFile}${newRank}`;
          const targetPiece = state.board[newSquare];
          
          if (!targetPiece || targetPiece.color !== piece.color) {
            moves.push(newSquare);
          }
        }
      }
      
      if (ignoringCheck) break;
      
      if (piece.color === 'w' && square === 'e1') {
        if (state.castling.w.kingSide && 
            !state.board.f1 && 
            !state.board.g1 && 
            !isInCheck(state, 'w') && 
            !wouldBeInCheck(state, 'e1', 'f1')) {
          moves.push('g1');
        }
        
        if (state.castling.w.queenSide && 
            !state.board.d1 && 
            !state.board.c1 && 
            !state.board.b1 && 
            !isInCheck(state, 'w') && 
            !wouldBeInCheck(state, 'e1', 'd1')) {
          moves.push('c1');
        }
      } else if (piece.color === 'b' && square === 'e8') {
        if (state.castling.b.kingSide && 
            !state.board.f8 && 
            !state.board.g8 && 
            !isInCheck(state, 'b') && 
            !wouldBeInCheck(state, 'e8', 'f8')) {
          moves.push('g8');
        }
        
        if (state.castling.b.queenSide && 
            !state.board.d8 && 
            !state.board.c8 && 
            !state.board.b8 && 
            !isInCheck(state, 'b') && 
            !wouldBeInCheck(state, 'e8', 'd8')) {
          moves.push('c8');
        }
      }
      break;
  }
  
  return moves;
}

export function makeMove(state: GameState, move: { from: Square, to: Square, promotion?: PieceType }): GameState {
  const { from, to, promotion } = move;
  
  // If game is over, return state without making any moves
  if (state.gameOver) return state;
  
  const piece = state.board[from];
  if (!piece) return state;
  if (piece.color !== state.turn) return state;
  
  const legalMoves = getLegalMoves(state, from);
  if (!legalMoves.includes(to)) return state;
  
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  
  const capturedPiece = newState.board[to];
  if (capturedPiece) {
    newState.capturedPieces[piece.color].push(capturedPiece.type);
    
    // Check if a king was captured
    if (capturedPiece.type === 'k') {
      newState.gameOver = true;
      newState.winner = piece.color;
      // Return immediately after king capture to prevent further moves
      newState.board[to] = piece;
      newState.board[from] = null;
      return newState;
    }
  }
  
  if (piece.type === 'p') {
    if (to === newState.enPassant) {
      const file = to.charAt(0);
      const rank = piece.color === 'w' ? '5' : '4';
      const enPassantPieceSquare = `${file}${rank}`;
      const capturedPawn = newState.board[enPassantPieceSquare];
      
      if (capturedPawn) {
        newState.board[enPassantPieceSquare] = null;
        newState.capturedPieces[capturedPawn.color].push(capturedPawn.type);
      }
    }
    
    if (Math.abs(parseInt(from.charAt(1)) - parseInt(to.charAt(1))) === 2) {
      const file = from.charAt(0);
      const rank = piece.color === 'w' ? '3' : '6';
      newState.enPassant = `${file}${rank}`;
    } else {
      newState.enPassant = null;
    }
    
    if ((piece.color === 'w' && to.charAt(1) === '8') || 
        (piece.color === 'b' && to.charAt(1) === '1')) {
      const defaultPromotion: PieceType = 'q';
      const promotionPiece: PieceType = promotion || defaultPromotion;
      newState.board[to] = { type: promotionPiece, color: piece.color };
      newState.board[from] = null;
    } else {
      newState.board[to] = piece;
      newState.board[from] = null;
    }
  } else {
    newState.enPassant = null;
    
    if (piece.type === 'k') {
      if (piece.color === 'w') {
        newState.castling.w.kingSide = false;
        newState.castling.w.queenSide = false;
      } else {
        newState.castling.b.kingSide = false;
        newState.castling.b.queenSide = false;
      }
      
      if (from === 'e1' && to === 'g1') {
        newState.board.f1 = newState.board.h1;
        newState.board.h1 = null;
      } else if (from === 'e1' && to === 'c1') {
        newState.board.d1 = newState.board.a1;
        newState.board.a1 = null;
      } else if (from === 'e8' && to === 'g8') {
        newState.board.f8 = newState.board.h8;
        newState.board.h8 = null;
      } else if (from === 'e8' && to === 'c8') {
        newState.board.d8 = newState.board.a8;
        newState.board.a8 = null;
      }
    }
    
    if (piece.type === 'r') {
      if (from === 'a1') newState.castling.w.queenSide = false;
      if (from === 'h1') newState.castling.w.kingSide = false;
      if (from === 'a8') newState.castling.b.queenSide = false;
      if (from === 'h8') newState.castling.b.kingSide = false;
    }
    
    newState.board[to] = piece;
    newState.board[from] = null;
  }
  
  newState.turn = newState.turn === 'w' ? 'b' : 'w';
  
  if (piece.type === 'p' || capturedPiece) {
    newState.halfMoveClock = 0;
  } else {
    newState.halfMoveClock++;
  }
  
  if (piece.color === 'b') {
    newState.fullMoveNumber++;
  }
  
  const inCheck = isInCheck(newState, newState.turn);
  newState.check = inCheck;
  
  const notation = createMoveNotation(state, from, to, promotion, inCheck);
  
  newState.history.push({
    from,
    to,
    promotion,
    piece,
    capturedPiece,
    isCheck: inCheck,
    notation
  });
  
  if (inCheck) {
    const hasLegalMoves = hasAnyLegalMoves(newState, newState.turn);
    if (!hasLegalMoves) {
      newState.checkmate = true;
      if (newState.history.length > 0) {
        const lastMove = newState.history[newState.history.length - 1];
        lastMove.isCheckmate = true;
        lastMove.notation = lastMove.notation.replace('+', '#');
      }
    }
  } else {
    const hasLegalMoves = hasAnyLegalMoves(newState, newState.turn);
    if (!hasLegalMoves) {
      newState.stalemate = true;
    }
  }
  
  return newState;
}

function hasAnyLegalMoves(state: GameState, color: Color): boolean {
  for (const [square, piece] of Object.entries(state.board)) {
    if (piece && piece.color === color) {
      const legalMoves = getLegalMoves(state, square as Square);
      if (legalMoves.length > 0) {
        return true;
      }
    }
  }
  return false;
}

function createMoveNotation(
  state: GameState, 
  from: Square, 
  to: Square, 
  promotion: PieceType | undefined,
  isCheck?: boolean
): string {
  const piece = state.board[from];
  if (!piece) return '';

  if (piece.type === 'k') {
    if (from === 'e1' && to === 'g1') return 'O-O';
    if (from === 'e1' && to === 'c1') return 'O-O-O';
    if (from === 'e8' && to === 'g8') return 'O-O';
    if (from === 'e8' && to === 'c8') return 'O-O-O';
  }

  let notation = '';
  
  if (piece.type !== 'p') {
    notation += piece.type.toUpperCase();
  }
  
  const otherPieces: Square[] = [];
  for (const [square, boardPiece] of Object.entries(state.board)) {
    if (square !== from && 
        boardPiece && 
        boardPiece.type === piece.type && 
        boardPiece.color === piece.color) {
      const legalMoves = getLegalMoves(state, square as Square);
      if (legalMoves.includes(to)) {
        otherPieces.push(square as Square);
      }
    }
  }
  
  if (otherPieces.length > 0) {
    notation += from.charAt(0);
    
    let needRank = false;
    
    if (otherPieces.some(square => square.charAt(0) === from.charAt(0))) {
      needRank = true;
    }
    
    if (needRank) {
      notation += from.charAt(1);
    }
  }
  
  if (state.board[to] || (piece.type === 'p' && from.charAt(0) !== to.charAt(0))) {
    if (piece.type === 'p' && notation === '') {
      notation += from.charAt(0);
    }
    notation += 'x';
  }
  
  notation += to;
  
  if (promotion) {
    notation += `=${promotion.toUpperCase()}`;
  }
  
  if (isCheck) {
    notation += '+';
  }
  
  return notation;
}

export function getBoardStateForLLM(state: GameState): string {
  let fen = '';
  
  for (let rank = 8; rank >= 1; rank--) {
    let emptySquares = 0;
    
    for (let fileCode = 97; fileCode <= 104; fileCode++) {
      const file = String.fromCharCode(fileCode);
      const square = `${file}${rank}`;
      const piece = state.board[square];
      
      if (piece) {
        if (emptySquares > 0) {
          fen += emptySquares;
          emptySquares = 0;
        }
        
        let pieceLetter = piece.type;
        if (piece.color === 'w') {
          pieceLetter = pieceLetter.toUpperCase();
        }
        
        fen += pieceLetter;
      } else {
        emptySquares++;
      }
    }
    
    if (emptySquares > 0) {
      fen += emptySquares;
    }
    
    if (rank > 1) {
      fen += '/';
    }
  }
  
  fen += ` ${state.turn}`;
  
  let castling = '';
  if (state.castling.w.kingSide) castling += 'K';
  if (state.castling.w.queenSide) castling += 'Q';
  if (state.castling.b.kingSide) castling += 'k';
  if (state.castling.b.queenSide) castling += 'q';
  fen += ` ${castling || '-'}`;
  
  fen += ` ${state.enPassant || '-'}`;
  
  fen += ` ${state.halfMoveClock} ${state.fullMoveNumber}`;
  
  return fen;
}

export function parseLLMMove(state: GameState, moveString: string): { from: Square, to: Square, promotion?: PieceType } | null {
  moveString = moveString.trim().replace(/\s+/g, ' ');
  
  if (moveString.match(/^(O-O-O|0-0-0)$/i)) {
    if (state.turn === 'w') {
      return { from: 'e1', to: 'c1' };
    } else {
      return { from: 'e8', to: 'c8' };
    }
  } else if (moveString.match(/^(O-O|0-0)$/i)) {
    if (state.turn === 'w') {
      return { from: 'e1', to: 'g1' };
    } else {
      return { from: 'e8', to: 'g8' };
    }
  }
  
  if (moveString.match(/^[a-h][1-8][a-h][1-8]$/)) {
    const from = moveString.substring(0, 2) as Square;
    const to = moveString.substring(2, 4) as Square;
    
    const piece = state.board[from];
    if (!piece || piece.color !== state.turn) return null;
    
    const legalMoves = getLegalMoves(state, from);
    if (!legalMoves.includes(to)) return null;
    
    let promotion: PieceType | undefined;
    if (piece.type === 'p' &&
        ((piece.color === 'w' && to.charAt(1) === '8') || 
         (piece.color === 'b' && to.charAt(1) === '1'))) {
      promotion = 'q' as PieceType;
    }
    
    return { from, to, promotion };
  }
  
  moveString = moveString.replace(/[+#x]/g, '');
  
  let promotion: PieceType | undefined;
  const promotionMatch = moveString.match(/=([QRBN])/i);
  if (promotionMatch) {
    promotion = promotionMatch[1].toLowerCase() as PieceType;
    moveString = moveString.replace(/=[QRBN]/i, '');
  }
  
  const destSquare = moveString.substring(moveString.length - 2) as Square;
  if (!destSquare.match(/^[a-h][1-8]$/)) return null;
  
  let pieceType: PieceType = 'p';
  if (moveString.length > 2 && moveString[0].match(/[KQRBN]/i)) {
    pieceType = moveString[0].toLowerCase() as PieceType;
    moveString = moveString.substring(1);
  }
  
  const candidates: Square[] = [];
  for (const [square, piece] of Object.entries(state.board)) {
    if (piece && piece.type === pieceType && piece.color === state.turn) {
      const legalMoves = getLegalMoves(state, square as Square);
      if (legalMoves.includes(destSquare)) {
        candidates.push(square as Square);
      }
    }
  }
  
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return { from: candidates[0], to: destSquare, promotion };
  
  const fileHint = moveString.length > 2 ? moveString[0] : null;
  const rankHint = moveString.length > 3 ? moveString[1] : null;
  
  for (const candidate of candidates) {
    if (fileHint && candidate.charAt(0) !== fileHint) continue;
    if (rankHint && candidate.charAt(1) !== rankHint) continue;
    return { from: candidate, to: destSquare, promotion };
  }
  
  return null;
}
