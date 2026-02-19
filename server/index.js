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

// --- SUPPLIERS ---
app.get('/api/suppliers', (req, res) => {
    const suppliers = db.prepare('SELECT * FROM suppliers ORDER BY name ASC').all();
    res.json(suppliers);
});

app.post('/api/suppliers', (req, res) => {
    const { name, contact, address, notes } = req.body;
    try {
        const result = db.prepare('INSERT INTO suppliers (name, contact, address, notes) VALUES (?, ?, ?, ?)')
            .run(name, contact, address, notes);
        res.status(201).json({ id: result.lastInsertRowid, message: 'Supplier added' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/suppliers/:id', (req, res) => {
    const { id } = req.params;
    const { name, contact, address, notes } = req.body;
    try {
        db.prepare('UPDATE suppliers SET name = ?, contact = ?, address = ?, notes = ? WHERE id = ?')
            .run(name, contact, address, notes, id);
        res.json({ message: 'Supplier updated' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/suppliers/:id', (req, res) => {
    const { id } = req.params;
    try {
        db.prepare('DELETE FROM suppliers WHERE id = ?').run(id);
        res.json({ message: 'Supplier deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- INVENTORY ---
app.get('/api/inventory', (req, res) => {
    const items = db.prepare(`
        SELECT i.*, s.name as supplier_name
        FROM inventory i
        LEFT JOIN suppliers s ON i.supplier_id = s.id
        ORDER BY i.item_name ASC
    `).all();
    res.json(items);
});

app.post('/api/inventory', (req, res) => {
    const { item_name, quantity, min_level, unit, supplier_id, cost_price } = req.body;
    try {
        db.prepare('INSERT INTO inventory (item_name, quantity, min_level, unit, supplier_id, cost_price) VALUES (?, ?, ?, ?, ?, ?)')
            .run(item_name, quantity, min_level, unit, supplier_id || null, cost_price || 0);
        res.status(201).json({ message: 'Item added' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    const { item_name, quantity, min_level, unit, supplier_id, cost_price } = req.body;
    try {
        db.prepare('UPDATE inventory SET item_name = ?, quantity = ?, min_level = ?, unit = ?, supplier_id = ?, cost_price = ? WHERE id = ?')
            .run(item_name, quantity, min_level, unit, supplier_id || null, cost_price || 0, id);
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
    const { id, customer_id, delivery_date, total_amount, advance_amount, assignments, category, measurements_json, dress_color } = req.body;
    const insertOrder = db.prepare('INSERT INTO orders (id, customer_id, delivery_date, total_amount, advance_amount, category, measurements_json, dress_color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const insertAssign = db.prepare('INSERT INTO order_assignments (order_id, employee_id, role) VALUES (?, ?, ?)');

    const transaction = db.transaction(() => {
        insertOrder.run(id, customer_id, delivery_date, total_amount, advance_amount, category, measurements_json, dress_color || '');
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
    const { customer_id, delivery_date, total_amount, advance_amount, assignments, category, measurements_json, dress_color } = req.body;

    const updateOrder = db.prepare('UPDATE orders SET customer_id = ?, delivery_date = ?, total_amount = ?, advance_amount = ?, category = ?, measurements_json = ?, dress_color = ? WHERE id = ?');
    const deleteAssign = db.prepare('DELETE FROM order_assignments WHERE order_id = ?');
    const insertAssign = db.prepare('INSERT INTO order_assignments (order_id, employee_id, role) VALUES (?, ?, ?)');

    const transaction = db.transaction(() => {
        updateOrder.run(customer_id, delivery_date, total_amount, advance_amount, category, measurements_json, dress_color || '', id);
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
        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);

        // When marked Delivered, the full total_amount counts as income
        // (tracked via delivered orders in stats - no extra table needed)
        res.json({
            message: 'Status updated',
            isDelivered: status === 'Delivered',
            incomeAdded: status === 'Delivered' ? order.total_amount : 0
        });
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

// --- SALARY MANAGEMENT ---
app.get('/api/finance/salaries', (req, res) => {
    try {
        const salaries = db.prepare(`
            SELECT s.*, e.name as employee_name 
            FROM employee_salaries s
            JOIN employees e ON s.employee_id = e.id
            ORDER BY s.payment_date DESC
        `).all();
        res.json(salaries);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/finance/salaries', (req, res) => {
    const { employee_id, amount, month, payment_date, type, notes, pay_period } = req.body;
    try {
        db.prepare(`
            INSERT INTO employee_salaries (employee_id, amount, month, payment_date, type, notes, pay_period)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(employee_id, amount, month, payment_date, type, notes, pay_period);
        res.status(201).json({ message: 'Salary payment recorded' });
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
            // Total income = advances collected from ALL orders + full total from DELIVERED orders
            totalRevenue: (() => {
                const advanceFromPending = db.prepare("SELECT COALESCE(SUM(advance_amount), 0) as total FROM orders WHERE status != 'Delivered'").get().total || 0;
                const fullFromDelivered = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = 'Delivered'").get().total || 0;
                return advanceFromPending + fullFromDelivered;
            })(),
            // Balance due = sum of (total - advance) for all non-delivered orders (outstanding payments)
            balanceDue: db.prepare("SELECT COALESCE(SUM(total_amount - advance_amount), 0) as total FROM orders WHERE status != 'Delivered'").get().total || 0,
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

// --- ATTENDANCE ---

// Get today's attendance for all employees
app.get('/api/attendance/today', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    try {
        const employees = db.prepare('SELECT id, name, category FROM employees ORDER BY name').all();
        const attendance = db.prepare('SELECT * FROM attendance WHERE date = ?').all(today);

        const result = employees.map(emp => {
            const record = attendance.find(a => a.employee_id === emp.id);
            const empTasks = db.prepare(`
                SELECT t.id, t.order_id, o.customer_name, o.category
                FROM task_entries t
                LEFT JOIN (
                    SELECT o.id, c.name as customer_name, o.category
                    FROM orders o JOIN customers c ON o.customer_id = c.id
                ) o ON t.order_id = o.id
                WHERE t.employee_id = ? AND t.date = ?
                ORDER BY t.created_at DESC
            `).all(emp.id, today);
            return {
                ...emp,
                attendance_id: record?.id || null,
                status: record?.status || null,
                tasks_completed: empTasks.length,
                task_entries: empTasks,
                marked: !!record
            };
        });
        res.json({ date: today, employees: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark attendance (today only)
app.post('/api/attendance/mark', (req, res) => {
    const { employee_id, status } = req.body;
    const today = new Date().toISOString().split('T')[0];
    try {
        // Upsert: insert or replace
        db.prepare(`
            INSERT INTO attendance (employee_id, date, status)
            VALUES (?, ?, ?)
            ON CONFLICT(employee_id, date) DO UPDATE SET status = ?, marked_at = CURRENT_TIMESTAMP
        `).run(employee_id, today, status || 'Present', status || 'Present');
        res.json({ message: 'Attendance marked', date: today });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get active orders (for task assignment dropdown)
app.get('/api/attendance/orders/:employeeId', (req, res) => {
    try {
        // Get orders assigned to this employee first, then other active orders
        const assignedOrders = db.prepare(`
            SELECT DISTINCT o.id, c.name as customer_name, o.category, o.status, 1 as assigned
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            JOIN order_assignments oa ON oa.order_id = o.id
            WHERE oa.employee_id = ? AND o.status != 'Delivered'
            ORDER BY o.created_at DESC
        `).all(req.params.employeeId);

        const otherOrders = db.prepare(`
            SELECT o.id, c.name as customer_name, o.category, o.status, 0 as assigned
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            WHERE o.status != 'Delivered'
            AND o.id NOT IN (SELECT order_id FROM order_assignments WHERE employee_id = ?)
            ORDER BY o.created_at DESC
        `).all(req.params.employeeId);

        res.json([...assignedOrders, ...otherOrders]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add task entry (linked to order)
app.post('/api/attendance/tasks', (req, res) => {
    const { employee_id, order_id } = req.body;
    const today = new Date().toISOString().split('T')[0];
    try {
        db.prepare('INSERT INTO task_entries (employee_id, order_id, date) VALUES (?, ?, ?)').run(employee_id, order_id, today);
        // Also ensure attendance is marked as Present
        db.prepare(`
            INSERT INTO attendance (employee_id, date, status)
            VALUES (?, ?, 'Present')
            ON CONFLICT(employee_id, date) DO NOTHING
        `).run(employee_id, today);
        res.json({ message: 'Task added', date: today });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Remove task entry
app.delete('/api/attendance/tasks/:taskId', (req, res) => {
    try {
        db.prepare('DELETE FROM task_entries WHERE id = ?').run(req.params.taskId);
        res.json({ message: 'Task removed' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Unmark attendance (remove today's record)
app.delete('/api/attendance/:employeeId', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    try {
        db.prepare('DELETE FROM attendance WHERE employee_id = ? AND date = ?').run(req.params.employeeId, today);
        res.json({ message: 'Attendance removed' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Weekly summary: each employee's attendance count for this week (Mon-Sun)
app.get('/api/attendance/weekly', (req, res) => {
    try {
        const employees = db.prepare('SELECT id, name, category FROM employees ORDER BY name').all();

        // Get start of current week (Monday)
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(now);
        monday.setDate(now.getDate() + mondayOffset);
        const mondayStr = monday.toISOString().split('T')[0];

        const sundayDate = new Date(monday);
        sundayDate.setDate(monday.getDate() + 6);
        const sundayStr = sundayDate.toISOString().split('T')[0];

        const weekAttendance = db.prepare(`
            SELECT employee_id, date, status, tasks_completed
            FROM attendance
            WHERE date >= ? AND date <= ?
            ORDER BY date
        `).all(mondayStr, sundayStr);

        // Build day labels Mon-Sun
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push(d.toISOString().split('T')[0]);
        }

        const result = employees.map(emp => {
            const empRecords = weekAttendance.filter(a => a.employee_id === emp.id);
            const dayStatuses = days.map(day => {
                const rec = empRecords.find(r => r.date === day);
                const dayTaskCount = db.prepare('SELECT COUNT(*) as cnt FROM task_entries WHERE employee_id = ? AND date = ?').get(emp.id, day).cnt;
                return { date: day, status: rec?.status || null, tasks: dayTaskCount };
            });
            const presentCount = empRecords.filter(r => r.status === 'Present').length;
            const halfDayCount = empRecords.filter(r => r.status === 'Half-Day').length;
            const totalTasks = days.reduce((sum, day) => {
                return sum + db.prepare('SELECT COUNT(*) as cnt FROM task_entries WHERE employee_id = ? AND date = ?').get(emp.id, day).cnt;
            }, 0);
            return {
                ...emp,
                days: dayStatuses,
                presentCount,
                halfDayCount,
                totalDays: presentCount + (halfDayCount * 0.5),
                totalTasks
            };
        });

        res.json({ weekStart: mondayStr, weekEnd: sundayStr, days, employees: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
