// Applies the client's brand accent colour to the page. The rest of the look comes from theme.css.

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Text colour that stays readable on top of the accent.
export function readableOn(hex) {
  return luminance(hex) > 0.4 ? "#101418" : "#FFFFFF";
}

export function applyBrand(site) {
  const root = document.documentElement.style;
  const accent = site.brand?.accent;
  if (accent && /^#[0-9a-fA-F]{6}$/.test(accent)) {
    root.setProperty("--accent", accent);
    root.setProperty("--accent-ink", readableOn(accent));
  }
}
