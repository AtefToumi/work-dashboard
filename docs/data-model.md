# Data model

## Records

- `task`: actionable work with stable ID, status, priority, and category.
- `journal`: dated evidence and decisions.
- `document`: reference material, including files without front matter.

Front matter is deliberately flat, not general YAML. See [AUTHORING.md](../AUTHORING.md) for the authoritative fields.

## Task lifecycle

| Status | Meaning |
|---|---|
| `todo` | Agreed work has not started. |
| `in-progress` | Work started and meaningful steps remain. |
| `blocked` | A current dependency prevents progress. |
| `verify` | A result exists but required acceptance evidence is missing. |
| `done` | The outcome and required checks are fulfilled. |

Open work is `todo`, `in-progress`, `blocked`, or `verify`. A handoff bullet describing an existing task is not another task.

## Dates and identity

`task_id` is stable identity. Filenames and titles may change. `date` is the last meaningful update. `created_at` and `completed_at` are lifecycle facts when known. None is a deadline; only an explicit dated commitment supports due or overdue language.

## Evidence

Distinguish performed actions, observed output, user reports, decisions, proposals, failures, and uncertainty. A proposed command was not executed; planning is not deployment; network reachability is not application acceptance. Preserve history and add a reconciliation when conclusions change.

## Source configuration

Each project declares an ID, display name, roots, optional writable task root, and task prefix. Roots are an allowlist. Root order contributes to internal record IDs.

The loader caps Markdown at 256 KiB, traversal depth at 8, records at 1,000, and visited entries at 10,000. Hidden and symbolic entries are skipped.
