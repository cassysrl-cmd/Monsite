import Link from 'next/link'
import { Gift, Snowflake, Star, TreePine } from 'lucide-react'
import { RegistrationForm } from '@/components/registration-form'
import { secondaryButtonClass } from '@/components/form-ui'
import { getData } from '@/lib/store'

export const dynamic = 'force-dynamic'

const STEPS = [
  { icon: TreePine, title: 'Inscrivez-vous', text: 'Votre nom, votre email et 3 choses que vous aimez.' },
  { icon: Snowflake, title: 'Le tirage', text: "L'organisateur lance le tirage au sort." },
  { icon: Gift, title: 'Votre cible', text: 'Email + code PIN pour la découvrir en secret.' },
]

export default async function HomePage() {
  const data = await getData()
  const count = data.participants.length

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 lg:grid-cols-[1fr_1.25fr] lg:py-16">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-gold shadow-[0_0_20px_-4px_rgb(247_166_0/0.5)]">
            <Star className="size-3.5 fill-gold" aria-hidden="true" />
            Édition de Noël
            <Star className="size-3.5 fill-gold" aria-hidden="true" />
          </p>
          <h1 className="text-balance font-serif text-5xl font-semibold leading-none tracking-tight sm:text-6xl">
            Secret Santa <span className="text-gold">ABE</span>
          </h1>
          <p className="text-balance font-serif text-2xl leading-snug text-white/90 sm:text-3xl">
            Offrez, surprenez, <span className="text-gold">partagez</span>.
          </p>
        </div>

        <ol className="flex flex-col gap-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex items-start gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
                <step.icon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="font-medium">
                  <span className="text-white/50">{i + 1}. </span>
                  {step.title}
                </p>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm">
            <span className="font-serif text-2xl font-semibold text-gold">{count}</span>{' '}
            <span className="text-white/75">{count > 1 ? 'participants inscrits' : 'participant inscrit'}</span>
          </p>
          <Link href="/resultat" className={`${secondaryButtonClass} ml-auto`}>
            Découvrir ma cible
          </Link>
        </div>
      </div>

      <div className="relative">
        <div
          aria-hidden="true"
          className="animate-glow pointer-events-none absolute -inset-3 rounded-[2rem] bg-gold/20 blur-3xl"
        />
        <div className="relative">
          <RegistrationForm closed={!!data.draw} />
        </div>
      </div>
    </div>
  )
}
