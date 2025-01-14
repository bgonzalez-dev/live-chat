import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['events', 'stream', 'string_decoder']
    })
  ],
  resolve: {
    alias: {
      'node-fetch': 'isomorphic-fetch',
    },
  },
  optimizeDeps: {
    include: ['@xmpp/client', '@xmpp/debug'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  }
})

