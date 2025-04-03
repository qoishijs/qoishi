import type { BrowserWindow } from 'electron'
import { join } from 'node:path'
import process from 'node:process'
import { app } from '../shared'
import * as protocol from './protocol'
import ShellService from './shell'

declare module 'qoishi' {
  interface Events {
    'window-created'(window: BrowserWindow): void
    'ipc-message'(channel: string, ...args: any[]): void
  }
}

app.set('baseDir', join(__dirname, '..', '..', '..', '..'))

app.plugin(protocol)
app.plugin(ShellService)

// eslint-disable-next-line ts/no-require-imports
require(join(process.resourcesPath, 'app/app_launcher/index.js'))

setImmediate(() => {
  // eslint-disable-next-line ts/no-require-imports
  const version = require(join(process.resourcesPath, 'app/package.json')).buildVersion
  // @ts-ignore
  globalThis.launcher.installPathPkgJson.main
    = version >= 29271
      ? './application.asar/app_launcher/index.js'
      : version >= 28060
        ? './application/app_launcher/index.js'
        : './app_launcher/index.js'
})

function onWindowConstructed(window: BrowserWindow) {
  window.webContents.send = new Proxy(window.webContents.send, {
    apply(target, thisArg, [channel, ...args]: [string, ...any[]]) {
      app.emit('ipc-message', channel, ...args)
      // if (channel.includes('IPC_DOWN_')) {
      //   if (args?.[1]?.[0]?.cmdName === 'nodeIKernelSessionListener/onSessionInitComplete') {
      //     const uid = args[1][0].payload.uid
      //     app.emit('login', uid)
      //   }
      // }
      return Reflect.apply(target, thisArg, [channel, ...args])
    },
  })

  // @ts-ignore
  window.webContents._getPreloadPaths = new Proxy(window.webContents._getPreloadPaths, {
    apply(target, thisArg, argArray) {
      return (Reflect.apply(target, thisArg, argArray) as string[])
        .concat(join(__dirname, './preload.js'))
    },
  })

  app.emit('window-created', window)
}

// @ts-ignore
require.cache.electron = new Proxy(require.cache.electron, {
  get(target, property, receiver) {
    const electron = Reflect.get(target, property, receiver)
    // eslint-disable-next-line style/multiline-ternary
    return property !== 'exports' ? electron : new Proxy(electron, {
      get(target, property, receiver) {
        const BrowserWindow = Reflect.get(target, property, receiver)
        // eslint-disable-next-line style/multiline-ternary
        return property !== 'BrowserWindow' ? BrowserWindow : new Proxy(BrowserWindow, {
          construct(target, argArray, newTarget) {
            const window = Reflect.construct(target, argArray, newTarget)
            onWindowConstructed(window)
            return window
          },
        })
      },
    })
  },
})
