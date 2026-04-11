# My Friends App

> A personal contact and community organizer — keep track of friends, partners, notes, and phone numbers organized by group.

---

## Maintenance Rule

**This README is the living documentation of this app.** Every time a new feature is added, a bug is fixed, or anything changes — update the relevant section(s) of this file immediately. Do NOT push to GitHub automatically; only push when explicitly asked.

---

## Table of Contents

1. [App Overview](#app-overview)
2. [All Screens & Features](#all-screens--features)
3. [Data Structure](#data-structure)
4. [Business Logic](#business-logic)
5. [Tech Stack](#tech-stack)
6. [Known Bugs](#known-bugs)
7. [Changelog](#changelog)

---

## App Overview

**My Friends App** is a lightweight personal CRM (Contact Relationship Manager) for organizing people across different communities — gyms, churches, book clubs, neighborhoods, workplaces, etc.

### Purpose
Users can:
- Create named, color-coded groups representing any community or circle
- Add people to those groups with names, partner/spouse info, photos, phone numbers, and notes
- Keep a timestamped note history for each person
- Search and filter within any group
- Recover accidentally deleted groups within 30 days

### Target Users
Anyone who wants a simple, private way to remember people across multiple social circles — without the overhead of a full contacts app or CRM.

### Architecture Summary
- **Frontend:** React single-page app with client-side Zustand state persisted to `localStorage`
- **Backend:** Minimal Hono/Bun stub (ready for future expansion; not actively used for data)
- **Storage:** Browser `localStorage` (no database or authentication currently)
- **Platform:** Web app, mobile-first responsive design

---

## All Screens & Features

### Screen 1 — Groups Page (Home)

**Route:** `/`

The main landing page. Shows all user-created groups.

**Header:**
- Title: "My Friends"
- Counter badge showing how many groups are currently soft-deleted (links to Deleted Groups page)

**Group List:**
- Drag-and-drop reorderable list using `@dnd-kit`
- Each group card displays:
  - Color-coded circular avatar with the group's first letter
  - Group name
  - Number of people in the group
  - **Edit button** → navigates to Edit Group page
  - **Delete button** → soft-deletes the group (moves to Deleted Groups)
  - **Drag handle** (right side) for reordering

**Add Group Dialog (FAB):**
- Floating Action Button (`+`) in bottom-right corner opens a dialog
- Text input for group name (required)
- 32-color palette picker — clicking a color selects it with a checkmark indicator
- **Create** button (disabled when name is empty)

**Empty State:**
- Message shown when no groups exist, prompting user to create their first group

---

### Screen 2 — People Page (Group Detail)

**Route:** `/groups/:groupId`

Shows all people belonging to a specific group.

**Header:**
- Back button → returns to Groups page
- Group name + people count (e.g., "Gym Friends · 12 people")
- **View toggle button** (list / grid icons)
- **Sort menu button** → opens bottom sheet with sort options

**Search Bar:**
- Full-text search filtering by:
  - Person's first/last name
  - Partner/spouse name
  - Note content (any note in history)

**Sort Options (Bottom Sheet):**
- First Name (A–Z)
- Last Name (A–Z)
- Last Update (most recently modified first)
- Per-group preference saved in store

**List View:**
- Full-width cards, each showing:
  - Circular photo or initial avatar
  - Person's full name
  - Partner name (if set)
  - Preview of most recent note
  - **Move button** (right arrow icon) → opens Move to Group sheet
  - **Delete button** → immediately removes person

**Grid View:**
- 2-column layout
- Each card shows photo/avatar, name, note preview
- **Delete button** in top-right corner of card

**Move to Group Sheet:**
- Lists all non-deleted groups except the current one
- Tapping a group moves the person there

**Floating Action Button:**
- `+` button → navigates to Add Person form for this group

---

### Screen 3 — Person Detail Page

**Route:** `/people/:personId`

Full view of a single person's stored information.

**Header:**
- Back button → returns to the person's group
- **Edit button** → navigates to Edit Person form

**Profile Section:**
- Large circular photo (if set) or initial avatar
- Full name
- Partner/spouse name (if set)

**Phone Numbers Section:**
- Lists all stored phone numbers with their label (Mobile, Home, Work, Other)
- Each number has:
  - **Edit button** → opens inline edit dialog (label + number fields)
  - **Delete button** with confirmation dialog
- Empty state if no numbers stored

**Notes History Section:**
- Chronological list of all notes (oldest → newest)
- Each note shows:
  - Full note text
  - Formatted timestamp: `Day, Month Date, Year at HH:MM AM/PM`
  - **Edit button** → inline editing of note content
  - **Delete button** with confirmation dialog
- Buttons reveal on hover (desktop) / always visible (mobile)
- Empty state if no notes recorded

---

### Screen 4 — Person Form Page (Add / Edit)

**Routes:**
- Add: `/groups/:groupId/add`
- Edit: `/people/:personId/edit`

Used to create a new person or modify an existing one.

**Header:**
- "Add Person" or "Edit Person" depending on mode
- Back button:
  - Add mode → returns to group
  - Edit mode → returns to person detail

**Photo Section:**
- Circular photo preview (or placeholder avatar)
- **Choose Photo / Change Photo** button → opens device file picker
  - Image compressed to max 800px on longest side
  - JPEG quality: 0.8
  - Stored as base64 string
- **Remove Photo** button (shown only when photo exists)

**Name Field:**
- Text input, required
- Validation prevents saving with empty name

**Partner/Spouse Toggle:**
- Checkbox: "Has partner/spouse"
- When checked: reveals Partner Name input field
- When unchecked: hides and clears partner name

**Phone Numbers Section:**
- Dynamic list of phone number rows
- Each row:
  - **Label button** (cycles: Mobile → Home → Work → Other → Mobile on each click)
  - Phone number text input
  - **Remove button** (shown when row has content or there is more than one row)
- **Add Phone** button appends a new empty row
- Always shows at least one empty row

**Note Field:**
- Textarea for adding a note
- Add mode: "Add a note about this person…"
- Edit mode: "Add a new note (appended to history)…"
- On save in edit mode: creates a new timestamped entry in note history (does not overwrite)

**Save Button:**
- Shows loading state while saving
- Disabled when name is empty

---

### Screen 5 — Edit Group Page

**Route:** `/groups/:groupId/edit`

Modify an existing group's name and color.

**Header:**
- Back button → returns to Groups page
- Save button (in header, right side)

**Form:**
- Group name input (required, pre-filled)
- 32-color palette picker (pre-selected to current color)
- Save button at bottom (duplicate of header button)

**Validation:**
- Cannot save with empty name

---

### Screen 6 — Deleted Groups Page

**Route:** `/deleted-groups`

A recovery page for soft-deleted groups. Groups are permanently removed after 30 days.

**Header:**
- Back button → returns to Groups page
- Info banner: "Groups are permanently deleted after 30 days"

**Deleted Group List:**
- Each entry shows:
  - Faded color avatar
  - Group name
  - Number of people in the group (including soft-deleted people in that group)
  - Countdown: "X days left" before permanent deletion
- **Restore button** (green, undo icon) → moves group back to active; people re-appear in group
- **Permanent Delete button** (red trash icon) → opens confirmation dialog, then permanently removes group and all its people

**Empty State:**
- Message shown when no deleted groups exist

**Auto-Cleanup:**
- On page load, `cleanupExpiredDeletions()` runs automatically to purge any groups/people past the 30-day window

---

### Screen 7 — Not Found Page

**Route:** `/*` (catch-all)

**Content:**
- "404 — Oops! Page not found"
- "Return to Home" link

---

## Data Structure

### Types (defined in `webapp/src/types/app.ts`)

#### `Note`
| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (UUID-style) |
| `content` | `string` | Note text |
| `timestamp` | `number` | Unix timestamp (ms) when note was created or last edited |

#### `PhoneNumber`
| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `number` | `string` | Phone number string (no format validation) |
| `label` | `string` | One of: `"Mobile"`, `"Home"`, `"Work"`, `"Other"` |
| `timestamp` | `number` | Unix timestamp (ms) when added |

#### `Person`
| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `name` | `string` | Full name (required) |
| `partnerName` | `string?` | Partner or spouse name (optional) |
| `photoUri` | `string?` | Legacy photo URI (unused) |
| `photoBase64` | `string?` | Compressed base64-encoded photo |
| `notes` | `string?` | Legacy single note field (deprecated) |
| `noteHistory` | `Note[]` | Ordered array of timestamped notes |
| `phoneNumbers` | `PhoneNumber[]` | Array of labeled phone numbers |
| `groupId` | `string` | ID of the group this person belongs to |
| `createdAt` | `number` | Unix timestamp (ms) |
| `lastUpdated` | `number` | Unix timestamp (ms) of most recent change |
| `deletedAt` | `number?` | Unix timestamp (ms) if soft-deleted |

#### `Group`
| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `name` | `string` | Group name (required) |
| `color` | `string` | Hex color string (e.g., `#3B82F6`) |
| `createdAt` | `number` | Unix timestamp (ms) |
| `deletedAt` | `number?` | Unix timestamp (ms) if soft-deleted |
| `order` | `number?` | Sort index for drag-and-drop ordering |

#### `GroupViewPreferences`
| Field | Type | Description |
|-------|------|-------------|
| `viewMode` | `"list" \| "grid"` | Current view mode for this group |
| `sortMode` | `"firstName" \| "lastName" \| "lastUpdate"` | Current sort for this group |

### State (Zustand Store — `webapp/src/store/useAppStore.ts`)

**Persisted to:** `localStorage` key `my-friends-app-storage`

```
AppState
├── groups: Group[]
├── people: Person[]
└── groupViewPreferences: Record<string, GroupViewPreferences>
```

**Actions:**
| Action | Description |
|--------|-------------|
| `addGroup(name, color)` | Creates new group |
| `updateGroup(id, name, color)` | Updates group name/color |
| `deleteGroup(id)` | Soft-deletes group (sets `deletedAt`) |
| `restoreGroup(id)` | Clears `deletedAt` on group |
| `permanentlyDeleteGroup(id)` | Removes group and all its people from store |
| `reorderGroups(ids)` | Updates `order` field on all groups |
| `setGroupViewPreferences(groupId, prefs)` | Saves view/sort mode per group |
| `getGroupViewPreferences(groupId)` | Returns view/sort prefs for a group |
| `addPerson(groupId, data)` | Creates new person in a group |
| `updatePerson(id, updates)` | Partial update on person fields |
| `deletePerson(id)` | Immediately removes person from store |
| `addNoteToHistory(personId, content)` | Appends timestamped note to person |
| `editNote(personId, noteId, content)` | Updates note content |
| `deleteNote(personId, noteId)` | Removes note from person's history |
| `addPhoneNumber(personId, number, label)` | Adds phone number to person |
| `editPhoneNumber(personId, phoneId, number, label)` | Updates phone number |
| `deletePhoneNumber(personId, phoneId)` | Removes phone number |
| `cleanupExpiredDeletions()` | Permanently removes groups/people deleted >30 days ago |

---

## Business Logic

### Soft Delete & Recovery

Groups are soft-deleted by setting `deletedAt` to the current timestamp. They remain in the store and are simply filtered out of normal views. People in soft-deleted groups are also hidden.

The Deleted Groups page computes days remaining as:
```
daysLeft = 30 - Math.floor((now - group.deletedAt) / ONE_DAY_MS)
```

On load, `cleanupExpiredDeletions()` scans all groups and people where `deletedAt` is older than 30 days and permanently removes them.

Restoring a group clears its `deletedAt` — it and its people reappear in normal views immediately.

### Drag-and-Drop Reordering

Groups are ordered by their `order` field (ascending). When the user drops a group in a new position, `reorderGroups()` is called with the full ordered array of IDs, which reassigns `order` values (0, 1, 2, …) to match.

### Person Photo Storage

Photos are selected via the browser's `<input type="file">`. A `<canvas>` element resizes the image to a max of 800px on the longest side at 0.8 JPEG quality, then encodes it to a base64 string. This string is stored directly in the Zustand store (and thus in `localStorage`). There is no external image hosting.

### Note History

Notes are append-only per person. Editing a note in the detail view updates the `content` field of the existing `Note` object (and updates its `timestamp`). Adding a new note in the edit form appends a new `Note` with a fresh ID and timestamp. Notes cannot be reordered.

### Phone Number Editing (Edit Mode)

The edit form tracks the original set of phone number IDs. On save:
1. Phone numbers that exist in both original and current → `editPhoneNumber()` called for each
2. Phone numbers in current but not original → `addPhoneNumber()` called
3. Phone numbers in original but not current → `deletePhoneNumber()` called

### Search Filtering

On the People page, a search query filters people where any of the following match (case-insensitive):
- `person.name`
- `person.partnerName`
- Any `note.content` in `person.noteHistory`

### Sort Modes

| Mode | Sort Key |
|------|----------|
| `firstName` | First word of `person.name` (A–Z) |
| `lastName` | Last word of `person.name` (A–Z) |
| `lastUpdate` | `person.lastUpdated` (newest first) |

Sort and view mode are stored per-group in `groupViewPreferences`.

---

## Tech Stack

### Frontend (`webapp/`)

| Category | Library | Version | Notes |
|----------|---------|---------|-------|
| Framework | React | 18.3.1 | |
| Bundler | Vite | 5.4.21 | |
| Language | TypeScript | 5.9.3 | |
| Routing | React Router | 6.30.2 | v6 with dynamic params |
| State | Zustand | 5.0.12 | With `persist` middleware to localStorage |
| Async State | TanStack Query | 5.90.10 | Installed, not actively used |
| UI Base | shadcn/ui + Radix UI | v1 | 44 pre-built components |
| Styling | Tailwind CSS | 3.4.18 | Utility-first |
| Icons | lucide-react | 0.462.0 | |
| Animation | Framer Motion | 12.23.28 | |
| Drag & Drop | @dnd-kit/core + sortable | 6.3.1 / 10.0.0 | Group reordering |
| Forms | React Hook Form | 7.66.1 | With Zod resolvers |
| Validation | Zod | 3.25.76 | |
| Dates | date-fns | 3.6.0 | Installed; some custom formatting used |
| Toast | Sonner | 1.7.4 | |
| Drawer | Vaul | 0.9.9 | Bottom sheets |
| Theme | next-themes | 0.3.0 | |

### Backend (`backend/`)

| Category | Library | Version | Notes |
|----------|---------|---------|-------|
| Runtime | Bun | latest | Fast JS runtime |
| Framework | Hono | 4.6.0 | Lightweight web framework |
| Validation | Zod | 4.1.11 | |
| Language | TypeScript | 5.8.3 | |

> **Note:** The backend is currently a minimal stub. All data is stored in the browser's `localStorage` via the frontend Zustand store. The backend is ready for future expansion (Prisma + Better Auth are available as packages).

---

## Known Bugs

| # | Description | Severity | Status |
|---|-------------|----------|--------|
| 1 | **No phone number validation** — any string is accepted as a phone number, including empty strings if the user bypasses the UI | Low | Open |
| 2 | **localStorage size limits** — photos stored as base64 can consume megabytes; no guard against hitting the ~5MB browser localStorage cap | Medium | Open |
| 3 | **Person delete is immediate** — deleting a person from a group has no soft-delete or recovery, unlike groups | Medium | Open |
| 4 | **No authentication** — all data is local to the browser; if local storage is cleared, all data is lost | High | By design (for now) |
| 5 | **Back-from-edit navigation** — returning from the edit screen may not always restore the correct scroll position | Low | Investigated |

---

## Changelog

All changes are listed newest-first.

---

### 2026-04-11 — Comprehensive README created

- Created full living documentation covering all screens, data models, business logic, tech stack, known bugs, and changelog.

---

### Prior (reconstructed from git history)

#### Group Management
- Added drag-and-drop reordering of groups via `@dnd-kit`
- Added soft-delete for groups with 30-day recovery window (Deleted Groups page)
- Added color picker (32 colors) for group creation and editing
- Added edit group page with name and color fields

#### People Management
- Added Person Detail page with full note history and phone number sections
- Added Add/Edit Person form with photo upload, partner toggle, phone numbers, and note field
- Added inline edit/delete for individual notes and phone numbers
- Added move-to-group functionality from People page
- Added list and grid view modes with per-group persistence
- Added sort options: First Name, Last Name, Last Update
- Added full-text search across names, partner names, and notes

#### Navigation & UX
- Fixed back-from-edit navigation to return to correct screen
- Added delete/restore function on groups
- Improved video and media handling on form screens
