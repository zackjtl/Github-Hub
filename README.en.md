# GitHub Hub

A self-hosted personal GitHub portal — a beautiful replacement for GitHub's default repo listing. Build your own dashboard with stats, a repo browser, repo detail pages, customizable links, and per-repo Markdown notes — all running on your own GitHub Pages site for free.

> **No backend. No database. No vendor lock-in.** Your token and preferences live in your browser's `localStorage`. Notes are stored as private Gists on your own GitHub account, so they sync across devices.

English ｜ [繁體中文](./README.md)

![Dashboard](Docs/dashboard.png)

## Features

- 📊 **Dashboard** — Overview of your activity, top repos, language stats
- 🔍 **Repo Browser** — Search and filter all your repositories
- 📄 **Repo Detail Pages** — README rendering, metadata, contributors
- 🔗 **Custom Platform Links** — Pin per-repo links (deployed site, docs, design files…)
- 📝 **Markdown Notes** — Per-repo notes with live preview, synced via private Gist
- ⚙️ **Configurable Dashboard** — Choose which repos appear on your dashboard
- 🌗 **Dark mode** by default, with a polished gradient theme

### Custom Platform Links

A GitHub repo is usually just the source — the real work lives elsewhere: the deployed site, design files, docs, issue trackers, cloud consoles. GitHub-Hub lets you pin any number of links **per repo**, with icons and colors auto-detected from the platform (Vercel, Netlify, Figma, Notion, Linear, Supabase, Firebase, Google Drive…).

For one repo you might pin all of:

- 🌐 **Vercel** deployment
- 🎨 **Figma** design file
- 📋 **Linear** project board
- 📖 **Notion** spec doc
- 🗄️ **Supabase** backend console

These show at the top of the repo detail page for one-click access. Link configuration lives only in your browser's `localStorage` — nothing is uploaded.

### Screenshots

| Repo Detail | Notes |
|---|---|
| ![Repo detail page](Docs/repo-detail.png) | ![Markdown notes](Docs/notes.png) |

## Quick Start — Deploy Your Own (5 minutes)

You'll get your own copy at `https://<your-username>.github.io/<repo-name>/`.

### 1. Use this repo as a template

Click **[Use this template](../../generate)** at the top of the GitHub page → **Create a new repository**. Pick a name (e.g. `my-github-hub`) and make it **Public** (required for free GitHub Pages).

> Or fork / clone manually if you prefer.

### 2. Enable GitHub Pages

In your new repo:

1. Go to **Settings → Pages**
2. Under **Build and deployment → Source**, choose **GitHub Actions**

### 3. Trigger the deployment

The included GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) builds and deploys automatically on every push to `main`.

- If you used "Use this template", the first push already happened — go to the **Actions** tab and watch it run.
- If nothing is running, push any small change, or open the workflow on the Actions tab and click **Run workflow**.

After ~1–2 minutes, your site is live at:

```
https://<your-username>.github.io/<repo-name>/
```

### 4. Set it up

1. Open your site.
2. The Setup screen asks for a **GitHub Personal Access Token**.
3. Create one at https://github.com/settings/tokens → **Generate new token (classic)**.
4. Select scopes: **`repo`**, **`user`**, **`gist`**.
5. Paste the token into the Setup screen. Done — your dashboard loads.

The token is saved only in your browser's `localStorage`. Visitors of your site will see the same Setup screen and supply their own token; they cannot read yours.

## Local Development

Requirements: **Node.js 22+** and **pnpm 10+**.

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
pnpm install
pnpm --filter @workspace/github-dashboard run dev
```

The dev server prints a local URL. The app expects a `BASE_PATH` env var in production builds (the GitHub Actions workflow sets this automatically based on your repo name).

To preview a production build locally:

```bash
BASE_PATH=/ PORT=4173 pnpm --filter @workspace/github-dashboard run build
BASE_PATH=/ PORT=4173 pnpm --filter @workspace/github-dashboard run serve
```

## How It Works

| Concern | Where it lives |
|---|---|
| GitHub token | `localStorage` (`github_config`) — never sent anywhere except api.github.com |
| Theme preference | `localStorage` (`theme`) |
| Custom repo links | `localStorage` (`repo_links`) |
| Dashboard repo selection | `localStorage` (`dashboard_prefs`) |
| Notes content | Private Gist on your GitHub account (one Gist per repo, marked `[gitdash:notes] owner/repo`) |
| Notes Gist ID cache | `localStorage` (`gitdash_notes_gist_ids`) |

Because notes live in a private Gist, they sync seamlessly between devices — log in on a new browser with the same token and your notes appear.

## Tech Stack

- React 19 + Vite
- Tailwind CSS v4 + shadcn/ui
- TanStack Query for data fetching
- wouter for routing
- react-markdown + remark-gfm for note rendering
- Deployed via GitHub Actions to GitHub Pages

## Customizing

The app code lives in `artifacts/github-dashboard/src/`:

- `pages/` — top-level routes (dashboard, repo-browser, repo-detail, settings)
- `components/` — UI components, including `setup-screen.tsx` for the onboarding flow
- `hooks/use-github-api.ts` — all GitHub REST API calls
- `index.css` — gradient theme and design tokens

Tweak colors, add tabs, change the layout — it's all yours.

## FAQ

**Is my token safe?**
Yes. It's stored only in your browser, sent only to `api.github.com` over HTTPS, and never written to any build artifact. If you visit someone else's deployment of this app, they cannot read your token.

**What if I want to keep my repo private?**
GitHub Pages on private repos requires GitHub Pro. The app itself works perfectly fine — only the hosting tier differs.

**Can I use a custom domain?**
Yes. Add a `CNAME` file under `artifacts/github-dashboard/public/` with your domain, and configure DNS as per [GitHub's docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site). You'll also need to set `BASE_PATH=/` in the workflow.

**Where are notes stored?**
As private Gists on your own account, one per repo. The dashboard finds them by scanning your Gists for the marker `[gitdash:notes] owner/repo` in the description.

## License

MIT — do whatever you want, no warranty.
