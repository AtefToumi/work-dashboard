# Private Git Publication Design

## Intent

Publish Work Dashboard to `git@github.com:AtefToumi/work-dashboard.git` as a private, portable application repository that another AI can safely understand, test, maintain, and extend. Preserve the existing local operational journal model without committing real operational records.

## Goals

- Version the application, tests, templates, launchers, and maintained skill sources.
- Give coding agents one authoritative onboarding path through `AGENTS.md` and linked architecture, data-model, security, testing, and skill documentation.
- Ship portable `start-day`, `update-journal`, and `tidy-up` skills with documented installation and synchronization.
- Include synthetic example records sufficient to demonstrate the complete workflow.
- Keep real journal sources, edit history, secrets, machine-specific configuration, and runtime artifacts out of Git.
- Verify the application and each skill before the first push.

## Non-goals and anti-goals

- Do not publish or deploy the dashboard service.
- Do not commit external project records, credentials, private keys, captures, logs, or infrastructure artifacts.
- Do not redesign the application, metadata contract, or status semantics as part of publication.
- Do not make the skills silently execute work, contact people, schedule jobs, or scan sources outside the configured catalog.
- Do not claim that a repository being private is a substitute for secret screening.

## Selected approach

Use one code-and-skills repository. Commit the application and maintained skill sources, plus a synthetic example workspace. Keep real data external and connect it through an ignored local source configuration.

Alternatives considered:

1. A complete snapshot including operational records would be easier to reproduce but would permanently place sensitive infrastructure history in Git.
2. Separate application and data repositories would provide stronger lifecycle separation but adds setup and synchronization overhead that is not currently needed.

## Repository boundary

Tracked:

- Application source, tests, native and Docker launchers.
- `AUTHORING.md`, `AGENTS.md`, README, architecture, data-model, security, testing, and skill-operation documentation.
- Task and journal templates.
- Maintained copies of all three skills and their UI metadata.
- Synthetic example tasks, journals, and references.
- A portable example source configuration.

Untracked:

- Real project journal and reference roots.
- The active machine-specific `sources.local.json` configuration.
- `.history`, logs, temporary files, coverage output, editor state, and OS metadata.
- Secrets and credential-bearing files.

The application will support a `SOURCES_CONFIG` environment variable so a local ignored configuration can select real sources without modifying a tracked file. With no override, it loads the portable example configuration.

## AI-facing documentation

`AGENTS.md` is the first-read contract for any coding AI. It identifies the application entry points, architecture, invariants, supported metadata, status semantics, security boundary, test command, documentation map, and change checklist. Detailed material remains in focused files under `docs/` to avoid duplicating authoritative rules.

The documentation must distinguish:

- Markdown source-of-truth records from the derived in-memory catalog.
- Task update dates from explicit deadlines.
- Implementation, verification, and completion.
- Maintained repository skill sources from installed personal copies.
- Portable examples from real external project data.

## Skills

Each skill remains independently invocable and uses discovery rather than a fixed BPL path:

- Locate `AUTHORING.md` and the active source configuration from the current project or an explicitly supplied dashboard path.
- Use the configured timezone, with Europe/Berlin documented as the BPL example rather than a universal constant.
- Read or write only configured project roots.
- Preserve the existing authorization limits and evidence rules.

The repository documents how to install or synchronize the maintained skills into a Codex skills directory and how to validate them. Skill changes require structural validation and realistic behavior checks.

## Safety and verification

Before pushing:

- Run the existing Node test suite as a baseline and after changes.
- Add tests for source-configuration override behavior before implementing it.
- Validate all three skill packages.
- Exercise catalog loading against the synthetic example configuration.
- Review every staged path and scan staged content for known private absolute paths, secrets, and operational data.
- Confirm the Git remote is exactly `git@github.com:AtefToumi/work-dashboard.git`.
- Push only the reviewed initial commit to the private remote.

## Constraints

- Node.js 22 or newer; no new runtime dependency or frontend build step.
- Preserve Windows native startup and the existing optional Docker path.
- Preserve existing local files until portable replacements and migration instructions are verified.
- Use the existing flat-front-matter contract and catalog safeguards.

