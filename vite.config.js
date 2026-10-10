import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";

const site = JSON.parse(readFileSync(new URL("./src/data/site.json", import.meta.url), "utf8"));

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");

// Writes the SEO tags into the static HTML and emits robots.txt (and sitemap.xml when live).
// A site with status "demo" or "draft" is hidden from search engines.
function sitePlugin() {
  const live = site.status === "live";
  const origin = `https://${site.seo.domain}`;
  const title = `${site.business.name} | ${site.business.tagline}`;
  const description = site.business.description;

  return {
    name: "wevibed-site-meta",
    transformIndexHtml(html) {
      const tags = [
        `<meta name="robots" content="${live ? "index,follow" : "noindex,nofollow"}" />`,
        `<meta name="theme-color" content="${esc(site.brand.accent)}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="${esc(site.business.name)}" />`,
        `<meta property="og:title" content="${esc(title)}" />`,
        `<meta property="og:description" content="${esc(description)}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
      ];
      if (live) tags.push(`<link rel="canonical" href="${origin}/" />`, `<meta property="og:url" content="${origin}/" />`);
      if (site.seo.ogImage) tags.push(`<meta property="og:image" content="${origin}${site.seo.ogImage}" />`);
      return html
        .replace("%SITE_TITLE%", () => esc(title))
        .replace("%SITE_DESCRIPTION%", () => esc(description))
        .replace("%FONTS_URL%", () => site.brand.fontsUrl)
        .replace("%SEO_TAGS%", () => tags.join("\n    "));
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: live ? `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n` : "User-agent: *\nDisallow: /\n",
      });
      if (live) {
        this.emitFile({
          type: "asset",
          fileName: "sitemap.xml",
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>\n`,
        });
      }
    },
  };
}

export default defineConfig({ plugins: [react(), sitePlugin()] });
