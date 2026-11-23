'use client'

import { useActionState } from 'react'
import { Gift, Loader2, Sparkles, Star, TreePine } from 'lucide-react'
import { registerAction, type RegisterState } from '@/app/actions'
import { Alert, Card, Field, inputClass, primaryButtonClass } from '@/components/form-ui'

const initialState: RegisterState = { status: 'idle' }

export function RegistrationForm({ closed }: { closed: boolean }) {
  const [state, formAction, pending] = useActionState(registerAction, initialState)
  const errors = state.errors ?? {}
  const values = state.values ?? {}

  const describedBy = (key: string) => (errors[key] ? `${key}-error` : undefined)

  if (closed) {
    return (
      <Card aria-labelledby="register-title">
        <h2 id="register-title" className="font-serif text-2xl font-semibold">
          Inscriptions closes
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Le tirage au sort a eu lieu. Rendez-vous sur la page « Ma cible » pour découvrir à qui vous offrez un
          cadeau.
        </p>
      </Card>
    )
  }

  return (
    <Card aria-labelledby="register-title" className="border-gold/25">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-gold/15 text-gold">
          <TreePine className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="register-title" className="font-serif text-2xl font-semibold">
            Je participe
          </h2>
        </div>
      </div>

      {state.status === 'success' && (
        <div className="mt-6">
          <Alert tone="success">{state.message}</Alert>
        </div>
      )}
      {state.status === 'error' && state.message && (
        <div className="mt-6">
          <Alert tone="error">{state.message}</Alert>
        </div>
      )}

      <form key={state.stamp} action={formAction} className="mt-6 flex flex-col gap-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="name" label="Nom complet" error={errors.name}>
            <input
              id="name"
              name="name"
              autoComplete="name"
              required
              maxLength={80}
              defaultValue={values.name}
              aria-invalid={!!errors.name}
              aria-describedby={describedBy('name')}
              className={inputClass}
              placeholder="Aurélie Martin"
            />
          </Field>
          <Field id="email" label="Email professionnel" error={errors.email}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={120}
              defaultValue={values.email}
              aria-invalid={!!errors.email}
              aria-describedby={describedBy('email')}
              className={inputClass}
              placeholder="prenom.n@abioexpertise.com"
            />
          </Field>
        </div>

    

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="pin"
            label={
              <span className="flex items-center gap-2">
                <Star className="size-4 text-gold" aria-hidden="true" />
                Code PIN secret (4 chiffres)
              </span>
            }
            hint="Il vous servira à découvrir votre cible." error={errors.pin}>
            <input
              id="pin"
              name="pin"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              pattern="\d{4}"
              maxLength={4}
              required
              aria-invalid={!!errors.pin}
              aria-describedby={errors.pin ? 'pin-error' : 'pin-hint'}
              className={`${inputClass} tracking-[0.5em]`}
              placeholder="••••"
            />
          </Field>
          <Field id="pinConfirm" label="Confirmer le code PIN" error={errors.pinConfirm}>
            <input
              id="pinConfirm"
              name="pinConfirm"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              pattern="\d{4}"
              maxLength={4}
              required
              aria-invalid={!!errors.pinConfirm}
              aria-describedby={describedBy('pinConfirm')}
              className={`${inputClass} tracking-[0.5em]`}
              placeholder="••••"
            />
          </Field>
        </div>

        <button type="submit" disabled={pending} className={`${primaryButtonClass} btn-shine mt-2 w-full sm:w-auto sm:self-start`}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="size-4" aria-hidden="true" />
          )}
          {pending ? 'Inscription…' : "Valider mon inscription"}
        </button>
      </form>
    </Card>
  )
}
