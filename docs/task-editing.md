# Task editing and workload

Implemented 2026-10-27 after the user approved the roadmap.

## Use the app

- Open Tasks → New task. Choose a project, category, title, summary, status, priority, and Markdown details, then Save task.
- Open a task → Edit task to change it. Its project and ID remain fixed.
- Use the task checkbox or Mark done / Reopen task buttons. Reopening returns it to To do.
- Filter Tasks by project, category, and status. Workload groups counts by project and category and shows the last seven calendar days.
- Existing tasks without categories appear as Uncategorized. Categories describe the kind of work independently of the project.
- Journals and references remain read-only in the browser. Continue reporting work in chat to update those Markdown records.

## Dates and interpretation

Application dates use the client's current timezone. `date` is the most recent task update, `created_at` is set for new tasks, and `completed_at` is set when a task becomes Done. Reopening clears the current completion date; previous versions retain it. Already-completed older tasks without a completion date stay undated.

Workload shows current task counts, including completed today and in the last seven calendar days. A task's latest update is counted once on its latest date; this is not a complete edit history. Reopened tasks are excluded from completion counts. Counts are not hours, effort, capacity, or activity monitoring.

## Storage and write boundary

Each project has an explicit `taskRoot` inside a readable `roots` directory and an uppercase `taskPrefix`. The app writes only direct Markdown task files in that directory. Create IDs are allocated from existing filenames. It has no delete, move, journal-edit, reference-edit, upload, or shell endpoint.

The portable Docker example has a read-only root filesystem and no writable note mounts, so use it for browsing the synthetic catalog rather than saving edits. A real Docker deployment may add explicit read-only project mounts plus a narrowly writable bind mount for each configured task directory. Native Node has the permissions of its launching user; the app allowlist is not an OS sandbox. Localhost-only publishing, Host/Origin checks, a per-process write token, JSON validation, payload limits, and CSP remain enabled. There are no user accounts: keep it on this computer.

Saves validate metadata, use a task-directory lock, and check a SHA-256 revision before replacing a file. Each update saves the old content in `tasks/.history/`, syncs a temporary file, and renames it over the task. New tasks use an atomic publish that cannot overwrite an existing filename. Hidden snapshots are excluded from the dashboard. This is recovery history, not an off-device backup; any existing folder-synchronization policy still applies.

## Conflicts and recovery

- A stale editor gets an error and keeps its draft. Copy any text you need, then Load latest version and reapply changes. Quick-action conflicts require Refresh before retrying.
- Inputs are disabled while saving or loading a newer version, preventing text typed during a request from being discarded.
- Invalid or unsupported source metadata makes a task read-only until repaired in Markdown. Unknown fields are not silently removed.
- To recover a version, stop the app, preserve the current file, inspect the matching `.history` snapshot, copy its content into the task, and restart/Refresh. Restoring old metadata also restores its status/dates.
- A process crash can leave `tasks/.dashboard-lock`. Stop all dashboard instances first, verify that no save is running, then remove only that empty lock directory. Do not clear it during an active save.
- External editors and file-synchronization tools do not participate in the lock. Revision checks detect normal stale edits, but there is no cross-program filesystem compare-and-swap guarantee. Avoid editing the same file simultaneously during a save.

Categories: `infrastructure`, `development`, `testing`, `support`, `documentation`, `planning`, `uncategorized`. The labels are Infrastructure / DevOps, Development / Automation, Testing / Validation, Troubleshooting / Support, Documentation / Knowledge, Planning / Coordination, and Uncategorized.
