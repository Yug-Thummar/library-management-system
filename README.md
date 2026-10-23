# Campus Library

A small college Library Management System for a campus issue desk. A librarian can keep a book catalogue, issue an available copy, return it, and see overdue loans. The app runs entirely in the browser. It uses LocalStorage instead of a backend or database server.

This is a beginner-friendly mini project: one dashboard, a few pages, and clear inventory rules. It is not a multi-user library server.

## Problem solved

Many first-year or second-year project teams need a working library system for a viva, but a full stack with Express and MongoDB is more than the scope allows. Campus Library solves the same classroom problem in a smaller way:

- keep book titles and copy counts
- lend a copy to a student
- return that copy
- stop invalid actions such as issuing a book that is out of stock

The trade-off is honest: data stays on one browser, on one device.

## Objectives

- Build a complete, deployable React + TypeScript dashboard.
- Persist books and issue/return records without a backend.
- Keep inventory and transaction history consistent.
- Validate forms so beginners can explain every rule in a viva.
- Make the interface readable on a laptop, tablet, and phone.
- Deploy the production build as a static site on Vercel.

## Features

- Dashboard cards for total titles, total copies, available copies, currently issued copies, and overdue loans
- Recent activity list and a simple shelf-availability bar
- Book add, edit, delete, search, and category/availability filters
- Issue a copy to a borrower with an optional student ID
- Default 14-day loan period and a clear due date
- Return action that updates both the book and the transaction
- Overdue status from the current date
- Reset Demo Data with a confirmation dialog
- About / Help page that explains LocalStorage limits
- Responsive sidebar, mobile menu, and card layouts on small screens

## Tech stack and why it was chosen

| Tool | Reason |
| --- | --- |
| React | Component UI that is easy to explain in a viva |
| Vite | Fast local dev server and a simple static production build |
| TypeScript | Shared book and transaction types, fewer silent mistakes |
| Tailwind CSS | Consistent spacing, color, and responsive layout without extra CSS files |
| Lucide React | Small, readable icons |
| React Router | Dashboard, Books, Issue & Return, and About as real pages |
| LocalStorage | Persistence without Express, MongoDB, Firebase, or paid APIs |
| npm | Standard install and scripts for a college lab machine |
| Vercel | Free static hosting for a Vite `dist` folder |

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- A modern browser such as Chrome, Edge, or Firefox

Check versions:

```bash
node -v
npm -v
```

## Installation

```bash
cd blog_system
npm install
```

## Run locally

```bash
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`.

Useful scripts:

```bash
npm run lint
npm run build
npm run preview
```

`npm run preview` serves the production build locally after `npm run build`.

## How LocalStorage works

The app writes one JSON object to the browser key `campus-library-v1`.

- The first visit, when that key is missing, seeds a small sample library.
- Later visits load the saved books and transactions. User data is never replaced by demo data automatically.
- **Reset demo data** overwrites the saved object after a confirmation dialog.
- LocalStorage is **browser-specific and device-specific**. A record created in Chrome on a laptop will not appear on a phone, in Firefox, or on another student’s computer.
- Clearing site data, using a private window, or blocking cookies/storage can remove the library.
- If saved JSON is damaged, the app starts empty and shows a warning instead of silently inventing records.

This is not shared storage. It is not a database. Treat it as a notebook that lives inside one browser.

## Data models

### Book

- `id` — stable unique string
- `title`, `author`, `category` — required
- `isbn` — optional, 10 or 13 digits
- `totalCopies` — whole number from 1 to 50
- `availableCopies` — calculated from issues, never typed in by hand
- `createdAt`, `updatedAt` — ISO dates (`YYYY-MM-DD`)

### Transaction

- `id`, `bookId`, `bookTitle`
- `borrowerName` — required
- `studentId` — optional
- `issueDate`, `dueDate`
- `returnDate` — `null` until returned
- `status` — `issued` or `returned`

Overdue is **not** stored. If `status` is `issued` and `dueDate` is before today, the UI shows Overdue.

## Issue and return workflow

1. Choose a book with at least one available copy.
2. Enter the borrower name. Student ID is optional.
3. The app sets today as the issue date and today + 14 days as the due date.
4. Available copies decrease by one.
5. Return marks that transaction as returned, stores today’s return date, and increases available copies by one.
6. A returned transaction cannot be returned again.
7. Available copies never go below 0 or above total copies.
8. A book with open issues cannot be deleted.

## Validation

- Title and author are required.
- Total copies must be a whole number of at least 1.
- Editing total copies cannot go below the number of copies already issued.
- ISBN, if present, must be 10 or 13 digits.
- Borrower name cannot be empty or only digits.
- Unavailable books do not appear as issue options, and the service still rejects them if requested.

## Folder structure

```text
blog_system/
├── index.html
├── package.json
├── vercel.json
├── vite.config.ts
├── README.md
├── PROJECT_REPORT.md
├── VIVA_QUESTIONS.md
├── public/favicon.svg
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── types.ts
    ├── data/demoData.ts
    ├── services/storage.ts
    ├── context/LibraryContext.tsx
    ├── context/ToastContext.tsx
    ├── utils/dates.ts
    ├── utils/ids.ts
    ├── utils/library.ts
    ├── utils/validation.ts
    ├── components/
    ├── pages/
    └── ...
```

## Limitations

- No login, roles, or multi-user sync
- No fines, email reminders, or barcode scanner
- No cloud backup
- Private browsing may drop data when the window closes
- Storage quota is limited by the browser
- This is a teaching project, not a production library system

## Troubleshooting

| Problem | What to try |
| --- | --- |
| `npm` is not recognized | Install Node.js and reopen the terminal |
| Port 5173 is busy | Use the next port Vite suggests, or stop the other app |
| Data disappeared | Check whether you are in another browser, another profile, or a private window |
| Demo books came back | That happens only on a first visit or after **Reset demo data** |
| Blank page after refresh on Vercel | Confirm `vercel.json` rewrites unknown routes to `index.html` |
| Build fails | Run `npm install`, then `npm run build` again and read the first error |

## Vercel deployment

The app is a Vite static site. Build command: `npm run build`. Output directory: `dist`. No environment variables are required.

### Import from Git

1. Push this folder to GitHub, GitLab, or Bitbucket.
2. Open [Vercel](https://vercel.com) and sign in.
3. Click **Add New… → Project** and import the repository.
4. Confirm the settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Deploy. Vercel will install dependencies, build, and publish the `dist` folder.
6. Open the deployment URL and click through Dashboard, Books, Issue & Return, and About.

`vercel.json` already rewrites all paths to `index.html`, so `/books` and `/issues` work after a refresh.

### Vercel CLI (optional)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Use the same build command and `dist` output.

Do not add secrets or `.env` files. This project does not need them.

## Testing checklist

These checks are for a student or examiner to run by hand. This README does not claim that an automated test suite was executed.

- [ ] Dashboard shows the five summary cards
- [ ] Sample books appear on the first visit
- [ ] Adding a book increases titles and copies
- [ ] Editing a title updates later issue rows
- [ ] Deleting a book with an open issue is blocked
- [ ] Issuing a book reduces available copies
- [ ] A book with 0 available copies cannot be issued
- [ ] Returning a book increases available copies and closes the loan
- [ ] Return cannot be clicked twice on the same loan
- [ ] Overdue loans show an Overdue badge
- [ ] Refresh keeps the same data
- [ ] Reset demo data asks for confirmation, then restores the sample set
- [ ] Search and filters work on Books and Issue & Return
- [ ] Layout is usable on a phone-width window
- [ ] Unknown routes return to the dashboard
- [ ] Production build opens with `npm run preview`

## Future scope

- Fine calculation after the due date
- Member records and borrower history
- Export / import JSON backup
- Optional backend if the college later wants shared data
- Printable issue slip

## Viva preparation

Read `VIVA_QUESTIONS.md` and `PROJECT_REPORT.md`. Be ready to explain:

1. Why LocalStorage is not a database
2. How available copies change on issue and return
3. Why overdue is calculated, not stored
4. Why a book with open issues cannot be deleted
5. How Vercel hosts a Vite `dist` folder

## License

Created as an academic mini project. Use and modify for college submission and learning.
