export class Store {
  constructor(initialState = {}) {
    this.state = structuredClone(initialState);
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  setState(nextState) {
    this.state = nextState;
    this.emit();
  }

  update(updater) {
    const nextState = updater(structuredClone(this.state));
    this.state = nextState;
    this.emit();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
