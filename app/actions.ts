'use server'

import { revalidatePath } from 'next/cache'
import { checkAdminPassword, endAdminSession, isAdmin, startAdminSession } from '@/lib/admin-auth'
import { createDerangement, getData, hashPin, mutateData, newId, verifyPin } from '@/lib/store'

const ALLOWED_DOMAIN = '@abioexpertise.com'
const EMAIL_RE = /^[^\s@]+@abioexpertise\.com$/
const PIN_RE = /^\d{4}$/

const text = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim()

export type RegisterState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  errors?: Record<string, string>
  values?: Record<string, string>
  stamp?: number
}

export async function registerAction(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  if (text(formData, 'website') !== '') {
    return { status: 'error', message: 'Inscription refusée.', stamp: Date.now() }
  }

  const values = {
    name: text(formData, 'name'),
    email: text(formData, 'email').toLowerCase(),
  }
  const pin = text(formData, 'pin')
  const pinConfirm = text(formData, 'pinConfirm')

  const errors: Record<string, string> = {}
  if (values.name.length < 2 || values.name.length > 80) {
    errors.name = 'Indiquez votre nom (2 à 80 caractères).'
  }
  if (!EMAIL_RE.test(values.email) || values.email.length > 120) {
    errors.email = `Utilisez votre adresse professionnelle (${ALLOWED_DOMAIN}).`
  }
  if (!PIN_RE.test(pin)) {
    errors.pin = 'Le code PIN doit contenir exactement 4 chiffres.'
  } else if (pin !== pinConfirm) {
    errors.pinConfirm = 'Les deux codes PIN ne correspondent pas.'
  }

  if (Object.keys(errors).length > 0) {
    return { status: 'error', message: 'Merci de corriger les champs indiqués.', errors, values, stamp: Date.now() }
  }

  const result = await mutateData((data) => {
    if (data.draw) return 'closed' as const
    if (data.participants.some((p) => p.email === values.email)) return 'duplicate' as const
    data.participants.push({
      id: newId(),
      name: values.name,
      email: values.email,
      ...hashPin(pin),
      createdAt: new Date().toISOString(),
    })
    return 'ok' as const
  })

  if (result === 'closed') {
    return { status: 'error', message: 'Le tirage au sort a déjà eu lieu : les inscriptions sont closes.', values, stamp: Date.now() }
  }
  if (result === 'duplicate') {
    return {
      status: 'error',
      message: 'Cet email est déjà inscrit.',
      errors: { email: 'Cet email est déjà inscrit.' },
      values,
      stamp: Date.now(),
    }
  }

  revalidatePath('/')
  revalidatePath('/admin')
  return {
    status: 'success',
    message: `Merci ${values.name} ! Votre inscription est enregistrée. Conservez précieusement votre code PIN.`,
    stamp: Date.now(),
  }
}

export type LookupState = {
  status: 'idle' | 'success' | 'error' | 'pending-draw'
  message?: string
  email?: string
  result?: {
    giverName: string
    receiver: { name: string; email: string }
  }
}

export async function lookupAction(_prev: LookupState, formData: FormData): Promise<LookupState> {
  const email = text(formData, 'email').toLowerCase()
  const pin = text(formData, 'pin')
  const invalid: LookupState = { status: 'error', message: 'Email ou code PIN incorrect.', email }

  if (!EMAIL_RE.test(email) || !PIN_RE.test(pin)) return invalid

  const data = await getData()
  const participant = data.participants.find((p) => p.email === email)
  if (!participant || !verifyPin(pin, participant)) return invalid

  if (!data.draw) {
    return {
      status: 'pending-draw',
      message: `Bonjour ${participant.name}, le tirage au sort n'a pas encore eu lieu. Revenez un peu plus tard !`,
      email,
    }
  }

  const receiverId = data.draw.assignments[participant.id]
  const receiver = data.participants.find((p) => p.id === receiverId)
  if (!receiver) {
    return { status: 'error', message: "Aucune cible trouvée. Contactez l'organisateur.", email }
  }

  return {
    status: 'success',
    email,
    result: {
      giverName: participant.name,
      receiver: { name: receiver.name, email: receiver.email },
    },
  }
}

export type ActionState = { status: 'idle' | 'success' | 'error'; message?: string; stamp?: number }

export async function adminLoginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!checkAdminPassword(String(formData.get('password') ?? ''))) {
    return { status: 'error', message: 'Mot de passe incorrect.' }
  }
  await startAdminSession()
  revalidatePath('/admin')
  return { status: 'success' }
}

export async function adminLogoutAction() {
  await endAdminSession()
  revalidatePath('/admin')
}

export async function drawAction(_prev: ActionState): Promise<ActionState> {
  if (!(await isAdmin())) return { status: 'error', message: 'Session expirée, reconnectez-vous.' }

  const result = await mutateData((data) => {
    if (data.participants.length < 3) return false
    data.draw = {
      assignments: createDerangement(data.participants.map((p) => p.id)),
      drawnAt: new Date().toISOString(),
    }
    return true
  })

  if (!result) return { status: 'error', message: 'Il faut au moins 3 participants pour lancer le tirage.', stamp: Date.now() }

  revalidatePath('/admin')
  revalidatePath('/')
  return { status: 'success', message: 'Tirage effectué avec succès !', stamp: Date.now() }
}

export async function cancelDrawAction(_prev: ActionState): Promise<ActionState> {
  if (!(await isAdmin())) return { status: 'error', message: 'Session expirée, reconnectez-vous.' }
  await mutateData((data) => {
    data.draw = null
  })
  revalidatePath('/admin')
  revalidatePath('/')
  return { status: 'success', message: 'Tirage annulé. Les inscriptions sont rouvertes.', stamp: Date.now() }
}

export async function resetPinAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await isAdmin())) return { status: 'error', message: 'Session expirée.' }
  const participantId = text(formData, 'participantId')
  const pin = text(formData, 'pin')
  if (!PIN_RE.test(pin)) return { status: 'error', message: '4 chiffres requis.', stamp: Date.now() }

  const found = await mutateData((data) => {
    const participant = data.participants.find((p) => p.id === participantId)
    if (!participant) return false
    Object.assign(participant, hashPin(pin))
    return true
  })

  if (!found) return { status: 'error', message: 'Participant introuvable.', stamp: Date.now() }
  return { status: 'success', message: 'PIN réinitialisé
