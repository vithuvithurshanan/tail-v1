import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../data/tailor.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    contact TEXT UNIQUE NOT NULL,
    address TEXT,
    category TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT UNIQUE NOT NULL,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g., Shirt, Frock
    values_json TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    category TEXT,
    measurements_json TEXT,
    status TEXT DEFAULT 'Pending', -- Pending, Cutting, Stitching, Finished, Delivered
    delivery_date DATE,
    advance_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS order_assignments (
    order_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    role TEXT NOT NULL, -- Cutter, Stitcher
    PRIMARY KEY (order_id, employee_id, role),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
  );

  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact TEXT,
    address TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT UNIQUE NOT NULL,
    quantity INTEGER DEFAULT 0,
    min_level INTEGER DEFAULT 5,
    unit TEXT,
    supplier_id INTEGER,
    cost_price DECIMAL(10,2) DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
  );

  CREATE TABLE IF NOT EXISTS cheques (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cheque_number TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    given_to TEXT,
    proof_path TEXT,
    status TEXT DEFAULT 'Pending'
  );

  CREATE TABLE IF NOT EXISTS utilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- Electricity, Water, EPF, etc.
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'Unpaid'
  );

  CREATE TABLE IF NOT EXISTS employee_salaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    month TEXT NOT NULL, -- e.g., 'October 2026'
    payment_date DATE NOT NULL,
    type TEXT DEFAULT 'Full Salary', -- Full Salary, Advance, Bonus
    pay_period TEXT DEFAULT 'Monthly', -- Daily, Weekly, Monthly
    notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
  );
`);

// Safely add new columns to existing inventory table (migration)
try { db.exec('ALTER TABLE inventory ADD COLUMN supplier_id INTEGER REFERENCES suppliers(id)'); } catch (e) { }
try { db.exec('ALTER TABLE inventory ADD COLUMN cost_price DECIMAL(10,2) DEFAULT 0'); } catch (e) { }

// Safely add dress_color to orders (migration)
try { db.exec("ALTER TABLE orders ADD COLUMN dress_color TEXT DEFAULT ''"); } catch (e) { }

export default db;
