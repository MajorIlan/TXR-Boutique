// ============================================================================
//  CONFIGURATION DU SITE — TXR
//  ---------------------------------------------------------------------------
//  C'est LE fichier à modifier pour changer les textes, les produits, les prix,
//  les liens Stripe, les réseaux sociaux et les informations légales.
//
//  Règles :
//   • Tout texte entre [À COMPLÉTER ...] apparaît surligné en jaune sur le site
//     tant qu'il n'est pas remplacé. Rien de juridique n'a été inventé.
//   • Après modification, le site se reconstruit tout seul sur Cloudflare
//     (ou lancez `npm run build` en local).
//   • Les couleurs et la police se changent dans src/assets/css/theme.css
// ============================================================================

export default {
  // --------------------------------------------------------------------------
  // IDENTITÉ
  // --------------------------------------------------------------------------
  team: {
    name: "TXR",                       // Nom court (logo texte, titres)
    fullName: "Team TXR",              // Nom complet
    slogan: "[À COMPLÉTER : slogan de la team]",
    // Texte de présentation (page d'accueil + page La team + SEO)
    pitch:
      "Organisation e-sport. Retrouvez la collection officielle : maillots, veste et bas aux couleurs de la team.",
    logo: "/assets/img/logo.svg",      // Remplacer le fichier par le vrai logo (SVG ou PNG)
  },

  // Adresse publique du site (sans / final). Sert au sitemap, aux partages
  // Discord/Twitter et au référencement. À mettre à jour si vous changez d'adresse.
  siteUrl: "https://txr-boutique.pages.dev",

  // --------------------------------------------------------------------------
  // BOUTIQUE
  // --------------------------------------------------------------------------
  shop: {
    shippingPrice: 5,                                   // € par commande (doit correspondre à Stripe)
    shippingCountries: ["France", "Belgique", "Suisse", "Luxembourg"],
    deliveryTime: "[À COMPLÉTER : délai, ex. 5 à 10 jours ouvrés après préparation]",
    stripeLocale: "fr",                                 // Langue de la page de paiement Stripe
  },

  // Tailles par défaut (chaque produit peut avoir sa propre liste)
  defaultSizes: ["XS", "S", "M", "L", "XL", "XXL"],

  // --------------------------------------------------------------------------
  // PRODUITS
  //  status : "disponible" | "epuise" | "bientot"
  //  stripeLink : lien de paiement Stripe (https://buy.stripe.com/...).
  //               Laissé vide → le bouton affiche « Bientôt disponible ».
  //  price : prix AFFICHÉ. Le prix réellement payé est celui défini dans Stripe :
  //          pensez à modifier les deux.
  //  images : la première est l'image principale. Remplacez les fichiers dans
  //           src/assets/img/produits/ (format conseillé : 1600×2000 px, WebP/JPG)
  // --------------------------------------------------------------------------
  products: [
    {
      slug: "maillot-officiel",
      name: "Maillot officiel",
      price: 45,
      status: "disponible",
      stripeLink: "",
      badge: "Collection officielle",
      description:
        "Maillot officiel de la team, avec le design principal de l'organisation.",
      details: [
        "Matière : [À COMPLÉTER]",
        "Coupe : [À COMPLÉTER]",
        "Entretien : [À COMPLÉTER]",
      ],
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      unavailableSizes: [],            // ex. ["XS"] pour afficher une taille barrée
      flocage: false,
      images: [
        { src: "/assets/img/produits/maillot-face.svg", alt: "Maillot officiel TXR, vue de face" },
        { src: "/assets/img/produits/maillot-dos.svg", alt: "Maillot officiel TXR, vue de dos" },
      ],
    },
    {
      slug: "maillot-officiel-floque",
      name: "Maillot officiel floqué",
      price: 55,
      status: "disponible",
      stripeLink: "",
      badge: "Personnalisable",
      description:
        "Le maillot officiel de la team, floqué à votre nom ou pseudo et au numéro de votre choix.",
      details: [
        "Flocage : nom / pseudo + numéro au dos",
        "Matière : [À COMPLÉTER]",
        "Coupe : [À COMPLÉTER]",
        "Article personnalisé : non éligible au droit de rétractation",
      ],
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      unavailableSizes: [],
      flocage: {
        nameMaxLength: 12,             // doit correspondre aux consignes dans Stripe
        numberMin: 0,
        numberMax: 99,
      },
      images: [
        { src: "/assets/img/produits/maillot-floque-dos.svg", alt: "Maillot officiel floqué TXR, vue de dos avec nom et numéro" },
        { src: "/assets/img/produits/maillot-face.svg", alt: "Maillot officiel floqué TXR, vue de face" },
      ],
    },
    {
      slug: "veste-officielle",
      name: "Veste officielle",
      price: 55,
      status: "disponible",
      stripeLink: "",
      badge: "Collection officielle",
      description:
        "La veste officielle de la team, pour les déplacements, les LAN et le quotidien.",
      details: [
        "Matière : [À COMPLÉTER]",
        "Fermeture : [À COMPLÉTER]",
        "Entretien : [À COMPLÉTER]",
      ],
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      unavailableSizes: [],
      flocage: false,
      images: [
        { src: "/assets/img/produits/veste.svg", alt: "Veste officielle TXR" },
      ],
    },
    {
      slug: "bas-officiel",
      name: "Bas officiel",
      price: 50,
      status: "disponible",
      stripeLink: "",
      badge: "Collection officielle",
      description:
        "Le bas officiel de la team, assorti à la veste.",
      details: [
        "Matière : [À COMPLÉTER]",
        "Taille : [À COMPLÉTER : élastique / cordon]",
        "Entretien : [À COMPLÉTER]",
      ],
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      unavailableSizes: [],
      flocage: false,
      images: [
        { src: "/assets/img/produits/bas.svg", alt: "Bas officiel TXR" },
      ],
    },
  ],

  // Guide des tailles (affiché sur chaque fiche produit). Mesures en cm.
  sizeGuide: {
    columns: ["Taille", "Tour de poitrine", "Longueur"],
    rows: [
      ["XS", "[À COMPLÉTER]", "[À COMPLÉTER]"],
      ["S", "[À COMPLÉTER]", "[À COMPLÉTER]"],
      ["M", "[À COMPLÉTER]", "[À COMPLÉTER]"],
      ["L", "[À COMPLÉTER]", "[À COMPLÉTER]"],
      ["XL", "[À COMPLÉTER]", "[À COMPLÉTER]"],
      ["XXL", "[À COMPLÉTER]", "[À COMPLÉTER]"],
    ],
  },

  // --------------------------------------------------------------------------
  // LA TEAM (page « La team »). Ajoutez/supprimez des lignes librement.
  // photo : chemin d'une image dans src/assets/img/team/ (laisser vide = initiales)
  // --------------------------------------------------------------------------
  roster: [
    { pseudo: "[Joueur 1]", role: "[Rôle]", game: "[Jeu]", photo: "" },
    { pseudo: "[Joueur 2]", role: "[Rôle]", game: "[Jeu]", photo: "" },
    { pseudo: "[Joueur 3]", role: "[Rôle]", game: "[Jeu]", photo: "" },
    { pseudo: "[Joueur 4]", role: "[Rôle]", game: "[Jeu]", photo: "" },
    { pseudo: "[Joueur 5]", role: "[Rôle]", game: "[Jeu]", photo: "" },
    { pseudo: "[Staff]", role: "[Rôle]", game: "", photo: "" },
  ],

  // --------------------------------------------------------------------------
  // RÉSEAUX SOCIAUX — laisser l'URL vide pour masquer un réseau
  // --------------------------------------------------------------------------
  socials: [
    { name: "Discord", url: "" },
    { name: "X", url: "" },
    { name: "Twitch", url: "" },
    { name: "YouTube", url: "" },
    { name: "Instagram", url: "" },
    { name: "TikTok", url: "" },
  ],

  // --------------------------------------------------------------------------
  // INFORMATIONS LÉGALES (association loi 1901)
  // Utilisées dans : mentions légales, CGV, politique de confidentialité.
  // --------------------------------------------------------------------------
  legal: {
    associationName: "[À COMPLÉTER : nom officiel de l'association]",
    form: "Association régie par la loi du 1er juillet 1901",
    rna: "[À COMPLÉTER : n° RNA, ex. W211000000]",
    siren: "[À COMPLÉTER : n° SIREN/SIRET si l'association en a un, sinon effacer ce texte entre les guillemets]",
    address: "[À COMPLÉTER : adresse du siège social]",
    publicationDirector: "[À COMPLÉTER : nom du/de la président(e)]",
    email: "[À COMPLÉTER : e-mail de contact]",
    phone: "[À COMPLÉTER : téléphone de contact de l'association]",
    // Mention TVA à faire valider (cas fréquent pour une petite association :
    // « TVA non applicable, article 293 B du CGI »).
    vatMention: "[À COMPLÉTER : mention TVA, ex. « TVA non applicable, art. 293 B du CGI »]",
    // Médiateur de la consommation : obligatoire dès qu'on vend à des particuliers.
    mediator: {
      name: "[À COMPLÉTER : nom du médiateur de la consommation]",
      url: "[À COMPLÉTER : site du médiateur]",
    },
    host: {
      name: "Cloudflare, Inc.",
      address: "101 Townsend St, San Francisco, CA 94107, États-Unis",
      phone: "[À COMPLÉTER : téléphone de l'hébergeur, indiqué sur cloudflare.com]",
      website: "https://www.cloudflare.com",
    },
    lastUpdate: "[À COMPLÉTER : date de mise à jour]",
  },

  // Police officielle via Adobe Fonts (kit TXR). Laisser vide pour n'utiliser
  // que la police de remplacement hébergée sur le site (Barlow Condensed).
  adobeFontsKitId: "xgn6nmb",
};
