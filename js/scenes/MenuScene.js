import { BaseScene } from './BaseScene.js';
import { GAME_STATES } from '../core/gameStates.js';

const APP_BASE_URL = new URL('../../', import.meta.url);
const LOBBY_DOC_URL = new URL('fantasy_coop_lobby_localized.html', APP_BASE_URL);
const UI_PLACEHOLDER_URL = new URL('assets/ui/icon-placeholder.svg', APP_BASE_URL);
const LOBBY_BG_URL = new URL('assets/lobby/menu_background.webp', APP_BASE_URL);

export class MenuScene extends BaseScene {
  constructor(ctx) {
    super({ id: 'menu', ...ctx });
    this.isStarting = false;
    this.startButton = null;
    this.onLobbyStart = this.handleLobbyStart.bind(this);
  }

  async init() {
    if (this.initialized) return;
    super.init();

    // Load external localized lobby HTML and inject it into scene
    try {
      const resp = await fetch(LOBBY_DOC_URL);
      const text = await resp.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      // Inject head styles/links
      const headLinks = doc.querySelectorAll('head link[rel="stylesheet"], head style');
      headLinks.forEach((node) => {
        if (node.tagName === 'LINK') {
          const href = node.getAttribute('href');
          if (href && !document.head.querySelector(`link[href="${href}"]`)) {
            const l = document.createElement('link');
            l.rel = 'stylesheet';
            l.href = href;
            document.head.appendChild(l);
          }
        } else if (node.tagName === 'STYLE') {
          // avoid duplicating identical styles
          const clone = node.cloneNode(true);
          document.head.appendChild(clone);
        }
      });

      // Inject body markup
      this.el.innerHTML = doc.body.innerHTML;

      // Execute scripts from fetched document
      const scripts = doc.querySelectorAll('script');
      const base = LOBBY_DOC_URL;
      scripts.forEach((s) => {
        const newScript = document.createElement('script');
        if (s.src) {
          try {
            const src = new URL(s.getAttribute('src'), base).href;
            newScript.src = src;
            newScript.async = false;
            document.body.appendChild(newScript);
          } catch (e) {
            console.warn('Failed to append external script', e);
          }
        } else {
          newScript.textContent = s.textContent;
          document.body.appendChild(newScript);
        }
      });

      // Wire a Start -> router.go('world') fallback if the injected markup has a start button
      const findStartButton = () => {
        const lobbyStart = this.el.querySelector('#startBtn');
        if (lobbyStart) return lobbyStart;
        const byId = this.el.querySelector('#start-adventure-btn');
        if (byId) return byId;
        const primary = Array.from(this.el.querySelectorAll('.btn-action, .btn')).find((b) => {
          const t = (b.textContent || '').trim().toLowerCase();
          return /start|почат|старт|розпоч/i.test(t);
        });
        return primary || null;
      };

      this.startButton = findStartButton();
      window.addEventListener('hero:lobby-start', this.onLobbyStart);
      if (this.startButton) {
        this.startButton.addEventListener('click', () => {
          setTimeout(async () => {
            if (!this.active || this.isStarting) return;
            if (this.startButton?.disabled) return;
            const payload = typeof window.getLobbyStartPayload === 'function'
              ? window.getLobbyStartPayload()
              : {};
            await this.startAdventureWithLobbyState(payload);
          }, 0);
        });
      }

      // Ensure missing images show a local SVG placeholder instead of broken icon
      const imgFallbackPath = UI_PLACEHOLDER_URL.href;
      this.el.querySelectorAll('img').forEach((img) => {
        // if image already failed earlier, set placeholder
        if (!img.complete || img.naturalWidth === 0) {
          img.src = imgFallbackPath;
        }
        img.addEventListener('error', () => {
          img.src = imgFallbackPath;
        });
      });

      // Apply custom menu background if asset exists — try webp, jpg, png
      const tryExtensions = async (basePath) => {
        const exts = ['webp', 'jpg', 'png'];
        for (const e of exts) {
          const candidate = basePath.replace(/\.(webp|jpg|png)$/i, '') + '.' + e;
          // test by loading image
          const ok = await new Promise((res) => {
            const img = new Image();
            img.onload = () => res(true);
            img.onerror = () => res(false);
            img.src = candidate;
          });
          if (ok) return candidate;
        }
        return null;
      };

      (async () => {
        const found = await tryExtensions(LOBBY_BG_URL.href);
        if (found) {
          const bgEl = this.el.querySelector('#bgImage') || document.getElementById('bgImage');
          if (bgEl) bgEl.style.backgroundImage = `url('${found}')`;
        }
      })();
    } catch (err) {
      console.error('Failed to load lobby HTML:', err);
      // fallback to simple menu
      this.el.innerHTML = `
        <div class="menu-shell">
          <div class="menu-panel">
            <h1 class="menu-title">Heroes Game</h1>
            <p class="menu-subtitle">Fallback menu — failed to load lobby.</p>
            <div class="menu-actions">
              <button id="start-adventure-btn" class="btn">Start Adventure</button>
            </div>
          </div>
        </div>`;

      const btn = this.el.querySelector('#start-adventure-btn');
      btn.addEventListener('click', async () => await this.startAdventure());
    }
  }

  async startAdventure() {
    return this.startAdventureWithLobbyState({});
  }

  async enter(payload = {}) {
    await super.enter(payload);
    this.store.update((state) => {
      state.app.gameState = GAME_STATES.MAIN_MENU;
      return state;
    });
  }

  async handleLobbyStart(event) {
    if (!this.active || this.isStarting) return;
    const detail = event?.detail || {};
    await this.startAdventureWithLobbyState(detail);
  }

  async startAdventureWithLobbyState(lobbyState = {}) {
    if (this.isStarting) return;

    this.isStarting = true;
    if (this.startButton) this.startButton.disabled = true;

    try {
      this.store.update((state) => {
        state.world.seed = lobbyState.seed || Date.now().toString(36);
        state.world.difficulty = lobbyState.difficulty || 'adventurer';
        state.world.party = structuredClone(lobbyState.party || []);
        state.world.lobbyCode = lobbyState.lobbyCode || null;
        state.world.createdAt = Date.now();
        return state;
      });

      await this.router.go('world', { freshStart: true, lobbyState });
    } catch (error) {
      console.error('[MenuScene] startAdventure failed', error);
      if (this.startButton) this.startButton.disabled = false;
      this.isStarting = false;
      return;
    }

    if (this.startButton) this.startButton.disabled = false;
    this.isStarting = false;
  }
}
