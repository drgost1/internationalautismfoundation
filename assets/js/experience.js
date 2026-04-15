/* Experience page — GSAP-driven cinematic scroll. */

(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- Cover reveal ----- */
  const cover = document.querySelector(".cover");
  const coverBg = document.querySelector(".cover-bg");
  if (cover && coverBg) {
    requestAnimationFrame(() => {
      coverBg.classList.add("in");
      setTimeout(() => cover.classList.add("ready"), 250);
    });
  }

  /* ----- Top progress bar ----- */
  const prog = document.querySelector(".cine-progress");
  if (prog) {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      prog.style.transform = `scaleX(${p})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  if (reduceMotion) return;
  if (typeof gsap === "undefined") {
    console.warn("GSAP not loaded — falling back to static.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ----- Lenis smooth scroll ----- */
  let lenis = null;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    lenis.on("scroll", ScrollTrigger.update);
  }

  /* ----- Pinned manifesto verses ----- */
  const pinSection = document.querySelector(".pin-section");
  const verses = pinSection ? pinSection.querySelectorAll(".verse") : [];
  if (pinSection && verses.length) {
    const setIndex = (i) => {
      verses.forEach((v, idx) => v.classList.toggle("active", idx === i));
    };
    setIndex(0);
    ScrollTrigger.create({
      trigger: pinSection,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const i = Math.min(verses.length - 1, Math.floor(self.progress * verses.length));
        setIndex(i);
      },
    });
    // Subtle bg zoom
    const bgImg = pinSection.querySelector(".bg-img img");
    if (bgImg) {
      gsap.fromTo(bgImg, { scale: 1.05 }, {
        scale: 1.18,
        ease: "none",
        scrollTrigger: { trigger: pinSection, start: "top top", end: "bottom bottom", scrub: true },
      });
    }
  }

  /* ----- Horizontal scroll reels ----- */
  document.querySelectorAll(".h-scroll-section").forEach((section) => {
    const track = section.querySelector(".h-scroll-track");
    const slides = track.querySelectorAll(".h-slide");
    if (!slides.length) return;

    gsap.to(track, {
      x: () => -((slides.length - 1) * window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${(slides.length - 1) * window.innerWidth}`,
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  });

  /* ----- Portrait strip horizontal pin ----- */
  const stripSection = document.querySelector(".portrait-strip");
  if (stripSection) {
    const track = stripSection.querySelector(".portrait-track");
    const cards = track.querySelectorAll(".portrait-card");
    const trackWidth = [...cards].reduce((sum, c) => sum + c.offsetWidth, 0)
                     + (cards.length - 1) * (parseFloat(getComputedStyle(track).gap) || 0)
                     + 2 * (parseFloat(getComputedStyle(track).paddingInline) || 0);
    const distance = Math.max(0, trackWidth - window.innerWidth);

    gsap.to(track, {
      x: () => -distance,
      ease: "none",
      scrollTrigger: {
        trigger: stripSection,
        start: "top top",
        end: () => `+=${distance}`,
        scrub: 0.5,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  }

  /* ----- Parallax sections ----- */
  document.querySelectorAll(".parallax-section").forEach((sec) => {
    const bgImg = sec.querySelector(".parallax-bg img");
    if (!bgImg) return;
    gsap.fromTo(bgImg, { yPercent: -10 }, {
      yPercent: 10, ease: "none",
      scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true },
    });
    sec.querySelectorAll("[data-fade]").forEach((el, i) => {
      gsap.from(el, {
        y: 60, opacity: 0, duration: 1, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 80%" },
        delay: i * 0.08,
      });
    });
  });

  /* ----- Grid Build ----- */
  const gridSection = document.querySelector(".grid-build");
  if (gridSection) {
    const tiles = gridSection.querySelectorAll(".grid-tile");
    const stage = gridSection.querySelector(".grid-stage");
    const wrap = gridSection.querySelector(".grid-wrap");
    const intro = gridSection.querySelector(".grid-text.intro");
    const outro = gridSection.querySelector(".grid-text.outro");

    // Set initial scattered positions
    const targets = [];
    tiles.forEach((tile, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      // grid layout target (3 cols × 2 rows)
      const tx = col * (100 / 3) + (100 / 6) - (24 / 2); // centred at column
      const ty = row * 50 + 25 - (24 * (4 / 3) / 2);     // tile aspect 1, but rendered 24% width
      targets.push({ left: `${tx}%`, top: `${ty}%` });

      // initial random scatter
      const sx = Math.random() * 80 + 5;
      const sy = Math.random() * 80 + 5;
      const rot = (Math.random() - 0.5) * 60;
      tile.style.left = `${sx}%`;
      tile.style.top = `${sy}%`;
      tile.style.transform = `rotate(${rot}deg) scale(0.7)`;
      tile.style.opacity = 0;
    });

    ScrollTrigger.create({
      trigger: gridSection,
      start: "top top",
      end: "bottom bottom",
      pin: stage,
      onUpdate: (self) => {
        const p = self.progress;
        // 0 -> 0.45 : tiles fly into grid
        // 0.45 -> 0.7 : intro text fades
        // 0.7 -> 1.0 : outro text fades
        tiles.forEach((tile, i) => {
          const start = i * 0.04;
          const localP = Math.max(0, Math.min(1, (p - start) / 0.45));
          const target = targets[i];
          const startLeft = parseFloat(tile.dataset.startLeft || tile.style.left);
          if (!tile.dataset.startLeft) {
            tile.dataset.startLeft = tile.style.left;
            tile.dataset.startTop = tile.style.top;
            tile.dataset.startRot = (Math.random() - 0.5) * 60;
          }
          const sl = parseFloat(tile.dataset.startLeft);
          const st = parseFloat(tile.dataset.startTop);
          const tl = parseFloat(target.left);
          const tt = parseFloat(target.top);
          const cl = sl + (tl - sl) * localP;
          const ct = st + (tt - st) * localP;
          const rot = parseFloat(tile.dataset.startRot) * (1 - localP);
          const scale = 0.7 + (1 - 0.7) * localP;
          tile.style.left = `${cl}%`;
          tile.style.top = `${ct}%`;
          tile.style.transform = `rotate(${rot}deg) scale(${scale})`;
          tile.style.opacity = localP;
        });
        if (intro) intro.style.opacity = Math.max(0, 1 - Math.max(0, (p - 0.45) / 0.2));
        if (outro) outro.style.opacity = Math.min(1, Math.max(0, (p - 0.6) / 0.25));
      },
    });
  }

  /* ----- Bleed section text reveal ----- */
  document.querySelectorAll(".bleed-section").forEach((sec) => {
    const stage = sec.querySelector(".bleed-stage");
    ScrollTrigger.create({
      trigger: sec,
      start: "top top",
      end: "bottom bottom",
      pin: stage,
    });
    const bgImg = sec.querySelector(".bleed-bg img");
    if (bgImg) {
      gsap.fromTo(bgImg, { scale: 1.12 }, {
        scale: 1.0, ease: "none",
        scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: true },
      });
    }
    const text = sec.querySelector(".bleed-text");
    if (text) {
      gsap.from(text.children, {
        y: 50, opacity: 0, duration: 1.4, ease: "power3.out", stagger: 0.18,
        scrollTrigger: { trigger: sec, start: "top 60%" },
      });
    }
  });

  /* ----- Finale ----- */
  const finale = document.querySelector(".finale");
  if (finale) {
    const fImg = finale.querySelector(".finale-image");
    const fText = finale.querySelector(".finale-text");
    ScrollTrigger.create({
      trigger: finale, start: "top 70%",
      onEnter: () => { fImg?.classList.add("in"); fText?.classList.add("in"); },
    });
  }
})();
