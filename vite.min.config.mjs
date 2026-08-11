import fs from 'fs'
import { resolve } from 'path'
import { babel } from '@rollup/plugin-babel'
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
const banner = `/*! Currencies Mepto v${pkg.version} — Mepto-integrated, jQuery-free */\n`
export default {
  build: {
    lib: {
      entry: resolve('src/index.js'),
      name: 'Currency',
      formats: ['es', 'iife'],
      fileName: format => (format === 'es' ? 'currencies.esm.min.js' : 'currencies.pkgd.min.js'),
    },
    outDir: 'dist',
    emptyOutDir: false,
    target: 'esnext',
    rollupOptions: {
      external: ['mepto', 'jquery'],
      output: {
        banner,
        globals: { mepto: 'mepto', jquery: 'jQuery' },
      },
      plugins: [
        babel({
          babelHelpers: 'bundled',
          extensions: ['.js'],
          exclude: /node_modules/,
        }),
      ],
    },
    minify: 'esbuild',
    esbuildOptions: { legalComments: 'inline' },
  },
}
