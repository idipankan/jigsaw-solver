# Jigsaw Puzzle Online — CLAUDE.md

Real-time multiplayer jigsaw puzzle game. Players join rooms, drag pieces from a tray onto a board, and compete to place pieces first. Server is the single source of truth; all game state lives in-memory.

## Tech Stack

- **Runtime:** Node.js 20
- **Server:** Express 4 + Socket.IO 4 (WebSockets for real-time sync)
- **Frontend:** Vanilla JS + pure CSS — no framework, no build step
- **State:** In-memory on server (Map of rooms), localStorage on client (overlay toggle only)
- **Language:** JavaScript (no TypeScript)

## Commands

```bash
npm run dev     # Development with hot-reload (node --watch server.js)
npm start       # Production server
```

Server starts on `http://localhost:3001` by default. Override with `PORT` env var.

No build step — static files in `public/` are served directly.

## Project Structure

```
jigsaw-puzzle-online/
├── server.js            # Express HTTP + Socket.IO setup, room management, GC timers
├── game/
│   └── GameRoom.js      # Game state, piece placement, scoring, snap logic
├── public/
│   ├── index.html       # Full UI (lobby, waiting room, game), embedded CSS
│   └── app.js           # Client logic: drag/drop, real-time sync, leaderboard
├── Dockerfile           # Alpine Node 20, single-stage, no build step needed
└── package.json
```

## Architecture

Three-layer design:

1. **`server.js`** — Thin layer. Manages a `Map<roomCode, GameRoom>` and routes Socket.IO events to GameRoom methods. Broadcasts state back to all clients in the room. Handles room lifecycle (GC timers, creator handoff) and authoritative game-over scheduling.

2. **`game/GameRoom.js`** — All game logic. Piece state (`id, row, col, x, y, placed, heldBy, placedBy`), player state (`id, name, color, score, cx, cy, holdingId, connected`), snap-to-grid detection (38px threshold), timer via absolute `timerEndsAt` timestamp, scramble/reset.

3. **`public/app.js`** — Client only renders and emits. Receives authoritative state from server. Drag handled via mousedown/mousemove/mouseup; cursor position throttled to 30ms interval. Flow: lobby → waiting room → game.

**Server is authoritative.** Clients never self-validate piece placement — they emit `pick`/`move`/`drop` and re-render what the server sends back.

## Key Constants (GameRoom.js)

- `PSZ = pieceSize(N) = floor(500 / N)` — piece size in pixels, computed per puzzle so the board always fits a 500px area; N = `round(sqrt(pieceCount))`. Not a fixed 50px — only true when N=10 (100 pieces). Sent to clients via `state.psz` and must drive any board-related sizing (e.g. `.grid-overlay`'s `background-size` in app.js), or the visual grid desyncs from the actual N×N layout.
- `SNAP_DIST = 38` — Snap distance in pixels from target cell center
- Board: starts at x=220 (tray occupies left side)
- Max 20 players (20 predefined colors)
- Piece counts: 64, 100, 196, 256

## Server-side Timers (server.js)

- **`ROOM_IDLE_MS = 5 min`** — A room is garbage-collected this long after the last player disconnects. Cancelled the moment anyone reconnects. Player scores are never erased by this — only the room itself is deleted when fully abandoned.
- **`roomIdleTimers`** — `Map<roomCode, timeout>` tracking pending room GC.
- **`gameOverTimers`** — `Map<roomCode, timeout>` for the single authoritative `game_over` broadcast at the timer deadline. Re-scheduled on start/scramble/reset. Cancelled on puzzle completion.

## Reconnect Resilience

Each browser tab generates a stable `clientId` (stored in `sessionStorage`). On every Socket.IO reconnect the client re-emits `join` with this `clientId`. The server uses it to reclaim the player's existing record (score, color, held piece) instead of creating a new one. While disconnected the player is shown as "away" (dimmed) on everyone's leaderboard. Any held piece is released immediately on disconnect via `releaseHeldPiece()`.

## Join Flow

1. **Lobby** — Player fills in name and room code (or leaves room blank to create a new room). Piece count, time limit, and image URL are set here by the creator; these fields are hidden when joining via a shared URL.
2. **Waiting room** — After joining, players see who else is present. The creator sees a "start game" button; others wait. Creator role passes automatically if the host disconnects.
3. **Game** — Creator clicks start; server emits `game_started`; all clients enter the puzzle view.

## URL Deep-link Sharing

Sharing a room via URL: `<base_url>?roomCode=<code>`

When this URL is opened:
- The room code input is pre-filled and locked (read-only).
- Piece count, time limit, and image URL sections are hidden (creator-controlled, ignored by server for joiners).
- Focus lands on the name field.

Both copy buttons (waiting room and in-game topbar) write the full share URL — not the bare code — to the clipboard. Helper: `getRoomShareUrl(code)` in `app.js`.

**Expired links:** if the room the link points at no longer exists (finished and GC'd, or never existed), the server refuses to silently create a fresh room under that code — it emits `room_expired` and the client shows a note, then redirects to the root URL. This only applies to joins that came in via the deep-link (`viaLink: true` in the `join` payload); typing a stale code manually still creates a new room as usual.

## Socket.IO Events

| Event (client → server) | Purpose |
|---|---|
| `join` | Join or create a room; re-sent on every reconnect with stable `clientId` |
| `start_game` | Creator-only: start the puzzle and move all players from lobby to game |
| `pick` | Pick up a piece from tray/board |
| `move` | Drag piece (throttled) |
| `drop` | Release piece (server validates snap) |
| `cursor` | Broadcast cursor position to others |
| `change_pieces` | Change piece count (creator only) |
| `change_image` | Set new puzzle image URL |
| `scramble` | Reset and re-scramble (creator only) |

| Event (server → client) | Purpose |
|---|---|
| `lobby_init` | Room is in lobby; sends waiting room state to joining client |
| `room_expired` | Deep-link join (`viaLink: true`) targets a room that no longer exists; client shows a note and redirects to root |
| `lobby_player_joined` | Another player joined the waiting room |
| `lobby_creator_changed` | Creator role transferred to a new player |
| `game_started` | All lobby players enter the game |
| `init` | Mid-game join or reconnect; full authoritative state |
| `game_over` | Authoritative end of game (puzzle complete or timer expired) |
| `piece_picked / moved / dropped / placed` | Piece state updates |
| `player_joined / left / disconnected / reconnected` | Player roster changes |
| `cursor_move` | Cursor position from another player |
| `image_changed` | Image URL updated by creator |
| `reset` | Game scrambled/reset; fresh state |

## Frontend Notes

- **Scaling:** UI is fixed at 1280×800; CSS `transform: scale()` fits any viewport.
- **XSS:** All user content goes through `escHtml()` before DOM insertion — never use `innerHTML` with raw user input.
- **Z-index layers:** placed pieces (2), unpicked (5), dragging (90), cursors (200).
- **Piece rendering:** CSS `background-position` offsets into the puzzle image — no canvas.
- **Image validation:** Client probes URL with an `Image` object before broadcasting `change_image`.
- **Connection status:** A fixed banner surfaces socket disconnects so desync is never silent.

## Deployment

Docker image: `dipankan001/jigsaw-solver:v5`

```bash
docker build -t dipankan001/jigsaw-solver:<version> .
docker run -p 3001:3001 jigsaw-puzzle
```

For horizontal scaling: use Socket.IO Redis adapter + sticky sessions (documented in README).

## What Not to Do

- Don't add a frontend framework (React/Vue) — the vanilla approach is intentional and performant.
- Don't add a build step unless the user explicitly asks.
- Don't move game logic to the client — server must remain authoritative.
- Don't use `innerHTML` with unsanitized user content.
- Don't persist game state to a database; in-memory is by design for simplicity.
