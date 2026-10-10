import React from "react";
import { useReveal } from "../lib/useReveal";

export default function Reveal({ as: Tag = "div", delay = 0, className = "", children, ...rest }) {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ "--d": `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}
