import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'mandi_deals.db');

let db;

export const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Database connection error:', err);
        reject(err);
      } else {
        console.log('✅ SQLite Database connected');
        createTables().then(resolve).catch(reject);
      }
    });
  });
};

const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          phone TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          email TEXT,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'customer',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating users table:', err);
      });

      // Customer profiles table
      db.run(`
        CREATE TABLE IF NOT EXISTS customer_profiles (
          id TEXT PRIMARY KEY,
          user_id TEXT UNIQUE NOT NULL,
          tier TEXT DEFAULT 'Silver',
          total_purchases DECIMAL(10,2) DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) console.error('Error creating profiles table:', err);
      });

      // Products table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          price DECIMAL(8,2) NOT NULL,
          current_stock DECIMAL(10,2) NOT NULL,
          unit TEXT DEFAULT 'kg',
          status TEXT DEFAULT 'in-stock',
          vendor_name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating products table:', err);
      });

      // Wallets table
      db.run(`
        CREATE TABLE IF NOT EXISTS wallets (
          id TEXT PRIMARY KEY,
          customer_id TEXT UNIQUE NOT NULL,
          available_points INT DEFAULT 0,
          redeemable_points INT DEFAULT 0,
          remaining_points INT DEFAULT 0,
          total_points_earned INT DEFAULT 0,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(customer_id) REFERENCES customer_profiles(id)
        )
      `, (err) => {
        if (err) console.error('Error creating wallets table:', err);
      });

      // Transactions table
      db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          customer_id TEXT,
          staff_id TEXT NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          discount_amount DECIMAL(10,2) DEFAULT 0,
          points_used INT DEFAULT 0,
          points_earned INT DEFAULT 0,
          payment_method TEXT,
          status TEXT DEFAULT 'completed',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(customer_id) REFERENCES customer_profiles(id),
          FOREIGN KEY(staff_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) console.error('Error creating transactions table:', err);
      });

      // Transaction items table
      db.run(`
        CREATE TABLE IF NOT EXISTS transaction_items (
          id TEXT PRIMARY KEY,
          transaction_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          quantity DECIMAL(10,2) NOT NULL,
          unit_price DECIMAL(8,2) NOT NULL,
          total_price DECIMAL(10,2) NOT NULL,
          FOREIGN KEY(transaction_id) REFERENCES transactions(id),
          FOREIGN KEY(product_id) REFERENCES products(id)
        )
      `, (err) => {
        if (err) console.error('Error creating items table:', err);
      });

      // Sessions/Tokens table
      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) console.error('Error creating sessions table:', err);
      });

      // Wishlist table
      db.run(`
        CREATE TABLE IF NOT EXISTS wishlist (
          id TEXT PRIMARY KEY,
          customer_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(customer_id, product_id),
          FOREIGN KEY(customer_id) REFERENCES customer_profiles(id),
          FOREIGN KEY(product_id) REFERENCES products(id)
        )
      `, (err) => {
        if (err) console.error('Error creating wishlist table:', err);
      });

      // Discounts table
      db.run(`
        CREATE TABLE IF NOT EXISTS discounts (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          type TEXT NOT NULL,
          value DECIMAL(10,2) NOT NULL,
          applicable_to TEXT,
          is_active INTEGER DEFAULT 1,
          created_by TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(created_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) console.error('Error creating discounts table:', err);
      });

      // Discount applications (which products have which discounts)
      db.run(`
        CREATE TABLE IF NOT EXISTS discount_applications (
          id TEXT PRIMARY KEY,
          discount_id TEXT NOT NULL,
          product_id TEXT,
          category TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(discount_id) REFERENCES discounts(id),
          FOREIGN KEY(product_id) REFERENCES products(id)
        )
      `, (err) => {
        if (err) console.error('Error creating discount_applications table:', err);
      });

      // Insert seed data
      insertSeedData().then(() => seedAdminUser()).then(resolve).catch(reject);
    });
  });
};

const insertSeedData = () => {
  return new Promise((resolve, reject) => {
    // Check if data already exists
    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count > 0) {
        console.log('📊 Database already has sample data');
        resolve();
        return;
      }

      console.log('📝 Inserting sample data...');

      db.serialize(() => {
        // Sample products
        const products = [
          { id: 'prod-1', name: 'Tomatoes', category: 'Vegetables', price: 40, current_stock: 100, unit: 'kg', vendor: 'Fresh Farms' },
          { id: 'prod-2', name: 'Potatoes', category: 'Vegetables', price: 25, current_stock: 200, unit: 'kg', vendor: 'Green Valley' },
          { id: 'prod-3', name: 'Onions', category: 'Vegetables', price: 30, current_stock: 150, unit: 'kg', vendor: 'Fresh Farms' },
          { id: 'prod-4', name: 'Apples', category: 'Fruits', price: 80, current_stock: 50, unit: 'piece', vendor: 'Orchard Fresh' },
          { id: 'prod-5', name: 'Bananas', category: 'Fruits', price: 50, current_stock: 75, unit: 'dozen', vendor: 'Tropical Farms' },
          { id: 'prod-6', name: 'Carrots', category: 'Vegetables', price: 35, current_stock: 120, unit: 'kg', vendor: 'Fresh Farms' },
          { id: 'prod-7', name: 'Mangoes', category: 'Fruits', price: 100, current_stock: 30, unit: 'piece', vendor: 'Mango House' },
          { id: 'prod-8', name: 'Lettuce', category: 'Vegetables', price: 45, current_stock: 60, unit: 'bunch', vendor: 'Green Valley' },
          { id: 'prod-9', name: 'Grapes', category: 'Fruits', price: 120, current_stock: 40, unit: 'kg', vendor: 'Orchard Fresh' },
          { id: 'prod-10', name: 'Broccoli', category: 'Vegetables', price: 55, current_stock: 80, unit: 'piece', vendor: 'Fresh Farms' },
        ];

        products.forEach(product => {
          db.run(
            'INSERT INTO products (id, name, category, price, current_stock, unit, vendor_name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [product.id, product.name, product.category, product.price, product.current_stock, product.unit, product.vendor, 'in-stock'],
            (err) => {
              if (err && !err.message.includes('UNIQUE')) {
                console.error('Error inserting product:', err);
              }
            }
          );
        });

        resolve();
      });
    });
  });
};

const seedAdminUser = () => {
  return new Promise((resolve, reject) => {
    // Check if admin already exists
    db.get('SELECT * FROM users WHERE phone = ?', ['0000000001'], async (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row) {
        console.log('👤 Admin user already exists');
        resolve();
        return;
      }

      console.log('👤 Creating admin user...');
      const adminPassword = await hashPassword('admin@2026');
      db.run(
        'INSERT INTO users (id, phone, name, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        ['admin-001', '0000000001', 'Admin', adminPassword, 'admin'],
        (err) => {
          if (err) {
            console.error('Error creating admin user:', err);
            reject(err);
          } else {
            console.log('✅ Admin user created successfully');
            console.log('   🔑 Admin ID: 0000000001');
            console.log('   🔐 Password: admin@2026');
            resolve();
          }
        }
      );
    });
  });
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

// Helper function to run queries with promises
export const runQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

// Helper function to get single record
export const getRecord = (query, params = []) => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Helper function to get multiple records
export const getRecords = (query, params = []) => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

export default {
  initializeDatabase,
  getDatabase,
  runQuery,
  getRecord,
  getRecords
};
