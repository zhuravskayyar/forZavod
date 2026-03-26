import { BaseScene } from './BaseScene.js';
import heroesData from '../data/heroes.js';
import worldBlueprint from '../data/worldBlueprint.js';

const WORLD_ATLAS_IMAGE_URL = new URL('../../assets/world/world_materials_atlas.png', import.meta.url);
const WORLD_ATLAS_META_URL = new URL('../../assets/world/world_materials_atlas.json', import.meta.url);
const HERO_PLACEHOLDER_URL = new URL('../../assets/ui/icon-placeholder.svg', import.meta.url);
const MONSTER_IMAGE_FILES = [
  '1774380349.png',
  '1774380360.png',
  '1774380365.png',
  '1774380370.png',
  '1774380382.png',
  '1774380387.png',
  '1774380400.png',
  '1774380527.png',
  '1774380536.png',
  '1774380541.png',
  '1774380546.png',
  '1774380552.png',
  '1774380573.png',
  '1774380577.png',
];
const MONSTER_SPRITES = MONSTER_IMAGE_FILES.map((file, index) => {
  const code = file.replace('.png', '').slice(-4);
  return {
    id: `monster_${index + 1}`,
    code,
    file,
    name: `Beast ${code}`,
    url: new URL(`../../assets/world/monstr/${file}`, import.meta.url).href,
  };
});
const MONSTER_BY_ID = new Map(MONSTER_SPRITES.map((monster) => [monster.id, monster]));
const IMPORTANT_MONSTER_NODE_IDS = [
  'wolf_woods',
  'bandit_camp',
  'smuggler_cove',
  'west_pass',
  'sealed_gate',
  'mountain_mine',
  'ancient_temple',
  'main_dungeon',
];
const RANDOM_MONSTER_PACK_COUNT = 4;
const MONSTER_PACK_LAYOUTS = {
  2: [
    { x: -0.2, y: 0.14, scale: 0.92 },
    { x: 0.22, y: -0.04, scale: 1.04 },
  ],
  3: [
    { x: -0.26, y: 0.14, scale: 0.88 },
    { x: 0.26, y: 0.08, scale: 0.94 },
    { x: 0, y: -0.18, scale: 1.06 },
  ],
};

const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
const TILE_ATLAS = {
  image: WORLD_ATLAS_IMAGE_URL.href,
  meta: WORLD_ATLAS_META_URL.href,
  cell: 256,
  sourceRadius: 94,
};

const POI_TYPES = [
  { id: 'ruins', label: 'Ruins', color: '#c48f66' },
  { id: 'bandits', label: 'Bandits', color: '#b35e4a' },
  { id: 'sanctum', label: 'Sanctum', color: '#85a9ff' },
  { id: 'market', label: 'Market', color: '#d6b06f' },
  { id: 'dungeon', label: 'Dungeon', color: '#8d6ac3' },
];

const SETTLEMENT_NODE_TYPES = new Set(['city', 'village', 'settlement', 'outpost', 'port']);
const MAJOR_NODE_TYPES = new Set(['city', 'village', 'outpost', 'port', 'pass', 'watchtower', 'gate', 'dungeon', 'temple', 'mine']);
const SECTOR_TARGETS = {
  southwest: { q: 0.14, r: 0.78 },
  west_southwest: { q: 0.18, r: 0.68 },
  south_center: { q: 0.46, r: 0.84 },
  west_center: { q: 0.2, r: 0.48 },
  northwest: { q: 0.12, r: 0.16 },
  northwest_deep: { q: 0.16, r: 0.1 },
  west_northwest: { q: 0.2, r: 0.28 },
  south_center_east: { q: 0.62, r: 0.82 },
  northeast: { q: 0.82, r: 0.14 },
  east_northeast: { q: 0.74, r: 0.26 },
  northeast_city: { q: 0.78, r: 0.18 },
  east_coast: { q: 0.9, r: 0.54 },
  northeast_coast: { q: 0.88, r: 0.18 },
  southeast_coast: { q: 0.86, r: 0.8 },
  east_coast_south: { q: 0.92, r: 0.66 },
  center_left_mountains: { q: 0.4, r: 0.48 },
  west_mountain_entry: { q: 0.34, r: 0.56 },
  east_center: { q: 0.68, r: 0.48 },
  east_mountain_entry: { q: 0.64, r: 0.44 },
  west_mountain_core: { q: 0.46, r: 0.5 },
  center_mountain: { q: 0.54, r: 0.44 },
  center_south_mountain: { q: 0.54, r: 0.62 },
};
const NODE_MARKER_STYLES = {
  village: { color: '#f0d48b', accent: '#7b4f33', shape: 'settlement' },
  settlement: { color: '#dfc07e', accent: '#6a4a32', shape: 'settlement' },
  city: { color: '#ffd991', accent: '#8b5734', shape: 'settlement' },
  outpost: { color: '#b9d2ff', accent: '#41546f', shape: 'tower' },
  port: { color: '#8ed5de', accent: '#315c63', shape: 'settlement' },
  pass: { color: '#d7c5a1', accent: '#5a4d3d', shape: 'diamond' },
  watchtower: { color: '#d6a76a', accent: '#5f432a', shape: 'tower' },
  gate: { color: '#bca0f0', accent: '#4d3c78', shape: 'diamond' },
  dungeon: { color: '#b66ae3', accent: '#432254', shape: 'diamond' },
  temple: { color: '#95c0ff', accent: '#324c71', shape: 'diamond' },
  mine: { color: '#b9b9b9', accent: '#535353', shape: 'diamond' },
  poi: { color: '#c48f66', accent: '#5c3827', shape: 'diamond' },
};
const SERVICE_LABELS_UK = {
  inn: 'Заїзд',
  inn_limited: 'Ночівля',
  shop_basic: 'Крамниця',
  healer: 'Лікар',
  market: 'Ринок',
  blacksmith: 'Кузня',
  blacksmith_basic: 'Кузня',
  guild: 'Гільдія',
  storage: 'Склад',
  story_npcs: 'Рада міста',
  quest_board: 'Дошка квестів',
  contracts: 'Підряди',
  contracts_military: 'Військові підряди',
  quartermaster: 'Інтендант',
  repair: 'Ремонт',
  rumors: 'Чутки',
  hunter_vendor: 'Мисливець',
  herbalist: 'Травник',
  trophy_turnin: 'Трофеї',
  heal: 'Лікування',
  blessing: 'Благословення',
  caravan_vendor: 'Каравани',
  bounty_turnin: 'Трофеї',
  fish_market: 'Рибний ринок',
  shipwright: 'Корабельник',
  smuggler_contact: 'Контрабандист',
  boat_passage: 'Переправа',
  black_market: 'Чорний ринок',
  intel: 'Розвідка',
  ore_exchange: 'Рудна біржа',
  vision_event: 'Видіння',
};
const NODE_TYPE_LABELS_UK = {
  village: 'Селище',
  settlement: 'Поселення',
  city: 'Місто',
  outpost: 'Форпост',
  port: 'Порт',
  pass: 'Перевал',
  watchtower: 'Башта',
  gate: 'Брама',
  dungeon: 'Данж',
  temple: 'Санктум',
  mine: 'Шахта',
  poi: 'Точка інтересу',
};
const CITY_MENU_ICONS = {
  inn: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path fill="currentColor" d="M10 52h44v-4H10v4Zm6-8h32V26L32 14 16 26v18Zm8-2v-9h16v9h-5v-6h-6v6h-5Zm-4-17 12-9 12 9H20Z"/>
    </svg>
  `,
  healer: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path fill="currentColor" d="M32 54 13 36.3A12.6 12.6 0 0 1 12 18.5 12.4 12.4 0 0 1 29.5 18L32 20.4 34.5 18A12.4 12.4 0 0 1 52 18.5 12.6 12.6 0 0 1 51 36.3L32 54Zm0-5.4 16.2-15.1a8.6 8.6 0 0 0 .8-12.1 8.4 8.4 0 0 0-11.9-.5L32 25.8 26.9 21a8.4 8.4 0 0 0-11.9.5 8.6 8.6 0 0 0 .8 12.1L32 48.6Z"/>
    </svg>
  `,
  meditation: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="16" r="6" fill="currentColor"/>
      <path fill="currentColor" d="M24 28c2.7-3.3 4.9-5 8-5s5.3 1.7 8 5l5 6-3.2 2.6-4.4-5.2V38h7v4H38.6l5.4 9H39l-4.4-7.3L32 48l-2.6-4.3L25 51h-5l5.4-9H19.6v-4h7v-6.6l-4.4 5.2L19 34l5-6Z"/>
    </svg>
  `,
  blessing: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path fill="currentColor" d="M30 8h4v10h-4zM30 46h4v10h-4zM8 30h10v4H8zM46 30h10v4H46z"/>
      <path fill="currentColor" d="m17 14 2.8-2.8 7 7-2.9 2.8zM44.2 41.2l2.8-2.8 7 7-2.8 2.8zM44.2 22 51.2 15l2.8 2.8-7 7zM17 50.2l7-7 2.8 2.8-7 7z"/>
      <path fill="currentColor" d="M32 22a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z"/>
    </svg>
  `,
  market: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path fill="currentColor" d="M12 24h40l-3-10H15l-3 10Zm4 4h32v20H16V28Zm6 4v12h20V32H22Zm8 2h4v8h-4v-8Z"/>
      <path fill="currentColor" d="M10 50h44v4H10z"/>
    </svg>
  `,
  pipesmith: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path fill="currentColor" d="M18 18c4 0 7 2.4 8.5 6H40c7.7 0 14 6.3 14 14v8h-4v-8c0-5.5-4.5-10-10-10H26.5A9 9 0 1 1 18 18Zm0 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"/>
      <path fill="currentColor" d="M46 18c-1.8-3-4.2-5.4-7.2-7.2l2-2.8c3.4 2 6.2 4.8 8.2 8.2L46 18Z"/>
    </svg>
  `,
  quests: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path fill="currentColor" d="M18 12h24a8 8 0 0 1 8 8v24H26a8 8 0 0 0-8 8V12Zm4 6v24.7A11.9 11.9 0 0 1 26 40h20V20a4 4 0 0 0-4-4H22Zm8 6h10v4H30Zm0 8h10v4H30Z"/>
      <path fill="currentColor" d="M26 52h24v-4H26a4 4 0 0 0 0 8h24v-4H26Z"/>
    </svg>
  `,
};

const TERRAIN = {
  water: { label: 'Ocean', atlas: 'ocean', move: 99, road: 999, fill: '#326ea8' },
  plain: { label: 'Grassland', atlas: 'grassland', move: 1, road: 1.15, fill: '#5c9858' },
  forest: { label: 'Forest', atlas: 'forest', move: 2, road: 2.2, fill: '#3d6b34' },
  mountain: { label: 'Mountains', atlas: 'mountain', move: 3, road: 5.4, fill: '#8e887d' },
  wasteland: { label: 'Wasteland', atlas: 'wasteland', move: 2, road: 2.5, fill: '#b99255' },
};

const HERO_RENDER = {
  sergo: { height: 84, lift: 16, offsetX: -6 },
  step: { height: 78, lift: 19, offsetX: -4 },
  dasha: { height: 84, lift: 20, offsetX: -6 },
  troks: { height: 82, lift: 16, offsetX: -5 },
  default: { height: 80, lift: 18, offsetX: 0 },
};

const MOVE_LIMIT_MIN = 5;
const MOVE_LIMIT_BONUS = 5;
const MOVE_LIMIT_MAX = MOVE_LIMIT_MIN + MOVE_LIMIT_BONUS;
const MOVE_ROLL_CHANCE = 0.75;
const WORLD_CYCLE_SECONDS = 10 * 60;
const WORLD_DAY_MINUTES = 24 * 60;
const NEW_DAY_START_MINUTES = 2 * 60 + 30;
const DAYLIGHT_START_MINUTES = 8 * 60 + 30;
const NIGHT_START_MINUTES = 20 * 60 + 30;
const NIGHT_OVERLAY_MAX = 0.72;

const FORMATION = [
  { x: -0.56, y: 0.24, lag: 0.18 },
  { x: -0.14, y: -0.34, lag: 0.04 },
  { x: 0.34, y: -0.16, lag: 0.1 },
  { x: 0.7, y: 0.18, lag: 0.24 },
];

function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function mulberry32(seed) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rngFromSeed(seed) {
  return mulberry32(xmur3(seed)());
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}

function keyOf(q, r) {
  return `${q},${r}`;
}

function smooth(t) {
  return t * t * (3 - 2 * t);
}

function hash2d(x, y, seed) {
  let h = seed ^ Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

function valueNoise(x, y, seed) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;
  const sx = smooth(x - x0);
  const sy = smooth(y - y0);
  const n00 = hash2d(x0, y0, seed);
  const n10 = hash2d(x1, y0, seed);
  const n01 = hash2d(x0, y1, seed);
  const n11 = hash2d(x1, y1, seed);
  return lerp(lerp(n00, n10, sx), lerp(n01, n11, sx), sy);
}

function fbm(x, y, seed, octaves = 4) {
  let amplitude = 0.56;
  let frequency = 1;
  let total = 0;
  let value = 0;
  for (let i = 0; i < octaves; i += 1) {
    value += valueNoise(x * frequency, y * frequency, seed + i * 977) * amplitude;
    total += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return total ? value / total : 0;
}

function axialToPixel(q, r, size) {
  return { x: size * Math.sqrt(3) * (q + r / 2), y: size * 1.5 * r };
}

function roundAxial(q, r) {
  let x = q;
  let z = r;
  let y = -x - z;
  let rx = Math.round(x);
  let ry = Math.round(y);
  let rz = Math.round(z);
  const xd = Math.abs(rx - x);
  const yd = Math.abs(ry - y);
  const zd = Math.abs(rz - z);
  if (xd > yd && xd > zd) rx = -ry - rz;
  else if (yd > zd) ry = -rx - rz;
  else rz = -rx - ry;
  return { q: rx, r: rz };
}

function pixelToAxial(x, y, size) {
  return roundAxial(((Math.sqrt(3) / 3) * x - y / 3) / size, ((2 / 3) * y) / size);
}

function hexCorners(cx, cy, size) {
  const points = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    points.push({ x: cx + size * Math.cos(angle), y: cy + size * Math.sin(angle) });
  }
  return points;
}

function hexDistance(a, b) {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}

function shuffle(list, rand) {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
}

function townName(rand) {
  const a = ['Ash', 'Brim', 'Cael', 'Dun', 'Eld', 'Fen', 'Glen', 'Har', 'Kel', 'Mor', 'Stone', 'Vale'];
  const b = ['ford', 'crest', 'watch', 'mere', 'fall', 'holm', 'gate', 'barrow', 'haven', 'field', 'keep', 'rest'];
  return `${a[Math.floor(rand() * a.length)]}${b[Math.floor(rand() * b.length)]}`;
}

function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function heroFallbackViews(id, sprite) {
  if (id) {
    return {
      front: `assets/heroes/${id}/front.png`,
      back: `assets/heroes/${id}/back.png`,
      side: `assets/heroes/${id}/side.png`,
    };
  }
  return { front: sprite, back: sprite, side: sprite };
}

function rgba(hex, alpha) {
  const safe = hex.replace('#', '');
  const parts = [safe.slice(0, 2), safe.slice(2, 4), safe.slice(4, 6)].map((v) => parseInt(v || '00', 16));
  return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function minutesToCycleSeconds(minutes) {
  const normalizedMinutes = ((minutes % WORLD_DAY_MINUTES) + WORLD_DAY_MINUTES) % WORLD_DAY_MINUTES;
  const minutesOffset = ((normalizedMinutes - NEW_DAY_START_MINUTES) + WORLD_DAY_MINUTES) % WORLD_DAY_MINUTES;
  return (minutesOffset / WORLD_DAY_MINUTES) * WORLD_CYCLE_SECONDS;
}

export class WorldScene extends BaseScene {
  constructor(ctx) {
    super({ id: 'world', ...ctx });
    this.canvas = null;
    this.ctx = null;
    this.dom = {};
    this.assets = { atlasImage: null, atlasMeta: null, heroPlaceholder: null, heroes: new Map(), monsters: new Map() };
    this.map = {
      tiles: [],
      tileMap: new Map(),
      towns: [],
      pois: [],
      nodes: [],
      nodeById: new Map(),
      monsterPacks: [],
      monsterByTileKey: new Map(),
      bounds: null,
      selected: null,
    };
    this.camera = { x: 0, y: 0, zoom: 1, dragging: false, moved: false, dragX: 0, dragY: 0, userAdjusted: false };
    this.config = { cols: 28, rows: 20, size: 46, landRatio: 63, roadDensity: 42, townCount: 7, poiCount: 10 };
    this.game = {
      seed: 'world-001',
      difficulty: 'adventurer',
      day: 1,
      gold: 26,
      maxMovePoints: 4,
      movePoints: 4,
      party: [],
      selectedHeroIndex: 0,
      location: 'Unknown',
      objective: 'Reach the first point of interest.',
      partyTile: null,
      partyWorld: null,
      partyActors: [],
      movingHeroIndex: -1,
      pathPreview: [],
      activePath: [],
      moving: false,
      stepFrom: null,
      stepTo: null,
      stepElapsed: 0,
      stepDuration: 0.34,
      facing: 'front',
      sideFlip: false,
      time: 0,
      timeCycleSeconds: 0,
      timeOfDayMinutes: NEW_DAY_START_MINUTES,
      phaseLabel: 'Night',
      isNight: true,
      nightOpacity: NIGHT_OVERLAY_MAX,
      activeContract: null,
      nodeMenu: {
        open: false,
        nodeId: null,
        section: 'overview',
        notice: '',
      },
    };

    this.frameRequest = 0;
    this.lastFrame = 0;
    this.onResize = this.resize.bind(this);
    this.onPointerDown = this.handlePointerDown.bind(this);
    this.onPointerMove = this.handlePointerMove.bind(this);
    this.onPointerUp = this.handlePointerUp.bind(this);
    this.onWheel = this.handleWheel.bind(this);
    this.onFrame = this.frame.bind(this);
  }

  async init() {
    if (this.initialized) return;
    super.init();
    this.el.innerHTML = `
      <div class="game-world-shell">
        <canvas id="world-canvas" class="game-world-canvas"></canvas>
        <div id="worldLightOverlay" class="game-world-light-overlay"></div>
        <div class="game-world-overlay">
          <div class="game-top-hud">
            <div class="game-top-left">
              <button id="returnLobbyBtn" class="btn btn--ghost game-top-btn">Lobby</button>
              <div class="game-party-strip" id="partyStrip"></div>
            </div>
            <div class="game-location-banner">
              <div class="game-banner-kicker">Active Hero</div>
              <div class="game-banner-title" id="locationTitle">Preparing World</div>
              <div class="game-move-pips" id="movePips"></div>
            </div>
            <div class="game-top-right">
              <div class="game-counter-card"><span>Day</span><strong id="dayValue">1</strong></div>
              <div class="game-counter-card game-counter-card--time"><span id="phaseValue">Day</span><strong id="timeValue">08:30</strong></div>
              <div class="game-counter-card"><span>Gold</span><strong id="goldValue">26</strong></div>
              <div class="game-top-actions">
                <button id="endActionBtn" class="btn game-top-btn">End Turn</button>
              </div>
            </div>
          </div>
          <div class="game-selected-card">
            <div class="game-selected-kicker">Selected Hex</div>
            <div class="game-selected-title" id="selectedInfo">None</div>
            <div class="game-selected-meta" id="selectedMeta">Click a land hex to move.</div>
            <div class="game-selected-lore" id="selectedLore"></div>
            <div class="game-selected-tags" id="selectedTags"></div>
            <div class="game-selected-actions">
              <button id="visitNodeBtn" class="btn btn--ghost game-selected-btn" type="button">Visit</button>
            </div>
          </div>
          <div class="game-node-menu" id="nodeMenu"></div>
          <div class="game-node-menu" id="cityMenu"></div>
          <div class="game-party-panels" id="partyHud"></div>
        </div>
      </div>
    `;
    this.cacheDom();
    this.bindUI();
  }

  cacheDom() {
    this.canvas = this.el.querySelector('#world-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.dom = {
      returnLobbyBtn: this.el.querySelector('#returnLobbyBtn'),
      endActionBtn: this.el.querySelector('#endActionBtn'),
      worldLightOverlay: this.el.querySelector('#worldLightOverlay'),
      dayValue: this.el.querySelector('#dayValue'),
      timeValue: this.el.querySelector('#timeValue'),
      phaseValue: this.el.querySelector('#phaseValue'),
      goldValue: this.el.querySelector('#goldValue'),
      locationTitle: this.el.querySelector('#locationTitle'),
      selectedInfo: this.el.querySelector('#selectedInfo'),
      selectedMeta: this.el.querySelector('#selectedMeta'),
      selectedLore: this.el.querySelector('#selectedLore'),
      selectedTags: this.el.querySelector('#selectedTags'),
      visitNodeBtn: this.el.querySelector('#visitNodeBtn'),
      nodeMenu: this.el.querySelector('#nodeMenu'),
      cityMenu: this.el.querySelector('#cityMenu'),
      movePips: this.el.querySelector('#movePips'),
      partyHud: this.el.querySelector('#partyHud'),
      partyStrip: this.el.querySelector('#partyStrip'),
    };
  }

  bindUI() {
    this.dom.returnLobbyBtn.addEventListener('click', () => {
      this.syncStore();
      this.router.go('menu');
    });
    this.dom.endActionBtn.addEventListener('click', () => this.handleEndAction());
    this.dom.visitNodeBtn.addEventListener('click', () => this.openNodeMenu());
    this.dom.nodeMenu.addEventListener('click', (event) => this.handleNodeMenuClick(event));
    this.dom.cityMenu.addEventListener('click', (event) => this.handleNodeMenuClick(event));
    this.dom.partyHud.addEventListener('click', (event) => {
      if (this.game.moving) return;
      const card = event.target.closest('[data-hero-index]');
      if (!card) return;
      const heroIndex = Number(card.dataset.heroIndex);
      if (heroIndex !== this.game.selectedHeroIndex) return;
      this.game.pathPreview = [];
      this.syncSelectionContext();
      this.renderPartyHud();
      if (!this.camera.userAdjusted) this.fitMapToView();
      this.updateHud(this.map.selected);
      this.draw();
    });

    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('resize', this.onResize);
  }

  async enter(payload = {}) {
    await super.enter(payload);
    const runtime = payload?.lobbyState || this.store.getState().world || {};
    this.applyRuntimeState(runtime);
    await this.ensureAssets();
    this.generateWorld();
    this.spawnParty();
    this.updateObjective();
    this.renderPartyHud();
    this.updateHud(null);
    this.resize();
    this.startLoop();
  }

  async exit() {
    cancelAnimationFrame(this.frameRequest);
    this.frameRequest = 0;
    this.lastFrame = 0;
    this.syncStore();
    await super.exit();
  }

  applyRuntimeState(runtime) {
    this.game.seed = runtime.seed || Date.now().toString(36);
    this.game.difficulty = runtime.difficulty || 'adventurer';
    this.game.day = Number.isFinite(runtime.day) ? runtime.day : 1;
    this.game.gold = Number.isFinite(runtime.gold) ? runtime.gold : 26;
    this.game.maxMovePoints = MOVE_LIMIT_MAX;
    this.game.movePoints = 0;
    this.game.selectedHeroIndex = 0;
    this.game.movingHeroIndex = -1;
    this.game.pathPreview = [];
    this.game.activePath = [];
    this.game.moving = false;
    this.game.activeContract = runtime.activeContract || null;
    this.game.nodeMenu = {
      open: false,
      nodeId: null,
      section: 'overview',
      notice: '',
    };
    this.game.time = 0;
    this.game.timeCycleSeconds = Number.isFinite(runtime.timeCycleSeconds)
      ? ((runtime.timeCycleSeconds % WORLD_CYCLE_SECONDS) + WORLD_CYCLE_SECONDS) % WORLD_CYCLE_SECONDS
      : minutesToCycleSeconds(DAYLIGHT_START_MINUTES);
    if (!Number.isFinite(runtime.timeCycleSeconds) && Number.isFinite(runtime.timeOfDayMinutes)) {
      const minutesOffset = ((runtime.timeOfDayMinutes - NEW_DAY_START_MINUTES) + WORLD_DAY_MINUTES) % WORLD_DAY_MINUTES;
      this.game.timeCycleSeconds = (minutesOffset / WORLD_DAY_MINUTES) * WORLD_CYCLE_SECONDS;
    }
    this.syncClockState();

    const sourceParty = Array.isArray(runtime.party) && runtime.party.length
      ? runtime.party
      : heroesData.slice(0, 4).map((hero, index) => ({
        heroId: hero.id,
        name: hero.nameEn || hero.id,
        cls: hero.class,
        classKey: hero.classKey || null,
        summary: hero.summaryUk || hero.summaryEn ? { uk: hero.summaryUk || '', en: hero.summaryEn || '' } : null,
        skills: hero.skills || [],
        playerLabel: `P${index + 1}`,
        playerColor: ['#4e8fe0', '#b058d9', '#7c7cff', '#53c2a1'][index] || '#6d7f8a',
        views: hero.views || heroFallbackViews(hero.id, hero.sprite),
      }));

    this.game.party = sourceParty.slice(0, 4).map((entry, index) => {
      const source = heroesData.find((hero) => hero.id === (entry.heroId || entry.id));
      const views = entry.views || source?.views || heroFallbackViews(entry.heroId || source?.id, source?.sprite || entry.sprite);
      return {
        id: entry.heroId || entry.id || source?.id || `hero-${index}`,
        name: entry.name || source?.nameEn || `Hero ${index + 1}`,
        cls: entry.cls || source?.class || 'Adventurer',
        classKey: entry.classKey || source?.classKey || null,
        playerLabel: entry.playerLabel || `P${index + 1}`,
        playerColor: entry.playerColor || ['#4e8fe0', '#b058d9', '#7c7cff', '#53c2a1'][index] || '#6d7f8a',
        hp: source?.hp || entry.hp || entry.stats?.[0] || 30,
        maxHp: source?.hp || entry.hp || entry.stats?.[0] || 30,
        focus: source?.focus ?? entry.focus ?? 3,
        maxFocus: source?.focus ?? entry.focus ?? 3,
        movePoints: 0,
        maxMovePoints: MOVE_LIMIT_MIN,
        stepsTaken: 0,
        turnRolled: false,
        turnEnded: false,
        lastRollTotal: 0,
        lastRollTrail: [],
        tile: null,
        stats: {
          str: source?.str ?? entry.stats?.[1] ?? 5,
          vit: source?.vit ?? entry.stats?.[2] ?? 5,
          agi: source?.agi ?? entry.stats?.[3] ?? 5,
          int: source?.int ?? 5,
          tal: source?.tal ?? 5,
          speed: source?.speed ?? 5,
        },
        summary: entry.summary || (source?.summaryUk || source?.summaryEn
          ? { uk: source?.summaryUk || '', en: source?.summaryEn || '' }
          : null),
        skills: entry.skills || source?.skills || [],
        portrait: entry.portrait || source?.portrait || views.front,
        views,
        render: HERO_RENDER[entry.heroId || entry.id] || HERO_RENDER.default,
        pipeLevel: Math.max(1, entry.pipeLevel || 1),
        curses: Array.isArray(entry.curses) ? [...entry.curses] : [],
        devotion: entry.devotion || null,
        devotionName: entry.devotionName || null,
      };
    });

    this.game.party.forEach((hero) => {
      hero.maxMovePoints = this.getMoveLimitFromAgility(hero.stats.agi);
    });
    this.game.maxMovePoints = Math.max(...this.game.party.map((hero) => hero.maxMovePoints), MOVE_LIMIT_MIN);

    this.syncStore();
  }

  async ensureAssets() {
    if (!this.assets.atlasMeta) {
      const response = await fetch(TILE_ATLAS.meta);
      this.assets.atlasMeta = await response.json();
    }
    if (!this.assets.atlasImage) {
      this.assets.atlasImage = await loadImage(TILE_ATLAS.image);
    }
    if (!this.assets.heroPlaceholder) {
      this.assets.heroPlaceholder = await loadImage(HERO_PLACEHOLDER_URL.href);
    }
    const heroLoads = [];
    for (const hero of this.game.party) {
      if (this.assets.heroes.has(hero.id)) continue;
      heroLoads.push(this.loadHeroAssets(hero));
    }
    const monsterLoads = MONSTER_SPRITES
      .filter((monster) => !this.assets.monsters.has(monster.id))
      .map(async (monster) => {
        const image = await loadImage(monster.url);
        this.assets.monsters.set(monster.id, image);
      });
    await Promise.all([...heroLoads, ...monsterLoads]);
  }

  async loadHeroAssets(hero) {
    const placeholder = this.assets.heroPlaceholder;
    const [front, back, side] = await Promise.all([
      loadImage(hero.views.front),
      loadImage(hero.views.back),
      loadImage(hero.views.side),
    ]);
    this.assets.heroes.set(hero.id, {
      front: front || side || back || placeholder || null,
      back: back || front || side || placeholder || null,
      side: side || front || back || placeholder || null,
    });
  }

  getMoveLimitFromAgility(agility = MOVE_LIMIT_MIN) {
    return MOVE_LIMIT_MAX;
  }

  resetHeroTurn(hero) {
    hero.movePoints = 0;
    hero.stepsTaken = 0;
    hero.turnRolled = false;
    hero.turnEnded = false;
    hero.lastRollTotal = 0;
    hero.lastRollTrail = [];
    hero.maxMovePoints = this.getMoveLimitFromAgility(hero.stats?.agi ?? MOVE_LIMIT_MIN);
  }

  rollHeroMovement(hero) {
    const trail = Array.from({ length: MOVE_LIMIT_MIN }, () => true);
    let total = MOVE_LIMIT_MIN;
    while (total < hero.maxMovePoints) {
      const success = Math.random() < MOVE_ROLL_CHANCE;
      trail.push(success);
      if (!success) break;
      total += 1;
    }
    hero.turnRolled = true;
    hero.turnEnded = total === 0;
    hero.lastRollTotal = total;
    hero.lastRollTrail = trail;
    hero.movePoints = total;
    return total;
  }

  getHeroTurnStatus(hero) {
    if (!hero.turnRolled) return 'Queued';
    if (hero.turnEnded) return 'Turn spent';
    if (hero.movePoints > 0) return `Move ready ${hero.movePoints}/${hero.maxMovePoints}`;
    return 'Out of moves';
  }

  getHeroRolledSteps(hero) {
    if (!hero.turnRolled) return 0;
    return hero.lastRollTotal || (hero.stepsTaken + hero.movePoints);
  }

  getHeroFocusPips(hero) {
    return Array.from({ length: hero.maxFocus || 0 }, (_, index) => ({
      active: index < (hero.focus || 0),
    }));
  }

  syncClockState() {
    const progress = this.game.timeCycleSeconds / WORLD_CYCLE_SECONDS;
    this.game.timeOfDayMinutes = (NEW_DAY_START_MINUTES + progress * WORLD_DAY_MINUTES) % WORLD_DAY_MINUTES;
    this.game.isNight = this.isNightTime(this.game.timeOfDayMinutes);
    this.game.phaseLabel = this.game.isNight ? 'Night' : 'Day';
    this.game.nightOpacity = this.getNightOverlayOpacity(this.game.timeOfDayMinutes);
    if (this.dom.worldLightOverlay) {
      this.dom.worldLightOverlay.style.opacity = this.game.nightOpacity.toFixed(3);
    }
    if (this.el) {
      this.el.dataset.worldPhase = this.game.isNight ? 'night' : 'day';
    }
  }

  isNightTime(minutes = this.game.timeOfDayMinutes) {
    return minutes >= NIGHT_START_MINUTES || minutes < DAYLIGHT_START_MINUTES;
  }

  getNightOverlayOpacity(minutes = this.game.timeOfDayMinutes) {
    const transitionMinutes = 120;
    const fullNightStart = NIGHT_START_MINUTES + transitionMinutes;
    const fullNightEnd = DAYLIGHT_START_MINUTES - transitionMinutes;

    if (minutes >= DAYLIGHT_START_MINUTES && minutes < NIGHT_START_MINUTES) return 0;
    if (minutes >= NIGHT_START_MINUTES && minutes < fullNightStart) {
      return NIGHT_OVERLAY_MAX * clamp((minutes - NIGHT_START_MINUTES) / transitionMinutes, 0, 1);
    }
    if (minutes >= fullNightStart || minutes < fullNightEnd) return NIGHT_OVERLAY_MAX;
    if (minutes >= fullNightEnd && minutes < DAYLIGHT_START_MINUTES) {
      return NIGHT_OVERLAY_MAX * (1 - clamp((minutes - fullNightEnd) / transitionMinutes, 0, 1));
    }
    return 0;
  }

  formatTimeOfDay(minutes = this.game.timeOfDayMinutes) {
    const totalMinutes = Math.floor(minutes) % WORLD_DAY_MINUTES;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${pad2(hours)}:${pad2(mins)}`;
  }

  updateClockHud() {
    if (this.dom.dayValue) this.dom.dayValue.textContent = String(this.game.day);
    if (this.dom.timeValue) this.dom.timeValue.textContent = this.formatTimeOfDay();
    if (this.dom.phaseValue) this.dom.phaseValue.textContent = this.game.phaseLabel;
    if (this.dom.goldValue) this.dom.goldValue.textContent = String(this.game.gold);
  }

  advanceWorldClock(delta) {
    if (!Number.isFinite(delta) || delta <= 0) return;
    const elapsed = this.game.timeCycleSeconds + delta;
    const wrappedDays = Math.floor(elapsed / WORLD_CYCLE_SECONDS);
    this.game.timeCycleSeconds = elapsed % WORLD_CYCLE_SECONDS;
    this.syncClockState();
    if (wrappedDays > 0) {
      for (let i = 0; i < wrappedDays; i += 1) {
        this.endDay();
      }
      this.syncClockState();
    }
    this.updateClockHud();
  }

  isDayResolved() {
    return this.game.party.every((hero) => hero.turnEnded);
  }

  activateHeroTurn(heroIndex = 0) {
    if (!this.game.party.length) return null;
    const nextIndex = ((heroIndex % this.game.party.length) + this.game.party.length) % this.game.party.length;
    const hero = this.game.party[nextIndex];
    if (!hero) return null;

    this.game.selectedHeroIndex = nextIndex;
    this.resetHeroTurn(hero);
    this.rollHeroMovement(hero);
    this.game.pathPreview = [];
    this.game.activePath = [];
    this.game.moving = false;
    this.game.movingHeroIndex = -1;
    this.map.selected = hero.tile || this.map.selected;
    this.syncSelectionContext();
    return hero;
  }

  advanceHeroTurn() {
    if (!this.game.party.length) return null;
    const nextIndex = (this.game.selectedHeroIndex + 1) % this.game.party.length;
    return this.activateHeroTurn(nextIndex);
  }

  handleEndAction() {
    if (this.game.moving) return;
    const hero = this.getSelectedHero();
    if (!hero) return;

    this.closeNodeMenu();
    hero.movePoints = 0;
    hero.turnEnded = true;
    this.advanceHeroTurn();
    this.syncStore();
    this.renderPartyHud();
    this.updateHud(this.map.selected);
    this.draw();
  }

  updateActionButtons() {
    const hero = this.getSelectedHero();
    if (!hero) return;
    this.dom.endActionBtn.textContent = 'End Turn';
    this.dom.endActionBtn.disabled = this.game.moving;
    const node = this.map.selected?.node || null;
    const canVisit = this.canInteractWithNode(node, hero);
    this.dom.visitNodeBtn.textContent = node ? this.getNodeVisitLabel(node) : 'Visit';
    this.dom.visitNodeBtn.disabled = !canVisit;
    this.dom.visitNodeBtn.hidden = !node;
  }

  resize() {
    if (!this.canvas || !this.ctx) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.map.tiles.length && !this.camera.userAdjusted) this.fitMapToView();
    this.draw();
  }

  generateWorld() {
    const seedInt = xmur3(this.game.seed)();
    const rand = rngFromSeed(this.game.seed);
    const tiles = [];
    const tileMap = new Map();
    const heights = [];

    for (let r = 0; r < this.config.rows; r += 1) {
      for (let q = 0; q < this.config.cols; q += 1) {
        const nx = this.config.cols <= 1 ? 0 : q / (this.config.cols - 1) - 0.5;
        const ny = this.config.rows <= 1 ? 0 : r / (this.config.rows - 1) - 0.5;
        const island = clamp(1 - Math.hypot(nx * 1.15, ny * 1.3) * 1.2, -0.5, 1);
        const height = fbm((q + 11) * 0.095, (r - 7) * 0.095, seedInt, 4) * 0.64
          + fbm((q + 31) * 0.21, (r + 17) * 0.21, seedInt ^ 0x9e3779b9, 3) * 0.18
          + island * 0.42;
        const moisture = fbm((q + 70) * 0.12, (r - 50) * 0.12, seedInt ^ 0xc2b2ae35, 4);
        const tile = {
          q,
          r,
          key: keyOf(q, r),
          height,
          moisture,
          terrain: 'water',
          town: null,
          poi: null,
          node: null,
          monsterPack: null,
          road: false,
          roadLinks: new Set(),
        };
        tiles.push(tile);
        tileMap.set(tile.key, tile);
        heights.push(height);
      }
    }

    const sorted = [...heights].sort((a, b) => a - b);
    const waterThreshold = sorted[Math.floor((sorted.length - 1) * (1 - this.config.landRatio / 100))];
    const landHeights = sorted.filter((value) => value > waterThreshold);
    const mountainThreshold = landHeights[Math.floor(landHeights.length * 0.78)] || waterThreshold + 0.12;

    for (const tile of tiles) {
      if (tile.height <= waterThreshold) tile.terrain = 'water';
      else if (tile.height >= mountainThreshold) tile.terrain = 'mountain';
      else if (tile.moisture < 0.34) tile.terrain = 'wasteland';
      else if (tile.moisture > 0.61 || tile.height > mountainThreshold - 0.06) tile.terrain = 'forest';
      else tile.terrain = 'plain';
    }

    this.map = {
      tiles,
      tileMap,
      towns: [],
      pois: [],
      nodes: [],
      nodeById: new Map(),
      monsterPacks: [],
      monsterByTileKey: new Map(),
      bounds: this.measureBounds(tiles),
      selected: null,
    };

    const region = this.findPrimaryRegion();
    this.applyWorldBlueprint(region);
  }

  findPrimaryRegion() {
    const visited = new Set();
    let best = [];
    for (const tile of this.map.tileMap.values()) {
      if (tile.terrain === 'water' || visited.has(tile.key)) continue;
      const region = [];
      const queue = [tile];
      visited.add(tile.key);
      while (queue.length) {
        const current = queue.shift();
        region.push(current);
        for (const next of this.getNeighbors(current)) {
          if (next.terrain === 'water' || visited.has(next.key)) continue;
          visited.add(next.key);
          queue.push(next);
        }
      }
      if (region.length > best.length) best = region;
    }
    return best;
  }

  applyWorldBlueprint(region) {
    const regionKeys = new Set(region.map((tile) => tile.key));
    const occupiedKeys = new Set();
    const sortedNodes = [...worldBlueprint.nodes].sort((a, b) => this.getNodePlacementPriority(b) - this.getNodePlacementPriority(a));

    this.map.nodes = [];
    this.map.nodeById = new Map();
    this.map.towns = [];
    this.map.pois = [];
    this.map.monsterPacks = [];
    this.map.monsterByTileKey = new Map();

    for (const node of sortedNodes) {
      const tile = this.placeBlueprintNode(node, regionKeys, occupiedKeys);
      if (!tile) continue;
      occupiedKeys.add(tile.key);
      this.attachNodeToTile(tile, node);
    }

    this.resolveBlueprintRoads();
    this.placeMonsterPacks();
  }

  getNodePlacementPriority(node) {
    let score = 0;
    if (node.id === 'start_village') score += 300;
    if (node.type === 'city') score += 250;
    if (node.type === 'outpost' || node.type === 'port') score += 220;
    if (node.type === 'pass' || node.type === 'watchtower' || node.type === 'gate') score += 200;
    if (node.type === 'dungeon' || node.type === 'temple' || node.type === 'mine') score += 190;
    if (SETTLEMENT_NODE_TYPES.has(node.type)) score += 140;
    return score - node.tier * 2;
  }

  placeBlueprintNode(node, regionKeys, occupiedKeys) {
    const scored = [];
    for (const tile of this.map.tiles) {
      if (!regionKeys.has(tile.key) || occupiedKeys.has(tile.key) || tile.terrain === 'water') continue;
      const score = this.scoreNodeTile(node, tile, occupiedKeys);
      if (!Number.isFinite(score) || score <= -1000) continue;
      scored.push({ tile, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.tile || null;
  }

  getNodePlacementTarget(node) {
    const ratios = SECTOR_TARGETS[node.sector] || { q: 0.5, r: 0.5 };
    return {
      q: Math.round((this.config.cols - 1) * ratios.q),
      r: Math.round((this.config.rows - 1) * ratios.r),
    };
  }

  scoreNodeTile(node, tile, occupiedKeys) {
    if (!tile || tile.terrain === 'water') return -Infinity;

    const target = this.getNodePlacementTarget(node);
    const distancePenalty = Math.abs(tile.q - target.q) * 3.4 + Math.abs(tile.r - target.r) * 3.1;
    const nearestOccupiedDistance = this.getNearestOccupiedDistance(tile, occupiedKeys);
    if (nearestOccupiedDistance < 2) return -Infinity;

    let score = 180 - distancePenalty;
    score += this.getTerrainScoreForNode(node, tile);
    score -= Math.max(0, 5 - nearestOccupiedDistance) * 12;

    if (SETTLEMENT_NODE_TYPES.has(node.type) && tile.terrain === 'mountain') return -Infinity;
    if (node.type === 'city' && tile.terrain === 'forest') score -= 18;
    if (node.type === 'outpost' && this.getMountainNeighborCount(tile) > 0) score += 18;
    if (node.type === 'port' && this.isCoastalTile(tile)) score += this.getWaterNeighborCount(tile) * 10;
    if (node.type === 'lighthouse' && this.isCoastalTile(tile)) score += this.getWaterNeighborCount(tile) * 14;
    if (node.type === 'pass' || node.type === 'watchtower' || node.type === 'gate') score += this.getMountainNeighborCount(tile) * 16;
    if (node.type === 'dungeon' || node.type === 'temple' || node.type === 'mine') score += tile.terrain === 'mountain' ? 26 : 0;
    if (node.biome === 'forest') score += this.getForestNeighborCount(tile) * 5;
    if (node.biome === 'plains') score += tile.terrain === 'plain' ? 16 : tile.terrain === 'wasteland' ? 12 : 0;

    return score;
  }

  getTerrainScoreForNode(node, tile) {
    const waterNeighbors = this.getWaterNeighborCount(tile);
    const mountainNeighbors = this.getMountainNeighborCount(tile);

    if (node.biome === 'grassland') {
      if (tile.terrain === 'plain') return 48;
      if (tile.terrain === 'forest') return 16;
      if (tile.terrain === 'wasteland') return 8;
      return -Infinity;
    }

    if (node.biome === 'forest') {
      if (tile.terrain === 'forest') return 54;
      if (tile.terrain === 'plain') return 10;
      return -Infinity;
    }

    if (node.biome === 'plains') {
      if (tile.terrain === 'plain') return 42;
      if (tile.terrain === 'wasteland') return 32;
      if (tile.terrain === 'forest') return 8;
      return -Infinity;
    }

    if (node.biome === 'coast') {
      if (!this.isCoastalTile(tile)) return -Infinity;
      if (tile.terrain === 'plain') return 32 + waterNeighbors * 4;
      if (tile.terrain === 'wasteland') return 36 + waterNeighbors * 5;
      if (tile.terrain === 'forest') return 12 + waterNeighbors * 3;
      return -Infinity;
    }

    if (node.biome === 'foothills') {
      if (tile.terrain === 'mountain') return 18 + mountainNeighbors * 4;
      if (mountainNeighbors <= 0) return -Infinity;
      if (tile.terrain === 'plain') return 34 + mountainNeighbors * 6;
      if (tile.terrain === 'wasteland') return 38 + mountainNeighbors * 6;
      if (tile.terrain === 'forest') return 24 + mountainNeighbors * 5;
      return -Infinity;
    }

    if (node.biome === 'mountain') {
      if (tile.terrain === 'mountain') return 56;
      return mountainNeighbors > 1 ? 10 : -Infinity;
    }

    return tile.terrain === 'water' ? -Infinity : 0;
  }

  getNearestOccupiedDistance(tile, occupiedKeys) {
    if (!occupiedKeys.size) return Infinity;
    let best = Infinity;
    for (const key of occupiedKeys) {
      const other = this.map.tileMap.get(key);
      if (!other) continue;
      best = Math.min(best, hexDistance(tile, other));
    }
    return best;
  }

  isCoastalTile(tile) {
    return tile?.terrain !== 'water' && this.getWaterNeighborCount(tile) > 0;
  }

  getWaterNeighborCount(tile) {
    return this.getNeighbors(tile).filter((next) => next.terrain === 'water').length;
  }

  getMountainNeighborCount(tile) {
    return this.getNeighbors(tile).filter((next) => next.terrain === 'mountain').length;
  }

  getForestNeighborCount(tile) {
    return this.getNeighbors(tile).filter((next) => next.terrain === 'forest').length;
  }

  attachNodeToTile(tile, node) {
    const placedNode = {
      ...node,
      q: tile.q,
      r: tile.r,
      tileKey: tile.key,
    };
    const markerStyle = this.getNodeMarkerStyle(placedNode);

    tile.node = placedNode;
    if (SETTLEMENT_NODE_TYPES.has(node.type)) {
      tile.town = { name: node.nameUk || node.nameEn, nodeId: node.id, kind: node.type };
      this.map.towns.push(tile);
    } else {
      tile.poi = {
        id: node.id,
        label: node.nameUk || node.nameEn,
        color: markerStyle.color,
        nodeId: node.id,
        kind: node.type,
      };
      this.map.pois.push(tile);
    }

    this.map.nodes.push(placedNode);
    this.map.nodeById.set(node.id, placedNode);
  }

  resolveBlueprintRoads() {
    for (const link of worldBlueprint.links) {
      const fromTile = this.getNodeTile(link.from);
      const toTile = this.getNodeTile(link.to);
      if (!fromTile || !toTile) continue;
      this.carveRoad(fromTile, toTile);
    }
  }

  placeMonsterPacks() {
    const rand = rngFromSeed(`${this.game.seed}-monster-packs`);
    const usedKeys = new Set(this.map.nodes.map((node) => node.tileKey));
    this.placeImportantMonsterPacks(rand, usedKeys);
    this.placeRandomMonsterPacks(rand, usedKeys);
  }

  placeImportantMonsterPacks(rand, usedKeys) {
    for (const nodeId of IMPORTANT_MONSTER_NODE_IDS) {
      const node = this.map.nodeById.get(nodeId);
      if (!node) continue;
      const tile = this.findMonsterTileNearNode(node, usedKeys);
      if (!tile) continue;
      this.registerMonsterPack(tile, this.buildMonsterPack(rand, {
        tier: node.tier ?? node.dangerLevel ?? 0,
        important: true,
        anchorNodeId: node.id,
        anchorName: node.nameUk || node.nameEn || node.id,
      }));
      usedKeys.add(tile.key);
    }
  }

  placeRandomMonsterPacks(rand, usedKeys) {
    const candidates = this.map.tiles
      .filter((tile) => this.canPlaceMonsterPackOnTile(tile, usedKeys))
      .map((tile) => ({
        tile,
        score: this.scoreRandomMonsterTile(tile) + rand() * 10,
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    let placed = 0;
    for (const entry of candidates) {
      if (placed >= RANDOM_MONSTER_PACK_COUNT) break;
      const { tile } = entry;
      if (!this.canPlaceMonsterPackOnTile(tile, usedKeys)) continue;
      if (this.getNearestOccupiedDistance(tile, usedKeys) < 3) continue;
      const nearbyThreat = this.getClosestNode(tile, (node) => !SETTLEMENT_NODE_TYPES.has(node.type));
      const tier = nearbyThreat.node?.tier ?? (tile.terrain === 'mountain' ? 4 : tile.terrain === 'forest' ? 2 : 1);
      const anchorName = nearbyThreat.node?.nameUk || nearbyThreat.node?.nameEn || TERRAIN[tile.terrain].label;
      this.registerMonsterPack(tile, this.buildMonsterPack(rand, {
        tier,
        important: false,
        anchorNodeId: nearbyThreat.node?.id || null,
        anchorName,
      }));
      usedKeys.add(tile.key);
      placed += 1;
    }
  }

  findMonsterTileNearNode(node, usedKeys) {
    const origin = this.getNodeTile(node.id);
    if (!origin) return null;

    const candidates = this.map.tiles
      .filter((tile) => {
        const distance = hexDistance(tile, origin);
        return distance >= 1 && distance <= 3 && this.canPlaceMonsterPackOnTile(tile, usedKeys);
      })
      .map((tile) => {
        let score = 92 - hexDistance(tile, origin) * 18;
        score += this.getTerrainScoreForNode(node, tile);
        score -= tile.road ? 6 : 0;
        if (node.biome === 'forest') score += this.getForestNeighborCount(tile) * 4;
        if (node.biome === 'coast' && this.isCoastalTile(tile)) score += 12;
        if (node.biome === 'mountain' || node.biome === 'foothills') score += this.getMountainNeighborCount(tile) * 6;
        return { tile, score };
      })
      .filter((entry) => Number.isFinite(entry.score))
      .sort((a, b) => b.score - a.score);

    return candidates[0]?.tile || null;
  }

  registerMonsterPack(tile, pack) {
    const monsterPack = {
      ...pack,
      id: `monster-pack-${this.map.monsterPacks.length + 1}`,
      tileKey: tile.key,
      q: tile.q,
      r: tile.r,
      label: pack.important ? 'Threat Pack' : 'Monster Pack',
      idlePhase: this.map.monsterPacks.length * 0.83,
    };
    tile.monsterPack = monsterPack;
    this.map.monsterPacks.push(monsterPack);
    this.map.monsterByTileKey.set(tile.key, monsterPack);
    return monsterPack;
  }

  buildMonsterPack(rand, { tier = 0, important = false, anchorNodeId = null, anchorName = '' } = {}) {
    const pool = this.getMonsterSpritePool(tier);
    const primary = pool[Math.floor(rand() * pool.length)] || MONSTER_SPRITES[0];
    const members = [primary.id, primary.id];
    if (rand() < (important ? 0.84 : 0.58)) {
      if (rand() < 0.64 || pool.length < 2) {
        members.push(primary.id);
      } else {
        const alternatePool = pool.filter((monster) => monster.id !== primary.id);
        const alternate = alternatePool[Math.floor(rand() * alternatePool.length)] || primary;
        members.push(alternate.id);
      }
    }
    return {
      members,
      primaryId: primary.id,
      tier,
      important,
      anchorNodeId,
      anchorName,
    };
  }

  getMonsterSpritePool(tier = 0) {
    const maxIndex = clamp(4 + Math.max(0, tier) * 2, 4, MONSTER_SPRITES.length);
    return MONSTER_SPRITES.slice(0, maxIndex);
  }

  canPlaceMonsterPackOnTile(tile, usedKeys = new Set()) {
    if (!tile || tile.terrain === 'water' || tile.node || tile.town || tile.poi || tile.monsterPack) return false;
    if (usedKeys.has(tile.key)) return false;
    const nearestSettlement = this.getNearestNodeDistance(tile, (node) => SETTLEMENT_NODE_TYPES.has(node.type));
    return nearestSettlement >= 2;
  }

  getClosestNode(tile, filterFn = null) {
    let bestNode = null;
    let bestDistance = Infinity;
    for (const node of this.map.nodes) {
      if (filterFn && !filterFn(node)) continue;
      const nodeTile = this.map.tileMap.get(node.tileKey);
      if (!nodeTile) continue;
      const distance = hexDistance(tile, nodeTile);
      if (distance < bestDistance) {
        bestNode = node;
        bestDistance = distance;
      }
    }
    return { node: bestNode, distance: bestDistance };
  }

  getNearestNodeDistance(tile, filterFn = null) {
    return this.getClosestNode(tile, filterFn).distance;
  }

  scoreRandomMonsterTile(tile) {
    const terrainScore = tile.terrain === 'mountain'
      ? 42
      : tile.terrain === 'forest'
        ? 34
        : tile.terrain === 'wasteland'
          ? 30
          : 16;
    const nearestSettlement = this.getNearestNodeDistance(tile, (node) => SETTLEMENT_NODE_TYPES.has(node.type));
    const nearestThreat = this.getNearestNodeDistance(tile, (node) => !SETTLEMENT_NODE_TYPES.has(node.type));
    const roadPenalty = tile.road ? 16 : 0;
    const coastBonus = this.isCoastalTile(tile) ? 6 : 0;
    return terrainScore
      + Math.min(nearestSettlement, 6) * 4
      + Math.min(nearestThreat, 5) * 3
      + coastBonus
      + this.getMountainNeighborCount(tile) * 3
      - roadPenalty;
  }

  getMonsterPackAtTile(tile) {
    if (!tile) return null;
    return tile.monsterPack || this.map.monsterByTileKey.get(tile.key) || null;
  }

  getMonsterPackSummary(pack) {
    if (!pack?.members?.length) return '';
    const counts = new Map();
    for (const monsterId of pack.members) {
      counts.set(monsterId, (counts.get(monsterId) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([monsterId, count]) => `${count}x ${MONSTER_BY_ID.get(monsterId)?.name || 'Beast'}`)
      .join(' + ');
  }

  getMonsterPackTags(pack) {
    if (!pack) return [];
    const tags = [
      pack.important ? 'Guarded point' : 'Wild spawn',
      `${pack.members.length} monsters`,
    ];
    const counts = new Map();
    for (const monsterId of pack.members) {
      counts.set(monsterId, (counts.get(monsterId) || 0) + 1);
    }
    counts.forEach((count, monsterId) => {
      tags.push(`${count}x ${MONSTER_BY_ID.get(monsterId)?.name || 'Beast'}`);
    });
    return tags;
  }

  getMonsterPackLore(pack) {
    if (!pack) return '';
    const summary = this.getMonsterPackSummary(pack);
    if (pack.important) return `Pack guarding ${pack.anchorName}. ${summary}.`;
    return `Roaming pack near ${pack.anchorName}. ${summary}.`;
  }

  getNodeTile(nodeId) {
    const node = this.map.nodeById.get(nodeId);
    return node ? this.map.tileMap.get(node.tileKey) || null : null;
  }

  getNodeMarkerStyle(node) {
    return NODE_MARKER_STYLES[node?.type] || NODE_MARKER_STYLES.poi;
  }

  shouldDrawNodeLabel(node) {
    return MAJOR_NODE_TYPES.has(node?.type);
  }

  placeTowns(region, rand) {
    const picks = [];
    const candidates = region.filter((tile) => tile.terrain !== 'mountain');
    shuffle(candidates, rand);
    candidates.sort((a, b) => b.height - a.height);
    let minDistance = Math.max(3, Math.round(Math.min(this.config.cols, this.config.rows) * 0.18));
    while (picks.length < this.config.townCount && minDistance >= 1) {
      for (const tile of candidates) {
        if (picks.length >= this.config.townCount) break;
        if (tile.town) continue;
        if (picks.some((other) => hexDistance(other, tile) < minDistance)) continue;
        tile.town = { name: townName(rand) };
        picks.push(tile);
      }
      minDistance -= 1;
    }
    return picks;
  }

  placePois(region, rand) {
    const picks = [];
    const candidates = region.filter((tile) => tile.terrain !== 'water' && tile.terrain !== 'mountain' && !tile.town);
    shuffle(candidates, rand);
    let minDistance = 2;
    while (picks.length < this.config.poiCount && minDistance >= 1) {
      for (const tile of candidates) {
        if (picks.length >= this.config.poiCount) break;
        if (tile.poi) continue;
        if (this.map.towns.some((town) => hexDistance(town, tile) < minDistance + 1)) continue;
        if (picks.some((other) => hexDistance(other, tile) < minDistance)) continue;
        tile.poi = POI_TYPES[Math.floor(rand() * POI_TYPES.length)];
        picks.push(tile);
      }
      minDistance -= 1;
    }
    return picks;
  }

  generateRoads(rand) {
    if (this.map.towns.length < 2) return;

    const connected = [this.map.towns[0]];
    const remaining = this.map.towns.slice(1);
    while (remaining.length) {
      let pair = null;
      for (const a of connected) {
        for (const b of remaining) {
          const dist = hexDistance(a, b);
          if (!pair || dist < pair.dist) pair = { a, b, dist };
        }
      }
      if (!pair) break;
      this.carveRoad(pair.a, pair.b);
      connected.push(pair.b);
      remaining.splice(remaining.indexOf(pair.b), 1);
    }

    const extra = Math.round((this.config.roadDensity / 100) * Math.max(1, this.map.towns.length - 1));
    for (let i = 0; i < extra; i += 1) {
      const a = this.map.towns[Math.floor(rand() * this.map.towns.length)];
      let b = this.map.towns[Math.floor(rand() * this.map.towns.length)];
      let guard = 0;
      while (a === b && guard < 8) {
        b = this.map.towns[Math.floor(rand() * this.map.towns.length)];
        guard += 1;
      }
      if (a !== b) this.carveRoad(a, b);
    }
  }

  carveRoad(start, goal) {
    const path = this.findPath(start, goal);
    for (let i = 0; i < path.length; i += 1) {
      const tile = path[i];
      tile.road = true;
      if (i < path.length - 1) {
        tile.roadLinks.add(path[i + 1].key);
        path[i + 1].roadLinks.add(tile.key);
      }
    }
  }

  findPath(start, goal, blockedKeys = new Set()) {
    const open = [start.key];
    const came = new Map();
    const g = new Map([[start.key, 0]]);
    const f = new Map([[start.key, hexDistance(start, goal)]]);

    while (open.length) {
      let current = open[0];
      for (const key of open) if ((f.get(key) ?? Infinity) < (f.get(current) ?? Infinity)) current = key;
      open.splice(open.indexOf(current), 1);

      if (current === goal.key) {
        const path = [];
        let cursor = current;
        while (cursor) {
          const tile = this.map.tileMap.get(cursor);
          if (tile) path.push(tile);
          cursor = came.get(cursor);
        }
        return path.reverse();
      }

      const currentTile = this.map.tileMap.get(current);
      for (const next of this.getNeighbors(currentTile)) {
        if (!next || next.terrain === 'water') continue;
        if (blockedKeys.has(next.key) && next.key !== goal.key) continue;
        const cost = TERRAIN[next.terrain].road * (next.road ? 0.55 : 1);
        const tentative = (g.get(current) ?? Infinity) + cost;
        if (tentative < (g.get(next.key) ?? Infinity)) {
          came.set(next.key, current);
          g.set(next.key, tentative);
          f.set(next.key, tentative + hexDistance(next, goal));
          if (!open.includes(next.key)) open.push(next.key);
        }
      }
    }
    return [];
  }

  getNeighbors(tile) {
    return tile ? DIRS.map(([dq, dr]) => this.map.tileMap.get(keyOf(tile.q + dq, tile.r + dr))).filter(Boolean) : [];
  }

  measureBounds(tiles) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const tile of tiles) {
      const point = axialToPixel(tile.q, tile.r, this.config.size);
      minX = Math.min(minX, point.x - this.config.size * 1.4);
      minY = Math.min(minY, point.y - this.config.size * 1.4);
      maxX = Math.max(maxX, point.x + this.config.size * 1.4);
      maxY = Math.max(maxY, point.y + this.config.size * 1.4);
    }
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  }

  getActorAnchor(tile) {
    return tile ? axialToPixel(tile.q, tile.r, this.config.size) : { x: 0, y: 0 };
  }

  collectSpawnTiles(origin, count) {
    if (!origin) return [];
    const picks = [];
    const visited = new Set([origin.key]);
    const queue = [origin];

    while (queue.length && picks.length < count) {
      const current = queue.shift();
      if (current.terrain !== 'water') picks.push(current);
      for (const next of this.getNeighbors(current)) {
        if (!next || visited.has(next.key) || next.terrain === 'water') continue;
        visited.add(next.key);
        queue.push(next);
      }
    }

    while (picks.length < count) picks.push(origin);
    return picks;
  }

  createPartyActors(tiles) {
    return this.game.party.map((hero, index) => {
      const tile = tiles[index] || tiles[0] || null;
      const anchor = this.getActorAnchor(tile);
      return {
        heroId: hero.id,
        tileKey: tile?.key ?? null,
        x: anchor.x,
        y: anchor.y,
        fromX: anchor.x,
        fromY: anchor.y,
        toX: anchor.x,
        toY: anchor.y,
        facing: 'front',
        sideFlip: false,
        idlePhase: index * 0.93,
        stridePhase: index * 1.17,
      };
    });
  }

  getSelectedHero() {
    return this.game.party[this.game.selectedHeroIndex] || null;
  }

  getSelectedActor() {
    return this.game.partyActors[this.game.selectedHeroIndex] || null;
  }

  syncSelectionContext() {
    const hero = this.getSelectedHero();
    const actor = this.getSelectedActor();
    this.game.partyTile = hero?.tile || null;
    this.game.partyWorld = actor ? { x: actor.x, y: actor.y } : null;
    this.game.location = hero?.tile ? this.getTileLabel(hero.tile) : 'Unknown';
  }

  isTileOccupied(tile, exceptHeroIndex = -1) {
    if (!tile) return false;
    return this.game.party.some((hero, index) => index !== exceptHeroIndex && hero.tile?.key === tile.key);
  }

  spawnParty() {
    const spawn = this.getNodeTile('start_village') || this.map.towns[0] || this.map.tiles.find((tile) => tile.terrain !== 'water') || null;
    const spawnTiles = this.collectSpawnTiles(spawn, this.game.party.length);
    this.game.party.forEach((hero, index) => {
      hero.tile = spawnTiles[index] || spawn || null;
      this.resetHeroTurn(hero);
    });
    this.game.partyActors = this.createPartyActors(spawnTiles);
    this.activateHeroTurn(0);
    this.camera.userAdjusted = false;
    this.fitMapToView();
  }

  fitMapToView() {
    if (!this.map.bounds) return;
    const rect = this.canvas.getBoundingClientRect();
    this.camera.zoom = clamp(Math.min(rect.width / (this.map.bounds.width + 200), rect.height / (this.map.bounds.height + 180), 1.22), 0.35, 2.25);
    const actor = this.getSelectedActor();
    const focus = actor ? { x: actor.x, y: actor.y } : this.game.partyWorld || {
      x: this.map.bounds.minX + this.map.bounds.width / 2,
      y: this.map.bounds.minY + this.map.bounds.height / 2,
    };
    this.camera.x = rect.width / 2 - focus.x * this.camera.zoom;
    this.camera.y = rect.height / 2 - focus.y * this.camera.zoom;
    this.renderMovePips();
  }

  getTileLabel(tile) {
    if (!tile) return 'Unknown';
    if (tile.node) return tile.node.nameUk || tile.node.nameEn || tile.town?.name || tile.poi?.label || 'Unknown';
    if (tile.town) return tile.town.name;
    if (tile.poi) return tile.poi.label;
    if (tile.monsterPack) return tile.monsterPack.label;
    return TERRAIN[tile.terrain].label;
  }

  updateObjective() {
    const nextHub = this.map.nodeById.get('main_city');
    const finalGoal = this.map.nodeById.get('main_dungeon');
    this.game.objective = nextHub
      ? `Reach ${nextHub.nameUk || nextHub.nameEn} and secure the route east.`
      : finalGoal
        ? `Prepare for ${finalGoal.nameUk || finalGoal.nameEn}.`
        : 'Explore the overworld and establish the first route.';
  }

  updateHud(tile) {
    if (tile) this.map.selected = tile;
    const hero = this.getSelectedHero();

    const selected = this.map.selected;
    if (!selected) {
      this.dom.selectedInfo.textContent = 'None';
      this.dom.selectedMeta.textContent = hero
        ? `${hero.name} • Move ${hero.movePoints}/${hero.maxMovePoints}`
        : 'Click a land hex to move a hero.';
    } else {
      const move = selected.terrain === 'water' ? 'Blocked' : String(Math.max(1, TERRAIN[selected.terrain].move - (selected.road ? 1 : 0)));
      const encounter = selected.town ? 0 : selected.poi ? 18 : selected.terrain === 'forest' ? 18 : selected.terrain === 'mountain' ? 24 : selected.terrain === 'wasteland' ? 16 : selected.terrain === 'water' ? 0 : 10;
      this.dom.selectedInfo.textContent = `${selected.q}, ${selected.r} • ${this.getTileLabel(selected)}`;
      this.dom.selectedMeta.textContent = `${selected.terrain === 'water' ? 'Water' : `Move ${move}`} • Encounter ${encounter}%${selected.road ? ' • Road' : ''}${selected.town ? ' • Safe node' : ''}`;
    }

    this.dom.locationTitle.textContent = this.game.location;
    this.dom.dayValue.textContent = String(this.game.day);
    this.dom.goldValue.textContent = String(this.game.gold);
    this.renderMovePips();
  }

  renderMovePips() {
    const hero = this.getSelectedHero();
    const maxMovePoints = hero?.maxMovePoints ?? this.game.maxMovePoints;
    const movePoints = hero?.movePoints ?? 0;
    this.dom.movePips.innerHTML = Array.from({ length: maxMovePoints }, (_, index) => `
      <span class="game-move-pip ${index < movePoints ? 'is-active' : ''}"></span>
    `).join('');
  }

  renderPartyHud() {
    this.dom.partyHud.innerHTML = this.game.party.map((hero, index) => {
      const hpPct = Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100));
      return `
        <button class="game-hero-card ${index === this.game.selectedHeroIndex ? 'is-selected' : ''}" type="button" data-hero-index="${index}">
          <div class="game-hero-card-head">
            <div class="game-hero-player" style="background:${hero.playerColor}">${hero.playerLabel}</div>
            <div class="game-hero-name-wrap">
              <div class="game-hero-name">${hero.name}</div>
              <div class="game-hero-class">${hero.cls}</div>
            </div>
          </div>
          <div class="game-hero-card-body">
            <div class="game-hero-portrait">
              <img src="${hero.views.front}" alt="${hero.name}" onerror="this.style.visibility='hidden'">
            </div>
            <div class="game-hero-stats">
              <div class="game-hero-hp-row">
                <span>HP</span>
                <strong>${hero.hp}/${hero.maxHp}</strong>
              </div>
              <div class="game-hero-hp-bar"><span style="width:${hpPct}%"></span></div>
              <div class="game-hero-stat-grid">
                <span>STR ${hero.stats.str}</span>
                <span>VIT ${hero.stats.vit}</span>
                <span>AGI ${hero.stats.agi}</span>
                <span>INT ${hero.stats.int}</span>
              </div>
            </div>
          </div>
        </button>
      `;
    }).join('');

    this.dom.partyStrip.innerHTML = this.game.party.map((hero, index) => `
      <div class="game-party-chip ${index === this.game.selectedHeroIndex ? 'is-selected' : ''}">
        <span class="game-party-chip-dot" style="background:${hero.playerColor}"></span>
        <span>${hero.name}</span>
      </div>
    `).join('');
  }

  screenToWorld(x, y) {
    return { x: (x - this.camera.x) / this.camera.zoom, y: (y - this.camera.y) / this.camera.zoom };
  }

  pickTile(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const point = this.screenToWorld(clientX - rect.left, clientY - rect.top);
    const axial = pixelToAxial(point.x, point.y, this.config.size);
    return this.map.tileMap.get(keyOf(axial.q, axial.r)) || null;
  }

  handlePointerDown(event) {
    this.camera.dragging = true;
    this.camera.moved = false;
    this.camera.dragX = event.clientX;
    this.camera.dragY = event.clientY;
    this.canvas.classList.add('dragging');
  }

  handlePointerMove(event) {
    if (!this.camera.dragging) return;
    const dx = event.clientX - this.camera.dragX;
    const dy = event.clientY - this.camera.dragY;
    this.camera.dragX = event.clientX;
    this.camera.dragY = event.clientY;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) this.camera.moved = true;
    this.camera.x += dx;
    this.camera.y += dy;
    this.camera.userAdjusted = true;
    this.draw();
  }

  handlePointerUp(event) {
    if (!this.camera.dragging) return;
    this.camera.dragging = false;
    this.canvas.classList.remove('dragging');
    if (!this.camera.moved) this.handleTileClick(this.pickTile(event.clientX, event.clientY));
  }

  handleWheel(event) {
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const before = this.screenToWorld(px, py);
    this.camera.zoom = clamp(this.camera.zoom * (event.deltaY < 0 ? 1.08 : 0.92), 0.36, 2.45);
    this.camera.x = px - before.x * this.camera.zoom;
    this.camera.y = py - before.y * this.camera.zoom;
    this.camera.userAdjusted = true;
    this.draw();
  }

  handleTileClick(tile) {
    if (!tile) {
      this.closeNodeMenu();
      this.updateHud(null);
      return;
    }
    this.map.selected = tile;
    this.updateHud(tile);
    const hero = this.getSelectedHero();
    if (tile.terrain === 'water' || !hero?.tile || this.game.moving || !hero.turnRolled || hero.turnEnded || hero.movePoints <= 0) {
      this.draw();
      return;
    }
    if (tile.key === hero.tile.key || this.isTileOccupied(tile, this.game.selectedHeroIndex)) {
      if (tile.key === hero.tile.key && tile.node) this.openNodeMenu(tile.node);
      else this.closeNodeMenu();
      this.draw();
      return;
    }
    this.closeNodeMenu();
    const blockedKeys = new Set(
      this.game.party
        .map((member, index) => (index === this.game.selectedHeroIndex ? null : member.tile?.key))
        .filter(Boolean),
    );
    const fullPath = this.findPath(hero.tile, tile, blockedKeys);
    const limitedPath = fullPath.slice(1, hero.movePoints + 1);
    this.game.pathPreview = limitedPath;
    if (limitedPath.length) this.beginTravel(limitedPath, this.game.selectedHeroIndex);
    else this.draw();
  }

  beginTravel(path, heroIndex = this.game.selectedHeroIndex) {
    this.closeNodeMenu();
    this.game.activePath = [...path];
    this.game.movingHeroIndex = heroIndex;
    this.startNextStep();
  }

  startNextStep() {
    const hero = this.game.party[this.game.movingHeroIndex];
    const actor = this.game.partyActors[this.game.movingHeroIndex];
    if (!this.game.activePath.length || !hero || !actor || hero.movePoints <= 0) {
      this.game.moving = false;
      this.game.movingHeroIndex = -1;
      this.game.stepFrom = null;
      this.game.stepTo = null;
      this.game.stepElapsed = 0;
      this.game.pathPreview = [];
      this.syncSelectionContext();
      this.updateHud(this.map.selected);
      this.renderPartyHud();
      return;
    }

    const nextTile = this.game.activePath[0];
    this.game.stepFrom = { x: actor.x, y: actor.y };
    this.game.stepTo = this.getActorAnchor(nextTile);
    this.game.stepElapsed = 0;
    this.game.moving = true;
    const deltaX = this.game.stepTo.x - this.game.stepFrom.x;
    const deltaY = this.game.stepTo.y - this.game.stepFrom.y;
    if (Math.abs(deltaX) > Math.abs(deltaY) * 0.72) {
      this.game.facing = 'side';
      this.game.sideFlip = deltaX < 0;
    } else {
      this.game.facing = deltaY < 0 ? 'back' : 'front';
      this.game.sideFlip = false;
    }

    actor.fromX = actor.x;
    actor.fromY = actor.y;
    actor.toX = this.game.stepTo.x;
    actor.toY = this.game.stepTo.y;
    actor.facing = this.game.facing;
    actor.sideFlip = this.game.sideFlip;
  }

  endDay() {
    this.game.day += 1;
    this.game.gold += 2;
    this.syncStore();
    this.updateHud(this.map.selected);
  }

  syncStore() {
    this.store.update((state) => {
      state.world.seed = this.game.seed;
      state.world.difficulty = this.game.difficulty;
      state.world.day = this.game.day;
      state.world.gold = this.game.gold;
      state.world.timeCycleSeconds = this.game.timeCycleSeconds;
      state.world.timeOfDayMinutes = this.game.timeOfDayMinutes;
      state.world.activeContract = this.game.activeContract ? structuredClone(this.game.activeContract) : null;
      state.world.party = structuredClone(this.game.party.map((hero) => ({
        heroId: hero.id,
        name: hero.name,
        cls: hero.cls,
        classKey: hero.classKey,
        summary: hero.summary,
        skills: hero.skills,
        playerLabel: hero.playerLabel,
        playerColor: hero.playerColor,
        focus: hero.focus,
        portrait: hero.portrait,
        views: hero.views,
        pipeLevel: hero.pipeLevel || 1,
        curses: Array.isArray(hero.curses) ? [...hero.curses] : [],
        devotion: hero.devotion || null,
        devotionName: hero.devotionName || null,
      })));
      return state;
    });
  }

  startLoop() {
    cancelAnimationFrame(this.frameRequest);
    this.lastFrame = 0;
    this.frameRequest = requestAnimationFrame(this.onFrame);
  }

  frame(timestamp) {
    if (!this.active) return;
    const deltaSeconds = this.lastFrame ? (timestamp - this.lastFrame) / 1000 : 0;
    const delta = Math.min(deltaSeconds, 0.05);
    this.lastFrame = timestamp;
    this.update(delta, deltaSeconds);
    this.draw();
    this.frameRequest = requestAnimationFrame(this.onFrame);
  }

  update(delta, deltaSeconds = delta) {
    this.game.time += delta;
    this.advanceWorldClock(deltaSeconds);
    if (!this.game.moving) {
      return;
    }

    const hero = this.game.party[this.game.movingHeroIndex];
    const actor = this.game.partyActors[this.game.movingHeroIndex];
    if (!hero || !actor) {
      this.game.moving = false;
      this.game.movingHeroIndex = -1;
      return;
    }

    this.game.stepElapsed += delta;
    const progress = Math.min(1, this.game.stepElapsed / this.game.stepDuration);
    const eased = easeInOut(progress);
    this.game.partyWorld = {
      x: lerp(this.game.stepFrom.x, this.game.stepTo.x, eased),
      y: lerp(this.game.stepFrom.y, this.game.stepTo.y, eased),
    };

    actor.x = lerp(actor.fromX, actor.toX, eased);
    actor.y = lerp(actor.fromY, actor.toY, eased);

    if (progress < 1) return;

    const reached = this.game.activePath.shift();
    hero.tile = reached;
    this.game.partyWorld = { ...this.game.stepTo };
    actor.x = actor.toX;
    actor.y = actor.toY;
    actor.tileKey = reached.key;
    this.map.selected = reached;
    hero.movePoints = Math.max(0, hero.movePoints - 1);
    hero.stepsTaken += 1;
    if (reached.node) {
      this.game.activePath = [];
    }
    this.syncSelectionContext();
    this.syncStore();
    if (!this.camera.userAdjusted) this.fitMapToView();
    this.renderPartyHud();
    this.updateHud(this.map.selected);
    if (reached.node && this.game.selectedHeroIndex === this.game.movingHeroIndex) {
      this.openNodeMenu(reached.node, 'overview');
    }

    if (this.game.activePath.length && hero.movePoints > 0) {
      this.startNextStep();
    } else {
      this.game.moving = false;
      this.game.movingHeroIndex = -1;
      this.game.stepFrom = null;
      this.game.stepTo = null;
      this.game.stepElapsed = 0;
      this.game.pathPreview = [];
      this.game.facing = 'front';
      this.game.sideFlip = false;
      actor.facing = 'front';
      actor.sideFlip = false;
    }
  }

  draw() {
    if (!this.ctx || !this.map.tiles.length) return;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    this.ctx.clearRect(0, 0, width, height);
    this.drawBackdrop(width, height);
    this.ctx.save();
    this.ctx.translate(this.camera.x, this.camera.y);
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    for (const tile of this.map.tiles) {
      const point = axialToPixel(tile.q, tile.r, this.config.size);
      this.drawTerrainTile(tile, point.x, point.y);
    }
    this.drawRoads();
    this.drawPathPreview();
    this.drawMarkers();
    this.drawMonsterPacks();
    this.drawParty();
    this.drawSelection();
    this.ctx.restore();
  }

  drawBackdrop(width, height) {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#6fa7df');
    gradient.addColorStop(0.42, '#4787cf');
    gradient.addColorStop(1, '#24558f');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 60; i += 1) {
      const x = (i * 163) % width;
      const y = (i * 211) % height;
      this.ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(24,62,122,0.08)';
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x + 26, y + 8);
      this.ctx.lineTo(x + 10, y + 18);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }

  drawTerrainTile(tile, cx, cy) {
    const atlasId = this.getAtlasId(tile);
    const frame = this.assets.atlasMeta?.frames?.[atlasId];
    if (this.assets.atlasImage && frame) {
      const cellX = Math.floor(frame.frame.x / TILE_ATLAS.cell) * TILE_ATLAS.cell;
      const cellY = Math.floor(frame.frame.y / TILE_ATLAS.cell) * TILE_ATLAS.cell;
      const scale = this.config.size / TILE_ATLAS.sourceRadius;
      const drawSize = TILE_ATLAS.cell * scale;
      this.ctx.drawImage(this.assets.atlasImage, cellX, cellY, TILE_ATLAS.cell, TILE_ATLAS.cell, cx - drawSize / 2, cy - drawSize / 2, drawSize, drawSize);
      return;
    }
    this.traceHex(cx, cy, this.config.size - 1);
    this.ctx.fillStyle = TERRAIN[tile.terrain].fill;
    this.ctx.fill();
  }

  getAtlasId(tile) {
    if (tile.terrain === 'water') return this.getNeighbors(tile).some((neighbor) => neighbor.terrain !== 'water') ? 'shallows' : 'ocean';
    if (tile.terrain === 'plain') return this.getNeighbors(tile).some((neighbor) => neighbor.terrain === 'water') ? 'sand' : 'grassland';
    if (tile.terrain === 'wasteland') return this.getNeighbors(tile).some((neighbor) => neighbor.terrain === 'water') ? 'sand' : 'wasteland';
    return TERRAIN[tile.terrain].atlas;
  }

  traceHex(cx, cy, radius) {
    const corners = hexCorners(cx, cy, radius);
    this.ctx.beginPath();
    this.ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i += 1) this.ctx.lineTo(corners[i].x, corners[i].y);
    this.ctx.closePath();
  }

  drawRoads() {
    for (const tile of this.map.tiles) {
      if (!tile.roadLinks.size) continue;
      const from = axialToPixel(tile.q, tile.r, this.config.size);
      for (const key of tile.roadLinks) {
        if (tile.key > key) continue;
        const next = this.map.tileMap.get(key);
        if (!next) continue;
        const to = axialToPixel(next.q, next.r, this.config.size);
        this.ctx.strokeStyle = 'rgba(78,45,18,0.35)';
        this.ctx.lineWidth = this.config.size * 0.22;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.stroke();
        this.ctx.strokeStyle = '#d7bf7f';
        this.ctx.lineWidth = this.config.size * 0.12;
        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.stroke();
      }
    }
  }

  drawPathPreview() {
    if (!this.game.pathPreview.length) return;
    this.game.pathPreview.forEach((tile, index) => {
      const point = axialToPixel(tile.q, tile.r, this.config.size);
      this.traceHex(point.x, point.y, this.config.size - 5);
      this.ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      this.ctx.lineWidth = 2.4;
      this.ctx.stroke();
      this.ctx.fillStyle = 'rgba(255,255,255,0.9)';
      this.ctx.font = `${Math.max(16, Math.round(this.config.size * 0.62))}px Cinzel, serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(String(index + 1), point.x, point.y + 2);
    });
  }

  drawMarkers() {
    for (const tile of this.map.tiles) {
      const point = axialToPixel(tile.q, tile.r, this.config.size);
      if (tile.node) {
        this.drawNodeMarker(tile.node, point.x, point.y);
      } else if (tile.town) {
        const size = this.config.size * 0.44;
        this.ctx.fillStyle = 'rgba(0,0,0,0.25)';
        this.ctx.beginPath();
        this.ctx.ellipse(point.x, point.y + size * 0.55, size * 0.72, size * 0.26, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#f1e4b1';
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y - size * 0.22, size * 0.32, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#7d4e34';
        this.ctx.fillRect(point.x - size * 0.42, point.y - size * 0.02, size * 0.84, size * 0.46);
        this.ctx.fillStyle = '#d8935f';
        this.ctx.beginPath();
        this.ctx.moveTo(point.x - size * 0.56, point.y - size * 0.02);
        this.ctx.lineTo(point.x, point.y - size * 0.48);
        this.ctx.lineTo(point.x + size * 0.56, point.y - size * 0.02);
        this.ctx.closePath();
        this.ctx.fill();
      } else if (tile.poi) {
        const size = this.config.size * 0.3;
        this.ctx.fillStyle = tile.poi.color;
        this.ctx.strokeStyle = 'rgba(22,16,10,0.45)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(point.x, point.y - size * 0.66);
        this.ctx.lineTo(point.x - size * 0.54, point.y);
        this.ctx.lineTo(point.x, point.y + size * 0.66);
        this.ctx.lineTo(point.x + size * 0.54, point.y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
      }
    }
  }

  drawNodeMarker(node, x, y) {
    const style = this.getNodeMarkerStyle(node);
    const size = this.config.size * 0.34;

    this.ctx.fillStyle = 'rgba(0,0,0,0.22)';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + size * 0.66, size * 0.92, size * 0.32, 0, 0, Math.PI * 2);
    this.ctx.fill();

    if (style.shape === 'settlement') {
      this.ctx.fillStyle = style.color;
      this.ctx.beginPath();
      this.ctx.arc(x, y - size * 0.18, size * 0.28, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = style.accent;
      this.ctx.fillRect(x - size * 0.46, y + size * 0.04, size * 0.92, size * 0.48);
      this.ctx.fillStyle = style.color;
      this.ctx.beginPath();
      this.ctx.moveTo(x - size * 0.62, y + size * 0.04);
      this.ctx.lineTo(x, y - size * 0.54);
      this.ctx.lineTo(x + size * 0.62, y + size * 0.04);
      this.ctx.closePath();
      this.ctx.fill();
    } else if (style.shape === 'tower') {
      this.ctx.fillStyle = style.accent;
      this.ctx.fillRect(x - size * 0.22, y - size * 0.42, size * 0.44, size * 0.9);
      this.ctx.fillStyle = style.color;
      this.ctx.beginPath();
      this.ctx.moveTo(x - size * 0.38, y - size * 0.42);
      this.ctx.lineTo(x, y - size * 0.78);
      this.ctx.lineTo(x + size * 0.38, y - size * 0.42);
      this.ctx.closePath();
      this.ctx.fill();
    } else {
      this.ctx.fillStyle = style.color;
      this.ctx.strokeStyle = style.accent;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y - size * 0.76);
      this.ctx.lineTo(x - size * 0.58, y);
      this.ctx.lineTo(x, y + size * 0.76);
      this.ctx.lineTo(x + size * 0.58, y);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    }

    if (!this.shouldDrawNodeLabel(node)) return;
    const label = node.nameUk || node.nameEn || node.id;
    this.ctx.fillStyle = 'rgba(18,12,9,0.84)';
    this.ctx.beginPath();
    this.ctx.roundRect(x - size * 1.3, y - size * 1.58, size * 2.6, size * 0.62, size * 0.16);
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(255, 228, 186, 0.24)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    this.ctx.fillStyle = '#f4ead5';
    this.ctx.font = `${Math.max(10, Math.round(this.config.size * 0.24))}px Cinzel, serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(label, x, y - size * 1.28);
  }

  drawMonsterPacks() {
    if (!this.map.monsterPacks.length) return;
    const drawables = this.map.monsterPacks
      .map((pack) => {
        const tile = this.map.tileMap.get(pack.tileKey);
        if (!tile) return null;
        const point = axialToPixel(tile.q, tile.r, this.config.size);
        return { pack, x: point.x, y: point.y };
      })
      .filter(Boolean)
      .sort((a, b) => a.y - b.y);

    for (const entry of drawables) {
      this.drawMonsterPack(entry.pack, entry.x, entry.y);
    }
  }

  drawMonsterPack(pack, x, y) {
    const layout = MONSTER_PACK_LAYOUTS[pack.members.length] || MONSTER_PACK_LAYOUTS[2];
    const ringWidth = this.config.size * 0.6;
    const ringHeight = this.config.size * 0.22;

    this.ctx.fillStyle = pack.important ? 'rgba(185, 63, 48, 0.2)' : 'rgba(62, 40, 22, 0.14)';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + this.config.size * 0.42, ringWidth, ringHeight, 0, 0, Math.PI * 2);
    this.ctx.fill();

    if (pack.important) {
      this.ctx.strokeStyle = 'rgba(255, 175, 130, 0.4)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.ellipse(x, y + this.config.size * 0.42, ringWidth * 1.06, ringHeight * 1.18, 0, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    const members = pack.members
      .map((monsterId, index) => ({
        monsterId,
        index,
        layout: layout[index] || layout[layout.length - 1],
      }))
      .sort((a, b) => a.layout.y - b.layout.y);

    for (const member of members) {
      const image = this.assets.monsters.get(member.monsterId);
      const bob = Math.sin(this.game.time * 2.6 + pack.idlePhase + member.index * 0.74) * 1.5;
      const px = x + member.layout.x * this.config.size;
      const py = y + member.layout.y * this.config.size - bob;
      const width = this.config.size * 1.18 * member.layout.scale;
      const height = image ? width * (image.height / image.width) : width * 0.54;

      this.ctx.fillStyle = 'rgba(0,0,0,0.18)';
      this.ctx.beginPath();
      this.ctx.ellipse(px, py + height * 0.26, width * 0.22, height * 0.12, 0, 0, Math.PI * 2);
      this.ctx.fill();

      if (image) {
        this.ctx.drawImage(image, px - width / 2, py - height / 2, width, height);
      } else {
        this.ctx.fillStyle = pack.important ? '#d68464' : '#9b7b58';
        this.ctx.beginPath();
        this.ctx.moveTo(px, py - height * 0.42);
        this.ctx.lineTo(px - width * 0.24, py);
        this.ctx.lineTo(px, py + height * 0.42);
        this.ctx.lineTo(px + width * 0.24, py);
        this.ctx.closePath();
        this.ctx.fill();
      }
    }
  }

  drawParty() {
    if (!this.game.partyActors.length) return;

    const drawables = this.game.party
      .map((hero, index) => {
        const actor = this.game.partyActors[index];
        if (!actor) return null;
        const actorMoving = this.game.moving && this.game.movingHeroIndex === index;
        const bob = actorMoving
          ? Math.abs(Math.sin(this.game.time * 11 + actor.stridePhase)) * 5
          : Math.sin(this.game.time * 3 + actor.idlePhase) * 2.2;
        return { hero, actor, index, bob, moving: actorMoving, sortY: actor.y };
      })
      .filter(Boolean)
      .sort((a, b) => a.sortY - b.sortY);

    for (const item of drawables) {
      this.drawHeroSprite(item.hero, item.actor, item.bob, item.index, item.moving);
    }
  }

  drawHeroSprite(hero, actor, bob, index, moving) {
    const assets = this.assets.heroes.get(hero.id);
    if (!assets) return;

    const viewKey = actor.facing === 'back'
      ? 'back'
      : actor.facing === 'side'
        ? 'side'
        : 'front';
    const image = assets[viewKey] || assets.front;
    if (!image) return;

    const render = hero.render || HERO_RENDER.default;
    const baseHeight = render.height * (this.config.size / 46);
    const selectionBoost = index === this.game.selectedHeroIndex ? 3 : 0;
    const idlePulse = moving ? 0 : Math.sin(this.game.time * 2.2 + actor.idlePhase) * 0.018;
    const moveStretch = moving ? Math.sin(this.game.time * 16 + actor.stridePhase) * 0.035 : 0;
    const scaleX = 1 - moveStretch * 0.5 + idlePulse * 0.5;
    const scaleY = 1 + moveStretch + idlePulse;
    const sway = moving ? Math.sin(this.game.time * 14 + actor.stridePhase) * 0.035 : idlePulse * 0.8;
    const height = baseHeight + selectionBoost;
    const width = height * (image.width / image.height);
    const px = actor.x + render.offsetX;
    const py = actor.y - render.lift - bob;

    this.ctx.fillStyle = 'rgba(0,0,0,0.22)';
    this.ctx.beginPath();
    this.ctx.ellipse(
      px,
      py + height * 0.38,
      width * (moving ? 0.28 : 0.24),
      height * (moving ? 0.115 : 0.095),
      0,
      0,
      Math.PI * 2,
    );
    this.ctx.fill();

    this.ctx.save();
    this.ctx.translate(px, py);
    if (actor.facing === 'side' && actor.sideFlip) {
      this.ctx.scale(-1, 1);
    }
    this.ctx.rotate(sway);
    this.ctx.scale(scaleX, scaleY);
    this.ctx.drawImage(image, -width / 2, -height / 2, width, height);
    this.ctx.restore();

    if (index === this.game.selectedHeroIndex) {
      this.ctx.strokeStyle = rgba(hero.playerColor, 0.8);
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.ellipse(px, py + height * 0.38, width * 0.31, height * 0.13, 0, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  drawSelection() {
    if (!this.map.selected) return;
    const point = axialToPixel(this.map.selected.q, this.map.selected.r, this.config.size);
    this.traceHex(point.x, point.y, this.config.size + 2);
    this.ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    this.traceHex(point.x, point.y, this.config.size + 6);
    this.ctx.strokeStyle = 'rgba(140,230,255,0.42)';
    this.ctx.lineWidth = 1.6;
    this.ctx.stroke();
  }

  updateHud(tile) {
    if (tile) this.map.selected = tile;
    const hero = this.getSelectedHero();
    const selected = this.map.selected;

    if (!selected) {
      this.dom.selectedInfo.textContent = 'None';
      this.dom.selectedMeta.textContent = hero
        ? `${hero.name} • Move ${hero.movePoints}/${hero.maxMovePoints}`
        : 'Click a land hex to move a hero.';
    } else {
      const move = selected.terrain === 'water'
        ? 'Blocked'
        : String(Math.max(1, TERRAIN[selected.terrain].move - (selected.road ? 1 : 0)));
      const encounter = selected.town
        ? 0
        : selected.poi
          ? 18
          : selected.terrain === 'forest'
            ? 18
            : selected.terrain === 'mountain'
              ? 24
              : selected.terrain === 'wasteland'
                ? 16
                : selected.terrain === 'water'
                  ? 0
                  : 10;
      this.dom.selectedInfo.textContent = `${selected.q}, ${selected.r} • ${this.getTileLabel(selected)}`;
      this.dom.selectedMeta.textContent = `${hero ? `${hero.name} • Move ${hero.movePoints}/${hero.maxMovePoints} • ` : ''}${selected.terrain === 'water' ? 'Water' : `Move ${move}`} • Encounter ${encounter}%${selected.road ? ' • Road' : ''}${selected.town ? ' • Safe node' : ''}`;
    }

    this.dom.locationTitle.textContent = hero?.tile ? `${hero.name} • ${this.getTileLabel(hero.tile)}` : this.game.location;
    this.dom.dayValue.textContent = String(this.game.day);
    this.dom.goldValue.textContent = String(this.game.gold);
    this.renderMovePips();
  }

  renderMovePips() {
    const hero = this.getSelectedHero();
    const maxMovePoints = hero?.maxMovePoints ?? this.game.maxMovePoints;
    const movePoints = hero?.movePoints ?? 0;
    this.dom.movePips.innerHTML = Array.from({ length: maxMovePoints }, (_, index) => `
      <span class="game-move-pip ${index < movePoints ? 'is-active' : ''}"></span>
    `).join('');
  }

  renderPartyHud() {
    this.dom.partyHud.innerHTML = this.game.party.map((hero, index) => {
      const hpPct = Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100));
      const tileLabel = hero.tile ? `${hero.tile.q},${hero.tile.r}` : '--';
      return `
        <button class="game-hero-card ${index === this.game.selectedHeroIndex ? 'is-selected' : ''}" type="button" data-hero-index="${index}">
          <div class="game-hero-card-head">
            <div class="game-hero-player" style="background:${hero.playerColor}">${hero.playerLabel}</div>
            <div class="game-hero-name-wrap">
              <div class="game-hero-name">${hero.name}</div>
              <div class="game-hero-class">${hero.cls} • MOVE ${hero.movePoints}/${hero.maxMovePoints}</div>
            </div>
          </div>
          <div class="game-hero-card-body">
            <div class="game-hero-portrait">
              <img src="${hero.views.front}" alt="${hero.name}" onerror="this.style.visibility='hidden'">
            </div>
            <div class="game-hero-stats">
              <div class="game-hero-hp-row">
                <span>HP</span>
                <strong>${hero.hp}/${hero.maxHp}</strong>
              </div>
              <div class="game-hero-hp-bar"><span style="width:${hpPct}%"></span></div>
              <div class="game-hero-stat-grid">
                <span>TILE ${tileLabel}</span>
                <span>MOVE ${hero.movePoints}/${hero.maxMovePoints}</span>
                <span>STR ${hero.stats.str}</span>
                <span>VIT ${hero.stats.vit}</span>
                <span>AGI ${hero.stats.agi}</span>
                <span>INT ${hero.stats.int}</span>
              </div>
            </div>
          </div>
        </button>
      `;
    }).join('');

    this.dom.partyStrip.innerHTML = this.game.party.map((hero, index) => `
      <div class="game-party-chip ${index === this.game.selectedHeroIndex ? 'is-selected' : ''}">
        <span class="game-party-chip-dot" style="background:${hero.playerColor}"></span>
        <span>${hero.name} ${hero.movePoints}/${hero.maxMovePoints}</span>
      </div>
    `).join('');
  }

  updateHud(tile) {
    if (tile) this.map.selected = tile;
    const hero = this.getSelectedHero();
    const selected = this.map.selected;

    if (!selected) {
      this.dom.selectedInfo.textContent = hero?.tile ? this.getTileLabel(hero.tile) : 'No Hex';
      this.dom.selectedMeta.textContent = hero
        ? `${hero.name} • ${hero.movePoints}/${hero.maxMovePoints} move`
        : 'Select a hero';
    } else {
      const move = selected.terrain === 'water'
        ? 'Blocked'
        : String(Math.max(1, TERRAIN[selected.terrain].move - (selected.road ? 1 : 0)));
      const encounter = selected.town
        ? 0
        : selected.poi
          ? 18
          : selected.terrain === 'forest'
            ? 18
            : selected.terrain === 'mountain'
              ? 24
              : selected.terrain === 'wasteland'
                ? 16
                : selected.terrain === 'water'
                  ? 0
                  : 10;
      const parts = [`${selected.q}, ${selected.r}`];
      if (selected.terrain === 'water') parts.push('Water');
      else parts.push(`Move ${move}`);
      if (encounter > 0) parts.push(`${encounter}% risk`);
      if (selected.road) parts.push('Road');
      if (selected.town) parts.push('Town');
      if (selected.poi) parts.push(selected.poi.label);
      this.dom.selectedInfo.textContent = this.getTileLabel(selected);
      this.dom.selectedMeta.textContent = parts.join(' • ');
    }

    this.dom.locationTitle.textContent = hero?.tile ? `${hero.name} | ${this.getTileLabel(hero.tile)}` : this.game.location;
    this.updateClockHud();
    this.renderMovePips();
    this.updateActionButtons();
  }

  renderMovePips() {
    const hero = this.getSelectedHero();
    const maxMovePoints = hero?.maxMovePoints ?? this.game.maxMovePoints;
    const movePoints = hero?.movePoints ?? 0;
    const spentPoints = hero?.stepsTaken ?? 0;
    this.dom.movePips.innerHTML = Array.from({ length: maxMovePoints }, (_, index) => `
      <span class="game-move-pip ${index < spentPoints ? 'is-spent' : index < spentPoints + movePoints ? 'is-active' : ''}"></span>
    `).join('');
  }

  renderPartyHud() {
    this.dom.partyHud.innerHTML = this.game.party.map((hero, index) => {
      const statTiles = [
        { label: 'STR', value: hero.stats.str, mod: 'game-hero-stat--ruby' },
        { label: 'VIT', value: hero.stats.vit, mod: 'game-hero-stat--steel' },
        { label: 'AGI', value: hero.stats.agi, mod: 'game-hero-stat--jade' },
        { label: 'INT', value: hero.stats.int, mod: 'game-hero-stat--violet' },
      ].map((stat) => `
        <div class="game-hero-stat ${stat.mod}">
          <span>${stat.label}</span>
          <strong>${stat.value}</strong>
        </div>
      `).join('');

      return `
        <button class="game-hero-card ${index === this.game.selectedHeroIndex ? 'is-selected' : ''}" type="button" data-hero-index="${index}">
          <div class="game-hero-card-head">
            <div class="game-hero-corner game-hero-corner--hp">
              <span>HP</span>
              <strong>${hero.hp}</strong>
            </div>
            <div class="game-hero-portrait">
              <img src="${hero.views.front}" alt="${hero.name}" class="game-hero-portrait-head" onerror="this.style.visibility='hidden'">
            </div>
            <div class="game-hero-corner game-hero-corner--move">
              <span>MOVE</span>
              <strong>${hero.movePoints}</strong>
              <em>/${hero.maxMovePoints}</em>
            </div>
          </div>
          <div class="game-hero-name-wrap">
            <div class="game-hero-name">${hero.name}</div>
            <div class="game-hero-class">${hero.cls}</div>
          </div>
          <div class="game-hero-stat-grid">${statTiles}</div>
        </button>
      `;
    }).join('');

    this.dom.partyStrip.innerHTML = this.game.party.map((hero, index) => `
      <div class="game-party-chip ${index === this.game.selectedHeroIndex ? 'is-selected' : ''}">
        <span class="game-party-chip-avatar">
          <img src="${hero.views.front}" alt="${hero.name}" class="game-party-chip-avatar-img" onerror="this.style.visibility='hidden'">
        </span>
        <span class="game-party-chip-count">${hero.movePoints}</span>
      </div>
    `).join('');
  }

  getNodeServiceLabels(node) {
    if (!node?.services?.length) return [];
    if (node.serviceLabelsUk?.length) return node.serviceLabelsUk.slice(0, 5);
    return node.services
      .map((serviceId) => SERVICE_LABELS_UK[serviceId] || serviceId.replaceAll('_', ' '))
      .slice(0, 5);
  }

  getSelectedNode() {
    return this.map.selected?.node || null;
  }

  getNodeById(nodeId) {
    return this.map.nodeById.get(nodeId) || worldBlueprint.nodes.find((node) => node.id === nodeId) || null;
  }

  getCurrentNode(hero = this.getSelectedHero()) {
    return hero?.tile?.node || null;
  }

  canInteractWithNode(node = this.getSelectedNode(), hero = this.getSelectedHero()) {
    return Boolean(node && hero?.tile && hero.tile.key === node.tileKey && !this.game.moving);
  }

  isCityNode(node) {
    return node?.type === 'city';
  }

  getNodeVisitLabel(node) {
    if (!node) return 'Visit';
    if (this.isCityNode(node)) return 'Місто';
    if (node.type === 'dungeon' || node.type === 'mine') return 'Enter';
    if (node.type === 'pass' || node.type === 'watchtower' || node.type === 'gate') return 'Inspect';
    if (node.type === 'temple') return 'Devote';
    if (SETTLEMENT_NODE_TYPES.has(node.type)) return 'Visit';
    return 'Explore';
  }

  getPipeSmithCost(hero = this.getSelectedHero()) {
    return 10 + Math.max(1, hero?.pipeLevel || 1) * 4;
  }

  getNodeTypeLabel(node) {
    return NODE_TYPE_LABELS_UK[node?.type] || NODE_TYPE_LABELS_UK.poi;
  }

  isMarketNode(node) {
    return Boolean(node && (
      SETTLEMENT_NODE_TYPES.has(node.type)
      || node.services?.some((serviceId) => ['market', 'caravan_vendor', 'fish_market', 'black_market', 'hunter_vendor', 'herbalist', 'shipwright'].includes(serviceId))
    ));
  }

  isSanctumNode(node) {
    return Boolean(node && (
      node.type === 'temple'
      || node.services?.some((serviceId) => ['blessing', 'vision_event'].includes(serviceId))
      || node.role?.some((role) => ['blessing', 'ritual'].includes(role))
    ));
  }

  isExpeditionNode(node) {
    return Boolean(node && (
      ['dungeon', 'mine', 'pass', 'watchtower', 'gate'].includes(node.type)
      || node.role?.some((role) => ['combat', 'elite_hunt', 'risk_reward', 'story', 'blocker'].includes(role))
    ));
  }

  getCityMenuOptions(node) {
    if (!this.isCityNode(node)) return [];
    return [
      { id: 'inn', labelUk: 'Готель', icon: CITY_MENU_ICONS.inn },
      { id: 'healer', labelUk: 'Цілитель', icon: CITY_MENU_ICONS.healer },
      { id: 'meditation', labelUk: 'Медитація', icon: CITY_MENU_ICONS.meditation },
      { id: 'blessing', labelUk: 'Благословення', icon: CITY_MENU_ICONS.blessing },
      { id: 'market', labelUk: 'Міський ринок', icon: CITY_MENU_ICONS.market },
      { id: 'pipesmith', labelUk: 'Трубочник', icon: CITY_MENU_ICONS.pipesmith },
      { id: 'contracts', labelUk: 'Побічні завдання', icon: CITY_MENU_ICONS.quests },
    ];
  }

  getNodeMenuSections(node) {
    const sections = [{ id: 'overview', labelUk: 'Огляд' }];
    if (this.isMarketNode(node)) sections.push({ id: 'market', labelUk: 'Крамниця' });
    if (this.getNodeServiceEntries(node).length) sections.push({ id: 'services', labelUk: 'Послуги' });
    if (node?.questTags?.length) sections.push({ id: 'contracts', labelUk: 'Підряди' });
    if (this.isSanctumNode(node)) sections.push({ id: 'sanctum', labelUk: 'Санктум' });
    if (this.isExpeditionNode(node)) sections.push({ id: 'expedition', labelUk: 'Вилазка' });
    if (node?.connectedTo?.length) sections.push({ id: 'routes', labelUk: 'Маршрути' });
    return sections;
  }

  openNodeMenu(node = this.getSelectedNode(), section = null) {
    if (!this.canInteractWithNode(node)) return;
    if (this.isCityNode(node)) {
      this.openCityMenu(node, section);
      return;
    }
    const sections = this.isCityNode(node)
      ? this.getCityMenuOptions(node).map((entry) => ({ id: entry.id }))
      : this.getNodeMenuSections(node);
    const nextSection = section && sections.some((entry) => entry.id === section)
      ? section
      : this.isCityNode(node)
        ? 'market'
        : sections[0]?.id || 'overview';
    this.game.nodeMenu = {
      open: true,
      nodeId: node.id,
      section: nextSection,
      notice: '',
    };
    this.renderNodeMenu();
  }

  openCityMenu(node = this.getSelectedNode(), section = null) {
    if (!this.canInteractWithNode(node) || !this.isCityNode(node)) return;
    const sections = this.getCityMenuOptions(node).map((entry) => ({ id: entry.id }));
    const nextSection = section && sections.some((entry) => entry.id === section)
      ? section
      : 'market';
    this.game.nodeMenu = {
      open: true,
      nodeId: node.id,
      section: nextSection,
      notice: '',
    };
    this.renderCityMenu(node);
  }

  closeNodeMenu() {
    this.game.nodeMenu = {
      open: false,
      nodeId: null,
      section: 'overview',
      notice: '',
    };
    this.dom.nodeMenu.classList.remove('is-open', 'is-city');
    this.dom.nodeMenu.innerHTML = '';
    this.dom.cityMenu.classList.remove('is-open', 'is-city');
    this.dom.cityMenu.innerHTML = '';
  }

  setNodeMenuNotice(message) {
    this.game.nodeMenu.notice = message;
    this.renderNodeMenu();
  }

  getNodeMarketStock(node) {
    const common = [
      { name: 'Godsbeard', kind: 'Трава', price: 6 + node.tier * 2, note: 'Базове лікування, як у класичному town market FTK.' },
      { name: 'Golden Root', kind: 'Фокус', price: 8 + node.tier * 2, note: 'Повертає фокус перед важкою перевіркою.' },
      { name: 'Teleport Scroll', kind: 'Утиліта', price: 12 + node.tier * 3, note: 'Рідкісна дорожня магія для багатших вузлів.' },
    ];
    if (node.type === 'port') {
      return [
        { name: 'Spyglass', kind: 'Розвідка', price: 10 + node.tier * 3, note: 'Дає наводки на берег і приховані маршрути.' },
        { name: 'Salted Rations', kind: 'Подорож', price: 7 + node.tier * 2, note: 'Запаси для довгих рейсів і доріг.' },
        { name: 'Smuggler Map', kind: 'Маршрут', price: 14 + node.tier * 3, note: 'Натякає на шорткати і тіньові бухти.' },
        ...common.slice(0, 1),
      ];
    }
    if (node.type === 'outpost') {
      return [
        { name: 'Bandage Roll', kind: 'Похідний набір', price: 5 + node.tier * 2, note: 'Дешева польова допомога для патрулів.' },
        { name: 'Torch Oil', kind: 'Данж', price: 7 + node.tier * 2, note: 'Запаси для шахт, башт і печер.' },
        { name: 'Pickaxe', kind: 'Інструмент', price: 9 + node.tier * 3, note: 'Корисно біля завалів, мостів і рудних жил.' },
        ...common.slice(0, 1),
      ];
    }
    if (node.services?.includes('black_market')) {
      return [
        { name: 'Lockpick Set', kind: 'Тінь', price: 11 + node.tier * 3, note: 'Нелегальні інструменти і швидкі гроші.' },
        { name: 'Night Draught', kind: 'Рідкість', price: 13 + node.tier * 3, note: 'Беруть перед небезпечними нічними вилазками.' },
        { name: 'Stolen Charm', kind: 'Аксесуар', price: 15 + node.tier * 4, note: 'Сильна, підозріла і дорога річ.' },
        ...common.slice(0, 1),
      ];
    }
    return [
      { name: 'Leather Jerkin', kind: 'Обладунок', price: 9 + node.tier * 3, note: 'Базовий захист для ранніх торгових міст.' },
      { name: 'Scholar Ink', kind: 'Утиліта', price: 8 + node.tier * 2, note: 'Типовий товар біля гільдій і дошок підрядів.' },
      ...common,
    ].slice(0, 4);
  }

  getNodeServiceEntries(node) {
    const services = new Set(node?.services || []);
    const isCity = this.isCityNode(node);
    const entries = [];
    if (isCity || services.has('inn') || services.has('inn_limited')) {
      entries.push({
        id: 'inn',
        label: 'Inn',
        labelUk: 'Заїзд',
        cost: 4 + node.tier * 2,
        effect: 'Повністю відновлює активного героя і завершує його хід, як відпочинок у місті в FTK.',
        cta: 'Відпочити',
      });
    }
    if (isCity || services.has('healer') || services.has('heal')) {
      entries.push({
        id: 'healer',
        label: 'Healer',
        labelUk: 'Лікар',
        cost: 3 + node.tier * 2,
        effect: 'Повністю відновлює здоров’я активного героя.',
        cta: 'Лікувати',
      });
    }
    if (isCity) {
      entries.push({
        id: 'meditation',
        label: 'Meditation',
        labelUk: 'Медитація',
        cost: 2 + node.tier * 2,
        effect: 'Повністю відновлює фокус активного героя.',
        cta: 'Медитувати',
      });
    }
    if (isCity || services.has('blessing')) {
      entries.push({
        id: 'blessing',
        label: 'Blessing',
        labelUk: 'Благословення',
        cost: node.type === 'temple' ? 0 : 5 + node.tier * 2,
        effect: 'Знімає всі прокляття активного героя. Поки curse-layer мінімальний, це також чистить майбутні debuff slots.',
        cta: 'Отримати',
      });
    }
    if (isCity) {
      entries.push({
        id: 'pipesmith',
        label: 'PipeSmith',
        labelUk: 'Трубочник',
        cost: null,
        effect: 'Підвищує рівень трубки героя, щоб пізніше ефективніше працювати з травами.',
        cta: 'Покращити',
      });
    }
    if (services.has('repair') || services.has('blacksmith') || services.has('blacksmith_basic') || services.has('shipwright') || services.has('ore_exchange')) {
      entries.push({
        id: 'forge',
        label: 'Forge Desk',
        labelUk: 'Кузня',
        cost: null,
        effect: 'Тут живе апгрейд, ремонт і спорядження, як у міському циклі FTK.',
        cta: '',
      });
    }
    if (services.has('storage') || services.has('quartermaster')) {
      entries.push({
        id: 'storage',
        label: 'Storage',
        labelUk: 'Склад',
        cost: null,
        effect: 'Склад і логістика інтенданта цього вузла.',
        cta: '',
      });
    }
    if (services.has('rumors') || services.has('intel')) {
      entries.push({
        id: 'rumors',
        label: 'Rumours',
        labelUk: 'Чутки',
        cost: 0,
        effect: 'Дає наводки на маршрути, блокери і найближчі загрози.',
        cta: 'Спитати',
      });
    }
    return entries;
  }

  getNodeContracts(node) {
    const tags = [...new Set(node?.questTags || [])].slice(0, 3);
    const targets = (node?.connectedTo || [])
      .map((nodeId) => this.getNodeById(nodeId))
      .filter(Boolean);
    return tags.map((tag, index) => {
      const target = targets[index % Math.max(1, targets.length)] || node;
      const lowTag = tag.toLowerCase();
      if (lowTag.includes('escort') || lowTag.includes('supplies') || lowTag.includes('cargo') || lowTag.includes('caravan')) {
        return {
          id: `${node.id}-${tag}`,
          type: 'Delivery',
          typeUk: 'Доставка',
          titleUk: `Провести вантаж до ${target.nameUk || target.nameEn}`,
          objective: `Проведи припаси з ${node.nameUk || node.nameEn} до ${target.nameUk || target.nameEn}.`,
          reward: `${8 + node.tier * 3} золота • припаси`,
        };
      }
      if (lowTag.includes('hunt') || lowTag.includes('wolves') || lowTag.includes('bounty') || lowTag.includes('beast')) {
        return {
          id: `${node.id}-${tag}`,
          type: 'Bounty',
          typeUk: 'Полювання',
          titleUk: `Полювання біля ${target.nameUk || target.nameEn}`,
          objective: `Вистеж і зачисть загрозу біля ${target.nameUk || target.nameEn}.`,
          reward: `${10 + node.tier * 3} золота • трофей`,
        };
      }
      if (lowTag.includes('relic') || lowTag.includes('map') || lowTag.includes('key') || lowTag.includes('artifact')) {
        return {
          id: `${node.id}-${tag}`,
          type: 'Retrieval',
          typeUk: 'Повернення',
          titleUk: `Повернути реліквію з ${target.nameUk || target.nameEn}`,
          objective: `Поверни позначену реліквію з ${target.nameUk || target.nameEn}.`,
          reward: `${9 + node.tier * 3} золота • знання`,
        };
      }
      return {
        id: `${node.id}-${tag}`,
        type: 'Explore',
        typeUk: 'Дослідження',
        titleUk: `Розвідати ${target.nameUk || target.nameEn}`,
        objective: `Досліди ${target.nameUk || target.nameEn} і повернись із звітом до ${node.nameUk || node.nameEn}.`,
        reward: `${7 + node.tier * 3} золота • чутка`,
      };
    });
  }

  getNodeLinks(node) {
    return worldBlueprint.links.filter((link) => link.from === node.id || link.to === node.id);
  }

  formatRouteKind(kind) {
    const labels = {
      road: 'Дорога',
      trail: 'Стежка',
      coastal: 'Берег',
      military_road: 'Військова дорога',
      pass: 'Прохід',
      path: 'Шлях',
    };
    return labels[kind] || kind;
  }

  handleNodeMenuClick(event) {
    const closeButton = event.target.closest('[data-node-close]');
    if (closeButton) {
      this.closeNodeMenu();
      return;
    }
    const sectionButton = event.target.closest('[data-node-section]');
    if (sectionButton) {
      this.game.nodeMenu.section = sectionButton.dataset.nodeSection;
      this.game.nodeMenu.notice = '';
      this.renderNodeMenu();
      return;
    }
    const serviceButton = event.target.closest('[data-node-service]');
    if (serviceButton) {
      this.useNodeService(serviceButton.dataset.nodeService);
      return;
    }
    const contractButton = event.target.closest('[data-node-contract]');
    if (contractButton) {
      this.acceptNodeContract(contractButton.dataset.nodeContract);
      return;
    }
    const actionButton = event.target.closest('[data-node-action]');
    if (actionButton) {
      const action = actionButton.dataset.nodeAction;
      if (action === 'devote') this.devoteAtNode();
      if (action === 'expedition') this.startNodeExpedition();
      if (action === 'route') this.pinRouteObjective(actionButton.dataset.nodeTarget);
    }
  }

  useNodeService(serviceId) {
    const hero = this.getSelectedHero();
    const node = this.getNodeById(this.game.nodeMenu.nodeId);
    const entry = this.getNodeServiceEntries(node).find((service) => service.id === serviceId);
    if (!hero || !node || !entry) return;
    const cost = serviceId === 'pipesmith' ? this.getPipeSmithCost(hero) : entry.cost || 0;

    if (cost > 0 && this.game.gold < cost) {
      this.setNodeMenuNotice('Недостатньо золота для цієї послуги.');
      return;
    }

    if (serviceId === 'inn') {
      this.game.gold -= cost;
      hero.hp = hero.maxHp;
      hero.focus = hero.maxFocus;
      this.closeNodeMenu();
      hero.movePoints = 0;
      hero.turnEnded = true;
      this.advanceHeroTurn();
      this.syncStore();
      this.renderPartyHud();
      this.updateHud(this.map.selected);
      this.draw();
      return;
    }

    if (serviceId === 'healer') {
      this.game.gold -= cost;
      hero.hp = hero.maxHp;
      hero.poisoned = false;
      this.syncStore();
      this.renderPartyHud();
      this.updateHud(this.map.selected);
      this.setNodeMenuNotice(`${hero.name} повністю відновив здоров’я.`);
      return;
    }

    if (serviceId === 'meditation') {
      this.game.gold -= cost;
      hero.focus = hero.maxFocus;
      this.syncStore();
      this.renderPartyHud();
      this.updateHud(this.map.selected);
      this.setNodeMenuNotice(`${hero.name} повністю відновив фокус.`);
      return;
    }

    if (serviceId === 'blessing') {
      this.game.gold -= cost;
      hero.curses = [];
      this.syncStore();
      this.renderPartyHud();
      this.updateHud(this.map.selected);
      this.setNodeMenuNotice(`${hero.name} очищений від усіх проклять.`);
      return;
    }

    if (serviceId === 'pipesmith') {
      this.game.gold -= cost;
      hero.pipeLevel = Math.min(5, (hero.pipeLevel || 1) + 1);
      this.syncStore();
      this.renderPartyHud();
      this.updateHud(this.map.selected);
      this.setNodeMenuNotice(`Рівень трубки ${hero.name}: ${hero.pipeLevel}/5.`);
      return;
    }

    if (serviceId === 'rumors') {
      const target = this.getNodeById(node.connectedTo?.[0]);
      this.game.objective = target
        ? `Слідуй за чутками з ${node.nameUk || node.nameEn} до ${target.nameUk || target.nameEn}.`
        : `Збери більше чуток у ${node.nameUk || node.nameEn}.`;
      this.syncStore();
      this.updateHud(this.map.selected);
      this.setNodeMenuNotice('Нову наводку винесено в objective banner.');
    }
  }

  devoteAtNode() {
    const hero = this.getSelectedHero();
    const node = this.getNodeById(this.game.nodeMenu.nodeId);
    if (!hero || !node) return;
    const occupiedByOther = this.game.party.some((member) => member.id !== hero.id && member.devotion === node.id);
    if (occupiedByOther) {
      this.setNodeMenuNotice('Інший герой уже посвячений цьому санктуму.');
      return;
    }
    if (hero.devotion && hero.devotion !== node.id) {
      this.setNodeMenuNotice(`${hero.name} уже має посвяту в іншому місці.`);
      return;
    }
    hero.devotion = node.id;
    hero.devotionName = node.nameUk || node.nameEn;
    hero.hp = hero.maxHp;
    hero.focus = hero.maxFocus;
    this.syncStore();
    this.renderPartyHud();
    this.updateHud(this.map.selected);
    this.setNodeMenuNotice(`${hero.name} посвячений ${hero.devotionName} і повністю відновився.`);
  }

  acceptNodeContract(contractId) {
    const node = this.getNodeById(this.game.nodeMenu.nodeId);
    const contract = this.getNodeContracts(node).find((entry) => entry.id === contractId);
    if (!contract) return;
    this.game.activeContract = {
      ...contract,
      sourceNodeId: node.id,
      sourceNodeName: node.nameUk || node.nameEn,
    };
    this.game.objective = contract.objective;
    this.syncStore();
    this.updateHud(this.map.selected);
    this.setNodeMenuNotice(`Підряд "${contract.typeUk}" взято. Ціль оновлено.`);
  }

  startNodeExpedition() {
    const node = this.getNodeById(this.game.nodeMenu.nodeId);
    if (!node) return;
    const verb = node.type === 'dungeon' || node.type === 'mine' ? 'Увійти в' : 'Дослідити';
    this.game.objective = `${verb} ${node.nameUk || node.nameEn} і розібратись із загрозою всередині.`;
    this.syncStore();
    this.updateHud(this.map.selected);
    this.setNodeMenuNotice('Вилазку позначено як поточну ціль.');
  }

  pinRouteObjective(nodeId) {
    const target = this.getNodeById(nodeId);
    if (!target) return;
    this.game.objective = `Дійти до ${target.nameUk || target.nameEn} найбезпечнішим доступним маршрутом.`;
    this.syncStore();
    this.updateHud(this.map.selected);
    this.setNodeMenuNotice(`${target.nameUk || target.nameEn} закріплено як наступний напрямок.`);
  }

  renderNodeMenuSection(node, section) {
    if (section === 'market') {
      const stock = this.getNodeMarketStock(node).map((item) => `
        <div class="game-node-menu-row">
          <div>
            <strong>${item.name}</strong>
            <p>${item.kind} • ${item.note}</p>
          </div>
          <span class="game-node-menu-price">${item.price}g</span>
        </div>
      `).join('');
      return `
        <div class="game-node-menu-copy">Як і в For The King, крамниця тут побудована навколо перегляду асортименту, цін і підготовки перед дорогою. Поки що це тематичний stock-view без повного inventory layer.</div>
        <div class="game-node-menu-list">${stock}</div>
      `;
    }

    if (section === 'services') {
      const services = this.getNodeServiceEntries(node).map((service) => `
        <div class="game-node-menu-row">
          <div>
            <strong>${service.labelUk}</strong>
            <p>${service.effect}</p>
          </div>
          ${service.cta ? `<button class="btn btn--ghost game-node-menu-btn" type="button" data-node-service="${service.id}">${service.cta}${service.cost !== null ? ` • ${service.cost}g` : ''}</button>` : `<span class="game-node-menu-note">Огляд</span>`}
        </div>
      `).join('');
      return `<div class="game-node-menu-list">${services}</div>`;
    }

    if (section === 'contracts') {
      const contracts = this.getNodeContracts(node).map((contract) => `
        <div class="game-node-menu-row">
          <div>
            <strong>${contract.typeUk}: ${contract.titleUk}</strong>
            <p>${contract.objective}</p>
          </div>
          <button class="btn btn--ghost game-node-menu-btn" type="button" data-node-contract="${contract.id}">Взяти • ${contract.reward}</button>
        </div>
      `).join('');
      return `
        <div class="game-node-menu-copy">Панель підрядів зібрана за логікою оригінального FTK: bounty, delivery, retrieval і exploration contracts.</div>
        <div class="game-node-menu-list">${contracts}</div>
      `;
    }

    if (section === 'sanctum') {
      const hero = this.getSelectedHero();
      const devotion = hero?.devotion === node.id
        ? `${hero.name} уже посвячений тут.`
        : hero?.devotionName
          ? `${hero.name} зараз посвячений у ${hero.devotionName}.`
          : 'Цей герой ще не має посвяти.';
      return `
        <div class="game-node-menu-copy">У For The King sanctum повністю відновлює героя, прив’язує його до унікальної посвяти і надалі може врятувати один раз без витрати life pool. Тут закладено саме цю рамку.</div>
        <div class="game-node-menu-row">
          <div>
            <strong>Посвята</strong>
            <p>${devotion}</p>
          </div>
          <button class="btn btn--ghost game-node-menu-btn" type="button" data-node-action="devote">Посвятити</button>
        </div>
      `;
    }

    if (section === 'expedition') {
      return `
        <div class="game-node-menu-copy">Небезпечні вузли в FTK зводять карту до конкретного рішення: увійти, розвідати, зачистити, втримати або пройти глибше.</div>
        <div class="game-node-menu-row">
          <div>
            <strong>${this.getNodeVisitLabel(node)}</strong>
            <p>${node.notes || node.storySummaryUk || 'Підготуй партію і зафіксуй вилазку як основну ціль.'}</p>
          </div>
          <button class="btn btn--ghost game-node-menu-btn" type="button" data-node-action="expedition">${this.getNodeVisitLabel(node)}</button>
        </div>
      `;
    }

    if (section === 'routes') {
      const routes = this.getNodeLinks(node).map((link) => {
        const targetId = link.from === node.id ? link.to : link.from;
        const target = this.getNodeById(targetId);
        return `
          <div class="game-node-menu-row">
            <div>
              <strong>${target?.nameUk || target?.nameEn || targetId}</strong>
              <p>${this.formatRouteKind(link.kind)} • ${link.risk} risk${link.gatedBy?.length ? ' • заблоковано' : ''}</p>
            </div>
            <button class="btn btn--ghost game-node-menu-btn" type="button" data-node-action="route" data-node-target="${targetId}">Ціль</button>
          </div>
        `;
      }).join('');
      return `<div class="game-node-menu-list">${routes}</div>`;
    }

    const activeContract = this.game.activeContract?.sourceNodeId === node.id ? this.game.activeContract : null;
    return `
      <div class="game-node-menu-copy">${node.storySummaryUk || node.notes || 'Світовий вузол із маршрутами, підрядами і регіональними сервісами.'}</div>
      <div class="game-node-menu-grid">
        <div class="game-node-menu-stat">
          <span>Тип</span>
          <strong>${this.getNodeTypeLabel(node)}</strong>
        </div>
        <div class="game-node-menu-stat">
          <span>Рівень</span>
          <strong>${node.tier}</strong>
        </div>
        <div class="game-node-menu-stat">
          <span>Загроза</span>
          <strong>${node.dangerLevel}</strong>
        </div>
        <div class="game-node-menu-stat">
          <span>Гачки</span>
          <strong>${Math.min(3, node.questTags?.length || 0)}</strong>
        </div>
      </div>
      ${activeContract ? `<div class="game-node-menu-active">Активний підряд: ${activeContract.titleUk}</div>` : ''}
    `;
  }

  renderCityMenuDetail(node, section) {
    const hero = this.getSelectedHero();
    const services = this.getNodeServiceEntries(node);
    const service = services.find((entry) => entry.id === section) || null;

    if (section === 'market') {
      const stock = this.getNodeMarketStock(node).map((item) => `
        <div class="game-city-menu-row">
          <div>
            <strong>${item.name}</strong>
            <p>${item.kind} • ${item.note}</p>
          </div>
          <span class="game-city-menu-price">${item.price}g</span>
        </div>
      `).join('');
      return `
        <div class="game-city-menu-detail-copy">Ринок у Заводському працює як в оригінальному FTK: це головне місце торгівлі, де купують трави, витратники, зброю і спорядження перед рейдами. Асортимент масштабуватиметься далі разом із прогресією світу.</div>
        <div class="game-city-menu-list">${stock}</div>
      `;
    }

    if (section === 'contracts') {
      const contracts = this.getNodeContracts(node).map((contract) => `
        <div class="game-city-menu-row">
          <div>
            <strong>${contract.typeUk}: ${contract.titleUk}</strong>
            <p>${contract.objective}</p>
          </div>
          <button class="btn btn--ghost game-city-menu-action" type="button" data-node-contract="${contract.id}">Взяти • ${contract.reward}</button>
        </div>
      `).join('');
      return `
        <div class="game-city-menu-detail-copy">Дошка підрядів тримає типову FTK-структуру: нагорода за голову, доставка, повернення предмета і розвідка. Зараз у місті може бути лише один активний побічний підряд від цієї дошки.</div>
        <div class="game-city-menu-list">${contracts}</div>
      `;
    }

    if (section === 'pipesmith') {
      const pipeLevel = hero?.pipeLevel || 1;
      const cost = this.getPipeSmithCost(hero);
      return `
        <div class="game-city-menu-detail-copy">Трубочник у місті повторює оригінальну роль PipeSmith: він підвищує рівень трубки героя, щоб у майбутньому сильніше розкривати трави й пов’язані з ними ефекти.</div>
        <div class="game-city-menu-stats">
          <div class="game-city-menu-stat"><span>Поточний рівень</span><strong>${pipeLevel}/5</strong></div>
          <div class="game-city-menu-stat"><span>Наступна ціна</span><strong>${cost}g</strong></div>
        </div>
        <div class="game-city-menu-actions">
          <button class="btn btn--ghost game-city-menu-action" type="button" data-node-service="pipesmith">Покращити трубку • ${cost}g</button>
        </div>
      `;
    }

    if (service) {
      return `
        <div class="game-city-menu-detail-copy">${service.effect}</div>
        <div class="game-city-menu-stats">
          <div class="game-city-menu-stat"><span>Герой</span><strong>${hero?.name || '—'}</strong></div>
          <div class="game-city-menu-stat"><span>Ціна</span><strong>${service.cost ?? 0}g</strong></div>
          <div class="game-city-menu-stat"><span>HP</span><strong>${hero?.hp ?? 0}/${hero?.maxHp ?? 0}</strong></div>
          <div class="game-city-menu-stat"><span>Фокус</span><strong>${hero?.focus ?? 0}/${hero?.maxFocus ?? 0}</strong></div>
        </div>
        <div class="game-city-menu-actions">
          <button class="btn btn--ghost game-city-menu-action" type="button" data-node-service="${service.id}">${service.cta}${service.cost !== null ? ` • ${service.cost}g` : ''}</button>
        </div>
      `;
    }

    return `
      <div class="game-city-menu-detail-copy">${node.storySummaryUk || node.notes || 'Міське вікно з основними сервісами, ринком і дошкою підрядів.'}</div>
    `;
  }

  renderCityMenu(node) {
    const options = this.getCityMenuOptions(node);
    const activeSection = options.some((entry) => entry.id === this.game.nodeMenu.section)
      ? this.game.nodeMenu.section
      : 'market';
    this.game.nodeMenu.section = activeSection;
    const optionButtons = options.map((entry) => `
      <button class="game-city-menu-option ${entry.id === activeSection ? 'is-active' : ''}" type="button" data-node-section="${entry.id}">
        <span class="game-city-menu-icon">${entry.icon}</span>
        <span class="game-city-menu-label">${entry.labelUk}</span>
      </button>
    `).join('');

    this.dom.nodeMenu.classList.remove('is-open', 'is-city');
    this.dom.nodeMenu.innerHTML = '';
    this.dom.cityMenu.classList.add('is-open', 'is-city');
    this.dom.cityMenu.innerHTML = `
      <div class="game-city-menu-shell">
        <div class="game-city-menu-head">
          <div>
            <div class="game-city-menu-kicker">Місто</div>
            <div class="game-city-menu-title">${node.nameUk || node.nameEn}</div>
          </div>
          <button class="game-city-menu-close" type="button" data-node-close>&times;</button>
        </div>
        <div class="game-city-menu-copy">${node.storySummaryUk || node.notes || 'Головний безпечний хаб для торгівлі, лікування та підрядів.'}</div>
        <div class="game-city-menu-options">${optionButtons}</div>
        <div class="game-city-menu-detail">${this.renderCityMenuDetail(node, activeSection)}</div>
        ${this.game.nodeMenu.notice ? `<div class="game-city-menu-notice">${this.game.nodeMenu.notice}</div>` : ''}
      </div>
    `;
  }

  renderNodeMenu() {
    const node = this.game.nodeMenu.open ? this.getNodeById(this.game.nodeMenu.nodeId) : null;
    if (!node || !this.canInteractWithNode(node)) {
      this.dom.nodeMenu.classList.remove('is-open', 'is-city');
      this.dom.nodeMenu.innerHTML = '';
      this.dom.cityMenu.classList.remove('is-open', 'is-city');
      this.dom.cityMenu.innerHTML = '';
      return;
    }

    if (this.isCityNode(node)) {
      this.renderCityMenu(node);
      return;
    }

    const region = worldBlueprint.regions.find((entry) => entry.id === node.regionId) || null;
    const sections = this.getNodeMenuSections(node);
    const activeSection = sections.some((entry) => entry.id === this.game.nodeMenu.section)
      ? this.game.nodeMenu.section
      : sections[0]?.id || 'overview';
    this.game.nodeMenu.section = activeSection;
    const tabs = sections.map((entry) => `
      <button class="game-node-menu-tab ${entry.id === activeSection ? 'is-active' : ''}" type="button" data-node-section="${entry.id}">${entry.labelUk}</button>
    `).join('');

    this.dom.cityMenu.classList.remove('is-open', 'is-city');
    this.dom.cityMenu.innerHTML = '';
    this.dom.nodeMenu.classList.remove('is-city');
    this.dom.nodeMenu.classList.add('is-open');
    this.dom.nodeMenu.innerHTML = `
      <div class="game-node-menu-shell">
        <div class="game-node-menu-head">
          <div>
            <div class="game-node-menu-kicker">${this.getNodeTypeLabel(node)}</div>
            <div class="game-node-menu-title">${node.nameUk || node.nameEn}</div>
          </div>
          <button class="game-node-menu-close" type="button" data-node-close>&times;</button>
        </div>
        <div class="game-node-menu-subtitle">Рівень ${node.tier} • Загроза ${node.dangerLevel} • ${region?.nameUk || node.regionId}</div>
        <div class="game-node-menu-tabs">${tabs}</div>
        <div class="game-node-menu-body">${this.renderNodeMenuSection(node, activeSection)}</div>
        ${this.game.nodeMenu.notice ? `<div class="game-node-menu-notice">${this.game.nodeMenu.notice}</div>` : ''}
      </div>
    `;
  }

  updateObjective() {
    const nextHub = this.map.nodeById.get('main_city');
    const finalGoal = this.map.nodeById.get('main_dungeon');
    this.game.objective = nextHub
      ? `Reach ${nextHub.nameUk || nextHub.nameEn} and reopen the eastern trade route.`
      : finalGoal
        ? `Prepare for ${finalGoal.nameUk || finalGoal.nameEn}.`
        : 'Explore the overworld and establish the first route.';
  }

  updateHud(tile) {
    if (tile) this.map.selected = tile;
    const hero = this.getSelectedHero();
    const selected = this.map.selected;

    if (!selected) {
      this.dom.selectedInfo.textContent = hero?.tile ? this.getTileLabel(hero.tile) : 'No Hex';
      this.dom.selectedMeta.textContent = hero
        ? `${hero.name} | ${hero.movePoints}/${hero.maxMovePoints} move`
        : 'Select a hero';
      this.dom.selectedLore.textContent = '';
      this.dom.selectedTags.innerHTML = '';
    } else {
      const monsterPack = this.getMonsterPackAtTile(selected);
      const move = selected.terrain === 'water'
        ? 'Blocked'
        : String(Math.max(1, TERRAIN[selected.terrain].move - (selected.road ? 1 : 0)));
      const encounter = monsterPack
        ? 100
        : selected.town
        ? 0
        : selected.poi
          ? 18
          : selected.terrain === 'forest'
            ? 18
            : selected.terrain === 'mountain'
              ? 24
              : selected.terrain === 'wasteland'
                ? 16
                : selected.terrain === 'water'
                  ? 0
                  : 10;
      const parts = [`${selected.q}, ${selected.r}`];
      if (selected.terrain === 'water') parts.push('Water');
      else parts.push(`Move ${move}`);
      if (encounter > 0) parts.push(`${encounter}% risk`);
      if (selected.road) parts.push('Road');
      if (selected.town) parts.push('Town');
      if (selected.poi) parts.push(selected.poi.label);
      if (monsterPack) parts.push(`${monsterPack.members.length} monsters`);
      this.dom.selectedInfo.textContent = this.getTileLabel(selected);
      this.dom.selectedMeta.textContent = parts.join(' | ');

      const node = selected.node || null;
      const loreParts = [];
      if (node?.storySummaryUk || node?.notes) loreParts.push(node.storySummaryUk || node.notes);
      if (monsterPack) loreParts.push(this.getMonsterPackLore(monsterPack));
      this.dom.selectedLore.textContent = loreParts.join(' | ');
      this.dom.selectedTags.innerHTML = [...this.getNodeServiceLabels(node), ...this.getMonsterPackTags(monsterPack)]
        .slice(0, 6)
        .map((label) => `<span class="game-selected-tag">${label}</span>`)
        .join('');
    }

    this.dom.locationTitle.textContent = hero?.tile ? `${hero.name} | ${this.getTileLabel(hero.tile)}` : this.game.location;
    this.updateClockHud();
    this.renderMovePips();
    this.updateActionButtons();
    this.renderNodeMenu();
  }
}
