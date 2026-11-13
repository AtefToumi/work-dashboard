$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$dashboardNode = Get-Command node -ErrorAction SilentlyContinue
if ($dashboardNode) {
    $dashboardNodePath = $dashboardNode.Source
} else {
    $dashboardNodePath = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
    if (-not (Test-Path -LiteralPath $dashboardNodePath)) {
        throw 'Node.js 22 or newer is required. Install your company-approved Node.js runtime, or use Docker Compose.'
    }
}
$dashboardMajor = & $dashboardNodePath -p 'process.versions.node.match(/^[0-9]+/)[0]'
if ([int]$dashboardMajor -lt 22) { throw 'Node.js 22 or newer is required.' }
if (-not $env:SOURCES_CONFIG) {
    $localSources = Join-Path $PSScriptRoot 'sources.local.json'
    if (Test-Path -LiteralPath $localSources) { $env:SOURCES_CONFIG = $localSources }
}
Write-Host 'Open the Local URL printed below. Keep this window open; press Ctrl+C to stop.'
& $dashboardNodePath (Join-Path $PSScriptRoot 'server.mjs')
exit $LASTEXITCODE
