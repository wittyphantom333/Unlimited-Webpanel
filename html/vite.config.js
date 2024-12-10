import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

import { fileURLToPath, URL } from 'url'
import { externalHosting } from '../common/externalHosting'

export default defineConfig({
  base: externalHosting.base,
  build: {
    outDir: '../resource/html/',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        app: './index.html',
        externalHosting: '../common/externalHosting.js',
      },
      output: {
        entryFileNames: assetInfo =>
          assetInfo.name === 'externalHosting'
            ? 'assets/[name].js'
            : 'assets/[name]-[hash].js',
      },
    },
  },
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar({
      sassVariables: 'src/@core/styles/quasar-variables.sass',
    }),
  ],
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/@core', import.meta.url)),
      '@libs': fileURLToPath(new URL('./src/@core/libs', import.meta.url)),
      '@axios': fileURLToPath(
        new URL('./src/@core/libs/axios', import.meta.url)
      ),
      '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
    },
  },
})
