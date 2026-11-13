# Verification — 2026-10-27

> Historical initial release. The approved editing extension is documented in [task-editing.md](task-editing.md) and [editing-plan.md](editing-plan.md).

## Automated checks

`node --test`: **9 tests passed, 0 failures**.

Coverage includes flat metadata parsing, Unicode/CRLF, invalid dates/statuses, unterminated metadata, explicit-root catalog loading, refresh after editing, internal link resolution, missing roots/oversized files, directory-symlink escape rejection, combined filters, unsafe link schemes, HTTP method/host/origin/cross-site restrictions and inaccessible arbitrary file paths.

Real source catalog: **11 records** (5 tasks, 1 journal, 5 reference documents), **0 warnings**, **16 resolved internal links**. This matched native and Docker responses.

## Native launch

- `node server.mjs` served successfully on localhost:8080.
- Original PowerShell-based start.cmd failed because Windows PowerShell scripts are disabled on this computer. No execution-policy change was made.
- Revised `start.cmd` directly invokes the available Node runtime and successfully served the dashboard. Its optional start.ps1 has a corrected Windows-compatible version expression, but remains subject to local script policy.

## Docker

- `docker compose build` and `docker compose up -d --build` succeeded with approved engine access.
- Container `work-dashboard-work-dashboard-1` reported **healthy**.
- `GET /api/catalog` returned HTTP 200 with the same 11 records and no warnings.
- Inspected actual settings: port published on **127.0.0.1:8080**, user **node**, read-only container root, and all six mounts marked `rw=false` (source configuration plus five note directories).
- One observed idle sample: **19.54 MiB** container memory and **0.00% CPU**. This is not a benchmark or guarantee and excludes Docker Desktop/WSL overhead.
- The container is left running for the user. No auto-start/restart policy was added. Native test instances were stopped before starting Docker on port 8080.

## Browser QA

Verified in the in-app desktop browser:

- Overview counts and pending tasks match seed records.
- To verify card opens the task view with two matching tasks.
- Task detail includes checklist, evidence, and clickable runbook reference.
- Reference document renders code, lists, and safe links.
- Unmatched search displays a useful empty state.
- Project list/detail and journal list/detail work.
- Refresh completes and re-enables its button; no captured browser console errors/warnings in the final check.
- Same-hash search regression reproduced before the fix: current-note result did not open. Repeated after the fix and it opened the detail with search cleared.
- Screenshot: [dashboard-preview.png](dashboard-preview.png).

Responsive CSS is implemented, but mobile/narrow-viewport visual verification was not available through the current browser-control capabilities. Full CommonMark is not claimed: the intentionally small renderer supports headings, paragraphs, code fences, lists/checkboxes, simple tables, blockquotes, bold, inline code and links; raw HTML stays text, images/embeds are not loaded.

## Independent review

A separate reviewer inspected the implementation, configuration, and tests. Important findings were launcher compatibility and unchanged-hash search navigation; both were reproduced and fixed. Minor related skip-link and port-announcement issues were also corrected. No additional important security issue was identified within the documented local-user threat model.

This validates the dashboard application, not the remote VM configuration recorded in its notes. Unverified remote work remains marked To verify.
