import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { BookMarked, BookOpen, HelpCircle, LayoutDashboard, Menu, RotateCcw, X } from 'lucide-react'
import { useLibrary } from '../../context/LibraryContext'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { ToastStack } from '../ui/ToastStack'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/books', label: 'Books', icon: BookOpen },
  { to: '/issues', label: 'Issue & Return', icon: BookMarked },
  { to: '/about', label: 'About / Help', icon: HelpCircle },
]

const pageCopy: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Dashboard',
    subtitle: 'A quiet snapshot of titles, copies, and open loans.',
  },
  '/books': {
    title: 'Books',
    subtitle: 'Add, edit, search, and keep the collection tidy.',
  },
  '/issues': {
    title: 'Issue & Return',
    subtitle: 'Lend an available copy, then return it to the shelf.',
  },
  '/about': {
    title: 'About / Help',
    subtitle: 'How this college mini project stores data in the browser.',
  },
}

export function AppLayout() {
  const location = useLocation()
  const { resetDemoData, warning } = useLibrary()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const copy = pageCopy[location.pathname] ?? pageCopy['/']

  return (
    <div className="min-h-screen bg-paper lg:flex">
      <aside className="hidden w-72 shrink-0 border-r border-line bg-white lg:flex lg:flex-col">
        <Brand />
        <nav className="flex-1 space-y-1 px-4 py-4" aria-label="Main">
          {links.map((link) => (
            <SideLink key={link.to} {...link} />
          ))}
        </nav>
        <div className="border-t border-line p-4">
          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-line px-3 py-2.5 text-sm font-semibold text-muted hover:bg-paper hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
          >
            <RotateCcw size={16} />
            Reset demo data
          </button>
          <p className="mt-3 text-xs leading-5 text-muted">
            Data stays in this browser only. Clearing site data can erase the library.
          </p>
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex h-full w-72 flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between px-2">
              <Brand />
              <button
                type="button"
                className="mr-3 rounded-xl p-2 text-muted hover:bg-paper"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-4 py-4" aria-label="Mobile">
              {links.map((link) => (
                <SideLink key={link.to} {...link} onClick={() => setMobileOpen(false)} />
              ))}
            </nav>
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="rounded-xl border border-line p-2 text-ink lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
                Campus Library
              </p>
              <h1 className="truncate font-serif text-2xl text-ink sm:text-3xl">{copy?.title}</h1>
              <p className="hidden text-sm text-muted sm:block">{copy?.subtitle}</p>
            </div>
          </div>
        </header>

        {warning ? (
          <p className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:px-6 lg:px-8">
            {warning}
          </p>
        ) : null}

        <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          <Outlet />
        </main>

        <nav className="sticky bottom-0 grid grid-cols-4 border-t border-line bg-white lg:hidden" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-2 py-3 text-[11px] font-semibold ${
                  isActive ? 'text-accent' : 'text-muted'
                }`
              }
            >
              <link.icon size={16} />
              {link.label === 'Issue & Return' ? 'Loans' : link.label.replace(' / Help', '')}
            </NavLink>
          ))}
        </nav>
      </div>

      <ToastStack />
      {resetOpen ? (
        <ConfirmDialog
          title="Reset demo data?"
          description="This replaces everything saved in this browser with the sample books and loans. Existing student records on this device will be lost."
          confirmLabel="Reset demo data"
          danger
          onClose={() => setResetOpen(false)}
          onConfirm={() => {
            resetDemoData()
            setResetOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-5 py-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-white shadow-sm">
        <BookOpen size={20} />
      </div>
      <div>
        <p className="font-serif text-lg text-ink">Campus Library</p>
        <p className="text-xs text-muted">Issue desk</p>
      </div>
    </div>
  )
}

function SideLink({
  to,
  label,
  icon: Icon,
  onClick,
}: {
  to: string
  label: string
  icon: typeof BookOpen
  onClick?: () => void
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 ${
          isActive ? 'bg-teal-50 text-accent' : 'text-muted hover:bg-paper hover:text-ink'
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  )
}
