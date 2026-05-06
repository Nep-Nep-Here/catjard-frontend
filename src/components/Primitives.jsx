/* Reusable UI primitives — buttons + section title */

import { useRipple } from '../hooks/hooks.jsx';
import { ArrowRight } from './Icons.jsx';

/* Primary amber CTA */
export function PrimaryCTA({ children, href = "#cotiza", className = "", icon = true, size = "md" }) {
  const { ref, spawn } = useRipple();
  const sizeCls = size === "lg"
    ? "px-8 py-5 text-[17px]"
    : "px-7 py-4 text-[15px]";
  return (
    <a
      ref={ref}
      href={href}
      onMouseEnter={spawn}
      onClick={spawn}
      className={`relative overflow-hidden inline-flex items-center gap-2 rounded-full bg-amber text-brown font-body font-semibold ${sizeCls} hover:bg-amber-light transition-colors ${className}`}
    >
      <span className="relative z-10">{children}</span>
      {icon && <ArrowRight size={18} className="relative z-10" />}
    </a>
  );
}

export function DarkCTA({ children, href = "#cotiza", className = "", size = "md" }) {
  const { ref, spawn } = useRipple();
  const sizeCls = size === "lg" ? "px-9 py-5 text-[17px]" : "px-7 py-4 text-[15px]";
  return (
    <a ref={ref} href={href} onMouseEnter={spawn} onClick={spawn}
       className={`relative overflow-hidden inline-flex items-center gap-2 rounded-full bg-brown text-cream font-body font-semibold ${sizeCls} hover:bg-bg-dark transition-colors ${className}`}>
      <span className="relative z-10">{children}</span>
      <ArrowRight size={18} className="relative z-10" />
    </a>
  );
}

export function GhostCTA({ children, href = "#productos" }) {
  return (
    <a href={href}
       className="font-body text-cream text-[15px] ul-anim pb-1 inline-flex items-center gap-2">
      {children}
    </a>
  );
}

/* Big section title with concentric soundwave reveal */
export function SectionTitle({ children, color = "text-cream", size = "text-5xl md:text-7xl", align = "left", waveColor = "text-amber" }) {
  return (
    <div className={`relative inline-block ${align === "center" ? "mx-auto" : ""}`}>
      <div className={`title-wave absolute inset-0 pointer-events-none ${waveColor}`}>
        <span></span><span></span><span></span>
      </div>
      <h2 className={`relative font-display font-black ${size} ${color} balance leading-[0.95] tracking-[-0.02em]`}>
        {children}
      </h2>
    </div>
  );
}
