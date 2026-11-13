# Editable tasks and workload implementation plan

Approved 2026-10-27: implement the three roadmap items. This extends the initial read-only design; references and journal files remain read-only in the browser.

## Decisions

- Keep dependency-free Node and project Markdown. Add create/update task endpoints, no deletion or arbitrary file writes.
- Use one primary category per task: the six proposed roadmap categories plus Uncategorized. Existing records are not recategorized automatically.
- Configured taskRoot is the only writable directory per project, must be within a configured read root. Docker mounts only each tasks directory read-write, with parent journal/reference roots still read-only.
- Browser creates tasks and edits title, summary, body, status, priority and category. Existing task ID/project cannot be changed. Quick complete/reopen actions use the same safe-save path.
- SHA-256 revision checks detect stale browser edits. Serialize app saves using an exclusive task-directory lock; backup prior contents, write/sync a temporary file and rename atomically. Check revision again before replace. External editors should avoid editing during a save; there is no cross-program filesystem compare-and-swap guarantee.
- Require same Origin, a per-process token obtained via the same-origin catalog, application/json, bounded payloads and existing Host/fetch-site checks. No authentication claims beyond this localhost-only personal app.
- Keep created_at/completed_at metadata and date of latest update. Done tasks without completion dates remain undated; reopening clears the current completed_at, while snapshots preserve prior versions.
- Workload is counts by category and project, status distribution, completed today/last seven calendar days in the client's timezone, plus dated recent updates. No time tracking, effort inference, deadlines or capacity estimates.

## Tasks

- [x] Add failing storage/metadata/filter/workload tests, then implement category/date fields, safe task storage, conflict and backup behavior.
- [x] Add failing HTTP write tests, then implement constrained endpoints and request protections.
- [x] Implement task editor, status buttons, category filters and workload views; browser-test create/edit/complete/reopen and conflict retention.
- [x] Enable only approved task directory mounts, update authoring/docs and backlog evidence, rebuild Docker, verify persistence and reference read-only protections.
- [x] Independent review and final verification, update journal and record results.

## Review focus

Stale updates must retain external edits and user drafts; malformed source metadata must not be silently rewritten; filesystem symlinks and arbitrary IDs must not escape task roots; reference/journal writes must be impossible; completion counts must not fabricate dates; write errors must be visible and preserve drafts.

## Ledger

- Existing workspace is not a Git repository; modify this application in place and preserve its current data.
- The user has explicitly authorized the formerly planned editing behavior, including the narrow write-mount changes needed for it.
