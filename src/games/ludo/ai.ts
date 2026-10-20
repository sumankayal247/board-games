import { getMovableTokens, type LudoState } from './engine';

export function getBestLudoMove(state: LudoState, difficulty:'noob'|'master'|'god'): number {
  const movable=getMovableTokens(state);
  if(!movable.length) throw new Error('No move');
  if(difficulty==='noob'){
    // random
    return movable[Math.floor(Math.random()*movable.length)];
  }
  // heuristic: prefer capture, prefer finishing, prefer moving furthest along but entering on 6, prefer safe squares
  const ps=state.playerStates[state.currentPlayer];
  let best=movable[0];
  let bestScore=-Infinity;
  const scoreToken=(idx:number)=>{
    const steps=ps.tokens[idx];
    const dice=state.diceValue!;
    let newSteps: number;
    if(steps===-1) newSteps=0; else newSteps=steps+dice;
    let score=0;
    if(steps===-1 && dice===6) score+=5; // entering
    if(newSteps===57) score+=100; // finishing move huge
    if(newSteps>=52 && newSteps<57) score+= 10 + (newSteps-52); // home stretch bonus
    // capture potential
    // approximate: check if newSteps track gives capture
    if(newSteps>=0 && newSteps<=51){
      // lookaheadOpponent capture: we can simulate
      // not perfect, but add bonus if landing on start (safe) avoid? actually safe protects but avoid being captured next turn
      // distance to opponents behind within 6?
    }
    // prefer advancing furthest token
    if(steps>=0) score+= steps*0.1;
    // prefer not to leave yard with all tokens? etc.
    return score;
  };
  for(const idx of movable){
    const s=scoreToken(idx) + (difficulty==='god'? Math.random()*0.1 : 0);
    if(s>bestScore){ bestScore=s; best=idx; }
  }
  // master: 20% random
  if(difficulty==='master' && Math.random()<0.2) return movable[Math.floor(Math.random()*movable.length)];
  return best;
}
