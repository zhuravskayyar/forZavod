export class BaseScene {
  constructor({ id, store, router }) {
    this.id = id;
    this.store = store;
    this.router = router;
    this.initialized = false;
    this.active = false;
    this.el = document.getElementById(`scene-${id}`);
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
  }

  async enter(_payload = {}) {
    this.active = true;
  }

  async exit() {
    this.active = false;
  }

  update(_dt) {}

  render() {}
}
