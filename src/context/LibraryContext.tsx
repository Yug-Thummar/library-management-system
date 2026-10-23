import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { loadLibrary, resetLibrary, saveLibrary } from '../services/storage'
import type { ActionResult, Book, BookInput, IssueInput, LibraryStats, StoredLibrary, Transaction } from '../types'
import { addDays, LOAN_DAYS, todayISO } from '../utils/dates'
import { createId } from '../utils/ids'
import { getLibraryStats } from '../utils/library'
import { validateBookInput, validateIssueInput } from '../utils/validation'
import { useToast } from './ToastContext'

type LibraryContextValue = {
  books: Book[]
  transactions: Transaction[]
  stats: LibraryStats
  warning: string | null
  addBook: (input: BookInput) => ActionResult
  updateBook: (id: string, input: BookInput) => ActionResult
  deleteBook: (id: string) => ActionResult
  issueBook: (input: IssueInput) => ActionResult
  returnBook: (transactionId: string) => ActionResult
  resetDemoData: () => void
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast()
  const initial = loadLibrary()
  const [store, setStore] = useState<StoredLibrary>(initial.data)
  const [warning] = useState<string | null>(initial.warning)

  const persist = (next: StoredLibrary): boolean => {
    const result = saveLibrary(next)
    if (!result.ok) {
      showToast(result.error, 'error')
      return false
    }
    setStore(next)
    return true
  }

  const addBook = (input: BookInput): ActionResult => {
    const error = validateBookInput(input)
    if (error) {
      return { ok: false, error }
    }

    const now = todayISO()
    const book: Book = {
      id: createId('bk'),
      title: input.title.trim(),
      author: input.author.trim(),
      category: input.category,
      isbn: input.isbn.trim(),
      totalCopies: input.totalCopies,
      availableCopies: input.totalCopies,
      createdAt: now,
      updatedAt: now,
    }

    const saved = persist({
      ...store,
      books: [book, ...store.books],
    })
    return saved
      ? { ok: true, message: `“${book.title}” was added to the collection.` }
      : { ok: false, error: 'The book could not be saved.' }
  }

  const updateBook = (id: string, input: BookInput): ActionResult => {
    const existing = store.books.find((book) => book.id === id)
    if (!existing) {
      return { ok: false, error: 'That book could not be found.' }
    }

    const error = validateBookInput(input, existing)
    if (error) {
      return { ok: false, error }
    }

    const issuedCopies = existing.totalCopies - existing.availableCopies
    const updated: Book = {
      ...existing,
      title: input.title.trim(),
      author: input.author.trim(),
      category: input.category,
      isbn: input.isbn.trim(),
      totalCopies: input.totalCopies,
      availableCopies: input.totalCopies - issuedCopies,
      updatedAt: todayISO(),
    }

    const saved = persist({
      ...store,
      books: store.books.map((book) => (book.id === id ? updated : book)),
      transactions: store.transactions.map((item) =>
        item.bookId === id ? { ...item, bookTitle: updated.title } : item,
      ),
    })
    return saved
      ? { ok: true, message: `“${updated.title}” was updated.` }
      : { ok: false, error: 'The book could not be updated.' }
  }

  const deleteBook = (id: string): ActionResult => {
    const existing = store.books.find((book) => book.id === id)
    if (!existing) {
      return { ok: false, error: 'That book could not be found.' }
    }

    const hasActiveIssues = store.transactions.some(
      (item) => item.bookId === id && item.status === 'issued',
    )
    if (hasActiveIssues) {
      return {
        ok: false,
        error: 'This book still has issued copies. Return those copies first, or cancel the deletion.',
      }
    }

    const saved = persist({
      ...store,
      books: store.books.filter((book) => book.id !== id),
    })
    return saved
      ? { ok: true, message: `“${existing.title}” was removed from the collection.` }
      : { ok: false, error: 'The book could not be deleted.' }
  }

  const issueBook = (input: IssueInput): ActionResult => {
    const error = validateIssueInput(input)
    if (error) {
      return { ok: false, error }
    }

    const book = store.books.find((item) => item.id === input.bookId)
    if (!book) {
      return { ok: false, error: 'Please choose a book that still exists in the collection.' }
    }
    if (book.availableCopies < 1) {
      return { ok: false, error: 'No copies of this book are available to issue.' }
    }

    const issueDate = todayISO()
    const transaction: Transaction = {
      id: createId('tx'),
      bookId: book.id,
      bookTitle: book.title,
      borrowerName: input.borrowerName.trim(),
      studentId: input.studentId.trim(),
      issueDate,
      dueDate: addDays(issueDate, LOAN_DAYS),
      returnDate: null,
      status: 'issued',
    }

    const saved = persist({
      books: store.books.map((item) =>
        item.id === book.id
          ? { ...item, availableCopies: item.availableCopies - 1, updatedAt: issueDate }
          : item,
      ),
      transactions: [transaction, ...store.transactions],
      version: store.version,
    })

    return saved
      ? {
          ok: true,
          message: `Issued “${book.title}” to ${transaction.borrowerName}. Due in ${LOAN_DAYS} days.`,
        }
      : { ok: false, error: 'The issue record could not be saved.' }
  }

  const returnBook = (transactionId: string): ActionResult => {
    const transaction = store.transactions.find((item) => item.id === transactionId)
    if (!transaction) {
      return { ok: false, error: 'That issue record could not be found.' }
    }
    if (transaction.status === 'returned') {
      return { ok: false, error: 'This copy has already been returned.' }
    }

    const today = todayISO()
    const saved = persist({
      books: store.books.map((book) => {
        if (book.id !== transaction.bookId) {
          return book
        }
        return {
          ...book,
          availableCopies: Math.min(book.totalCopies, book.availableCopies + 1),
          updatedAt: today,
        }
      }),
      transactions: store.transactions.map((item) =>
        item.id === transactionId
          ? { ...item, status: 'returned', returnDate: today }
          : item,
      ),
      version: store.version,
    })

    return saved
      ? { ok: true, message: `“${transaction.bookTitle}” was returned by ${transaction.borrowerName}.` }
      : { ok: false, error: 'The return could not be saved.' }
  }

  const resetDemoData = () => {
    const next = resetLibrary()
    setStore(next)
    showToast('Demo library data was restored on this browser.', 'success')
  }

  const stats = useMemo(
    () => getLibraryStats(store.books, store.transactions),
    [store.books, store.transactions],
  )

  return (
    <LibraryContext.Provider
      value={{
        books: store.books,
        transactions: store.transactions,
        stats,
        warning,
        addBook,
        updateBook,
        deleteBook,
        issueBook,
        returnBook,
        resetDemoData,
      }}
    >
      {children}
    </LibraryContext.Provider>
  )
}

// Hook lives next to the provider so beginners can find both in one file.
export function useLibrary() {
  const context = useContext(LibraryContext)
  if (!context) {
    throw new Error('useLibrary must be used inside LibraryProvider.')
  }
  return context
}
