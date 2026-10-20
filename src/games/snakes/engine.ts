import type { BaseGameState, PlayerConfig, MoveRecord } from '../../types';

export interface SnakesState extends BaseGameState {
  positions: number[]; // 0 start before 1, 1..100
  diceValue: number|null;
  mustRoll: boolean;
  diceHistory: number[];
}

// define snakes and ladders
export const ladders: Record<number,number> = { 3:21, 8:30, 28:84, 58:77, 75:86, 80:100, 90:91, 45:66 };
export const snakes: Record<number,number> = { 24:5, 33:9, 42:19, 56:8, 64:36, 69:33, 88:22, 99:26 };

export function createSnakesState(players: PlayerConfig[]): SnakesState {
  const now=Date.now();
  return {
    gameId:'snakes',
    matchId:`snakes-${now}-${Math.random().toString(36).slice(2,6)}`,
    players,
    currentPlayer:0,
    positions: Array(players.length).fill(0),
    status:'playing',
    winner:null,
    isDraw:false,
    moveHistory:[],
    createdAt:now,
    updatedAt:now,
    durationSeconds:0,
    diceValue:null,
    mustRoll:true,
    diceHistory:[]
  };
}

export function rollDice(): number { return Math.floor(Math.random()*6)+1; }

export function applyMoveSnakes(state: SnakesState, dice:number): {next:SnakesState}&{event?:string} {
  const curPos=state.positions[state.currentPlayer];
  let newPos=curPos+dice;
  let event: string|undefined;
  if(newPos>100){
    // must land exactly: stay
    newPos=curPos;
    event='Need exact roll to reach 100';
  } else {
    if(ladders[newPos]){ event=`Climbed ladder ${newPos}→${ladders[newPos]}`; newPos=ladders[newPos]; }
    else if(snakes[newPos]){ event=`Snake! ${newPos}→${snakes[newPos]}`; newPos=snakes[newPos]; }
  }
  const positions=[...state.positions];
  positions[state.currentPlayer]=newPos;
  const win = newPos===100;
  const positionsCopy=[...positions];
  let status:SnakesState['status']='playing';
  let winner:null|number=null;
  if(win){ status='finished'; winner=state.currentPlayer; }
  const isSix=dice===6;
  // extra turn on 6 unless win, but limit 3 sixes? Simplified: extra turn on 6, but if 3 sixes in row, lose turn
  // Check consecutive sixes via diceHistory tail
  const history=[...state.diceHistory, dice];
  const lastThree=history.slice(-3);
  const threeSixes=lastThree.length===3 && lastThree.every(v=>v===6);
  let nextPlayer=state.currentPlayer;
  if(win){
    nextPlayer=state.currentPlayer;
  } else if(threeSixes){
    event=(event?event+' • ':'')+'Three sixes! Turn lost';
    nextPlayer=(state.currentPlayer+1)%state.players.length;
  } else if(isSix){
    nextPlayer=state.currentPlayer; // extra turn
  } else {
    nextPlayer=(state.currentPlayer+1)%state.players.length;
  }
  const move:MoveRecord={playerIndex:state.currentPlayer, move:{dice,from:curPos,to:newPos}, timestamp:Date.now(), notation:`${curPos}+${dice}=${newPos}`};
  return {
    next:{
      ...state,
      positions:positionsCopy,
      currentPlayer: status==='finished'? state.currentPlayer : nextPlayer,
      status,
      winner,
      isDraw:false,
      moveHistory:[...state.moveHistory, move],
      updatedAt:Date.now(),
      diceValue:dice,
      mustRoll: true, // after move, next must roll (or winner)
      diceHistory: history,
    },
    event
  };
}
