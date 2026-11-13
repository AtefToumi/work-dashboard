# Updating the work journal

For progress updates during a chat, use `$update-journal` or say “document what we did and update the journal.” It saves new evidence and updates matching tasks without ending the session. Maintained source: [skills/update-journal/SKILL.md](skills/update-journal/SKILL.md); installed under the user's `.codex/skills/update-journal` directory. Validate and synchronize the installed copy after source edits.

For a read-only morning briefing, use `$start-day` or say “morning check-in.” It reviews open work, deadlines and blockers and suggests priorities without changing task statuses. Its maintained source is [skills/start-day/SKILL.md](skills/start-day/SKILL.md), installed under the user's `.codex/skills/start-day` directory. Validate and synchronize that installed copy after source edits.

For end-of-chat documentation, use the personal `$tidy-up` skill or say “wrap up this chat.” Its maintained source is [skills/tidy-up/SKILL.md](skills/tidy-up/SKILL.md), installed under the user's `.codex/skills/tidy-up` directory. It updates evidence-backed records and next steps; closing a window alone does not trigger it. After editing the maintained source, validate and synchronize the installed copy before claiming the skill has changed.

This is the contract for a person or assistant maintaining the dashboard data.

## What to update when the user reports work

1. Identify the project; if unclear, ask before assigning the report to an unrelated project.
2. Update or create a task file under that project's configured `work-log/tasks/` directory. Reuse a stable task_id; do not create duplicates for the same task.
3. Create/update `work-log/journal/YYYY-MM-DD.md` using the user's current client date and timezone unless another date is explicitly supplied. Append new developments without erasing earlier decisions; state when a decision changes.
4. Link detailed procedures/configuration from the journal. Keep durable technical documentation in the project's reference folders, not copied into every day's entry.
5. Tell the user what changed and ask them to Refresh. If the dashboard is not running, they can open start.cmd.

Do not infer completed server work from suggested commands. Status `verify` means verification is missing, not a completed task. Do not scan unrelated folders, terminals, or repositories to guess activity. The user must supply or explicitly authorize the source material.

## Flat front matter

Start the file with `---`, one `key: value` per line, then `---`. This is a deliberately small format, not full YAML: no arrays, nested maps, or multiline YAML values. Use a JSON-style double-quoted string if a value needs quoting. Colons inside plain values are supported.

Supported fields:

| Field | Meaning |
|---|---|
| type | task, journal, or document |
| title | Display title; defaults to the first Markdown H1 or filename |
| date | YYYY-MM-DD; tasks use last meaningful update, journals use entry date |
| summary | One sentence for cards/detail header |
| task_id | Stable human-readable identifier, e.g. DEVOPS-002 |
| status | todo, in-progress, blocked, verify, done (tasks only) |
| priority | low, normal, high (tasks only) |
| category | infrastructure, development, testing, support, documentation, planning, uncategorized |
| created_at | Known task creation date; do not invent dates for older tasks |
| completed_at | Current completion date; clear when reopened; leave unknown historical dates empty |
| topic | Reference group: overview, networking, servers, troubleshooting, app, history, general |
| document_state | Reference label: current, draft, historical; defaults to current |

Documents without metadata are shown as references. Unknown fields or invalid statuses/dates raise source notices; invalid task statuses fall back to todo. A task date is not a due date; this first version has no deadline/reminder automation.

## Reference library organization

Give references a clear title, a one-sentence summary, a topic and a document_state. Current means a maintained reference, not that every procedure or infrastructure test is complete. Use draft for proposals and historical for superseded snapshots or handoffs. Historical references retain working links but are hidden from the default library; select Include historical notes to see them. The History & handoffs topic enables this option automatically. Library search retains the selected project and topic, including when returning from a note.

Project display names should distinguish each configured body of work. Preserve existing project IDs and task prefixes because they contribute to stable record identity. Keep native and Docker source descriptions consistent when both modes are configured.

## Content and evidence

Separate Completed, Decisions, To verify, and Next. Record short evidence and link full details. Keep keys/passwords/tokens out. A private-key path can be documented if necessary, but never its contents.

Each person should review the summary for correctness. The dashboard cannot verify claims against servers on its own and does not monitor activity.

## Adding other projects

Only add a new source directory when the user asks to connect that project. Prefer its designated work-log directory. Add reference directories individually when needed for clickable detail links. Update both native and Docker source maps/mounts when Docker is used.

## Templates

- [Task template](templates/task.md)
- [Journal template](templates/journal.md)

Replace example dates and identifiers; templates themselves are not indexed.

## Browser editing

Tasks can also be created and edited directly in the app. Save writes the same Markdown files and retains old versions in .history. Refresh before editing externally changed records; do not edit the same task concurrently during a save. See [editing and recovery](docs/task-editing.md).
