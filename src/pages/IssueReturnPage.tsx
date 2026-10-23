import { useMemo, useState } from 'react'
import { BookMarked, Plus, Search, Undo2 } from 'lucide-react'
import { IssueForm } from '../components/issues/IssueForm'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { SelectInput, TextInput } from '../components/ui/Field'
import { useLibrary } from '../context/LibraryContext'
import { useToast } from '../context/ToastContext'
import type { IssueInput, Transaction } from '../types'
import { dueLabel, formatDate } from '../utils/dates'
import { getDisplayStatus, transactionMatchesQuery } from '../utils/library'

type StatusFilter = 'all' | 'issued' | 'returned' | 'overdue'

export function IssueReturnPage() {
  const { books, transactions, issueBook, returnBook } = useLibrary()
  const { showToast } = useToast()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [issueOpen, setIssueOpen] = useState(false)
  const [pendingReturn, setPendingReturn] = useState<Transaction | null>(null)

  const filtered = useMemo(() => {
    return transactions.filter((item) => {
      const display = getDisplayStatus(item)
      const matchesQuery = query.trim() ? transactionMatchesQuery(item, query) : true
      const matchesStatus = status === 'all' ? true : display === status
      return matchesQuery && matchesStatus
    })
  }, [transactions, query, status])

  const handleIssue = (input: IssueInput) => {
    const result = issueBook(input)
    if (!result.ok) {
      return result.error
    }
    showToast(result.message, 'success')
    setIssueOpen(false)
    return null
  }

  const handleReturn = () => {
    if (!pendingReturn) {
      return
    }
    const result = returnBook(pendingReturn.id)
    if (result.ok) {
      showToast(result.message, 'success')
    } else {
      showToast(result.error, 'error')
    }
    setPendingReturn(null)
  }

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="relative block flex-1">
            <span className="sr-only">Search loans</span>
            <Search className="pointer-events-none absolute top-3 left-3 text-muted" size={16} />
            <TextInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search borrower, student ID, or book"
              className="pl-9"
            />
          </label>
          <label className="lg:w-48">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Status</span>
            <SelectInput value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
              <option value="all">All loans</option>
              <option value="issued">Issued</option>
              <option value="overdue">Overdue</option>
              <option value="returned">Returned</option>
            </SelectInput>
          </label>
          <Button onClick={() => setIssueOpen(true)}>
            <Plus size={16} />
            Issue book
          </Button>
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<BookMarked size={22} />}
            title={transactions.length === 0 ? 'No loans yet' : 'No loans match these filters'}
            text={
              transactions.length === 0
                ? 'Issue an available copy to a borrower. The due date is set 14 days from today.'
                : 'Try another search or choose a different status filter.'
            }
            action={
              transactions.length === 0 ? (
                <Button onClick={() => setIssueOpen(true)}>Issue book</Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-line bg-paper/70 text-xs tracking-wide text-muted uppercase">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Book</th>
                    <th className="px-5 py-3 font-semibold">Borrower</th>
                    <th className="px-5 py-3 font-semibold">Issued</th>
                    <th className="px-5 py-3 font-semibold">Due</th>
                    <th className="px-5 py-3 font-semibold">Returned</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-b border-line last:border-0">
                      <td className="px-5 py-4 font-medium text-ink">{item.bookTitle}</td>
                      <td className="px-5 py-4">
                        <p>{item.borrowerName}</p>
                        <p className="text-xs text-muted">{item.studentId || 'No student ID'}</p>
                      </td>
                      <td className="px-5 py-4 text-muted">{formatDate(item.issueDate)}</td>
                      <td className="px-5 py-4 text-muted">{formatDate(item.dueDate)}</td>
                      <td className="px-5 py-4 text-muted">
                        {item.returnDate ? formatDate(item.returnDate) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge transaction={item} />
                      </td>
                      <td className="px-5 py-4">
                        {item.status === 'issued' ? (
                          <Button variant="secondary" className="px-3 py-2" onClick={() => setPendingReturn(item)}>
                            <Undo2 size={14} />
                            Return
                          </Button>
                        ) : (
                          <span className="text-sm text-muted">Closed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-line md:hidden">
              {filtered.map((item) => (
                <article key={item.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-ink">{item.bookTitle}</h3>
                      <p className="text-sm text-muted">
                        {item.borrowerName}
                        {item.studentId ? ` · ${item.studentId}` : ''}
                      </p>
                    </div>
                    <StatusBadge transaction={item} />
                  </div>
                  <p className="text-sm text-muted">
                    Issued {formatDate(item.issueDate)} · {dueLabel(item.dueDate, item.status)}
                    {item.returnDate ? ` · Returned ${formatDate(item.returnDate)}` : ''}
                  </p>
                  {item.status === 'issued' ? (
                    <Button variant="secondary" onClick={() => setPendingReturn(item)}>
                      <Undo2 size={14} />
                      Return copy
                    </Button>
                  ) : null}
                </article>
              ))}
            </div>
          </>
        )}
      </Card>

      {issueOpen ? (
        <Modal
          title="Issue a book"
          description="Only books with at least one available copy can be issued. The loan period is 14 days."
          onClose={() => setIssueOpen(false)}
        >
          <IssueForm books={books} onSubmit={handleIssue} onCancel={() => setIssueOpen(false)} />
        </Modal>
      ) : null}

      {pendingReturn ? (
        <ConfirmDialog
          title={`Return “${pendingReturn.bookTitle}”?`}
          description={`This marks the copy issued to ${pendingReturn.borrowerName} as returned and puts one copy back on the shelf.`}
          confirmLabel="Return copy"
          onClose={() => setPendingReturn(null)}
          onConfirm={handleReturn}
        />
      ) : null}
    </div>
  )
}

function StatusBadge({ transaction }: { transaction: Transaction }) {
  const status = getDisplayStatus(transaction)
  if (status === 'returned') {
    return <Badge tone="neutral">Returned</Badge>
  }
  if (status === 'overdue') {
    return <Badge tone="danger">Overdue</Badge>
  }
  return <Badge tone="accent">Issued</Badge>
}
