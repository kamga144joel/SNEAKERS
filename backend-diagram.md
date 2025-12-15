# Diagramme de Classes Backend - SNEAKERS

## Architecture des Données

```mermaid
erDiagram
    USER {
        string id PK
        string email UK
        string name
        string phone
        string address
        datetime created_at
        datetime updated_at
    }
    
    PRODUCT {
        string id PK
        string title
        text description
        decimal price
        string category
        string image_url
        boolean is_new
        boolean is_promo
        integer stock
        datetime created_at
        datetime updated_at
    }
    
    CATEGORY {
        string id PK
        string name UK
        text description
        string image_url
        boolean is_active
        datetime created_at
        datetime updated_at
    }
    
    CART {
        string id PK
        string user_id FK
        datetime created_at
        datetime updated_at
    }
    
    CART_ITEM {
        string id PK
        string cart_id FK
        string product_id FK
        integer quantity
        decimal unit_price
        datetime created_at
    }
    
    ORDER {
        string id PK
        string user_id FK
        string status
        decimal total_amount
        string payment_method
        string shipping_address
        datetime order_date
        datetime created_at
        datetime updated_at
    }
    
    ORDER_ITEM {
        string id PK
        string order_id FK
        string product_id FK
        integer quantity
        decimal unit_price
        decimal total_price
    }
    
    PAYMENT {
        string id PK
        string order_id FK
        string method
        decimal amount
        string status
        string transaction_id
        datetime payment_date
        datetime created_at
    }
    
    WISHLIST {
        string id PK
        string user_id FK
        datetime created_at
        datetime updated_at
    }
    
    WISHLIST_ITEM {
        string id PK
        string wishlist_id FK
        string product_id FK
        datetime added_at
    }
    
    REVIEW {
        string id PK
        string product_id FK
        string user_id FK
        integer rating
        text comment
        datetime created_at
        datetime updated_at
    }

    USER ||--o{ CART : owns
    USER ||--o{ ORDER : places
    USER ||--o{ WISHLIST : has
    USER ||--o{ REVIEW : writes
    
    CART ||--o{ CART_ITEM : contains
    CART_ITEM }o--|| PRODUCT : references
    
    ORDER ||--o{ ORDER_ITEM : contains
    ORDER ||--|| PAYMENT : has
    ORDER_ITEM }o--|| PRODUCT : references
    
    WISHLIST ||--o{ WISHLIST_ITEM : contains
    WISHLIST_ITEM }o--|| PRODUCT : references
    
    PRODUCT }o--|| CATEGORY : belongs_to
    PRODUCT ||--o{ REVIEW : receives
```

## Description des Entités

### User (Utilisateur)
- **id**: Identifiant unique
- **email**: Email unique pour connexion
- **name**: Nom complet
- **phone**: Téléphone (format camerounais)
- **address**: Adresse de livraison
- **created_at/updated_at**: Timestamps

### Product (Produit)
- **id**: Identifiant unique
- **title**: Nom du produit
- **description**: Description détaillée
- **price**: Prix en FCFA
- **category**: Catégorie (Lifestyle, Running, etc.)
- **image_url**: URL de l'image
- **is_new**: Badge "Nouveau"
- **is_promo**: Badge "Promo"
- **stock**: Quantité disponible

### Category (Catégorie)
- **id**: Identifiant unique
- **name**: Nom unique
- **description**: Description
- **image_url**: Image de la catégorie
- **is_active**: Catégorie active/inactive

### Cart & CartItem (Panier)
- **Cart**: Panier par utilisateur
- **CartItem**: Articles dans le panier avec quantité

### Order & OrderItem (Commande)
- **Order**: Commande avec statut et paiement
- **OrderItem**: Détails des produits commandés

### Payment (Paiement)
- **method**: carte, mobile, paypal, cod
- **status**: pending, completed, failed
- **transaction_id**: ID de transaction

### Wishlist & WishlistItem (Favoris)
- **Wishlist**: Liste de favoris par utilisateur
- **WishlistItem**: Produits en favoris

### Review (Avis)
- **rating**: Note 1-5 étoiles
- **comment**: Commentaire utilisateur
- **created_at**: Date de l'avis

## API Endpoints Suggérés

### Users
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/users/profile` - Profil
- `PUT /api/users/profile` - Mise à jour

### Products
- `GET /api/products` - Liste avec filtres
- `GET /api/products/:id` - Détail produit
- `GET /api/categories` - Categories
- `POST /api/products` - Créer produit (admin)

### Cart
- `GET /api/cart` - Panier utilisateur
- `POST /api/cart/items` - Ajouter article
- `PUT /api/cart/items/:id` - Modifier quantité
- `DELETE /api/cart/items/:id` - Supprimer article

### Orders
- `GET /api/orders` - Historique commandes
- `POST /api/orders` - Créer commande
- `GET /api/orders/:id` - Détail commande

### Payments
- `POST /api/payments/process` - Traiter paiement
- `GET /api/payments/:id` - Statut paiement

### Wishlist
- `GET /api/wishlist` - Favoris
- `POST /api/wishlist/items` - Ajouter favori
- `DELETE /api/wishlist/items/:id` - Supprimer favori

## Technologies Recommandées

### Backend
- **Node.js + Express** ou **Python + Django/FastAPI**
- **PostgreSQL** pour la base de données
- **Redis** pour le cache et sessions
- **JWT** pour l'authentification

### Paiements
- **Stripe** pour cartes bancaires
- **Orange Money/MTN APIs** pour Mobile Money
- **PayPal SDK** pour PayPal

### Infrastructure
- **Docker** pour containerisation
- **AWS/Azure/GCP** pour hébergement
- **Cloudinary** pour images
- **SendGrid** pour emails

## Sécurité

- **Hashage mot de passe** (bcrypt)
- **Validation inputs** (express-validator)
- **Rate limiting** (express-rate-limit)
- **CORS** configuré
- **HTTPS** obligatoire
- **JWT tokens** avec expiration
