# Boutique officielle TXR — site vitrine

Site 100 % statique : il présente les produits, et chaque bouton **« Acheter »** ouvre la page de paiement **Stripe** du produit (Payment Link). Le paiement, la taille, le flocage, l'adresse de livraison et les reçus sont gérés par Stripe.

**Coût :** 0 € d'hébergement (Cloudflare Pages). Seule la commission Stripe s'applique sur chaque vente.

---

## 1. Ce qu'il y a dans le dossier

| Fichier / dossier | À quoi ça sert | Vous le modifiez ? |
|---|---|---|
| `site.config.js` | **Tout le contenu** : nom, slogan, produits, prix, liens Stripe, roster, réseaux, infos légales | **Oui, c'est le fichier principal** |
| `src/assets/css/theme.css` | Couleurs et police | Oui, pour changer l'identité |
| `src/assets/img/` | Logo, photos produits, image de partage | Oui, pour remplacer les visuels |
| `src/legal.mjs` | Textes des mentions légales, CGV, confidentialité | Rarement |
| `build.mjs`, `serve.mjs`, `src/assets/css/main.css`, `src/assets/js/main.js` | Moteur du site | Non (sauf développeur) |
| `dist/` | **Site final généré**, celui qui est mis en ligne | Non, il est régénéré automatiquement |

Tout ce qui est surligné **en jaune** sur le site est un `[À COMPLÉTER]` de `site.config.js`. Rien de juridique n'a été inventé.

---

## 2. Modifications courantes

Toutes se font dans **`site.config.js`**.

- **Ajouter les liens Stripe :** collez chaque lien dans `stripeLink: "https://buy.stripe.com/..."`. Tant qu'un lien est vide, le bouton affiche « Bientôt disponible ».
- **Changer un prix :** modifiez `price` **ET** le prix dans Stripe. C'est Stripe qui encaisse : le prix du site sert seulement à l'affichage.
- **Produit épuisé :** `status: "epuise"`, puis désactivez le lien dans Stripe.
- **Taille épuisée :** ajoutez-la dans `unavailableSizes: ["XS"]`, et retirez-la de la liste déroulante du lien Stripe.
- **Remplacer une photo :** déposez l'image dans `src/assets/img/produits/` et changez le chemin dans `images`. Format conseillé : 1600 × 2000 px (portrait 4:5), JPG ou WebP, moins de 300 Ko.
- **Logo :** remplacez `src/assets/img/logo.svg` (gardez le même nom, ou changez `team.logo`). Remplacez aussi `favicon.svg`, `favicon-32.png` et `apple-touch-icon.png`.
- **Image de partage** (aperçu Discord, X…) : `src/assets/img/og-image.png`, 1200 × 630 px.
- **Couleurs :** `src/assets/css/theme.css`, variables `--primary`, `--background`, etc.
- **Réseaux sociaux :** remplissez les `url`. Un réseau sans URL est masqué.
- **Adresse du site :** si l'adresse finale n'est pas `txr-boutique.pages.dev`, mettez-la dans `siteUrl`. Elle sert au référencement et aux aperçus de partage.

---

## 3. Mise en ligne (gratuite) sur Cloudflare Pages

### Option A — avec GitHub (recommandée)

Une fois en place, il suffit de modifier `site.config.js` directement sur github.com. Le site se met à jour tout seul en 1 minute, sans rien installer sur l'ordinateur.

1. Sur **github.com**, créez un dépôt (privé possible), par exemple `txr-boutique`.
2. Envoyez-y tout le contenu de ce dossier **sauf** `dist/`. Avec GitHub Desktop : *Add existing repository* → *Publish*. Ou par glisser-déposer : *Add file* → *Upload files*.
3. Sur **dash.cloudflare.com** (compte gratuit) : **Workers & Pages** → **Créer** → onglet **Pages** → **Se connecter à Git** → choisissez le dépôt.
4. Réglages de build :
   - **Framework preset :** `None`
   - **Commande de build :** `npm run build`
   - **Répertoire de sortie :** `dist`
5. **Enregistrer et déployer.** Le site est en ligne sur `https://<nom-du-projet>.pages.dev`.

### Option B — sans GitHub (glisser-déposer)

1. **dash.cloudflare.com** → **Workers & Pages** → **Créer** → **Pages** → **Importer des ressources** (*Upload assets*).
2. Nommez le projet `txr-boutique` et glissez le dossier **`dist`**.

À chaque modification, il faut régénérer `dist/` (`npm run build`, Node.js requis) puis le renvoyer.

### Ensuite

- Si l'adresse obtenue diffère de `txr-boutique.pages.dev`, mettez-la à jour dans `siteUrl`.
- **Ancien site** (GitHub Pages) : remplacez sa page d'accueil par un lien ou une redirection vers la nouvelle adresse.
- **Domaine personnalisé** (optionnel, payant, environ 10 à 15 €/an) : Cloudflare Pages → *Domaines personnalisés*.

---

## 4. Aperçu en local (facultatif)

Il faut [Node.js](https://nodejs.org) 18 ou plus récent.

```
npm run dev
```

Puis ouvrez http://localhost:8080. Le terminal liste aussi les champs restant à compléter.

---

## 5. Avant l'ouverture : check-list

- [ ] Les 4 liens Stripe créés **en mode Live** et collés dans `site.config.js` (voir `GUIDE-STRIPE.md`)
- [ ] Prix identiques sur le site et dans Stripe
- [ ] Vraies photos des produits
- [ ] Vrai logo, slogan, roster et réseaux
- [ ] Infos légales complétées : nom de l'association, RNA, siège, président(e), e-mail, téléphone, mention TVA, **médiateur de la consommation**, délais, transporteur, adresse de retour
- [ ] CGV, mentions légales et confidentialité relues
- [ ] Une commande test réelle passée de bout en bout (puis remboursée depuis Stripe)
