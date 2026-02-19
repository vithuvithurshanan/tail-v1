import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Storage configuration for uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// --- EMPLOYEES ---
app.get('/api/employees', (req, res) => {
    const employees = db.prepare('SELECT * FROM employees ORDER BY created_at DESC').all();
    res.json(employees);
});

app.post('/api/employees', (req, res) => {
    const { id, name, age, contact, address, category } = req.body;
    try {
        db.prepare('INSERT INTO employees (id, name, age, contact, address, category) VALUES (?, ?, ?, ?, ?, ?)')
            .run(id, name, age, contact, address, category);
        res.status(201).json({ id, message: 'Employee added' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    const { name, age, contact, address, category } = req.body;
    try {
        db.prepare('UPDATE employees SET name = ?, age = ?, contact = ?, address = ?, category = ? WHERE id = ?')
            .run(name, age, contact, address, category, id);
        res.json({ message: 'Employee updated' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    try {
        db.prepare('DELETE FROM employees WHERE id = ?').run(id);
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/employees/:id/assignments', (req, res) => {
    const { id } = req.params;
    try {
        const assignments = db.prepare(`
            SELECT oa.*, o.delivery_date, o.status, o.category, c.name as customer_name
            FROM order_assignments oa
            JOIN orders o ON oa.order_id = o.id
            JOIN customers c ON o.customer_id = c.id
            WHERE oa.employee_id = ?
            ORDER BY o.created_at DESC
        `).all(id);
        res.json(assignments);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- CUSTOMERS ---
app.get('/api/customers', (req, res) => {
    const customers = db.prepare('SELECT * FROM customers ORDER BY created_at DESC').all();
    res.json(customers);
});

app.post('/api/customers', (req, res) => {
    const { id, name, contact, address } = req.body;
    try {
        db.prepare('INSERT INTO customers (id, name, contact, address) VALUES (?, ?, ?, ?)')
            .run(id, name, contact, address);
        res.status(201).json({ id, message: 'Customer added' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    const { name, contact, address } = req.body;
    try {
        db.prepare('UPDATE customers SET name = ?, contact = ?, address = ? WHERE id = ?')
            .run(name, contact, address, id);
        res.json({ message: 'Customer updated' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    try {
        db.prepare('DELETE FROM customers WHERE id = ?').run(id);
        res.json({ message: 'Customer deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/customers/:id/orders', (req, res) => {
    const { id } = req.params;
    try {
        const orders = db.prepare('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC').all(id);
        res.json(orders);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/customers/:id/measurements', (req, res) => {
    const { id } = req.params;
    try {
        const measurements = db.prepare('SELECT * FROM measurements WHERE customer_id = ?').all(id);
        res.json(measurements);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- INVENTORY ---
app.get('/api/inventory', (req, res) => {
    const items = db.prepare('SELECT * FROM inventory').all();
    res.json(items);
});

app.post('/api/inventory', (req, res) => {
    const { item_name, quantity, min_level, unit } = req.body;
    try {
        db.prepare('INSERT INTO inventory (item_name, quantity, min_level, unit) VALUES (?, ?, ?, ?)')
            .run(item_name, quantity, min_level, unit);
        res.status(201).json({ message: 'Item added' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    const { item_name, quantity, min_level, unit } = req.body;
    try {
        db.prepare('UPDATE inventory SET item_name = ?, quantity = ?, min_level = ?, unit = ? WHERE id = ?')
            .run(item_name, quantity, min_level, unit, id);
        res.json({ message: 'Inventory updated' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    try {
        db.prepare('DELETE FROM inventory WHERE id = ?').run(id);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- MEASUREMENTS ---
app.get('/api/measurements/:customer_id/:category', (req, res) => {
    const { customer_id, category } = req.params;
    try {
        const measurement = db.prepare('SELECT * FROM measurements WHERE customer_id = ? AND category = ?')
            .get(customer_id, category);
        res.json(measurement || null);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/measurements', (req, res) => {
    const { customer_id, category, values_json } = req.body;
    try {
        const existing = db.prepare('SELECT id FROM measurements WHERE customer_id = ? AND category = ?')
            .get(customer_id, category);

        const jsonStr = typeof values_json === 'string' ? values_json : JSON.stringify(values_json);

        if (existing) {
            db.prepare('UPDATE measurements SET values_json = ? WHERE id = ?')
                .run(jsonStr, existing.id);
        } else {
            db.prepare('INSERT INTO measurements (customer_id, category, values_json) VALUES (?, ?, ?)')
                .run(customer_id, category, jsonStr);
        }
        res.json({ message: 'Measurements saved' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- ORDERS & ASSIGNMENTS ---
app.get('/api/orders', (req, res) => {
    const orders = db.prepare(`
    SELECT o.*, c.name as customer_name,
    (SELECT GROUP_CONCAT(employee_id || ':' || role) FROM order_assignments WHERE order_id = o.id) as assignments_data
    FROM orders o 
    JOIN customers c ON o.customer_id = c.id 
    ORDER BY o.created_at DESC
  `).all();
    res.json(orders);
});

app.post('/api/orders', (req, res) => {
    const { id, customer_id, delivery_date, total_amount, advance_amount, assignments, category, measurements_json } = req.body;
    const insertOrder = db.prepare('INSERT INTO orders (id, customer_id, delivery_date, total_amount, advance_amount, category, measurements_json) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const insertAssign = db.prepare('INSERT INTO order_assignments (order_id, employee_id, role) VALUES (?, ?, ?)');

    const transaction = db.transaction(() => {
        insertOrder.run(id, customer_id, delivery_date, total_amount, advance_amount, category, measurements_json);
        if (assignments) {
            for (const a of assignments) {
                insertAssign.run(id, a.employee_id, a.role);
            }
        }
    });

    try {
        transaction();
        res.status(201).json({ id, message: 'Order created' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    try {
        db.prepare('DELETE FROM order_assignments WHERE order_id = ?').run(id);
        db.prepare('DELETE FROM orders WHERE id = ?').run(id);
        res.json({ message: 'Order deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- FINANCE ---
app.get('/api/finance/cheques', (req, res) => {
    const cheques = db.prepare('SELECT * FROM cheques ORDER BY due_date ASC').all();
    res.json(cheques);
});

app.post('/api/finance/cheques', upload.single('proof'), (req, res) => {
    const { cheque_number, amount, due_date, given_to } = req.body;
    const proof_path = req.file ? `/uploads/${req.file.filename}` : null;
    try {
        db.prepare('INSERT INTO cheques (cheque_number, amount, due_date, given_to, proof_path) VALUES (?, ?, ?, ?, ?)')
            .run(cheque_number, amount, due_date, given_to, proof_path);
        res.status(201).json({ message: 'Cheque record added' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/finance/utilities', (req, res) => {
    const utils = db.prepare('SELECT * FROM utilities ORDER BY due_date ASC').all();
    res.json(utils);
});

app.post('/api/finance/utilities', (req, res) => {
    const { type, amount, due_date } = req.body;
    try {
        db.prepare('INSERT INTO utilities (type, amount, due_date) VALUES (?, ?, ?)')
            .run(type, amount, due_date);
        res.status(201).json({ message: 'Utility bill added' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const { customer_id, delivery_date, total_amount, advance_amount, assignments, category, measurements_json } = req.body;

    const updateOrder = db.prepare('UPDATE orders SET customer_id = ?, delivery_date = ?, total_amount = ?, advance_amount = ?, category = ?, measurements_json = ? WHERE id = ?');
    const deleteAssign = db.prepare('DELETE FROM order_assignments WHERE order_id = ?');
    const insertAssign = db.prepare('INSERT INTO order_assignments (order_id, employee_id, role) VALUES (?, ?, ?)');

    const transaction = db.transaction(() => {
        updateOrder.run(customer_id, delivery_date, total_amount, advance_amount, category, measurements_json, id);
        deleteAssign.run(id);
        if (assignments) {
            for (const a of assignments) {
                insertAssign.run(id, a.employee_id, a.role);
            }
        }
    });

    try {
        transaction();
        res.json({ message: 'Order updated' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
        res.json({ message: 'Status updated' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/finance/utilities/:id/pay', (req, res) => {
    const { id } = req.params;
    try {
        db.prepare('UPDATE utilities SET status = "Paid" WHERE id = ?').run(id);
        res.json({ message: 'Bill marked as paid' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/finance/cheques/:id/pay', (req, res) => {
    const { id } = req.params;
    try {
        db.prepare('UPDATE cheques SET status = "Paid" WHERE id = ?').run(id);
        res.json({ message: 'Cheque marked as paid' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- DASHBOARD STATS ---
app.get('/api/stats', (req, res) => {
    try {
        const stats = {
            employees: db.prepare('SELECT COUNT(*) as count FROM employees').get().count,
            customers: db.prepare('SELECT COUNT(*) as count FROM customers').get().count,
            pendingOrders: db.prepare("SELECT COUNT(*) as count FROM orders WHERE status != 'Delivered'").get().count,
            lowStock: db.prepare('SELECT COUNT(*) as count FROM inventory WHERE quantity <= min_level').get().count,
            totalRevenue: db.prepare('SELECT SUM(total_amount) as total FROM orders').get().total || 0,
        };

        const recentOrders = db.prepare(`
            SELECT o.*, c.name as customer_name 
            FROM orders o 
            JOIN customers c ON o.customer_id = c.id 
            ORDER BY o.created_at DESC 
            LIMIT 5
        `).all();

        // Weekly orders chart data
        const weeklyData = db.prepare(`
      SELECT strftime('%w', created_at) as day, COUNT(*) as count 
      FROM orders 
      WHERE created_at >= date('now', '-7 days')
      GROUP BY day
    `).all();

        const dayMap = { '0': 'Sun', '1': 'Mon', '2': 'Tue', '3': 'Wed', '4': 'Thu', '5': 'Fri', '6': 'Sat' };
        const chartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(name => {
            const dayKey = Object.keys(dayMap).find(key => dayMap[key] === name);
            const dbDay = weeklyData.find(d => d.day === dayKey);
            return { name, orders: dbDay ? dbDay.count : 0 };
        });

        res.json({ ...stats, chartData, recentOrders });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
