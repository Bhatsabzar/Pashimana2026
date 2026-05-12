import { defineConfig, transformWithEsbuild } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    {
      name: 'treat-src-js-as-jsx',
      enforce: 'pre',
      async transform(code, id) {
        const normalized = id.replace(/\\/g, '/')
        if (!normalized.includes('/src/')) return null
        if (!normalized.endsWith('.js')) return null
        if (normalized.includes('node_modules')) return null
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        })
      },
    },
    react(),
  ],
})
