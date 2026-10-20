import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { gamesCatalog } from '../data/games';
import { TurnIndicator } from '../components/TurnIndicator';
import { playSound } from '../lib/sounds';
import { addHistory } from '../lib/storage';

// TicTacToe
import { createTTTState, applyMove as applyTTT } from '../games/tictactoe/engine';
import { getBestMove as getTTTTMove } from '../games/tictactoe/ai';
import { TicTacToeBoard } from '../games/tictactoe/Board';
// Connect4
import { createC4State, applyMoveC4 } from '../games/connect4/engine';
import { getBestMoveC4 } from '../games/connect4/ai';
import { Connect4Board } from '../games/connect4/Board';
// Checkers
import { createCheckersState, applyMoveCheckers, getAllMoves as getCheckersMoves } from '../games/checkers/engine';
import { getBestMoveCheckers } from '../games/checkers/ai';
import { CheckersBoard } from '../games/checkers/Board';
// Chess
import { createChessState, applyMoveChess, getLegalMoves as getChessLegal } from '../games/chess/engine';
import { getBestMoveChess } from '../games/chess/ai';
import { ChessBoard } from '../games/chess/Board';
// Ludo
import { createLudoState, applyDice as applyLudoDice, applyTokenMove, rollDiceLudo } from '../games/ludo/engine';
import { getBestLudoMove } from '../games/ludo/ai';
import { LudoBoard } from '../games/ludo/Board';
// Snakes
import { createSnakesState, applyMoveSnakes, rollDice as rollSnakesDice } from '../games/snakes/engine';
import { SnakesBoard } from '../games/snakes/Board';
// Othello
import { createOthelloState, applyMoveOthello, getFlips, getLegalMovesOthello } from '../games/othello/engine';
import { getBestMoveOthello } from '../games/othello/ai';
import { OthelloBoard } from '../games/othello/Board';

export function GamePlay() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const game = gamesCatalog.find(g => g.id === id);
  const matchId = params.get('match') || 'local';

  // load setup
  const setupRaw = sessionStorage.getItem(`setup-${id}`);
  const setup = setupRaw ? JSON.parse(setupRaw) : null;

  // generic state container as any
  const [gameState, setGameState] = useState<any>(null);
  const [selected, setSelected] = useState<[number,number]|null>(null);
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState<string|null>(null);
  const [lastEvent, setLastEvent] = useState<string|null>(null);
  const [startTs] = useState(Date.now());
  const [thinking, setThinking] = useState(false);
  const [moveCount, setMoveCount] = useState(0);

  // init
  useEffect(()=>{
    if (!game || !setup) return;
    const players = setup.players;
    let state: any = null;
    if (id==='tictactoe') state=createTTTState(players);
    else if (id==='connect4') state=createC4State(players);
    else if (id==='checkers') state=createCheckersState(players);
    else if (id==='chess') state=createChessState(players);
    else if (id==='ludo') state=createLudoState(players);
    else if (id==='snakes') state=createSnakesState(players);
    else if (id==='othello') state=createOthelloState(players);
    else state={};
    // assign matchId from setup
    state.matchId = setup.matchId || matchId;
    setGameState(state);
  },[id, game, setup, matchId]);

  // toast auto hide
  useEffect(()=>{
    if(toast){ const t=setTimeout(()=>setToast(null),2000); return ()=>clearTimeout(t); }
  },[toast]);

  // derive current player type
  const currentPlayer = gameState?.currentPlayer ?? 0;
  const currentPlayerConfig = gameState?.players?.[currentPlayer];
  const isAITurn = currentPlayerConfig?.type==='computer' && gameState?.status==='playing' && !paused;

  // handle AI turn
  useEffect(()=>{
    if (!gameState || gameState.status!=='playing' || paused) return;
    if (!isAITurn) return;
    if (thinking) return;
    setThinking(true);
    const delay = currentPlayerConfig.difficulty==='noob'? 600 : currentPlayerConfig.difficulty==='master'? 900 : 1100;
    const handle = window.setTimeout(()=>{
      try {
        let next = gameState;
        let error: string|undefined;
        if (id==='tictactoe'){
          const m=getTTTTMove(gameState, currentPlayerConfig.difficulty);
          const res=applyTTT(gameState,m);
          if(res.error) error=res.error; else next=res.next;
        } else if (id==='connect4'){
          const m=getBestMoveC4(gameState, currentPlayerConfig.difficulty);
          const res=applyMoveC4(gameState,m);
          if(res.error) error=res.error; else next=res.next;
        } else if (id==='othello'){
          // need to handle pass: if no moves, engine will auto-pass via applyMove? But AI turn should check legal moves; if no moves, we need to auto pass
          // For Othello, getLegalMovesOthello is inside engine; if zero, we should try to pass by switching player manually
          // We'll check manually
          const moves=getLegalMovesOthello(gameState);
          if(moves.length===0){
            // pass: just switch player if opponent has moves
            // Simulate a pass by toggling player
            const board=gameState.board;
            const hasMoves=(p:number)=> {
              for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(getFlips(board,r,c,p).length>0) return true;
              return false;
            };
            if(hasMoves(currentPlayerConfig? currentPlayerConfig : 0)===false){
              // actually both have no moves -> game should have ended, but handle
              // force check status
            }
            // Pass logic: we set currentPlayer to opponent, if opponent also has no moves then game ends
            const opp=currentPlayer===0?1:0;
            if(hasMoves(opp)){
              next={...gameState, currentPlayer: opp};
            } else {
              // game over -> handled by engine after last move, but here we are in pass after last human move? This shouldn't happen
              next={...gameState, status:'finished', winner:null, isDraw:true};
            }
          } else {
            const m=getBestMoveOthello(gameState, currentPlayerConfig.difficulty);
            const res=applyMoveOthello(gameState, m[0], m[1]);
            if(res.error) error=res.error; else next=res.next;
          }
        } else if (id==='checkers'){
          const m=getBestMoveCheckers(gameState, currentPlayerConfig.difficulty);
          const res=applyMoveCheckers(gameState,m);
          if(res.error) error=res.error; else next=res.next;
        } else if (id==='chess'){
          const m=getBestMoveChess(gameState, currentPlayerConfig.difficulty);
          const res=applyMoveChess(gameState,m);
          if(res.error) error=res.error; else next=res.next;
        } else if (id==='ludo'){
          // AI for Ludo: need to roll then move
          if(gameState.mustRoll){
            const dice=rollDiceLudo();
            const afterDice=applyLudoDice(gameState,dice);
            // if no moves, auto pass (turn will have switched inside applyDice? Actually applyDice doesn't switch; applyTokenMove does)
            // We'll set state to afterDice, then handle token move in next tick
            next=afterDice;
            // if movable tokens exist, we need to immediately pick one
            if(afterDice.canMoveTokens.length>0){
              const mv=getBestLudoMove(afterDice, currentPlayerConfig.difficulty);
              const res=applyTokenMove(afterDice,mv);
              next=res.next;
              if(res.win) setLastEvent('Wins!');
            } else {
              // no moves: auto pass turn if dice not 6
              // The engine's applyDice leaves diceValue set but turn not advanced; we need to advance if no moves
              if(dice!==6 && afterDice.consecutiveSixes<3){
                // Pass turn
                const numPlayers=afterDice.players.length;
                next={...afterDice, currentPlayer:(afterDice.currentPlayer+1)%numPlayers, diceValue:null, canMoveTokens:[], mustRoll:true};
              } else if(dice===6 && afterDice.canMoveTokens.length===0){
                // With 6 but no movable, we still need to handle extra turn? Actually mustRoll true but player gets another chance? However we treat as pass after acknowledging
                // For simplicity, keep extra turn logic: if 3 sixes, forfeit handled in next move attempt? We'll just pass turn if no moves
                // keep current player for extra roll
                next={...afterDice, diceValue:null, canMoveTokens:[], mustRoll:true, currentPlayer: afterDice.currentPlayer};
                // But to avoid infinite loop, we will let AI roll again next tick
                // So set mustRoll true and loop
              }
            }
            setLastEvent(`Rolled ${dice}`);
          } else {
            // must move token
            const mv=getBestLudoMove(gameState, currentPlayerConfig.difficulty);
            const res=applyTokenMove(gameState,mv);
            if(res.error) error=res.error; else next=res.next;
            if(res.win) setLastEvent('Wins!');
          }
        } else if (id==='snakes'){
          const dice=rollSnakesDice();
          const {next: nxt, event}=applyMoveSnakes(gameState,dice);
          next=nxt;
          if(event) setLastEvent(event);
          else setLastEvent(`Rolled ${dice}`);
        }
        if(error){
          setToast(error);
        } else {
          setGameState(next);
          playSound('move');
          setMoveCount(m=>m+1);
          if(next.status==='finished'){
            // persist history
            const dur=Math.floor((Date.now()-startTs)/1000);
            addHistory({
              matchId: next.matchId,
              gameId: id!,
              gameName: game!.name,
              players: next.players.map((p:any)=>({name:p.name,type:p.type})),
              winner: next.winner,
              isDraw: next.isDraw,
              durationSeconds: dur,
              finishedAt: Date.now(),
              moveCount: next.moveHistory.length
            });
            playSound('win');
          }
        }
      } catch(e:any){
        setToast(e.message || 'AI error');
      } finally {
        setThinking(false);
      }
    }, delay);
    return ()=> clearTimeout(handle);
  },[gameState, isAITurn, paused, thinking, id, currentPlayerConfig?.difficulty]);

  // handlers for human moves
  const handleTTTMove=(idx:number)=>{
    if(!gameState || gameState.status==='finished' || isAITurn) return;
    const res=applyTTT(gameState,idx);
    if(res.error){ setToast(res.error); playSound('invalid'); return; }
    setGameState(res.next);
    playSound('move');
    if(res.next.status==='finished'){
      const dur=Math.floor((Date.now()-startTs)/1000);
      addHistory({matchId:res.next.matchId, gameId:id!, gameName:game!.name, players: res.next.players.map((p:any)=>({name:p.name,type:p.type})), winner:res.next.winner, isDraw:res.next.isDraw, durationSeconds:dur, finishedAt:Date.now(), moveCount: res.next.moveHistory.length});
      playSound('win');
    }
  };
  const handleC4Move=(col:number)=>{
    if(!gameState || gameState.status==='finished' || isAITurn) return;
    const res=applyMoveC4(gameState,col);
    if(res.error){ setToast(res.error); playSound('invalid'); return;}
    setGameState(res.next); playSound('move');
    if(res.next.status==='finished'){ const dur=Math.floor((Date.now()-startTs)/1000); addHistory({matchId:res.next.matchId, gameId:id!, gameName:game!.name, players:res.next.players.map((p:any)=>({name:p.name,type:p.type})), winner:res.next.winner, isDraw:res.next.isDraw, durationSeconds:dur, finishedAt:Date.now(), moveCount:res.next.moveHistory.length}); playSound('win');}
  };
  const handleOthelloMove=(r:number,c:number)=>{
    if(!gameState || isAITurn) return;
    const res=applyMoveOthello(gameState,r,c);
    if(res.error){ setToast(res.error); playSound('invalid'); return;}
    setGameState(res.next); playSound('move');
    if(res.next.status==='finished'){ const dur=Math.floor((Date.now()-startTs)/1000); addHistory({matchId:res.next.matchId, gameId:id!, gameName:game!.name, players:res.next.players.map((p:any)=>({name:p.name,type:p.type})), winner:res.next.winner, isDraw:res.next.isDraw, durationSeconds:dur, finishedAt:Date.now(), moveCount:res.next.moveHistory.length}); playSound('win');}
  };
  const handleCheckersMove=(from:[number,number],to:[number,number])=>{
    if(!gameState) return;
    // construct move
    const all=getCheckersMoves(gameState);
    const m=all.find(mm=> mm.from[0]===from[0]&&mm.from[1]===from[1]&&mm.to[0]===to[0]&&mm.to[1]===to[1]);
    if(!m){ setToast('Illegal move'); playSound('invalid'); return;}
    const res=applyMoveCheckers(gameState,m);
    if(res.error){ setToast(res.error); playSound('invalid'); return;}
    setGameState(res.next); playSound('move');
    setSelected(res.mustContinueFrom || null);
    if(res.next.status==='finished'){ const dur=Math.floor((Date.now()-startTs)/1000); addHistory({matchId:res.next.matchId, gameId:id!, gameName:game!.name, players:res.next.players.map((p:any)=>({name:p.name,type:p.type})), winner:res.next.winner, isDraw:res.next.isDraw, durationSeconds:dur, finishedAt:Date.now(), moveCount:res.next.moveHistory.length}); playSound('win');}
  };
  const handleChessMove=(from:[number,number],to:[number,number],promo?:string)=>{
    if(!gameState) return;
    const legal=getChessLegal(gameState);
    // find promotion piece if pawn reaching last rank and no promo given, default to queen
    let mv=legal.find(m=> m.from[0]===from[0]&&m.from[1]===from[1]&&m.to[0]===to[0]&&m.to[1]===to[1]);
    if(!mv){ setToast('Illegal chess move'); playSound('invalid'); return;}
    if(mv.promotion && !promo){
      // need promotion selection: for now auto queen
      mv={...mv, promotion:'q' as any};
    } else if(promo) mv={...mv, promotion: promo as any};
    const res=applyMoveChess(gameState,mv);
    if(res.error){ setToast(res.error); playSound('invalid'); return;}
    setGameState(res.next); playSound('move'); setSelected(null);
    if(res.next.status==='finished'){ const dur=Math.floor((Date.now()-startTs)/1000); addHistory({matchId:res.next.matchId, gameId:id!, gameName:game!.name, players:res.next.players.map((p:any)=>({name:p.name,type:p.type})), winner:res.next.winner, isDraw:res.next.isDraw, durationSeconds:dur, finishedAt:Date.now(), moveCount:res.next.moveHistory.length}); playSound('win');}
  };

  const handleLudoRoll=()=>{
    if(!gameState || isAITurn) return;
    if(!gameState.mustRoll) { setToast('Select a token'); return;}
    const dice=rollDiceLudo();
    const afterDice=applyLudoDice(gameState,dice);
    setGameState(afterDice);
    setLastEvent(`You rolled ${dice}`);
    playSound('move');
    if(afterDice.canMoveTokens.length===0){
      // auto pass if no moves and not extra turn
      setTimeout(()=>{
        if(dice===6 && afterDice.consecutiveSixes<3){
          // allow another roll: keep turn, mustRoll true
          setToast('No moves — roll again');
          setGameState((prev:any)=> ({...prev, diceValue: null, canMoveTokens:[], mustRoll:true}));
        } else {
          // pass turn
          const threeSixes = afterDice.consecutiveSixes>=2 && dice===6;
          if(threeSixes) setToast('Three sixes! Turn lost');
          else setToast('No moves — turn passes');
          const nextPlayer=(afterDice.currentPlayer+1)%afterDice.players.length;
          setGameState((prev:any)=> ({...prev, currentPlayer: nextPlayer, diceValue:null, canMoveTokens:[], mustRoll:true, consecutiveSixes: dice===6? prev.consecutiveSixes:0 }));
        }
      }, 600);
    }
  };
  const handleLudoToken=(idx:number)=>{
    if(!gameState || isAITurn) return;
    const res=applyTokenMove(gameState,idx);
    if(res.error){ setToast(res.error); playSound('invalid'); return;}
    setGameState(res.next); playSound('move');
    if(res.win){ playSound('win'); const dur=Math.floor((Date.now()-startTs)/1000); addHistory({matchId:res.next.matchId, gameId:id!, gameName:game!.name, players:res.next.players.map((p:any)=>({name:p.name,type:p.type})), winner:res.next.winner, isDraw:false, durationSeconds:dur, finishedAt:Date.now(), moveCount:res.next.moveHistory.length});}
    if(res.next.status==='playing' && res.extraTurn) setToast('Extra turn!');
  };
  const handleSnakesRoll=()=>{
    if(!gameState || isAITurn) return;
    const dice=rollSnakesDice();
    const {next,event}=applyMoveSnakes(gameState,dice);
    setGameState(next); playSound('move');
    setLastEvent(event || `Rolled ${dice}`);
    if(event) setToast(event);
    if(next.status==='finished'){ playSound('win'); const dur=Math.floor((Date.now()-startTs)/1000); addHistory({matchId:next.matchId, gameId:id!, gameName:game!.name, players:next.players.map((p:any)=>({name:p.name,type:p.type})), winner:next.winner, isDraw:false, durationSeconds:dur, finishedAt:Date.now(), moveCount:next.moveHistory.length});}
  };

  if(!game) return <div className="p-8">Game not found</div>;
  if(!setup) return (
    <div className="min-h-screen bg-[#fdf8ef] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md">
        <div className="text-4xl">{game.icon}</div>
        <div className="font-black mt-2">No match setup found</div>
        <div className="text-sm text-slate-600 mt-1">Please configure players first.</div>
        <Link to={`/game/${id}/setup`} className="inline-block mt-4 px-6 py-2 bg-slate-900 text-white rounded-full font-bold">Go to Setup</Link>
      </div>
    </div>
  );
  if(!gameState) return <div className="p-8 text-center">Loading...</div>;

  const isFinished=gameState.status==='finished';
  const isComputerThinking=isAITurn && !isFinished;

  return (
    <div className="min-h-screen bg-[#fdf8ef] flex flex-col">
      {/* top bar */}
      <div className="bg-white border-b border-slate-200 sticky top-[64px] z-30">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to={`/game/${id}`} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">←</Link>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{background: game.accent}}>{game.icon}</div>
            <div>
              <div className="font-black text-sm leading-none">{game.name}</div>
              <div className="text-xs text-slate-500">Match {gameState.matchId} • {Math.floor((Date.now()-startTs)/1000)}s • {moveCount} moves</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setPaused(p=>!p)} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold hover:bg-slate-50">{paused?'▶ Resume':'⏸ Pause'}</button>
            <button onClick={()=>{
              if(confirm('Restart match?')) {
                const players=setup.players;
                let state:any=null;
                if(id==='tictactoe') state=createTTTState(players);
                else if(id==='connect4') state=createC4State(players);
                else if(id==='checkers') state=createCheckersState(players);
                else if(id==='chess') state=createChessState(players);
                else if(id==='ludo') state=createLudoState(players);
                else if(id==='snakes') state=createSnakesState(players);
                else if(id==='othello') state=createOthelloState(players);
                state.matchId=setup.matchId;
                setGameState(state); setSelected(null); setLastEvent(null); setMoveCount(0); setPaused(false);
              }
            }} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold hover:bg-slate-50">Restart</button>
            <Link to="/library" className="px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-bold">Exit</Link>
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 pb-3">
          <TurnIndicator players={gameState.players} currentPlayer={gameState.currentPlayer} status={gameState.status}/>
          {isComputerThinking && <div className="mt-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 inline-flex items-center gap-2">🤖 {gameState.players[gameState.currentPlayer].name} is thinking… <span className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>}
        </div>
      </div>

      <div className="flex-1 max-w-[1180px] mx-auto w-full px-4 sm:px-6 py-6 grid lg:grid-cols-[1fr_320px] gap-6">
        {/* main board */}
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 sm:p-6">
          {toast && <div className="mb-3 p-2 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 text-center font-semibold">{toast}</div>}
          {paused && !isFinished && (
            <div className="mb-3 p-3 bg-slate-900 text-white rounded-xl text-center">
              <div className="font-black">Game Paused</div>
              <div className="text-xs opacity-80 mt-1">Take a break. Press Resume to continue.</div>
              <button onClick={()=>setPaused(false)} className="mt-2 px-5 py-2 bg-amber-400 text-slate-900 rounded-full font-bold">Resume</button>
            </div>
          )}
          <div className={paused && !isFinished ? 'pointer-events-none opacity-50' : ''}>
            {id==='tictactoe' && <TicTacToeBoard state={gameState} onMove={handleTTTMove} disabled={isComputerThinking || paused}/>}
            {id==='connect4' && <Connect4Board state={gameState} onMove={handleC4Move} disabled={isComputerThinking || paused}/>}
            {id==='othello' && <OthelloBoard state={gameState} onMove={handleOthelloMove} disabled={isComputerThinking || paused}/>}
            {id==='checkers' && <CheckersBoard state={gameState} onMove={handleCheckersMove} selected={selected} onSelect={setSelected} disabled={isComputerThinking || paused}/>}
            {id==='chess' && <ChessBoard state={gameState} onMove={handleChessMove} selected={selected} onSelect={setSelected} disabled={isComputerThinking || paused}/>}
            {id==='ludo' && <LudoBoard state={gameState} onTokenClick={handleLudoToken}/>}
            {id==='snakes' && <SnakesBoard state={gameState} onRoll={handleSnakesRoll} disabled={isComputerThinking || paused} lastEvent={lastEvent}/>}
          </div>

          {/* Ludo dice button for human */}
          {id==='ludo' && gameState.players[gameState.currentPlayer].type==='human' && gameState.mustRoll && !isFinished && !paused && (
            <div className="mt-4 flex justify-center">
              <button onClick={handleLudoRoll} disabled={isComputerThinking} className="px-8 py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-full font-black shadow disabled:opacity-40">Roll Dice 🎲</button>
            </div>
          )}

          {isFinished && (
            <div className="mt-6 p-5 bg-slate-900 text-white rounded-[20px] text-center">
              <div className="text-lg font-black">
                {gameState.isDraw? 'It’s a Draw!' : `🎉 ${gameState.players[gameState.winner]?.name} Wins!`}
              </div>
              <div className="text-xs opacity-70 mt-1">{gameState.winner!==null? `Winner: ${gameState.players[gameState.winner].name} • ${gameState.moveHistory.length} moves` : 'Draw game'}</div>
              <div className="mt-4 flex gap-2 justify-center">
                <button onClick={()=>{
                  const players=setup.players;
                  let state:any=null;
                  if(id==='tictactoe') state=createTTTState(players);
                  else if(id==='connect4') state=createC4State(players);
                  else if(id==='checkers') state=createCheckersState(players);
                  else if(id==='chess') state=createChessState(players);
                  else if(id==='ludo') state=createLudoState(players);
                  else if(id==='snakes') state=createSnakesState(players);
                  else if(id==='othello') state=createOthelloState(players);
                  state.matchId=setup.matchId;
                  setGameState(state); setSelected(null); setLastEvent(null); setMoveCount(0);
                }} className="px-5 py-2 bg-white text-slate-900 rounded-full font-bold">Play Again</button>
                <Link to={`/game/${id}/setup`} className="px-5 py-2 bg-white/10 border border-white/20 rounded-full font-bold">Change Setup</Link>
                <Link to="/library" className="px-5 py-2 bg-white/10 rounded-full font-bold">Back to Library</Link>
              </div>
            </div>
          )}
        </div>

        {/* side panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-[20px] border border-slate-200 p-4">
            <h3 className="font-black text-sm">Game Controls</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={()=>setPaused(p=>!p)} className="px-3 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold">{paused?'Resume':'Pause'}</button>
              <button onClick={()=>{
                // undo last move if human vs human and not finished
                if(gameState.moveHistory.length===0) { setToast('Nothing to undo'); return; }
                if(gameState.players.some((p:any)=>p.type==='computer')){ setToast('Undo not available vs Computer'); return; }
                const hist=[...gameState.moveHistory];
                hist.pop();
                // naive: recreate? For simplicity, we reconstruct from scratch: we need engine to rebuild. Instead we disallow if not trivial.
                // For TicTacToe/C4 we can rebuild, but for simplicity show toast
                setToast('Undo unavailable in this mode');
              }} className="px-3 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold disabled:opacity-40">Undo</button>
              <a href="#rules" className="px-3 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold text-center">Rules</a>
              <button onClick={()=>{
                const prefs=JSON.parse(localStorage.getItem('boardgames_prefs')||'{"sound":true}');
                prefs.sound=!prefs.sound;
                localStorage.setItem('boardgames_prefs', JSON.stringify(prefs));
                setToast(prefs.sound?'Sound on':'Sound off');
              }} className="px-3 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold">🔊 Sound</button>
            </div>
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="font-bold">Turn: {gameState.players[gameState.currentPlayer]?.name} {isComputerThinking?'🤖 thinking…':''}</div>
              <div className="text-slate-600 mt-1">Status: {gameState.status} {gameState.winner!==null? `• Winner ${gameState.players[gameState.winner]?.name}`: gameState.isDraw?'• Draw':''}</div>
              {lastEvent && <div className="mt-1 font-semibold text-amber-700">{lastEvent}</div>}
            </div>
            {(id==='ludo' || id==='snakes') && (
              <div className="mt-3 text-xs text-slate-600">
                {gameState.diceValue!==null? `Dice: ${gameState.diceValue}`: 'Roll to start'}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[20px] border border-slate-200 p-4">
            <h3 className="font-black text-sm">Move History</h3>
            <div className="mt-2 max-h-[220px] overflow-auto space-y-1 text-xs">
              {gameState.moveHistory.length===0? <div className="text-slate-400">No moves yet.</div> : gameState.moveHistory.map((m:any,i:number)=>(
                <div key={i} className={`flex justify-between px-2 py-1 rounded-full ${i%2?'bg-slate-50':''}`}>
                  <span className="font-bold">{i+1}. {gameState.players[m.playerIndex]?.name}</span><span>{m.notation || JSON.stringify(m.move).slice(0,20)}</span>
                </div>
              ))}
            </div>
          </div>

          <div id="rules" className="bg-white rounded-[20px] border border-slate-200 p-4">
            <h3 className="font-black text-sm">How to Play</h3>
            <div className="mt-2 text-xs leading-relaxed text-slate-600 space-y-1">
              <div><b>Objective:</b> {game.instructions.objective}</div>
              <div><b>Turn:</b> {game.instructions.turnStructure}</div>
              <div><b>Win:</b> {game.instructions.winning}</div>
              {game.instructions.rulesetNote && <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">{game.instructions.rulesetNote}</div>}
            </div>
            <Link to={`/game/${id}`} className="mt-3 inline-block text-xs font-bold text-amber-600 hover:text-amber-700">View full rules →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
