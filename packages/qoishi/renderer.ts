import type { Context } from 'cordis'
import {} from './preload'

export const name = 'qoishi'

export function apply(ctx: Context) {
  ctx.set('baseDir', window.baseDir)
}
