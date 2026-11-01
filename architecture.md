---
id: deployment-architecture
type: architecture-design
status: active
title: Static PWA deployment
---

## Hosting boundary

Перекличка is deployed as a static, browser-local PWA on GitHub Pages at `https://gerkirill.github.io/roll-call/`. Production serves only the frontend; the repository's API and database scaffolding are not runtime dependencies. GitHub Actions currently publishes only from the separate `pages-preview` branch, rather than requiring a Replit runtime. Pushes to `main` do not deploy; manual dispatch is also restricted to `pages-preview`. This temporary branch isolation keeps Pages deployment independent of mainline changes.

## URL and offline contract

The Pages base path scopes application assets, manifest icons, routing, and service worker registration. Root hosting remains supported for local builds. Clean path routes are retained to preserve the existing navigation and link format. Pages serves a copy of the app shell as `404.html` for deep links; the initial HTTP 404 status is an accepted limitation. The service worker provides navigation fallback after installation and keeps the existing explicit update flow.

## Data boundary

Data remains in browser-local storage. Changing origins does not migrate it, and an existing installed PWA stays attached to its old origin. Users export from the old deployment and import into the new deployment before retiring the old installation. Automatic migration, a backend, and custom-domain hosting are outside this deployment change.
