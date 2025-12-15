// Exemples d'implémentation Backend - SNEAKERS
// Node.js + Express + PostgreSQL

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Configuration base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ===== MODELS =====

class User {
  static async create(userData) {
    const { email, name, phone, address, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (email, name, phone, address, password_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, name, phone, address, created_at
    `;
    
    const values = [email, name, phone, address, hashedPassword];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }
  
  static async findById(id) {
    const query = 'SELECT id, email, name, phone, address, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

class Product {
  static async create(productData) {
    const { title, description, price, category, image_url, is_new, is_promo, stock } = productData;
    
    const query = `
      INSERT INTO products (title, description, price, category, image_url, is_new, is_promo, stock)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [title, description, price, category, image_url, is_new, is_promo, stock];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM products WHERE 1=1';
    const values = [];
    let paramIndex = 1;
    
    if (filters.category && filters.category !== 'all') {
      query += ` AND category = $${paramIndex}`;
      values.push(filters.category);
      paramIndex++;
    }
    
    if (filters.search) {
      query += ` AND title ILIKE $${paramIndex}`;
      values.push(`%${filters.search}%`);
      paramIndex++;
    }
    
    if (filters.tag === 'new') {
      query += ` AND is_new = true`;
    } else if (filters.tag === 'promo') {
      query += ` AND is_promo = true`;
    }
    
    // Tri
    if (filters.sort === 'price_asc') {
      query += ' ORDER BY price ASC';
    } else if (filters.sort === 'price_desc') {
      query += ' ORDER BY price DESC';
    } else {
      query += ' ORDER BY created_at DESC';
    }
    
    const result = await pool.query(query, values);
    return result.rows;
  }
  
  static async findById(id) {
    const query = 'SELECT * FROM products WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
  
  static async updateStock(id, quantity) {
    const query = `
      UPDATE products 
      SET stock = stock - $1, updated_at = NOW()
      WHERE id = $2 AND stock >= $1
      RETURNING *
    `;
    const result = await pool.query(query, [quantity, id]);
    return result.rows[0];
  }
}

class Cart {
  static async findByUserId(userId) {
    const query = `
      SELECT c.*, ci.*, p.title, p.price, p.image_url
      FROM carts c
      LEFT JOIN cart_items ci ON c.id = ci.cart_id
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE c.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
  
  static async addItem(userId, productId, quantity) {
    // Récupérer ou créer le panier
    let cartQuery = 'SELECT id FROM carts WHERE user_id = $1';
    let cartResult = await pool.query(cartQuery, [userId]);
    
    let cartId;
    if (cartResult.rows.length === 0) {
      const createCartQuery = 'INSERT INTO carts (user_id) VALUES ($1) RETURNING id';
      const newCart = await pool.query(createCartQuery, [userId]);
      cartId = newCart.rows[0].id;
    } else {
      cartId = cartResult.rows[0].id;
    }
    
    // Vérifier si le produit est déjà dans le panier
    const existingQuery = 'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2';
    const existingResult = await pool.query(existingQuery, [cartId, productId]);
    
    if (existingResult.rows.length > 0) {
      // Mettre à jour la quantité
      const updateQuery = `
        UPDATE cart_items 
        SET quantity = quantity + $1, updated_at = NOW()
        WHERE cart_id = $2 AND product_id = $3
        RETURNING *
      `;
      const result = await pool.query(updateQuery, [quantity, cartId, productId]);
      return result.rows[0];
    } else {
      // Ajouter nouvel article
      const product = await Product.findById(productId);
      const insertQuery = `
        INSERT INTO cart_items (cart_id, product_id, quantity, unit_price)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const values = [cartId, productId, quantity, product.price];
      const result = await pool.query(insertQuery, values);
      return result.rows[0];
    }
  }
}

class Order {
  static async create(orderData) {
    const { userId, items, paymentMethod, shippingAddress } = orderData;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Créer la commande
      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const orderQuery = `
        INSERT INTO orders (user_id, status, total_amount, payment_method, shipping_address, order_date)
        VALUES ($1, 'pending', $2, $3, $4, NOW())
        RETURNING *
      `;
      const orderResult = await client.query(orderQuery, [userId, totalAmount, paymentMethod, shippingAddress]);
      const order = orderResult.rows[0];
      
      // Ajouter les articles de commande
      for (const item of items) {
        const orderItemQuery = `
          INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5)
        `;
        await client.query(orderItemQuery, [
          order.id, 
          item.productId, 
          item.quantity, 
          item.price, 
          item.price * item.quantity
        ]);
        
        // Mettre à jour le stock
        await Product.updateStock(item.productId, item.quantity);
      }
      
      await client.query('COMMIT');
      return order;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  static async findByUserId(userId) {
    const query = `
      SELECT o.*, oi.quantity, oi.unit_price, oi.total_price,
             p.title, p.image_url
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      ORDER BY o.order_date DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}

// ===== ROUTES =====

// Authentification
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, phone, address, password } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }
    
    const user = await User.create({ email, name, phone, address, password });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    const { password_hash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Produits
app.get('/api/products', async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      search: req.query.search,
      tag: req.query.tag,
      sort: req.query.sort
    };
    
    const products = await Product.findAll(filters);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Panier
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const cartItems = await Cart.findByUserId(req.user.userId);
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cart/items', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cartItem = await Cart.addItem(req.user.userId, productId, quantity);
    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Commandes
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items, paymentMethod, shippingAddress } = req.body;
    
    const order = await Order.create({
      userId: req.user.userId,
      items,
      paymentMethod,
      shippingAddress
    });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.findByUserId(req.user.userId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Démarrage serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;
