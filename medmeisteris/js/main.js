/* ======================================================================
   MEDMEISTERIS — interactions & rendering
   ====================================================================== */
(function () {
  "use strict";

  var IMG_BASE = "assets/img/";

  /* ---- Image helper: real photo with auto-fallback to placeholder ---- */
  function imageHTML(file, label) {
    return '<img class="auto-img" src="' + IMG_BASE + file + '" alt="' + label + '" loading="lazy">';
  }

  /* When a photo is missing, turn its CONTAINER into a labelled placeholder. */
  function failTo(img) {
    var c = img.closest(".card-media,.about-media,.gallery-item,.modal-media");
    if (!c) return;
    c.classList.add("media-ph");
    c.setAttribute("data-label", img.getAttribute("alt") || "MEDMEISTERIS");
  }
  function wireFallbacks() {
    document.querySelectorAll("img.auto-img").forEach(function (img) {
      if (img.dataset.wired) return;
      img.dataset.wired = "1";
      if (img.complete && img.naturalWidth === 0) { failTo(img); return; }
      img.addEventListener("error", function () { failTo(img); });
    });
  }

  /* Standalone <img data-img="..."> tags (e.g. About section) */
  function hydrateDataImages() {
    document.querySelectorAll("img[data-img]").forEach(function (img) {
      var key = img.getAttribute("data-img");
      if (!img.getAttribute("alt")) img.setAttribute("alt", "MEDMEISTERIS");
      img.classList.add("auto-img");
      img.src = IMG_BASE + key + ".jpg";
    });
  }

  /* ---------------------------- Render products ---------------------------- */
  function cardHTML(p) {
    var note = p.priceNote ? "<small>" + p.priceNote + "</small>" : "";
    return (
      '<article class="card reveal" data-id="' + p.id + '">' +
        '<div class="card-media">' +
          imageHTML(p.img, p.name) +
          '<span class="card-tag">' + p.tag + "</span>" +
        "</div>" +
        '<div class="card-body">' +
          "<h3>" + p.name + "</h3>" +
          '<p class="card-desc">' + p.desc + "</p>" +
          '<div class="card-foot">' +
            '<div class="price">' + p.price + note + "</div>" +
            '<div class="card-actions">' +
              '<button class="icon-btn more" data-open="' + p.id + '" aria-label="Plačiau" title="Plačiau">' +
                '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>' +
              "</button>" +
              '<a class="icon-btn call" href="tel:+37067701441" aria-label="Skambinti" title="Skambinti">' +
                '<svg viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.2 2.2z"/></svg>' +
              "</a>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function renderGrids() {
    ["kubilai", "kupolai", "griliai"].forEach(function (cat) {
      var grid = document.getElementById("grid-" + cat);
      if (!grid) return;
      grid.innerHTML = PRODUCTS.filter(function (p) { return p.category === cat; })
        .map(cardHTML).join("");
    });
  }

  function renderGallery() {
    var grid = document.getElementById("galleryGrid");
    if (!grid || typeof GALLERY === "undefined") return;
    grid.innerHTML = GALLERY.map(function (g) {
      return '<div class="gallery-item" data-full="' + IMG_BASE + g.img + '">' +
        imageHTML(g.img, g.label) + "</div>";
    }).join("");
  }

  /* ------------------------------- Modal ------------------------------- */
  var CAT_LABEL = { kubilai: "SPA kubilas", kupolai: "Geodezinis kupolas", griliai: "Grilis-mangalas" };

  function openModal(id) {
    var p = PRODUCTS.find(function (x) { return x.id === id; });
    if (!p) return;
    var modal = document.getElementById("modal");
    var img = document.getElementById("modalImg");
    var media = img.closest(".modal-media");

    media.classList.remove("media-ph");
    media.removeAttribute("data-label");
    img.alt = p.name;
    img.onerror = function () { failTo(img); };
    img.src = IMG_BASE + p.img;

    document.getElementById("modalCat").textContent = CAT_LABEL[p.category] || "";
    document.getElementById("modalTitle").textContent = p.name;
    document.getElementById("modalPrice").innerHTML = p.price +
      (p.priceNote ? ' <span style="font-size:.7em;color:var(--muted)">' + p.priceNote + "</span>" : "");
    document.getElementById("modalDesc").textContent = p.desc;
    document.getElementById("modalSpecs").innerHTML =
      (p.specs || []).map(function (s) { return "<li>" + s + "</li>"; }).join("");

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    var modal = document.getElementById("modal");
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  /* ----------------------------- Lightbox ----------------------------- */
  function openLightbox(src) {
    var lb = document.getElementById("lightbox");
    document.getElementById("lightboxImg").src = src;
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    document.getElementById("lightbox").classList.remove("open");
    document.body.style.overflow = "";
  }

  /* --------------------------- Reveal on scroll --------------------------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ------------------------------ Count up ------------------------------ */
  function initCounters() {
    var nums = document.querySelectorAll("[data-count]");
    if (!nums.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, target = +el.getAttribute("data-count"),
            suffix = el.getAttribute("data-suffix") || "", start = null;
        function step(t) {
          if (!start) start = t;
          var prog = Math.min((t - start) / 1400, 1);
          el.textContent = Math.floor(prog * target) + suffix;
          if (prog < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* -------------------------- Header / nav / scroll-spy -------------------------- */
  function initHeader() {
    var header = document.getElementById("header");
    var nav = document.getElementById("nav");
    var toggle = document.getElementById("navToggle");
    var links = Array.prototype.slice.call(nav.querySelectorAll("a"));

    function onScroll() { header.classList.toggle("scrolled", window.scrollY > 30); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    // scroll-spy
    var sections = links
      .map(function (a) { return document.querySelector(a.getAttribute("href")); })
      .filter(Boolean);
    if ("IntersectionObserver" in window && sections.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (l) {
            l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id);
          });
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      sections.forEach(function (s) { spy.observe(s); });
    }
  }

  /* ------------------------------- Hero photo ------------------------------- */
  function initHero() {
    // If a real hero.jpg exists, reveal the photo layer over the gradient.
    var probe = new Image();
    probe.onload = function () { document.querySelector(".hero").classList.add("has-hero"); };
    probe.src = IMG_BASE + "hero.jpg";
  }

  /* ------------------------------- Events ------------------------------- */
  function initEvents() {
    document.addEventListener("click", function (e) {
      var openBtn = e.target.closest("[data-open]");
      if (openBtn) { openModal(openBtn.getAttribute("data-open")); return; }

      if (e.target.closest("[data-close]")) { closeModal(); return; }

      var galItem = e.target.closest(".gallery-item");
      if (galItem && galItem.getAttribute("data-full")) {
        // only open lightbox if the image actually loaded (not a placeholder)
        if (!galItem.classList.contains("media-ph")) openLightbox(galItem.getAttribute("data-full"));
        return;
      }
      if (e.target.closest("[data-lbclose]") || e.target.id === "lightbox") { closeLightbox(); return; }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeModal(); closeLightbox(); }
    });
  }

  /* ------------------------------- Init ------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    renderGrids();
    renderGallery();
    hydrateDataImages();
    wireFallbacks();
    initReveal();
    initCounters();
    initHeader();
    initHero();
    initEvents();
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
