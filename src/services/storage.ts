import { createDemoLibrary } from '../data/demoData'
import type { Book, StoredLibrary, Transaction } from '../types'
import { BOOK_CATEGORIES } from '../types'

export const STORAGE_KEY = 'campus-library-v1'
export const STORAGE_VERSION = 1

export type LoadResult = {
  data: StoredLibrary
  seeded: boolean
  warning: string | null
}

export function loadLibrary(): LoadResult {
  if (!isLocalStorageAvailable()) {
    return {
      data: createDemoLibrary(),
      seeded: true,
      warning: 'LocalStorage is unavailable in this browser, so demo data will not persist after refresh.',
    }
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === null) {
    const seeded = createDemoLibrary()
    saveLibrary(seeded)
    return { data: seeded, seeded: true, warning: null }
  }

  const parsed = parseStoredLibrary(raw)
  if (!parsed) {
    return {
      data: { version: STORAGE_VERSION, books: [], transactions: [] },
      seeded: false,
      warning: 'Saved library data looked damaged, so the app started empty. Use Reset Demo Data if you want the sample collection again.',
    }
  }

  return { data: parsed, seeded: false, warning: null }
}

export function saveLibrary(data: StoredLibrary): { ok: true } | { ok: false; error: string } {
  if (!isLocalStorageAvailable()) {
    return { ok: false, error: 'LocalStorage is disabled, so changes cannot be saved in this browser.' }
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save library data. Browser storage may be full or blocked.' }
  }
}

export function resetLibrary(): StoredLibrary {
  const seeded = createDemoLibrary()
  saveLibrary(seeded)
  return seeded
}

function parseStoredLibrary(raw: string): StoredLibrary | null {
  try {
    const value: unknown = JSON.parse(raw)
    if (!isRecord(value)) {
      return null
    }

    const books = Array.isArray(value.books) ? value.books.filter(isBook) : null
    const transactions = Array.isArray(value.transactions)
      ? value.transactions.filter(isTransaction)
      : null

    if (!books || !transactions) {
      return null
    }

    return {
      version: STORAGE_VERSION,
      books,
      transactions,
    }
  } catch {
    return null
  }
}

function isBook(value: unknown): value is Book {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.author === 'string' &&
    typeof value.category === 'string' &&
    (BOOK_CATEGORIES as readonly string[]).includes(value.category) &&
    typeof value.isbn === 'string' &&
    Number.isInteger(value.totalCopies) &&
    Number.isInteger(value.availableCopies) &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  )
}

function isTransaction(value: unknown): value is Transaction {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    typeof value.bookId === 'string' &&
    typeof value.bookTitle === 'string' &&
    typeof value.borrowerName === 'string' &&
    typeof value.studentId === 'string' &&
    typeof value.issueDate === 'string' &&
    typeof value.dueDate === 'string' &&
    (value.returnDate === null || typeof value.returnDate === 'string') &&
    (value.status === 'issued' || value.status === 'returned')
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isLocalStorageAvailable(): boolean {
  try {
    const probe = '__lms-probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}
