import type { Context } from 'cordis'
import {} from './preload'

export const name = 'qoishi'

export function apply(ctx: Context) {
  console.log('apply qoishi/renderer', ctx)
  console.log('window.baseDir', window.baseDir)
  ctx.set('baseDir', window.baseDir)
}
