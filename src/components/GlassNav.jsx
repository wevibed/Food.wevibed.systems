import React from "react";
import { waLink } from "../lib/whatsapp";

// Floating glass pill. links: [{ label, href }]
export default function GlassNav({ site, links = [], cta = "WhatsApp us", message = "Hi, I have a question." }) {
  const name = site.business.shortName || site.business.name;
  return (
    <div className="nav-wrap">
      <nav className="nav-pill glass" aria-label="Main">
        <a href="#top" className="flex items-center gap-2 font-display font-bold" style={{ color: "inherit", textDecoration: "none" }}>
          {site.brand.logo ? <img src={site.brand.logo} alt="" className="h-7 w-7 rounded-full object-cover" /> : null}
          <span>{name}</span>
        </a>
        <div className="nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </div>
        <a className="btn" style={{ padding: "9px 18px", fontSize: 14 }} href={waLink(site.contact.whatsapp, message)} target="_blank" rel="noopener noreferrer">
          {cta}
        </a>
      </nav>
    </div>
  );
}
