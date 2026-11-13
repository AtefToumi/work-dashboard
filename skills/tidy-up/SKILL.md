---
name: tidy-up
description: Use when the user asks to tidy up or wrap up a work chat, document the session before leaving, prepare a next-chat handoff, or update the work journal at the end of a session. Not for filesystem cleanup or silently closing a window.
---

# Tidy up a work chat

Leave an accurate, saved work record that another chat can continue from. Update Markdown tasks, the dated journal, and relevant handoff/reference notes using the current conversation's evidence. This is documentation work, not permission to finish pending implementation or operate servers.

## Trigger and scope

Use on `$tidy-up`, “wrap up this chat,” “document before I leave,” or a clear end-of-chat handoff request. If a user asks only for a summary, respect that narrower scope. Do not run after every ordinary reply. A skill is not a chat-close hook: never promise to run after the window closes, archive the chat, or create background automations.

Use this chat's reported work and inspected task artifacts. Do not scan unrelated projects, other chats, shell history, mail or workstation activity. Do not record passwords, private keys, access tokens, recovery codes or pasted secret values, including in test fixtures or backups.

## Locate the journal

Read applicable project instructions and the journal's authoring contract before writing. Locate the dashboard from a path supplied by the user, the current workspace, or an ancestor containing `AUTHORING.md` and `sources.json`; do not use a remembered machine-specific path. Resolve the active source configuration in this order: an explicitly supplied configuration, `SOURCES_CONFIG`, an established local configuration used by the workspace, then tracked `sources.json`.

Map the affected project through the selected configuration to its task, journal and reference roots, then inspect relevant linked handoff notes there. Use stable task IDs and existing document conventions. Keep project identity separate from work category. If project identity or a writable destination is unclear, save only unambiguous updates and ask one focused question for the remainder. Never redirect real work into a synthetic/example project. Do not register source folders, alter mounts or restart Docker just to wrap up. In a multiuser deployment, use only the authenticated owner's authorized workspace.

## Reconcile evidence

- Separate performed work, user-reported results, decisions, plans, failed attempts, blockers and unverified outcomes. Cite concise evidence or link existing details; don't dump the transcript.
- A saved implementation plan completes planning, not implementation. A command suggested in chat is not evidence it ran. User-reported completion can be recorded with that attribution; don't claim independent verification.
- Choose supported statuses: `todo` for unstarted work, `in-progress` for started unfinished work, `blocked` for a current external dependency, `verify` for a result/access check still needed, and `done` only for the task's fulfilled outcome. Replace obsolete blockers when evidence changes. Example: credentials received but login untested moves an access task from `blocked` to `verify`, not `done`.
- Use the client's current date and timezone unless the user explicitly selected a different workspace timezone. Preserve actual event dates; a wrap-up after midnight should not rewrite yesterday's history. This rule takes precedence over example-specific timezone text in an older authoring contract. Do not invent completion dates, owners, deadlines, effort or capacity.

## Save the delta

1. Read current files immediately before editing. Reuse matching tasks; add new ones only for distinct agreed work. Preserve task IDs, links and unrelated edits. Repeated tidy-ups with no new evidence should be no-ops.
2. Update each affected project's dated journal, appending only new developments. Explain changed decisions rather than erasing the earlier record.
3. Follow `AUTHORING.md` metadata. Preserve known `created_at`; set `completed_at` only for evidenced completion and clear it on reopening. Preserve categories unless this session establishes a classification.
4. For task writes, prefer the discovered dashboard's inspected `loadCatalog`/`saveTask` functions or authenticated API with the selected configuration to retain version checks and history. When calling `saveTask` directly, pass its trusted `date` option for the client's calendar date or an evidenced historical event date. The browser API intentionally does not accept date fields; use a targeted, version-aware Markdown patch when an API-only workflow must preserve a different date. Do not import uninspected scripts or copy a process token into notes. If a conflict occurs, reread and reconcile; never force-overwrite. For journal/reference edits, use targeted patches and recheck content after saving.
5. Capture the method and reusable knowledge as required below, alongside the outcome. Link the reference from the journal and matching task rather than copying the transcript.
6. Update an existing handoff within the selected project's configured roots when substantial unfinished work needs continuation. Otherwise put a short Next section in that project's journal: current state, exact next action, dependencies, relevant paths, and checks still missing. Do not create a parallel handoff without first checking relevant links and existing project handoffs.

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

## Verify and finish

Before finishing, check that a colleague can identify where to run documented commands, what inputs to replace, what result to expect, and which steps remain unverified. Confirm that task, journal and any handoff belong to the intended project under the selected configuration; a reference may instead use a separately user-approved project destination as described above. Confirm references are linked and saved, or report what remains missing.

Read saved records back, check status/date/link consistency and duplicates. If available, reload the selected configuration through the discovered dashboard's catalog and check the affected records and new warnings; don't run a full software test suite for prose-only updates. Distinguish “Markdown saved” from “visible in the running dashboard.” A stopped dashboard doesn't prevent saving its source files. If a write is blocked, state exactly what remains unsaved; never say the journal is updated when only a draft exists.

End with a short summary of saved changes, links to the task/journal, any runbook/reference note and the handoff when present, remaining blockers, and the next action. Mention Refresh if needed. No automatic commit, push, deployment, notification, cleanup/delete or chat closure.
