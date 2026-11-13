# Work Dashboard agent guide

Read this file first when changing the repository. Work Dashboard is a local Node.js application whose durable data is Markdown; the browser catalog is derived state, never the authority.

## Start here

1. Read [README.md](README.md) for setup and operation.
2. Read [AUTHORING.md](AUTHORING.md) before changing record semantics.
3. Read [docs/architecture.md](docs/architecture.md) and [docs/data-model.md](docs/data-model.md) before changing catalog, write, or UI behavior.
4. Read [docs/security.md](docs/security.md) before changing paths, HTTP handling, Docker mounts, or write APIs.
5. Read [docs/testing-and-contributing.md](docs/testing-and-contributing.md) before implementation.
6. For journal automation, read [docs/skills.md](docs/skills.md) and the relevant `skills/*/SKILL.md` in full.

## Invariants

- Node.js 22 or newer; no frontend build and no runtime dependencies.
- Only roots explicitly listed in the active source configuration are indexed.
- Symlinks are skipped and resolved files must remain inside configured roots.
- Only valid tasks directly inside a configured `taskRoot` are editable.
- `date` is a last meaningful update, not a deadline.
- `verify` is not `done`; plans, commands, pings, and intent are not proof of completed outcomes.
- Stable `task_id` values identify work. Do not create a second task for the same work.
- Preserve older evidence and record reconciliations instead of rewriting history silently.
- Never store passwords, tokens, private keys, recovery codes, or secret contents.
- Writes retain optimistic concurrency and `.history` recovery behavior.
- Default HTTP access remains loopback-only and same-origin.

## Code map

- `server.mjs`: local HTTP server and API boundary.
- `lib/catalog.mjs`: traversal, metadata parsing, records, and safe links.
- `lib/tasks.mjs`: constrained task writes, validation, history, and concurrency.
- `lib/paths.mjs`: writable task-root confinement.
- `public/`: dependency-free browser UI and Markdown renderer.
- `test/`: Node built-in test suite.
- `examples/`: synthetic portable records used by the default catalog.
- `skills/`: maintained sources for the three journal workflows.

## Configuration

`sources.json` is the tracked portable default. Real workspaces use an ignored `sources.local.json` or another file selected through `SOURCES_CONFIG`. Paths are relative to the selected configuration file unless absolute. Do not commit a user's local source map.

## Required checks

```powershell
node --test
```

For source changes, load `sources.json` through `loadCatalog` and require zero warnings. For skill changes, use [docs/skills.md](docs/skills.md). Review staged content before any push.

## Change discipline

- Add a failing test before changing application behavior.
- Keep documentation and examples free of real operational data.
- Do not execute pending work, contact people, deploy, or schedule jobs merely because a journal names a next action.
- Report actual verification commands and results.
