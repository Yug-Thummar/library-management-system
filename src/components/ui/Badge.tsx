type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'accent'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-paper text-muted',
  success: 'bg-emerald-50 text-emerald-800',
  warning: 'bg-amber-50 text-amber-800',
  danger: 'bg-rose-50 text-rose-800',
  accent: 'bg-teal-50 text-accent',
}

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: BadgeTone
  children: string
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  )
}
