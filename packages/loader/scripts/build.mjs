import { argv, exit } from 'node:process'
import { build, context } from 'esbuild'

const watch = argv.includes('--watch')
let flag = watch

function log(...args) {
  if (watch) {
    args.unshift('[watch]')
  }
  console.log(...args)
}

const ctx = await context({
  entryPoints: ['./shared', './node/*', './browser/*'],
  outdir: 'dist',
  external: ['electron', './*'],
  platform: 'node',
  bundle: true,
  format: 'esm',
  splitting: true,
  metafile: true,
  plugins: [{
    name: 'postbuild:esm2cjs',
    setup({ onStart, onEnd }) {
      onStart(() => {
        log('build started')
      })
      onEnd(async ({ metafile }) => {
        await Promise.all(Object.keys(metafile.outputs)
          .filter(path => path.endsWith('.js') && !path.includes('/browser/'))
          .map(path => build({
            entryPoints: [path],
            outfile: path,
            allowOverwrite: true,
            format: 'cjs',
            logLevel: 'error',
          })))
        let message = 'build finished'
        if (flag) {
          message += ', watching for changes...'
          flag = false
        }
        console.log(message)
      })
    },
  }],
})

if (!watch) {
  await ctx.rebuild()
  exit(0)
}

await ctx.watch()
