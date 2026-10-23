import { Card } from '../components/ui/Card'
import { LOAN_DAYS } from '../utils/dates'
import { STORAGE_KEY } from '../services/storage'

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Card className="p-6">
        <h2 className="font-serif text-2xl text-ink">What this project does</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Campus Library is a small issue desk for a college mini project. A librarian can keep a book
          catalogue, lend an available copy, return it, and see overdue loans. There is no login and no
          server. Everything is saved in this browser with LocalStorage.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="font-serif text-2xl text-ink">How LocalStorage works here</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-muted">
          <li>Records are stored under the key <code className="rounded bg-paper px-1.5 py-0.5 text-ink">{STORAGE_KEY}</code>.</li>
          <li>Data belongs to this browser on this device. Another student, phone, or Chrome profile will not see it.</li>
          <li>Clearing site data, using private mode, or switching browsers can erase the library.</li>
          <li>Sample books appear only the first time the app has no saved data. Your later edits are not overwritten.</li>
          <li>Use <strong className="text-ink">Reset demo data</strong> in the sidebar if you want the sample collection back. It asks for confirmation first.</li>
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="font-serif text-2xl text-ink">Issue and return rules</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-muted">
          <li>A copy can be issued only when <strong className="text-ink">available copies</strong> is at least 1.</li>
          <li>The default loan period is <strong className="text-ink">{LOAN_DAYS} days</strong>. The due date is shown before you confirm.</li>
          <li>Returning a copy increases available copies and closes that transaction. A returned loan cannot be returned again.</li>
          <li>A book with active issues cannot be deleted until those copies come back.</li>
          <li>Overdue status is calculated from today’s date. It is not stored as a separate field.</li>
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="font-serif text-2xl text-ink">Limits of a browser-only system</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          This is not a multi-user library server. Two people cannot share one live catalogue. There is no
          fine calculation, no email reminder, and no cloud backup. That keeps the project small enough for a
          viva, and honest about what LocalStorage can do.
        </p>
      </Card>
    </div>
  )
}
