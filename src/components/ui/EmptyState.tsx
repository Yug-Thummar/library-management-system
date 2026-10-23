import type { ReactNode } from 'react'

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode
  title: string
  text: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-paper text-accent">
        {icon}
      </div>
      <h3 className="font-serif text-xl text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
