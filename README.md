# WeVibed Food & General Merchandise

WeVibed retail template: React 18 + Vite + Tailwind 3, deployed on Cloudflare Pages from GitHub.

> **UNVERIFIED until CI runs.** This project was written without being able to run `npm install` or `vite build`
> in the authoring environment. The first GitHub Actions run is the source of truth. If it fails, fix that first.

## Set up a new client

1. Create a new GitHub repo from this folder (or copy it) and push.
2. Edit `src/data/site.json` (name, WhatsApp number, colours, address, hours, hero text, domain).
3. Edit `src/data/products.json` (name, category, price or `null`, description). Put photos in `public/images/` and set `"image": "/images/xyz.jpg"`.
4. Put the hero photo at `public/images/hero.jpg` and set `hero.image`.
5. `npm install`, `npm run dev` to preview, `npm run check` to validate.

## Status flow (`site.json` -> `status`)

| status | indexed by Google | build rules |
|---|---|---|
| `demo` | no (noindex, robots disallow) | placeholders allowed. Use for prospect demos |
| `draft` | no | placeholders allowed |
| `live` | yes (sitemap, canonical) | `npm run build` FAILS while placeholders, the demo WhatsApp number, example/pages.dev domains or a missing hero/og image remain |

## Cloudflare Pages

- Connect the GitHub repo (Workers & Pages -> Create -> Pages -> Connect to Git).
- Build command: `npm run build`   Output directory: `dist`
- Environment variable: `NODE_VERSION` = `22`
- No secrets are needed. The site is static; there are no payments, accounts or stock sync.
- Custom domain: add it under the Pages project, then set `seo.domain` in `site.json` and `status` to `live`.

## CI

`.github/workflows/ci.yml` runs on push/PR: install, `npm run check`, `npm run build`, and uploads `dist` and `package-lock.json`.
After the first successful run, download the `package-lock` artifact and commit it so installs are reproducible.
