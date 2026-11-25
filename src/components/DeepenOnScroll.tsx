'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Fixed backdrop that drifts up and fades into the page colour over the first screen of scrolling,
 * so sections further down sit deeper in the gradient.
 */
export default function DeepenOnScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const p = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
      el.style.transform = `translateY(${-p * 35}vh)`;
      el.style.opacity = String(1 - p * 0.92);
      // Soften the bottom edge that opens up as the backdrop rises.
      const mask = `linear-gradient(to top, transparent 0, #000 ${p * 45}vh)`;
      el.style.maskImage = mask;
      el.style.webkitMaskImage = mask;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div ref={ref} className="fixed inset-0 -z-10 will-change-transform">
      {children}
    </div>
  );
}
