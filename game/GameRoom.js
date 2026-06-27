const { v4: uuidv4 } = require('uuid');

const PLAYER_COLORS = [
  '#C8533C', '#2A4D6E', '#1F8A5B', '#8B5CF6', '#D97706', '#DB2777',
  '#0891B2', '#65A30D', '#EA580C', '#7C3AED', '#0D9488', '#B45309',
  '#BE185D', '#1D4ED8', '#15803D', '#9333EA', '#C2410C', '#0369A1',
  '#4D7C0F', '#BE123C',
];

const TRAY_LEFT = 584 + 24;
const TRAY_TOP = 60;
const TRAY_W = 344;
const TRAY_H = 560;
const BOARD_LEFT = 30;
const BOARD_TOP = 60;
const PSZ = 50;
const SNAP_DIST = 38;

class GameRoom {
  constructor(code, pieceCount = 100, timerDuration = 10) {
    this.code = code;
    this.players = new Map();
    this.colorIndex = 0;
    this.pieces = [];
    this.N = Math.round(Math.sqrt(pieceCount));
    this.pieceCount = this.N * this.N;
    this.imageUrl = null; // null = default built-in SVG
    this.svgIndex = Math.floor(Math.random() * 256); // index into client SVG_POOL; shared so all clients render the same default
    this.timerDuration = timerDuration; // minutes; 0 = no limit
    this.started = false;
    this.startedAt = null;
    this._buildPieces();
    this.createdAt = Date.now();
  }

  _buildPieces() {
    this.pieces = [];
    const pad = 12;
    for (let r = 0; r < this.N; r++) {
      for (let c = 0; c < this.N; c++) {
        const id = r * this.N + c;
        const x = TRAY_LEFT + pad + Math.random() * (TRAY_W - PSZ - pad * 2);
        const y = TRAY_TOP + pad + Math.random() * (TRAY_H - PSZ - pad * 2);
        this.pieces.push({ id, row: r, col: c, x, y, placed: false, heldBy: null, placedBy: null });
      }
    }
  }

  start() {
    this.started = true;
    this.startedAt = Date.now();
  }

  getLobbyPlayers() {
    const out = [];
    this.players.forEach(p => out.push({ id: p.id, name: p.name, color: p.color }));
    return out;
  }

  reset(pieceCount) {
    this.N = Math.round(Math.sqrt(pieceCount));
    this.pieceCount = this.N * this.N;
    this.players.forEach(p => { p.score = 0; p.holdingId = null; });
    this.startedAt = Date.now();
    this._buildPieces();
  }

  scramble() {
    const pad = 12;
    this.pieces.forEach(p => {
      p.placed = false;
      p.heldBy = null;
      p.placedBy = null;
      p.x = TRAY_LEFT + pad + Math.random() * (TRAY_W - PSZ - pad * 2);
      p.y = TRAY_TOP + pad + Math.random() * (TRAY_H - PSZ - pad * 2);
    });
    this.players.forEach(p => { p.score = 0; p.holdingId = null; });
    this.startedAt = Date.now();
  }

  addPlayer(clientId, name, socketId) {
    const color = PLAYER_COLORS[this.colorIndex % PLAYER_COLORS.length];
    this.colorIndex++;
    const player = {
      id: clientId,        // stable identity, survives socket reconnects
      socketId,            // current transport; updated on reconnect
      name: name.slice(0, 16),
      color,
      score: 0,
      cx: 400,
      cy: 300,
      holdingId: null,
      connected: true,
    };
    this.players.set(clientId, player);
    return player;
  }

  getPlayer(clientId) {
    return this.players.get(clientId);
  }

  // Free whatever piece a player is holding, without removing the player.
  // Used on disconnect so a dropped client doesn't leave a piece locked.
  releaseHeldPiece(clientId) {
    const player = this.players.get(clientId);
    if (!player || player.holdingId == null) return null;
    const piece = this.pieces.find(p => p.id === player.holdingId);
    player.holdingId = null;
    if (!piece) return null;
    piece.heldBy = null;
    return { pieceId: piece.id, x: piece.x, y: piece.y };
  }

  removePlayer(clientId) {
    const player = this.players.get(clientId);
    if (player && player.holdingId != null) {
      const piece = this.pieces.find(p => p.id === player.holdingId);
      if (piece) piece.heldBy = null;
    }
    this.players.delete(clientId);
  }

  isEmpty() {
    return this.players.size === 0;
  }

  getPlayerPublic(id) {
    const p = this.players.get(id);
    if (!p) return null;
    return { id: p.id, name: p.name, color: p.color, score: p.score };
  }

  getScores() {
    const out = {};
    this.players.forEach(p => { out[p.id] = p.score; });
    return out;
  }

  pickPiece(playerId, pieceId) {
    const piece = this.pieces.find(p => p.id === pieceId);
    const player = this.players.get(playerId);
    if (!piece || !player || piece.placed || piece.heldBy || player.holdingId != null) return false;
    piece.heldBy = playerId;
    player.holdingId = pieceId;
    return true;
  }

  movePiece(playerId, pieceId, x, y) {
    const piece = this.pieces.find(p => p.id === pieceId);
    if (!piece || piece.heldBy !== playerId) return;
    piece.x = x;
    piece.y = y;
  }

  dropPiece(playerId, pieceId, x, y) {
    const piece = this.pieces.find(p => p.id === pieceId);
    const player = this.players.get(playerId);
    // x,y from client are piece CENTER; return current piece top-left to avoid stuck-on-board
    if (!piece || !player || piece.heldBy !== playerId) {
      return { placed: false, x: piece ? piece.x : x, y: piece ? piece.y : y };
    }

    piece.heldBy = null;
    player.holdingId = null;

    const targetX = BOARD_LEFT + piece.col * PSZ + PSZ / 2;
    const targetY = BOARD_TOP + piece.row * PSZ + PSZ / 2;
    const dist = Math.hypot(x - targetX, y - targetY);

    if (dist < SNAP_DIST) {
      piece.placed = true;
      piece.placedBy = playerId;
      piece.x = BOARD_LEFT + piece.col * PSZ;
      piece.y = BOARD_TOP + piece.row * PSZ;
      player.score += 1;
      return { placed: true };
    } else {
      // x,y are center coords; convert to top-left before clamping
      piece.x = Math.max(TRAY_LEFT + 4, Math.min(TRAY_LEFT + TRAY_W - PSZ - 4, x - PSZ / 2));
      piece.y = Math.max(TRAY_TOP + 4, Math.min(TRAY_TOP + TRAY_H - PSZ - 4, y - PSZ / 2));
      return { placed: false, x: piece.x, y: piece.y };
    }
  }

  setImage(url) {
    this.imageUrl = url || null;
  }

  getState() {
    const players = [];
    this.players.forEach(p => players.push({ id: p.id, name: p.name, color: p.color, score: p.score }));
    const timerEndsAt = (this.timerDuration > 0 && this.startedAt != null)
      ? this.startedAt + this.timerDuration * 60 * 1000
      : null;
    return {
      N: this.N,
      pieceCount: this.pieceCount,
      pieces: this.pieces.map(p => ({ ...p })),
      players,
      imageUrl: this.imageUrl,
      svgIndex: this.svgIndex,
      timerDuration: this.timerDuration,
      timerEndsAt,
    };
  }
}

module.exports = { GameRoom };
