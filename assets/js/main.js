// International Autism Foundation — interactions & animations

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initMobileMenu();
  initReveal();
  initSplitText();
  initCounters();
  initGallery();
  initYear();
  initActiveNav();
  initCursor();
  initSensory();
  initJourney();
  initTimeline();
  initTilt();
  initInkDraw();
  initAccordion();
  initPledgeWall();
  initPreload();
});

/* ---------- Sticky nav background on scroll ---------- */
function initNav() {
  const nav = document.querySelector(".nav-root");
  if (!nav) return;
  const toggle = () => {
    if (window.scrollY > 30) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const btnOpen = document.querySelector("[data-menu-open]");
  const btnClose = document.querySelector("[data-menu-close]");
  const menu = document.querySelector(".mobile-menu");
  if (!btnOpen || !menu) return;

  const open = () => {
    menu.classList.add("open");
    document.body.classList.add("lock");
  };
  const close = () => {
    menu.classList.remove("open");
    document.body.classList.remove("lock");
  };
  btnOpen.addEventListener("click", open);
  if (btnClose) btnClose.addEventListener("click", close);
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
}

/* ---------- Reveal-on-scroll via IntersectionObserver + safety net ---------- */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
  );
  els.forEach((el) => io.observe(el));

  // Safety: if a reveal still hasn't triggered after 1.2s of being stored in
  // the observer (e.g. headless screenshot, reduced-motion, or print),
  // force it visible so no section is ever blank.
  setTimeout(() => {
    els.forEach((el) => el.classList.add("in"));
  }, 1200);
}

/* ---------- Split-text reveal: split by WORD (atomic), animate each char ---------- */
function initSplitText() {
  const nodes = document.querySelectorAll("[data-split]");
  if (!nodes.length) return;

  nodes.forEach((node) => {
    const text = node.textContent.trim();
    node.textContent = "";
    const words = text.split(/\s+/);
    let charIndex = 0;
    words.forEach((word, wi) => {
      const wSpan = document.createElement("span");
      wSpan.className = "split-word";
      [...word].forEach((ch) => {
        const cSpan = document.createElement("span");
        cSpan.className = "split-char";
        cSpan.style.transitionDelay = `${charIndex * 16}ms`;
        cSpan.textContent = ch;
        wSpan.appendChild(cSpan);
        charIndex++;
      });
      node.appendChild(wSpan);
      if (wi < words.length - 1) {
        node.appendChild(document.createTextNode(" "));
      }
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.querySelectorAll(".split-char").forEach((c) => c.classList.add("in"));
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  nodes.forEach((n) => io.observe(n));

  // Safety: force any still-hidden chars visible after 1.5s
  setTimeout(() => {
    document.querySelectorAll(".split-char:not(.in)").forEach((c) => c.classList.add("in"));
  }, 1500);
}

/* ---------- Animated counters with [data-count] ---------- */
function initCounters() {
  const els = document.querySelectorAll("[data-count]");
  if (!els.length) return;

  const run = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1600;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * ease(p)).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          run(e.target);
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  els.forEach((el) => io.observe(el));
}

/* ---------- Lightbox gallery ---------- */
function initGallery() {
  const items = document.querySelectorAll(".gal-item");
  const lightbox = document.querySelector(".lightbox");
  if (!items.length || !lightbox) return;

  const img = lightbox.querySelector("img");
  const close = () => lightbox.classList.remove("open");

  items.forEach((it) => {
    it.addEventListener("click", () => {
      const src = it.querySelector("img").src;
      const alt = it.querySelector("img").alt;
      img.src = src;
      img.alt = alt;
      lightbox.classList.add("open");
    });
  });
  lightbox.querySelector(".lightbox-close").addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/* ---------- Current year in footer ---------- */
function initYear() {
  document.querySelectorAll("[data-now-year]").forEach((y) => {
    y.textContent = new Date().getFullYear();
  });
}

/* ---------- Mark the active nav link by filename ---------- */
function initActiveNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path) a.classList.add("active");
    if (path === "" && href === "index.html") a.classList.add("active");
  });
}

/* ---------- Custom cursor follower ---------- */
function initCursor() {
  if (window.matchMedia("(hover: none)").matches) return;
  const dot = document.createElement("div");
  const ring = document.createElement("div");
  dot.className = "cursor-dot";
  ring.className = "cursor-ring";
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.body.classList.add("cursor-on");

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });

  const tick = () => {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  };
  tick();

  const hoverSel = "a, button, .btn, [data-cursor='hover'], .gal-item, .acc-btn, .card, .tg, .map-pin, .voice-card";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverSel)) document.body.classList.add("cursor-hover");
    if (e.target.closest("input, textarea")) document.body.classList.add("cursor-text");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverSel)) document.body.classList.remove("cursor-hover");
    if (e.target.closest("input, textarea")) document.body.classList.remove("cursor-text");
  });
}

/* ---------- Sensory / accessibility panel ---------- */
function initSensory() {
  const trigger = document.querySelector(".sensory-trigger");
  const panel = document.querySelector(".sensory-panel");
  if (!trigger || !panel) return;

  trigger.addEventListener("click", () => panel.classList.toggle("open"));
  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && !trigger.contains(e.target)) {
      panel.classList.remove("open");
    }
  });

  // Toggles
  const toggles = [
    { key: "calm-mode", cls: "calm-mode" },
    { key: "reduce-motion", cls: "reduce-motion" },
    { key: "high-contrast", cls: "high-contrast" },
    { key: "dyslexia-font", cls: "dyslexia-font" },
  ];
  toggles.forEach((t) => {
    const el = panel.querySelector(`[data-tg="${t.key}"]`);
    if (!el) return;
    if (localStorage.getItem(t.key) === "1") {
      el.classList.add("on");
      document.body.classList.add(t.cls);
    }
    el.addEventListener("click", () => {
      el.classList.toggle("on");
      const on = el.classList.contains("on");
      document.body.classList.toggle(t.cls, on);
      localStorage.setItem(t.key, on ? "1" : "0");
    });
  });
}

/* ---------- Journey scroll story: mark active step + scroll-driven rail ---------- */
function initJourney() {
  const steps = document.querySelectorAll(".journey-step");
  if (!steps.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("on");
      });
    },
    { threshold: 0.45 }
  );
  steps.forEach((s) => io.observe(s));

  /* ---- Scroll-driven rail (path draw + moving dot + year markers) ---- */
  const journeyWrap = document.querySelector("[data-journey]");
  const progressPath = document.querySelector("#journey-progress");
  const dot = document.querySelector("#journey-dot");
  const markers = document.querySelectorAll(".year-markers .ym");
  const tags = document.querySelectorAll(".year-tags span");
  if (!journeyWrap || !progressPath || !dot) return;

  // Initialise stroke dash based on real path length.
  const total = progressPath.getTotalLength();
  progressPath.style.strokeDasharray = total;
  progressPath.style.strokeDashoffset = total;

  let ticking = false;
  const update = () => {
    ticking = false;
    const rect = journeyWrap.getBoundingClientRect();
    const vh = window.innerHeight;

    // progress: 0 when section's top hits viewport bottom,
    //           1 when section's bottom hits viewport top.
    const raw = (vh - rect.top) / (rect.height + vh);
    const p = Math.max(0, Math.min(1, raw));

    // Path draw
    progressPath.style.strokeDashoffset = total * (1 - p);

    // Moving dot — use actual path geometry for a perfect follow
    const point = progressPath.getPointAtLength(total * p);
    dot.setAttribute("transform", `translate(${point.x}, ${point.y})`);

    // Markers & year tags
    markers.forEach((m, i) => {
      const threshold = parseFloat(m.dataset.p);
      m.classList.toggle("past", p >= threshold - 0.01);
    });
    tags.forEach((t, i) => {
      const threshold = parseFloat(markers[i]?.dataset.p || "1");
      const next = parseFloat(markers[i + 1]?.dataset.p ?? "1.5");
      t.classList.toggle("active", p >= threshold - 0.01 && p < next - 0.01);
    });
  };
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/* ---------- Timeline: progressive line + per-item reveal ---------- */
function initTimeline() {
  const track = document.querySelector("[data-timeline]");
  if (!track) return;
  const items = track.querySelectorAll(".timeline-item");
  if (!items.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
  );
  items.forEach((el) => io.observe(el));

  // Scroll-driven gold line fill
  let ticking = false;
  const update = () => {
    ticking = false;
    const rect = track.getBoundingClientRect();
    const vh = window.innerHeight;
    // Progress 0 when track top hits ~70% of viewport,
    //          1 when track bottom leaves top ~30%.
    const raw = (vh * 0.7 - rect.top) / (rect.height - vh * 0.4);
    const p = Math.max(0, Math.min(1, raw));
    track.style.setProperty("--progress", p.toFixed(3));
  };
  const onScroll = () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/* ---------- 3D tilt on .tilt cards ---------- */
function initTilt() {
  if (window.matchMedia("(hover: none)").matches) return;
  document.querySelectorAll(".tilt").forEach((card) => {
    const inner = card.querySelector(".tilt-inner") || card;
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const rotY = x * 10;
      const rotX = -y * 10;
      inner.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(20px)`;
    });
    card.addEventListener("mouseleave", () => {
      inner.style.transform = `perspective(1200px) rotateX(0) rotateY(0) translateZ(0)`;
    });
  });
}

/* ---------- Ink draw reveal for SVG paths ---------- */
function initInkDraw() {
  const nodes = document.querySelectorAll(".ink-draw");
  if (!nodes.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  nodes.forEach((n) => io.observe(n));
}

/* ---------- Accordion ---------- */
function initAccordion() {
  document.querySelectorAll(".acc-item").forEach((item) => {
    const btn = item.querySelector(".acc-btn");
    if (!btn) return;
    btn.addEventListener("click", () => item.classList.toggle("open"));
  });
}

/* ---------- Pledge wall (localStorage demo) ---------- */
function initPledgeWall() {
  const form = document.querySelector("[data-pledge-form]");
  const wall = document.querySelector("[data-pledge-wall]");
  if (!form || !wall) return;

  const load = () => {
    try { return JSON.parse(localStorage.getItem("iaf_pledges") || "[]"); }
    catch { return []; }
  };
  const save = (list) => localStorage.setItem("iaf_pledges", JSON.stringify(list));
  const render = () => {
    const list = load();
    const cards = list
      .slice()
      .reverse()
      .map(
        (p) => `
        <div class="pledge-card">
          <p>"${escapeHtml(p.msg)}"</p>
          <div class="author">— ${escapeHtml(p.name)}${p.city ? ", " + escapeHtml(p.city) : ""}</div>
        </div>`
      )
      .join("");
    wall.innerHTML = cards || `<div class="pledge-card"><p>"Be the first to leave a blessing for our Divine Children."</p><div class="author">— The Foundation</div></div>`;
  };
  render();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const msg = (data.get("msg") || "").toString().trim();
    const name = (data.get("name") || "").toString().trim() || "A Friend";
    const city = (data.get("city") || "").toString().trim();
    if (!msg) return;
    const list = load();
    list.push({ msg, name, city, at: Date.now() });
    save(list);
    form.reset();
    render();
  });
}
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- Hide preload overlay once loaded ---------- */
function initPreload() {
  const p = document.querySelector(".preload");
  if (!p) return;
  requestAnimationFrame(() => {
    p.classList.add("done");
    setTimeout(() => p.remove(), 1200);
  });
}
