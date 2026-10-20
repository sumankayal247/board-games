import { describe, it, expect } from 'vitest';
import { createSnakesState, applyMoveSnakes, ladders, snakes } from '../engine';

const players:any=[{id:'p0',name:'A',type:'human',avatar:'🦊',color:'#000'},{id:'p1',name:'B',type:'human',avatar:'🐼',color:'#fff'}];

describe('Snakes',()=>{
  it('ladder climbs',()=>{
    let s=createSnakesState(players);
    // player at 0, roll 3 -> ladder 3->21
    const {next}=applyMoveSnakes(s,3);
    expect(next.positions[0]).toBe(21);
  });
  it('snake slides',()=>{
    let s=createSnakesState(players);
    // place player at 21, roll 3 to hit 24->5
    s.positions[0]=21;
    const {next}=applyMoveSnakes(s,3);
    expect(next.positions[0]).toBe(5);
  });
  it('exact win',()=>{
    let s=createSnakesState(players);
    s.positions[0]=97;
    const {next}=applyMoveSnakes(s,3);
    expect(next.positions[0]).toBe(100);
    expect(next.status).toBe('finished');
    const {next: n2}=applyMoveSnakes(s,4);
    expect(n2.positions[0]).toBe(97); // need exact
  });
});
