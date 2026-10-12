// ============================================================================
//  GÉNÉRATEUR DU SITE TXR
//  Lit site.config.js + src/ et produit le site statique final dans dist/.
//  Aucune dépendance : Node.js 18+ suffit.   →   npm run build
//  (Normalement, vous n'avez pas besoin de modifier ce fichier.)
// ============================================================================
import { readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { legalPages } from "./src/legal.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");
const config = (await import(pathToFileURL(path.join(ROOT, "site.config.js")).href)).default;
const { team, shop, products, legal } = config;
const SITE = config.siteUrl.replace(/\/+$/, "");
const YEAR = new Date().getFullYear();

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------
const PLACEHOLDER_RE = /\[[^\]\n]{1,160}\]/g;
const isTodo = (s) => typeof s === "string" && /\[[^\]\n]{1,160}\]/.test(s);
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
/** Texte affiché : échappé + placeholders surlignés */
const t = (s = "") => esc(s).replace(PLACEHOLDER_RE, (m) => `<mark class="todo">${m}</mark>`);
/** Texte pour les balises meta : sans placeholder */
const plain = (s = "", fallback = "") => (isTodo(s) ? fallback : String(s));
const euro = (n) => (Number.isInteger(n) ? `${n}` : n.toFixed(2).replace(".", ",")) + "\u00a0€";
const abs = (p) => (/^https?:\/\//.test(p) ? p : SITE + p);
const listFr = (arr) => (arr.length < 2 ? arr.join("") : arr.slice(0, -1).join(", ") + " et " + arr.at(-1));
const COUNTRIES = listFr(shop.shippingCountries);
const SHIPPING = euro(shop.shippingPrice);
const hash = (s) => createHash("sha256").update(s).digest("hex").slice(0, 10);

const STATUS = {
  disponible: { label: "Disponible", schema: "https://schema.org/InStock" },
  epuise: { label: "Épuisé", schema: "https://schema.org/OutOfStock" },
  bientot: { label: "Bientôt disponible", schema: "https://schema.org/PreOrder" },
};
const statusOf = (p) => (p.status === "epuise" ? "epuise" : p.status === "bientot" || !p.stripeLink ? "bientot" : "disponible");
const productUrl = (p) => `/boutique/${p.slug}/`;
const stripeUrl = (p) => {
  try {
    const u = new URL(p.stripeLink);
    if (shop.stripeLocale && !u.searchParams.has("locale")) u.searchParams.set("locale", shop.stripeLocale);
    return u.toString();
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------------------
// Icônes (SVG en ligne, aucun appel externe)
// ---------------------------------------------------------------------------
const icon = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="1"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
  shirt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M8 3 3 6l2 5 2-1v11h10V10l2 1 2-5-5-3c-.5 1.5-2 2.5-4 2.5S8.5 4.5 8 3Z"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m7.5 12.5 3 3 6-6.5" stroke-width="2.2"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>',
};

// ---------------------------------------------------------------------------
// Gabarit commun
// ---------------------------------------------------------------------------
const BOOT_SCRIPT = "document.documentElement.classList.add('js')";
const BOOT_HASH = "sha256-" + createHash("sha256").update(BOOT_SCRIPT).digest("base64");
let ASSET_V = { css: "", js: "" };
const DEFAULT_OG = "/assets/img/og-image.png";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/boutique/", label: "Boutique" },
  { href: "/team/", label: "La team" },
];
const flocageProduct = products.find((p) => p.flocage);

function layout({ title, description, url, body, current = "", ogImage = DEFAULT_OG, ogType = "website", jsonLd = [], noindex = false }) {
  const fullTitle = title ? `${title} | ${team.fullName}` : `${team.fullName} — Boutique officielle`;
  const desc = plain(description, plain(team.pitch, `Boutique officielle ${team.fullName}.`));
  const nav = NAV.map((n) => `<li><a href="${n.href}"${current === n.href ? ' aria-current="page"' : ""}>${esc(n.label)}</a></li>`).join("");
  const mobileNav = NAV.map((n) => `<a href="${n.href}"${current === n.href ? ' aria-current="page"' : ""}>${esc(n.label)}</a>`).join("");
  const cta = flocageProduct
    ? `<a class="btn btn-primary" href="${productUrl(flocageProduct)}">${esc(flocageProduct.name.replace(/officiel\s*/i, ""))}</a>`
    : `<a class="btn btn-primary" href="/boutique/">Boutique</a>`;
  const kit = config.adobeFontsKitId
    ? `<link rel="preconnect" href="https://use.typekit.net" crossorigin>\n<link rel="stylesheet" href="https://use.typekit.net/${esc(config.adobeFontsKitId)}.css">`
    : "";
  const ld = jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("\n");

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(abs(url))}">
${noindex ? '<meta name="robots" content="noindex">' : ""}
<meta name="theme-color" content="#050b1c">
<meta property="og:site_name" content="${esc(team.fullName)}">
<meta property="og:locale" content="fr_FR">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(abs(url))}">
<meta property="og:image" content="${esc(abs(ogImage))}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
${kit}
<link rel="stylesheet" href="/assets/css/theme.css?v=${ASSET_V.theme}">
<link rel="stylesheet" href="/assets/css/main.css?v=${ASSET_V.css}">
<script>${BOOT_SCRIPT}</script>
<script src="/assets/js/main.js?v=${ASSET_V.js}" defer></script>
${ld}
</head>
<body>
<a class="skip-link" href="#contenu">Aller au contenu</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="${esc(team.fullName)} — accueil">
      <img src="${esc(team.logo)}" alt="" width="40" height="40">
      <span class="brand-name">${esc(team.name)}<small>Boutique officielle</small></span>
    </a>
    <nav class="main-nav" aria-label="Navigation principale">
      <ul>${nav}<li>${cta}</li></ul>
    </nav>
    <button class="menu-toggle" type="button" aria-controls="mobile-nav" aria-expanded="false" aria-label="Ouvrir le menu"><span></span></button>
  </div>
</header>
<nav class="mobile-nav" id="mobile-nav" aria-label="Navigation mobile">
  ${mobileNav}
  ${cta.replace('class="btn btn-primary"', 'class="btn btn-primary btn-lg btn-block"')}
</nav>
<main id="contenu">
${body}
</main>
${footer()}
</body>
</html>
`;
}

function socialsList() {
  const items = (config.socials || []).filter((s) => s.url);
  if (!items.length) return "";
  return `<ul class="socials">${items.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></li>`).join("")}</ul>`;
}

function footer() {
  const owner = isTodo(legal.associationName) ? team.fullName : legal.associationName;
  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a class="brand" href="/"><img src="${esc(team.logo)}" alt="" width="40" height="40"><span class="brand-name">${esc(team.name)}<small>Boutique officielle</small></span></a>
        <p class="muted">${t(team.pitch)}</p>
        ${socialsList()}
      </div>
      <div>
        <h4>Boutique</h4>
        <ul>${products.map((p) => `<li><a href="${productUrl(p)}">${esc(p.name)}</a></li>`).join("")}</ul>
      </div>
      <div>
        <h4>Infos</h4>
        <ul>
          <li><a href="/cgv/#livraison">Livraison &amp; retours</a></li>
          <li><a href="/cgv/">Conditions générales de vente</a></li>
          <li><a href="/mentions-legales/">Mentions légales</a></li>
          <li><a href="/confidentialite/">Confidentialité &amp; cookies</a></li>
          <li><a href="/team/">La team</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${YEAR} ${esc(owner)}. Tous droits réservés.</span>
      <span>Paiement sécurisé par Stripe · Livraison ${esc(COUNTRIES)}</span>
    </div>
  </div>
</footer>`;
}

// ---------------------------------------------------------------------------
// Composants
// ---------------------------------------------------------------------------
function buyButton(p, { large = false, short = false } = {}) {
  const st = statusOf(p);
  const cls = `btn ${large ? "btn-lg btn-block " : ""}`;
  if (st === "epuise") return `<span class="${cls}" aria-disabled="true">Épuisé</span>`;
  if (st === "bientot") return `<span class="${cls}" aria-disabled="true">${short ? "Bientôt" : "Bientôt disponible"}</span>`;
  const label = large ? `Acheter — ${euro(p.price)}` : "Acheter";
  return `<a class="${cls}btn-primary" href="${esc(stripeUrl(p))}" rel="noopener">${esc(label)}${large ? icon.arrow : ""}</a>`;
}

function productCard(p, i = 0) {
  const st = statusOf(p);
  const img = p.images?.[0] || { src: "", alt: "" };
  return `<article class="product-card reveal is-${st}" style="--delay:${(i % 4) * 0.08}s">
  <a class="product-media" href="${productUrl(p)}" tabindex="-1" aria-hidden="true">
    <img src="${esc(img.src)}" alt="" width="800" height="1000" loading="lazy" decoding="async">
    ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
  </a>
  <div class="product-body">
    <h3><a href="${productUrl(p)}">${esc(p.name)}</a></h3>
    <div class="product-row">
      <span class="price">${euro(p.price)}</span>
      <span class="stock is-${st}">${STATUS[st].label}</span>
    </div>
    <div class="product-actions">
      <a class="btn btn-ghost" href="${productUrl(p)}">Voir</a>
      ${buyButton(p, { short: true })}
    </div>
  </div>
</article>`;
}

const productGrid = (list) => `<div class="product-grid${list.length === 3 ? " cols-3" : ""}">${list.map(productCard).join("\n")}</div>`;

const featuresBlock = () => `<div class="features">
  <div class="feature reveal">${icon.lock}<div><h3>Paiement sécurisé</h3><p>Le paiement se fait sur la page sécurisée de Stripe. Aucune donnée bancaire ne transite par ce site.</p></div></div>
  <div class="feature reveal" style="--delay:.08s">${icon.truck}<div><h3>Livraison ${esc(SHIPPING)}</h3><p>Un forfait unique par commande, livré en ${esc(COUNTRIES)}.</p></div></div>
  <div class="feature reveal" style="--delay:.16s">${icon.shirt}<div><h3>Flocage personnalisé</h3><p>Ton nom ou ton pseudo et ton numéro au dos du maillot officiel.</p></div></div>
</div>`;

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------
function homePage() {
  const hero = products[0];
  const words = team.fullName.trim().split(/\s+/);
  const last = words.pop();
  const h1 = words.length ? `<span class="outline">${esc(words.join(" "))}</span> <span class="accent">${esc(last)}</span>` : `<span class="accent">${esc(last)}</span>`;
  const tickerItems = [...products.map((p) => p.name), `Livraison ${COUNTRIES}`, "Boutique officielle"];
  const tickerHtml = [...tickerItems, ...tickerItems].map((s) => `<span>${esc(s)}</span>`).join("");

  const body = `
<section class="hero">
  <div class="container hero-grid">
    <div class="reveal">
      <img class="hero-logo" src="${esc(team.logo)}" alt="Logo ${esc(team.fullName)}" width="84" height="84">
      <span class="eyebrow">Boutique officielle</span>
      <h1>${h1}</h1>
      <p class="slogan">${t(team.slogan)}</p>
      <p class="lead">${t(team.pitch)}</p>
      <div class="hero-actions">
        <a class="btn btn-primary btn-lg" href="/boutique/">Boutique ${icon.arrow}</a>
        <a class="btn btn-ghost btn-lg" href="/team/">Découvrir la team</a>
      </div>
      <div class="hero-meta">
        <span>${icon.truck} Livraison ${esc(SHIPPING)} · ${esc(shop.shippingCountries.join(" · "))}</span>
        <span>${icon.lock} Paiement sécurisé Stripe</span>
      </div>
    </div>
    <div class="hero-visual reveal" style="--delay:.15s">
      <div class="panel"></div><div class="sweep"></div>
      <img src="${esc(hero.images[0].src)}" alt="${esc(hero.images[0].alt)}" width="800" height="1000" fetchpriority="high">
      <a class="tag" href="${productUrl(hero)}"><small>${esc(hero.name)}</small><strong>${euro(hero.price)}</strong></a>
    </div>
  </div>
</section>
<div class="ticker" aria-hidden="true"><div class="ticker-track">${tickerHtml}</div></div>

<section class="section" id="collection">
  <div class="container">
    <div class="section-head reveal">
      <div><span class="eyebrow">La collection</span><h2>Porte les couleurs</h2></div>
      <a class="btn btn-ghost" href="/boutique/">Toute la boutique ${icon.arrow}</a>
    </div>
    ${productGrid(products)}
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="container">${featuresBlock()}</div>
</section>

<section class="section" style="padding-top:0">
  <div class="container">
    <div class="team-cta reveal">
      <div>
        <span class="eyebrow">La team</span>
        <h2>Derrière le maillot</h2>
        <p>${t(team.pitch)}</p>
      </div>
      <a class="btn btn-light btn-lg" href="/team/">Découvrir la team ${icon.arrow}</a>
    </div>
  </div>
</section>`;

  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: team.fullName,
    url: SITE + "/",
    logo: abs(team.logo),
    sameAs: (config.socials || []).filter((s) => s.url).map((s) => s.url),
  };
  return layout({ title: "", url: "/", body, current: "/", jsonLd: [org] });
}

function shopPage() {
  const body = `
<section class="page-head">
  <div class="container reveal">
    <span class="eyebrow">Boutique officielle</span>
    <h1>La collection</h1>
    <p class="lead">Les articles officiels ${esc(team.fullName)}. Choisis ton article : la taille${flocageProduct ? " et le flocage" : ""} se renseignent sur la page de paiement sécurisée.</p>
  </div>
</section>
<section class="section" style="padding-top:40px">
  <div class="container">
    ${productGrid(products)}
  </div>
</section>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="section-head reveal"><div><span class="eyebrow">Comment commander</span><h2>En 3 étapes</h2></div></div>
    <div class="features">
      <div class="feature reveal">${icon.shirt}<div><h3>1. Choisis</h3><p>Ouvre la fiche de l'article et clique sur « Acheter ».</p></div></div>
      <div class="feature reveal" style="--delay:.08s">${icon.lock}<div><h3>2. Paie sur Stripe</h3><p>Indique ta taille${flocageProduct ? ", ton flocage" : ""} et ton adresse, puis règle en toute sécurité.</p></div></div>
      <div class="feature reveal" style="--delay:.16s">${icon.truck}<div><h3>3. Reçois</h3><p>Tu reçois un reçu par e-mail, la team prépare et expédie ta commande.</p></div></div>
    </div>
  </div>
</section>`;
  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(productUrl(p)), name: p.name })),
  };
  return layout({ title: "Boutique", description: `Maillots, veste et bas officiels ${team.fullName}. Livraison ${SHIPPING} en ${COUNTRIES}.`, url: "/boutique/", body, current: "/boutique/", jsonLd: [list] });
}

function flocageBlock(p) {
  const f = p.flocage;
  return `<div class="flocage" data-flocage data-max-length="${f.nameMaxLength}" data-min="${f.numberMin}" data-max="${f.numberMax}">
  <div class="option-label">Essaie ton flocage</div>
  <div class="flocage-grid">
    <div class="flocage-preview" aria-hidden="true">
      <svg viewBox="0 0 800 1000">
        <path d="M250 140 L170 165 L60 290 L140 380 L210 330 L210 880 Q400 905 590 880 L590 330 L660 380 L740 290 L630 165 L550 140 Q400 178 250 140 Z" fill="#11204a" stroke="#1f6bff" stroke-width="10"/>
        <path d="M250 140 Q400 178 550 140" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round"/>
        <text data-preview-name x="400" y="330" text-anchor="middle" font-family="agency-fb, 'Barlow Condensed', sans-serif" font-weight="800" font-size="78" letter-spacing="6" fill="#ffffff">PSEUDO</text>
        <text data-preview-number x="408" y="668" text-anchor="middle" font-family="agency-fb, 'Barlow Condensed', sans-serif" font-weight="800" font-size="330" fill="none" stroke="#1f6bff" stroke-width="6">10</text>
        <text data-preview-number x="400" y="660" text-anchor="middle" font-family="agency-fb, 'Barlow Condensed', sans-serif" font-weight="800" font-size="330" fill="#ffffff">10</text>
      </svg>
    </div>
    <div class="flocage-fields">
      <div class="field">
        <label for="flocage-nom">Nom / Pseudo (${f.nameMaxLength} car. max)</label>
        <input id="flocage-nom" type="text" maxlength="${f.nameMaxLength + 4}" autocomplete="off" spellcheck="false" placeholder="PSEUDO" aria-describedby="flocage-nom-error">
        <span class="error" id="flocage-nom-error" aria-live="polite"></span>
      </div>
      <div class="field">
        <label for="flocage-numero">Numéro (${f.numberMin} à ${f.numberMax})</label>
        <input id="flocage-numero" type="text" inputmode="numeric" maxlength="2" autocomplete="off" placeholder="10" aria-describedby="flocage-numero-error">
        <span class="error" id="flocage-numero-error" aria-live="polite"></span>
      </div>
    </div>
  </div>
  <p class="hint">${icon.info}<span>Cet aperçu sert à visualiser ton flocage. Tu saisiras ton nom/pseudo et ton numéro sur la page de paiement : vérifie bien l'orthographe, un article floqué ne peut être ni repris ni échangé.</span></p>
</div>`;
}

function sizeGuideTable() {
  const g = config.sizeGuide;
  if (!g) return "";
  return `<div class="table-wrap"><table>
  <thead><tr>${g.columns.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
  <tbody>${g.rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${t(c)}</th>` : `<td>${t(c)}</td>`)).join("")}</tr>`).join("")}</tbody>
</table></div>`;
}

function productPage(p) {
  const st = statusOf(p);
  const imgs = p.images || [];
  const sizes = p.sizes || config.defaultSizes;
  const off = new Set(p.unavailableSizes || []);
  const others = products.filter((o) => o.slug !== p.slug);

  const thumbs = imgs.length > 1
    ? `<ul class="gallery-thumbs">${imgs.map((im, i) => `<li><button type="button" data-src="${esc(im.src)}" data-alt="${esc(im.alt)}" aria-current="${i === 0}" aria-label="Voir l'image ${i + 1}"><img src="${esc(im.src)}" alt="" width="80" height="100" loading="lazy"></button></li>`).join("")}</ul>`
    : "";

  const returns = p.flocage
    ? `Article personnalisé : il n'est ni repris ni échangé, sauf défaut. <a href="/cgv/#retractation">En savoir plus</a>.`
    : `14 jours pour changer d'avis après réception. <a href="/cgv/#retractation">Conditions</a>.`;

  const body = `
<div class="container">
  <ol class="breadcrumb" aria-label="Fil d'Ariane">
    <li><a href="/">Accueil</a></li><li><a href="/boutique/">Boutique</a></li><li aria-current="page">${esc(p.name)}</li>
  </ol>
  <div class="product-layout">
    <div class="gallery reveal">
      <div class="gallery-main"><img src="${esc(imgs[0]?.src)}" alt="${esc(imgs[0]?.alt)}" width="800" height="1000" fetchpriority="high"></div>
      ${thumbs}
    </div>
    <div class="product-info reveal" style="--delay:.1s">
      ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
      <h1>${esc(p.name)}</h1>
      <div class="price-row">
        <span class="price">${euro(p.price)}</span>
        <span class="stock is-${st}">${STATUS[st].label}</span>
      </div>
      <p class="description">${t(p.description)}</p>
      <p class="price-note">${t(legal.vatMention)} · Livraison ${esc(SHIPPING)} par commande</p>

      <div class="option-group">
        <div class="option-label">Tailles <a href="#guide-tailles" data-open-guide>Guide des tailles</a></div>
        <ul class="sizes">${sizes.map((s) => `<li class="${off.has(s) ? "is-off" : ""}">${off.has(s) ? `<span class="sr-only">Indisponible : </span>` : ""}${esc(s)}</li>`).join("")}</ul>
        <p class="hint">${icon.info}<span>Tu choisiras ta taille sur la page de paiement sécurisée.</span></p>
      </div>

      ${p.flocage ? flocageBlock(p) : ""}

      <div class="buy-box">
        ${buyButton(p, { large: true })}
        <p class="secure">${icon.lock} Paiement sécurisé par Stripe</p>
      </div>

      <ul class="reassurance">
        <li>${icon.truck}<span>Livraison <strong>${esc(SHIPPING)}</strong> par commande : ${esc(COUNTRIES)}.</span></li>
        <li>${icon.clock}<span>${t(shop.deliveryTime)}</span></li>
        <li>${icon.undo}<span>${returns}</span></li>
      </ul>

      <div class="accordion">
        <details open><summary>Détails</summary><div class="content"><ul>${(p.details || []).map((d) => `<li>${t(d)}</li>`).join("")}</ul></div></details>
        <details id="guide-tailles"><summary>Guide des tailles</summary><div class="content">${sizeGuideTable()}</div></details>
        <details><summary>Livraison &amp; retours</summary><div class="content">
          <p>Forfait de ${esc(SHIPPING)} par commande, livraison en ${esc(COUNTRIES)}. ${t(shop.deliveryTime)}</p>
          <p>${returns}</p>
        </div></details>
      </div>
    </div>
  </div>
</div>
<section class="more-products">
  <div class="container">
    <div class="section-head reveal"><div><span class="eyebrow">La collection</span><h2>Complète ta tenue</h2></div></div>
    ${productGrid(others)}
  </div>
</section>`;

  const firstRaster = imgs.find((im) => /\.(png|jpe?g|webp)$/i.test(im.src));
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      description: plain(p.description, p.name),
      image: imgs.map((im) => abs(im.src)),
      brand: { "@type": "Brand", name: team.fullName },
      offers: {
        "@type": "Offer",
        url: abs(productUrl(p)),
        priceCurrency: "EUR",
        price: p.price.toFixed(2),
        availability: STATUS[st].schema,
        itemCondition: "https://schema.org/NewCondition",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "Boutique", item: abs("/boutique/") },
        { "@type": "ListItem", position: 3, name: p.name, item: abs(productUrl(p)) },
      ],
    },
  ];
  return layout({
    title: p.name,
    description: `${plain(p.description, p.name)} ${euro(p.price)} — livraison ${SHIPPING} en ${COUNTRIES}.`,
    url: productUrl(p),
    body,
    current: "/boutique/",
    ogImage: firstRaster ? firstRaster.src : DEFAULT_OG,
    ogType: "product",
    jsonLd: ld,
  });
}

function teamPage() {
  const initials = (s) => s.replace(/[\[\]]/g, "").trim().slice(0, 2).toUpperCase() || "?";
  const roster = (config.roster || []).map((m, i) => `<article class="player reveal" style="--delay:${(i % 6) * 0.06}s">
    <div class="player-photo">${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.pseudo)}" loading="lazy">` : esc(initials(m.pseudo))}</div>
    <div class="player-info"><strong>${t(m.pseudo)}</strong><span>${[m.role, m.game].filter(Boolean).map(t).join(" · ")}</span></div>
  </article>`).join("");
  const socials = socialsList();
  const body = `
<section class="page-head">
  <div class="container reveal">
    <span class="eyebrow">${esc(team.fullName)}</span>
    <h1>La team</h1>
    <p class="slogan" style="font-family:var(--font-display);font-weight:700;font-size:1.5rem;letter-spacing:.12em;text-transform:uppercase;margin:16px 0 8px">${t(team.slogan)}</p>
    <p class="lead">${t(team.pitch)}</p>
  </div>
</section>
<section class="section" style="padding-top:40px">
  <div class="container">
    <div class="section-head reveal"><div><span class="eyebrow">Roster</span><h2>Les joueurs &amp; le staff</h2></div></div>
    <div class="roster">${roster}</div>
  </div>
</section>
${socials ? `<section class="section" style="padding-top:0"><div class="container reveal"><div class="section-head"><div><span class="eyebrow">Suivre la team</span><h2>Réseaux</h2></div></div>${socials}</div></section>` : ""}
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="team-cta reveal">
      <div><span class="eyebrow">Supporte la team</span><h2>Porte les couleurs</h2><p>Maillot, maillot floqué, veste et bas : la collection officielle est disponible.</p></div>
      <a class="btn btn-light btn-lg" href="/boutique/">Voir la boutique ${icon.arrow}</a>
    </div>
  </div>
</section>`;
  return layout({ title: "La team", description: `Découvrez ${team.fullName} : joueurs, staff et réseaux.`, url: "/team/", body, current: "/team/" });
}

function thanksPage() {
  const email = isTodo(legal.email) ? t(legal.email) : `<a href="mailto:${esc(legal.email)}" style="color:var(--primary-light)">${esc(legal.email)}</a>`;
  const body = `
<section class="center-page">
  <div class="container reveal">
    <div class="icon-big">${icon.check}</div>
    <span class="eyebrow">Commande</span>
    <h1>Merci&nbsp;!</h1>
    <p class="lead">Ton paiement a été transmis à Stripe. Un reçu va t'être envoyé par e-mail dans quelques minutes : c'est ta confirmation de commande. La team prépare ensuite ton colis.</p>
    <p class="muted">Pas de reçu après une heure ? Vérifie tes spams, puis écris-nous : ${email}</p>
    <div class="hero-actions" style="margin-top:28px">
      <a class="btn btn-primary btn-lg" href="/boutique/">Retour à la boutique</a>
      <a class="btn btn-ghost btn-lg" href="/team/">Découvrir la team</a>
    </div>
  </div>
</section>`;
  return layout({ title: "Merci pour ta commande", url: "/merci/", body, noindex: true });
}

function notFoundPage() {
  const body = `
<section class="center-page">
  <div class="container">
    <div class="big-code" aria-hidden="true">404</div>
    <h1 style="font-size:clamp(2rem,5vw,3rem);margin-top:10px">Page introuvable</h1>
    <p class="lead">Cette page n'existe pas ou a été déplacée.</p>
    <div class="hero-actions"><a class="btn btn-primary btn-lg" href="/">Accueil</a><a class="btn btn-ghost btn-lg" href="/boutique/">Boutique</a></div>
  </div>
</section>`;
  return layout({ title: "Page introuvable", url: "/404", body, noindex: true });
}

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------
async function write(rel, content) {
  const file = path.join(DIST, rel);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
}

async function build() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });
  await cp(path.join(SRC, "assets"), path.join(DIST, "assets"), { recursive: true });

  ASSET_V = {
    theme: hash(await readFile(path.join(SRC, "assets/css/theme.css"), "utf8")),
    css: hash(await readFile(path.join(SRC, "assets/css/main.css"), "utf8")),
    js: hash(await readFile(path.join(SRC, "assets/js/main.js"), "utf8")),
  };

  const pages = [
    ["index.html", homePage()],
    ["boutique/index.html", shopPage()],
    ["team/index.html", teamPage()],
    ["merci/index.html", thanksPage()],
    ["404.html", notFoundPage()],
    ...products.map((p) => [`boutique/${p.slug}/index.html`, productPage(p)]),
  ];
  const helpers = { t, esc, isTodo, euro, COUNTRIES, SHIPPING, config, flocageProduct };
  for (const lp of legalPages(helpers)) {
    pages.push([`${lp.slug}/index.html`, layout({ title: lp.title, description: lp.description, url: `/${lp.slug}/`, body: lp.body })]);
  }
  for (const [rel, html] of pages) await write(rel, html);

  // Sitemap + robots
  const urls = ["/", "/boutique/", ...products.map(productUrl), "/team/", "/cgv/", "/mentions-legales/", "/confidentialite/"];
  const today = new Date().toISOString().slice(0, 10);
  await write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${abs(u)}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);
  await write("robots.txt", `User-agent: *\nAllow: /\nDisallow: /merci/\n\nSitemap: ${SITE}/sitemap.xml\n`);

  // En-têtes de sécurité et de cache (Cloudflare Pages)
  const kitSrc = config.adobeFontsKitId ? " https://use.typekit.net https://p.typekit.net" : "";
  const csp = [
    "default-src 'self'",
    `script-src 'self' '${BOOT_HASH}'`,
    `style-src 'self' 'unsafe-inline'${kitSrc}`,
    `font-src 'self'${kitSrc ? " https://use.typekit.net" : ""}`,
    "img-src 'self' data: https:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
  await write("_headers", `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Strict-Transport-Security: max-age=31536000

/assets/css/*
  Cache-Control: public, max-age=31536000, immutable
/assets/js/*
  Cache-Control: public, max-age=31536000, immutable
/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable
/assets/img/*
  Cache-Control: public, max-age=86400
`);

  report();
}

// Liste ce qu'il reste à compléter
function report() {
  const todos = [];
  const walk = (v, where) => {
    if (typeof v === "string") { const m = v.match(PLACEHOLDER_RE); if (m) todos.push(`${where} → ${m[0]}`); }
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${where}[${i}]`));
    else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => walk(x, where ? `${where}.${k}` : k));
  };
  walk(config, "");
  const noLink = products.filter((p) => !p.stripeLink).map((p) => p.name);
  const badLink = products.filter((p) => p.stripeLink && !stripeUrl(p)).map((p) => p.name);

  console.log(`\n✔ Site généré dans dist/ (${products.length} produits)\n`);
  if (noLink.length) console.log(`⚠ Lien Stripe manquant (bouton « Bientôt disponible ») : ${noLink.join(", ")}`);
  if (badLink.length) console.log(`✖ Lien Stripe invalide : ${badLink.join(", ")}`);
  if (todos.length) {
    console.log(`⚠ ${todos.length} champ(s) [À COMPLÉTER] dans site.config.js (surlignés en jaune sur le site) :`);
    todos.forEach((x) => console.log("   - " + x));
  }
  console.log("");
}

await build();
