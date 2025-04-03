import { app } from 'qoishi'

declare module 'qoishi' {
  interface Events {
    preload(): void
  }
}

window.document.addEventListener('DOMContentLoaded', () => {
  const script = window.document.createElement('script')
  script.type = 'module'
  script.src = 'local:///packages/loader/dist/renderer.js'
  window.document.head.prepend(script)
})

app.emit('preload')
