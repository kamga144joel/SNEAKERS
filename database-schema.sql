-- =============================================
-- SNEAKERS E-commerce Database Schema
-- Compatible MySQL Workbench
-- =============================================

-- CREATE DATABASE IF NOT EXISTS sneakers_db;
-- USE sneakers_db;

-- =============================================
-- TABLE: users
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: categories
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: products
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id VARCHAR(36),
    image_url VARCHAR(500),
    is_new BOOLEAN DEFAULT FALSE,
    is_promo BOOLEAN DEFAULT FALSE,
    stock INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_title (title),
    INDEX idx_category (category_id),
    INDEX idx_price (price),
    INDEX idx_is_new (is_new),
    INDEX idx_is_promo (is_promo),
    INDEX idx_is_active (is_active),
    INDEX idx_stock (stock),
    FULLTEXT idx_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: carts
-- =============================================
CREATE TABLE IF NOT EXISTS carts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: cart_items
-- =============================================
CREATE TABLE IF NOT EXISTS cart_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    cart_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_product (cart_id, product_id),
    INDEX idx_cart_id (cart_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: orders
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('card', 'mobile', 'paypal', 'cod') NOT NULL,
    shipping_address TEXT NOT NULL,
    billing_address TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipped_date TIMESTAMP NULL,
    delivered_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date),
    INDEX idx_payment_method (payment_method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: order_items
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: payments
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id VARCHAR(36) NOT NULL UNIQUE,
    method ENUM('card', 'mobile', 'paypal', 'cod') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    gateway_response TEXT,
    payment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: wishlists
-- =============================================
CREATE TABLE IF NOT EXISTS wishlists (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: wishlist_items
-- =============================================
CREATE TABLE IF NOT EXISTS wishlist_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    wishlist_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist_product (wishlist_id, product_id),
    INDEX idx_wishlist_id (wishlist_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: reviews
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_user (product_id, user_id),
    INDEX idx_product_id (product_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: addresses (pour adresses multiples)
-- =============================================
CREATE TABLE IF NOT EXISTS addresses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    type ENUM('shipping', 'billing') NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Cameroun',
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: sessions (pour gestion sessions)
-- =============================================
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(36),
    ip_address VARCHAR(45),
    user_agent TEXT,
    payload TEXT NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_last_activity (last_activity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- VIEWS (Vue pour statistiques et rapports)
-- =============================================

-- Vue pour les produits avec notes moyennes
CREATE OR REPLACE VIEW product_stats AS
SELECT 
    p.id,
    p.title,
    p.price,
    p.category_id,
    c.name as category_name,
    COUNT(r.id) as review_count,
    COALESCE(AVG(r.rating), 0) as average_rating,
    COUNT(oi.id) as order_count,
    SUM(oi.quantity) as total_sold
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN reviews r ON p.id = r.product_id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
GROUP BY p.id, p.title, p.price, p.category_id, c.name;

-- Vue pour les statistiques utilisateurs
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(DISTINCT o.id) as order_count,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    COUNT(DISTINCT r.id) as review_count,
    u.created_at
FROM users u
LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
LEFT JOIN reviews r ON u.id = r.user_id
GROUP BY u.id, u.name, u.email, u.created_at;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger pour mettre à jour le stock lors des commandes
DELIMITER //
CREATE TRIGGER update_product_stock_after_order
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE products 
    SET stock = stock - NEW.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;
END//
DELIMITER ;

-- Trigger pour annuler la mise à jour du stock si suppression order_item
DELIMITER //
CREATE TRIGGER restore_product_stock_after_order_item_delete
AFTER DELETE ON order_items
FOR EACH ROW
BEGIN
    UPDATE products 
    SET stock = stock + OLD.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.product_id;
END//
DELIMITER ;

-- =============================================
-- PROCEDURES STOCKEES
-- =============================================

DELIMITER //
-- Procédure pour obtenir les produits les plus vendus
CREATE PROCEDURE GetTopSellingProducts(IN limit_count INT)
BEGIN
    SELECT 
        p.id,
        p.title,
        p.price,
        p.image_url,
        SUM(oi.quantity) as total_sold,
        COUNT(DISTINCT oi.order_id) as order_count
    FROM products p
    JOIN order_items oi ON p.id = oi.product_id
    JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
    GROUP BY p.id, p.title, p.price, p.image_url
    ORDER BY total_sold DESC
    LIMIT limit_count;
END//
DELIMITER ;

DELIMITER //
-- Procédure pour obtenir les statistiques de ventes par période
CREATE PROCEDURE GetSalesStats(IN start_date DATE, IN end_date DATE)
BEGIN
    SELECT 
        DATE(o.order_date) as sale_date,
        COUNT(o.id) as order_count,
        SUM(o.total_amount) as total_revenue,
        AVG(o.total_amount) as average_order_value
    FROM orders o
    WHERE o.order_date BETWEEN start_date AND end_date
        AND o.status != 'cancelled'
    GROUP BY DATE(o.order_date)
    ORDER BY sale_date;
END//
DELIMITER ;

-- =============================================
-- DONNÉES DE TEST (OPTIONNEL)
-- =============================================

-- Insérer des catégories de test
INSERT IGNORE INTO categories (id, name, description) VALUES
('cat-1', 'Lifestyle', 'Sneakers pour le quotidien et le style urbain'),
('cat-2', 'Running', 'Sneakers pour la course et l\'entraînement'),
('cat-3', 'Basketball', 'Sneakers pour le basketball et les sports indoor'),
('cat-4', 'Skate', 'Sneakers pour le skateboard et sports extrêmes'),
('cat-5', 'Outdoor', 'Sneakers pour les activités extérieures'),
('cat-6', 'Training', 'Sneakers pour l\'entraînement en salle');

-- =============================================
-- INDEX COMPLÉMENTAIRES POUR PERFORMANCE
-- =============================================

-- Index composites pour requêtes fréquentes
CREATE INDEX idx_orders_user_status_date ON orders(user_id, status, order_date);
CREATE INDEX idx_products_category_active ON products(category_id, is_active);
CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);
CREATE INDEX idx_reviews_product_rating ON reviews(product_id, rating);

-- =============================================
-- CONCLUSIONS
-- =============================================
-- 
-- Ce schéma est optimisé pour :
-- - Performance avec des index appropriés
-- - Intégrité référentielle avec clés étrangères
-- - Scalabilité avec UUID comme primary keys
-- - Audit avec timestamps automatiques
-- - Sécurité avec contraintes CHECK
-- - Reporting avec vues et procédures stockées
-- 
-- Compatible avec MySQL 8.0+ et MariaDB 10.5+
-- Peut être importé directement dans MySQL Workbench
