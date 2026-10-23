import type { ActivityItem, Book, LibraryStats, Transaction } from '../types'
import { dueLabel, formatDate, isPastDate, todayISO } from './dates'

export function getIssuedCopies(book: Book): number {
  return book.totalCopies - book.availableCopies
}

export function getDisplayStatus(transaction: Transaction, today = todayISO()): 'issued' | 'returned' | 'overdue' {
  if (transaction.status === 'returned') {
    return 'returned'
  }
  return isPastDate(transaction.dueDate, today) ? 'overdue' : 'issued'
}

export function getLibraryStats(books: Book[], transactions: Transaction[], today = todayISO()): LibraryStats {
  return {
    totalTitles: books.length,
    totalCopies: books.reduce((sum, book) => sum + book.totalCopies, 0),
    availableCopies: books.reduce((sum, book) => sum + book.availableCopies, 0),
    issuedCopies: transactions.filter((item) => item.status === 'issued').length,
    overdueCount: transactions.filter((item) => getDisplayStatus(item, today) === 'overdue').length,
  }
}

export function getRecentActivity(transactions: Transaction[], today = todayISO()): ActivityItem[] {
  return [...transactions]
    .sort((a, b) => {
      const aDate = a.returnDate ?? a.issueDate
      const bDate = b.returnDate ?? b.issueDate
      return bDate.localeCompare(aDate) || b.id.localeCompare(a.id)
    })
    .slice(0, 6)
    .map((item) => {
      const status = getDisplayStatus(item, today)
      if (status === 'returned') {
        return {
          id: item.id,
          kind: 'returned',
          text: `${item.borrowerName} returned “${item.bookTitle}”`,
          detail: item.returnDate ? formatDate(item.returnDate) : formatDate(item.issueDate),
        }
      }
      if (status === 'overdue') {
        return {
          id: item.id,
          kind: 'overdue',
          text: `${item.borrowerName} still has “${item.bookTitle}”`,
          detail: dueLabel(item.dueDate, item.status, today),
        }
      }
      return {
        id: item.id,
        kind: 'issued',
        text: `Issued “${item.bookTitle}” to ${item.borrowerName}`,
        detail: dueLabel(item.dueDate, item.status, today),
      }
    })
}

export function bookMatchesQuery(book: Book, query: string): boolean {
  const haystack = `${book.title} ${book.author} ${book.isbn} ${book.category}`.toLowerCase()
  return haystack.includes(query.trim().toLowerCase())
}

export function transactionMatchesQuery(transaction: Transaction, query: string): boolean {
  const haystack = `${transaction.bookTitle} ${transaction.borrowerName} ${transaction.studentId}`.toLowerCase()
  return haystack.includes(query.trim().toLowerCase())
}
