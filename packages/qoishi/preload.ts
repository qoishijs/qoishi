import type { Context } from 'cordis'
import { contextBridge, ipcRenderer } from 'electron/renderer'

export const name = 'qoishi'

declare global {
  interface Window {
    baseDir: string
  }
}

export async function apply(ctx: Context) {
  const baseDir = ipcRenderer.sendSync('qoishi.baseDir')
  ctx.set('baseDir', baseDir)
  contextBridge.exposeInMainWorld('baseDir', baseDir)
}
