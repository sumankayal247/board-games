import type { BaseGameState, PlayerConfig, MoveRecord } from '../../types';

export type PieceType='p'|'n'|'b'|'r'|'q'|'k';
export type Color = 0|1; // 0 white, 1 black
export interface ChessPiece { type: PieceType; color: Color; hasMoved?: boolean; }
export type ChessBoard = (ChessPiece|null)[][];
export interface ChessState extends BaseGameState {
  board: ChessBoard;
  enPassant?: [number,number]|null;
  turnColor: Color; // 0 white, 1 black
  castling: { whiteKing: boolean; whiteQueen: boolean; blackKing: boolean; blackQueen: boolean };
  // currentPlayer maps to color via turnColor, but we support 2 players only
}

export function createChessState(players: PlayerConfig[]): ChessState {
  const board: ChessBoard = Array.from({length:8},()=> Array(8).fill(null));
  const back: PieceType[]=['r','n','b','q','k','b','n','r'];
  for(let c=0;c<8;c++){
    board[0][c]={type:back[c], color:1};
    board[1][c]={type:'p', color:1};
    board[6][c]={type:'p', color:0};
    board[7][c]={type:back[c], color:0};
  }
  const now=Date.now();
  return {
    gameId:'chess',
    matchId:`chess-${now}-${Math.random().toString(36).slice(2,6)}`,
    players,
    currentPlayer:0,
    turnColor:0,
    board,
    castling:{ whiteKing:true, whiteQueen:true, blackKing:true, blackQueen:true },
    enPassant:null,
    status:'playing',
    winner:null,
    isDraw:false,
    moveHistory:[],
    createdAt:now,
    updatedAt:now,
    durationSeconds:0
  };
}

export interface ChessMove { from:[number,number]; to:[number,number]; promotion?: PieceType; isCastle?: boolean; isEnPassant?: boolean; }

export function inside(r:number,c:number){ return r>=0&&r<8&&c>=0&&c<8; }

export function getPseudoLegalMoves(state: ChessState, pos:[number,number]): ChessMove[] {
  const piece=state.board[pos[0]][pos[1]];
  if(!piece|| piece.color!==state.turnColor) return [];
  const moves:ChessMove[]=[];
  const r=pos[0], c=pos[1];
  const add=(to:[number,number], extra?:Partial<ChessMove>)=> { if(inside(to[0],to[1])){ const target=state.board[to[0]][to[1]]; if(!target|| target.color!==piece.color) moves.push({from:pos,to, ...extra}); } };
  if(piece.type==='p'){
    const dir = piece.color===0 ? -1 : 1;
    const startRow = piece.color===0 ? 6 : 1;
    // forward
    if(inside(r+dir,c) && !state.board[r+dir][c]) {
      // promotion rank
      if(r+dir===0 || r+dir===7) ['q','r','b','n'].forEach(p=> moves.push({from:pos,to:[r+dir,c],promotion:p as PieceType}));
      else moves.push({from:pos,to:[r+dir,c]});
      // double
      if(r===startRow && !state.board[r+dir*2][c]) moves.push({from:pos,to:[r+dir*2,c]});
    }
    // captures
    for(const dc of [-1,1]){
      if(!inside(r+dir,c+dc)) continue;
      const target=state.board[r+dir][c+dc];
      if(target && target.color!==piece.color){
        if(r+dir===0||r+dir===7) ['q','r','b','n'].forEach(p=> moves.push({from:pos,to:[r+dir,c+dc],promotion:p as PieceType}));
        else moves.push({from:pos,to:[r+dir,c+dc]});
      }
      // en passant
      if(state.enPassant && state.enPassant[0]===r+dir && state.enPassant[1]===c+dc){
        moves.push({from:pos,to:[r+dir,c+dc],isEnPassant:true});
      }
    }
  } else if(piece.type==='n'){
    const deltas=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    for(const [dr,dc] of deltas) add([r+dr,c+dc]);
  } else if(piece.type==='b' || piece.type==='r' || piece.type==='q'){
    const dirs: [number,number][]=[];
    if(piece.type==='b'||piece.type==='q') dirs.push([1,1],[1,-1],[-1,1],[-1,-1]);
    if(piece.type==='r'||piece.type==='q') dirs.push([1,0],[-1,0],[0,1],[0,-1]);
    for(const [dr,dc] of dirs){
      let nr=r+dr, nc=c+dc;
      while(inside(nr,nc)){
        const target=state.board[nr][nc];
        if(!target) moves.push({from:pos,to:[nr,nc]});
        else {
          if(target.color!==piece.color) moves.push({from:pos,to:[nr,nc]});
          break;
        }
        nr+=dr; nc+=dc;
      }
    }
  }
  if(piece.type==='k'){
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) if(dr||dc) add([r+dr,c+dc]);
    // castling
    const color=piece.color;
    const row = color===0?7:0;
    if(r===row && c===4){
      // kingside
      if(color===0 && state.castling.whiteKing || color===1 && state.castling.blackKing){
        if(!state.board[row][5] && !state.board[row][6] && !isSquareAttacked(state.board, row,4, color===0?1:0) && !isSquareAttacked(state.board,row,5,color===0?1:0) && !isSquareAttacked(state.board,row,6,color===0?1:0)){
          const rook=state.board[row][7];
          if(rook && rook.type==='r' && rook.color===color) moves.push({from:pos,to:[row,6],isCastle:true});
        }
      }
      if(color===0 && state.castling.whiteQueen || color===1 && state.castling.blackQueen){
        if(!state.board[row][3] && !state.board[row][2] && !state.board[row][1] && !isSquareAttacked(state.board,row,4,color===0?1:0) && !isSquareAttacked(state.board,row,3,color===0?1:0) && !isSquareAttacked(state.board,row,2,color===0?1:0)){
          const rook=state.board[row][0];
          if(rook && rook.type==='r' && rook.color===color) moves.push({from:pos,to:[row,2],isCastle:true});
        }
      }
    }
  }
  return moves;
}

function findKing(board: ChessBoard, color: Color): [number,number]|null {
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){ const p=board[r][c]; if(p && p.type==='k' && p.color===color) return [r,c]; }
  return null;
}

export function isSquareAttacked(board: ChessBoard, r:number,c:number, attacker: Color): boolean {
  // pawn attacks
  const pawnDir = attacker===0? -1 : 1; // pawn moves towards decreasing row for white
  // Actually pawn attacks diagonally forward: if attacker is white (0), its pawns are moving -1, so they attack from r+1
  // Need to check pawn positions that could attack (r,c): pawn at (r - pawnDir, c±1)
  // pawnDir = -1 for white means white pawn moves -1, so to attack (r,c), white pawn must be at (r+1, c±1)
  for(const dc of [-1,1]){
    const pr = r - pawnDir; // Wait: need correct: white pawn at (r+1) attacks r (because it moves -1). So r - dir? Let's compute: dir = -1 for white. Attacker white pawn at (r+1,c±1) attacks (r,c). That is r+1 = r - dir? -(-1)=+1 yes.
    // Simpler: invert: pawn at (r - pawnDir??). For white dir -1, pawn at r+1 = r - (-1) = r+1 correct. For black dir 1, pawn at r-1 = r -1.
    // So pr = r - pawnDir
    // Check: white: r - (-1)= r+1 OK. Black: r -1 correct.
    const pr2 = r - pawnDir;
    const pc2 = c - dc;
    // Instead iterate correctly: pawn at (r - pawnDir, c - dc) ??? Wait second.
    // Let's brute: check both diagonal pawn sources
  }
  // brute iterate all attacker pieces
  for(let rr=0;rr<8;rr++) for(let cc=0;cc<8;cc++){
    const p=board[rr][cc];
    if(!p || p.color!==attacker) continue;
    if(p.type==='p'){
      const dir = attacker===0? -1 : 1;
      if(rr+dir===r && (cc+1===c || cc-1===c)) return true;
    } else if(p.type==='n'){
      const deltas=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
      for(const [dr,dc] of deltas) if(rr+dr===r && cc+dc===c) return true;
    } else if(p.type==='k'){
      if(Math.abs(rr-r)<=1 && Math.abs(cc-c)<=1) return true;
    } else {
      // sliding
      const isDiag = p.type==='b'||p.type==='q';
      const isOrth = p.type==='r'||p.type==='q';
      const dr = Math.sign(r-rr);
      const dc = Math.sign(c-cc);
      if(r===rr && isOrth){
        // same row
        const step= dc;
        let blocked=false;
        for(let cc2=cc+step; cc2!==c; cc2+=step) if(board[rr][cc2]){ blocked=true; break; }
        if(!blocked) return true;
      } else if(c===cc && isOrth){
        const step=dr;
        let blocked=false;
        for(let rr2=rr+step; rr2!==r; rr2+=step) if(board[rr2][cc]){ blocked=true; break; }
        if(!blocked) return true;
      } else if(Math.abs(r-rr)===Math.abs(c-cc) && isDiag){
        let rr2=rr+dr, cc2=cc+dc;
        let blocked=false;
        while(rr2!==r && cc2!==c){ if(board[rr2][cc2]){ blocked=true; break; } rr2+=dr; cc2+=dc; }
        if(!blocked) return true;
      }
    }
  }
  return false;
}

export function isInCheck(board: ChessBoard, color: Color): boolean {
  const king=findKing(board,color);
  if(!king) return false;
  return isSquareAttacked(board, king[0], king[1], color===0?1:0);
}

export function getLegalMoves(state: ChessState): ChessMove[] {
  const all: ChessMove[]=[];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const p=state.board[r][c];
    if(p && p.color===state.turnColor) all.push(...getPseudoLegalMoves(state,[r,c]));
  }
  // filter moves that leave king in check
  const legal: ChessMove[]=[];
  for(const m of all){
    const next=applyMoveClone(state,m);
    if(!isInCheck(next.board, state.turnColor)) legal.push(m);
  }
  return legal;
}

export function applyMoveClone(state: ChessState, move: ChessMove): ChessState {
  const board= state.board.map(r=> r.map(p=> p? {...p}:null));
  const piece=board[move.from[0]][move.from[1]]!;
  // en passant capture
  if(move.isEnPassant){
    board[move.to[0]][move.to[1]]=piece;
    board[move.from[0]][move.from[1]]=null;
    // captured pawn is at from row, to col
    board[move.from[0]][move.to[1]]=null;
  } else if(move.isCastle){
    board[move.to[0]][move.to[1]]=piece;
    board[move.from[0]][move.from[1]]=null;
    // move rook
    const row=move.from[0];
    if(move.to[1]===6){ // kingside
      const rook=board[row][7]!;
      board[row][5]=rook;
      board[row][7]=null;
    } else { // queenside
      const rook=board[row][0]!;
      board[row][3]=rook;
      board[row][0]=null;
    }
  } else {
    board[move.to[0]][move.to[1]]= move.promotion? {type:move.promotion,color:piece.color,hasMoved:true} : piece;
    board[move.from[0]][move.from[1]]=null;
  }
  piece.hasMoved=true;
  // update en passant
  let enPassant: [number,number]|null=null;
  if(piece.type==='p' && Math.abs(move.from[0]-move.to[0])===2){
    enPassant=[ (move.from[0]+move.to[0])/2 as number, move.from[1]] as [number,number];
  }
  // update castling rights
  const castling={...state.castling};
  if(piece.type==='k'){
    if(piece.color===0){ castling.whiteKing=false; castling.whiteQueen=false; }
    else { castling.blackKing=false; castling.blackQueen=false; }
  }
  if(piece.type==='r'){
    if(move.from[0]===7 && move.from[1]===0) castling.whiteQueen=false;
    if(move.from[0]===7 && move.from[1]===7) castling.whiteKing=false;
    if(move.from[0]===0 && move.from[1]===0) castling.blackQueen=false;
    if(move.from[0]===0 && move.from[1]===7) castling.blackKing=false;
  }
  // if capture rook, also remove rights
  const captured=state.board[move.to[0]][move.to[1]];
  if(captured?.type==='r'){
    if(move.to[0]===7 && move.to[1]===0) castling.whiteQueen=false;
    if(move.to[0]===7 && move.to[1]===7) castling.whiteKing=false;
    if(move.to[0]===0 && move.to[1]===0) castling.blackQueen=false;
    if(move.to[0]===0 && move.to[1]===7) castling.blackKing=false;
  }
  const nextTurn= state.turnColor===0?1:0;
  return {
    ...state,
    board,
    enPassant,
    castling,
    turnColor: nextTurn,
  };
}

export function applyMoveChess(state: ChessState, move: ChessMove): {next:ChessState, error?:string} {
  const legal=getLegalMoves(state);
  const found=legal.find(m=> m.from[0]===move.from[0]&&m.from[1]===move.from[1]&&m.to[0]===move.to[0]&&m.to[1]===move.to[1]&& (m.promotion||null)===(move.promotion||null));
  if(!found) return {next:state,error:'Illegal move'};
  const nextBase=applyMoveClone(state, found);
  const nextPlayer = state.currentPlayer===0?1:0;
  // check if next player has moves or is checkmate/stalemate
  const tmpStateForNext: ChessState={...nextBase, currentPlayer: nextPlayer};
  const oppMoves=getLegalMoves({...nextBase, currentPlayer: nextPlayer, turnColor: nextBase.turnColor});
  let status:ChessState['status']='playing';
  let winner:number|null=null;
  let isDraw=false;
  if(oppMoves.length===0){
    if(isInCheck(nextBase.board, nextBase.turnColor)){
      status='finished';
      winner=state.currentPlayer; // current player delivered mate
    } else {
      status='finished';
      isDraw=true;
    }
  }
  // 50 move? simplified not needed
  const notation = `${String.fromCharCode(97+move.from[1])}${8-move.from[0]}-${String.fromCharCode(97+move.to[1])}${8-move.to[0]}${move.promotion?`=${move.promotion.toUpperCase()}`:''}`;
  const moveRec:MoveRecord={playerIndex:state.currentPlayer, move:found, timestamp:Date.now(), notation};
  return {next:{
    ...nextBase,
    currentPlayer: status==='finished'? state.currentPlayer: nextPlayer,
    status,
    winner,
    isDraw,
    moveHistory:[...state.moveHistory, moveRec],
    updatedAt:Date.now()
  }};
}

export function boardToFEN(board: ChessBoard){ return board.map(row=>row.map(p=> p? (p.color===0? p.type.toUpperCase(): p.type): '.').join('')).join('/'); }
