---
type: document
title: Example verification runbook
date: 2026-01-15
summary: Safe commands for verifying the synthetic catalog and dashboard.
topic: app
document_state: current
---

# Example verification runbook

From the repository root with Node.js 22 or newer:

```powershell
node --test
$env:SOURCES_CONFIG = (Resolve-Path '.\sources.json')
node server.mjs
```

Open `http://127.0.0.1:8080`, select **Example Project**, and confirm `EXAMPLE-001` appears once. Stop the foreground server with Ctrl+C.
