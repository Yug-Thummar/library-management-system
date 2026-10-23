import { useMemo, useState } from 'react'
import { BookOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { BookForm } from '../components/books/BookForm'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { SelectInput, TextInput } from '../components/ui/Field'
import { useLibrary } from '../context/LibraryContext'
import { useToast } from '../context/ToastContext'
import { BOOK_CATEGORIES, type Book, type BookInput } from '../types'
import { bookMatchesQuery } from '../utils/library'

type AvailabilityFilter = 'all' | 'available' | 'unavailable'

export function BooksPage() {
  const { books, addBook, updateBook, deleteBook } = useLibrary()
  const { showToast } = useToast()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [availability, setAvailability] = useState<AvailabilityFilter>('all')
  const [editor, setEditor] = useState<Book | 'new' | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Book | null>(null)

  const filtered = useMemo(() => {
    return books.filter((book) => {
      const matchesQuery = query.trim() ? bookMatchesQuery(book, query) : true
      const matchesCategory = category === 'all' ? true : book.category === category
      const matchesAvailability =
        availability === 'all'
          ? true
          : availability === 'available'
            ? book.availableCopies > 0
            : book.availableCopies === 0
      return matchesQuery && matchesCategory && matchesAvailability
    })
  }, [books, query, category, availability])

  const handleSave = (input: BookInput) => {
    const result = editor && editor !== 'new' ? updateBook(editor.id, input) : addBook(input)
    if (!result.ok) {
      return result.error
    }
    showToast(result.message, 'success')
    setEditor(null)
    return null
  }

  const handleDelete = () => {
    if (!pendingDelete) {
      return
    }
    const result = deleteBook(pendingDelete.id)
    if (result.ok) {
      showToast(result.message, 'success')
    } else {
      showToast(result.error, 'error')
    }
    setPendingDelete(null)
  }

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="relative block flex-1">
            <span className="sr-only">Search books</span>
            <Search className="pointer-events-none absolute top-3 left-3 text-muted" size={16} />
            <TextInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, author, ISBN, or category"
              className="pl-9"
            />
          </label>
          <label className="lg:w-44">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Category</span>
            <SelectInput value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All categories</option>
              {BOOK_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectInput>
          </label>
          <label className="lg:w-44">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Availability</span>
            <SelectInput
              value={availability}
              onChange={(event) => setAvailability(event.target.value as AvailabilityFilter)}
            >
              <option value="all">All books</option>
              <option value="available">Available</option>
              <option value="unavailable">None left</option>
            </SelectInput>
          </label>
          <Button onClick={() => setEditor('new')}>
            <Plus size={16} />
            Add book
          </Button>
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={22} />}
            title={books.length === 0 ? 'The shelves are empty' : 'No books match these filters'}
            text={
              books.length === 0
                ? 'Add the first title, or reset demo data from the sidebar to load the sample collection.'
                : 'Try a different search or clear the category and availability filters.'
            }
            action={
              books.length === 0 ? (
                <Button onClick={() => setEditor('new')}>
                  <Plus size={16} />
                  Add book
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-line bg-paper/70 text-xs tracking-wide text-muted uppercase">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Title</th>
                    <th className="px-5 py-3 font-semibold">Author</th>
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 font-semibold">ISBN</th>
                    <th className="px-5 py-3 font-semibold">Copies</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((book) => (
                    <tr key={book.id} className="border-b border-line last:border-0">
                      <td className="px-5 py-4 font-medium text-ink">{book.title}</td>
                      <td className="px-5 py-4 text-muted">{book.author}</td>
                      <td className="px-5 py-4">{book.category}</td>
                      <td className="px-5 py-4 text-muted">{book.isbn || '—'}</td>
                      <td className="px-5 py-4">
                        {book.availableCopies}/{book.totalCopies}
                      </td>
                      <td className="px-5 py-4">
                        <AvailabilityBadge book={book} />
                      </td>
                      <td className="px-5 py-4">
                        <BookActions book={book} onEdit={setEditor} onDelete={setPendingDelete} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-line md:hidden">
              {filtered.map((book) => (
                <article key={book.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-ink">{book.title}</h3>
                      <p className="text-sm text-muted">{book.author}</p>
                    </div>
                    <AvailabilityBadge book={book} />
                  </div>
                  <p className="text-sm text-muted">
                    {book.category} · {book.availableCopies}/{book.totalCopies} copies
                    {book.isbn ? ` · ${book.isbn}` : ''}
                  </p>
                  <BookActions book={book} onEdit={setEditor} onDelete={setPendingDelete} />
                </article>
              ))}
            </div>
          </>
        )}
      </Card>

      {editor ? (
        <Modal
          title={editor === 'new' ? 'Add a book' : 'Edit book'}
          description="Available copies are calculated from total copies minus copies that are currently issued."
          onClose={() => setEditor(null)}
        >
          <BookForm
            book={editor === 'new' ? undefined : editor}
            onSubmit={handleSave}
            onCancel={() => setEditor(null)}
          />
        </Modal>
      ) : null}

      {pendingDelete ? (
        <ConfirmDialog
          title={`Delete “${pendingDelete.title}”?`}
          description="Returned history will stay, but the title will leave the catalogue. If copies are still issued, deletion will be blocked."
          confirmLabel="Delete book"
          danger
          onClose={() => setPendingDelete(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </div>
  )
}

function AvailabilityBadge({ book }: { book: Book }) {
  if (book.availableCopies === 0) {
    return <Badge tone="danger">None left</Badge>
  }
  if (book.availableCopies <= 1) {
    return <Badge tone="warning">Last copy</Badge>
  }
  return <Badge tone="success">Available</Badge>
}

function BookActions({
  book,
  onEdit,
  onDelete,
}: {
  book: Book
  onEdit: (book: Book) => void
  onDelete: (book: Book) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" className="px-3 py-2" onClick={() => onEdit(book)}>
        <Pencil size={14} />
        Edit
      </Button>
      <Button variant="ghost" className="px-3 py-2" onClick={() => onDelete(book)}>
        <Trash2 size={14} />
        Delete
      </Button>
    </div>
  )
}
