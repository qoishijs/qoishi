import type { Context } from 'qoishi'
import { app, net, protocol } from 'electron'

export const name = 'protocol'

export function apply(ctx: Context) {
  app.on('ready', () => {
    const schemes = app.commandLine.getSwitchValue('fetch-schemes')
    app.commandLine.appendSwitch('fetch-schemes', `${schemes},local`)
  })

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

  ctx.on('window-created', (window) => {
    const protocol = window.webContents.session.protocol
    if (!protocol.isProtocolHandled('local')) {
      protocol.handle('local', (request) => {
        const { host, pathname } = new URL(decodeURI(request.url))
        switch (host) {
          default: return net.fetch(`file:///${ctx.baseDir}${pathname}`)
        }
      })
    }
  })
}
