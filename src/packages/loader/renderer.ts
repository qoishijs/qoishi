import { app } from 'qoishi'
import './components'

declare module 'qoishi' {
  interface Events {
    render(): void
  }
}

app.emit('render')

console.log('RENDERER INSTALLED')
