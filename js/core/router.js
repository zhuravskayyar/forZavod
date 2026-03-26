export class Router {
  constructor({ store }) {
    this.store = store;
    this.scenes = new Map();
    this.currentSceneId = null;
    this.isTransitioning = false;
  }

  register(id, scene) {
    this.scenes.set(id, scene);
  }

  current() {
    return this.currentSceneId;
  }

  async go(id, payload = {}) {
    if (this.isTransitioning) return;
    if (!this.scenes.has(id)) {
      throw new Error(`Scene "${id}" is not registered`);
    }

    this.isTransitioning = true;

    try {
      const prevId = this.currentSceneId;
      const nextScene = this.scenes.get(id);

      if (prevId) {
        const prevScene = this.scenes.get(prevId);
        if (prevScene) {
          await prevScene.exit();
        }
      }

      document.querySelectorAll('.scene.is-active').forEach((el) => {
        el.classList.remove('is-active');
      });

      const nextEl = document.getElementById(`scene-${id}`);
      if (!nextEl) {
        throw new Error(`DOM scene container "#scene-${id}" not found`);
      }

      nextEl.classList.add('is-active');
      this.currentSceneId = id;

      this.store.update((state) => {
        state.app.currentScene = id;
        return state;
      });

      await nextScene.enter(payload);
    } finally {
      this.isTransitioning = false;
    }
  }
}
