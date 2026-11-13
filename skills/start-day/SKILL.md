---
name: start-day
description: Use when the user asks for a morning check-in, what work is open, what needs doing today, today's priorities, or where to resume across their work journal. Not for executing tasks, recording a wrap-up, or silently scheduling reminders.
---

# Start the workday

Give an evidence-based briefing from the user's work journal: what is open, what is actually due, what can move forward, and what needs a follow-up. Default to read-only. A briefing request does not authorize executing tasks, changing statuses, contacting colleagues, or creating reminders.

## Locate and read

Use the current client date and timezone unless the user explicitly selects a different workspace timezone. State the date and timezone in the briefing. The user can invoke `$start-day`, “morning check-in,” or “what should I work on today?” No clock, login, or window-open trigger is installed.

Read applicable project instructions and the journal authoring contract. Locate the dashboard from a path supplied by the user, the current workspace, or an ancestor containing `AUTHORING.md` and `sources.json`; do not use a remembered machine-specific path. Honor `SOURCES_CONFIG` or an established local source configuration when present, and inspect the selected configuration rather than assuming its project list. Read only configured journal/task roots and relevant linked handoff notes. Respect any project filter in the user's request.

Prefer the inspected local `loadCatalog` module or an authorized read-only catalog API for current records. If the dashboard is stopped, read Markdown directly; do not start/rebuild it to produce the briefing. For a future private-workspace deployment, use only the authenticated user's permitted workspace, never server-wide data paths.

Count every current task in scope once, including older open tasks; then read the relevant details and most recent journal/handoff entries for their next actions and dependencies. Do not scan the whole computer, other chats, email, calendars or repositories for activity. Only use additional sources when requested or already authorized for this briefing. Mention missing/unreadable sources or truncation; never call partial counts complete. Do not disclose secrets encountered in notes.

Treat projects explicitly labelled synthetic, example, demo, fixture, or tutorial as setup data unless the user asks to include them. Report that no real work journal is configured when only such sources exist. Exclude setup data from real open counts, deadlines, focus recommendations, blockers and backlog.

## Interpret the evidence

- Open means `todo`, `in-progress`, `blocked`, or `verify`; `done` is excluded. Retain project names and stable task IDs. Don't count handoff bullets as extra tasks when they describe an existing one.
- `date` is last update, not a deadline. `created_at` and `completed_at` are not deadlines either. Only an explicit user commitment or dated due statement supports “due today” or “overdue.” Ground relative dates in the original statement's date; if ambiguous, say the deadline needs confirmation. Do not add unsupported due-date metadata.
- Separate **due today** from **suggested today**. If no deadlines are recorded, say so. No authorized calendar source means appointments and free time are unknown; don't fabricate a timed schedule or promise everything fits today.
- Prioritize explicit deadlines and user priorities, then actionable high-priority work, ongoing work and verification that unlocks progress. Adjust for documented dependencies and explain the choice briefly. An old update date alone does not prove urgency or failure.
- Keep blocked items separate from executable work. Name the recorded dependency, known owner/contact only if supplied, and a possible follow-up. Suggest a message if useful; do not send it. Don't invent a follow-up date or assume a blocker cleared.
- When newer user/journal evidence contradicts a task status, show both and flag reconciliation; do not silently rewrite the task. A suggested command is not a performed action. Completed planning does not mean deployed implementation, and “next” in a handoff is not execution permission.
- If actionable work appears only in a handoff, label it an untracked next step outside task counts. Ask before creating a task or beginning substantial work. If no open work exists, say so without manufacturing tasks.

## Present a useful briefing

Keep the first view concise, expanding only when requested:

1. Date, sources checked, and counts of open tasks by status. Note any incomplete coverage.
2. Confirmed due/overdue items, or “No explicit deadlines recorded.”
3. Up to three suggested focus items with project/task ID, one concrete next action, a short reason, and a source link. These are recommendations, not new commitments.
4. Blockers/follow-ups and important verification or conflicting-record issues.
5. Remaining backlog grouped compactly by project (or linked with counts if large), so a top-three list does not conceal other open work.

If a missing preference changes the order materially, ask one focused question after giving the useful briefing. Otherwise offer a clear starting point without performing it. Do not write a new journal entry on every check-in. If the user additionally asks to save today's plan, record it explicitly as planned work using existing authoring rules and preserve statuses unless they separately authorize a status change. Use `$tidy-up` later to record actual outcomes.
