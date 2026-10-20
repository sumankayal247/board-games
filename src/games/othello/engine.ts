import type { BaseGameState, PlayerConfig, MoveRecord } from '../../types';

export interface OthelloState extends BaseGameState {
  board: (number|null)[][]; // 8x8, 0 black, 1 white
}

export function createOthelloState(players: PlayerConfig[]): OthelloState {
  const board: (number|null)[][] = Array.from({length:8},()=> Array(8).fill(null));
  board[3][3]=1; board[3][4]=0; board[4][3]=0; board[4][4]=1;
  const now=Date.now();
  return {
    gameId:'othello',
    matchId:`oth-${now}-${Math.random().toString(36).slice(2,6)}`,
    players,
    currentPlayer:0,
    board,
    status:'playing',
    winner:null,
    isDraw:false,
    moveHistory:[],
    createdAt:now,
    updatedAt:now,
    durationSeconds:0
  };
}

const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

export function getFlips(board:(number|null)[][], r:number,c:number, player:number): [number,number][] {
  if(board[r][c]!==null) return [];
  const flips:[number,number][]=[];
  for(const [dr,dc] of dirs){
    let nr=r+dr, nc=c+dc;
    const path:[number,number][]=[];
    while(nr>=0&&nr<8&&nc>=0&&nc<8 && board[nr][nc]!==null && board[nr][nc]!==player){
      path.push([nr,nc]);
      nr+=dr; nc+=dc;
    }
    if(path.length>0 && nr>=0&&nr<8&&nc>=0&&nc<8 && board[nr][nc]===player){
      flips.push(...path);
    }
  }
  return flips;
}

export function getLegalMovesOthello(state: OthelloState): [number,number][] {
  if(state.status==='finished') return [];
  const res:[number,number][]=[];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    if(getFlips(state.board,r,c,state.currentPlayer).length>0) res.push([r,c]);
  }
  return res;
}

export function countDiscs(board:(number|null)[][]){
  let c0=0,c1=0;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){ if(board[r][c]===0) c0++; else if(board[r][c]===1) c1++; }
  return [c0,c1] as const;
}

export function applyMoveOthello(state:OthelloState, r:number,c:number): {next:OthelloState, error?:string}{
  if(state.status==='finished') return {next:state,error:'Finished'};
  const flips=getFlips(state.board,r,c,state.currentPlayer);
  if(flips.length===0) return {next:state,error:'No discs to flip'};
  const board= state.board.map(row=>[...row]);
  board[r][c]=state.currentPlayer;
  for(const [fr,fc] of flips) board[fr][fc]=state.currentPlayer;
  const move:MoveRecord={playerIndex:state.currentPlayer, move:{r,c,flips}, timestamp:Date.now(), notation:`${String.fromCharCode(97+c)}${r+1}`};
  // determine next player: check if opponent has moves, else stay, else pass check
  let nextPlayer = state.currentPlayer===0?1:0;
  // helper to check moves for player
  const hasMoves = (p:number)=> {
    for(let rr=0;rr<8;rr++) for(let cc=0;cc<8;cc++) if(getFlips(board,rr,cc,p).length>0) return true;
    return false;
  };
  let status:OthelloState['status']='playing';
  let winner: number|null=null;
  let isDraw=false;
  if(!hasMoves(nextPlayer)){
    if(!hasMoves(state.currentPlayer)){
      // game over
      status='finished';
      const [c0,c1]=countDiscs(board);
      if(c0>c1) winner=0;
      else if(c1>c0) winner=1;
      else isDraw=true;
    } else {
      // opponent passes, current continues
      nextPlayer=state.currentPlayer;
    }
  }
  // check board full
  const total= countDiscs(board);
  if(total[0]+total[1]===64 && status!=='finished'){
    status='finished';
    if(total[0]>total[1]) winner=0;
    else if(total[1]>total[0]) winner=1;
    else isDraw=true;
  }
  return {next:{
    ...state,
    board,
    currentPlayer: status==='finished'? state.currentPlayer: nextPlayer,
    status,
    winner,
    isDraw,
    moveHistory:[...state.moveHistory, move],
    updatedAt:Date.now()
  }};
}
