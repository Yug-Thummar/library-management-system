import {
  AlertTriangle,
  BookCopy,
  BookMarked,
  BookOpen,
  Clock3,
  Library,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { useLibrary } from '../context/LibraryContext'
import { getRecentActivity } from '../utils/library'

export function DashboardPage() {
  const { books, transactions, stats } = useLibrary()
  const activity = getRecentActivity(transactions)
  const availableShare = stats.totalCopies === 0 ? 0 : Math.round((stats.availableCopies / stats.totalCopies) * 100)
  const issuedShare = stats.totalCopies === 0 ? 0 : 100 - availableShare

  const cards = [
    { label: 'Total titles', value: stats.totalTitles, icon: Library, hint: 'Distinct books in the catalogue' },
    { label: 'Total copies', value: stats.totalCopies, icon: BookCopy, hint: 'Every physical copy counted' },
    { label: 'Available copies', value: stats.availableCopies, icon: BookOpen, hint: 'Ready to issue today' },
    { label: 'Currently issued', value: stats.issuedCopies, icon: BookMarked, hint: 'Copies still with borrowers' },
    { label: 'Overdue loans', value: stats.overdueCount, icon: AlertTriangle, hint: 'Past the 14-day due date' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">{card.label}</p>
                <p className="mt-2 font-serif text-3xl text-ink">{card.value}</p>
                <p className="mt-1 text-sm text-muted">{card.hint}</p>
              </div>
              <span className="rounded-xl bg-paper p-2 text-accent">
                <card.icon size={18} />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <h2 className="font-serif text-2xl text-ink">Recent activity</h2>
          <p className="mt-1 text-sm text-muted">Latest issues, returns, and overdue reminders on this device.</p>
          {activity.length === 0 ? (
            <p className="mt-8 text-sm text-muted">No loans yet. Issue a book to see activity here.</p>
          ) : (
            <ul className="mt-5 divide-y divide-line">
              {activity.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{item.text}</p>
                    <p className="mt-1 text-sm text-muted">{item.detail}</p>
                  </div>
                  <span className="mt-0.5 text-accent">
                    {item.kind === 'overdue' ? <AlertTriangle size={16} className="text-rose-700" /> : <Clock3 size={16} />}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-serif text-2xl text-ink">Shelf availability</h2>
          <p className="mt-1 text-sm text-muted">A simple view of copies on the shelf versus copies on loan.</p>
          <div className="mt-6">
            <div className="flex h-3 overflow-hidden rounded-full bg-paper">
              <div className="bg-accent" style={{ width: `${availableShare}%` }} />
              <div className="bg-amber-400" style={{ width: `${issuedShare}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
              <span>
                <strong className="text-ink">{stats.availableCopies}</strong> available
              </span>
              <span>
                <strong className="text-ink">{stats.issuedCopies}</strong> issued
              </span>
              <span>
                <strong className="text-ink">{stats.totalCopies}</strong> total
              </span>
            </div>
          </div>
          <ul className="mt-6 space-y-3">
            {books.slice(0, 5).map((book) => {
              const percent = book.totalCopies === 0 ? 0 : Math.round((book.availableCopies / book.totalCopies) * 100)
              return (
                <li key={book.id}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <p className="truncate font-medium text-ink">{book.title}</p>
                    <p className="shrink-0 text-muted">
                      {book.availableCopies}/{book.totalCopies}
                    </p>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-paper">
                    <div className="h-1.5 rounded-full bg-accent" style={{ width: `${percent}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>
    </div>
  )
}
