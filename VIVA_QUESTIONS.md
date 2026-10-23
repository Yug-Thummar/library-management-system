# Viva questions

Short answers you can say out loud. They match what this project actually does.

## 1. What is the aim of this project?

To build a small college library issue desk. A librarian can add books, issue an available copy, return it, and see overdue loans. The app runs in the browser and stores data in LocalStorage, not on a server.

## 2. Why did you choose React?

React lets us split the screen into components: cards, tables, forms, and dialogs. Each page can reuse those parts. That is easier to explain and maintain than one long HTML file.

## 3. What does Vite do?

Vite is the build tool. In development it starts a fast local server. For submission or Vercel it bundles the React app into static files in the `dist` folder.

## 4. Why TypeScript?

TypeScript describes a `Book` and a `Transaction` in one place. If a field is missing or the wrong type, the editor and `npm run build` can catch it before a viva demo.

## 5. What is LocalStorage?

LocalStorage is a key-value store inside the browser. This project saves one JSON string under `campus-library-v1`. The data stays after refresh, but only in that browser on that device.

## 6. Is LocalStorage a database?

No. A database can be queried, shared, backed up, and used by many users at once. LocalStorage is a simple notebook in one browser. If the student clears site data, the library can disappear.

## 7. When is demo data created?

Only when the storage key does not exist yet. If the user later deletes every book, the app does **not** secretly refill the sample set. Reset Demo Data is the only action that puts the sample library back, and it asks for confirmation.

## 8. What is CRUD?

Create, Read, Update, and Delete. In Books, add is create, the table is read, edit is update, and delete removes a title when it has no open issues.

## 9. Which fields are required for a book?

Title, author, category, and total copies. ISBN is optional. Available copies are not typed; the app calculates them.

## 10. How are available copies calculated?

On add, available copies equal total copies. On issue, available copies decrease by one. On return, they increase by one. On edit, `available = newTotal - currentlyIssued`. They cannot go below zero or above total copies.

## 11. Can a user issue a book with zero available copies?

No. Those titles are left out of the issue dropdown, and the issue function also checks `availableCopies < 1` and returns an error.

## 12. What is stored when a book is issued?

Book id, book title, borrower name, optional student ID, issue date, due date (today + 14 days), `returnDate = null`, and `status = issued`. One available copy is removed from the book.

## 13. How does return work?

Return is allowed only when status is `issued`. The app sets `status = returned`, writes today’s date as `returnDate`, and adds one copy back to the book. A second return is rejected.

## 14. How do you know a loan is overdue?

The stored status is still `issued`. If the due date is earlier than today’s date, the UI shows Overdue. Overdue is not a third saved status, so it stays correct when the calendar day changes.

## 15. Why can a book with active issues not be deleted?

Those copies are still with borrowers. Deleting the title would leave loans pointing at a missing book and would hide the inventory problem. The user must return the copies first, or cancel the deletion.

## 16. What validation did you add?

Required title and author, integer copy counts, a maximum of 50 copies, ISBN with 10 or 13 digits if present, borrower name that is not empty or only numbers, and the issued-copy rules above.

## 17. Where does the business logic live?

In `LibraryContext` and a few small helpers (`validation.ts`, `dates.ts`, `library.ts`). Pages do not change copy counts directly. That keeps issue and return consistent.

## 18. How is the UI made responsive?

The desktop layout has a sidebar. Phones get a menu button, a bottom bar, and card lists instead of wide tables. Tailwind breakpoints such as `md` and `lg` switch those layouts.

## 19. How did you keep the design accessible?

Buttons and inputs have labels or `aria-label`s, dialogs use `role="dialog"`, Escape closes a modal, and focus rings are visible. Status is text and a badge, not color alone.

## 20. What is React Router doing here?

It maps `/` to Dashboard, `/books` to Books, `/issues` to Issue & Return, and `/about` to Help. Unknown paths go back to the dashboard.

## 21. Why is `vercel.json` needed?

Vercel must serve `index.html` for client routes such as `/books`. Without that rewrite, a refresh on `/books` can show 404 because those folders do not exist as real files.

## 22. What are the Vercel build settings?

Build command: `npm run build`. Output directory: `dist`. Install command: `npm install`. No environment variables.

## 23. What happens if LocalStorage is blocked or full?

The storage service returns a clear error. The UI can show a warning or toast. The app does not pretend that the save succeeded.

## 24. Why Tailwind CSS and Lucide?

Tailwind keeps spacing and colors consistent without a large CSS file. Lucide gives simple icons for navigation and empty states so the dashboard looks finished without extra image assets.

## 25. What are the main limitations you will tell the examiner?

Data is not shared between users. There is no login. There are no fines or email reminders. Clearing the browser can delete records. This is a mini project, not a production library server.

## 26. How would you add a backend later?

Keep the same `Book` and `Transaction` types. Replace `storage.ts` with API calls. The issue and return rules in `LibraryContext` can stay almost the same. Vercel would then need a server or an external database.

## 27. What is the difference between `status` and the badge on screen?

`status` in storage is only `issued` or `returned`. The badge can be Issued, Overdue, or Returned. Overdue is `issued` plus a late due date.

## 28. How are IDs created?

`createId` uses `crypto.randomUUID` when the browser has it, or a time-and-random fallback. Book ids start with `bk-`, transactions with `tx-`. Demo records use stable ids such as `bk-001`.

## 29. What should you demo in five minutes?

Open Dashboard, show the overdue card, add a book, issue it, return it, refresh to prove persistence, then mention Reset Demo Data and the LocalStorage limit.

## 30. Did you run automated tests?

This repository is checked with the TypeScript build and the project linter. The report’s test table is a manual checklist. Do not claim Selenium or Jest results unless you actually added and ran those tests.
