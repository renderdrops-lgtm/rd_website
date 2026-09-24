import React, { useEffect, useRef } from 'react';

/**
 * Sleek Minimal Custom Cursor (No Glass / Frosted Effect)
 * - Precision red core dot
 * - Delicate hairline wireframe follower ring (100% transparent interior, zero glass/blur)
 * - Subtle hover expansion for interactive elements
 * - Smooth minimal footprint trail
 */

const TRAIL_COUNT = 6;

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailRefs = useRef([]);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const trailPositions = useRef(
    Array.from({ length: TRAIL_COUNT }, () => ({ x: -100, y: -100 }))
  );

  const isHovered = useRef(false);
  const isMouseDown = useRef(false);
  const isVisible = useRef(false);

  // Clean ring lerp values
  const ringState = useRef({ scale: 1, borderOpacity: 0.4 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let rafId;

    const onMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      if (!isVisible.current) {
        isVisible.current = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
        trailPositions.current.forEach((pos) => {
          pos.x = e.clientX;
          pos.y = e.clientY;
        });
        trailRefs.current.forEach((el, i) => {
          if (el) el.style.opacity = String(trailConfigs[i]?.baseOpacity ?? 0.4);
        });
      }

      // Check interactive hover
      const interactiveEl = e.target?.closest(
        'a, button, input, textarea, select, [role="button"], .cursor-pointer'
      );
      isHovered.current = !!interactiveEl;
    };

    const onMouseDown = () => { isMouseDown.current = true; };
    const onMouseUp = () => { isMouseDown.current = false; };

    const onMouseLeave = () => {
      isVisible.current = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      trailRefs.current.forEach((el) => { if (el) el.style.opacity = '0'; });
    };

    const onMouseEnter = () => {
      isVisible.current = true;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    };

    const tick = () => {
      const { x: mx, y: my } = mousePos.current;

      // 1. Snap core dot directly to pointer
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;

      // 2. Smooth ring follower lerp
      ringPos.current.x += (mx - ringPos.current.x) * 0.18;
      ringPos.current.y += (my - ringPos.current.y) * 0.18;
      const rx = ringPos.current.x;
      const ry = ringPos.current.y;

      // 3. Crisp hairline ring state (NO glass, NO blur, NO background fill)
      let targetScale, targetBorderA;
      if (isMouseDown.current) {
        targetScale = isHovered.current ? 1.4 : 0.75;
        targetBorderA = 0.9;
      } else if (isHovered.current) {
        targetScale = 1.7;
        targetBorderA = 0.8;
      } else {
        targetScale = 1;
        targetBorderA = 0.4;
      }

      const s = ringState.current;
      s.scale += (targetScale - s.scale) * 0.16;
      s.borderOpacity += (targetBorderA - s.borderOpacity) * 0.16;

      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${s.scale.toFixed(3)})`;
      ring.style.borderColor = `rgba(227, 27, 46, ${s.borderOpacity.toFixed(3)})`;

      // 4. Trail chain lerp
      let prevX = mx;
      let prevY = my;
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const node = trailPositions.current[i];
        const el = trailRefs.current[i];
        node.x += (prevX - node.x) * 0.36;
        node.y += (prevY - node.y) * 0.36;
        if (el) {
          el.style.transform = `translate3d(${node.x}px, ${node.y}px, 0) translate(-50%, -50%)`;
        }
        prevX = node.x;
        prevY = node.y;
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Trail ghost nodes
  const trailConfigs = [
    { size: 4.5, baseOpacity: 0.55 },
    { size: 3.8, baseOpacity: 0.38 },
    { size: 3.2, baseOpacity: 0.24 },
    { size: 2.6, baseOpacity: 0.13 },
    { size: 2.0, baseOpacity: 0.07 },
    { size: 1.5, baseOpacity: 0.035 },
  ];

  return (
    <>
      {/* Footprint ghost trail */}
      {trailConfigs.map((cfg, idx) => (
        <div
          key={idx}
          ref={(el) => (trailRefs.current[idx] = el)}
          className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999997]"
          style={{
            width: `${cfg.size}px`,
            height: `${cfg.size}px`,
            backgroundColor: '#E31B2E',
            opacity: 0,
            willChange: 'transform',
            boxShadow: `0 0 ${cfg.size * 2}px rgba(227, 27, 46, ${cfg.baseOpacity})`,
          }}
        />
      ))}

      {/* Clean hairline follower ring — completely transparent, zero glass, zero blur */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999999]"
        style={{
          width: '30px',
          height: '30px',
          opacity: 0,
          willChange: 'transform, border-color',
          border: '1px solid rgba(227, 27, 46, 0.4)',
          background: 'transparent',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          boxShadow: 'none',
        }}
      />

      {/* Precision red core dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999999]"
        style={{
          width: '5px',
          height: '5px',
          backgroundColor: '#E31B2E',
          opacity: 0,
          willChange: 'transform',
          boxShadow: '0 0 6px #E31B2E, 0 0 12px rgba(227,27,46,0.8)',
        }}
      />
    </>
  );
}
