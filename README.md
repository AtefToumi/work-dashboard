# Work Dashboard

A local, Markdown-backed dashboard for tasks, daily journals, references, evidence, and handoffs. It has no database, frontend build, cloud calls, or activity tracking.

## Requirements

- Node.js 22 or newer.
- Windows, macOS, or Linux for native operation.
- Docker is optional.

For complete operating-system instructions, see [Windows, Linux, and macOS setup](docs/platform-setup.md).

## Try the portable example

```powershell
node server.mjs
```

Open `http://127.0.0.1:8080`. The tracked `sources.json` loads only synthetic records under `examples/`. Stop with Ctrl+C.

On Windows, `start.cmd` and `start.ps1` launch the server. If ignored `sources.local.json` exists, those launchers select it automatically. An explicit `SOURCES_CONFIG` takes precedence:

```powershell
$env:SOURCES_CONFIG = 'C:\path\to\my-sources.json'
node server.mjs
```

Relative project paths resolve from the selected configuration file.

On Linux and macOS:

```bash
cp sources.example.json sources.local.json
SOURCES_CONFIG="$PWD/sources.local.json" node server.mjs
```

## Connect real projects

Copy `sources.example.json` to `sources.local.json` and edit only that ignored file:

```json
{
  "projects": [{
    "id": "example",
    "name": "Example",
    "description": "Purpose of the work",
    "roots": ["../Example/work-log", "../Example/runbooks"],
    "taskRoot": "../Example/work-log/tasks",
    "taskPrefix": "EXAMPLE"
  }]
}
```

Create `work-log/tasks` and `work-log/journal` in the project and use `templates/`. Read [AUTHORING.md](AUTHORING.md) before adding records.

## Daily workflow

- `$start-day` provides a read-only briefing.
- `$update-journal` saves meaningful progress during a session.
- `$tidy-up` reconciles outcomes and leaves a handoff.

Maintained skill sources and installation instructions are in [docs/skills.md](docs/skills.md).

## Test

```powershell
node --test
```

No dependency installation is required.

## Docker example

```powershell
docker compose up -d --build
docker compose ps
docker compose logs --tail 50
```

Compose publishes only `127.0.0.1:8080` and runs the synthetic example with a read-only container filesystem. A real Docker configuration must add only explicit narrow mounts and a matching source file.

## Documentation

- [Agent guide](AGENTS.md)
- [Windows, Linux, and macOS setup](docs/platform-setup.md)
- [Architecture](docs/architecture.md)
- [Data model](docs/data-model.md)
- [Security and privacy](docs/security.md)
- [Testing and contributing](docs/testing-and-contributing.md)
- [AI onboarding](docs/ai-onboarding.md)
- [Task editing and recovery](docs/task-editing.md)
- [Authoring contract](AUTHORING.md)

## Boundaries

This is a single-user local tool, not an authenticated multi-user service. Keep it on loopback. Never place credentials or secret contents in notes. The configured roots are an application allowlist; native mode still has the current user's OS permissions. Review staged content before pushing even to a private repository.
