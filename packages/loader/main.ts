import { join } from 'node:path'
import process from 'node:process'
import electron from 'electron/main'
import { Context } from 'qoishi'
import * as qoishi from 'qoishi/main'

const app = new Context()
app.plugin(qoishi)
app.start()

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

electron.app.on('browser-window-created', (_, window) => {
  // window.webContents.send = new Proxy(window.webContents.send, {
  //   apply(target, thisArg, [channel, ...args]: [string, ...any[]]) {
  //     // if (channel.includes('IPC_DOWN_')) {
  //     //   if (args?.[1]?.[0]?.cmdName === 'nodeIKernelSessionListener/onSessionInitComplete') {
  //     //     const uid = args[1][0].payload.uid
  //     //     app.emit('login', uid)
  //     //   }
  //     // }
  //     return Reflect.apply(target, thisArg, [channel, ...args])
  //   },
  // })

  // @ts-ignore
  window.webContents._getPreloadPaths = new Proxy(window.webContents._getPreloadPaths, {
    apply(target, thisArg, argArray) {
      return (Reflect.apply(target, thisArg, argArray) as string[])
        .concat(join(__dirname, './preload.js'))
    },
  })
})
