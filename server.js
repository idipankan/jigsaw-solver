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

// Pending player removals during the in-game disconnect grace period,
// keyed by `${roomCode}:${clientId}`. Lets a brief network drop recover
// without wiping the player's score or kicking them from the room.
const removalTimers = new Map();
const DISCONNECT_GRACE_MS = 30_000;

// Per-room authoritative game-over timers, keyed by roomCode. Guarantees
// every client ends on the same final state regardless of local drift.
const gameOverTimers = new Map();

function cancelRemoval(roomCode, clientId) {
  const key = `${roomCode}:${clientId}`;
  const t = removalTimers.get(key);
  if (t) { clearTimeout(t); removalTimers.delete(key); }
}

function scheduleRemoval(room, clientId) {
  const key = `${room.code}:${clientId}`;
  if (removalTimers.has(key)) clearTimeout(removalTimers.get(key));
  const t = setTimeout(() => {
    removalTimers.delete(key);
    if (!rooms.has(room.code)) return;
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
      rooms.delete(room.code);
    }
  }, DISCONNECT_GRACE_MS);
  removalTimers.set(key, t);
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
    io.to(room.code).emit('game_over', { state: room.getState(), scores: room.getScores() });
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
    if (reconnecting) {
      cancelRemoval(room.code, clientId);
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
      if (!reconnecting) {
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
    if (!currentRoom || !currentPlayer) return;
    const room = currentRoom;
    const clientId = currentClientId;
    if (currentPlayer) currentPlayer.connected = false;

    // Free any held piece immediately so it isn't locked for everyone else.
    const released = room.releaseHeldPiece(clientId);
    if (released) {
      io.to(room.code).emit('piece_dropped', {
        pieceId: released.pieceId, x: released.x, y: released.y, playerId: clientId,
      });
    }

    if (!room.started) {
      // Lobby: no score at stake — remove immediately as before.
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
        rooms.delete(room.code);
      }
      return;
    }

    // In-game: keep the player (and their score) for a grace period so a
    // transient network drop can reconnect and reclaim their identity.
    scheduleRemoval(room, clientId);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Jigsaw Solver server running → http://localhost:${PORT}`);
});
