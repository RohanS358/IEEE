'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

/**
 * Fades and lifts its children in when they scroll into view, and back out when they leave.
 * Give siblings increasing `delay` values so they arrive one by one.
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => setShown(e.isIntersecting), {
      threshold: 0.25,
      rootMargin: '0px 0px -8% 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(18px)',
        transition: `opacity 800ms ease ${shown ? delay : 0}ms, transform 800ms ease ${shown ? delay : 0}ms`,
      }}
    >
      {children}
    </Tag>
  );
}
