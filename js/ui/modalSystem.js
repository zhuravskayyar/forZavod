export class ModalSystem {
  constructor({ root, onOpen = null, onClose = null } = {}) {
    if (!root) {
      throw new Error('ModalSystem requires a root element');
    }
    this.root = root;
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.configs = {};
    this.activeModalId = null;
    this.activeTabId = null;
    this.runtime = {};

    this.dom = {
      eyebrow: root.querySelector('[data-modal-eyebrow]'),
      title: root.querySelector('[data-modal-title]'),
      subtitle: root.querySelector('[data-modal-subtitle]'),
      toolbar: root.querySelector('[data-modal-toolbar]'),
      body: root.querySelector('[data-modal-body]'),
      footerNote: root.querySelector('[data-modal-footer-note]'),
      footerActions: root.querySelector('[data-modal-footer-actions]'),
    };

    this.root.addEventListener('click', (event) => this.handleClick(event));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen()) this.close();
    });
  }

  setConfigs(configs = {}) {
    this.configs = configs;
    if (this.isOpen()) this.render();
  }

  isOpen() {
    return Boolean(this.activeModalId);
  }

  getActiveModalId() {
    return this.activeModalId;
  }

  getActiveTabId() {
    return this.activeTabId;
  }

  getResolvedConfig() {
    if (!this.activeModalId) return null;
    const base = this.configs[this.activeModalId] || {};
    return {
      ...base,
      ...this.runtime,
      tabs: this.runtime.tabs || base.tabs || [],
      footerActions: this.runtime.footerActions || base.footerActions || [],
      renderBody: this.runtime.renderBody || base.renderBody || (() => ''),
      onBodyAction: this.runtime.onBodyAction || base.onBodyAction || null,
    };
  }

  getHelpers() {
    return {
      modalId: this.activeModalId,
      tabId: this.activeTabId,
      runtime: this.runtime,
      close: () => this.close(),
      reopen: (modalId, runtime = {}) => this.open(modalId, runtime),
      rerender: (runtimePatch = null) => {
        if (runtimePatch && typeof runtimePatch === 'object') {
          this.runtime = { ...this.runtime, ...runtimePatch };
        }
        this.render();
      },
    };
  }

  open(modalId, runtime = {}) {
    const base = this.configs[modalId];
    if (!base && !runtime.renderBody) {
      throw new Error(`Unknown modal config "${modalId}"`);
    }
    this.activeModalId = modalId;
    this.runtime = runtime;
    const config = this.getResolvedConfig();
    this.activeTabId = runtime.defaultTab || config.defaultTab || config.tabs?.[0]?.id || null;
    this.render();
    this.root.classList.add('is-open');
    this.root.setAttribute('aria-hidden', 'false');
    if (typeof this.onOpen === 'function') this.onOpen(modalId, config);
  }

  close() {
    if (!this.isOpen()) return;
    const modalId = this.activeModalId;
    this.root.classList.remove('is-open');
    this.root.setAttribute('aria-hidden', 'true');
    this.activeModalId = null;
    this.activeTabId = null;
    this.runtime = {};
    if (typeof this.onClose === 'function') this.onClose(modalId);
  }

  renderToolbar(config) {
    const tabs = config.tabs || [];
    if (!tabs.length) {
      this.dom.toolbar.classList.add('is-hidden');
      this.dom.toolbar.innerHTML = '';
      return;
    }
    this.dom.toolbar.classList.remove('is-hidden');
    this.dom.toolbar.innerHTML = tabs.map((tab) => `
      <button class="ftk-modal-tab ${tab.id === this.activeTabId ? 'is-active' : ''}" type="button" data-modal-tab="${tab.id}">
        ${tab.label}
      </button>
    `).join('');
  }

  renderFooter(config) {
    const footerActions = config.footerActions || [];
    this.dom.footerNote.textContent = config.footerNote || '';
    this.dom.footerActions.innerHTML = footerActions.map((action, index) => {
      const variant = action.variant || 'ghost';
      return `
        <button class="ftk-modal-btn ftk-modal-btn--${variant}" type="button" data-modal-footer-action="${index}">
          ${action.label}
        </button>
      `;
    }).join('');
  }

  render() {
    const config = this.getResolvedConfig();
    if (!config) return;
    this.dom.eyebrow.textContent = config.eyebrow || 'Service';
    this.dom.title.textContent = config.title || 'Modal';
    this.dom.subtitle.textContent = config.subtitle || '';
    this.renderToolbar(config);
    this.renderFooter(config);
    this.dom.body.innerHTML = config.renderBody(this.activeTabId, this.getHelpers()) || '';
  }

  handleClick(event) {
    if (event.target.closest('[data-close-modal]')) {
      this.close();
      return;
    }
    const config = this.getResolvedConfig();
    if (!config) return;

    const tabButton = event.target.closest('[data-modal-tab]');
    if (tabButton) {
      this.activeTabId = tabButton.dataset.modalTab;
      this.render();
      return;
    }

    const footerButton = event.target.closest('[data-modal-footer-action]');
    if (footerButton) {
      const action = config.footerActions?.[Number(footerButton.dataset.modalFooterAction)];
      if (!action) return;
      if (typeof action.onClick === 'function') action.onClick(this.getHelpers());
      if (action.close) this.close();
      return;
    }

    const bodyAction = event.target.closest('[data-modal-action]');
    if (bodyAction && typeof config.onBodyAction === 'function') {
      config.onBodyAction(bodyAction.dataset, this.getHelpers(), event);
    }
  }
}
