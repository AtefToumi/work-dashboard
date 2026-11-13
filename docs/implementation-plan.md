# Work Dashboard Implementation Plan

> Historical initial release. The approved editing extension is documented in [task-editing.md](task-editing.md) and [editing-plan.md](editing-plan.md).

> **For agentic workers:** Use superpowers:executing-plans to implement task by task.

**Goal:** Deliver the approved local journal dashboard, seeded with actual DevOps work.

**Architecture:** Node read-only catalog API plus static browser UI, same app native or Docker. Markdown and an explicit root allowlist remain the only persistent data.

**Tech Stack:** Node.js >=22 built-ins, vanilla HTML/CSS/JS, Docker Compose.

**Spec:** [design.md](design.md)

## Global constraints

- Local-only, no telemetry or background tracking; no writes via UI.
- Only explicitly configured roots; no symlink traversal, source HTML execution, or arbitrary file route.
- No production dependencies or build step.
- Existing workspace is not a Git repository; use the new Work-Dashboard directory without changing sibling repositories.

## Review focus

1. Malformed metadata must remain visible as a warning, never silently count as done.
2. Unreadable or absent roots must report warnings while valid sources remain usable.
3. Traversal/symlink/HTML links cannot expose files or execute code.
4. Refresh must reflect edits without altering source files.
5. Empty search results and narrow screens must remain navigable.

## Tasks

- [x] 1. Write failing tests for parseMarkdown/loadCatalog and filtering; implement lib/catalog.mjs and public/model.mjs. Run node --test. Test live edits, strict dates/statuses, missing roots, size limits, symlink escapes, and internal link resolution.
- [x] 2. Write failing HTTP tests for createServer; implement server.mjs. Test loopback host/origin checks, method restrictions, missing routes, safe assets, and catalog response. Run the full test suite.
- [x] 3. Build public/index.html, styles.css, app.mjs: sidebar, overview, task list, journal cards, project cards, detail reader, search/filtering, warnings, refresh and responsive CSS. Use DOM text nodes for Markdown rendering. Add hostile-link checks and perform desktop browser QA.
- [x] 4. Add DevOps/work-log seed records, templates, explicit config, native Windows launchers, Dockerfile/compose, and operational README. Verify real catalog and link resolution; test native launch. Verify Docker build, run, health, mounts, and loopback publishing.
- [x] 5. Independent final review, fix important findings, rerun tests, open dashboard, document verification results and remaining limitations.

## Execution ledger

- Proceed inline under the user's approved implementation request. No extra design approval needed for the agreed approach.
- Native code and Docker config share one server; only source configuration and bind address differ.
- Initial source list includes DevOps journals and its explicitly selected reference folders; no other project history is inferred.
- Task 1: seven assertions failed against empty initial implementations, then all seven passed after catalog/filter implementation.
- Task 2: HTTP test failed against 501 stub, then passed. Ruling: test hostile Host with node:http because fetch normalizes the supplied Host in this runtime; this exercises the actual server boundary.
- Task 3: browser QA covered overview, task filter, task detail, internal reference, empty search, project pages, journal and refresh. Narrow-viewport visual QA was unavailable in the browser control; responsive CSS included but not claimed visually verified.
- Task 4: native start.cmd and Docker Compose both launched successfully. Docker is the final running instance, with 11 records, zero warnings and 16 resolved links.
- Final review: independent reviewer found the blocked PowerShell launcher and same-hash search navigation bug. Both reproduced before fixes; direct Node launcher succeeded afterward, and browser search now reopens the same note correctly. Fixed skip-link route interference and removed the optional script's hardcoded port announcement as small related corrections.
- Final suite: 9/9 Node tests passed. Docker health healthy; actual mounts read-only, actual host port 127.0.0.1:8080, actual container user node.
- No Git commits/worktree created because the containing workspace is not a Git repository. No cloud publication or background scheduling performed.
