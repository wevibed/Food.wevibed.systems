// WhatsApp links and price text. No dependencies.

export function normalizeNumber(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function waLink(number, text) {
  return `https://wa.me/${normalizeNumber(number)}?text=${encodeURIComponent(text)}`;
}

// 12.5 -> "$12.50". null -> the fallback text (for items priced on request).
export function money(value, symbol = "$", fallback = "Ask for price") {
  if (value === null || value === undefined) return fallback;
  return `${symbol}${Number(value).toFixed(2)}`;
}
