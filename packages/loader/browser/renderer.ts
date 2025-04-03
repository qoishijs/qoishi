import { app } from '../shared'
import './components'

declare module 'qoishi' {
  interface Events {
    render(): void
  }
}

app.emit('render')
