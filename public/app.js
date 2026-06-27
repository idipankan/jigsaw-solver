/* ── Constants matching server geometry ── */
const PSZ = 50;
const BOARD_LEFT = 30;
const BOARD_TOP = 60;
const TRAY_LEFT = 584 + 24;
const TRAY_TOP = 60;
const TRAY_W = 344;
const TRAY_H = 560;

/* ── Default image pool (15 abstract compositions) ── */
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
  /* 2 — Mondrian grid */
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'>
    <rect width='500' height='500' fill='#F5F0E8'/>
    <rect x='0' y='0' width='200' height='200' fill='#D62828'/>
    <rect x='210' y='0' width='290' height='130' fill='#F5F0E8'/>
    <rect x='210' y='140' width='130' height='60' fill='#F7B731'/>
    <rect x='350' y='140' width='150' height='60' fill='#F5F0E8'/>
    <rect x='0' y='210' width='200' height='290' fill='#F5F0E8'/>
    <rect x='210' y='210' width='290' height='130' fill='#1A78C2'/>
    <rect x='210' y='350' width='130' height='150' fill='#F5F0E8'/>
    <rect x='350' y='350' width='150' height='150' fill='#D62828'/>
    <rect x='0' y='0' width='500' height='500' fill='none' stroke='#111' stroke-width='10'/>
    <line x1='205' y1='0' x2='205' y2='500' stroke='#111' stroke-width='10'/>
    <line x1='0' y1='205' x2='500' y2='205' stroke='#111' stroke-width='10'/>
    <line x1='345' y1='135' x2='345' y2='500' stroke='#111' stroke-width='10'/>
    <line x1='205' y1='135' x2='500' y2='135' stroke='#111' stroke-width='10'/>
    <line x1='205' y1='345' x2='500' y2='345' stroke='#111' stroke-width='10'/>
  </svg>`,
  /* 3 — Warm concentric rings */
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'>
    <rect width='500' height='500' fill='#1C1C2E'/>
    <circle cx='250' cy='250' r='220' fill='#6B2D8B'/>
    <circle cx='250' cy='250' r='175' fill='#C0392B'/>
    <circle cx='250' cy='250' r='130' fill='#E67E22'/>
    <circle cx='250' cy='250' r='85' fill='#F1C40F'/>
    <circle cx='250' cy='250' r='40' fill='#ECF0F1'/>
    <circle cx='250' cy='250' r='10' fill='#1C1C2E'/>
  </svg>`,
  /* 4 — Diagonal color blocks */
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'>
    <rect width='500' height='500' fill='#2C3E50'/>
    <polygon points='0,0 500,0 500,200' fill='#E74C3C'/>
    <polygon points='0,0 0,300 200,0' fill='#3498DB'/>
    <polygon points='0,500 300,500 0,200' fill='#2ECC71'/>
    <polygon points='500,500 500,180 150,500' fill='#F39C12'/>
    <polygon points='200,0 500,200 500,0' fill='#9B59B6' opacity='0.7'/>
    <circle cx='250' cy='250' r='80' fill='#ECF0F1' opacity='0.15'/>
    <circle cx='250' cy='250' r='40' fill='#ECF0F1' opacity='0.25'/>
  </svg>`,
  /* 5 — Isometric cubes */
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'>
    <rect width='500' height='500' fill='#0F2027'/>
    <polygon points='250,80 390,160 390,320 250,400 110,320 110,160' fill='#16213E'/>
    <polygon points='250,80 390,160 250,240 110,160' fill='#0F3460'/>
    <polygon points='110,160 250,240 250,400 110,320' fill='#533483'/>
    <polygon points='390,160 250,240 250,400 390,320' fill='#E94560'/>
    <polygon points='250,180 350,230 350,330 250,380 150,330 150,230' fill='#16213E'/>
    <polygon points='250,180 350,230 250,280 150,230' fill='#0F3460' opacity='0.8'/>
    <polygon points='150,230 250,280 250,380 150,330' fill='#533483' opacity='0.8'/>
    <polygon points='350,230 250,280 250,380 350,330' fill='#E94560' opacity='0.8'/>
  </svg>`,
  /* 6 — Overlapping translucent circles */
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'>
    <rect width='500' height='500' fill='#F8F4EF'/>
    <circle cx='160' cy='200' r='150' fill='#FF6B6B' opacity='0.6'/>
    <circle cx='340' cy='200' r='150' fill='#4ECDC4' opacity='0.6'/>
    <circle cx='250' cy='340' r='150' fill='#45B7D1' opacity='0.6'/>
    <circle cx='160' cy='200' r='60' fill='#FF6B6B' opacity='0.9'/>
    <circle cx='340' cy='200' r='60' fill='#4ECDC4' opacity='0.9'/>
    <circle cx='250' cy='340' r='60' fill='#45B7D1' opacity='0.9'/>
  </svg>`,
  /* 7 — Geometric mosaic */
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'>
    <rect width='500' height='500' fill='#2D2D2D'/>
    <polygon points='0,0 250,0 125,250' fill='#FF4757'/>
    <polygon points='250,0 500,0 375,250' fill='#2ED573'/>
    <polygon points='0,0 125,250 0,500' fill='#1E90FF'/>
    <polygon points='500,0 500,500 375,250' fill='#FFA502'/>
    <polygon points='0,500 125,250 375,250 500,500' fill='#5352ED'/>
    <polygon points='125,250 250,0 375,250' fill='#FF6348'/>
    <polygon points='125,250 375,250 250,500' fill='#7BED9F'/>
    <circle cx='250' cy='250' r='30' fill='#F1F2F6' opacity='0.9'/>
  </svg>`,
  /* 8 — Sunset landscape */
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'>
    <defs>
      <linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stop-color='#1a1a2e'/>
        <stop offset='60%' stop-color='#e94560'/>
        <stop offset='100%' stop-color='#f5a623'/>
      </linearGradient>
    </defs>
    <rect width='500' height='500' fill='url(#sky)'/>
    <circle cx='250' cy='320' r='80' fill='#FFF176' opacity='0.95'/>
    <ellipse cx='250' cy='320' rx='80' ry='80' fill='none' stroke='#FFD54F' stroke-width='3' opacity='0.5'/>
    <rect x='0' y='350' width='500' height='150' fill='#0d0d1a'/>
    <polygon points='0,350 60,280 120,350' fill='#0d0d1a'/>
    <polygon points='80,350 160,260 240,350' fill='#0d0d1a'/>
    <polygon points='200,350 290,240 380,350' fill='#0d0d1a'/>
    <polygon points='320,350 400,270 480,350' fill='#0d0d1a'/>
    <line x1='0' y1='325' x2='500' y2='325' stroke='#f5a623' stroke-width='2' opacity='0.3'/>
  </svg>`,
  /* 9 — Blueprint grid */
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'>
    <rect width='500' height='500' fill='#003366'/>
    <line x1='0' y1='50' x2='500' y2='50' stroke='#4A90D9' stroke-width='0.5' opacity='0.5'/>
    <line x1='0' y1='100' x2='500' y2='100' stroke='#4A90D9' stroke-width='0.5' opacity='0.5'/>
    <line x1='0' y1='150' x2='500' y2='150' stroke='#4A90D9' stroke-width='0.5' opacity='0.5'/>
    <line x1='0' y1='200' x2='500' y2='200' stroke='#4A90D9' stroke-width='0.5' opacity='0.5'/>
    <line x1='0' y1='250' x2='500' y2='250' stroke='#4A90D9' stroke-width='1' opacity='0.8'/>
    <line x1='0' y1='300' x2='500' y2='300' stroke='#4A90D9' stroke-width='0.5' opacity='0.5'/>
    <line x1='0' y1='350' x2='500' y2='350' stroke='#4A90D9' stroke-width='0.5' opacity='0.5'/>
    <line x1='0' y1='400' x2='500' y2='400' stroke='#4A90D9' stroke-width='0.5' opacity='0.5'/>
    <line x1='0' y1='450' x2='500' y2='450' stroke='#4A90D9' stroke-width='0.5' opacity='0.5'/>
    <line x1='50' y1='0' x2='50' y2='500' stroke='#4A90D9' stroke-width='0.5' opacity='0.5'/>
    <line x1='100' y1='0' x2='100' y2='500' stroke='#4A90D9' stroke-width='0.5' opacity='0.5'/>
    <line x1='150' y1='0' x2='150' y2='500' stroke='#4A90D9' stroke-width='0.5' opacity='0.5'/>
    <line x1='200' y1='0' x2='200' y2='500' stroke='#4A90D9' stroke-width='0.5' opacity='0.5'/>
    <line x1='250' y1='0' x2='250' y2='500' stroke='#4A90D9' stroke-width='1' opacity='0.8'/>
    <line x1='300' y1='0' x2='300' y2='500' stroke='#4A90D9' stroke-width='0.5' opacity='0.5'/>
    <line x1='350' y1='0' x2='350' y2='500' stroke='#4A90D9' stroke-width='0.5' opacity='0.5'/>
    <line x1='400' y1='0' x2='400' y2='500' stroke='#4A90D9' stroke-width='0.5' opacity='0.5'/>
    <line x1='450' y1='0' x2='450' y2='500' stroke='#4A90D9' stroke-width='0.5' opacity='0.5'/>
    <circle cx='250' cy='250' r='120' fill='none' stroke='#7EC8E3' stroke-width='2'/>
    <circle cx='250' cy='250' r='80' fill='none' stroke='#7EC8E3' stroke-width='1.5'/>
    <circle cx='250' cy='250' r='40' fill='none' stroke='#7EC8E3' stroke-width='1'/>
    <line x1='130' y1='250' x2='370' y2='250' stroke='#7EC8E3' stroke-width='1.5'/>
    <line x1='250' y1='130' x2='250' y2='370' stroke='#7EC8E3' stroke-width='1.5'/>
    <rect x='120' y='120' width='260' height='260' fill='none' stroke='#7EC8E3' stroke-width='1' stroke-dasharray='6,4'/>
    <circle cx='250' cy='250' r='5' fill='#7EC8E3'/>
  </svg>`,
  /* 10 — Kandinsky-style arcs */
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'>
    <rect width='500' height='500' fill='#FAFAFA'/>
    <path d='M 50 450 A 280 280 0 0 1 450 450' stroke='#1a1a1a' stroke-width='8' fill='none'/>
    <path d='M 100 420 A 200 200 0 0 1 400 420' stroke='#C8533C' stroke-width='6' fill='none'/>
    <path d='M 150 390 A 120 120 0 0 1 350 390' stroke='#2A4D6E' stroke-width='5' fill='none'/>
    <circle cx='130' cy='150' r='70' fill='#E8B547'/>
    <circle cx='130' cy='150' r='40' fill='#FAFAFA'/>
    <circle cx='130' cy='150' r='15' fill='#C8533C'/>
    <rect x='310' y='80' width='120' height='120' fill='none' stroke='#1a1a1a' stroke-width='6'/>
    <line x1='310' y1='80' x2='430' y2='200' stroke='#C8533C' stroke-width='3'/>
    <line x1='430' y1='80' x2='310' y2='200' stroke='#2A4D6E' stroke-width='3'/>
    <polygon points='250,60 290,140 210,140' fill='#2A4D6E'/>
    <circle cx='250' cy='300' r='25' fill='#E8B547'/>
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
  /* 12 — Northern lights */
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'>
    <defs>
      <linearGradient id='aurora1' x1='0' y1='0' x2='1' y2='0'>
        <stop offset='0%' stop-color='#00C9FF' stop-opacity='0'/>
        <stop offset='50%' stop-color='#00C9FF' stop-opacity='0.7'/>
        <stop offset='100%' stop-color='#00C9FF' stop-opacity='0'/>
      </linearGradient>
      <linearGradient id='aurora2' x1='0' y1='0' x2='1' y2='0'>
        <stop offset='0%' stop-color='#92FE9D' stop-opacity='0'/>
        <stop offset='50%' stop-color='#92FE9D' stop-opacity='0.6'/>
        <stop offset='100%' stop-color='#92FE9D' stop-opacity='0'/>
      </linearGradient>
      <linearGradient id='aurora3' x1='0' y1='0' x2='1' y2='0'>
        <stop offset='0%' stop-color='#a855f7' stop-opacity='0'/>
        <stop offset='50%' stop-color='#a855f7' stop-opacity='0.5'/>
        <stop offset='100%' stop-color='#a855f7' stop-opacity='0'/>
      </linearGradient>
    </defs>
    <rect width='500' height='500' fill='#020818'/>
    <ellipse cx='250' cy='80' rx='350' ry='60' fill='url(#aurora3)'/>
    <ellipse cx='180' cy='160' rx='300' ry='50' fill='url(#aurora1)'/>
    <ellipse cx='300' cy='240' rx='280' ry='45' fill='url(#aurora2)'/>
    <ellipse cx='200' cy='310' rx='320' ry='40' fill='url(#aurora1)' opacity='0.8'/>
    <ellipse cx='260' cy='370' rx='260' ry='35' fill='url(#aurora3)' opacity='0.7'/>
    <circle cx='80' cy='60' r='2' fill='white' opacity='0.8'/>
    <circle cx='200' cy='30' r='1.5' fill='white' opacity='0.9'/>
    <circle cx='350' cy='50' r='2' fill='white' opacity='0.7'/>
    <circle cx='430' cy='90' r='1' fill='white' opacity='0.8'/>
    <circle cx='130' cy='110' r='1.5' fill='white' opacity='0.6'/>
    <circle cx='460' cy='150' r='2' fill='white' opacity='0.7'/>
    <rect x='0' y='420' width='500' height='80' fill='#010510'/>
    <ellipse cx='250' cy='420' rx='500' ry='20' fill='#020C20'/>
  </svg>`,
  /* 13 — Spirograph pattern */
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'>
    <rect width='500' height='500' fill='#0A0A0A'/>
    <circle cx='250' cy='250' r='200' fill='none' stroke='#FF006E' stroke-width='1.5' opacity='0.8'/>
    <circle cx='250' cy='250' r='160' fill='none' stroke='#8338EC' stroke-width='1.5' opacity='0.8'/>
    <circle cx='250' cy='250' r='120' fill='none' stroke='#3A86FF' stroke-width='1.5' opacity='0.8'/>
    <circle cx='250' cy='250' r='80' fill='none' stroke='#06D6A0' stroke-width='1.5' opacity='0.8'/>
    <path d='M250,50 Q450,150 450,250 Q450,350 250,450 Q50,350 50,250 Q50,150 250,50' fill='none' stroke='#FFBE0B' stroke-width='1.5' opacity='0.7'/>
    <path d='M150,50 Q450,100 450,350 Q400,450 150,450 Q50,400 50,150 Q100,50 150,50' fill='none' stroke='#FB5607' stroke-width='1.5' opacity='0.7'/>
    <path d='M250,50 C450,50 450,450 250,450 C50,450 50,50 250,50' fill='none' stroke='#FF006E' stroke-width='1' opacity='0.5'/>
    <circle cx='250' cy='250' r='15' fill='#FFBE0B'/>
    <circle cx='250' cy='50' r='6' fill='#FF006E'/>
    <circle cx='450' cy='250' r='6' fill='#8338EC'/>
    <circle cx='250' cy='450' r='6' fill='#3A86FF'/>
    <circle cx='50' cy='250' r='6' fill='#06D6A0'/>
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
  </svg>`,
  /* 15 — Op-art waves */
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'>
    <rect width='500' height='500' fill='#F5F5F5'/>
    <path d='M0,50 Q125,0 250,50 T500,50' fill='none' stroke='#1a1a1a' stroke-width='4'/>
    <path d='M0,100 Q125,50 250,100 T500,100' fill='none' stroke='#1a1a1a' stroke-width='4'/>
    <path d='M0,150 Q125,100 250,150 T500,150' fill='none' stroke='#1a1a1a' stroke-width='4'/>
    <path d='M0,200 Q125,150 250,200 T500,200' fill='none' stroke='#1a1a1a' stroke-width='4'/>
    <path d='M0,250 Q125,200 250,250 T500,250' fill='none' stroke='#1a1a1a' stroke-width='4'/>
    <path d='M0,300 Q125,250 250,300 T500,300' fill='none' stroke='#1a1a1a' stroke-width='4'/>
    <path d='M0,350 Q125,300 250,350 T500,350' fill='none' stroke='#1a1a1a' stroke-width='4'/>
    <path d='M0,400 Q125,350 250,400 T500,400' fill='none' stroke='#1a1a1a' stroke-width='4'/>
    <path d='M0,450 Q125,400 250,450 T500,450' fill='none' stroke='#1a1a1a' stroke-width='4'/>
    <path d='M0,500 Q125,450 250,500 T500,500' fill='none' stroke='#1a1a1a' stroke-width='4'/>
    <circle cx='250' cy='250' r='120' fill='white' opacity='0.9'/>
    <circle cx='250' cy='250' r='90' fill='none' stroke='#1a1a1a' stroke-width='4'/>
    <circle cx='250' cy='250' r='60' fill='none' stroke='#1a1a1a' stroke-width='4'/>
    <circle cx='250' cy='250' r='30' fill='#1a1a1a'/>
  </svg>`,
];

const RAW_SVG = SVG_POOL[Math.floor(Math.random() * SVG_POOL.length)];
const DEFAULT_IMG_URL = `data:image/svg+xml;utf8,${encodeURIComponent(RAW_SVG)}`;

/* ── State ── */
let socket;
let myId = null;
let appScale = 1;
let currentImgUrl = DEFAULT_IMG_URL;
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

/* ── DOM refs ── */
const $ = id => document.getElementById(id);
const lobby = $('lobby');
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
  currentImgUrl = url || DEFAULT_IMG_URL;
  const isDefault = currentImgUrl === DEFAULT_IMG_URL;

  $('img-url-text').textContent = isDefault
    ? 'data:image/svg+xml — composition no. 7'
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
  socket.emit('join', { roomCode: room, playerName: name, pieceCount: selectedPieceCount, timerDuration: selectedTimerMins, imageUrl });

  socket.on('init', onInit);

  socket.on('player_joined', ({ player }) => {
    players = [...players.filter(p => p.id !== player.id), player];
    renderLeaderboard();
    updateSubbar();
  });

  socket.on('player_left', ({ playerId }) => {
    players = players.filter(p => p.id !== playerId);
    removeCursor(playerId);
    renderLeaderboard();
    updateSubbar();
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
    Object.entries(scores).forEach(([id, score]) => {
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

function onInit({ playerId, roomCode: code, state }) {
  myId = playerId;
  roomCode = code;
  lobby.style.display = 'none';
  app.style.display = 'block';
  fitApp();
  $('disp-room-code').textContent = code;
  startTimer(state.timerEndsAt);
  applyState(state);
  setupEventListeners();
}

function applyState(state) {
  N = state.N;
  pieceCount = state.pieceCount;
  pieces = state.pieces;
  players = state.players;

  // apply image from room state (for players joining mid-game)
  if (state.imageUrl) {
    currentImgUrl = state.imageUrl;
  } else {
    currentImgUrl = DEFAULT_IMG_URL;
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
  $('img-url-text').textContent = currentImgUrl === DEFAULT_IMG_URL
    ? 'data:image/svg+xml — composition no. 7'
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
    const winner = [...players].sort((a, b) => b.score - a.score)[0];
    $('win-title').textContent = 'puzzle complete!';
    $('win-sub').textContent = `all ${pieces.length} pieces placed · winner: ${winner?.name || '—'}`;
    winBanner.classList.add('open');
    clearInterval(timerInterval);
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
      urlInput.value = currentImgUrl === DEFAULT_IMG_URL ? '' : currentImgUrl;
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
