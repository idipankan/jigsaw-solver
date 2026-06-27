const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { GameRoom } = require('./game/GameRoom');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public')));

// rooms keyed by roomCode
const rooms = new Map();

// Room garbage-collection timers, keyed by roomCode. A player's score is
// NEVER erased on disconnect — it lives in the room for the whole game and is
// reclaimed on reconnect. We only clean up a *room* once it has been fully
// abandoned (every player disconnected) for ROOM_IDLE_MS.
const roomIdleTimers = new Map();
const ROOM_IDLE_MS = 5 * 60 * 1000;

// Per-room authoritative game-over timers, keyed by roomCode. Guarantees
// every client ends on the same final state regardless of local drift.
const gameOverTimers = new Map();

function roomHasLiveConnection(room) {
  for (const p of room.players.values()) if (p.connected) return true;
  return false;
}

function cancelRoomGC(roomCode) {
  const t = roomIdleTimers.get(roomCode);
  if (t) { clearTimeout(t); roomIdleTimers.delete(roomCode); }
}

// Schedule deletion of a fully-abandoned room. Cancelled the moment anyone
// (re)connects to it. Only the room lifecycle is on a timer — never a score.
function scheduleRoomGC(room) {
  cancelRoomGC(room.code);
  const t = setTimeout(() => {
    roomIdleTimers.delete(room.code);
    const r = rooms.get(room.code);
    if (!r || roomHasLiveConnection(r)) return; // someone came back
    cancelGameOver(r.code);
    rooms.delete(r.code);
  }, ROOM_IDLE_MS);
  roomIdleTimers.set(room.code, t);
}

function cancelGameOver(roomCode) {
  const t = gameOverTimers.get(roomCode);
  if (t) { clearTimeout(t); gameOverTimers.delete(roomCode); }
}

// Schedule the single authoritative end-of-game broadcast at the timer
// deadline. Re-scheduled whenever the clock resets (start/scramble/reset).
function scheduleGameOver(room) {
  cancelGameOver(room.code);
  if (room.timerDuration <= 0 || room.startedAt == null) return;
  const ms = room.startedAt + room.timerDuration * 60 * 1000 - Date.now();
  const t = setTimeout(() => {
    gameOverTimers.delete(room.code);
    if (!rooms.has(room.code)) return;
    io.to(room.code).emit('game_over', { state: room.getState(), scores: room.getScores(), reason: 'timeout' });
  }, Math.max(0, ms));
  gameOverTimers.set(room.code, t);
}

function getOrCreateRoom(roomCode, pieceCount, timerDuration, imageUrl) {
  if (!rooms.has(roomCode)) {
    const room = new GameRoom(roomCode, pieceCount || 100, timerDuration ?? 10);
    if (imageUrl) room.setImage(imageUrl);
    rooms.set(roomCode, room);
  }
  return rooms.get(roomCode);
}

io.on('connection', (socket) => {
  let currentRoom = null;
  let currentPlayer = null;
  let currentClientId = null;

  socket.on('join', ({ roomCode, playerName, clientId, pieceCount, timerDuration, imageUrl }) => {
    if (!roomCode || !clientId) return;
    const isNewRoom = !rooms.has(roomCode);
    const room = getOrCreateRoom(roomCode, pieceCount, timerDuration, imageUrl);
    if (isNewRoom) room.creatorId = clientId;

    // Reclaim an existing player on reconnect (same stable clientId),
    // otherwise create a fresh one. Reclaim preserves score/color and
    // cancels any pending grace-period removal.
    let player = room.getPlayer(clientId);
    const reconnecting = !!player;
    cancelRoomGC(room.code); // a live connection exists again
    if (reconnecting) {
      player.socketId = socket.id;
      player.connected = true;
    } else {
      player = room.addPlayer(clientId, playerName || 'anon', socket.id);
    }

    currentRoom = room;
    currentPlayer = player;
    currentClientId = clientId;
    socket.join(roomCode);

    if (!room.started) {
      // Room in lobby — send waiting room state
      socket.emit('lobby_init', {
        playerId: player.id,
        roomCode,
        isCreator: clientId === room.creatorId,
        creatorId: room.creatorId,
        players: room.getLobbyPlayers(),
      });
      if (!reconnecting) {
        socket.to(roomCode).emit('lobby_player_joined', { player: room.getPlayerPublic(player.id) });
      }
    } else {
      // Game already started — (re)join mid-game with full authoritative state
      socket.emit('init', {
        playerId: player.id,
        roomCode,
        state: room.getState(),
      });
      if (reconnecting) {
        // Un-dim them on everyone else's leaderboard; score is intact.
        socket.to(roomCode).emit('player_reconnected', { playerId: player.id });
      } else {
        socket.to(roomCode).emit('player_joined', { player: room.getPlayerPublic(player.id) });
      }
    }
  });

  socket.on('start_game', () => {
    if (!currentRoom || !currentPlayer) return;
    if (currentRoom.started || currentRoom.creatorId !== currentPlayer.id) return;
    currentRoom.start();
    scheduleGameOver(currentRoom);
    io.to(currentRoom.code).emit('game_started', { state: currentRoom.getState() });
  });

  socket.on('pick', ({ pieceId }) => {
    if (!currentRoom || !currentPlayer) return;
    const ok = currentRoom.pickPiece(currentPlayer.id, pieceId);
    if (ok) {
      io.to(currentRoom.code).emit('piece_picked', { pieceId, playerId: currentPlayer.id });
    }
  });

  socket.on('move', ({ pieceId, x, y }) => {
    if (!currentRoom || !currentPlayer) return;
    currentRoom.movePiece(currentPlayer.id, pieceId, x, y);
    socket.to(currentRoom.code).emit('piece_moved', { pieceId, x, y, playerId: currentPlayer.id });
  });

  socket.on('drop', ({ pieceId, x, y }) => {
    if (!currentRoom || !currentPlayer) return;
    const result = currentRoom.dropPiece(currentPlayer.id, pieceId, x, y);
    if (result.placed) {
      io.to(currentRoom.code).emit('piece_placed', {
        pieceId,
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        scores: currentRoom.getScores(),
      });
      // Authoritative completion: the server decides the puzzle is done and
      // broadcasts one final state, so every client shows the same modal even
      // if a client's local win-check was missed (e.g. mid-reconnect).
      if (currentRoom.isComplete()) {
        cancelGameOver(currentRoom.code);
        io.to(currentRoom.code).emit('game_over', {
          state: currentRoom.getState(), scores: currentRoom.getScores(), reason: 'complete',
        });
      }
    } else {
      io.to(currentRoom.code).emit('piece_dropped', { pieceId, x: result.x, y: result.y, playerId: currentPlayer.id });
    }
  });

  socket.on('cursor', ({ x, y }) => {
    if (!currentRoom || !currentPlayer) return;
    socket.to(currentRoom.code).emit('cursor_move', { playerId: currentPlayer.id, x, y });
  });

  socket.on('change_pieces', ({ pieceCount }) => {
    if (!currentRoom) return;
    currentRoom.reset(pieceCount);
    scheduleGameOver(currentRoom);
    io.to(currentRoom.code).emit('reset', { state: currentRoom.getState() });
  });

  socket.on('change_image', ({ imageUrl }) => {
    if (!currentRoom) return;
    currentRoom.setImage(imageUrl);
    io.to(currentRoom.code).emit('image_changed', { imageUrl: imageUrl || null });
  });

  socket.on('scramble', () => {
    if (!currentRoom) return;
    currentRoom.scramble();
    scheduleGameOver(currentRoom);
    io.to(currentRoom.code).emit('reset', { state: currentRoom.getState() });
  });

  socket.on('disconnect', () => {
    if (!currentRoom || !currentClientId) return;
    const room = currentRoom;
    const clientId = currentClientId;

    // If a newer connection already reclaimed this player (e.g. a fast
    // refresh where the new join landed before this disconnect), the player's
    // socketId no longer points at us — this is a stale disconnect, ignore it.
    const player = room.getPlayer(clientId);
    if (player && player.socketId !== socket.id) return;
    if (player) player.connected = false;

    // Free any held piece immediately so it isn't locked for everyone else.
    const released = room.releaseHeldPiece(clientId);
    if (released) {
      io.to(room.code).emit('piece_dropped', {
        pieceId: released.pieceId, x: released.x, y: released.y, playerId: clientId,
      });
    }

    if (!room.started) {
      // Lobby: nothing scored yet — remove immediately.
      room.removePlayer(clientId);
      io.to(room.code).emit('player_left', { playerId: clientId });
      if (room.creatorId === clientId) {
        const next = [...room.players.keys()][0];
        if (next) {
          room.creatorId = next;
          io.to(room.code).emit('lobby_creator_changed', { creatorId: next });
        }
      }
      if (room.isEmpty()) {
        cancelGameOver(room.code);
        cancelRoomGC(room.code);
        rooms.delete(room.code);
      }
      return;
    }

    // In-game: NEVER erase score. Keep the player record, mark them away, and
    // show it on everyone's leaderboard. They reclaim it on reconnect no
    // matter how long they're gone — as long as the room still exists.
    io.to(room.code).emit('player_disconnected', { playerId: clientId });

    // Only the room is on a cleanup timer, and only once fully abandoned.
    if (!roomHasLiveConnection(room)) scheduleRoomGC(room);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Jigsaw Solver server running → http://localhost:${PORT}`);
});
