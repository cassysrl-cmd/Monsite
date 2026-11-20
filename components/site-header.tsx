import Link from 'next/link'
import Image from 'next/image'

const NAV = [
  { href: '/', label: 'Inscription' },
  { href: '/resultat', label: 'Ma cible' },
  { href: '/admin', label: 'Admin' },
]

export function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-navy-deep/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-6 py-6 sm:flex-row sm:justify-between sm:py-7">
        <Link
          href="/"
          className="shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          aria-label="Alliance Bio Expertise, accueil"
        >
          <Image
            src="/images/logo.png"
            alt="Alliance Bio Expertise"
            width={940}
            height={300}
            priority
            sizes="180px"
            className="h-11 w-auto sm:h-12"
          />
        </Link>
        <nav aria-label="Navigation principale">
          <ul className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-full px-4 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
