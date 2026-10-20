import { describe, it, expect } from 'vitest';
import { createLudoState, applyDice, applyTokenMove } from '../engine';

const players:any=[{id:'p0',name:'A',type:'human',avatar:'🦊',color:'#000'},{id:'p1',name:'B',type:'human',avatar:'🐼',color:'#fff'}];

describe('Ludo',()=>{
  it('enters on 6',()=>{
    let s=createLudoState(players);
    s={...s, diceValue:6, mustRoll:false, canMoveTokens:[0]};
    // Actually need to use applyDice flow: but test applyTokenMove directly
    const s2=applyDice(s,6);
    expect(s2.canMoveTokens.length).toBeGreaterThan(0);
    const res=applyTokenMove(s2, s2.canMoveTokens[0]);
    expect(res.error).toBeUndefined();
    expect(res.next.playerStates[0].tokens.includes(0)).toBe(true);
  });
  it('cannot enter without 6',()=>{
    let s=createLudoState(players);
    s=applyDice(s,3);
    expect(s.canMoveTokens.length).toBe(0);
  });
});
