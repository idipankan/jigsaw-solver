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

  socket.on('join', ({ roomCode, playerName, pieceCount, timerDuration, imageUrl }) => {
    const room = getOrCreateRoom(roomCode, pieceCount, timerDuration, imageUrl);
    const player = room.addPlayer(socket.id, playerName || 'anon');
    currentRoom = room;
    currentPlayer = player;

    socket.join(roomCode);
    // Send full state to joining player
    socket.emit('init', {
      playerId: player.id,
      roomCode,
      state: room.getState(),
    });
    // Notify others
    socket.to(roomCode).emit('player_joined', { player: room.getPlayerPublic(player.id) });
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
    io.to(currentRoom.code).emit('reset', { state: currentRoom.getState() });
  });

  socket.on('disconnect', () => {
    if (!currentRoom || !currentPlayer) return;
    currentRoom.removePlayer(currentPlayer.id);
    io.to(currentRoom.code).emit('player_left', { playerId: currentPlayer.id });
    if (currentRoom.isEmpty()) {
      rooms.delete(currentRoom.code);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Jigsaw Solver server running → http://localhost:${PORT}`);
});
