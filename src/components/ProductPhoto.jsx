import React from "react";

// Real photo when product.image is set, otherwise a tinted placeholder with the product initial.
export default function ProductPhoto({ product, className = "", ratio = "1 / 1" }) {
  if (product.image) {
    return (
      <img src={product.image} alt={product.name} loading="lazy" className={`w-full object-cover ${className}`} style={{ aspectRatio: ratio }} />
    );
  }
  return (
    <div className={`tint-${product.tint ?? 0} grid place-items-center ${className}`} style={{ aspectRatio: ratio }} role="img" aria-label={product.name}>
      <span className="font-display text-4xl font-bold opacity-40">{product.name.charAt(0)}</span>
    </div>
  );
}
