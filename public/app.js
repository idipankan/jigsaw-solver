/* ── Constants matching server geometry ── */
const PSZ = 50;
const BOARD_LEFT = 30;
const BOARD_TOP = 60;
const TRAY_LEFT = 584 + 24;
const TRAY_TOP = 60;
const TRAY_W = 344;
const TRAY_H = 560;

/* ── Default image pool (15 abstract compositions) ──
   Design rule: every ~50px cell must be visually unique so a human can tell
   which slot a piece belongs to. The server validates pieces by exact slot,
   so large flat color regions (which look identical across many cells) make
   the puzzle unsolvable by eye. Each image therefore uses a full-canvas
   gradient (color shifts continuously with position) plus a scattered accent
   layer (local detail that distinguishes neighboring cells). No large flat
   fills, and no big single-color blocks. */
const SVG_POOL = [
  /* 1 — Bauhaus circles */
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'>
    <rect width='500' height='500' fill='#E8DCC4'/>
    <circle cx='170' cy='180' r='130' fill='#C8533C'/>
    <rect x='280' y='70' width='180' height='210' fill='#2A4D6E'/>
    <circle cx='380' cy='370' r='95' fill='#E8B547'/>
    <rect x='70' y='320' width='150' height='140' fill='#1a1a1a'/>
    <circle cx='110' cy='400' r='38' fill='#F2E8D5'/>
    <path d='M 20 250 Q 180 200 320 280 T 500 240' stroke='#1a1a1a' stroke-width='6' fill='none'/>
    <rect x='420' y='10' width='70' height='60' fill='#F2E8D5'/>
    <circle cx='250' cy='160' r='22' fill='#F2E8D5'/>
    <path d='M 280 380 L 350 460 L 220 470 Z' fill='#C8533C' opacity='.85'/>
  </svg>`,
  /* 11 — Retro halftone dots */
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'>
    <rect width='500' height='500' fill='#F0E6D3'/>
    <circle cx='50' cy='50' r='20' fill='#D63B3B'/>
    <circle cx='150' cy='50' r='28' fill='#D63B3B'/>
    <circle cx='250' cy='50' r='35' fill='#D63B3B'/>
    <circle cx='350' cy='50' r='28' fill='#D63B3B'/>
    <circle cx='450' cy='50' r='20' fill='#D63B3B'/>
    <circle cx='50' cy='150' r='28' fill='#2B5BA8'/>
    <circle cx='150' cy='150' r='38' fill='#2B5BA8'/>
    <circle cx='250' cy='150' r='45' fill='#2B5BA8'/>
    <circle cx='350' cy='150' r='38' fill='#2B5BA8'/>
    <circle cx='450' cy='150' r='28' fill='#2B5BA8'/>
    <circle cx='50' cy='250' r='35' fill='#E8A020'/>
    <circle cx='150' cy='250' r='45' fill='#E8A020'/>
    <circle cx='250' cy='250' r='48' fill='#E8A020'/>
    <circle cx='350' cy='250' r='45' fill='#E8A020'/>
    <circle cx='450' cy='250' r='35' fill='#E8A020'/>
    <circle cx='50' cy='350' r='28' fill='#3A9E6E'/>
    <circle cx='150' cy='350' r='38' fill='#3A9E6E'/>
    <circle cx='250' cy='350' r='45' fill='#3A9E6E'/>
    <circle cx='350' cy='350' r='38' fill='#3A9E6E'/>
    <circle cx='450' cy='350' r='28' fill='#3A9E6E'/>
    <circle cx='50' cy='450' r='20' fill='#7B3FA0'/>
    <circle cx='150' cy='450' r='28' fill='#7B3FA0'/>
    <circle cx='250' cy='450' r='35' fill='#7B3FA0'/>
    <circle cx='350' cy='450' r='28' fill='#7B3FA0'/>
    <circle cx='450' cy='450' r='20' fill='#7B3FA0'/>
  </svg>`,
  /* 14 — Stained glass */
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'>
    <rect width='500' height='500' fill='#111'/>
    <polygon points='250,10 490,140 490,360 250,490 10,360 10,140' fill='#1B1B2F'/>
    <polygon points='250,10 490,140 250,250' fill='#FF6B6B' opacity='0.85'/>
    <polygon points='490,140 490,360 250,250' fill='#4ECDC4' opacity='0.85'/>
    <polygon points='490,360 250,490 250,250' fill='#45B7D1' opacity='0.85'/>
    <polygon points='250,490 10,360 250,250' fill='#96CEB4' opacity='0.85'/>
    <polygon points='10,360 10,140 250,250' fill='#FFEAA7' opacity='0.85'/>
    <polygon points='10,140 250,10 250,250' fill='#DDA0DD' opacity='0.85'/>
    <polygon points='250,10 490,140 490,360 250,490 10,360 10,140' fill='none' stroke='#111' stroke-width='8'/>
    <line x1='250' y1='10' x2='250' y2='250' stroke='#111' stroke-width='5'/>
    <line x1='490' y1='140' x2='250' y2='250' stroke='#111' stroke-width='5'/>
    <line x1='490' y1='360' x2='250' y2='250' stroke='#111' stroke-width='5'/>
    <line x1='250' y1='490' x2='250' y2='250' stroke='#111' stroke-width='5'/>
    <line x1='10' y1='360' x2='250' y2='250' stroke='#111' stroke-width='5'/>
    <line x1='10' y1='140' x2='250' y2='250' stroke='#111' stroke-width='5'/>
    <circle cx='250' cy='250' r='30' fill='#FFF9C4' opacity='0.95'/>
    <circle cx='250' cy='250' r='12' fill='#FFD700'/>
  </svg>`
];

let svgIndex = 0; // set from server state so every client in the room uses the same SVG
function defaultImgUrl() {
  return `data:image/svg+xml;utf8,${encodeURIComponent(SVG_POOL[svgIndex % SVG_POOL.length])}`;
}

/* ── State ── */
let socket;
let myId = null;
let appScale = 1;
let currentImgUrl = defaultImgUrl();
let isDefaultImage = true;
let roomCode = null;
let N = 10;
let pieceCount = 100;
let pieces = [];
let players = [];
let cursors = {};
let pieceEls = {};
let dragging = null;
let currentTimerEndsAt = null;
let timerInterval = null;
let myName = '';
let feedItems = [];
let feedTimers = {};
let selectedPieceCount = 100;
let selectedTimerMins = 10;
let isCreator = false;
let lobbyPlayers = [];
let lobbyCreatorId = null;
let gameEntered = false;      // guards one-time game UI setup across reconnects
let lobbyBound = false;       // guards one-time lobby listener binding
let joinPayload = null;       // resent on every (re)connect to re-register

/* Stable per-tab identity so a socket reconnect (new socket.id) can reclaim
   the same player on the server instead of being treated as a new join. */
function getClientId() {
  let id = sessionStorage.getItem('jigsawClientId');
  if (!id) {
    id = (crypto.randomUUID && crypto.randomUUID()) ||
      ('c-' + Math.random().toString(36).slice(2) + Date.now().toString(36));
    sessionStorage.setItem('jigsawClientId', id);
  }
  return id;
}

/* Connection status banner — surfaces drops so a desync is never silent. */
function setConnStatus(state) {
  let el = document.getElementById('conn-status');
  if (!el) {
    el = document.createElement('div');
    el.id = 'conn-status';
    el.style.cssText = [
      'position:fixed', 'top:12px', 'left:50%', 'transform:translateX(-50%)',
      'z-index:9999', 'padding:8px 16px', 'border-radius:8px',
      'font:600 13px ui-monospace,monospace', 'color:#fff', 'display:none',
      'box-shadow:0 4px 14px rgba(0,0,0,.25)',
    ].join(';');
    document.body.appendChild(el);
  }
  if (state === 'lost') {
    el.textContent = '⚠ connection lost — reconnecting…';
    el.style.background = '#C8533C';
    el.style.display = 'block';
  } else if (state === 'ok') {
    el.style.display = 'none';
  }
}

/* ── DOM refs ── */
const $ = id => document.getElementById(id);
const lobby = $('lobby');
const waitingRoom = $('waiting-room');
const app = $('app');
const stage = $('stage');
const piecesLayer = $('pieces-layer');
const boardGrid = $('board-grid');
const lbList = $('lb-list');
const feedList = $('feed-list');
const refModal = $('ref-modal');
const refImg = $('ref-img');
const winBanner = $('win-banner');

/* ── Responsive scaling ── */
function fitApp() {
  const scaleX = window.innerWidth / 1280;
  const scaleY = window.innerHeight / 800;
  appScale = Math.min(scaleX, scaleY);
  app.style.transform = `scale(${appScale})`;
  app.style.left = Math.max(0, (window.innerWidth  - 1280 * appScale) / 2) + 'px';
  app.style.top  = Math.max(0, (window.innerHeight - 800  * appScale) / 2) + 'px';
}
window.addEventListener('resize', fitApp);

/* ── Image helpers ── */
function setImage(url) {
  isDefaultImage = !url;
  currentImgUrl = url || defaultImgUrl();

  $('img-url-text').textContent = isDefaultImage
    ? 'data:image/svg+xml — default pattern'
    : currentImgUrl;
  $('img-url-status').textContent = '● loaded';

  const ghost = $('board-ghost-img');
  if (ghost) ghost.src = currentImgUrl;
  refImg.src = currentImgUrl;

  const cssUrl = `url("${currentImgUrl.replace(/"/g, '%22')}")`;
  const imgSz = N * PSZ;
  Object.entries(pieceEls).forEach(([id, el]) => {
    el.style.backgroundImage = cssUrl;
    el.style.backgroundSize = `${imgSz}px ${imgSz}px`;
  });
}

/* ── Lobby ── */
document.querySelectorAll('.pieces-option').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.pieces-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedPieceCount = parseInt(btn.dataset.count);
  });
});

document.querySelectorAll('.time-option').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.time-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedTimerMins = parseInt(btn.dataset.mins);
  });
});

$('join-btn').addEventListener('click', joinGame);
$('inp-name').addEventListener('keydown', e => { if (e.key === 'Enter') joinGame(); });
$('inp-room').addEventListener('keydown', e => { if (e.key === 'Enter') joinGame(); });
$('inp-image-url').addEventListener('keydown', e => { if (e.key === 'Enter') joinGame(); });

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code.slice(0, 5) + '-' + chars[Math.floor(Math.random() * chars.length)] +
    Math.floor(Math.random() * 10);
}

function joinGame() {
  const name = $('inp-name').value.trim() || 'anon';
  const room = $('inp-room').value.trim().toUpperCase() || generateRoomCode();
  const imageUrl = $('inp-image-url').value.trim() || null;
  myName = name;
  roomCode = room;

  socket = io();
  joinPayload = {
    roomCode: room, playerName: name, clientId: getClientId(),
    pieceCount: selectedPieceCount, timerDuration: selectedTimerMins, imageUrl,
  };

  // Re-emit join on every (re)connect. The server reclaims our player by
  // clientId and replies with fresh authoritative state, so a dropped
  // connection self-heals instead of silently desyncing.
  socket.on('connect', () => {
    socket.emit('join', joinPayload);
    setConnStatus('ok');
  });
  socket.on('disconnect', () => setConnStatus('lost'));

  // Lobby path: room not yet started
  socket.on('lobby_init', onLobbyInit);

  // Mid-game join path: room already started. On reconnect (already in the
  // game) just re-sync authoritative state instead of re-running setup.
  socket.on('init', ({ playerId, roomCode: code, state }) => {
    myId = playerId;
    roomCode = code;
    if (gameEntered) resyncState(state);
    else enterGame(state);
  });

  // Authoritative end-of-game from the server — overrides any local drift
  // so every client shows the same final modal.
  socket.on('game_over', ({ state }) => {
    applyState(state);
    clearInterval(timerInterval);
    showTimerWinner();
  });

  // All lobby players receive this when creator starts the game
  socket.on('game_started', ({ state }) => {
    enterGame(state);
  });

  socket.on('lobby_player_joined', ({ player }) => {
    lobbyPlayers = [...lobbyPlayers.filter(p => p.id !== player.id), player];
    renderWaitingPlayers();
  });

  socket.on('lobby_creator_changed', ({ creatorId }) => {
    lobbyCreatorId = creatorId;
    if (creatorId === myId) {
      isCreator = true;
      $('start-game-btn').style.display = 'block';
      $('waiting-for-host').style.display = 'none';
    }
    renderWaitingPlayers();
  });

  socket.on('player_joined', ({ player }) => {
    players = [...players.filter(p => p.id !== player.id), player];
    renderLeaderboard();
    updateSubbar();
  });

  socket.on('player_left', ({ playerId }) => {
    if (waitingRoom.classList.contains('open')) {
      lobbyPlayers = lobbyPlayers.filter(p => p.id !== playerId);
      renderWaitingPlayers();
    } else {
      players = players.filter(p => p.id !== playerId);
      removeCursor(playerId);
      renderLeaderboard();
      updateSubbar();
    }
  });

  socket.on('piece_picked', ({ pieceId, playerId }) => {
    const p = pieces.find(pc => pc.id === pieceId);
    if (p) p.heldBy = playerId;
    updatePieceEl(pieceId);
  });

  socket.on('piece_moved', ({ pieceId, x, y, playerId }) => {
    const p = pieces.find(pc => pc.id === pieceId);
    if (p && p.heldBy !== myId) { p.x = x; p.y = y; updatePieceEl(pieceId); }
    moveCursor(playerId, x + PSZ / 2, y + PSZ / 2);
  });

  socket.on('piece_dropped', ({ pieceId, x, y }) => {
    const p = pieces.find(pc => pc.id === pieceId);
    if (p) { p.heldBy = null; p.x = x; p.y = y; updatePieceEl(pieceId); }
    updateSubbar();
  });

  socket.on('piece_placed', ({ pieceId, playerId, playerName, scores }) => {
    const p = pieces.find(pc => pc.id === pieceId);
    if (p) {
      p.placed = true; p.heldBy = null; p.placedBy = playerId;
      p.x = BOARD_LEFT + p.col * PSZ;
      p.y = BOARD_TOP  + p.row * PSZ;
    }
    if (scores) Object.entries(scores).forEach(([id, score]) => {
      const pl = players.find(pp => pp.id === id);
      if (pl) pl.score = score;
    });
    updatePieceEl(pieceId);
    pushFeed(playerId, playerName || nameOf(playerId));
    renderLeaderboard();
    updateSubbar();
    checkWin();
  });

  socket.on('cursor_move', ({ playerId, x, y }) => {
    moveCursor(playerId, x, y);
  });

  socket.on('image_changed', ({ imageUrl }) => {
    setImage(imageUrl);
  });

  socket.on('reset', ({ state }) => {
    applyState(state);
    startTimer(state.timerEndsAt);
    winBanner.classList.remove('open');
  });
}

function onLobbyInit({ playerId, roomCode: code, isCreator: creator, creatorId, players: initialPlayers }) {
  myId = playerId;
  roomCode = code;
  isCreator = creator;
  lobbyCreatorId = creatorId;
  lobbyPlayers = initialPlayers;

  lobby.style.display = 'none';
  waitingRoom.classList.add('open');

  $('waiting-code').textContent = code;
  $('start-game-btn').style.display = isCreator ? 'block' : 'none';
  $('waiting-for-host').style.display = isCreator ? 'none' : 'block';

  renderWaitingPlayers();

  // Bind these once — onLobbyInit can fire again on a lobby reconnect.
  if (!lobbyBound) {
    lobbyBound = true;

    $('waiting-copy-btn').addEventListener('click', () => {
      navigator.clipboard?.writeText(roomCode).catch(() => {});
      $('waiting-copy-btn').textContent = 'copied!';
      setTimeout(() => { $('waiting-copy-btn').textContent = 'copy'; }, 1500);
    });

    $('start-game-btn').addEventListener('click', () => {
      socket.emit('start_game');
    });
  }
}

function renderWaitingPlayers() {
  const container = $('waiting-players');
  $('waiting-player-count').textContent = lobbyPlayers.length;
  container.innerHTML = '';
  lobbyPlayers.forEach(p => {
    const isYou = p.id === myId;
    const isHost = p.id === lobbyCreatorId;
    const div = document.createElement('div');
    div.className = 'waiting-player';
    div.innerHTML =
      `<div class="waiting-player-dot" style="background:${p.color}"></div>` +
      `<span>${escHtml(p.name)}</span>` +
      (isYou  ? ' <span class="waiting-tag you">YOU</span>'  : '') +
      (isHost ? ' <span class="waiting-tag host">HOST</span>' : '');
    container.appendChild(div);
  });
}

function enterGame(state) {
  waitingRoom.classList.remove('open');
  lobby.style.display = 'none';
  app.style.display = 'block';
  fitApp();
  $('disp-room-code').textContent = roomCode;
  startTimer(state.timerEndsAt);
  applyState(state);
  setupEventListeners();
  gameEntered = true;
}

/* Re-apply authoritative state after a reconnect without re-binding listeners
   (which would cause duplicate emits). Abandons any in-progress local drag. */
function resyncState(state) {
  dragging = null;
  applyState(state);
  startTimer(state.timerEndsAt);
}

function applyState(state) {
  N = state.N;
  pieceCount = state.pieceCount;
  pieces = state.pieces;
  players = state.players;

  // apply image from room state (for players joining mid-game)
  if (state.svgIndex !== undefined) svgIndex = state.svgIndex;
  isDefaultImage = !state.imageUrl;
  if (state.imageUrl) {
    currentImgUrl = state.imageUrl;
  } else {
    currentImgUrl = defaultImgUrl();
  }

  buildPiecesDOM();
  renderLeaderboard();
  updateSubbar();
  updateBoardGhost();
  updateBoardLabel();

  $('disp-piece-count').textContent = pieceCount;
  $('ref-dims').textContent = `${N} × ${N} · ${pieceCount} pieces`;

  // sync reference modal image
  refImg.src = currentImgUrl;
  $('img-url-text').textContent = isDefaultImage
    ? 'data:image/svg+xml — default pattern'
    : currentImgUrl;
}

/* ── Board ghost ── */
function updateBoardGhost() {
  const ghost = $('board-ghost-img');
  if (ghost) ghost.src = currentImgUrl;
}

function updateBoardLabel() {
  $('board-label').textContent = `Board · ${N} × ${N}`;
}

/* ── Piece DOM management ── */
function buildPiecesDOM() {
  piecesLayer.innerHTML = '';
  pieceEls = {};
  cursors = {};

  const imgSz = N * PSZ;
  const cssUrl = `url("${currentImgUrl.replace(/"/g, '%22')}")`;

  pieces.forEach(p => {
    const el = document.createElement('div');
    el.className = 'piece';
    el.style.cssText = [
      `width:${PSZ}px`, `height:${PSZ}px`,
      `background-image:${cssUrl}`,
      `background-size:${imgSz}px ${imgSz}px`,
      `background-position:-${p.col * PSZ}px -${p.row * PSZ}px`,
      `z-index:${p.placed ? 2 : 5}`,
    ].join(';');
    positionPieceEl(el, p);
    el.addEventListener('mousedown', e => onPieceMouseDown(e, p.id));
    piecesLayer.appendChild(el);
    pieceEls[p.id] = el;
  });
}

function positionPieceEl(el, p) {
  el.style.left = p.x + 'px';
  el.style.top  = p.y + 'px';
}

function updatePieceEl(pieceId) {
  const p = pieces.find(pc => pc.id === pieceId);
  const el = pieceEls[pieceId];
  if (!p || !el) return;

  el.style.left = p.x + 'px';
  el.style.top  = p.y + 'px';

  if (p.placed) {
    el.classList.add('placed');
    el.classList.remove('dragging');
    el.style.zIndex = '2';
    const color = colorOf(p.placedBy);
    el.style.boxShadow = `0 0 0 2px ${color}, 0 0 0 5px ${color}33`;
    setTimeout(() => {
      if (el) el.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,.06)';
    }, 700);
  } else if (p.heldBy) {
    const color = colorOf(p.heldBy);
    el.style.boxShadow = `0 0 0 2px ${color}, 0 6px 14px rgba(0,0,0,.18)`;
    el.style.zIndex = p.heldBy === myId ? '90' : '80';
    el.style.opacity = p.heldBy !== myId ? '0.85' : '1';
  } else {
    el.style.boxShadow = '0 1px 2px rgba(0,0,0,.08), 0 4px 10px rgba(0,0,0,.10)';
    el.style.zIndex = '5';
    el.style.opacity = '1';
  }
}

/* ── Drag logic ── */
function stageCoords(e) {
  const rect = stage.getBoundingClientRect();
  return {
    mx: (e.clientX - rect.left) / appScale,
    my: (e.clientY - rect.top)  / appScale,
  };
}

function onPieceMouseDown(e, pieceId) {
  const p = pieces.find(pc => pc.id === pieceId);
  if (!p || p.placed || (p.heldBy && p.heldBy !== myId)) return;
  e.preventDefault();

  const { mx, my } = stageCoords(e);
  dragging = { pieceId, offX: mx - p.x, offY: my - p.y };

  const el = pieceEls[pieceId];
  el.classList.add('dragging');
  el.style.zIndex = '90';
  p.heldBy = myId;
  socket.emit('pick', { pieceId });
}

stage.addEventListener('mousemove', e => {
  const { mx, my } = stageCoords(e);

  if (dragging) {
    const p = pieces.find(pc => pc.id === dragging.pieceId);
    if (p) {
      p.x = mx - dragging.offX;
      p.y = my - dragging.offY;
      const el = pieceEls[p.id];
      el.style.left = p.x + 'px';
      el.style.top  = p.y + 'px';
      socket.emit('move', { pieceId: p.id, x: p.x, y: p.y });
    }
  }
});

stage.addEventListener('mouseup', e => {
  if (!dragging) return;
  const { mx, my } = stageCoords(e);
  const p = pieces.find(pc => pc.id === dragging.pieceId);
  if (!p) { dragging = null; return; }

  pieceEls[p.id]?.classList.remove('dragging');
  const cx = p.x + PSZ / 2;
  const cy = p.y + PSZ / 2;
  socket.emit('drop', { pieceId: p.id, x: cx, y: cy });
  dragging = null;
});

window.addEventListener('mouseup', () => {
  if (!dragging) return;
  const p = pieces.find(pc => pc.id === dragging.pieceId);
  if (p) {
    pieceEls[p.id]?.classList.remove('dragging');
    socket.emit('drop', { pieceId: p.id, x: p.x + PSZ / 2, y: p.y + PSZ / 2 });
  }
  dragging = null;
});

/* ── Cursor throttled emit ── */
let lastCursorEmit = 0;
stage.addEventListener('mousemove', e => {
  const now = Date.now();
  if (now - lastCursorEmit < 30 || !socket) return;
  lastCursorEmit = now;
  const { mx, my } = stageCoords(e);
  socket.emit('cursor', { x: mx, y: my });
});

/* ── Cursor DOM management ── */
function ensureCursor(playerId) {
  if (cursors[playerId]) return cursors[playerId];
  const pl = players.find(p => p.id === playerId);
  if (!pl || pl.id === myId) return null;

  const wrap = document.createElement('div');
  wrap.className = 'cursor-wrap';
  wrap.innerHTML = `
    <svg width="18" height="22" viewBox="0 0 18 22" style="display:block;filter:drop-shadow(0 1px 2px rgba(0,0,0,.25))">
      <path d="M1 1 L1 17 L6 13 L9 21 L12 20 L9 12 L16 12 Z" fill="${pl.color}" stroke="#fff" stroke-width="1"/>
    </svg>
    <div class="cursor-label" style="background:${pl.color}">${escHtml(pl.name)}</div>
  `;
  piecesLayer.appendChild(wrap);
  cursors[playerId] = wrap;
  return wrap;
}

function moveCursor(playerId, x, y) {
  if (playerId === myId) return;
  const el = ensureCursor(playerId);
  if (!el) return;
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
}

function removeCursor(playerId) {
  if (cursors[playerId]) { cursors[playerId].remove(); delete cursors[playerId]; }
}

/* ── Leaderboard ── */
function colorOf(id) { return players.find(p => p.id === id)?.color || '#9a9a9a'; }
function nameOf(id)  { return players.find(p => p.id === id)?.name  || '—'; }

function renderLeaderboard() {
  const ranked = [...players].sort((a, b) => b.score - a.score);
  lbList.innerHTML = '';
  ranked.forEach((p, i) => {
    const isYou = p.id === myId;
    const row = document.createElement('div');
    row.className = 'lb-row' + (isYou ? ' you' : '');
    row.innerHTML = `
      <div class="lb-left">
        <div class="lb-rank">${String(i + 1).padStart(2, '0')}</div>
        <div class="lb-dot" style="background:${p.color};${i === 0 ? `box-shadow:0 0 0 3px ${p.color}22` : ''}"></div>
        <div class="lb-meta">
          <div class="lb-name">${escHtml(p.name)}${isYou ? ' <span class="lb-you-tag">YOU</span>' : ''}</div>
          <div class="lb-status">${isYou ? 'placing' : 'playing'}</div>
        </div>
      </div>
      <div class="lb-score">${p.score}</div>
    `;
    lbList.appendChild(row);
  });
}

/* ── Feed ── */
function pushFeed(playerId, name) {
  const id = Date.now();
  const color = colorOf(playerId);
  feedItems = [{ id, name, color, ago: 'now' }, ...feedItems].slice(0, 5);
  renderFeed();

  let secs = 0;
  const tick = () => {
    secs++;
    const item = feedItems.find(f => f.id === id);
    if (!item) return;
    item.ago = secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m`;
    renderFeed();
    feedTimers[id] = setTimeout(tick, 1000);
  };
  feedTimers[id] = setTimeout(tick, 1000);
}

function renderFeed() {
  feedList.innerHTML = '';
  feedItems.forEach(f => {
    const row = document.createElement('div');
    row.className = 'feed-row';
    row.innerHTML = `
      <div class="feed-dot" style="background:${f.color}"></div>
      <div class="feed-text"><span class="name">${escHtml(f.name)}</span> placed a piece</div>
      <div class="feed-ago">${f.ago}</div>
    `;
    feedList.appendChild(row);
  });
}

/* ── Subbar ── */
function updateSubbar() {
  const placed    = pieces.filter(p => p.placed).length;
  const remaining = pieces.length - placed;
  const pct       = pieces.length > 0 ? Math.round((placed / pieces.length) * 100) : 0;

  $('disp-player-count').textContent = players.length;
  $('disp-progress').textContent = `${pct}% complete`;
  $('disp-placed').textContent   = placed;
  $('disp-remaining').textContent = remaining;
  $('disp-tray-count').textContent = remaining;

  const placedSpan = document.querySelector('.sub-right span:first-child');
  if (placedSpan) placedSpan.innerHTML = `<span class="val">${placed}</span>/${pieces.length} placed`;
}

/* ── Timer ── */
function startTimer(timerEndsAt) {
  clearInterval(timerInterval);
  currentTimerEndsAt = timerEndsAt || null;

  if (!currentTimerEndsAt) {
    $('disp-timer').textContent = '∞';
    return;
  }

  function tick() {
    const remaining = Math.max(0, currentTimerEndsAt - Date.now());
    const totalSecs = Math.ceil(remaining / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    $('disp-timer').textContent = `${m}:${String(s).padStart(2, '0')}`;
    if (remaining === 0) {
      clearInterval(timerInterval);
      if (!winBanner.classList.contains('open')) showTimerWinner();
    }
  }
  tick();
  timerInterval = setInterval(tick, 1000);
}

/* ── Win check ── */
function checkWin() {
  if (pieces.length > 0 && pieces.every(p => p.placed)) {
    clearInterval(timerInterval);

    const ranked = [...players].sort((a, b) => b.score - a.score);
    const winner = ranked[0];

    let timeLine = '';
    if (currentTimerEndsAt) {
      const msLeft = Math.max(0, currentTimerEndsAt - Date.now());
      const secsLeft = Math.floor(msLeft / 1000);
      const m = Math.floor(secsLeft / 60);
      const s = secsLeft % 60;
      timeLine = ` · ${m}:${String(s).padStart(2, '0')} to spare`;
    }

    $('win-title').textContent = 'puzzle complete!';

    if (!winner || winner.score === 0) {
      $('win-sub').textContent = `all ${pieces.length} pieces placed${timeLine}`;
    } else {
      const tied = ranked.filter(p => p.score === winner.score);
      if (tied.length > 1) {
        $('win-sub').textContent = `all ${pieces.length} placed${timeLine} · tie: ${tied.map(p => escHtml(p.name)).join(' & ')}`;
      } else {
        $('win-sub').textContent = `all ${pieces.length} placed${timeLine} · winner: ${escHtml(winner.name)} (${winner.score} pieces)`;
      }
    }

    winBanner.classList.add('open');
  }
}

function showTimerWinner() {
  const ranked = [...players].sort((a, b) => b.score - a.score);
  const winner = ranked[0];
  const placed = pieces.filter(p => p.placed).length;

  $('win-title').textContent = "time's up!";

  if (!winner || winner.score === 0) {
    $('win-sub').textContent = `${placed}/${pieces.length} pieces placed · no winner`;
  } else {
    const tied = ranked.filter(p => p.score === winner.score);
    if (tied.length > 1) {
      $('win-sub').textContent = `${placed}/${pieces.length} placed · tie: ${tied.map(p => escHtml(p.name)).join(' & ')}`;
    } else {
      $('win-sub').textContent = `${placed}/${pieces.length} placed · winner: ${escHtml(winner.name)} (${winner.score} pieces)`;
    }
  }

  winBanner.classList.add('open');
}

/* ── Event listeners ── */
function setupEventListeners() {
  // Overlay toggle (per-user, persisted in localStorage)
  const overlayBtn = $('overlay-btn');
  let overlayOn = localStorage.getItem('jigsawOverlay') !== 'off';

  function applyOverlay() {
    const ghost = $('board-ghost-img');
    if (ghost) ghost.style.opacity = overlayOn ? '0.18' : '0';
    overlayBtn.classList.toggle('active', overlayOn);
  }

  applyOverlay();
  overlayBtn.addEventListener('click', () => {
    overlayOn = !overlayOn;
    localStorage.setItem('jigsawOverlay', overlayOn ? 'on' : 'off');
    applyOverlay();
  });

  // Copy room code
  $('copy-btn').addEventListener('click', () => {
    navigator.clipboard?.writeText(roomCode).catch(() => {});
    $('copy-btn').textContent = 'copied!';
    setTimeout(() => { $('copy-btn').textContent = 'copy'; }, 1500);
  });

  // Reference modal
  $('ref-btn').addEventListener('click', () => refModal.classList.add('open'));
  $('ref-close-btn').addEventListener('click', () => refModal.classList.remove('open'));
  refModal.addEventListener('click', e => { if (e.target === refModal) refModal.classList.remove('open'); });

  // Image URL popover
  const popover  = $('img-url-popover');
  const urlInput = $('img-url-input');
  const urlBar   = $('img-url-bar');

  urlBar.addEventListener('click', () => {
    const isOpen = popover.classList.contains('open');
    popover.classList.toggle('open', !isOpen);
    if (!isOpen) {
      urlInput.value = isDefaultImage ? '' : currentImgUrl;
      urlInput.focus();
      urlInput.select();
    }
  });

  function applyImageUrl() {
    const raw = urlInput.value.trim();
    if (!raw) {
      // reset to default
      socket.emit('change_image', { imageUrl: null });
      setImage(null);
    } else {
      $('img-url-status').textContent = '● loading…';
      // probe that the image loads before broadcasting
      const probe = new Image();
      probe.onload = () => {
        socket.emit('change_image', { imageUrl: raw });
        setImage(raw);
      };
      probe.onerror = () => {
        $('img-url-status').textContent = '✕ failed';
        setTimeout(() => { $('img-url-status').textContent = '● loaded'; }, 2000);
      };
      probe.src = raw;
    }
    popover.classList.remove('open');
  }

  $('img-url-apply-btn').addEventListener('click', applyImageUrl);
  urlInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') applyImageUrl();
    if (e.key === 'Escape') popover.classList.remove('open');
  });

  // Close popover on Escape / outside click
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      refModal.classList.remove('open');
      popover.classList.remove('open');
    }
  });
  document.addEventListener('mousedown', e => {
    if (!popover.contains(e.target) && e.target !== urlBar && !urlBar.contains(e.target)) {
      popover.classList.remove('open');
    }
  });

  // Scramble / leave
  $('scramble-btn').addEventListener('click', () => socket.emit('scramble'));
  $('leave-btn').addEventListener('click', () => { socket.disconnect(); location.reload(); });

  // Play again
  $('play-again-btn').addEventListener('click', () => {
    socket.emit('scramble');
    winBanner.classList.remove('open');
  });

}

/* ── Utils ── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
