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
  process.stderr.write('dist/assets not found. Run "npm run build" first.\n')
  process.exit(1)
}

let total = 0
for (const file of files) {
  const size = gzipSync(readFileSync(join(dir, file))).length
  total += size
  process.stdout.write(`${file}: ${(size / 1024).toFixed(1)} KB gzip\n`)
}
const totalKb = total / 1024
process.stdout.write(`Total JS: ${totalKb.toFixed(1)} KB gzip (limit ${LIMIT_KB} KB)\n`)
if (totalKb > LIMIT_KB) {
  process.stderr.write('Bundle budget exceeded.\n')
  process.exit(1)
}
