'use client'

import { useActionState } from 'react'
import { Loader2, RotateCcw, Shuffle, Trash2 } from 'lucide-react'
import { cancelDrawAction, deleteParticipantAction, drawAction, resetPinAction, type ActionState } from '@/app/actions'
import { Alert, inputClass, primaryButtonClass, secondaryButtonClass } from '@/components/form-ui'

const initialState: ActionState = { status: 'idle' }

export function DrawControls({ hasDraw, participantCount }: { hasDraw: boolean; participantCount: number }) {
  const [drawState, runDraw, drawing] = useActionState(drawAction, initialState)
  const [cancelState, runCancel, cancelling] = useActionState(cancelDrawAction, initialState)
  const latest = (drawState.stamp ?? 0) > (cancelState.stamp ?? 0) ? drawState : cancelState

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <form
          action={runDraw}
          onSubmit={(e) => {
            if (hasDraw && !confirm('Un tirage existe déjà. Le relancer remplacera toutes les attributions. Continuer ?')) {
              e.preventDefault()
            }
          }}
        >
          <button type="submit" disabled={drawing || participantCount < 3} className={primaryButtonClass}>
            {drawing ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Shuffle className="size-4" aria-hidden="true" />}
            {hasDraw ? 'Relancer le tirage au sort' : 'Lancer le tirage au sort'}
          </button>
        </form>
        {hasDraw && (
          <form
            action={runCancel}
            onSubmit={(e) => {
              if (!confirm('Annuler le tirage et rouvrir les inscriptions ?')) e.preventDefault()
            }}
          >
            <button type="submit" disabled={cancelling} className={secondaryButtonClass}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Annuler le tirage
            </button>
          </form>
        )}
      </div>
      {participantCount < 3 && (
        <p className="text-xs text-muted-foreground">Au moins 3 participants sont nécessaires pour lancer le tirage.</p>
      )}
      {latest.message && <Alert tone={latest.status === 'error' ? 'error' : 'success'}>{latest.message}</Alert>}
    </div>
  )
}

export function DeleteParticipantButton({
  participantId,
  participantName,
  hasDraw,
}: {
  participantId: string
  participantName: string
  hasDraw: boolean
}) {
  const [state, formAction, pending] = useActionState(deleteParticipantAction, initialState)

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        const warning = hasDraw ? '\n\nAttention : le tirage déjà effectué sera annulé et devra être relancé.' : ''
        if (!confirm(`Supprimer l'inscription de ${participantName} ?${warning}`)) e.preventDefault()
      }}
      className="flex flex-col items-end gap-1"
    >
      <input type="hidden" name="participantId" value={participantId} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive disabled:opacity-50"
      >
        {pending ? <Loader2 className="size-3 animate-spin" aria-hidden="true" /> : <Trash2 className="size-3" aria-hidden="true" />}
        Supprimer
        <span className="sr-only"> l&apos;inscription de {participantName}</span>
      </button>
      {state.status === 'error' && state.message && (
        <p role="status" className="text-xs text-destructive">
          {state.message}
        </p>
      )}
    </form>
  )
}

export function ResetPinForm({ participantId, participantName }: { participantId: string; participantName: string }) {
  const [state, formAction, pending] = useActionState(resetPinAction, initialState)
  const inputId = `pin-${participantId}`

  return (
    <form key={state.stamp} action={formAction} className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input type="hidden" name="participantId" value={participantId} />
        <label htmlFor={inputId} className="sr-only">
          Nouveau code PIN pour {participantName}
        </label>
        <input
          id={inputId}
          name="pin"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          required
          placeholder="Nouveau PIN"
          className={`${inputClass} w-28 py-1.5 text-xs`}
        />
        <button type="submit" disabled={pending} className={`${secondaryButtonClass} px-3 py-1.5 text-xs`}>
          {pending ? <Loader2 className="size-3 animate-spin" aria-hidden="true" /> : 'Réinitialiser'}
        </button>
      </div>
      {state.message && (
        <p role="status" className={`text-xs ${state.status === 'error' ? 'text-destructive' : 'text-gold'}`}>
          {state.message}
        </p>
      )}
    </form>
  )
}
