// Fails when the production JS payload (initial + lazy chunks) exceeds the gzip budget.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const LIMIT_KB = 150
const dir = join(process.cwd(), 'dist', 'assets')

let files
try {
  files = readdirSync(dir).filter((f) => f.endsWith('.js'))
} catch {
  console.error('dist/assets not found. Run "npm run build" first.')
  process.exit(1)
}

let total = 0
for (const file of files) {
  const size = gzipSync(readFileSync(join(dir, file))).length
  total += size
  console.log(`${file}: ${(size / 1024).toFixed(1)} KB gzip`)
}
const totalKb = total / 1024
console.log(`Total JS: ${totalKb.toFixed(1)} KB gzip (limit ${LIMIT_KB} KB)`)
if (totalKb > LIMIT_KB) {
  console.error('Bundle budget exceeded.')
  process.exit(1)
}
