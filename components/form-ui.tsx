import type { ComponentProps, ReactNode } from 'react'

export const inputClass =
  'w-full rounded-lg border border-input bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 transition-colors focus:border-gold focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gold/30 aria-invalid:border-destructive'

export const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-gold to-ember px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-ember/20 transition-all hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-60'

export const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-60'

export function Card({ className = '', ...props }: ComponentProps<'section'>) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-8 ${className}`}
      {...props}
    />
  )
}

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: ReactNode
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-white">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function Alert({ tone, children }: { tone: 'success' | 'error' | 'info'; children: ReactNode }) {
  const styles = {
    success: 'border-gold/40 bg-gold/10 text-white',
    error: 'border-destructive/50 bg-destructive/10 text-white',
    info: 'border-white/20 bg-white/5 text-white',
  }[tone]
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  )
}
