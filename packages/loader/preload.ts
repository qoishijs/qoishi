import { Context } from 'qoishi'
import * as qoishi from 'qoishi/preload'

const app = new Context()
app.plugin(qoishi)
app.start()

window.document.addEventListener('DOMContentLoaded', () => {
  const script = window.document.createElement('script')
  script.type = 'module'
  script.src = 'local:///packages/loader/dist/renderer.js'
  window.document.head.prepend(script)
})
