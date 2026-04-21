/* Publications page — CMS-driven content + PDF flipbook reader */

(function () {
  /* ---------- CMS content injection ---------- */
  const page = document.querySelector("[data-cms-page]");
  if (page) {
    const slug = page.getAttribute("data-cms-page");
    fetch(`admin/data/${slug}.json?ts=${Date.now()}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) applyCms(data); })
      .catch(() => { /* keep hardcoded fallback */ });
  }

  function applyCms(data) {
    document.querySelectorAll("[data-cms]").forEach((el) => {
      const key = el.getAttribute("data-cms");
      const val = getByPath(data, key);
      if (val == null || val === "") return;
      if (el.tagName === "IMG") {
        el.setAttribute("src", val);
      } else {
        // Preserve inline HTML — allow italic-accent spans etc.
        el.innerHTML = val;
      }
    });

    // Render any custom blocks the owner added in the CMS
    if (Array.isArray(data.blocks) && data.blocks.length) renderBlocks(data.blocks);
  }

  function renderBlocks(blocks) {
    const slot = document.querySelector("[data-blocks-slot]");
    if (!slot) return;
    blocks.forEach((b, i) => slot.appendChild(buildBlock(b, i)));
    // Re-run the site's reveal observer on fresh nodes
    if (typeof IntersectionObserver !== "undefined") {
      const io = new IntersectionObserver((ents) => {
        ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
      }, { threshold: 0.08, rootMargin: "0px 0px -5% 0px" });
      slot.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    }
  }

  function buildBlock(b, i) {
    const section = document.createElement("section");
    section.className = "section-pad";
    if (i % 2 === 1) section.style.background = "var(--color-paper-warm)";

    const container = document.createElement("div");
    container.className = "container-x";
    section.appendChild(container);

    if (b.layout === "text-only" || !b.image) {
      container.innerHTML = `
        <div class="max-w-3xl mx-auto text-center reveal">
          ${b.eyebrow ? `<p class="eyebrow">${b.eyebrow}</p>` : ""}
          <h2 class="font-serif t-1 mt-5 text-balance">${b.title || ""}</h2>
          <div class="editorial mt-8 text-left">${b.body || ""}</div>
        </div>`;
      return section;
    }

    const grid = document.createElement("div");
    grid.className = "grid lg:grid-cols-12 gap-10 lg:gap-20 items-center";
    container.appendChild(grid);

    const imgCol = document.createElement("div");
    imgCol.className = "lg:col-span-5 reveal";
    imgCol.innerHTML = `<div class="rounded-3xl overflow-hidden aspect-[4/5] shine"><img src="${b.image}" alt="" class="w-full h-full object-cover"/></div>`;

    const textCol = document.createElement("div");
    textCol.className = "lg:col-span-7";
    textCol.innerHTML = `
      ${b.eyebrow ? `<p class="eyebrow">${b.eyebrow}</p>` : ""}
      <h2 class="font-serif t-1 mt-5 text-balance">${b.title || ""}</h2>
      <div class="mt-6 text-lg text-[color:var(--color-muted)] max-w-prose-lg editorial">${b.body || ""}</div>`;

    if (b.layout === "text-right") {
      textCol.classList.add("order-1", "lg:order-1");
      imgCol.classList.add("order-2", "lg:order-2");
      grid.append(textCol, imgCol);
    } else {
      grid.append(imgCol, textCol);
    }
    return section;
  }
  function getByPath(obj, path) {
    return path.split(".").reduce((a, k) => (a == null ? a : a[k]), obj);
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-now-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Journal flipbook reader ---------- */
  const reader      = document.querySelector("[data-journal-reader]");
  const openBtn     = document.querySelector("[data-open-journal]");
  const closeBtn    = document.querySelector("[data-jr-close]");
  const prevBtn     = document.querySelector("[data-jr-prev]");
  const nextBtn     = document.querySelector("[data-jr-next]");
  const currentEl   = document.querySelector("[data-jr-current]");
  const totalEl     = document.querySelector("[data-jr-total]");
  const loadingEl   = document.querySelector("[data-jr-loading]");
  const progressEl  = document.querySelector("[data-jr-progress]");
  const stageEl     = document.getElementById("journal-flipbook");

  if (!reader || !openBtn || !stageEl) return;

  let flipbook = null;
  let built = false;
  const PDF_URL = "assets/pdf/iaf-journal.pdf";

  openBtn.addEventListener("click", () => openReader());
  closeBtn.addEventListener("click", () => closeReader());

  document.addEventListener("keydown", (e) => {
    if (!reader.classList.contains("open")) return;
    if (e.key === "Escape") closeReader();
    else if (e.key === "ArrowRight") flipbook?.flipNext();
    else if (e.key === "ArrowLeft") flipbook?.flipPrev();
  });
  prevBtn.addEventListener("click", () => flipbook?.flipPrev());
  nextBtn.addEventListener("click", () => flipbook?.flipNext());

  async function openReader() {
    reader.classList.add("open");
    reader.setAttribute("aria-hidden", "false");
    document.body.classList.add("journal-open");
    if (!built) await buildFlipbook();
  }
  function closeReader() {
    reader.classList.remove("open");
    reader.setAttribute("aria-hidden", "true");
    document.body.classList.remove("journal-open");
  }

  async function buildFlipbook() {
    built = true;
    if (!window.pdfjsLib) {
      loadingEl.innerHTML = "<p>Reader could not load. <a href='" + PDF_URL + "' download style='color:var(--color-gold);text-decoration:underline'>Download PDF</a> instead.</p>";
      return;
    }
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    try {
      const pdf = await window.pdfjsLib.getDocument(PDF_URL).promise;
      const totalPages = pdf.numPages;
      totalEl.textContent = totalPages;

      const images = [];
      for (let i = 1; i <= totalPages; i++) {
        progressEl.textContent = `Page ${i} / ${totalPages}`;
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.6 });
        const canvas = document.createElement("canvas");
        canvas.width  = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
        images.push(canvas.toDataURL("image/jpeg", 0.85));
      }

      // Build page DOM
      stageEl.innerHTML = "";
      images.forEach((src) => {
        const pageDiv = document.createElement("div");
        pageDiv.className = "page";
        const img = document.createElement("img");
        img.src = src;
        img.alt = "";
        pageDiv.appendChild(img);
        stageEl.appendChild(pageDiv);
      });

      // Compute display size — fit 80vh, aspect 2:3 per spread
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const maxH = Math.max(400, Math.floor(vh * 0.78));
      const maxW = Math.max(320, Math.floor(vw * 0.9));
      const aspect = images[0] ? await getAspect(images[0]) : 0.7;
      let h = maxH;
      let w = Math.round(h * aspect * 2); // spread = 2 pages
      if (w > maxW) { w = maxW; h = Math.round(w / (aspect * 2)); }

      // Initialize PageFlip
      if (typeof window.St?.PageFlip !== "function" && typeof window.PageFlip !== "function") {
        loadingEl.innerHTML = "<p>Flipbook library unavailable.</p>";
        return;
      }
      const PageFlip = window.St?.PageFlip || window.PageFlip;
      flipbook = new PageFlip(stageEl, {
        width: Math.floor(w / 2),
        height: h,
        size: "stretch",
        minWidth: 260,
        maxWidth: 900,
        minHeight: 400,
        maxHeight: 1400,
        showCover: true,
        mobileScrollSupport: true,
        drawShadow: true,
        flippingTime: 800,
        usePortrait: vw < 900,
        autoSize: true,
        maxShadowOpacity: 0.5,
      });
      flipbook.loadFromHTML(stageEl.querySelectorAll(".page"));

      flipbook.on("flip", (e) => {
        currentEl.textContent = (e.data || 0) + 1;
      });

      currentEl.textContent = "1";
      loadingEl.classList.add("hidden");

    } catch (err) {
      console.error("Flipbook error:", err);
      loadingEl.innerHTML =
        "<p>The journal could not be opened in the reader.</p>" +
        "<p class='text-xs'><a href='" + PDF_URL + "' download style='color:var(--color-gold);text-decoration:underline'>Download the PDF</a> to read it.</p>";
    }
  }

  function getAspect(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.width / img.height);
      img.onerror = () => resolve(0.707);
      img.src = src;
    });
  }
})();
