# Private Git Publication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Work Dashboard into a portable, well-documented private Git repository with safe external data configuration and three validated journal skills.

**Architecture:** Keep Markdown files as the source of truth and the existing Node catalog as the read model. Track a synthetic example catalog, select real local sources through an ignored `SOURCES_CONFIG` override, and lead coding agents from `AGENTS.md` into focused documentation and maintained skill packages.

**Tech Stack:** Node.js 22 ES modules, built-in Node test runner, plain HTML/CSS/JavaScript, Markdown, Git.

**Spec:** `docs/superpowers/specs/2026-11-13-private-git-publication-design.md`

## Global Constraints

- Remote: `git@github.com:AtefToumi/work-dashboard.git`; it must remain private.
- Do not commit real BPL/E.ON operational records, secrets, recovery history, logs, captures, or machine-specific configuration.
- Node.js 22 or newer; add no runtime dependency or frontend build step.
- Preserve the flat-front-matter contract, status semantics, catalog path protections, Windows startup, and optional Docker workflow.
- Keep publication changes separate from speculative application redesign.

## Review Focus

- An unset, relative, missing, or invalid `SOURCES_CONFIG` must resolve predictably or fail with a useful error without weakening path validation.
- Tracked examples must load without referring to directories outside the repository.
- Documentation must not expose private absolute paths, hostnames, addresses, credentials, or real operational records.
- Installed and maintained skill copies must have an explicit, testable synchronization procedure and no hidden fixed-path dependency.
- The staged initial commit must contain only intended portable files, and the configured push target must exactly match the approved SSH URL.

---

### Task 1: Establish the repository safety boundary and baseline

**Files:**
- Create: `.gitignore`
- Create: `sources.example.json`
- Preserve locally: `sources.local.json`
- Modify: `sources.json`
- Test: `test/catalog.test.mjs`

**Interfaces:**
- Consumes: existing `loadCatalog(configPath)` and current source schema.
- Produces: a tracked portable example catalog and an ignored local catalog convention.

- [ ] Record the current source configuration outside the staged set and run `node --test` to establish the baseline.
- [ ] Add a failing catalog test proving the tracked example configuration loads only repository-contained synthetic sources with zero warnings.
- [ ] Create the minimal synthetic configuration/data needed for the test to pass while preserving the current local configuration as `sources.local.json`.
- [ ] Add `.gitignore` rules for local configuration, `.history`, logs, temporary files, coverage, editor state, and OS files.
- [ ] Run the focused catalog tests and full `node --test` suite.

### Task 2: Add runtime selection of local source configuration

**Files:**
- Modify: `server.mjs`
- Modify: `start.ps1`
- Modify: `start.cmd`
- Modify: `compose.yaml`
- Modify: `sources.docker.json`
- Test: `test/server.test.mjs`

**Interfaces:**
- Consumes: environment variable `SOURCES_CONFIG` and existing server/catalog startup.
- Produces: resolved configuration path used consistently by catalog reads and task writes.

- [ ] Add failing tests for an explicit valid override and a missing override path with a useful startup failure.
- [ ] Implement minimal `SOURCES_CONFIG` resolution without changing catalog confinement rules.
- [ ] Update launchers and Docker examples to document/pass the appropriate configuration explicitly where needed.
- [ ] Run focused server tests and the full suite.

### Task 3: Create portable examples and authoritative AI documentation

**Files:**
- Create: `AGENTS.md`
- Create: `docs/architecture.md`
- Create: `docs/data-model.md`
- Create: `docs/security.md`
- Create: `docs/testing-and-contributing.md`
- Create: `docs/ai-onboarding.md`
- Create: `examples/work-log/tasks/EXAMPLE-001.md`
- Create: `examples/work-log/journal/2026-01-15.md`
- Create: `examples/references/example-runbook.md`
- Modify: `README.md`
- Modify: `AUTHORING.md`

**Interfaces:**
- Consumes: existing application behavior, source schema, authoring contract, and tests.
- Produces: a single first-read agent contract with focused authoritative references and a complete synthetic workflow.

- [ ] Document the file map, request/data flows, write boundary, invariants, status/evidence rules, test commands, and safe change checklist.
- [ ] Document first-run setup, local source configuration, backup/recovery, Docker/native operation, and migration from the current machine.
- [ ] Add synthetic records covering todo/in-progress/blocked/verify/done interpretation without real operational details.
- [ ] Load the example catalog and verify links, task metadata, and zero warnings.
- [ ] Search tracked candidates for BPL/E.ON private paths and operational identifiers; remove or generalize any findings not required as public examples.

### Task 4: Port and document the three journal skills

**Files:**
- Modify: `skills/start-day/SKILL.md`
- Modify: `skills/update-journal/SKILL.md`
- Modify: `skills/tidy-up/SKILL.md`
- Create: `docs/skills.md`
- Modify: `skills/*/agents/openai.yaml` only when metadata needs alignment.

**Interfaces:**
- Consumes: active dashboard configuration, authoring contract, current client date/timezone, and configured project roots.
- Produces: portable skills plus installation, synchronization, invocation, and validation instructions.

- [ ] Run realistic baseline scenarios against copies of the current skills and record any failures caused by fixed BPL assumptions or ambiguous discovery.
- [ ] Make the smallest skill changes that replace fixed paths/timezone assumptions with project discovery and explicit configuration while preserving evidence and authorization boundaries.
- [ ] Validate each skill structurally before moving to the next skill.
- [ ] Run realistic read-only, mid-session update, and wrap-up scenarios against an isolated synthetic workspace.
- [ ] Document installation and deterministic comparison/synchronization with personal installed copies.

### Task 5: Initialize, inspect, commit, and publish

**Files:**
- Create: `.git/` repository metadata through `git init`
- Review: every path proposed for the initial commit

**Interfaces:**
- Consumes: verified portable project tree.
- Produces: initial branch and private GitHub remote.

- [ ] Run `node --test`, example-catalog verification, and all three skill validators from a clean project state.
- [ ] Initialize Git with branch `main`, set remote `origin` to the exact approved SSH URL, and inspect `git status --short`.
- [ ] Stage only intended files; inspect `git diff --cached --stat`, `git diff --cached`, and staged filenames.
- [ ] Scan staged content for secrets, private absolute paths, real infrastructure identifiers, and excluded operational records; correct and repeat verification if found.
- [ ] Create one documented initial commit and verify the commit tree.
- [ ] Push `main` to `origin`, then verify the remote branch and report the commit ID and test evidence.

