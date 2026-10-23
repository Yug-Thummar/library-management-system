import { BOOK_CATEGORIES, type Book, type BookInput, type IssueInput } from '../types'

export function isBookCategory(value: string): value is BookInput['category'] {
  return (BOOK_CATEGORIES as readonly string[]).includes(value)
}

export function validateBookInput(input: BookInput, existing?: Book): string | null {
  const title = input.title.trim()
  const author = input.author.trim()
  const isbn = input.isbn.trim()

  if (!title) {
    return 'Title is required.'
  }
  if (title.length < 2) {
    return 'Title must be at least 2 characters.'
  }
  if (!author) {
    return 'Author is required.'
  }
  if (!isBookCategory(input.category)) {
    return 'Please choose a valid category.'
  }
  if (isbn && !isValidIsbn(isbn)) {
    return 'ISBN must contain 10 or 13 digits. Hyphens are allowed.'
  }
  if (!Number.isInteger(input.totalCopies) || input.totalCopies < 1) {
    return 'Total copies must be a whole number of at least 1.'
  }
  if (input.totalCopies > 50) {
    return 'Total copies cannot be more than 50 in this mini project.'
  }
  if (existing) {
    const issuedCopies = existing.totalCopies - existing.availableCopies
    if (input.totalCopies < issuedCopies) {
      return `This title already has ${issuedCopies} issued ${issuedCopies === 1 ? 'copy' : 'copies'}. Total copies cannot go below that number.`
    }
  }

  return null
}

export function validateIssueInput(input: IssueInput): string | null {
  const borrowerName = input.borrowerName.trim()
  const studentId = input.studentId.trim()

  if (!input.bookId) {
    return 'Please select a book to issue.'
  }
  if (!borrowerName) {
    return 'Borrower name is required.'
  }
  if (borrowerName.length < 2) {
    return 'Borrower name must be at least 2 characters.'
  }
  if (/^\d+$/.test(borrowerName)) {
    return 'Borrower name cannot be only numbers.'
  }
  if (studentId.length > 24) {
    return 'Student ID is too long.'
  }

  return null
}

export function parseCopyCount(value: string): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : Number.NaN
}

function isValidIsbn(value: string): boolean {
  const compact = value.replace(/[-\s]/g, '')
  return /^\d{10}$/.test(compact) || /^\d{13}$/.test(compact)
}
