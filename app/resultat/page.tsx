import type { Metadata } from 'next'
import { LookupForm } from '@/components/lookup-form'

export const metadata: Metadata = {
  title: 'Ma cible · Secret Santa ABE',
  description: 'Découvrez à qui vous offrez un cadeau grâce à votre email et votre code PIN.',
}

export default function ResultPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-12 lg:py-16">
      <LookupForm />
    </div>
  )
}
