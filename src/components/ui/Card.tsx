import type { ReactNode } from 'react'

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-2xl border border-line bg-white shadow-[0_8px_30px_rgba(28,36,48,0.04)] ${className}`}>
      {children}
    </section>
  )
}
