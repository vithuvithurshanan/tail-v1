import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './firebase.js';

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
app.get('/api/employees', async (req, res) => {
    try {
        const snapshot = await db.collection('employees').orderBy('created_at', 'desc').get();
        const employees = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/employees', async (req, res) => {
    const { id, name, age, contact, address, category } = req.body;
    try {
        await db.collection('employees').doc(id).set({
            name, age, contact, address, category,
            created_at: new Date().toISOString()
        });
        res.status(201).json({ id, message: 'Employee added' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    const { name, age, contact, address, category } = req.body;
    try {
        await db.collection('employees').doc(id).update({ name, age, contact, address, category });
        res.json({ message: 'Employee updated' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.collection('employees').doc(id).delete();
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
app.get('/api/customers', async (req, res) => {
    try {
        const snapshot = await db.collection('customers').orderBy('created_at', 'desc').get();
        const customers = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/customers', async (req, res) => {
    const { id, name, contact, address } = req.body;
    try {
        await db.collection('customers').doc(id).set({
            name, contact, address,
            created_at: new Date().toISOString()
        });
        res.status(201).json({ id, message: 'Customer added' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/customers/:id', async (req, res) => {
    const { id } = req.params;
    const { name, contact, address } = req.body;
    try {
        await db.collection('customers').doc(id).update({ name, contact, address });
        res.json({ message: 'Customer updated' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/customers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.collection('customers').doc(id).delete();
        res.json({ message: 'Customer deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/customers/:id/orders', async (req, res) => {
    const { id } = req.params;
    try {
        const snapshot = await db.collection('orders').where('customer_id', '==', id).orderBy('created_at', 'desc').get();
        const orders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        res.json(orders);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/customers/:id/measurements', async (req, res) => {
    const { id } = req.params;
    try {
        const snapshot = await db.collection('measurements').where('customer_id', '==', id).get();
        const measurements = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        res.json(measurements);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- SUPPLIERS ---
app.get('/api/suppliers', async (req, res) => {
    try {
        const snapshot = await db.collection('suppliers').orderBy('name', 'asc').get();
        const suppliers = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/suppliers', async (req, res) => {
    const { name, contact, address, notes } = req.body;
    try {
        const docRef = await db.collection('suppliers').add({
            name, contact, address, notes,
            created_at: new Date().toISOString()
        });
        res.status(201).json({ id: docRef.id, message: 'Supplier added' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/suppliers/:id', async (req, res) => {
    const { id } = req.params;
    const { name, contact, address, notes } = req.body;
    try {
        await db.collection('suppliers').doc(id).update({ name, contact, address, notes });
        res.json({ message: 'Supplier updated' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/suppliers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.collection('suppliers').doc(id).delete();
        res.json({ message: 'Supplier deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- INVENTORY ---
app.get('/api/inventory', async (req, res) => {
    try {
        const snapshot = await db.collection('inventory').orderBy('item_name', 'asc').get();
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/inventory', async (req, res) => {
    const { item_name, quantity, min_level, unit, supplier_id, cost_price } = req.body;
    try {
        let supplier_name = null;
        if (supplier_id) {
            const sDoc = await db.collection('suppliers').doc(supplier_id).get();
            if (sDoc.exists) supplier_name = sDoc.data().name;
        }

        await db.collection('inventory').add({
            item_name,
            quantity: Number(quantity) || 0,
            min_level: Number(min_level) || 5,
            unit,
            supplier_id: supplier_id || null,
            supplier_name,
            cost_price: Number(cost_price) || 0,
            updated_at: new Date().toISOString()
        });
        res.status(201).json({ message: 'Item added' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/inventory/:id', async (req, res) => {
    const { id } = req.params;
    const { item_name, quantity, min_level, unit, supplier_id, cost_price } = req.body;
    try {
        let supplier_name = null;
        if (supplier_id) {
            const sDoc = await db.collection('suppliers').doc(supplier_id).get();
            if (sDoc.exists) supplier_name = sDoc.data().name;
        }

        await db.collection('inventory').doc(id).update({
            item_name,
            quantity: Number(quantity),
            min_level: Number(min_level),
            unit,
            supplier_id: supplier_id || null,
            supplier_name,
            cost_price: Number(cost_price),
            updated_at: new Date().toISOString()
        });
        res.json({ message: 'Inventory updated' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/inventory/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.collection('inventory').doc(id).delete();
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- MEASUREMENTS ---
app.get('/api/measurements/:customer_id/:category', async (req, res) => {
    const { customer_id, category } = req.params;
    try {
        const snapshot = await db.collection('measurements')
            .where('customer_id', '==', customer_id)
            .where('category', '==', category)
            .limit(1)
            .get();

        if (snapshot.empty) return res.json(null);
        res.json({ ...snapshot.docs[0].data(), id: snapshot.docs[0].id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/measurements', async (req, res) => {
    const { customer_id, category, values_json } = req.body;
    try {
        const snapshot = await db.collection('measurements')
            .where('customer_id', '==', customer_id)
            .where('category', '==', category)
            .limit(1)
            .get();

        const data = {
            customer_id,
            category,
            values_json: typeof values_json === 'string' ? values_json : JSON.stringify(values_json),
            updated_at: new Date().toISOString()
        };

        if (!snapshot.empty) {
            await db.collection('measurements').doc(snapshot.docs[0].id).update(data);
        } else {
            await db.collection('measurements').add(data);
        }
        res.json({ message: 'Measurements saved' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- ORDERS & ASSIGNMENTS ---
app.get('/api/orders', async (req, res) => {
    try {
        const snapshot = await db.collection('orders').orderBy('created_at', 'desc').get();
        const orders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    const { id, customer_id, delivery_date, total_amount, advance_amount, assignments, category, measurements_json, dress_color } = req.body;
    try {
        // Fetch customer name for denormalization
        const cDoc = await db.collection('customers').doc(customer_id).get();
        const customer_name = cDoc.exists ? cDoc.data().name : 'Unknown';

        const orderData = {
            customer_id,
            customer_name,
            delivery_date,
            total_amount: Number(total_amount),
            advance_amount: Number(advance_amount),
            category,
            measurements_json,
            dress_color: dress_color || '',
            status: 'Pending',
            assignments: assignments || [],
            created_at: new Date().toISOString()
        };

        await db.collection('orders').doc(id).set(orderData);
        res.status(201).json({ id, message: 'Order created' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.collection('orders').doc(id).delete();
        res.json({ message: 'Order deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- FINANCE ---
app.get('/api/finance/cheques', async (req, res) => {
    try {
        const snapshot = await db.collection('cheques').orderBy('due_date', 'asc').get();
        const cheques = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        res.json(cheques);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/finance/cheques', upload.single('proof'), async (req, res) => {
    const { cheque_number, amount, due_date, given_to } = req.body;
    const proof_path = req.file ? `/uploads/${req.file.filename}` : null;
    try {
        await db.collection('cheques').add({
            cheque_number,
            amount: Number(amount),
            due_date,
            given_to,
            proof_path,
            status: 'Pending',
            created_at: new Date().toISOString()
        });
        res.status(201).json({ message: 'Cheque record added' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/finance/utilities', async (req, res) => {
    try {
        const snapshot = await db.collection('utilities').orderBy('due_date', 'asc').get();
        const utils = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        res.json(utils);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/finance/utilities', async (req, res) => {
    const { type, amount, due_date } = req.body;
    try {
        await db.collection('utilities').add({
            type,
            amount: Number(amount),
            due_date,
            status: 'Unpaid',
            created_at: new Date().toISOString()
        });
        res.status(201).json({ message: 'Utility bill added' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/orders/:id', async (req, res) => {
    const { id } = req.params;
    const { customer_id, delivery_date, total_amount, advance_amount, assignments, category, measurements_json, dress_color } = req.body;

    try {
        const cDoc = await db.collection('customers').doc(customer_id).get();
        const customer_name = cDoc.exists ? cDoc.data().name : 'Unknown';

        await db.collection('orders').doc(id).update({
            customer_id,
            customer_name,
            delivery_date,
            total_amount: Number(total_amount),
            advance_amount: Number(advance_amount),
            assignments: assignments || [],
            category,
            measurements_json,
            dress_color: dress_color || ''
        });
        res.json({ message: 'Order updated' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/orders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const orderRef = db.collection('orders').doc(id);
        const orderDoc = await orderRef.get();
        if (!orderDoc.exists) return res.status(404).json({ error: 'Order not found' });

        await orderRef.update({ status });

        res.json({
            message: 'Status updated',
            isDelivered: status === 'Delivered',
            incomeAdded: status === 'Delivered' ? orderDoc.data().total_amount : 0
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/finance/utilities/:id/pay', async (req, res) => {
    const { id } = req.params;
    try {
        await db.collection('utilities').doc(id).update({ status: 'Paid' });
        res.json({ message: 'Bill marked as paid' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/finance/cheques/:id/pay', async (req, res) => {
    const { id } = req.params;
    try {
        await db.collection('cheques').doc(id).update({ status: 'Paid' });
        res.json({ message: 'Cheque marked as paid' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- SALARY MANAGEMENT ---
app.get('/api/finance/salaries', async (req, res) => {
    try {
        const snapshot = await db.collection('salaries').orderBy('payment_date', 'desc').get();
        const salaries = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        res.json(salaries);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/finance/salaries', async (req, res) => {
    const { employee_id, amount, month, payment_date, type, notes, pay_period } = req.body;
    try {
        const eDoc = await db.collection('employees').doc(employee_id).get();
        const employee_name = eDoc.exists ? eDoc.data().name : 'Unknown';

        await db.collection('salaries').add({
            employee_id,
            employee_name,
            amount: Number(amount),
            month,
            payment_date,
            type,
            notes,
            pay_period,
            created_at: new Date().toISOString()
        });
        res.status(201).json({ message: 'Salary payment recorded' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- DASHBOARD STATS ---
app.get('/api/stats', async (req, res) => {
    try {
        const empCount = (await db.collection('employees').count().get()).data().count;
        const custCount = (await db.collection('customers').count().get()).data().count;
        const pendingOrdersSnapshot = await db.collection('orders').where('status', '!=', 'Delivered').get();
        const lowStockSnapshot = await db.collection('inventory').get();

        const pendingOrdersCount = pendingOrdersSnapshot.size;
        const lowStockCount = lowStockSnapshot.docs.filter(doc => doc.data().quantity <= doc.data().min_level).length;

        // Calculate Revenue
        const allOrdersSnapshot = await db.collection('orders').get();
        let totalRevenue = 0;
        let balanceDue = 0;

        allOrdersSnapshot.forEach(doc => {
            const order = doc.data();
            if (order.status === 'Delivered') {
                totalRevenue += Number(order.total_amount) || 0;
            } else {
                totalRevenue += Number(order.advance_amount) || 0;
                balanceDue += (Number(order.total_amount) || 0) - (Number(order.advance_amount) || 0);
            }
        });

        const recentOrdersSnapshot = await db.collection('orders').orderBy('created_at', 'desc').limit(5).get();
        const recentOrders = recentOrdersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        // Weekly Chart Data (Mocking for now as complex Firestore date filtering needs care)
        const chartData = [
            { name: 'Mon', orders: 0 },
            { name: 'Tue', orders: 0 },
            { name: 'Wed', orders: 0 },
            { name: 'Thu', orders: 0 },
            { name: 'Fri', orders: 0 },
            { name: 'Sat', orders: 0 },
            { name: 'Sun', orders: 0 },
        ];

        res.json({
            employees: empCount,
            customers: custCount,
            pendingOrders: pendingOrdersCount,
            lowStock: lowStockCount,
            totalRevenue,
            balanceDue,
            chartData,
            recentOrders
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ATTENDANCE ---
app.get('/api/attendance/today', async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    try {
        const empSnapshot = await db.collection('employees').orderBy('name').get();
        const employees = empSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        const attnSnapshot = await db.collection('attendance').where('date', '==', today).get();
        const attendance = attnSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        const tasksSnapshot = await db.collection('task_entries').where('date', '==', today).get();
        const allTasks = tasksSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        const result = employees.map(emp => {
            const record = attendance.find(a => a.employee_id === emp.id);
            const empTasks = allTasks.filter(t => t.employee_id === emp.id);

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
app.post('/api/attendance/mark', async (req, res) => {
    const { employee_id, status } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const id = `${employee_id}_${today}`;
    try {
        await db.collection('attendance').doc(id).set({
            employee_id,
            date: today,
            status: status || 'Present',
            marked_at: new Date().toISOString()
        }, { merge: true });
        res.json({ message: 'Attendance marked', date: today });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get active orders (for task assignment dropdown)
app.get('/api/attendance/orders/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    try {
        const snapshot = await db.collection('orders').where('status', '!=', 'Delivered').get();
        const orders = snapshot.docs.map(doc => {
            const data = doc.data();
            const isAssigned = data.assignments?.some(a => a.employee_id === employeeId);
            return {
                id: doc.id,
                customer_name: data.customer_name,
                category: data.category,
                status: data.status,
                assigned: isAssigned ? 1 : 0
            };
        });

        // Sort by assigned status (assigned first)
        orders.sort((a, b) => b.assigned - a.assigned);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add task entry (linked to order)
app.post('/api/attendance/tasks', async (req, res) => {
    const { employee_id, order_id } = req.body;
    const today = new Date().toISOString().split('T')[0];
    try {
        await db.collection('task_entries').add({
            employee_id,
            order_id,
            date: today,
            created_at: new Date().toISOString()
        });

        // Ensure attendance is marked
        const attnId = `${employee_id}_${today}`;
        await db.collection('attendance').doc(attnId).set({
            employee_id,
            date: today,
            status: 'Present',
            marked_at: new Date().toISOString()
        }, { merge: true });

        res.json({ message: 'Task added', date: today });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Remove task entry
app.delete('/api/attendance/tasks/:taskId', async (req, res) => {
    try {
        await db.collection('task_entries').doc(req.params.taskId).delete();
        res.json({ message: 'Task removed' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Unmark attendance (remove today's record)
app.delete('/api/attendance/:employeeId', async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const id = `${req.params.employeeId}_${today}`;
    try {
        await db.collection('attendance').doc(id).delete();
        res.json({ message: 'Attendance removed' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Weekly summary: each employee's attendance count for this week (Mon-Sun)
app.get('/api/attendance/weekly', async (req, res) => {
    try {
        const empSnapshot = await db.collection('employees').orderBy('name').get();
        const employees = empSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        const now = new Date();
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(now);
        monday.setDate(now.getDate() + mondayOffset);
        const mondayStr = monday.toISOString().split('T')[0];

        const sundayDate = new Date(monday);
        sundayDate.setDate(monday.getDate() + 6);
        const sundayStr = sundayDate.toISOString().split('T')[0];

        const attnSnapshot = await db.collection('attendance')
            .where('date', '>=', mondayStr)
            .where('date', '<=', sundayStr)
            .get();
        const weekAttendance = attnSnapshot.docs.map(doc => doc.data());

        const tasksSnapshot = await db.collection('task_entries')
            .where('date', '>=', mondayStr)
            .where('date', '<=', sundayStr)
            .get();
        const weekTasks = tasksSnapshot.docs.map(doc => doc.data());

        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push(d.toISOString().split('T')[0]);
        }

        const result = employees.map(emp => {
            const empRecords = weekAttendance.filter(a => a.employee_id === emp.id);
            const empTasks = weekTasks.filter(t => t.employee_id === emp.id);

            const dayStatuses = days.map(day => {
                const rec = empRecords.find(r => r.date === day);
                const dayTaskCount = empTasks.filter(t => t.date === day).length;
                return { date: day, status: rec?.status || null, tasks: dayTaskCount };
            });

            const presentCount = empRecords.filter(r => r.status === 'Present').length;
            const halfDayCount = empRecords.filter(r => r.status === 'Half-Day').length;
            const totalTasks = empTasks.length;

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
