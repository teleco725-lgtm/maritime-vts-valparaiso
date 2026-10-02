import { PrismaClient } from '@prisma/client'

/**
 * Cliente Prisma singleton — graceful degradation.
 *
 * En Vercel sin DATABASE_URL:
 * - No crea instancia de PrismaClient (evita crash)
 * - Los endpoints que usan DB reciben null y deben manejarlo
 * - La app (login, dashboard, chat, theme picker) funciona sin DB
 *
 * En desarrollo local:
 * - DATABASE_URL=file:./db/custom.db (SQLite)
 * - La DB funciona normalmente
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Solo crear PrismaClient si DATABASE_URL existe
// Esto evita el crash en Vercel cuando no hay DB configurada
export const db = process.env.DATABASE_URL
  ? (globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    }))
  : null

if (process.env.NODE_ENV !== 'production' && db) {
  globalForPrisma.prisma = db
}

/**
 * Verifica si la DB está disponible.
 */
export async function isDbAvailable(): Promise<boolean> {
  try {
    if (!db || !process.env.DATABASE_URL) return false
    await db.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}
