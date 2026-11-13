# Local work dashboard design

> Historical initial release. The approved editing extension is documented in [task-editing.md](task-editing.md) and [editing-plan.md](editing-plan.md).

Approved direction: local Markdown dashboard with a direct launcher and Docker Compose, based on the user's explicit approval on 2026-10-27.

## Scope

Provide an overview, project views, tasks, journal history, search, and readable detail pages. The user reports work in chat; the assistant updates project Markdown. Refresh reads the latest saved files. No activity monitoring, directory-wide workspace indexing, cloud service, external scripts/fonts, database, or scheduled job.

## Approach

Use dependency-free Node.js (22 or newer) to serve a small vanilla browser UI and a read-only catalog API. This avoids a database and frontend toolchain. Package the same application for Docker; a native launcher remains the lowest-overhead option when Docker Desktop is not already running.

Markdown stays in each project's designated work-log directory. A source configuration explicitly lists readable roots; reference folders are registered individually so journal links can open their details. Never scan a parent workspace implicitly. Unconfigured projects can be added later by editing a local source configuration.

Each task or journal entry is a separate Markdown file with flat front matter (type, title, date, status, priority, summary). Stable task IDs can be supplied as task_id. This makes aggregation reliable without interpreting arbitrary prose as completion. Existing reference docs without metadata remain readable documents.

## Boundaries

Default host 127.0.0.1, port 8080. Docker binds 0.0.0.0 inside its container but publishes only 127.0.0.1:8080. Source mounts are read-only; the container has no Docker socket or whole-workspace mount. No writes via browser/API. Restrict Host/Origin; reject cross-site browser requests. Reject symlinks, path escapes, oversized files, excessive depth/count, and invalid metadata with visible warnings. Render Markdown as inert DOM text and vetted links; never render source HTML.

The UI is a local personal tool, not an authenticated multiuser service. Do not expose it to a LAN or internet without an authentication/access-control design. Files may still be synchronized by their containing folder's existing service; the dashboard itself does not upload them.

## Initial content

DevOps records reflect only conversation evidence. Seed VM installation work, pending access verification, addressing/backups, future app/DB provisioning, and a dated journal. Keep inferred completion separate from confirmed results. Do not invent activity for other projects.

## Verification

Node tests cover parser, catalog updates, source boundaries, hostile paths/links, malformed metadata, filtering and HTTP protections. Browser QA checks overview, task filtering, journal/details, reference links, search, keyboard/empty states. Verify Docker build/run if engine permissions allow; otherwise report the exact limit.
