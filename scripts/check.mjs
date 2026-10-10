// Checks src/data/*.json before every build. No dependencies, so it runs before `npm install` too.
// Errors stop the build. Warnings are for you to read. A site with status "live" is held to a stricter standard.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

function load(name) {
  try {
    return JSON.parse(readFileSync(join(root, "src/data", name), "utf8"));
  } catch (e) {
    err(`${name}: cannot read or parse (${e.message})`);
    return null;
  }
}

const site = load("site.json");
const catalogue = load("products.json");

function strings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => strings(v, out));
  return out;
}

if (site) {
  const need = (path, v) => {
    if (v === undefined || v === null || v === "") err(`site.json: missing ${path}`);
  };
  need("status", site.status);
  if (site.status && !["demo", "draft", "live"].includes(site.status)) err(`site.json: status must be demo, draft or live`);
  need("business.name", site.business?.name);
  need("business.tagline", site.business?.tagline);
  need("business.description", site.business?.description);
  need("contact.whatsapp", site.contact?.whatsapp);
  need("brand.accent", site.brand?.accent);
  need("brand.fontsUrl", site.brand?.fontsUrl);
  need("seo.domain", site.seo?.domain);
  need("hero.headline", site.hero?.headline);

  const digits = String(site.contact?.whatsapp ?? "");
  if (!/^\d{8,15}$/.test(digits)) err(`site.json: contact.whatsapp must be digits only with country code, like 263771234567`);
  if (site.brand?.accent && !/^#[0-9a-fA-F]{6}$/.test(site.brand.accent)) err(`site.json: brand.accent must be a 6-digit hex colour`);
  const d = site.business?.description ?? "";
  if (d.length < 50 || d.length > 170) warn(`site.json: business.description is ${d.length} characters. 70 to 160 reads best in Google results.`);

  for (const key of ["hero.image", "seo.ogImage", "brand.logo"]) {
    const v = key.split(".").reduce((o, k) => o?.[k], site);
    if (v && !existsSync(join(root, "public", v))) err(`site.json: ${key} points to ${v} but public${v} does not exist`);
  }

  const live = site.status === "live";
  const all = strings(site).concat(catalogue ? strings(catalogue) : []);
  const placeholders = all.filter((s) => /\[[A-Z][A-Z0-9 ,'/&.-]{2,}\]/.test(s));
  if (placeholders.length) {
    const msg = `${placeholders.length} placeholder text(s) still in the data, for example: ${placeholders[0].slice(0, 70)}`;
    live ? err(`LIVE BLOCKED: ${msg}`) : warn(msg);
  }
  if (/^2637700000/.test(digits)) live ? err("LIVE BLOCKED: contact.whatsapp is the demo number") : warn("contact.whatsapp is still the demo number");
  if (/example\.(com|org)$|pages\.dev$/.test(site.seo?.domain ?? "")) live ? err("LIVE BLOCKED: seo.domain is not the client's real domain") : warn("seo.domain is a placeholder");
  if (!site.hero?.image) live ? err("LIVE BLOCKED: hero.image is missing (the hero shows a colour placeholder)") : warn("hero.image not set, the hero shows a colour placeholder");
  if (!site.seo?.ogImage) live ? err("LIVE BLOCKED: seo.ogImage is missing (link previews need a 1200x630 PNG or JPG)") : warn("seo.ogImage not set, shared links will have no preview picture");
}

if (catalogue) {
  const items = catalogue.items;
  if (!Array.isArray(items) || items.length === 0) err("products.json: needs a non-empty items array");
  else {
    const seen = new Set();
    let noImage = 0;
    for (const p of items) {
      const where = `products.json: ${p.id ?? p.name ?? "(item without id)"}`;
      if (!p.id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id)) err(`${where}: id must be a lowercase-hyphen slug`);
      if (seen.has(p.id)) err(`${where}: duplicate id`);
      seen.add(p.id);
      if (!p.name) err(`${where}: missing name`);
      if (p.price !== null && p.price !== undefined && (typeof p.price !== "number" || p.price < 0)) err(`${where}: price must be a number or null`);
      if (p.image) {
        if (/^https?:/.test(p.image)) err(`${where}: image must be a file in public/, not a web address`);
        else if (!existsSync(join(root, "public", p.image))) err(`${where}: image ${p.image} not found in public/`);
      } else noImage += 1;
    }
    if (noImage) warn(`${noImage} of ${items.length} products have no photo yet and show a colour tile`);
    for (const p of items) for (const r of p.related ?? []) if (!seen.has(r)) err(`products.json: ${p.id} lists related id "${r}" which does not exist`);
  }
}

for (const w of warnings) console.log(`warning: ${w}`);
for (const e of errors) console.error(`ERROR: ${e}`);
console.log(`\ncheck: ${errors.length} error(s), ${warnings.length} warning(s)${site ? ` (status: ${site.status})` : ""}`);
process.exit(errors.length ? 1 : 0);
