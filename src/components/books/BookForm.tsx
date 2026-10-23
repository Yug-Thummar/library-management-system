import { useState, type FormEvent } from 'react'
import { BOOK_CATEGORIES, type Book, type BookInput } from '../../types'
import { getIssuedCopies } from '../../utils/library'
import { parseCopyCount } from '../../utils/validation'
import { Button } from '../ui/Button'
import { Field, SelectInput, TextInput } from '../ui/Field'

export function BookForm({
  book,
  onSubmit,
  onCancel,
}: {
  book?: Book
  onSubmit: (input: BookInput) => string | null
  onCancel: () => void
}) {
  const [title, setTitle] = useState(book?.title ?? '')
  const [author, setAuthor] = useState(book?.author ?? '')
  const [category, setCategory] = useState(book?.category ?? BOOK_CATEGORIES[0])
  const [isbn, setIsbn] = useState(book?.isbn ?? '')
  const [totalCopies, setTotalCopies] = useState(String(book?.totalCopies ?? 1))
  const [error, setError] = useState<string | null>(null)

  const issuedCopies = book ? getIssuedCopies(book) : 0

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const parsedCopies = parseCopyCount(totalCopies)
    const result = onSubmit({
      title,
      author,
      category,
      isbn,
      totalCopies: parsedCopies,
    })
    setError(result)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Title">
        <TextInput value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Clean Code" />
      </Field>
      <Field label="Author">
        <TextInput
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          placeholder="Robert C. Martin"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <SelectInput
            value={category}
            onChange={(event) => setCategory(event.target.value as BookInput['category'])}
          >
            {BOOK_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="ISBN" hint="Optional. Use 10 or 13 digits.">
          <TextInput
            value={isbn}
            onChange={(event) => setIsbn(event.target.value)}
            placeholder="9780132350884"
          />
        </Field>
      </div>
      <Field
        label="Total copies"
        hint={
          book
            ? `${issuedCopies} currently issued. Available copies update automatically.`
            : 'All new copies start as available.'
        }
      >
        <TextInput
          inputMode="numeric"
          value={totalCopies}
          onChange={(event) => setTotalCopies(event.target.value)}
        />
      </Field>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{book ? 'Save changes' : 'Add book'}</Button>
      </div>
    </form>
  )
}
