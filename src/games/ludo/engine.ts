import type { BaseGameState, PlayerConfig, MoveRecord } from '../../types';

// Simplified Ludo: board is circular track of 52 squares + home stretch 5 per player + yard/home
// We abstract as linear positions: tokens at -1 = yard, 0-51 = main track, 52-56 = home stretch, 57 = finished
// Each player has start offset: 0,13,26,39
// Safe squares: start squares are safe (0,13,26,39) + 8 safe squares at 8 offsets? Simplified: start + 8,21,34,47 as safe
export interface LudoToken { pos: number; } // -1 yard, 0-56 track index relative to global? We'll store globalPos
// Actually store global position: -1 yard, 0-51 track, 100+ home stretch? Simpler: store stepsFromStart: -1 yard, 0 entering, 0-51 track, 52-56 home, 57 done
export interface LudoPlayerState { tokens: number[]; startOffset: number; color: string; }
export interface LudoState extends BaseGameState {
  playerStates: LudoPlayerState[];
  diceValue: number|null;
  canMoveTokens: number[]; // indices of tokens that can move with current dice
  mustRoll: boolean;
  consecutiveSixes: number;
}

export const LUDO_COLORS=['#e11d48','#0ea5e9','#16a34a','#f59e0b'];

export function createLudoState(players: PlayerConfig[]): LudoState {
  const now=Date.now();
  const offsets=[0,13,26,39];
  const playerStates: LudoPlayerState[] = players.map((_,i)=> ({
    tokens: [-1,-1,-1,-1],
    startOffset: offsets[i],
    color: LUDO_COLORS[i%4]
  }));
  return {
    gameId:'ludo',
    matchId:`ludo-${now}-${Math.random().toString(36).slice(2,6)}`,
    players,
    currentPlayer:0,
    status:'playing',
    winner:null,
    isDraw:false,
    moveHistory:[],
    createdAt:now,
    updatedAt:now,
    durationSeconds:0,
    playerStates,
    diceValue:null,
    canMoveTokens:[],
    mustRoll:true,
    consecutiveSixes:0
  };
}

export function rollDiceLudo(): number { return Math.floor(Math.random()*6)+1; }

export function globalPos(playerIdx:number, steps:number, startOffset:number): number | null {
  if(steps===-1) return null;
  if(steps>=52 && steps<=56) return 100+playerIdx*10+ (steps-52); // home stretch distinct
  if(steps===57) return 1000+playerIdx; // finished sentinel
  // track 0-51 maps to global 0-51 rotating
  const global = (startOffset + steps) % 52;
  return global;
}

const SAFE_GLOBALS = new Set([0,8,13,21,26,34,39,47]);

export function getMovableTokens(state: LudoState): number[] {
  if(state.diceValue===null) return [];
  const ps=state.playerStates[state.currentPlayer];
  const dice=state.diceValue;
  const res:number[]=[];
  for(let i=0;i<4;i++){
    const steps=ps.tokens[i];
    if(steps===-1){
      if(dice===6) res.push(i);
    } else if(steps>=0 && steps<=56){
      const newSteps=steps+dice;
      if(newSteps<=57) res.push(i);
      // cannot overshoot home beyond 57
    } else if(steps===57){
      // already finished cannot move
    }
  }
  // if no tokens on board and dice !=6, no move -> will pass turn
  return res;
}

export function applyDice(state: LudoState, value:number): LudoState {
  const movable=getMovableTokens({...state, diceValue:value});
  // handle three sixes forfeit? We already track consecutiveSixes
  let mustRoll=false;
  let canMove=movable;
  if(movable.length===0){
    // no move possible: will auto pass if not six
    // if six, still allow extra roll? But no tokens to move, so we still need to handle six extra turn? Actually if no movable and dice 6, turn stays but no move to make: we still stay mustRoll? But we treat as turn passes after acknowledging no move
    canMove=[];
    mustRoll=false;
  } else {
    mustRoll=false;
  }
  return { ...state, diceValue:value, canMoveTokens:canMove, mustRoll, consecutiveSixes: value===6? state.consecutiveSixes+1 : 0 };
}

export function applyTokenMove(state: LudoState, tokenIdx:number): {next:LudoState, error?:string, extraTurn?:boolean, win?:boolean } {
  if(state.diceValue===null) return {next:state, error:'Roll first'};
  if(!state.canMoveTokens.includes(tokenIdx)) return {next:state, error:'Cannot move that token'};
  const ps= state.playerStates[state.currentPlayer];
  const dice=state.diceValue!;
  let newSteps: number;
  if(ps.tokens[tokenIdx]===-1){
    newSteps=0; // entering board
  } else {
    newSteps=ps.tokens[tokenIdx]+dice;
  }
  const newPlayerStates = state.playerStates.map((p,i)=> i===state.currentPlayer? {...p, tokens:[...p.tokens]} : {...p, tokens:[...p.tokens]});
  newPlayerStates[state.currentPlayer].tokens[tokenIdx]=newSteps;
  // handle capture: check global pos collisions
  let captured=false;
  if(newSteps>=0 && newSteps<=51){
    const myGlobal = globalPos(state.currentPlayer, newSteps, ps.startOffset)!;
    if(!SAFE_GLOBALS.has(myGlobal)){
      // check opponents tokens that are on same global and not in home stretch
      for(let pi=0; pi<state.playerStates.length; pi++){
        if(pi===state.currentPlayer) continue;
        const opp=state.playerStates[pi];
        for(let ti=0; ti<4; ti++){
          const oppSteps=opp.tokens[ti];
          if(oppSteps>=0 && oppSteps<=51){
            const oppGlobal= globalPos(pi, oppSteps, opp.startOffset)!;
            if(oppGlobal===myGlobal){
              // capture: send to yard
              newPlayerStates[pi].tokens[ti]=-1;
              captured=true;
            }
          }
        }
      }
    }
  }
  const isFinished=newSteps===57;
  const allFinished = newPlayerStates[state.currentPlayer].tokens.every(s=> s===57);
  const win=allFinished;
  const extraTurn = dice===6 || captured; // extra turn on 6 or capture (house rule: capture gives extra? We'll give extra only on 6 to avoid confusion, but capture bonus variant: we give no extra except six)
  // Actually classic Ludo gives extra turn on capture? Some variants yes, but we'll stick to extra only on 6 for simplicity
  const realExtra = dice===6 && !win;
  // handle 3 sixes forfeit: if consecutiveSixes >=3, forfeit and pass turn
  let nextPlayer = state.currentPlayer;
  let nextConsecutive = state.consecutiveSixes;
  if(state.consecutiveSixes>=2 && dice===6){ // this is third six
    // forfeit turn
    nextPlayer=(state.currentPlayer+1)% state.players.length;
    nextConsecutive=0;
  } else if(realExtra){
    nextPlayer=state.currentPlayer;
  } else {
    nextPlayer=(state.currentPlayer+1)% state.players.length;
    nextConsecutive=dice===6? nextConsecutive : 0;
  }
  // If player has no movable tokens, auto-pass handled externally
  let status:LudoState['status']='playing';
  let winner:number|null=null;
  if(win){ status='finished'; winner=state.currentPlayer; }
  const move:MoveRecord={playerIndex:state.currentPlayer, move:{tokenIdx,dice,newSteps,captured}, timestamp:Date.now(), notation:`T${tokenIdx+1}+${dice}`};
  return {next:{
    ...state,
    playerStates:newPlayerStates,
    currentPlayer: status==='finished'? state.currentPlayer : nextPlayer,
    status,
    winner,
    isDraw:false,
    moveHistory:[...state.moveHistory, move],
    updatedAt:Date.now(),
    diceValue: null,
    canMoveTokens:[],
    mustRoll:true,
    consecutiveSixes: nextConsecutive
  }, extraTurn: realExtra, win};
}
