import { Store } from './core/store.js?v=20260326-turnfix1';
import { Router } from './core/router.js?v=20260326-turnfix1';
import { GAME_STATES } from './core/gameStates.js';
import { MenuScene } from './scenes/MenuScene.js?v=20260326-turnfix1';
import { WorldScene } from './scenes/WorldScene.js?v=20260326-turnfix1';

window.__HERO_APP__ = true;

const initialState = {
  app: {
    booted: false,
    currentScene: null,
    gameState: GAME_STATES.MAIN_MENU,
  },
  world: {
    seed: null,
    difficulty: 'adventurer',
    party: [],
    lobbyCode: null,
    createdAt: null,
    day: 1,
    gold: 26,
    activeContract: null,
    interfaceState: GAME_STATES.WORLD_MAP,
    clearedNodes: [],
    discoveredNodes: [],
    shopStockByNode: {},
  },
};

function readPendingLobbyStart() {
  try {
    const raw = sessionStorage.getItem('hero.pendingLobbyStart');
    if (!raw) return null;
    sessionStorage.removeItem('hero.pendingLobbyStart');
    return JSON.parse(raw);
  } catch (error) {
    console.warn('[App] failed to read pending lobby start', error);
    return null;
  }
}

async function boot() {
  const store = new Store(initialState);
  const router = new Router({ store });

  const ctx = { store, router };

  const menuScene = new MenuScene(ctx);
  const worldScene = new WorldScene(ctx);

  menuScene.init();
  worldScene.init();

  router.register('menu', menuScene);
  router.register('world', worldScene);

  store.update((state) => {
    state.app.booted = true;
    return state;
  });

  const pendingLobbyStart = readPendingLobbyStart();
  if (pendingLobbyStart) {
    store.update((state) => {
      state.world.seed = pendingLobbyStart.seed || Date.now().toString(36);
      state.world.difficulty = pendingLobbyStart.difficulty || 'adventurer';
      state.world.party = structuredClone(pendingLobbyStart.party || []);
      state.world.lobbyCode = pendingLobbyStart.lobbyCode || null;
      state.world.createdAt = Date.now();
      return state;
    });

    await router.go('world', { freshStart: true, lobbyState: pendingLobbyStart });
  } else {
    await router.go('menu');
  }

  console.log('[App] boot complete');
}

boot().catch((error) => {
  console.error('[App] boot failed', error);
});
