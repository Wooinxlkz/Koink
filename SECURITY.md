# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | ✅ (current, pre-release) |

## Reporting a vulnerability

This is currently a personal/early-stage project with no public issue
tracker configured yet. Until one exists, keep vulnerability reports private
rather than filing them as public issues once this repo is hosted somewhere:
share reproduction steps and impact directly with the maintainer through a
private channel (e.g. a direct message), not a public issue or PR.

Please include:

- Affected version / commit
- Windows build number and whether you built from source or used a released
  installer
- Steps to reproduce, and what you'd expect to happen instead

## Scope notes specific to this app

- Koink runs as a desktop Tauri app with a Rust backend and a WebView
  frontend. The Tauri capability file (`src-tauri/capabilities/default.json`)
  is the source of truth for what the frontend is allowed to ask the backend
  to do — treat any request to widen it (new filesystem, shell, or network
  permissions) as security-relevant and review it accordingly.
- The window runs with `"transparent": true` and `"decorations": false`;
  this affects rendering only, not the app's permission boundary.
- No telemetry, analytics, or network calls are wired up in this scaffold.
  If any are added later, they belong in this document.

## Third-party code

Parts of Koink are adapted from third-party open-source projects (see
`THIRD_PARTY_NOTICES.md`). Vulnerabilities that originate upstream should
ideally be reported to this project *and*, where still applicable, upstream.
