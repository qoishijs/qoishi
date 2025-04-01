import { app } from 'qoishi'

const [styleSheet, templates] = await Promise.all([
    fetch('local:///src/packages/loader/static/style.css')
      .then(async (response) => {
        const sheet = new CSSStyleSheet()
        await sheet.replace(await response.text())
        return sheet
      }),
    fetch('local:///src/packages/loader/static/template.html')
      .then(response => response.text())
      .then(string => new DOMParser().parseFromString(string, 'text/html')),
  ])

  export class SettingElement extends HTMLElement {
    declare shadowRoot: ShadowRoot
    _template: HTMLTemplateElement
    _slot: HTMLSlotElement

    constructor(elementId: string) {
      super()
      this.attachShadow({ mode: 'open' })
      this._template = templates.getElementById(elementId) as HTMLTemplateElement
      this._slot = this.shadowRoot.querySelector('slot')!
      this.shadowRoot.append(this._template.content.cloneNode(true))
      this.shadowRoot.adoptedStyleSheets = [styleSheet]
    }

    attributeChangedCallback() {
      this.settingUpdate()
    }

    settingUpdate() {}
  }

  customElements.define('setting-section', class extends SettingElement {
    _title: HTMLHeadElement

    static observedAttributes = ['data-title']
    constructor() {
      super('setting-section')
      this._title = this.shadowRoot.querySelector('h1')!
      this.settingUpdate()
    }

    override settingUpdate() {
      this._title.textContent = this.dataset.title!
    }
  })

  customElements.define('setting-panel', class extends SettingElement {
    constructor() {
      super('setting-panel')
    }
  })

  customElements.define('setting-list', class extends SettingElement {
    _head: SettingItem
    _title: HTMLHeadingElement
    _slot: HTMLSlotElement

    static observedAttributes = ['data-title', 'data-direction', 'is-collapsible', 'is-active', 'is-disabled']
    constructor() {
      super('setting-list')
      this._head = this.shadowRoot.querySelector('setting-item')!
      this._title = this.shadowRoot.querySelector('h2')!
      this._slot = this.shadowRoot.querySelector('slot')!
      this._head.addEventListener('click', () => this.toggleAttribute('is-active'))
      this.settingUpdate()
      new MutationObserver((_, observer) => {
        observer.disconnect()
        this.settingUpdate()
        observer.observe(this, { childList: true })
      }).observe(this, { childList: true })
    }

    override settingUpdate() {
      this._title.textContent = this.dataset.title!
      const slotChildren = this._slot.assignedElements() as HTMLElement[]
      this.querySelectorAll('setting-divider').forEach(node => node.remove())
      const isCollapsible = this.hasAttribute('is-collapsible')
      this._head.classList.toggle('hidden', !isCollapsible)
      slotChildren.forEach((node, index) => {
        const setting_divider = document.createElement('setting-divider')
        if (this.dataset.direction === 'column') {
          setting_divider.dataset.direction = 'row'
          node.dataset.direction = 'row'
        }
        if (!isCollapsible && this.dataset.direction === 'row') {
          setting_divider.dataset.direction = 'column'
          node.dataset.direction = 'column'
        }
        if (index + Number(!isCollapsible) < slotChildren.length) {
          node.after(setting_divider)
        }
      })
    }
  })

  class SettingItem extends SettingElement {
    static observedAttributes = ['data-direction']
    constructor() {
      super('setting-item')
    }
  }
  customElements.define('setting-item', SettingItem)

  customElements.define('setting-select', class extends SettingElement {
    _title: HTMLInputElement
    _button: HTMLButtonElement
    _context: HTMLUListElement

    static observedAttributes = ['is-disabled']
    constructor() {
      super('setting-select')
      this._title = this.shadowRoot.querySelector('input')!
      this._button = this.shadowRoot.querySelector('.menu-button')!
      this._context = this.shadowRoot.querySelector('ul')!
      const click = () => {
        const pointerup = (event) => {
          if (event.target.tagName !== 'SETTING-SELECT') {
            click()
          }
        }
        this._context.classList.toggle('hidden')
        if (!this._context.classList.contains('hidden')) {
          window.addEventListener('pointerup', pointerup)
          this._context.style.width = getComputedStyle(this).getPropertyValue('width')
        }
        else {
          window.removeEventListener('pointerup', pointerup)
          this._context.style.width = null!
        }
      }
      this._button.addEventListener('click', click)
      this._context.addEventListener('click', (event) => {
        const target = event.target as HTMLElement
        if (target.tagName === 'SETTING-OPTION' && !target.hasAttribute('is-selected')) {
          for (const node of this.querySelectorAll('setting-option[is-selected]')) {
            node.toggleAttribute('is-selected')
          }
          target.toggleAttribute('is-selected')
          this._title.value = target.textContent!
          this.dispatchEvent(new CustomEvent('selected', {
            bubbles: true,
            composed: true,
            detail: {
              name: target.textContent,
              value: target.dataset.value,
            },
          }))
        }
      })
      this._title.value = this.querySelector('setting-option[is-selected]')!.textContent!
    }
  })

  customElements.define('setting-option', class extends SettingElement {
    static observedAttributes = ['data-value', 'is-selected', 'is-disabled']
    constructor() {
      super('setting-option')
    }
  })

  customElements.define('setting-switch', class extends SettingElement {
    static observedAttributes = ['is-active', 'is-disabled']
    constructor() {
      super('setting-switch')
    }
  })

  customElements.define('setting-button', class extends SettingElement {
    static observedAttributes = ['data-type', 'is-disabled']
    constructor() {
      super('setting-button')
    }
  })

  customElements.define('setting-text', class extends SettingElement {
    static observedAttributes = ['data-type']
    constructor() {
      super('setting-text')
    }
  })

  customElements.define('setting-link', class extends SettingElement {
    static observedAttributes = ['data-value']
    constructor() {
      super('setting-link')
      this.addEventListener('click', () => {
        if (this.dataset.value) {
          app.inject(['shell'], () => app.shell.openExternal(this.dataset.value!))
        }
      })
    }
  })

  customElements.define('setting-divider', class extends SettingElement {
    static observedAttributes = ['data-direction']
    constructor() {
      super('setting-divider')
    }
  })

  customElements.define('setting-modal', class extends SettingElement {
    _title: HTMLDivElement
    _close: SVGElement
    _modal: HTMLDivElement

    static observedAttributes = ['data-title', 'is-active']
    constructor() {
      super('setting-modal')
      this._title = this.shadowRoot.querySelector('.title')!
      this._close = this.shadowRoot.querySelector('.close')!
      this._modal = this.shadowRoot.querySelector('.modal')!
      this._close.addEventListener('click', () => this.toggleAttribute('is-active'))
      this._modal.addEventListener('click', () => this.toggleAttribute('is-active'))
      this.settingUpdate()
    }

    override settingUpdate() {
      this._title.textContent = this.dataset.title!
    }
  })
