import { promises as fs } from 'fs'
import path from 'path'
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'crypto'

export type Participant = {
  id: string
  name: string
  email: string
  pinHash: string
  pinSalt: string
  createdAt: string
}

export type Draw = {
  assignments: Record<string, string>
  drawnAt: string
}

type Data = {
  participants: Participant[]
  draw: Draw | null
}

const STORE_KEY = 'secret-santa-abe:data'

// Vercel's serverless filesystem is read-only except for /tmp.
const DATA_FILE = process.env.VERCEL
  ? '/tmp/secret-santa-abe.json'
  : path.join(process.cwd(), '.data', 'secret-santa-abe.json')

const emptyData = (): Data => ({ participants: [], draw: null })

function normalizeData(parsed: unknown): Data {
  if (!parsed || typeof parsed !== 'object') return emptyData()
  const obj = parsed as Partial<Data>
  return {
    participants: Array.isArray(obj.participants) ? obj.participants : [],
    draw: obj.draw ?? null,
  }
}

function getRedisConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return { url: url.replace(/\/+$/, ''), token }
}

async function redisGet(url: string, token: string): Promise<string | null> {
  const res = await fetch(`${url}/get/${encodeURIComponent(STORE_KEY)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Redis GET failed (${res.status})`)
  }
  const json = (await res.json()) as { result?: unknown }
  if (json.result === null || json.result === undefined) return null
  return typeof json.result === 'string' ? json.result : JSON.stringify(json.result)
}

async function redisSet(url: string, token: string, value: string): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['SET', STORE_KEY, value]),
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Redis SET failed (${res.status})`)
  }
}

async function readData(): Promise<Data> {
  const redis = getRedisConfig()
  if (redis) {
    const raw = await redisGet(redis.url, redis.token)
    if (!raw) return emptyData()
    try {
      return normalizeData(JSON.parse(raw))
    } catch {
      return emptyData()
    }
  }

  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8')
    return normalizeData(JSON.parse(raw))
  } catch {
    return emptyData()
  }
}

async function writeData(data: Data): Promise<void> {
  const serialized = JSON.stringify(data, null, 2)
  const redis = getRedisConfig()
  if (redis) {
    await redisSet(redis.url, redis.token, serialized)
    return
  }

  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  const tmp = `${DATA_FILE}.${randomUUID()}.tmp`
  await fs.writeFile(tmp, serialized, 'utf8')
  await fs.rename(tmp, DATA_FILE)
}

let writeQueue: Promise<unknown> = Promise.resolve()

export function getData() {
  return readData()
}

export function mutateData<T>(fn: (data: Data) => T | Promise<T>): Promise<T> {
  const run = writeQueue.then(async () => {
    const data = await readData()
    const result = await fn(data)
    await writeData(data)
    return result
  })
  writeQueue = run.catch(() => undefined)
  return run
}

export function hashPin(pin: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(pin, salt, 32).toString('hex')
  return { pinHash: hash, pinSalt: salt }
}

export function verifyPin(pin: string, participant: Participant) {
  const expected = Buffer.from(participant.pinHash, 'hex')
  const actual = scryptSync(pin, participant.pinSalt, 32)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

export function newId() {
  return randomUUID()
}

export function createDerangement(ids: string[]): Record<string, string> {
  const shuffled = [...ids]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomBytes(4).readUInt32BE(0) % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  // A single cycle over a shuffled list guarantees nobody draws themselves.
  const assignments: Record<string, string> = {}
  shuffled.forEach((giverId, index) => {
    assignments[giverId] = shuffled[(index + 1) % shuffled.length]
  })
  return assignments
}
