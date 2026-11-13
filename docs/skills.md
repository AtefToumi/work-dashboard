# Journal skills

The repository maintains:

- `skills/start-day`: read-only briefing across configured work.
- `skills/update-journal`: evidence-based mid-session update.
- `skills/tidy-up`: end-of-session reconciliation and handoff.

## Installation

Copy each complete directory into the active Codex skills directory. On Windows the usual personal location is `%USERPROFILE%\.codex\skills`; replace `$destination` when `CODEX_HOME` or another runtime uses a different directory.

```powershell
$repo = Resolve-Path '.'
$destination = Join-Path $env:USERPROFILE '.codex\skills'
New-Item -ItemType Directory -Force -Path $destination | Out-Null
Copy-Item -Recurse -Force (Join-Path $repo 'skills\start-day') $destination
Copy-Item -Recurse -Force (Join-Path $repo 'skills\update-journal') $destination
Copy-Item -Recurse -Force (Join-Path $repo 'skills\tidy-up') $destination
```

Review installed copies before overwriting customizations. Repository copies are maintained source; installed copies are runtime deployments.

On Linux and macOS:

```bash
destination="${CODEX_HOME:-$HOME/.codex}/skills"
mkdir -p "$destination"
cp -R skills/start-day "$destination/"
cp -R skills/update-journal "$destination/"
cp -R skills/tidy-up "$destination/"
```

## Validation

```powershell
$validator = Join-Path $env:USERPROFILE '.codex\skills\.system\skill-creator\scripts\quick_validate.py'
python $validator '.\skills\start-day'
python $validator '.\skills\update-journal'
python $validator '.\skills\tidy-up'
```

Also exercise changed behavior against synthetic records: start-day stays read-only and counts once; update-journal preserves evidence and IDs; tidy-up leaves a continuation point without executing pending work.

## Discovery and synchronization

Skills locate the dashboard from an explicitly supplied path, the current project tree, or a nearby ancestor containing `AUTHORING.md` and an active source configuration. They must not hard-code a home path. Use the client timezone when available; otherwise disclose the assumption.

After changing and validating one repository skill, compare the complete directory before synchronizing it:

```powershell
$name = 'start-day'
$source = Join-Path (Resolve-Path '.') "skills\$name"
$installed = Join-Path $destination $name
Get-ChildItem $source -File -Recurse | ForEach-Object {
  $relative = [IO.Path]::GetRelativePath($source, $_.FullName)
  [pscustomobject]@{ File=$relative; Source=(Get-FileHash $_.FullName).Hash; Installed=if (Test-Path (Join-Path $installed $relative)) {(Get-FileHash (Join-Path $installed $relative)).Hash} else {'MISSING'} }
}
```

After copying, rerun the comparison and require every source and installed hash to match. Compare and deploy one skill at a time. Do not claim installation when only repository source changed.
