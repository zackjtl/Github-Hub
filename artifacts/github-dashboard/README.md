# GitHub Personal Dashboard

A personal GitHub portal: dashboard stats, repo browser, repo detail pages with README, customizable per-repo platform links, configurable dashboard repos, per-repo Markdown notes synced via private GitHub Gist.

All credentials and preferences live in the browser's `localStorage` — there is no backend. Notes are stored as private Gists on your own GitHub account.

## Deploying to GitHub Pages

A GitHub Actions workflow at `.github/workflows/deploy-pages.yml` builds and publishes this app to GitHub Pages automatically.

### One-time setup

1. Push this repository to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.

### Deploying

- Push to `main` (or run the workflow manually from the **Actions** tab).
- After ~1–2 minutes the site is live at:
  - Project repo: `https://<user>.github.io/<repo-name>/`
  - User site repo (`<user>.github.io`): `https://<user>.github.io/`

The workflow auto-detects the repo name and sets Vite's `base` accordingly. SPA routing is handled by copying `index.html` to `404.html`.

### How tokens work

There are no secrets baked into the build. Each visitor enters their own GitHub Personal Access Token on the **Setup** screen; it is stored only in their browser's `localStorage`. Required scopes: `repo`, `user`, `gist`.

## Local development

From the monorepo root:

```bash
pnpm install
pnpm --filter @workspace/github-dashboard run dev
```
