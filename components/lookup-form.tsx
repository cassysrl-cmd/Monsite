'use client'

import { useActionState } from 'react'
import { Gift, Loader2, Lock, Mail } from 'lucide-react'
import { lookupAction, type LookupState } from '@/app/actions'
import { Alert, Card, Field, inputClass, primaryButtonClass, secondaryButtonClass } from '@/components/form-ui'

const initialState: LookupState = { status: 'idle' }

export function LookupForm() {
  const [state, formAction, pending] = useActionState(lookupAction, initialState)

  if (state.status === 'success' && state.result) {
    const { giverName, receiver } = state.result
    return (
      <Card aria-labelledby="result-title" className="text-center">
        <p className="text-sm text-muted-foreground">Bonjour {giverName}, cette année vous gâtez…</p>
        <h2 id="result-title" className="mt-3 text-balance font-serif text-4xl font-semibold text-gold sm:text-5xl">
          {receiver.name}
        </h2>
        <p className="mt-2 inline-flex items-center gap-2 text-sm text-white/70">
          <Mail className="size-4" aria-hidden="true" />
          {receiver.email}
        </p>

        <div className="mx-auto mt-8 max-w-md text-left">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Ses 3 idées de cadeaux</h3>
          <ul className="flex flex-col gap-3">
            {receiver.ideas.map((idea, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <Gift className="mt-0.5 size-4 shrink-0 text-ember" aria-hidden="true" />
                <span className="text-sm leading-relaxed">{idea}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">Chut… gardez le secret jusqu&apos;au jour J !</p>
        <form action={() => window.location.reload()} className="mt-4">
          <button type="submit" className={secondaryButtonClass}>
            Masquer
          </button>
        </form>
      </Card>
    )
  }

  return (
    <Card aria-labelledby="lookup-title">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-gold/15 text-gold">
          <Lock className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h1 id="lookup-title" className="font-serif text-2xl font-semibold">
            Découvrir ma cible
          </h1>
          <p className="text-sm text-muted-foreground">Saisissez votre email et votre code PIN secret.</p>
        </div>
      </div>

      {state.message && (
        <div className="mt-6">
          <Alert tone={state.status === 'error' ? 'error' : 'info'}>{state.message}</Alert>
        </div>
      )}

      <form action={formAction} className="mt-6 flex flex-col gap-5">
        <Field id="lookup-email" label="Email professionnel">
          <input
            id="lookup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.email}
            className={inputClass}
            placeholder="prenom.nom@abe.fr"
          />
        </Field>
        <Field id="lookup-pin" label="Code PIN (4 chiffres)">
          <input
            id="lookup-pin"
            name="pin"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            pattern="\d{4}"
            maxLength={4}
            required
            className={`${inputClass} tracking-[0.5em]`}
            placeholder="••••"
          />
        </Field>
        <button type="submit" disabled={pending} className={`${primaryButtonClass} w-full`}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {pending ? 'Vérification…' : 'Révéler ma cible'}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Code PIN oublié ? Contactez l&apos;organisateur pour le réinitialiser.
      </p>
    </Card>
  )
}
