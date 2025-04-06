import type { Context } from 'cordis'
import { join } from 'node:path'
import { ipcMain } from 'electron/main'
import * as protocol from './protocol'

export const name = 'qoishi'

export function apply(ctx: Context) {
  ctx.plugin(protocol)
  const baseDir = join(__dirname, '../../..')
  ctx.set('baseDir', baseDir)
  ipcMain.on('qoishi.baseDir', (event) => {
    event.returnValue = baseDir
  })
}
