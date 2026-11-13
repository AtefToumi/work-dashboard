# Editing release verification — 2026-10-27

- `node --test`: 18 passed, 0 failed; independently rerun by reviewer.
- Browser: create task, edit summary/category, complete, reopen; confirmed persisted host Markdown.
- Deliberate external file edit while browser form open: stale save rejected with visible error; draft retained. External content remained intact.
- Docker rebuilt/recreated after fixes; saved task persisted and Workload category filter showed it in its corrected Work Journal project.
- Independent review identified two issues, both fixed and rechecked: editable fields during pending requests could lose new text; filename-derived titles could fail status-only saves. Inputs now freeze during save/reload, and filename-title completion has a regression test.
- Container inspection: healthy, user `node`, root filesystem read-only, port only `127.0.0.1:8080`.
- Only `/notes/devops/work-log/tasks` and `/notes/work-journal/work-log/tasks` writable. Parent journals, four DevOps reference roots, and source config read-only.
- Catalog reloaded without source notices. Existing uncategorized tasks remain uncategorized; unrelated DevOps updates preserved.

Automated checks include symlink/outside-root rejection, malformed source protection, stale/concurrent edits, snapshots, completion/reopening semantics, category/date totals, origin/token/content-type/payload validation, and rejected reference writes/deletion.

Limits: no multiuser authentication, no exhaustive screen-size/device test, no cross-program filesystem transaction guarantee, and no full history-based analytics. Workload reports current task counts and recorded dates. See [task editing](task-editing.md) for recovery and precise semantics.
