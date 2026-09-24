import React, { useEffect, useRef } from 'react';

/**
 * Ultra-smooth, GPU-composited ScrollReveal
 * - Uses IntersectionObserver with translate3d
 * - Cleans up inline transforms once revealed so layout is 100% native
 * - Prevents layout height shift and scrollbar jitter
 */
export default function ScrollReveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check if element is already in initial viewport
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.style.opacity = '1';
      return;
    }

    el.style.opacity = '0';
    el.style.transform = 'translate3d(0, 20px, 0)';
    el.style.willChange = 'opacity, transform';
    el.style.transition = `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translate3d(0, 0, 0)';
          observer.disconnect();

          // Clean up willChange and inline styles after animation completes
          setTimeout(() => {
            if (el) {
              el.style.willChange = 'auto';
              el.style.transform = '';
              el.style.transition = '';
            }
          }, 700 + delay);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
