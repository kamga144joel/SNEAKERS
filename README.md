# SNEAKERS — E‑commerce Front‑End (Cameroun)

Projet front‑end de boutique de sneakers . Panier, paiement en mode démo (Carte, Mobile Money, PayPal), confirmation de commande, favoris, filtres/tri, modal produit, galerie, pages légales, et profil utilisateur local.

## Fonctionnalités
- Panier avec compteur, mini‑bar de total et toasts
- Paiements démo: `Carte`, `Mobile Money`, `PayPal` (sans débit réel)
- Partage commande: WhatsApp et e‑mail
- Confirmation de commande avec reçu imprimable
- Filtres: recherche, catégorie, tri prix, tags `Nouveau`/`Promo`
- Favoris (wishlist) stockés en `localStorage`
- Modal de détail produit et ajout au panier
- Compte: inscription/connexion démo (profil local), déconnexion, message de bienvenue
- Galerie d’images et mur d’icônes de services
- Pages légales (mentions, confidentialité, conditions de vente, remboursement)
- Accessibilité: `aria-live`, `role=status`, tabs accessibles

## Aperçu local
- Lancer le serveur: `python -m http.server 5500`
- Ouvrir: `http://localhost:5500/`

## Structure
- `index.html`: sections, cartes produits, modals, légales, galerie
- `style.css`: styles globaux, filtres, modals, badges, icônes
- `app.js`: panier, paiement démo, filtres, favoris, modal, compte, confirmation

## Démo paiement
- Carte: validation Luhn côté client
- Mobile Money: validation numéro Cameroun
- PayPal: simulation côté client
- Aucun débit réel, tout fonctionne sans serveur

## Compte démo
- Inscription: nom, e‑mail, téléphone, adresse (stockés localement)
- Connexion: e‑mail pour recharger le profil
- Déconnexion: efface l’e‑mail courant, conserve les profils

## Déploiement
- Front‑end statique — peut être publié sur GitHub Pages ou tout hébergeur statique

## Repository
- GitHub: https://github.com/kamga144joel/SNEAKERS

## Associer le projet au dépôt
Dans le répertoire du projet:

```powershell
# Initialiser (si nécessaire)
git init

# Ajouter ou mettre à jour le remote origin
git remote add origin https://github.com/kamga144joel/SNEAKERS 2>$null || git remote set-url origin https://github.com/kamga144joel/SNEAKERS

# Vérifier
git remote -v
```

## Pousser (optionnel)
```powershell
git add .
git commit -m "Initial import"
git branch -M main
git push -u origin main
```
