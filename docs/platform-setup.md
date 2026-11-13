# Platform setup: Windows, Linux, and macOS

Work Dashboard runs directly on Node.js 22 or newer and has no package-install or frontend-build step. Run all commands from the repository root.

## Common setup

1. Clone the private repository.
2. Confirm the Node version:

   ```text
   node --version
   ```

3. Require major version 22 or newer.
4. Run the tests:

   ```text
   node --test
   ```

5. Start the synthetic example with `node server.mjs` and open `http://127.0.0.1:8080`.

Use an organization-approved Node distribution. The application does not need `npm install`.

## Windows

Use `start.cmd` by double-clicking it or running it from Command Prompt. PowerShell users may run:

```powershell
.\start.ps1
```

Both launchers use `sources.local.json` automatically when it exists. To choose another configuration explicitly:

```powershell
$env:SOURCES_CONFIG = 'C:\path\to\sources.json'
$env:PORT = '8081' # optional
node .\server.mjs
```

Stop the foreground process with Ctrl+C.

## Linux

Install Node.js 22 or newer using the distribution's approved package source or a managed runtime. Then:

```bash
git clone REPOSITORY_URL
cd work-dashboard
node --test
node server.mjs
```

For a real local catalog:

```bash
cp sources.example.json sources.local.json
${EDITOR:-vi} sources.local.json
SOURCES_CONFIG="$PWD/sources.local.json" node server.mjs
```

Optional settings:

```bash
PORT=8081 SOURCES_CONFIG="$PWD/sources.local.json" node server.mjs
```

Do not use `sudo` to run the dashboard. The process needs ordinary read access to configured roots and write access only to configured task directories. Keep the server bound to its default `127.0.0.1`.

## macOS

Install Node.js 22 or newer using an approved package, Homebrew, or a managed runtime. With Homebrew, one possible setup is:

```bash
brew install node
node --version
```

Then:

```bash
git clone REPOSITORY_URL
cd work-dashboard
node --test
node server.mjs
```

Configure real sources like Linux:

```bash
cp sources.example.json sources.local.json
${EDITOR:-vi} sources.local.json
SOURCES_CONFIG="$PWD/sources.local.json" node server.mjs
```

If the repository or journal is stored in Desktop, Documents, iCloud Drive, or another protected location, macOS may request Files and Folders permission for Terminal or the application launching Node. Grant only access required for the configured roots.

## Source paths

Paths inside a source configuration resolve relative to that configuration file. JSON accepts `/` on every supported platform; using forward slashes makes a configuration easier to move between operating systems.

Keep `sources.local.json` private and untracked. Create each project's `work-log/tasks` and `work-log/journal` directories before starting. The task directory must be writable if browser editing is required.

## Install the journal skills

On Linux and macOS, Codex personal skills normally live under `${CODEX_HOME:-$HOME/.codex}/skills`:

```bash
destination="${CODEX_HOME:-$HOME/.codex}/skills"
mkdir -p "$destination"
cp -R skills/start-day "$destination/"
cp -R skills/update-journal "$destination/"
cp -R skills/tidy-up "$destination/"
```

See [skills.md](skills.md) for validation and synchronization. Restart or refresh the Codex environment if it does not discover newly installed skills immediately.

## Docker Desktop or Docker Engine

The same Compose commands work on all three platforms:

```text
docker compose up -d --build
docker compose ps
docker compose logs --tail 50
docker compose down
```

The supplied Compose file publishes only `127.0.0.1:8080` and contains the read-only synthetic example. Real project use requires explicit, narrow bind mounts and a matching container source configuration. Linux bind mounts must have host permissions compatible with the container user; Docker Desktop on Windows and macOS may require file-sharing approval for directories outside the repository.

## Troubleshooting

- **Node is too old:** use `node --version` and install Node.js 22 or newer.
- **Port 8080 is occupied:** set `PORT=8081` in Bash/Zsh or `$env:PORT='8081'` in PowerShell.
- **Source configuration fails at startup:** verify `SOURCES_CONFIG` points to readable JSON and its relative roots exist.
- **Records are read-only:** verify the project's `taskRoot` exists, is included under a configured root, and is writable by the current user.
- **SSH selects the wrong GitHub account:** use the host alias associated with that account in the clone URL, such as `github-private` rather than `github.com`.
- **Skill is not discovered:** verify the complete skill directory, including `SKILL.md`, is under the active Codex skills directory.
