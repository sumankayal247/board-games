# Board Games

A polished, modern web platform for classic tabletop games — browse 19 titles, learn rules in 30 seconds, and play locally with friends or against computer opponents.

> **Live philosophy:** Real gameplay > mockups. Every feature labeled accurately — *Playable* means fully playable, *Coming Soon* means not faked.

---

## Product Overview

**Board Games** is a welcoming single-page application where casual players, families, and friends can:

- Browse a structured catalog of 19 classic board & card games
- Search, filter, and sort by category, player count, status, AI support, duration
- View dedicated detail pages with rules, metadata, and status
- Configure local multiplayer matches (human vs human, human vs computer, mixed)
- Play against **Noob / Master / God** AI where implemented — each difficulty is meaningfully different
- Pause/resume, restart, view move history, and see polished result screens
- Review local match history (localStorage)

Focus: **clarity, playability, responsiveness, low friction**. Works without an account.

---

## Technology Stack

- **React 19 + TypeScript 6** + **React Router 6**
- **Vite 8** build tool
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **Vitest + Testing Library + jsdom** for unit tests
- **LocalStorage** for prefs & history (IndexedDB-ready architecture)
- **Web Audio API** (via oscillator — no external assets) for subtle feedback with mute control

No backend required for MVP — architecture is cleanly separable for future online multiplayer.

---

## Installation

```bash
npm install
npm run dev      # dev server on http://localhost:5173 (host 0.0.0.0)
npm run build    # production build
npm run preview  # preview build
npx vitest run   # run tests
```

---

## Production Build

```bash
npm run build
# output in dist/
```

## Test Commands

```bash
npx vitest run          # all tests
npx vitest run --coverage
npx vitest watch        # watch mode
```

25 tests passing across 7 game engines (valid moves, invalid moves, turn progression, win/draw, AI legality).

---

## Project Structure

```
/src
  /components
    Header.tsx, GameCard.tsx, GameFilters.tsx, SearchBar.tsx, TurnIndicator.tsx
  /data
    games.ts            # 19-entry catalog metadata (id, name, category, players, duration, status, AI, rules)
  /games
    tictactoe/  engine.ts, ai.ts, Board.tsx, __tests__/
    connect4/   engine.ts, ai.ts, Board.tsx
    checkers/   engine.ts, ai.ts, Board.tsx
    chess/      engine.ts, ai.ts, Board.tsx
    ludo/       engine.ts, ai.ts, Board.tsx
    snakes/     engine.ts, Board.tsx
    othello/    engine.ts, ai.ts, Board.tsx
  /lib
    storage.ts          # history + prefs persistence
    sounds.ts           # Web Audio oscillator sfx with mute
  /pages
    Home.tsx, Library.tsx, GameDetail.tsx, MatchSetup.tsx, GamePlay.tsx
  /types
    index.ts            # shared types (GameMetadata, PlayerConfig, BaseGameState)
  App.tsx, main.tsx, index.css
```

### How games are implemented

Each game follows the same modular pattern:

```
games/<game>/
  engine.ts   — serializable state, createInitialState(), getLegalMoves(), applyMove(), checkWinner()
  ai.ts       — getBestMove(state, difficulty)  (game-specific heuristic / minimax)
  Board.tsx   — presentational board + interaction (receives state + onMove)
  __tests__/  — vitest unit tests for rules
```

**Game controller** lives in `pages/GamePlay.tsx` (turn system, AI scheduling, pause, result, history). Rules never live inside UI components — the board calls `applyMove` through the engine.

**Game state** is serializable (`gameId, matchId, players, currentPlayer, boardState, moveHistory, status, winner, isDraw, timestamps`). Ready for save/resume via `localStorage` (and future IndexedDB).

---

## How to Add a New Game

1. **Metadata** — Add entry to `src/data/games.ts` (id, name, categories, players, duration, status, rules).
2. **Engine** — Create `src/games/<id>/engine.ts`:
   ```ts
   export interface MyState extends BaseGameState { board: ... }
   export function createMyState(players): MyState
   export function getLegalMoves(state): Move[]
   export function applyMove(state, move): {next, error?}
   export function checkWinner(state): ...
   ```
3. **AI** — `src/games/<id>/ai.ts`:
   ```ts
   export function getBestMove(state, difficulty: 'noob'|'master'|'god'): Move
   // must always return a legal move; validate via engine
   ```
4. **UI** — `src/games/<id>/Board.tsx` (render board, handle clicks/taps + keyboard, highlight legal moves).
5. **Wire** — Import in `pages/GamePlay.tsx` (create branch for `createState` + AI turn + human handler).
6. **Tests** — `src/games/<id>/__tests__/engine.test.ts` (valid/invalid moves, win/draw, turn, AI legality).
7. **Status** — Set `status: 'playable'` when end-to-end; otherwise `coming_soon`.

No changes to global state or other games required.

---

## How AI Difficulty Is Implemented

Each game defines difficulty independently — **not** just `thinkingTime`.

| Game | Noob | Master | God |
|------|------|--------|-----|
| **Tic-Tac-Toe** | 50% random, sometimes misses win/block | 20% random else minimax | Perfect minimax |
| **Connect Four** | Win/block heuristics (60%/40%) else random | Minimax depth 4 + heuristic | Minimax depth 6 |
| **Checkers** | 70% random | Minimax depth 3 + material/position | Minimax depth 5 |
| **Chess** | Random + 30% capture bias | Minimax depth 2 + material + position | Minimax depth 3 |
| **Othello** | Random + 30% max-flip | Greedy + corner bonus | Minimax depth 4 + weighted board + mobility |
| **Ludo/Snakes** | Random legal token / dice luck | Heuristic (finish > home > advance) | Same + capture awareness |

All AI moves validated through the engine; illegal moves never applied.

---

## Persistence Architecture

- **Preferences** (sound, reduced motion) → `localStorage: 'boardgames_prefs'`
- **Match history** → `localStorage: 'boardgames_history'` (capped at 100)
- **Saved game** (per matchId) → `localStorage: 'boardgames_saved_<matchId>'` (API in `lib/storage.ts`, used for pause/resume)
- Current implementation saves **completed** match summaries; in-progress save is scaffolding-ready for IndexedDB migration if needed.

No account required. No sensitive data stored. Respectful of storage limits; failures are caught and surfaced via toast.

---

## Online Multiplayer Architecture (Deferred)

MVP is **local-only** by design. Architecture is prepared for server-authoritative multiplayer:

- Reusable `BaseGameState` + engine can run on server
- `applyMove` validation would be server-side; client is never trusted
- Planned transport: WebSockets, with reconnection, move deduplication, match expiration
- Labelled clearly as **Online Multiplayer — Coming Soon** (no fake lobby)

Default decisions (per spec):
- Local first, online later
- No account required for local play
- Browser-local persistence for MVP

---

## Which Games Are Playable / Prototype / Coming Soon

| Status | Games | AI |
|--------|-------|----|
| **Playable (7)** | Tic-Tac-Toe, Connect Four, Checkers, Chess, Ludo, Snakes & Ladders, Othello | Full Noob/Master/God where applicable (Snakes/Ludo dice-based) |
| **Prototype** | — | — |
| **Coming Soon (12)** | Go, Chinese Checkers, Monopoly, Spider, Uno, Backgammon, Battleship, Scrabble, Clue, Risk, Jenga, The Game of Life | Clearly marked “AI: Coming Soon” / “Computer opponents coming soon” |
| **Unavailable** | — | — |

**Never** shows “Play Now” for non-playable titles — shows “View Details” + “Coming Soon” instead.

---

## AI Difficulties Implemented

| Game | Noob | Master | God |
|------|------|--------|-----|
| Tic-Tac-Toe | ✅ | ✅ | ✅ |
| Connect Four | ✅ | ✅ | ✅ |
| Checkers | ✅ | ✅ | ✅ |
| Chess | ✅ | ✅ | ✅ |
| Othello | ✅ | ✅ | ✅ |
| Ludo | ✅ | ✅ | ✅ |
| Snakes & Ladders | Dice luck (no strategy) | — | — |

All difficulties are meaningfully different (search depth / evaluation / randomness).

---

## Local Saving

- ✅ Completed match history persisted (winner, duration, move count)
- 🚧 In-progress auto-save API ready (`saveGameState`/`loadGameState` in `lib/storage.ts`), not auto-wired for MVP to avoid complexity
- Failed saves handled gracefully (try/catch + toast)

**Online multiplayer:** ❌ Not implemented — correctly labeled Coming Soon, no fake functionality.

---

## What Remains

- Implement remaining 12 games (Go, Monopoly, etc.) with full rules, boards, AI, tests
- In-progress local resume via IndexedDB + UI
- Accounts & cross-device sync
- Server-authoritative online multiplayer (WebSockets, rooms, matchmaking, reconnection)
- Expanded accessibility audits (screen-reader board announcements) & reduced-motion preferences
- Additional UI tests (responsive, keyboard, modal focus)
- Sound assets upgrade (currently oscillator-based, muted by default option)

---

## Visual Design Direction

Warm, playful, modern tabletop aesthetic — subtle shadows, rounded corners, tactile board textures, no glassmorphism overload, no dark casino palette. Original icons/colors per game, no copied branded assets.

---

## License

MIT — see LICENSE.
