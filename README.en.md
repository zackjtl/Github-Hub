# GitHub Hub

<a href="https://vercel.com/new/clone?repository-url=https://github.com/zackjtl/Github-Hub&root-directory=artifacts%2Fgithub-dashboard" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Deploy_with_Vercel-181717?style=for-the-badge&logo=vercel&logoColor=white" alt="Deploy with Vercel" /></a> <a href="../../generate" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Use_this_template-181717?style=for-the-badge&logo=github&logoColor=white" alt="Use this template" /></a>

A self-hosted personal GitHub portal — a beautiful replacement for GitHub's default repo listing. Pin the public and private repos you currently care about on your home page, with built-in stats, a repo browser, repo detail pages, customizable links, and per-repo Markdown notes — deployable for free on GitHub Pages or as a static site on Vercel.

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

Built-in support for the most common platforms:

![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)
![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)
![Notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white)
![Linear](https://img.shields.io/badge/Linear-5E6AD2?style=for-the-badge&logo=linear&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Google Drive](https://img.shields.io/badge/Drive-4285F4?style=for-the-badge&logo=googledrive&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white)
![Slack](https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white)
![Jira](https://img.shields.io/badge/Jira-0052CC?style=for-the-badge&logo=jira&logoColor=white)

…and more. Any platform not on the list can still be added — it just falls back to a generic icon.

These show at the top of the repo detail page for one-click access. Link configuration lives only in your browser's `localStorage` — nothing is uploaded.

### Screenshots

| Repo Detail | Notes |
|---|---|
| ![Repo detail page](Docs/repo-detail.png) | ![Markdown notes](Docs/notes.png) |

## Quick Start — Deploy Your Own (5 minutes)

Choose one of the following deployment methods:

### Vercel One-Click Deploy

- **Step 1.** Click the **Deploy with Vercel** button at the top of this page.
- **Step 2.** Complete import and deployment in Vercel (the root directory is preconfigured as `artifacts/github-dashboard`).
- **Step 3.** Open the deployed URL and continue from the Setup screen.
- **Step 4.** Confirm the GitHub username you want to use.
- **Step 5.** Create a token from the [GitHub Personal Access Token (classic) page](https://github.com/settings/tokens), with scopes: **`repo`**, **`user`**, **`gist`**.
- **Step 6.** Go back to the Setup screen and enter your GitHub username and token.

### GitHub Pages

- **Step 1.** Click **[Use this template](../../generate)** at the top of the GitHub page → **Create a new repository**. Pick a name (e.g. `my-github-hub`) and make it **Public** (required for free GitHub Pages).
- **Step 2.** In the new repo, go to **Settings → Pages** and choose **GitHub Actions** under **Build and deployment → Source**.
- **Step 3.** Return to the **Actions** tab, select **Deploy GitHub Dashboard to Pages** from the left sidebar, then click **Run workflow** on the right side of the workflow card.
- **Step 4.** Wait for a successful run (green ✅, about 1–2 minutes), then open: `https://<your-username>.github.io/<repo-name>/`.
- **Step 5.** Create a token from the [GitHub Personal Access Token (classic) page](https://github.com/settings/tokens), with scopes: **`repo`**, **`user`**, **`gist`**.
- **Step 6.** Go back to the Setup screen and enter your GitHub username and token.

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
