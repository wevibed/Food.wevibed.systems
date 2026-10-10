import React, { useMemo, useState } from "react";
import site from "./data/site.json";
import catalogue from "./data/products.json";
import Blobs from "./components/Blobs";
import GlassNav from "./components/GlassNav";
import Hero from "./components/Hero";
import Reveal from "./components/Reveal";
import Modal from "./components/Modal";
import ProductPhoto from "./components/ProductPhoto";
import { waLink, money } from "./lib/whatsapp";

const PRODUCTS = catalogue.items;
const CATS = site.categories;
const sym = site.currency.symbol;
const priceText = (v) => money(v, sym) + site.currency.priceSuffix;

// Products without packs[] fall back to one pack using the base price.
const packsOf = (p) => (p.packs && p.packs.length ? p.packs : [{ label: "Each", price: p.price }]);

export default function App() {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [pick, setPick] = useState({});
  const [basket, setBasket] = useState({});
  const [open, setOpen] = useState(false);

  const setQty = (key, n) =>
    setBasket((b) => {
      const next = { ...b };
      if (n <= 0) delete next[key];
      else next[key] = n;
      return next;
    });

  const query = q.trim().toLowerCase();
  const shown = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          (cat === "All" || p.category === cat) &&
          (!query || `${p.name} ${p.category} ${p.description ?? ""}`.toLowerCase().includes(query))
      ),
    [cat, query]
  );

  const rows = Object.keys(basket)
    .map((key) => {
      const [id, i] = key.split(":");
      const product = PRODUCTS.find((x) => x.id === id);
      if (!product) return null;
      const pack = packsOf(product)[Number(i)];
      if (!pack) return null;
      return { key, product, pack, qty: basket[key] };
    })
    .filter(Boolean);
  const count = rows.reduce((n, r) => n + r.qty, 0);
  const total = rows.reduce((n, r) => n + r.qty * (r.pack.price ?? 0), 0);

  const orderText =
    `${site.contact.orderGreeting}\n` +
    rows.map((r) => `- ${r.qty} x ${r.product.name} (${r.pack.label})`).join("\n") +
    `\n${site.contact.orderFooter}`;

  const chips = [site.shop.allLabel, ...CATS.map((c) => c.name)];
  const pickCat = (name) => setCat(name === site.shop.allLabel ? "All" : name);
  const chipActive = (name) => (name === site.shop.allLabel ? cat === "All" : cat === name);
  const countText = `${shown.length} ${shown.length === 1 ? site.shop.productWord : site.shop.productsWord}`;

  return (
    <>
      <Blobs />
      <GlassNav
        site={site}
        links={[
          { label: "Shop", href: "#shop" },
          { label: "Visit", href: "#visit" },
        ]}
        cta="WhatsApp us"
        message={site.contact.navMessage}
      />

      <Hero site={site}>
        <a href="#shop" className="btn btn-sun">{site.hero.primaryCta}</a>
        <a href="#visit" className="btn glass-dark" style={{ background: "var(--glass-dark-bg)", color: "#fff" }}>{site.hero.secondaryCta}</a>
      </Hero>

      <main className="max-w-6xl mx-auto px-4 md:px-6">
        {site.business.isSample ? (
          <p className="glass rounded-2xl px-4 py-2 mt-6 text-sm text-muted text-center">{site.business.sampleNotice}</p>
        ) : null}

        <Reveal as="section" className="pt-10 pb-4 grid gap-3.5 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          {CATS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => {
                setCat(c.name);
                document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="cat-tile rounded-[28px] p-5 min-h-[170px] flex flex-col justify-end text-left border-0 shadow-lg"
              style={{ background: c.gradient, color: "var(--ink)" }}
            >
              <span className="self-start rounded-2xl px-3.5 py-2.5 flex flex-col" style={{ background: "rgba(255,255,255,.55)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.7)" }}>
                <span className="font-display font-bold text-xl leading-tight">{c.name}</span>
                <span className="text-[13px]">{PRODUCTS.filter((p) => p.category === c.name).length} {site.shop.productsWord}</span>
              </span>
            </button>
          ))}
        </Reveal>

        <Reveal as="section" className="pt-8 pb-14 flex flex-col gap-4" id="shop">
          <h2 className="font-display font-extrabold text-4xl">{site.shop.heading}</h2>
          <div className="glass rounded-[28px] p-3.5 flex flex-col gap-3">
            <label htmlFor="q" className="sr-only">{site.shop.searchLabel}</label>
            <input
              id="q"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={site.shop.searchPlaceholder}
              className="field w-full min-w-0 rounded-full px-5 py-3.5 text-base"
              style={{ fontFamily: "inherit" }}
            />
            <div className="flex flex-wrap gap-2">
              {chips.map((name) => (
                <button
                  key={name}
                  type="button"
                  className="chip font-bold"
                  style={{ minHeight: 44, padding: "0 18px", fontSize: 14, ...(chipActive(name) ? { background: "var(--ink)", color: "#fff", borderColor: "var(--ink)" } : {}) }}
                  aria-pressed={chipActive(name)}
                  onClick={() => pickCat(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div className="text-sm text-muted" aria-live="polite">{countText}</div>

          <div className="grid gap-x-4 gap-y-5 grid-cols-[repeat(auto-fill,minmax(230px,1fr))]">
            {shown.map((p, n) => {
              const packs = packsOf(p);
              const i = Math.min(pick[p.id] || 0, packs.length - 1);
              const key = `${p.id}:${i}`;
              const inBasket = basket[key] || 0;
              const av = site.availability[p.availability] || site.availability.enquire;
              return (
                <Reveal key={p.id} delay={(n % 4) * 60} className="glass rounded-[28px] p-3 flex flex-col gap-2.5 min-w-0">
                  <div className="relative overflow-hidden rounded-[18px]">
                    <ProductPhoto product={p} />
                    {p.featured ? (
                      <span className="absolute top-2.5 left-2.5 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: "#FFC21A", color: "#1B2B1F" }}>
                        {site.shop.popularLabel}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="font-display font-bold text-lg leading-tight px-1">{p.name}</h3>
                  <p className="text-[13px] text-muted leading-snug px-1">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5 px-0.5">
                    {packs.map((k, j) => (
                      <button
                        key={k.label}
                        type="button"
                        className="chip font-bold"
                        style={{ minHeight: 40, padding: "0 12px", ...(j === i ? { background: "var(--accent)", color: "var(--accent-ink)", borderColor: "var(--accent)" } : {}) }}
                        aria-pressed={j === i}
                        onClick={() => setPick((s) => ({ ...s, [p.id]: j }))}
                      >
                        {k.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap justify-between items-center gap-1.5 px-1">
                    <span className="font-display font-extrabold text-[22px]">{priceText(packs[i].price)}</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: av.bg, color: av.fg }}>{av.label}</span>
                  </div>
                  <button
                    type="button"
                    className="btn"
                    style={inBasket ? { background: "#FFC21A", color: "#1B2B1F", minHeight: 46 } : { minHeight: 46 }}
                    onClick={() => setQty(key, inBasket + 1)}
                  >
                    {inBasket ? site.shop.addedLabel.replace("{n}", inBasket) : site.shop.addLabel}
                  </button>
                </Reveal>
              );
            })}
          </div>
          {shown.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center text-muted">{site.shop.emptyMessage}</div>
          ) : null}
        </Reveal>

        <Reveal as="section" className="pb-6 grid gap-4 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]" id="visit">
          {site.visit.map((v) => (
            <div key={v.title} className="glass rounded-[32px] p-8">
              <h2 className="font-display font-extrabold text-3xl mb-2">{v.title}</h2>
              <p className="leading-relaxed text-muted">{v.text}</p>
            </div>
          ))}
        </Reveal>

        <footer className="py-4 pb-24 text-[13px] text-muted flex flex-wrap gap-x-6 gap-y-2 justify-between">
          <span>{site.footer.left}</span>
          <span>{site.footer.right}</span>
        </footer>
      </main>

      <button
        type="button"
        className="btn glass-dark fixed bottom-4 right-4 z-30"
        onClick={() => setOpen(true)}
        style={{ background: "var(--accent)", minHeight: 48 }}
      >
        {site.basket.button} ({count})
      </button>

      <Modal open={open} onClose={() => setOpen(false)} label={site.basket.title}>
        <div className="flex flex-col gap-3.5">
          <h3 className="font-display font-extrabold text-3xl m-0">{site.basket.title}</h3>
          {rows.length === 0 ? <p className="text-muted m-0">{site.basket.empty}</p> : null}
          {rows.map((r) => (
            <div key={r.key} className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-3" style={{ borderBottom: "1px solid rgba(27,43,31,.12)" }}>
              <div className="flex-1 min-w-[200px]">
                <div className="font-bold">{r.product.name}</div>
                <div className="text-[13px] text-muted">{r.pack.label} - {priceText(r.pack.price)} {site.basket.each}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <button type="button" className="chip" style={{ width: 44, height: 44, padding: 0, fontSize: 20, color: "var(--accent)", borderColor: "var(--accent)" }} aria-label={site.basket.fewer} onClick={() => setQty(r.key, r.qty - 1)}>-</button>
                <span className="min-w-[34px] text-center font-bold">{r.qty}</span>
                <button type="button" className="chip" style={{ width: 44, height: 44, padding: 0, fontSize: 20, color: "var(--accent)", borderColor: "var(--accent)" }} aria-label={site.basket.more} onClick={() => setQty(r.key, r.qty + 1)}>+</button>
              </div>
            </div>
          ))}
          <div className="flex justify-between font-bold text-lg">
            <span>{site.basket.totalLabel}</span>
            <span>{priceText(total)}</span>
          </div>
          <a
            className="btn"
            href={waLink(site.contact.whatsapp, orderText)}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={rows.length === 0}
            style={rows.length === 0 ? { opacity: 0.5, pointerEvents: "none" } : undefined}
          >
            {site.basket.send}
          </a>
          <span className="text-[13px] text-muted">{site.basket.note}</span>
        </div>
      </Modal>
    </>
  );
}
