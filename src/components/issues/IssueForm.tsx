import { useMemo, useState, type FormEvent } from 'react'
import type { Book, IssueInput } from '../../types'
import { addDays, formatDate, LOAN_DAYS, todayISO } from '../../utils/dates'
import { Button } from '../ui/Button'
import { Field, SelectInput, TextInput } from '../ui/Field'

export function IssueForm({
  books,
  onSubmit,
  onCancel,
}: {
  books: Book[]
  onSubmit: (input: IssueInput) => string | null
  onCancel: () => void
}) {
  const availableBooks = useMemo(
    () => books.filter((book) => book.availableCopies > 0),
    [books],
  )
  const [bookId, setBookId] = useState(availableBooks[0]?.id ?? '')
  const [borrowerName, setBorrowerName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const selectedBook = books.find((book) => book.id === bookId)
  const dueDate = formatDate(addDays(todayISO(), LOAN_DAYS))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const result = onSubmit({ bookId, borrowerName, studentId })
    setError(result)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Book">
        <SelectInput value={bookId} onChange={(event) => setBookId(event.target.value)}>
          {availableBooks.length === 0 ? <option value="">No copies available</option> : null}
          {availableBooks.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title} — {book.availableCopies} available
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Borrower name">
        <TextInput
          value={borrowerName}
          onChange={(event) => setBorrowerName(event.target.value)}
          placeholder="Ananya Sharma"
        />
      </Field>
      <Field label="Student ID" hint="Optional, useful for college records.">
        <TextInput
          value={studentId}
          onChange={(event) => setStudentId(event.target.value)}
          placeholder="CS2021-014"
        />
      </Field>
      <div className="rounded-xl bg-paper px-4 py-3 text-sm leading-6 text-muted">
        Issued today. Default loan period is <strong className="text-ink">{LOAN_DAYS} days</strong>, so this
        copy will be due on <strong className="text-ink">{dueDate}</strong>
        {selectedBook ? ` for “${selectedBook.title}”.` : '.'}
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={availableBooks.length === 0}>
          Issue copy
        </Button>
      </div>
    </form>
  )
}
