/* Custom React hooks — ripple effect + IntersectionObserver-based reveal */

import { useEffect, useRef, useCallback } from 'react';

/* Adds a ripple at the click/hover point inside the calling element */
export function useRipple() {
  const ref = useRef(null);
  const spawn = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX ?? rect.left + rect.width / 2) - rect.left;
    const y = (e.clientY ?? rect.top + rect.height / 2) - rect.top;
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.setProperty('--rx', x + 'px');
    span.style.setProperty('--ry', y + 'px');
    el.appendChild(span);
    setTimeout(() => span.remove(), 900);
  }, []);
  return { ref, spawn };
}

/* IntersectionObserver-based reveal */
export function useReveal(opts = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) {
          el.classList.add('in');
          if (opts.titleWave) {
            const w = el.querySelector('.title-wave');
            if (w) { w.classList.remove('run'); void w.offsetWidth; w.classList.add('run'); }
          }
          if (opts.once !== false) io.unobserve(el);
        }
      }),
      { threshold: opts.threshold ?? 0.18 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
