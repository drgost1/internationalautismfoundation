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
