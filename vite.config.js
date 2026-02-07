import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, readdirSync, existsSync, statSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

function copyDir(src, dest) {
  if (!existsSync(src)) return
  mkdirSync(dest, { recursive: true })
  for (const name of readdirSync(src)) {
    const srcPath = join(src, name)
    const destPath = join(dest, name)
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-public-data',
      closeBundle() {
        const publicData = join(__dirname, 'public', 'data')
        const buildData = join(__dirname, 'build', 'data')
        if (existsSync(publicData)) {
          copyDir(publicData, buildData)
          console.log('✅ Скопировано public/data → build/data')
        }
      },
    },
  ],
  publicDir: 'public',
  build: {
    outDir: 'build',
  },
})
