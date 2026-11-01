# Перекличка

A browser-local roll-call PWA built with React, TypeScript, Vite, and pnpm workspaces.

## Deployment

Production: **https://gerkirill.github.io/roll-call/**

1. In the GitHub repository, open **Settings → Pages → Build and deployment** and select **GitHub Actions** as the source.
2. Push the `pages-preview` branch, which contains the frontend and deployment changes: `git push -u origin pages-preview`. The **Deploy to GitHub Pages** workflow installs dependencies, typechecks the workspace, builds and checks the PWA, then publishes it. Pushes to `main` do not deploy.
3. In **Settings → Environments → github-pages**, ensure deployment branch rules allow `pages-preview`.
4. Wait for a successful deployment before sharing the production URL.

For now, `pages-preview` is the only branch permitted by the workflow to deploy. To release further changes, bring them onto that branch and push it. Manual dispatch is also supported for `pages-preview` once GitHub exposes the workflow in Actions (the workflow must exist on the default branch for the manual-run UI to be available).

Only `artifacts/perekladychka/dist/public` is published. No database, API host, deployment secret, or Replit account is required. The API, DB, and mockup packages are retained scaffolding, not production services.

Clean deep links such as `/roll-call/settings` use a generated `404.html` app shell. GitHub Pages initially returns HTTP 404 for these requests even though the app renders correctly. Asset URLs and the service worker are scoped to the Pages base path. See [deployment architecture](architecture.md) for the hosting contract.

## Moving existing data from Replit

Browser storage is tied to the origin; switching hosts does **not** copy existing data.

1. Before retiring Replit, open the old app and export your data from Settings. Keep a safe backup.
2. Open the GitHub Pages app and import the exported file in Settings. Confirm the roster and history are present.
3. Install the new PWA from the Pages address if desired. The old installation stays tied to the old host; remove it only after confirming your data transferred.

## Local development

Use Node.js 24 and pnpm 10.34.9 (matching CI).

```sh
pnpm install --frozen-lockfile
pnpm --filter @workspace/perekladychka dev
pnpm run typecheck
```

The dev server defaults to port 5173 and base `/`. `PORT` and `BASE_PATH` can override these defaults.

To reproduce and preview the deployed build:

```sh
BASE_PATH=/roll-call/ pnpm --filter @workspace/perekladychka build
BASE_PATH=/roll-call/ node scripts/check-pages-build.mjs
BASE_PATH=/roll-call/ pnpm --filter @workspace/perekladychka serve
```

Open `http://localhost:5173/roll-call/`. Vite preview provides SPA fallback; GitHub Pages uses the generated 404 shell instead. For a root deployment, omit `BASE_PATH`. The deployment workflow obtains its base path from GitHub Pages.

`pnpm run build` builds all scaffold packages too; it is not the Pages deployment command.
