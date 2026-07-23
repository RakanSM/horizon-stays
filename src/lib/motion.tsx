import { useEffect, useRef, ReactNode, CSSProperties } from "react";
import { useTheme } from "./ThemeContext";

/** Global IntersectionObserver-based scroll reveal. Elements with .reveal get .revealed when visible. */
export function useScrollReveal(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("revealed"));
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("revealed"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    const scan = () => document.querySelectorAll(".reveal:not(.revealed)").forEach((el) => io.observe(el));
    scan();
    // Re-scan when DOM changes (new cards loaded)
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [enabled]);
}

/** Wrapper that adds reveal classes with optional stagger delay. */
export function Reveal({
  children, delay = 0, className = "", as: Tag = "div", style,
}: {
  children: ReactNode; delay?: number; className?: string; as?: any; style?: CSSProperties;
}) {
  return (
    <Tag className={`reveal ${className}`} style={{ ...style, transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

/** Parallax hero background: subtle translateY on scroll. */
export function useParallax(ref: React.RefObject<HTMLElement | null>, speed = 0.35) {
  const { content } = useTheme();
  useEffect(() => {
    if (!content.animationsEnabled) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (ref.current) {
          const y = window.scrollY;
          ref.current.style.transform = `translateY(${y * speed}px)`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref, speed, content.animationsEnabled]);
}

/** Animated counter that counts up when visible. */
export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.textContent = `${to}${suffix}`;
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          io.disconnect();
          const dur = 1200;
          const t0 = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = `${Math.round(to * eased)}${suffix}`;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}
