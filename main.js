// Scripts du site TXR — volontairement légers, sans dépendance.
(() => {
  "use strict";
  const doc = document.documentElement;

  /* ---------- En-tête : ombre au défilement ---------- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Menu mobile ---------- */
  const toggle = document.querySelector(".menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  if (toggle && mobileNav) {
    const setOpen = (open) => {
      doc.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      mobileNav.toggleAttribute("inert", !open);
    };
    setOpen(false);
    toggle.addEventListener("click", () => setOpen(!doc.classList.contains("menu-open")));
    mobileNav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    window.matchMedia("(min-width: 900px)").addEventListener("change", (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------- Apparition des sections ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Galerie produit ---------- */
  const main = document.querySelector(".gallery-main img");
  const thumbs = document.querySelectorAll(".gallery-thumbs button");
  thumbs.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.getAttribute("aria-current") === "true") return;
      thumbs.forEach((b) => b.setAttribute("aria-current", "false"));
      btn.setAttribute("aria-current", "true");
      main.classList.add("is-changing");
      setTimeout(() => {
        main.src = btn.dataset.src;
        main.alt = btn.dataset.alt || "";
        main.classList.remove("is-changing");
      }, 180);
    });
  });

  /* ---------- Lien « Guide des tailles » : ouvre le volet ---------- */
  document.querySelectorAll("[data-open-guide]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target && target.tagName === "DETAILS") {
        e.preventDefault();
        target.open = true;
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ---------- Aperçu du flocage ---------- */
  const flocage = document.querySelector("[data-flocage]");
  if (flocage) {
    const maxLen = Number(flocage.dataset.maxLength) || 12;
    const min = Number(flocage.dataset.min) || 0;
    const max = Number(flocage.dataset.max) || 99;
    const nameInput = flocage.querySelector("#flocage-nom");
    const numInput = flocage.querySelector("#flocage-numero");
    const nameOut = flocage.querySelector("[data-preview-name]");
    const numOut = flocage.querySelectorAll("[data-preview-number]");
    const nameErr = flocage.querySelector("#flocage-nom-error");
    const numErr = flocage.querySelector("#flocage-numero-error");
    const NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9 .\-_']*$/;

    const update = () => {
      const name = nameInput.value.trim().toUpperCase();
      const num = numInput.value.trim();

      let nameMsg = "";
      if (name.length > maxLen) nameMsg = `${maxLen} caractères maximum.`;
      else if (!NAME_RE.test(name)) nameMsg = "Lettres, chiffres, espace, point, tiret uniquement.";
      nameErr.textContent = nameMsg;
      nameInput.setAttribute("aria-invalid", String(Boolean(nameMsg)));

      let numMsg = "";
      if (num !== "" && (!/^\d{1,2}$/.test(num) || Number(num) < min || Number(num) > max)) {
        numMsg = `Un nombre entre ${min} et ${max}.`;
      }
      numErr.textContent = numMsg;
      numInput.setAttribute("aria-invalid", String(Boolean(numMsg)));

      nameOut.textContent = name || "PSEUDO";
      numOut.forEach((n) => (n.textContent = num || "10"));
      // Ajuste la taille du nom pour qu'il tienne sur le dos
      const len = Math.max((name || "PSEUDO").length, 6);
      nameOut.setAttribute("font-size", String(Math.min(78, Math.round(470 / len))));
    };
    nameInput.addEventListener("input", update);
    numInput.addEventListener("input", update);
    update();
  }
})();
