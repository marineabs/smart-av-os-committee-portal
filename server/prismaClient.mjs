import fs from 'node:fs'
import path from 'node:path'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@prisma/client'

export function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) {
    return
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/g)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue
    }

    const [key, ...rest] = trimmed.split('=')
    const value = rest.join('=').trim().replace(/^"|"$/g, '')
    process.env[key.trim()] ??= value
  }
}

export function createPrismaClient() {
  loadEnvFile()

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to start the admin API')
  }

  const databaseUrl = new URL(process.env.DATABASE_URL)
  const adapter = new PrismaMariaDb({
    host: databaseUrl.hostname,
    port: Number(databaseUrl.port || 3306),
    user: decodeURIComponent(databaseUrl.username),
    password: decodeURIComponent(databaseUrl.password),
    database: databaseUrl.pathname.replace(/^\//, ''),
    connectionLimit: 5,
  })

  return new PrismaClient({ adapter })
}
