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

// Vercel's serverless filesystem is read-only except for /tmp.
const DATA_FILE = process.env.VERCEL
  ? '/tmp/secret-santa-abe.json'
  : path.join(process.cwd(), '.data', 'secret-santa-abe.json')

const emptyData = (): Data => ({ participants: [], draw: null })

async function readData(): Promise<Data> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<Data>
    return {
      participants: parsed.participants ?? [],
      draw: parsed.draw ?? null,
    }
  } catch {
    return emptyData()
  }
}

async function writeData(data: Data) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  const tmp = `${DATA_FILE}.${randomUUID()}.tmp`
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8')
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
