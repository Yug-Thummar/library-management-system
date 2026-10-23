export const BOOK_CATEGORIES = [
  'Fiction',
  'Science',
  'Technology',
  'History',
  'Biography',
  'Education',
  'Literature',
  'Other',
] as const

export type BookCategory = (typeof BOOK_CATEGORIES)[number]

export type Book = {
  id: string
  title: string
  author: string
  category: BookCategory
  isbn: string
  totalCopies: number
  availableCopies: number
  createdAt: string
  updatedAt: string
}

export type BookInput = {
  title: string
  author: string
  category: BookCategory
  isbn: string
  totalCopies: number
}

export type TransactionStatus = 'issued' | 'returned'

export type Transaction = {
  id: string
  bookId: string
  bookTitle: string
  borrowerName: string
  studentId: string
  issueDate: string
  dueDate: string
  returnDate: string | null
  status: TransactionStatus
}

export type IssueInput = {
  bookId: string
  borrowerName: string
  studentId: string
}

export type LibraryStats = {
  totalTitles: number
  totalCopies: number
  availableCopies: number
  issuedCopies: number
  overdueCount: number
}

export type ActivityItem = {
  id: string
  text: string
  detail: string
  kind: 'issued' | 'returned' | 'overdue'
}

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string }

export type StoredLibrary = {
  version: number
  books: Book[]
  transactions: Transaction[]
}
