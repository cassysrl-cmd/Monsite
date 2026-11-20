import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123'
const COOKIE_NAME = 'ssabe_admin'

function sessionToken() {
  return createHmac('sha256', ADMIN_PASSWORD).update('secret-santa-abe-admin').digest('hex')
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

export function checkAdminPassword(password: string) {
  return safeEqual(password, ADMIN_PASSWORD)
}

export async function isAdmin() {
  const value = (await cookies()).get(COOKIE_NAME)?.value
  return value ? safeEqual(value, sessionToken()) : false
}

export async function startAdminSession() {
  ;(await cookies()).set(COOKIE_NAME, sessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 60 * 60 * 8,
  })
}

export async function endAdminSession() {
  ;(await cookies()).delete(COOKIE_NAME)
}
