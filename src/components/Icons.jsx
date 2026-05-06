/* Inline SVG icon set + the Cat Jard mark (original geometric interpretation) */

const Icon = ({ children, size = 24, strokeWidth = 1.6, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
       className={className}>
    {children}
  </svg>
);

export const ArrowRight   = (p) => <Icon {...p}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></Icon>;
export const ArrowDown    = (p) => <Icon {...p}><path d="M12 5v14"/><path d="m6 13 6 6 6-6"/></Icon>;
export const Check        = (p) => <Icon {...p}><path d="M20 6 9 17l-5-5"/></Icon>;
export const Clock        = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>;
export const Truck        = (p) => <Icon {...p}><path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></Icon>;
export const Package      = (p) => <Icon {...p}><path d="m3 7 9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></Icon>;
export const Quote        = (p) => <Icon {...p}><path d="M7 7h4v6H7v-2c0-1.5 1-3 3-4"/><path d="M14 7h4v6h-4v-2c0-1.5 1-3 3-4"/></Icon>;
export const Instagram    = (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></Icon>;
export const Linkedin     = (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 11v6"/><path d="M8 8v.01"/><path d="M12 17v-3a2 2 0 0 1 4 0v3"/><path d="M12 11v6"/></Icon>;
export const Whatsapp     = (p) => <Icon {...p}><path d="M21 12a9 9 0 1 1-3.6-7.2L21 3l-1.5 4A9 9 0 0 1 21 12Z"/><path d="M8 10c.5 3 2.5 5 5.5 5.5l1.5-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z"/></Icon>;
export const Mail         = (p) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></Icon>;
export const Phone        = (p) => <Icon {...p}><path d="M5 4h4l2 5-2 1a12 12 0 0 0 5 5l1-2 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2z"/></Icon>;

/* Six technique marks — abstract, geometric, no clichés */
export const TechSerigrafia = (p) => <Icon {...p}><rect x="3" y="5" width="18" height="12" rx="1"/><path d="M3 11h18"/><path d="M7 17v3"/><path d="M17 17v3"/></Icon>;
export const TechSublimado  = (p) => <Icon {...p}><path d="M5 19c2-3 4-3 7 0s5 3 7 0"/><path d="M5 14c2-3 4-3 7 0s5 3 7 0"/><path d="M5 9c2-3 4-3 7 0s5 3 7 0"/></Icon>;
export const TechDTF        = (p) => <Icon {...p}><rect x="4" y="3" width="16" height="13" rx="1"/><path d="M8 20h8"/><path d="M12 16v4"/><path d="M9 8h6"/></Icon>;
export const TechBordado    = (p) => <Icon {...p}><circle cx="12" cy="12" r="8"/><path d="M4 12h16"/><path d="M12 4v16"/><path d="m6 6 12 12"/></Icon>;
export const TechLaser      = (p) => <Icon {...p}><path d="M12 3v6"/><path d="M5 12h2"/><path d="M17 12h2"/><circle cx="12" cy="14" r="6"/><path d="M12 14v0"/></Icon>;
export const TechUV         = (p) => <Icon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 4v2"/><path d="M12 18v2"/><path d="M4 12h2"/><path d="M18 12h2"/><path d="m6 6 1.4 1.4"/><path d="m16.6 16.6 1.4 1.4"/><path d="m6 18 1.4-1.4"/><path d="m16.6 7.4 1.4-1.4"/></Icon>;

/* Sound-wave glyph used throughout */
export const SoundWave = ({ size = 64, className = "", strokeWidth = 1.4 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="swg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#C48B28"/>
        <stop offset="100%" stopColor="#EBC176"/>
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="4"  stroke="url(#swg)" strokeWidth={strokeWidth} opacity="0.95"/>
    <circle cx="32" cy="32" r="11" stroke="url(#swg)" strokeWidth={strokeWidth} opacity="0.7"/>
    <circle cx="32" cy="32" r="18" stroke="url(#swg)" strokeWidth={strokeWidth} opacity="0.45"/>
    <circle cx="32" cy="32" r="26" stroke="url(#swg)" strokeWidth={strokeWidth} opacity="0.22"/>
  </svg>
);

/* Original Cat Jard mark — circular badge with a geometric, abstract feline silhouette */
export const CatJardMark = ({ size = 48, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-label="Cat Jard">
    <defs>
      <linearGradient id="cjm" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#EBC176"/>
        <stop offset="100%" stopColor="#C48B28"/>
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="30" stroke="url(#cjm)" strokeWidth="1.2" fill="#1A0F05"/>
    <circle cx="32" cy="32" r="26" stroke="url(#cjm)" strokeWidth="0.6" opacity="0.6" fill="none"/>
    <path d="M20 28 L24 18 L28 26 Z" fill="url(#cjm)"/>
    <path d="M44 28 L40 18 L36 26 Z" fill="url(#cjm)"/>
    <circle cx="32" cy="32" r="9" fill="url(#cjm)"/>
    <circle cx="29" cy="31" r="1.1" fill="#1A0F05"/>
    <circle cx="35" cy="31" r="1.1" fill="#1A0F05"/>
    <path d="M26 39 q3 2 6 0 t6 0" stroke="#1A0F05" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
  </svg>
);
