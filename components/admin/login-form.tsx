'use client'

import { useActionState } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'
import { adminLoginAction, type ActionState } from '@/app/actions'
import { Alert, Card, Field, inputClass, primaryButtonClass } from '@/components/form-ui'

const initialState: ActionState = { status: 'idle' }

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLoginAction, initialState)

  return (
    <Card aria-labelledby="admin-login-title">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-gold/15 text-gold">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h1 id="admin-login-title" className="font-serif text-2xl font-semibold">
            Espace organisateur
          </h1>
          <p className="text-sm text-muted-foreground">Accès réservé à l&apos;administrateur.</p>
        </div>
      </div>
      {state.status === 'error' && (
        <div className="mt-6">
          <Alert tone="error">{state.message}</Alert>
        </div>
      )}
      <form action={formAction} className="mt-6 flex flex-col gap-5">
        <Field id="admin-password" label="Mot de passe administrateur">
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={inputClass}
          />
        </Field>
        <button type="submit" disabled={pending} className={`${primaryButtonClass} w-full`}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Se connecter
        </button>
      </form>
    </Card>
  )
}
