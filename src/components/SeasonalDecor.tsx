import { useTheme } from "../lib/ThemeContext";

/**
 * Site-wide decorative overlay for seasonal themes.
 * Pure CSS/SVG — respects prefers-reduced-motion via CSS.
 */
export default function SeasonalDecor() {
  const { theme, content } = useTheme();
  if (!theme.decor || !content.animationsEnabled) return null;

  if (theme.decor === "ramadan") return <RamadanNights />;
  if (theme.decor === "ramadan2") return <RamadanSerenity />;
  if (theme.decor === "eid-fitr") return <EidFitr />;
  if (theme.decor === "eid-adha") return <EidAdha />;
  if (theme.decor === "parallax-art") return <ParallaxArt />;
  return null;
}

/* ---------- Shared SVG pieces ---------- */

function Lantern({ x, delay, scale = 1, hue = "#f2b545" }: { x: string; delay: number; scale?: number; hue?: string }) {
  return (
    <div className="decor-lantern" style={{ insetInlineStart: x, animationDelay: `${delay}s`, transform: `scale(${scale})` }}>
      <svg viewBox="0 0 40 78" width={40 * scale} height={78 * scale} aria-hidden>
        <line x1="20" y1="0" x2="20" y2="12" stroke={hue} strokeWidth="1.6" opacity="0.7" />
        <ellipse cx="20" cy="14" rx="5" ry="3" fill={hue} opacity="0.9" />
        <path d="M8 26 Q20 14 32 26 L34 48 Q20 60 6 48 Z" fill={hue} opacity="0.24" stroke={hue} strokeWidth="1.4" />
        <path d="M13 27 L13 50 M20 24 L20 53 M27 27 L27 50" stroke={hue} strokeWidth="1" opacity="0.55" />
        <ellipse cx="20" cy="52" rx="7" ry="3" fill={hue} opacity="0.85" />
        <line x1="20" y1="55" x2="20" y2="63" stroke={hue} strokeWidth="1.4" opacity="0.7" />
        <circle cx="20" cy="66" r="2.6" fill={hue} opacity="0.95" />
        <circle cx="20" cy="40" r="14" fill={hue} opacity="0.08" />
      </svg>
    </div>
  );
}

function Crescent({ size = 90, color = "#f2b545", className = "" }: { size?: number; color?: string; className?: string }) {
  return (
    <svg className={`decor-crescent ${className}`} viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <path d="M62 8 A 44 44 0 1 0 62 92 A 36 36 0 1 1 62 8 Z" fill={color} opacity="0.85" />
      <circle cx="70" cy="26" r="2.4" fill={color} opacity="0.9" />
      <circle cx="80" cy="44" r="1.7" fill={color} opacity="0.7" />
    </svg>
  );
}

function Stars({ count = 26, color = "#ffffff" }: { count?: number; color?: string }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    left: `${(i * 37 + 13) % 100}%`,
    top: `${(i * 53 + 7) % 60}%`,
    d: (i % 5) * 0.9,
    s: 1.4 + (i % 3),
  }));
  return (
    <div className="decor-stars" aria-hidden>
      {stars.map((s, i) => (
        <span key={i} style={{ left: s.left, top: s.top, width: s.s, height: s.s, background: color, animationDelay: `${s.d}s` }} />
      ))}
    </div>
  );
}

/* ---------- Ramadan Nights: hanging lanterns + crescent + stars ---------- */
function RamadanNights() {
  return (
    <div className="seasonal-decor" aria-hidden>
      <Stars count={30} color="#e8d9a8" />
      <Crescent size={110} color="#f2b545" className="pos-crescent" />
      <div className="decor-lantern-row">
        <Lantern x="6%" delay={0} scale={0.85} />
        <Lantern x="18%" delay={1.1} scale={0.6} />
        <Lantern x="78%" delay={0.5} scale={0.75} />
        <Lantern x="90%" delay={1.6} scale={0.95} />
      </div>
      <div className="decor-arch-pattern ramadan" />
    </div>
  );
}

/* ---------- Ramadan Serenity: mosque silhouette + gentle lanterns ---------- */
function RamadanSerenity() {
  return (
    <div className="seasonal-decor" aria-hidden>
      <Stars count={20} color="#cfe3c9" />
      <Crescent size={80} color="#e3c26b" className="pos-crescent alt" />
      <div className="decor-lantern-row">
        <Lantern x="10%" delay={0.4} scale={0.7} hue="#e3c26b" />
        <Lantern x="86%" delay={1.2} scale={0.8} hue="#e3c26b" />
      </div>
      <svg className="decor-mosque" viewBox="0 0 600 120" preserveAspectRatio="xMidYMax slice" aria-hidden>
        <g fill="currentColor" opacity="0.1">
          <rect x="70" y="60" width="10" height="60" />
          <circle cx="75" cy="56" r="7" />
          <path d="M230 120 L230 70 Q300 10 370 70 L370 120 Z" />
          <circle cx="300" cy="42" r="5" />
          <rect x="300" y="20" width="2" height="20" />
          <rect x="520" y="60" width="10" height="60" />
          <circle cx="525" cy="56" r="7" />
          <rect x="0" y="100" width="600" height="20" />
        </g>
      </svg>
    </div>
  );
}

/* ---------- Eid Al-Fitr: festive garlands + balloons ---------- */
function EidFitr() {
  const balloons = [
    { x: "4%", d: 0, c: "#178a4c" }, { x: "12%", d: 2.2, c: "#d4a84b" },
    { x: "85%", d: 1, c: "#178a4c" }, { x: "93%", d: 3, c: "#c26d5c" },
  ];
  return (
    <div className="seasonal-decor" aria-hidden>
      <div className="decor-garland">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="garland-flag" style={{ background: i % 3 === 0 ? "#178a4c" : i % 3 === 1 ? "#d4a84b" : "#c26d5c", animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
      {balloons.map((b, i) => (
        <svg key={i} className="decor-balloon" style={{ insetInlineStart: b.x, animationDelay: `${b.d}s` }} viewBox="0 0 30 48" width="30" height="48">
          <ellipse cx="15" cy="14" rx="11" ry="13" fill={b.c} opacity="0.75" />
          <path d="M15 27 Q13 30 15 33 Q17 36 15 40" stroke={b.c} strokeWidth="1.2" fill="none" opacity="0.6" />
        </svg>
      ))}
      <div className="decor-eid-text">عيد فطر مبارك</div>
    </div>
  );
}

/* ---------- Eid Al-Adha: geometric ornaments ---------- */
function EidAdha() {
  return (
    <div className="seasonal-decor" aria-hidden>
      <Stars count={16} color="#e0a94e" />
      <div className="decor-geo-row">
        {Array.from({ length: 6 }, (_, i) => (
          <svg key={i} className="decor-geo" style={{ animationDelay: `${i * 0.4}s` }} viewBox="0 0 40 40" width="34" height="34">
            <g stroke="#e0a94e" strokeWidth="1.3" fill="none" opacity="0.75">
              <path d="M20 2 L38 20 L20 38 L2 20 Z" />
              <path d="M20 9 L31 20 L20 31 L9 20 Z" />
              <circle cx="20" cy="20" r="4" />
            </g>
          </svg>
        ))}
      </div>
      <Crescent size={72} color="#e0a94e" className="pos-crescent" />
      <div className="decor-eid-text adha">عيد أضحى مبارك</div>
    </div>
  );
}

/* ---------- Artistic Horizon: floating gradient orbs (paired with parallax scroll) ---------- */
function ParallaxArt() {
  return (
    <div className="seasonal-decor" aria-hidden>
      <div className="art-orb o1" />
      <div className="art-orb o2" />
      <div className="art-orb o3" />
      <div className="art-grain" />
    </div>
  );
}
