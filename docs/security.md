# Security and privacy boundary

## Trust model

This is a single-user local tool. Loopback binding, Host/Origin checks, same-origin controls, a per-process write token, and a strict content-security policy reduce browser attack surface. They do not provide authentication or make direct LAN/internet exposure safe.

## Filesystem

The active source configuration is the read allowlist. Task writes require a valid task directly inside the configured task root. Real paths are checked, symbolic roots and entries are rejected, and stale versions do not overwrite newer content.

Native mode has the current user's OS permissions. Docker can add a boundary only when given narrow read-only roots and writable task subdirectories. Never mount a whole home directory, drive, or workspace root.

## Repository

The repository contains synthetic examples only. Keep machine-specific source maps, real work records, `.history`, logs, captures, exports, temporary files, credentials, tokens, private keys, recovery codes, and certificate contents untracked.

A private repository is still durable shared storage. Review staged filenames and content before every push.

## Rendering

Markdown is rendered locally rather than injected as arbitrary HTML. Navigation is limited to indexed catalog links and explicit HTTP(S) links. Images and embeds are not loaded. Preserve these constraints.

Authenticated remote or multi-user access requires a separate authorization and deployment design.
