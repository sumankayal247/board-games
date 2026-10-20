import type { BaseGameState, PlayerConfig, MoveRecord } from '../../types';

export interface Piece { player: number; king: boolean; }
export interface CheckersState extends BaseGameState {
  board: (Piece|null)[][];
  selected?: [number,number] | null;
}

export function createCheckersState(players: PlayerConfig[]): CheckersState {
  const board: (Piece|null)[][] = Array.from({length:8},()=> Array(8).fill(null));
  // player0 (dark) at top rows 0-2, player1 at bottom 5-7, only dark squares (r+c odd)
  for(let r=0;r<3;r++) for(let c=0;c<8;c++) if((r+c)%2===1) board[r][c]={player:0, king:false};
  for(let r=5;r<8;r++) for(let c=0;c<8;c++) if((r+c)%2===1) board[r][c]={player:1, king:false};
  const now=Date.now();
  return {
    gameId:'checkers',
    matchId:`chk-${now}-${Math.random().toString(36).slice(2,6)}`,
    players,
    currentPlayer:0,
    board,
    selected:null,
    status:'playing',
    winner:null,
    isDraw:false,
    moveHistory:[],
    createdAt:now,
    updatedAt:now,
    durationSeconds:0
  };
}

export interface Move {
  from: [number,number];
  to: [number,number];
  captures: [number,number][]; // captured positions
}

export function getAllMoves(state: CheckersState): Move[] {
  const board=state.board;
  const player=state.currentPlayer;
  const captureMoves: Move[]=[];
  const quietMoves: Move[]=[];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const p=board[r][c];
    if(!p || p.player!==player) continue;
    const dirs:[number,number][]=[];
    if(p.king){
      dirs.push([1,1],[1,-1],[-1,1],[-1,-1]);
    } else {
      const dr = player===0?1:-1;
      dirs.push([dr,1],[dr,-1]);
    }
    // capture search for this piece (single jump; we handle multi sequentially via recursion later, but generator includes single jumps; engine will chain)
    for(const [dr,dc] of dirs){
      const nr=r+dr, nc=c+dc;
      const jr=r+dr*2, jc=c+dc*2;
      if(jr<0||jr>=8||jc<0||jc>=8||nr<0||nr>=8||nc<0||nc>=8) continue;
      const mid=board[nr][nc];
      if(mid && mid.player!==player && board[jr][jc]===null){
        captureMoves.push({from:[r,c],to:[jr,jc],captures:[[nr,nc]]});
      }
    }
    if(captureMoves.length===0){
      for(const [dr,dc] of dirs){
        const nr=r+dr, nc=c+dc;
        if(nr<0||nr>=8||nc<0||nc>=8) continue;
        if(board[nr][nc]===null){
          quietMoves.push({from:[r,c],to:[nr,nc],captures:[]});
        }
      }
    }
  }
  // Mandatory capture globally
  if(captureMoves.length>0) return captureMoves;
  return quietMoves;
}

// For continuing capture sequence after a jump, get further jumps from position
export function getCaptureContinuations(board:(Piece|null)[][], pos:[number,number], player:number): Move[] {
  const p=board[pos[0]][pos[1]];
  if(!p) return [];
  const dirs:[number,number][]=[];
  if(p.king) dirs.push([1,1],[1,-1],[-1,1],[-1,-1]);
  else dirs.push([player===0?1:-1,1],[player===0?1:-1,-1]);
  const moves:Move[]=[];
  for(const [dr,dc] of dirs){
    const nr=pos[0]+dr, nc=pos[1]+dc;
    const jr=pos[0]+dr*2, jc=pos[1]+dc*2;
    if(jr<0||jr>=8||jc<0||jc>=8||nr<0||nr>=8||nc<0||nc>=8) continue;
    const mid=board[nr][nc];
    if(mid && mid.player!==player && board[jr][jc]===null){
      moves.push({from:pos,to:[jr,jc],captures:[[nr,nc]]});
    }
  }
  return moves;
}

export function applyMoveCheckers(state: CheckersState, move: Move): {next:CheckersState, error?:string, mustContinueFrom?: [number,number]} {
  if(state.status==='finished') return {next:state,error:'Finished'};
  const legal=getAllMoves(state);
  // check if move is in legal (compare from/to)
  const found=legal.find(m=> m.from[0]===move.from[0]&&m.from[1]===move.from[1]&&m.to[0]===move.to[0]&&m.to[1]===move.to[1]);
  if(!found) return {next:state,error:'Illegal move'};
  const board= state.board.map(r=> r.map(p=> p? {...p}:null));
  const piece=board[move.from[0]][move.from[1]]!;
  board[move.from[0]][move.from[1]]=null;
  board[move.to[0]][move.to[1]]=piece;
  for(const [cr,cc] of move.captures) board[cr][cc]=null;
  // promotion
  if(!piece.king){
    if((piece.player===0 && move.to[0]===7) || (piece.player===1 && move.to[0]===0)){
      piece.king=true;
    }
  }
  // check if capture move and further captures available -> must continue, stay same player, not yet switch turn
  let keepTurn=false;
  let mustContinue: [number,number]|undefined;
  if(move.captures.length>0){
    const cont=getCaptureContinuations(board, move.to, state.currentPlayer);
    if(cont.length>0){
      keepTurn=true;
      mustContinue=move.to;
    }
  }
  const moveRec: MoveRecord={playerIndex:state.currentPlayer, move, timestamp:Date.now(), notation:`${String.fromCharCode(97+move.from[1])}${8-move.from[0]}->${String.fromCharCode(97+move.to[1])}${8-move.to[0]}`};
  // check win: if opponent has no pieces or no moves (after turn switch)
  let status:CheckersState['status']='playing';
  let winner:number|null=null;
  let isDraw=false;
  let nextPlayer = keepTurn ? state.currentPlayer : (state.currentPlayer===0?1:0);
  if(!keepTurn){
    // count pieces
    let cnt0=0,cnt1=0;
    for(let r=0;r<8;r++) for(let c=0;c<8;c++){ const pp=board[r][c]; if(pp){ if(pp.player===0) cnt0++; else cnt1++; } }
    if(cnt0===0){ status='finished'; winner=1; }
    else if(cnt1===0){ status='finished'; winner=0; }
    else {
      // check if next player has moves
      const tmpState:CheckersState={...state, board, currentPlayer: nextPlayer};
      const oppMoves=getAllMoves(tmpState);
      if(oppMoves.length===0){ status='finished'; winner=state.currentPlayer; }
    }
  } else {
    status='playing';
  }
  return {next:{
    ...state,
    board,
    currentPlayer: status==='finished'? state.currentPlayer: nextPlayer,
    status,
    winner,
    isDraw,
    moveHistory:[...state.moveHistory, moveRec],
    updatedAt:Date.now(),
    selected: mustContinue ? mustContinue : null,
  }, mustContinueFrom: mustContinue};
}

export function countPieces(board:(Piece|null)[][]){
  let a=0,b=0; for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(board[r][c]){ if(board[r][c]!.player===0) a++; else b++; } return [a,b] as const;
}
