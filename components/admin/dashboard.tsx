import { ArrowRight, LogOut } from 'lucide-react'
import { adminLogoutAction } from '@/app/actions'
import { DeleteParticipantButton, DrawControls, ResetPinForm } from '@/components/admin/admin-controls'
import { Card, secondaryButtonClass } from '@/components/form-ui'
import type { Draw, Participant } from '@/lib/store'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' })

export function AdminDashboard({ participants, draw }: { participants: Participant[]; draw: Draw | null }) {
  const byId = new Map(participants.map((p) => [p.id, p]))

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Organisateur</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">Tableau de bord</h1>
        </div>
        <form action={adminLogoutAction}>
          <button type="submit" className={secondaryButtonClass}>
            <LogOut className="size-4" aria-hidden="true" />
            Déconnexion
          </button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-muted-foreground">Participants inscrits</p>
          <p className="mt-1 font-serif text-4xl font-semibold text-gold">{participants.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-muted-foreground">Statut du tirage</p>
          <p className="mt-2 font-medium">
            {draw ? (
              <>
                <span className="text-gold">Effectué</span>
                <span className="block text-sm font-normal text-white/60">le {dateFormatter.format(new Date(draw.drawnAt))}</span>
              </>
            ) : (
              <span className="text-white/80">En attente — inscriptions ouvertes</span>
            )}
          </p>
        </div>
      </div>

      <Card aria-labelledby="draw-title">
        <h2 id="draw-title" className="font-serif text-xl font-semibold">
          Tirage au sort
        </h2>
        <p className="mb-5 mt-1 text-sm text-muted-foreground">
          Tirage aléatoire : chaque participant reçoit une cible, personne ne se tire soi-même.
        </p>
        <DrawControls hasDraw={!!draw} participantCount={participants.length} />
      </Card>

      <Card aria-labelledby="participants-title" className="!p-0">
        <div className="p-6 pb-4 sm:p-8 sm:pb-4">
          <h2 id="participants-title" className="font-serif text-xl font-semibold">
            Liste des inscrits
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Réinitialisez le code PIN d&apos;un participant ou supprimez une inscription si besoin.</p>
        </div>
        {participants.length === 0 ? (
          <p className="px-6 pb-8 text-sm text-white/60 sm:px-8">Aucun inscrit pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-y border-white/10 bg-white/5 text-xs uppercase tracking-wider text-white/60">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium sm:px-8">Nom</th>
                  <th scope="col" className="px-4 py-3 font-medium">Email</th>
                  <th scope="col" className="px-4 py-3 font-medium">Code PIN</th>
                  <th scope="col" className="px-6 py-3 sm:px-8"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {participants.map((p) => (
                  <tr key={p.id} className="align-top">
                    <td className="px-6 py-4 font-medium sm:px-8">{p.name}</td>
                    <td className="px-4 py-4 text-white/75">{p.email}</td>
                    <td className="px-4 py-4"><ResetPinForm participantId={p.id} participantName={p.name} /></td>
                    <td className="px-6 py-4 text-right sm:px-8">
                      <DeleteParticipantButton participantId={p.id} participantName={p.name} hasDraw={!!draw} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {draw && (
        <Card aria-labelledby="recap-title" className="!p-0">
          <div className="p-6 pb-4 sm:p-8 sm:pb-4">
            <h2 id="recap-title" className="font-serif text-xl font-semibold">
              Récapitulatif du tirage
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Confidentiel — à utiliser uniquement en cas d&apos;absence d&apos;un collègue.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-y border-white/10 bg-white/5 text-xs uppercase tracking-wider text-white/60">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium sm:px-8">Offre</th>
                  <th scope="col" className="px-2 py-3"><span className="sr-only">à</span></th>
                  <th scope="col" className="px-4 py-3 font-medium sm:px-8">Reçoit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {participants.map((giver) => {
                  const receiver = byId.get(draw.assignments[giver.id])
                  return (
                    <tr key={giver.id} className="align-top">
                      <td className="px-6 py-4 sm:px-8">
                        <p className="font-medium">{giver.name}</p>
                        <p className="text-xs text-white/60">{giver.email}</p>
                      </td>
                      <td className="px-2 py-4 text-ember">
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </td>
                      <td className="px-4 py-4 sm:px-8">
                        {receiver ? (
                          <>
                            <p className="font-medium text-gold">{receiver.name}</p>
                            <p className="text-xs text-white/60">{receiver.email}</p>
                          </>
                        ) : (
                          <p className="text-xs text-destructive">Non attribué (inscrit après le tirage)</p>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
