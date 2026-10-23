export const LOAN_DAYS = 14

export function todayISO(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(isoDate: string, days: number): string {
  const date = parseISODate(isoDate)
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDate(isoDate: string): string {
  return parseISODate(isoDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function isPastDate(isoDate: string, today = todayISO()): boolean {
  return isoDate < today
}

export function daysBetween(fromISO: string, toISO: string): number {
  const from = parseISODate(fromISO).getTime()
  const to = parseISODate(toISO).getTime()
  return Math.round((to - from) / 86_400_000)
}

export function dueLabel(dueDate: string, status: 'issued' | 'returned', today = todayISO()): string {
  if (status === 'returned') {
    return `Was due ${formatDate(dueDate)}`
  }

  const remaining = daysBetween(today, dueDate)
  if (remaining < 0) {
    const overdueBy = Math.abs(remaining)
    return overdueBy === 1 ? '1 day overdue' : `${overdueBy} days overdue`
  }
  if (remaining === 0) {
    return 'Due today'
  }
  if (remaining === 1) {
    return 'Due tomorrow'
  }
  return `Due in ${remaining} days`
}

function parseISODate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1)
}
