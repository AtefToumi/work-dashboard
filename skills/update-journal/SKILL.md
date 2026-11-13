---
name: update-journal
description: Use when the user asks to document work done in the current chat, save progress so far, or update the work journal during a session. For explicitly ending a session or preparing a handoff, prefer tidy-up. A summary-only request does not imply file writes.
---

# Update the work journal

Record the current chat's meaningful progress in the appropriate project Markdown and update matching task records. This can run mid-session: it does not end, archive, or wrap up the chat. Use on `$update-journal`, “document what we did,” or “update the journal with our progress.”

## Find the right records

Read applicable project instructions and the existing authoring contract. Locate the dashboard from a path supplied by the user, the current workspace, or an ancestor containing `AUTHORING.md` and `sources.json`; do not use a remembered machine-specific path. Resolve the active source configuration in this order: an explicitly supplied configuration, `SOURCES_CONFIG`, an established local configuration used by the workspace, then the tracked `sources.json`. Inspect that selected file and map the affected project to its configured task, journal and reference roots before writing.

Use only current-chat evidence, user reports, and relevant inspected artifacts. Do not mine other chats, mail, terminal history or unrelated repositories. In private-workspace deployments use the authenticated owner's authorized interface, not server-wide filesystem access. Ask one focused question for uncertain project ownership, while recording unambiguous work separately. Do not file unrelated work under Work Journal merely because it owns the dashboard.

## Reconcile before writing

- Distinguish completed actions, user-reported results, decisions, implementation proposals, failed attempts, verification gaps and blockers. A successful planning task does not complete its proposed implementation. Suggested commands and tool attempts are not proof of success.
- Reuse existing task IDs. Read the latest content immediately before editing and preserve unrelated changes. Compare with prior entries; repeated invocation with no new evidence is a no-op, not another copy of the chat summary.
- Use the client's current date and timezone unless the user explicitly selected a different workspace timezone. Preserve the actual date of older events. A late report may be logged today with the original event date stated; do not invent event or completion dates. This rule takes precedence over example-specific timezone text in an older authoring contract.
- Never copy passwords, private keys, tokens, recovery codes or other secret values into records, summaries or backups. Document outcomes without credentials.

## Save the progress

1. Update the affected project's dated journal with only the new outcomes, decisions, evidence and next actions. Link existing procedures/artifacts rather than pasting the transcript. Keep earlier decisions and explain later changes.
2. Update matching tasks to supported statuses: `todo` for unstarted work, `in-progress` for started unfinished work, `blocked` for an active dependency, `verify` for a reported result/access still needing a check, `done` for the fulfilled task outcome. Preserve category/priority unless the chat supports changing them. Do not manufacture deadlines or effort estimates.
3. Preserve known `created_at`; set `completed_at` only for evidenced completion and clear it on reopening. Do not add unsupported frontmatter fields. Create new tasks only for distinct agreed work, not every discussion point.
4. For task writes, prefer the inspected dashboard's `loadCatalog`/`saveTask` functions or authenticated API with the selected configuration, retaining version checks and history. When calling `saveTask` directly, pass its trusted `date` option for the client's calendar date or an evidenced historical event date. The browser API intentionally does not accept date fields; use a targeted, version-aware Markdown patch when an API-only workflow must preserve a different date. Reconcile stale-write errors against fresh content; never force-overwrite. Never redirect real work into a synthetic/example project when the intended project is absent from the selected configuration.
5. Capture the method and reusable knowledge as required below, alongside the outcome. Link the reference from the journal and matching task rather than copying the transcript.
6. Do not create a separate handoff unless requested or necessary for the requested documentation. Do not register projects, change mounts, restart services, implement planned features, send messages or schedule jobs as a side effect.

## Capture how the work was achieved

Every meaningful progress update must preserve both the outcome and how it was achieved. For technical work, create or update the project's reusable reference/runbook and link it from the dated journal and matching task. For simple nontechnical work, a concise method and decision explanation in the journal is sufficient. Reuse existing notes; do not generate duplicates when there is no new knowledge.

Include the following when supported by the chat:
- Starting problem, relevant environment and prerequisites, and the reason for the chosen approach.
- Ordered steps and exact commands actually used, in fenced code blocks. Identify the machine/device, shell or console, working directory, required privileges and meaningful parameter values so a colleague knows where and how to run them. For UI work, record the equivalent actions and settings.
- What each significant command or change accomplished, the observed output or success criteria, and how the result was verified.
- Failed approaches and their useful symptoms, what changed to resolve them, and remaining uncertainty. Do not infer a root cause from recovery alone.
- Relevant configuration/file paths, script links, and recovery or rollback steps when known and applicable. Mark untested instructions explicitly; do not invent a recovery procedure.

Use only evidenced commands and results. Label suggested commands as unexecuted, distinguish user-reported results from observed output, and state when the exact procedure is unknown. Replace secrets with clearly named placeholders and explain other variable inputs. Never preserve credentials in command examples or transcripts. Link a maintained script instead of duplicating its full source, but include its invocation and limitations.

Prefer the existing project reference library. A user-approved local project/reference folder is a valid destination even if it is not registered in the dashboard. When the project destination is already established and writable, create a local reference folder there if needed; dashboard registration is a separate action. Ask only when project ownership or the destination is genuinely unresolved, and save the known method in the journal meanwhile. Do not claim the knowledge transfer is complete when only outcomes were saved.

## Verify and report

Before finishing, check that a colleague can identify where to run the documented commands, what inputs to replace, what result to expect, and which steps remain unverified. Confirm the reference is linked and saved, or explicitly report the missing method/evidence.

Read saved records back and verify statuses, dates, links, preserved content and absence of duplicate updates. If available, reload the catalog read-only to check affected records and notices. A stopped dashboard does not prevent Markdown updates; do not restart it just for this task. Do not run the full app test suite for prose-only changes.

Return a brief account of what was saved with links, including any runbook/reference note created or updated. Separate saved files from verified dashboard visibility; mention Refresh when needed. If access fails, say what remains unsaved instead of claiming success. Leave the chat ready to continue. For a full end-of-session handoff use `$tidy-up`; for a read-only daily briefing use `$start-day`.
