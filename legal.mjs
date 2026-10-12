// ============================================================================
//  PAGES LÉGALES — mentions légales, CGV, confidentialité & cookies
//  Les informations propres à l'association viennent de site.config.js (legal).
//  ⚠ Modèles rédigés de bonne foi, à faire relire avant l'ouverture de la
//    boutique (juriste, fédération, ou service juridique d'un partenaire).
// ============================================================================

export function legalPages({ t, esc, isTodo, euro, COUNTRIES, SHIPPING, config, flocageProduct }) {
  const L = config.legal;
  const team = config.team;
  const shop = config.shop;
  const assoc = t(L.associationName);
  const mail = isTodo(L.email) ? t(L.email) : `<a href="mailto:${esc(L.email)}">${esc(L.email)}</a>`;
  const mediatorUrl = isTodo(L.mediator.url) ? t(L.mediator.url) : `<a href="${esc(L.mediator.url)}" target="_blank" rel="noopener">${esc(L.mediator.url)}</a>`;
  const updated = `<p class="muted">Dernière mise à jour : ${t(L.lastUpdate)}</p>`;
  const reviewNote = `<p class="note">Modèle à faire relire avant l'ouverture de la boutique. Les champs surlignés en jaune sont à compléter dans <code>site.config.js</code>.</p>`;
  const head = (eyebrow, title) => `<section class="page-head"><div class="container"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1></div></section>`;
  const floque = flocageProduct ? esc(flocageProduct.name) : "articles personnalisés";

  // ------------------------------------------------------------------ MENTIONS
  const mentions = `${head("Informations", "Mentions légales")}
<div class="container"><div class="prose">
${reviewNote}
<h2>Éditeur du site</h2>
<p>
<strong>${assoc}</strong><br>
${esc(L.form)}<br>
N° RNA : ${t(L.rna)}<br>
${L.siren ? `SIREN / SIRET : ${t(L.siren)}<br>
` : ""}Siège social : ${t(L.address)}<br>
E-mail : ${mail}<br>
Téléphone : ${t(L.phone)}
</p>
<h2>Directeur de la publication</h2>
<p>${t(L.publicationDirector)}, en qualité de président(e) de l'association.</p>
<h2>Hébergement</h2>
<p>
<strong>${esc(L.host.name)}</strong><br>
${esc(L.host.address)}<br>
Téléphone : ${t(L.host.phone)}<br>
<a href="${esc(L.host.website)}" target="_blank" rel="noopener">${esc(L.host.website)}</a>
</p>
<h2>Paiement</h2>
<p>Les paiements sont traités par <strong>Stripe Payments Europe, Limited</strong> (Irlande), prestataire de services de paiement agréé. Le site ne collecte ni ne conserve aucune donnée bancaire.</p>
<h2>Propriété intellectuelle</h2>
<p>Le nom ${esc(team.fullName)}, les logos, visuels, photographies et textes de ce site sont la propriété de ${assoc} ou de leurs auteurs respectifs. Toute reproduction ou réutilisation, totale ou partielle, sans autorisation écrite préalable est interdite.</p>
<h2>Crédits</h2>
<p>Polices : Agency FB (Adobe Fonts) ; Barlow et Barlow Condensed (licence SIL Open Font License).</p>
<h2>Contact</h2>
<p>Pour toute question : ${mail}</p>
</div></div>`;

  // ---------------------------------------------------------------------- CGV
  const cgv = `${head("Informations", "Conditions générales de vente")}
<div class="container"><div class="prose">
${reviewNote}
${updated}

<h2 id="objet">1. Objet</h2>
<p>Les présentes conditions générales de vente (CGV) s'appliquent à toutes les ventes d'articles officiels ${esc(team.fullName)} conclues à distance via ce site, entre ${assoc} (le « Vendeur ») et toute personne physique agissant en qualité de consommateur (le « Client »). Le Client déclare les avoir lues et acceptées avant de passer commande ; leur acceptation est demandée sur la page de paiement.</p>

<h2 id="vendeur">2. Vendeur</h2>
<p>${assoc}, ${esc(L.form)}, n° RNA ${t(L.rna)}, dont le siège est situé ${t(L.address)}. Contact : ${mail}.</p>

<h2 id="produits">3. Produits</h2>
<p>Les articles proposés (maillots, maillot floqué, veste, bas) sont décrits sur leur fiche produit avec leurs caractéristiques essentielles. Les visuels sont aussi fidèles que possible mais n'ont pas de valeur contractuelle pour les nuances de couleur.</p>
<p>Le <strong>${floque}</strong> est un article <strong>personnalisé</strong> réalisé selon les indications du Client (nom ou pseudo, numéro, taille). Le Client est seul responsable de l'exactitude des informations de flocage qu'il saisit.</p>

<h2 id="prix">4. Prix</h2>
<p>Les prix sont indiqués en euros. ${t(L.vatMention)}.</p>
<p>Des <strong>frais de livraison de ${esc(SHIPPING)} par commande</strong> s'ajoutent au prix des articles. Le montant total (articles + livraison) est affiché sur la page de paiement avant validation. Le prix applicable est celui affiché au moment de la commande.</p>

<h2 id="commande">5. Commande</h2>
<ol>
  <li>Le Client choisit un article sur le site et clique sur « Acheter ».</li>
  <li>Il est redirigé vers la page de paiement sécurisée de Stripe, où il sélectionne sa taille, la quantité et, pour le ${floque}, son nom/pseudo et son numéro.</li>
  <li>Il renseigne ses coordonnées et son adresse de livraison, accepte les présentes CGV et procède au paiement.</li>
  <li>La commande est ferme dès la confirmation du paiement. Un reçu récapitulant la commande est envoyé par e-mail ; il vaut confirmation de commande.</li>
</ol>
<p>Chaque paiement correspond à une commande. Un Client qui achète plusieurs articles au moyen de paiements distincts passe plusieurs commandes, chacune comprenant les frais de livraison.</p>
<p>Le Vendeur se réserve le droit d'annuler et de rembourser intégralement une commande en cas de rupture de stock, d'information de flocage contraire à la loi ou aux bonnes mœurs (propos injurieux, discriminatoires, etc.) ou de litige antérieur avec le Client. Le Client en est informé par e-mail.</p>

<h2 id="paiement">6. Paiement</h2>
<p>Le paiement est exigible immédiatement à la commande. Il s'effectue par carte bancaire ou tout autre moyen proposé sur la page de paiement, opérée par Stripe. Le Vendeur n'a jamais accès aux données bancaires du Client.</p>

<h2 id="livraison">7. Livraison</h2>
<p>Les commandes sont livrées en <strong>${esc(COUNTRIES)}</strong>, à l'adresse indiquée par le Client lors du paiement, pour un forfait de ${esc(SHIPPING)} par commande.</p>
<p>Délai : ${t(shop.deliveryTime)}. Le ${floque} peut nécessiter un délai de préparation supplémentaire. À défaut de délai indiqué, la livraison intervient au plus tard 30 jours après la commande.</p>
<p>Transporteur : ${t("[À COMPLÉTER : ex. La Poste / Colissimo]")}.</p>
<p><strong>Suisse :</strong> la Suisse ne faisant pas partie de l'Union européenne, des droits de douane, taxes à l'importation ou frais de dédouanement peuvent être réclamés au destinataire à la réception. Ils sont à la charge du Client.</p>
<p>Le transfert des risques a lieu lorsque le Client (ou un tiers désigné par lui) prend physiquement possession des articles. En cas de colis endommagé ou incomplet, le Client est invité à émettre des réserves auprès du transporteur et à contacter le Vendeur rapidement à ${mail}, photos à l'appui.</p>

<h2 id="retractation">8. Droit de rétractation</h2>
<p>Le Client dispose d'un délai de <strong>14 jours</strong> à compter de la réception de sa commande pour exercer son droit de rétractation, sans avoir à se justifier.</p>
<p><strong>Exception — articles personnalisés :</strong> conformément à l'article L221-28, 3° du Code de la consommation, le droit de rétractation <strong>ne s'applique pas</strong> au ${floque}, confectionné selon les spécifications du Client. Cette exception ne prive pas le Client des garanties légales (article 9).</p>
<h3>Comment exercer ce droit</h3>
<p>Le Client informe le Vendeur de sa décision par une déclaration dénuée d'ambiguïté envoyée à ${mail}, ou au moyen du formulaire de rétractation ci-dessous. Il renvoie ensuite les articles, neufs, non portés et dans leur état d'origine, au plus tard 14 jours après avoir communiqué sa décision, à l'adresse : ${t("[À COMPLÉTER : adresse de retour]")}.</p>
<p>Les frais de retour sont ${t("[À COMPLÉTER : « à la charge du Client » ou « pris en charge par le Vendeur »]")}.</p>
<h3>Remboursement</h3>
<p>Le Vendeur rembourse la totalité des sommes versées, y compris les frais de livraison initiaux, au plus tard 14 jours après avoir été informé de la décision de rétractation, par le même moyen de paiement que celui utilisé pour la commande. Le Vendeur peut différer le remboursement jusqu'à réception des articles ou jusqu'à la preuve de leur expédition.</p>

<h2 id="garanties">9. Garanties légales</h2>
<p>Indépendamment du droit de rétractation, le Client bénéficie de :</p>
<ul>
  <li>la <strong>garantie légale de conformité</strong> (articles L217-3 et suivants du Code de la consommation) : en cas de défaut de conformité apparu dans les <strong>2 ans</strong> suivant la livraison, le Client peut obtenir la réparation ou le remplacement de l'article, ou à défaut une réduction du prix ou la résolution de la vente ;</li>
  <li>la <strong>garantie des vices cachés</strong> (articles 1641 à 1649 du Code civil) : action à exercer dans les 2 ans suivant la découverte du vice.</li>
</ul>
<p>${t("[À VÉRIFIER : insérer ici l'encadré officiel relatif à la garantie légale de conformité prévu par le décret n° 2022-946 du 29 juin 2022]")}</p>
<p>Pour toute demande au titre des garanties : ${mail}.</p>

<h2 id="donnees">10. Données personnelles</h2>
<p>Les données nécessaires au traitement des commandes sont traitées conformément à notre <a href="/confidentialite/">politique de confidentialité</a>.</p>

<h2 id="reclamations">11. Réclamations et médiation</h2>
<p>Toute réclamation peut être adressée à ${mail}. En cas de désaccord persistant après une réclamation écrite, le Client peut recourir gratuitement au médiateur de la consommation dont relève le Vendeur : <strong>${t(L.mediator.name)}</strong> — ${mediatorUrl}.</p>

<h2 id="droit">12. Droit applicable</h2>
<p>Les présentes CGV sont soumises au droit français. Le Client résidant dans un autre pays conserve le bénéfice des dispositions impératives de protection des consommateurs de son pays de résidence. À défaut d'accord amiable, le litige est porté devant la juridiction compétente selon les règles de droit commun.</p>

<h2 id="formulaire">Annexe — Formulaire de rétractation</h2>
<p>(À compléter et renvoyer uniquement si vous souhaitez vous rétracter.)</p>
<blockquote>
À l'attention de ${assoc}, ${t(L.address)}, ${mail} :<br><br>
Je/Nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la vente du bien ci-dessous :<br>
— Commandé le (*) / reçu le (*) :<br>
— Nom du (des) consommateur(s) :<br>
— Adresse du (des) consommateur(s) :<br>
— Signature du (des) consommateur(s) (uniquement en cas de notification du présent formulaire sur papier) :<br>
— Date :<br><br>
(*) Rayez la mention inutile.
</blockquote>
</div></div>`;

  // ------------------------------------------------------------ CONFIDENTIALITÉ
  const privacy = `${head("Informations", "Confidentialité &amp; cookies")}
<div class="container"><div class="prose">
${reviewNote}
${updated}

<h2>Responsable du traitement</h2>
<p>${assoc}, ${t(L.address)}. Contact pour toute question relative à vos données : ${mail}.</p>

<h2>Ce site ne collecte rien</h2>
<p>Ce site est une vitrine : il ne comporte ni compte client, ni formulaire envoyé à nos serveurs, ni outil de mesure d'audience, ni publicité. L'aperçu du flocage fonctionne uniquement dans votre navigateur : rien n'est transmis ni enregistré.</p>

<h2>Données liées aux commandes</h2>
<p>Lorsque vous cliquez sur « Acheter », vous êtes redirigé vers la page de paiement de Stripe. Les données suivantes y sont collectées pour le compte de l'association :</p>
<ul>
  <li>nom, adresse e-mail, adresse de livraison et de facturation ;</li>
  <li>${t("[À COMPLÉTER : numéro de téléphone, si vous l'avez activé dans Stripe]")} ;</li>
  <li>article commandé, taille, quantité et, le cas échéant, nom/pseudo et numéro de flocage ;</li>
  <li>données de paiement : traitées exclusivement par Stripe, jamais transmises à l'association.</li>
</ul>
<p><strong>Finalités :</strong> traitement, préparation et livraison des commandes, service après-vente, gestion des retours et respect de nos obligations comptables.</p>
<p><strong>Base légale :</strong> l'exécution du contrat de vente (article 6.1.b du RGPD) et le respect d'obligations légales (article 6.1.c).</p>
<p><strong>Durée de conservation :</strong> ${t("[À COMPLÉTER : ex. 3 ans après la dernière commande pour les données clients]")} ; ${t("[À COMPLÉTER : ex. 10 ans pour les pièces comptables]")}.</p>
<p><strong>Destinataires :</strong> les membres du staff habilités à préparer les commandes, Stripe (prestataire de paiement) et le transporteur chargé de la livraison (${t("[À COMPLÉTER : transporteur]")}).</p>

<h2>Transferts hors de l'Union européenne</h2>
<p>Stripe et Cloudflare (hébergeur du site) sont des sociétés ayant des activités aux États-Unis. Les transferts éventuels de données sont encadrés par les garanties prévues par le RGPD (notamment le cadre de protection des données UE–États-Unis et/ou les clauses contractuelles types de la Commission européenne). Voir la <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener">politique de confidentialité de Stripe</a>.</p>

<h2>Cookies et services tiers</h2>
<p><strong>Ce site ne dépose aucun cookie ni traceur</strong> : aucun bandeau de consentement n'est donc nécessaire.</p>
<ul>
  <li><strong>Police de caractères :</strong> la police Agency FB est chargée depuis les serveurs d'Adobe Fonts. À cette occasion, votre adresse IP est transmise à Adobe, ce qui est techniquement nécessaire à l'affichage de la police.</li>
  <li><strong>Hébergement :</strong> Cloudflare traite des données techniques de connexion (adresse IP, navigateur) pour acheminer les pages et protéger le site contre les attaques.</li>
  <li><strong>Page de paiement :</strong> Stripe utilise ses propres cookies, nécessaires au paiement et à la prévention de la fraude, sur ses pages uniquement.</li>
</ul>

<h2>Vos droits</h2>
<p>Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données. Pour les exercer, écrivez à ${mail}. Vous pouvez également introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener">www.cnil.fr</a>) ou de l'autorité de protection des données de votre pays de résidence.</p>
</div></div>`;

  return [
    { slug: "mentions-legales", title: "Mentions légales", description: `Mentions légales du site ${team.fullName}.`, body: mentions },
    { slug: "cgv", title: "Conditions générales de vente", description: `Conditions générales de vente de la boutique officielle ${team.fullName} : commande, livraison ${SHIPPING}, rétractation, garanties.`, body: cgv },
    { slug: "confidentialite", title: "Confidentialité & cookies", description: `Politique de confidentialité et cookies du site ${team.fullName}.`, body: privacy },
  ];
}
