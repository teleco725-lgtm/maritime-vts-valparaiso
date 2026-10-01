import { PrismaClient } from '@prisma/client'

/**
 * Cliente Prisma singleton.
 *
 * En Vercel:
 * - Si DATABASE_URL está configurada (Neon/Supabase), la DB funciona normalmente.
 * - Si NO está configurada, los endpoints que usan DB fallarán con error claro,
 *   pero la app (login, dashboard, theme picker) seguirá funcionando.
 *
 * En desarrollo local:
 * - DATABASE_URL=file:./db/custom.db (SQLite)
 * - La DB funciona normalmente.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

/**
 * Verifica si la DB está disponible (para uso en health checks).
 */
export async function isDbAvailable(): Promise<boolean> {
  try {
    if (!process.env.DATABASE_URL) return false
    await db.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}
