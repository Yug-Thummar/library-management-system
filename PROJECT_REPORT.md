# Project Report

## Title page

**Project title:** Campus Library — A Browser-Based Library Management System

**Submitted by:** ________________________________

**Roll number / enrollment:** ________________________________

**Class / semester / section:** ________________________________

**Guide / mentor:** ________________________________

**Department:** ________________________________

**College / institute:** ________________________________

**Academic year:** ________________________________

**Submission date:** ________________________________

---

## Abstract

Campus Library is a small Library Management System built as a college mini project. It helps a campus issue desk keep book records, lend available copies, and take those copies back. The interface is a React dashboard with pages for overview, books, issue and return, and help.

The project avoids a backend on purpose. Books and transactions are stored in the browser with LocalStorage. This keeps installation simple and makes the inventory rules easy to demonstrate in a viva. The same choice also limits the system: data is not shared between users or devices, and clearing browser storage can erase records. The report describes the problem, the proposed design, the data models, the issue/return workflow, implementation notes, a manual test checklist, limitations, and future work.

## 1. Introduction

College libraries still do a lot of daily work by hand: writing borrower names, counting copies, and checking due dates. A full digital library with servers, logins, and reports is useful, but it is heavy for a short academic project.

This project implements a compact issue desk. A student can run it with Node.js, open it in a browser, and deploy the built files to Vercel. The goal is a complete, honest application rather than a large system with unfinished pages.

## 2. Problem statement

A small campus library needs a way to:

- record book titles and how many copies exist
- issue a copy only when one is available
- record who borrowed it and when it is due
- return the copy and restore inventory
- see overdue loans
- keep data after a page refresh

A server-based solution can do this, but it adds hosting, a database, and more setup than many mini-project labs allow. The problem, then, is to build a working library desk that a beginner can install, explain, and deploy, using only the browser for storage.

## 3. Objectives

1. Design a clean, responsive library dashboard.
2. Implement book create, read, update, delete, search, and filter.
3. Implement issue and return with a 14-day loan period.
4. Keep available copies consistent with open transactions.
5. Persist data in LocalStorage with safe JSON parsing and demo seeding.
6. Document the system for submission and viva.
7. Deploy the project as a Vite static site on Vercel.

## 4. Scope

**In scope**

- One-user dashboard in a single browser
- Books, issue/return, dashboard statistics, and help
- Client-side validation
- Demo data and a reset action
- Vercel static deployment

**Out of scope**

- Login and user roles
- Shared data across computers
- Fine collection, SMS or email alerts
- Barcode or RFID hardware
- Admin reports beyond the dashboard cards

## 5. Existing system vs proposed system

| Existing / typical college practice | Proposed system |
| --- | --- |
| Paper registers or spreadsheets | Structured book and transaction records |
| Copy counts updated by hand | Available copies change only through issue and return |
| Due dates easy to miss | Overdue badge based on today’s date |
| Data lives in one notebook | Data lives in one browser, with a documented limit |
| Difficult to demo in a lab | Runs locally and on Vercel without a database |

The proposed system is smaller than Koha, Soul, or a custom MERN library. That is intentional. It is a teaching model of the issue desk, not a replacement for a college library server.

## 6. Requirements

### Functional requirements

- The system shall show totals for titles, copies, available copies, issued copies, and overdue loans.
- The system shall allow adding, editing, deleting, searching, and filtering books.
- The system shall reject invalid copy counts and incomplete required fields.
- The system shall refuse to delete a book that still has issued copies.
- The system shall issue a copy only when at least one copy is available.
- The system shall store borrower name, optional student ID, issue date, due date, return date, and status.
- The system shall return a copy once, restore inventory, and block a second return.
- The system shall seed demo data only when no saved library exists.
- The system shall provide a confirmed reset to demo data.

### Non-functional requirements

- The interface should remain usable on desktop, tablet, and mobile widths.
- Contrast, labels, and focus states should support keyboard use.
- Persistence should survive a normal refresh in the same browser.
- The production build should be static files suitable for Vercel.

### Hardware and software

- A computer with Node.js and npm
- Any modern desktop or mobile browser
- Optional: a Git hosting account and a Vercel account for deployment

## 7. Architecture

The application is a single-page React app.

```text
Browser
  └── React UI (pages + reusable components)
        └── LibraryContext (business rules)
              └── storage.ts (LocalStorage JSON)
```

- **Pages** render dashboard cards, tables, and forms.
- **LibraryContext** is the only place that changes inventory and transactions.
- **storage.ts** reads and writes one versioned JSON object.
- **React Router** switches between `/`, `/books`, `/issues`, and `/about`.
- **Vite** bundles the app into the `dist` folder. Vercel hosts those files and rewrites unknown paths to `index.html`.

There is no API layer and no environment-variable configuration.

## 8. Module descriptions

### Dashboard

Shows five summary cards, a recent-activity list, and a simple available-versus-issued bar. The overdue count uses the current date.

### Books

Catalogue management. Add and edit open in an accessible modal. Tables become cards on small screens. Available copies are shown but not typed, because they are derived from open loans.

### Issue & Return

Creates a loan, shows due dates in plain language, and offers Return only on open loans. Filters cover issued, returned, and overdue.

### About / Help

Explains LocalStorage, the 14-day loan, deletion rules, and why the system cannot be shared across users.

### Storage service

Loads JSON, validates the shape of books and transactions, seeds demo data when the key is missing, and reports a warning if storage is blocked or the file is damaged.

## 9. Data models

### Book

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Created once, never reused for another title |
| title | string | Required |
| author | string | Required |
| category | union | Fiction, Science, Technology, History, Biography, Education, Literature, Other |
| isbn | string | Optional |
| totalCopies | number | 1–50 |
| availableCopies | number | 0 to totalCopies |
| createdAt / updatedAt | string | `YYYY-MM-DD` |

### Transaction

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Unique loan id |
| bookId | string | Points to a book |
| bookTitle | string | Snapshot, updated if the title is edited |
| borrowerName | string | Required |
| studentId | string | Optional |
| issueDate | string | Today when issued |
| dueDate | string | Issue date + 14 days |
| returnDate | string or null | Set on return |
| status | `issued` or `returned` | Overdue is computed |

Stored document:

```json
{
  "version": 1,
  "books": [],
  "transactions": []
}
```

Key: `campus-library-v1`.

## 10. Algorithms and workflows

### First load

1. Read `campus-library-v1`.
2. If the key is missing, write demo data and use it.
3. If JSON cannot be parsed or required fields are wrong, start empty and show a warning.
4. If JSON is valid, use it even when the arrays are empty.

### Add book

1. Validate title, author, category, ISBN, and total copies.
2. Set `availableCopies = totalCopies`.
3. Save.

### Edit book

1. Find the book.
2. `issued = totalCopies - availableCopies`.
3. Reject the edit if the new total is less than `issued`.
4. Set `availableCopies = newTotal - issued`.
5. Update the stored title on related transactions.

### Delete book

1. If any transaction for that book is still `issued`, stop and tell the user to return those copies.
2. Otherwise remove the book. Returned history remains.

### Issue

1. Validate borrower fields and book id.
2. Reject the action if `availableCopies < 1`.
3. Create a transaction with `dueDate = today + 14`.
4. Decrease `availableCopies` by 1.

### Return

1. Reject the action if the transaction is already `returned`.
2. Set `status = returned` and `returnDate = today`.
3. Increase `availableCopies` by 1, but never above `totalCopies`.

### Overdue

`status === 'issued' AND dueDate < today`.

## 11. Implementation

The implementation uses React 19, Vite, TypeScript, Tailwind CSS, Lucide icons, and React Router 6.

Important source files:

- `src/types.ts` — shared types
- `src/services/storage.ts` — LocalStorage read/write
- `src/context/LibraryContext.tsx` — inventory rules
- `src/utils/validation.ts` — form rules
- `src/utils/dates.ts` — loan period and date labels
- `src/pages/` — the four screens
- `src/components/` — layout, forms, modal, badges, toasts

Styling uses a warm paper background, white cards, charcoal text, and a single teal accent. Forms open in dialogs with labels, cancel actions, and visible focus rings.

## 12. Test cases and results

The cases below are a **manual checklist** for the student and examiner. This report does not invent automated test runs or claim that a CI suite was executed.

| ID | Case | Expected result | How to run |
| --- | --- | --- | --- |
| T01 | First visit | Sample books and three demo loans appear | Open the app in a browser with no saved key |
| T02 | Refresh | Same books and loans remain | Reload the page |
| T03 | Add book | New title appears; available copies equal total copies | Books → Add book |
| T04 | Empty title | Form shows an error; nothing is saved | Submit the book form with a blank title |
| T05 | Edit copies too low | Edit is rejected if copies are already issued | Lower total copies below the issued count |
| T06 | Delete open loan | Deletion is blocked with an error toast | Delete a book that is currently issued |
| T07 | Issue available book | Available copies decrease by 1; a loan row appears | Issue & Return → Issue book |
| T08 | Issue unavailable book | Book is not in the list; service would also reject it | Filter books with none left |
| T09 | Return | Status becomes Returned; available copies increase by 1 | Click Return and confirm |
| T10 | Double return | Return is not offered again; service rejects a second return | Open a returned row |
| T11 | Overdue | Badge shows Overdue when due date is in the past | Use the demo loan for *Sapiens*, or wait past a due date |
| T12 | Reset | Confirmation appears; demo data replaces current data | Sidebar → Reset demo data |
| T13 | Mobile layout | Tables become cards; navigation remains usable | Narrow the browser or use a phone |
| T14 | Unknown URL | App returns to the dashboard | Visit `/missing` locally or on Vercel |

Fill the **Result** column on the printed report after you perform each case (`Pass` / `Fail`). Do not copy imaginary timestamps or screenshots from this template.

## 13. Screenshot placeholders

Attach your own screenshots after running the app. Suggested captures:

**Figure 1 — Dashboard**  
[Insert screenshot]  
Show the five statistic cards, recent activity, and the availability bar.

**Figure 2 — Books page (desktop)**  
[Insert screenshot]  
Show the search bar, a few catalogue rows, and status badges.

**Figure 3 — Add / edit book dialog**  
[Insert screenshot]  
Show the form fields and the note about automatic available copies.

**Figure 4 — Issue & Return**  
[Insert screenshot]  
Show an issued loan, an overdue loan, and a returned loan.

**Figure 5 — Issue dialog**  
[Insert screenshot]  
Show the 14-day due-date explanation.

**Figure 6 — Mobile navigation**  
[Insert screenshot]  
Show the bottom navigation or the hamburger menu on a narrow screen.

**Figure 7 — About / Help**  
[Insert screenshot]  
Show the LocalStorage explanation.

## 14. Limitations

Browser LocalStorage is not a multi-user database. Records stay on one device and one browser profile. Private mode, cleared history, or a full storage quota can remove data. There is no authentication, no concurrent editing, and no server-side audit trail. The loan period is a simple 14-day rule. Fines, reservations, and member cards are not implemented.

These limits are part of the project design. They keep the code small enough to study and they should be stated clearly in the viva.

## 15. Conclusion

Campus Library demonstrates a complete issue-desk workflow with React and LocalStorage. It covers catalogue management, lending, returns, overdue display, and persistence after refresh. The project is suitable as a college mini project because every rule can be traced in a short, readable codebase, and the production build can be hosted on Vercel without a database.

## 16. Future enhancements

- Borrower membership records
- Fine calculation and payment status
- JSON export and import for backups
- Optional shared backend if the department later wants a lab-wide catalogue
- Reservation queue when a title has no available copies
- Printable issue / return slip

## References

- React documentation: https://react.dev
- Vite documentation: https://vite.dev
- TypeScript documentation: https://www.typescriptlang.org
- Tailwind CSS documentation: https://tailwindcss.com
- MDN Web Docs, *Window: localStorage*: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- Vercel documentation: https://vercel.com/docs
- React Router documentation: https://reactrouter.com
