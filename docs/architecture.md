# Architecture

Work Dashboard is a local, dependency-free Node.js application. Markdown files in explicitly configured directories are the durable source of truth. `loadCatalog` reads them into an in-memory record list that the browser filters and renders. There is no database, background index, cloud call, or activity tracking.

```text
sources configuration
        |
        v
configured Markdown roots --loadCatalog--> catalog JSON --HTTP--> browser UI
        ^                                      |
        +--------- constrained task writes <---+
                   version + history
```

## Read path

`server.mjs` calls `loadCatalog(configPath)` for `/api/catalog`. The loader validates projects, resolves configured roots, skips hidden and symbolic entries, enforces limits, parses flat front matter, and resolves only links whose targets are already indexed. Warnings remain visible alongside valid records.

The browser receives record IDs, display metadata, Markdown bodies, source labels, internal link mappings, and a per-process write token—not arbitrary filesystem paths.

## Write path

Browser writes are limited to task creation and updates. `saveTask` reloads the catalog, validates the project and metadata, resolves the configured `taskRoot`, checks the version on updates, creates `.history` recovery content, and replaces the task safely. Journals and references remain read-only in the UI.

## Configuration

The server defaults to `sources.json`. `SOURCES_CONFIG` may select another configuration. Native launchers use `sources.local.json` when present and no override was supplied. Relative project roots resolve from the selected configuration's directory.

## Deployment modes

Native Node is primary. Docker is an optional loopback-published example containing synthetic records. A real Docker setup must add explicit narrow mounts and a matching container configuration; never mount a whole home or workspace directory.

Authentication or multi-user workspaces require a separate design. Current loopback and same-origin controls are not user authentication.
