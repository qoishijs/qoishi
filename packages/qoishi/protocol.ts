import type { Context } from 'cordis'
import { join } from 'node:path'
import { app, net, protocol } from 'electron/main'

export const name = 'protocol'

export function apply(ctx: Context) {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'local',
      privileges: {
        standard: false,
        allowServiceWorkers: true,
        corsEnabled: false,
        supportFetchAPI: true,
        stream: true,
        bypassCSP: true,
      },
    },
  ])

  app.on('ready', () => {
    const schemes = app.commandLine.getSwitchValue('fetch-schemes')
    app.commandLine.appendSwitch('fetch-schemes', `${schemes},local`)
  })

  app.on('browser-window-created', (_, window) => {
    const protocol = window.webContents.session.protocol
    if (!protocol.isProtocolHandled('local')) {
      protocol.handle('local', (request) => {
        const { host, pathname } = new URL(decodeURI(request.url))
        switch (host) {
          default: return net.fetch(`file:///${join(ctx.baseDir, pathname)}`)
        }
      })
    }
  })
}
