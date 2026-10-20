import type { BaseGameState, PlayerConfig, MoveRecord } from '../../types';

export interface Connect4State extends BaseGameState {
  board: (number|null)[][]; // 6 rows x 7 cols, row 0 top
  lastMove?: { r:number,c:number };
}

export function createC4State(players: PlayerConfig[]): Connect4State {
  const now=Date.now();
  return {
    gameId:'connect4',
    matchId:`c4-${now}-${Math.random().toString(36).slice(2,6)}`,
    players,
    currentPlayer:0,
    board: Array.from({length:6},()=> Array(7).fill(null)),
    status:'playing',
    winner:null,
    isDraw:false,
    moveHistory:[],
    createdAt:now,
    updatedAt:now,
    durationSeconds:0
  };
}

export function getLegalMovesC4(state: Connect4State): number[] {
  if (state.status==='finished') return [];
  const cols:number[]=[];
  for(let c=0;c<7;c++) if(state.board[0][c]===null) cols.push(c);
  return cols;
}

export function checkWinnerC4(board:(number|null)[][]): number|null {
  const dirs=[[0,1],[1,0],[1,1],[1,-1]];
  for(let r=0;r<6;r++) for(let c=0;c<7;c++){
    const p=board[r][c];
    if(p===null) continue;
    for(const [dr,dc] of dirs){
      let ok=true;
      for(let k=1;k<4;k++){
        const nr=r+dr*k, nc=c+dc*k;
        if(nr<0||nr>=6||nc<0||nc>=7||board[nr][nc]!==p){ ok=false; break; }
      }
      if(ok) return p;
    }
  }
  return null;
}

export function isDrawC4(board:(number|null)[][]){
  return board[0].every(v=>v!==null) && checkWinnerC4(board)===null;
}

export function applyMoveC4(state:Connect4State, col:number): {next:Connect4State,error?:string}{
  if(state.status==='finished') return {next:state,error:'Finished'};
  if(col<0||col>6) return {next:state,error:'Invalid column'};
  if(state.board[0][col]!==null) return {next:state,error:'Column full'};
  // find row
  let row=-1;
  for(let r=5;r>=0;r--) if(state.board[r][col]===null){ row=r; break; }
  const board = state.board.map(row=> [...row]);
  board[row][col]=state.currentPlayer;
  const winner = checkWinnerC4(board);
  const draw = !winner && isDrawC4(board);
  const move: MoveRecord = { playerIndex: state.currentPlayer, move: col, timestamp: Date.now(), notation:`col ${col+1}`};
  let status:Connect4State['status']='playing';
  let win:null|number=null;
  let isDraw=false;
  if(winner!==null){ status='finished'; win=winner; }
  else if(draw){ status='finished'; isDraw=true; }
  return {next:{
    ...state,
    board,
    lastMove:{r:row,c:col},
    currentPlayer: status==='finished'?state.currentPlayer: state.currentPlayer===0?1:0,
    status,
    winner: win,
    isDraw,
    moveHistory:[...state.moveHistory, move],
    updatedAt: Date.now()
  }};
}
