/* Quill-powered rich editor + image picker + blocks repeater for the admin CMS */

(function () {
  if (typeof Quill === "undefined") { console.warn("Quill not loaded"); return; }

  /* ---------- Custom "Accent" inline format ---------- */
  const Inline = Quill.import("blots/inline");
  class AccentBlot extends Inline {}
  AccentBlot.blotName = "accent";
  AccentBlot.tagName  = "SPAN";
  AccentBlot.className = "italic-accent";
  Quill.register(AccentBlot, true);

  /* ---------- Init all rich fields (idempotent) ---------- */
  function initRichWrap(wrap) {
    if (wrap.__rich_inited) return;
    wrap.__rich_inited = true;
    const targetId = wrap.getAttribute("data-target");
    const target   = document.getElementById(targetId);
    const isSingle = wrap.getAttribute("data-single") === "1";

    // Initial content from the hidden textarea (server-escaped already).
    const initialHtml = target ? target.value : "";

    // Build a hidden div, move it into the wrap to host Quill.
    const editorRoot = document.createElement("div");
    wrap.appendChild(editorRoot);

    const toolbar = isSingle
      ? [["bold", "italic"], ["accent"], ["clean"]]
      : [
          [{ header: [2, 3, false] }],
          ["bold", "italic", "underline"],
          ["accent"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "link"],
          ["clean"],
        ];

    const quill = new Quill(editorRoot, {
      theme: "snow",
      modules: {
        toolbar: {
          container: toolbar,
          handlers: {
            accent() { const r = this.quill.getSelection(true); if (!r || r.length === 0) return; const cur = this.quill.getFormat(r); this.quill.format("accent", !cur.accent); },
          },
        },
      },
      formats: isSingle
        ? ["bold", "italic", "accent"]
        : ["header", "bold", "italic", "underline", "accent", "list", "blockquote", "link"],
    });

    // Single-line fields: don't allow paragraph breaks
    if (isSingle) {
      quill.root.classList.add("single-line");
      quill.keyboard.addBinding({ key: 13 }, () => false);        // Enter does nothing
      quill.keyboard.addBinding({ key: 13, shiftKey: true }, () => false);
    }

    // Re-label the custom toolbar button
    const btn = wrap.querySelector(".ql-accent");
    if (btn) { btn.setAttribute("title", "Wrap selection in italic-accent"); btn.textContent = "Accent"; }

    // Seed with initial HTML safely
    if (initialHtml) {
      const delta = quill.clipboard.convert({ html: initialHtml });
      quill.setContents(delta, "silent");
    }

    // Sync to hidden textarea on every change
    quill.on("text-change", () => { target.value = normalise(quill.root.innerHTML, isSingle); });

    // Also sync once on submit, just in case
    const form = target.form;
    if (form) form.addEventListener("submit", () => { target.value = normalise(quill.root.innerHTML, isSingle); });
  }

  document.querySelectorAll("[data-rich]").forEach(initRichWrap);

  // For single-line titles, Quill wraps everything in <p>…</p>. Strip that wrapper.
  function normalise(html, single) {
    if (!html) return "";
    html = html.replace(/<p>\s*<br>\s*<\/p>/g, "").trim();
    if (single) {
      // Remove the single wrapping <p>…</p> so titles render inline in the theme
      const m = html.match(/^<p>([\s\S]*)<\/p>$/);
      if (m) html = m[1];
    }
    // Strip Quill's tracking classes and empty spans
    html = html.replace(/ class="ql-[^"]*"/g, "");
    return html;
  }

  /* ---------- Image picker ---------- */
  const picker = document.querySelector("[data-picker]");
  const grid   = document.querySelector("[data-picker-grid]");
  const closeBtn = document.querySelector("[data-picker-close]");
  let pickingFor = null;

  document.querySelectorAll("[data-pick-from-library]").forEach((btn) => {
    btn.addEventListener("click", () => {
      pickingFor = btn.getAttribute("data-pick-from-library");
      openPicker();
    });
  });
  closeBtn?.addEventListener("click", closePicker);
  picker?.addEventListener("click", (e) => { if (e.target === picker) closePicker(); });

  async function openPicker() {
    picker.classList.add("open");
    picker.setAttribute("aria-hidden", "false");
    grid.innerHTML = "Loading…";
    try {
      const r = await fetch("library.php", { cache: "no-store" });
      const files = await r.json();
      grid.innerHTML = "";
      if (!files.length) { grid.innerHTML = "<p class='muted'>No files yet. Upload images from the Uploads page.</p>"; return; }
      for (const f of files) {
        const tile = document.createElement("div");
        tile.className = "picker-tile";
        tile.innerHTML = `<img src="../${f.url}" alt="">`;
        tile.title = f.url;
        tile.addEventListener("click", () => {
          const urlInput = document.querySelector(`[data-img-url="${pickingFor}"]`);
          const preview  = document.querySelector(`[data-img-preview="${pickingFor}"]`);
          if (urlInput) urlInput.value = f.url;
          if (preview)  { preview.src = "../" + f.url; preview.style.visibility = "visible"; }
          closePicker();
        });
        grid.appendChild(tile);
      }
    } catch (e) {
      grid.innerHTML = "<p class='muted'>Could not load library.</p>";
    }
  }
  function closePicker() {
    picker.classList.remove("open");
    picker.setAttribute("aria-hidden", "true");
    pickingFor = null;
  }

  /* ---------- Live preview for file inputs ---------- */
  document.querySelectorAll("[data-img-file]").forEach((input) => {
    input.addEventListener("change", () => {
      const f = input.files[0];
      if (!f) return;
      const key = input.getAttribute("data-img-file");
      const preview = document.querySelector(`[data-img-preview="${key}"]`);
      if (!preview) return;
      preview.src = URL.createObjectURL(f);
      preview.style.visibility = "visible";
    });
  });

  /* ---------- Blocks repeater ---------- */
  const list = document.querySelector("[data-blocks-list]");
  const template = document.querySelector("[data-block-template]");
  const addBtn = document.querySelector("[data-add-block]");

  // Wire up existing blocks
  list?.querySelectorAll("[data-block]").forEach((el) => wireBlock(el));

  // Add-new handler
  let nextIdx = list ? list.querySelectorAll("[data-block]").length : 0;
  addBtn?.addEventListener("click", () => {
    const html = template.innerHTML.replace(/__INDEX__/g, String(nextIdx++));
    const tmp = document.createElement("div");
    tmp.innerHTML = html.trim();
    const node = tmp.firstElementChild;
    list.appendChild(node);
    // Init Quill on the new rich wrappers
    node.querySelectorAll("[data-rich]").forEach(initRichWrap);
    // Wire pickers + up/down/delete
    wireBlock(node);
    node.querySelectorAll("[data-pick-from-library]").forEach(wirePicker);
    node.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  function wireBlock(el) {
    if (el.__wired) return;
    el.__wired = true;
    el.querySelector("[data-block-delete]")?.addEventListener("click", () => {
      if (confirm("Delete this section?")) el.remove();
    });
    el.querySelector("[data-block-up]")?.addEventListener("click", () => {
      const prev = el.previousElementSibling;
      if (prev && prev.hasAttribute("data-block")) el.parentNode.insertBefore(el, prev);
    });
    el.querySelector("[data-block-down]")?.addEventListener("click", () => {
      const next = el.nextElementSibling;
      if (next && next.hasAttribute("data-block")) el.parentNode.insertBefore(next, el);
    });
    // Live title display
    const titleArea = el.querySelector("textarea[id^='bt_']");
    const label = el.querySelector(".block-title-display");
    const syncLabel = () => {
      if (!label) return;
      const t = (titleArea?.value || "").replace(/<[^>]+>/g, "").trim();
      label.textContent = t || "New section";
    };
    if (titleArea) {
      new MutationObserver(syncLabel).observe(titleArea, { attributes: true, childList: true, subtree: true, characterData: true });
      setInterval(syncLabel, 700); // Quill updates the value via .value, not DOM
    }
  }

  function wirePicker(btn) {
    btn.addEventListener("click", () => {
      window.__pickerTarget = btn.getAttribute("data-pick-from-library");
      document.querySelector("[data-picker]")?.classList.add("open");
    });
  }
})();
