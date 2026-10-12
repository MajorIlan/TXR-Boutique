# Guide Stripe — créer les 4 liens de paiement

Faites tout d'abord **en mode Test** (interrupteur « Environnement de test » dans le tableau de bord), vérifiez, puis refaites-le **en mode Live**. Les liens de test ne fonctionnent pas en Live.

> Les intitulés exacts de l'interface Stripe peuvent légèrement varier.

---

## Étape 1 — Réglages du compte (une seule fois)

1. **Paramètres → Image de marque** : ajoutez le logo, la couleur de marque `#1f6bff` et la couleur d'accent `#050b1c`. La page de paiement aura les couleurs de la team.
2. **Paramètres → Informations publiques** : renseignez le nom public, l'e-mail de support et ces deux adresses :
   - Conditions d'utilisation : `https://<votre-site>/cgv/`
   - Politique de confidentialité : `https://<votre-site>/confidentialite/`

   Elles sont **nécessaires** pour afficher la case « J'accepte les CGV ».
3. **Paramètres → E-mails clients** : activez **« Paiements réussis »**. Le client reçoit alors un reçu, qui vaut confirmation de commande (envoyé uniquement en mode Live).
4. **Notifications du staff** : dans les paramètres de notification de chaque membre, activez l'e-mail **« Paiements réussis »**. Installez aussi l'appli mobile Stripe pour être alerté de chaque vente.

## Étape 2 — Les produits

**Catalogue de produits → Ajouter un produit**, quatre fois. Paiement **ponctuel**, en EUR :

| Produit | Prix |
|---|---|
| Maillot officiel | 45 € |
| Maillot officiel floqué | 55 € |
| Veste officielle | 55 € |
| Bas officiel | 50 € |

Ajoutez la photo et une courte description : elles s'affichent sur la page de paiement.

## Étape 3 — Les liens de paiement

**Liens de paiement → Créer**, une fois par produit.

### Réglages communs aux 4 liens

- **Produit** : sélectionnez le produit.
- **Quantité ajustable** *(facultatif)* : min 1, max 5. Toutes les pièces d'un même paiement auront la même taille et le même flocage.
- **Collecter les adresses des clients** → *Adresses de facturation et de livraison*.
  - Pays : **France, Belgique, Suisse, Luxembourg**.
  - Tarif de livraison : votre tarif à **5 €** (déjà créé).
- **Champ personnalisé n° 1** :
  - Type : *Liste déroulante*
  - Libellé : `Taille`
  - Options : `XS, S, M, L, XL, XXL`
  - **Obligatoire**
- **Exiger l'acceptation des conditions d'utilisation** : activé.
- **Après le paiement** → *Ne pas afficher la page de confirmation* → rediriger vers `https://<votre-site>/merci/`

### En plus, pour le maillot floqué uniquement

Un lien Stripe accepte 3 champs personnalisés au maximum : c'est pile le compte.

- **Champ n° 2** :
  - Type : *Texte*
  - Libellé : `Nom / Pseudo (12 caractères max)`
  - **Obligatoire**
- **Champ n° 3** :
  - Type : *Chiffres uniquement*
  - Libellé : `Numéro (0 à 99)`
  - **Obligatoire**

> Si vous changez la longueur maximale ou la plage de numéros, mettez à jour `flocage` dans `site.config.js` pour que l'aperçu du site corresponde.

### Coller les liens dans le site

Copiez chaque lien (`https://buy.stripe.com/...`) dans `stripeLink` du produit correspondant, dans `site.config.js`. Le site ajoute automatiquement `?locale=fr` pour afficher la page en français.

## Étape 4 — Tester

En mode Test, payez avec la carte `4242 4242 4242 4242` (date future, n'importe quel CVC). Vérifiez ensuite :

1. Que la redirection vers `/merci/` fonctionne.
2. Que la taille, le flocage et l'adresse apparaissent dans **Paiements → [le paiement]**.

---

## Au quotidien : traiter les commandes

- **Voir une commande :** *Paiements* → cliquez sur le paiement. Vous y trouvez la taille, le nom/pseudo, le numéro (champs personnalisés), l'adresse de livraison et l'e-mail du client.
- **Liste à préparer :** *Paiements* → *Exporter* (CSV). Gardez la colonne des champs personnalisés pour la liste de flocage.
- **Rembourser / annuler :** depuis le paiement → *Rembourser*.
- **Taille épuisée :** modifiez le lien et retirez l'option de la liste déroulante. Ajoutez aussi la taille dans `unavailableSizes` sur le site.
- **Produit épuisé :** désactivez le lien et mettez `status: "epuise"` sur le site. Option : « Limiter le nombre de paiements » coupe le lien automatiquement après N ventes.
- **Suivi de livraison :** Stripe ne gère pas de statuts « Expédiée / Livrée ». Tenez-les dans un tableau partagé du staff, ou ajoutez une note sur le paiement dans Stripe.
