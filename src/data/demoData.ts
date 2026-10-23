import type { Book, StoredLibrary, Transaction } from '../types'
import { addDays, todayISO } from '../utils/dates'

export function createDemoLibrary(): StoredLibrary {
  const today = todayISO()

  const books: Book[] = [
    {
      id: 'bk-001',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      category: 'Fiction',
      isbn: '9780061120084',
      totalCopies: 4,
      availableCopies: 3,
      createdAt: addDays(today, -40),
      updatedAt: addDays(today, -5),
    },
    {
      id: 'bk-002',
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      category: 'Science',
      isbn: '9780553380163',
      totalCopies: 3,
      availableCopies: 3,
      createdAt: addDays(today, -36),
      updatedAt: addDays(today, -36),
    },
    {
      id: 'bk-003',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      category: 'Technology',
      isbn: '9780132350884',
      totalCopies: 5,
      availableCopies: 5,
      createdAt: addDays(today, -30),
      updatedAt: addDays(today, -30),
    },
    {
      id: 'bk-004',
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      category: 'History',
      isbn: '9780062316097',
      totalCopies: 4,
      availableCopies: 3,
      createdAt: addDays(today, -28),
      updatedAt: addDays(today, -17),
    },
    {
      id: 'bk-005',
      title: 'The Diary of a Young Girl',
      author: 'Anne Frank',
      category: 'Biography',
      isbn: '9780553296983',
      totalCopies: 2,
      availableCopies: 2,
      createdAt: addDays(today, -22),
      updatedAt: addDays(today, -22),
    },
    {
      id: 'bk-006',
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      category: 'Education',
      isbn: '9780262033848',
      totalCopies: 3,
      availableCopies: 3,
      createdAt: addDays(today, -18),
      updatedAt: addDays(today, -18),
    },
    {
      id: 'bk-007',
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      category: 'Literature',
      isbn: '9780141439518',
      totalCopies: 3,
      availableCopies: 3,
      createdAt: addDays(today, -16),
      updatedAt: addDays(today, -6),
    },
  ]

  const transactions: Transaction[] = [
    {
      id: 'tx-001',
      bookId: 'bk-001',
      bookTitle: 'To Kill a Mockingbird',
      borrowerName: 'Ananya Sharma',
      studentId: 'CS2021-014',
      issueDate: addDays(today, -5),
      dueDate: addDays(today, 9),
      returnDate: null,
      status: 'issued',
    },
    {
      id: 'tx-002',
      bookId: 'bk-004',
      bookTitle: 'Sapiens',
      borrowerName: 'Rohan Mehta',
      studentId: 'ME2022-088',
      issueDate: addDays(today, -17),
      dueDate: addDays(today, -3),
      returnDate: null,
      status: 'issued',
    },
    {
      id: 'tx-003',
      bookId: 'bk-007',
      bookTitle: 'Pride and Prejudice',
      borrowerName: 'Kavya Iyer',
      studentId: 'EN2023-041',
      issueDate: addDays(today, -20),
      dueDate: addDays(today, -6),
      returnDate: addDays(today, -6),
      status: 'returned',
    },
  ]

  return {
    version: 1,
    books,
    transactions,
  }
}
