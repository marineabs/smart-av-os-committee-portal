import { constants } from 'node:fs'
import { access, copyFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentFile = fileURLToPath(import.meta.url)
const distDir = join(dirname(currentFile), '..', 'dist')
const indexPath = join(distDir, 'index.html')
const fallbackPath = join(distDir, '404.html')

try {
  await access(indexPath, constants.F_OK)
  await copyFile(indexPath, fallbackPath)
  process.stdout.write('postbuild: copied dist/index.html to dist/404.html\n')
} catch {
  process.stdout.write('postbuild: dist/index.html not found, skip 404 fallback\n')
}
