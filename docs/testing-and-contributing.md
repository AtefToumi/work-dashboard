# Testing and contributing

Use Node.js 22 or newer. No package installation is required.

```powershell
node --test
```

The suite covers metadata parsing, traversal, source warnings, symlinks, filtering, references, Markdown navigation, HTTP boundaries, task lifecycle, concurrency, history, write confinement, and workload counts.

For behavior changes, write a minimal failing test first, confirm the expected failure, implement the smallest change, then run the focused test and full suite. Documentation-only corrections do not require artificial tests, but links, commands, and catalog examples must be exercised.

## Manual UI verification

1. Start with the synthetic catalog.
2. Open `http://127.0.0.1:8080`.
3. Check affected views at desktop and narrow widths.
4. Exercise affected keyboard, search, and navigation behavior.
5. For task writes, inspect Markdown output and `.history` recovery.

## Review checklist

- Reads and writes remain within their configured boundaries.
- Stale writes are rejected.
- Metadata semantics agree across parser, UI, templates, and docs.
- Implementation, verification, and completion stay distinct.
- No real records or machine paths entered tracked files.
- Native and Docker examples remain coherent.
- `node --test` reports zero failures.

Inspect staged filenames, staged diff, and a private-data scan before committing. Do not use destructive cleanup in a workspace containing untracked user data.
