// @section: page-interactions

/* ── Theme Toggle ── */
const themeBtn = document.getElementById('theme-btn');
const body = document.body;
try {
  const saved = localStorage.getItem('hs-theme');
  if (saved === 'light') body.classList.add('light');
} catch(e) {}

function updateThemeBtn() {
  if (!themeBtn) return;
  const isLight = body.classList.contains('light');
  themeBtn.textContent = isLight ? '🌙' : '☀️';
}
themeBtn && themeBtn.addEventListener('click', () => {
  body.classList.toggle('light');
  try { localStorage.setItem('hs-theme', body.classList.contains('light') ? 'light' : 'dark'); } catch(e){}
  updateThemeBtn();
});
updateThemeBtn();

/* ── Language Toggle ── */
const langBtn = document.getElementById('lang-btn');
let currentLang = 'ar';
try { currentLang = localStorage.getItem('hs-lang') || 'ar'; } catch(e){}

function applyLang(lang) {
  currentLang = lang;
  try { localStorage.setItem('hs-lang', lang); } catch(e){}
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  if (langBtn) langBtn.textContent = lang === 'ar' ? 'EN' : 'عربي';
  document.querySelectorAll('[data-ar]').forEach(el => {
    el.textContent = lang === 'ar' ? el.dataset.ar : el.dataset.en;
  });
  document.querySelectorAll('[data-ar-html]').forEach(el => {
    el.innerHTML = lang === 'ar' ? el.dataset.arHtml : el.dataset.enHtml;
  });
}

applyLang(currentLang);
langBtn && langBtn.addEventListener('click', () => applyLang(currentLang === 'ar' ? 'en' : 'ar'));

/* ── Navbar Scroll ── */
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav && nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });
nav && nav.classList.toggle('scrolled', window.scrollY > 40);

/* ── Burger Menu ── */
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('mobile-nav');
burger && burger.addEventListener('click', () => {
  mobileNav && mobileNav.classList.toggle('open');
});
mobileNav && mobileNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileNav.classList.remove('open'));
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    mobileNav && mobileNav.classList.remove('open');
  });
});

/* ── Hero Slideshow ── */
(function initSlideshow() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  if (!slides.length) return;
  let current = 0, timer;

  function goTo(n) {
    slides[current].classList.remove('active');
    dots[current] && dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current] && dots[current].classList.add('active');
  }
  function start() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); start(); }));
  
  // Ensure first slide is visible, then start
  if (!slides[0].classList.contains('active')) {
    slides[0].classList.add('active');
    dots[0] && dots[0].classList.add('active');
  }
  start();
})();

/* ── Stat Counter Animation (runs on load, no intersection) ── */
function animateCount(el) {
  if (el.dataset.animated) return;
  el.dataset.animated = '1';
  const target   = parseFloat(el.dataset.count);
  const suffix   = el.dataset.suffix || '';
  const decimal  = el.dataset.decimal === '1';
  const duration = 1600;
  const start    = performance.now();

  function frame(now) {
    const p    = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const val  = target * ease;
    el.textContent = (decimal ? val.toFixed(1) : Math.round(val)) + suffix;
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = (decimal ? target.toFixed(1) : target) + suffix; // ensure exact final value
  }
  requestAnimationFrame(frame);
}

// Run counters after a short delay so page has rendered
setTimeout(() => {
  document.querySelectorAll('[data-count]').forEach(animateCount);
}, 400);
