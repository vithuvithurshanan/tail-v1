import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, setDoc, where, limit, getCountFromServer, getDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Service to handle all database operations directly from frontend
// This replaces the backend Express server completely, allowing stay on Spark (Free) plan.

export const employeeService = {
    getAll: async () => {
        const q = query(collection(db, "employees"), orderBy("created_at", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    },
    add: async (id, data) => {
        await setDoc(doc(db, "employees", id), {
            ...data,
            created_at: new Date().toISOString()
        });
        return { id };
    },
    update: async (id, data) => {
        await updateDoc(doc(db, "employees", id), data);
    },
    delete: async (id) => {
        await deleteDoc(doc(db, "employees", id));
    },
    getAssignments: async (id) => {
        const q = query(collection(db, "orders"), where("assignments", "array-contains", { employee_id: id }));
        // Note: Field path matching for objects in arrays is tricky in Firestore. 
        // Simplest way: Fetch recent orders and filter in frontend OR denormalize assignments.
        // For now, let's fetch all orders and filter manually since the dataset is small.
        const snap = await getDocs(collection(db, "orders"));
        return snap.docs
            .map(d => ({ ...d.data(), id: d.id }))
            .filter(o => o.assignments?.some(a => a.employee_id === id));
    }
};

export const customerService = {
    getAll: async () => {
        const q = query(collection(db, "customers"), orderBy("created_at", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    },
    add: async (id, data) => {
        await setDoc(doc(db, "customers", id), {
            ...data,
            created_at: new Date().toISOString()
        });
        return { id };
    },
    update: async (id, data) => {
        await updateDoc(doc(db, "customers", id), data);
    },
    delete: async (id) => {
        await deleteDoc(doc(db, "customers", id));
    },
    getOrders: async (customerId) => {
        const q = query(collection(db, "orders"), where("customer_id", "==", customerId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    },
    getMeasurements: async (customerId) => {
        const q = query(collection(db, "measurements"), where("customer_id", "==", customerId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    }
};

export const measurementService = {
    get: async (customerId, category) => {
        const q = query(collection(db, "measurements"),
            where("customer_id", "==", customerId),
            where("category", "==", category),
            limit(1));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return { ...snapshot.docs[0].data(), id: snapshot.docs[0].id };
    },
    save: async (data) => {
        const q = query(collection(db, "measurements"),
            where("customer_id", "==", data.customer_id),
            where("category", "==", data.category),
            limit(1));
        const snapshot = await getDocs(q);
        const docData = {
            ...data,
            updated_at: new Date().toISOString()
        };
        if (!snapshot.empty) {
            await updateDoc(doc(db, "measurements", snapshot.docs[0].id), docData);
        } else {
            await addDoc(collection(db, "measurements"), docData);
        }
    }
};

export const orderService = {
    getAll: async () => {
        const q = query(collection(db, "orders"), orderBy("created_at", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    },
    add: async (id, data) => {
        // Fetch customer name for denormalization
        const cSnap = await getDoc(doc(db, "customers", data.customer_id));
        const customer_name = cSnap.exists() ? cSnap.data().name : "Unknown";

        await setDoc(doc(db, "orders", id), {
            ...data,
            customer_name,
            total_amount: Number(data.total_amount),
            advance_amount: Number(data.advance_amount),
            status: "Pending",
            created_at: new Date().toISOString()
        });
    },
    update: async (id, data) => {
        await updateDoc(doc(db, "orders", id), data);
    },
    updateStatus: async (id, status) => {
        await updateDoc(doc(db, "orders", id), { status });
    },
    delete: async (id) => {
        await deleteDoc(doc(db, "orders", id));
    }
};

export const inventoryService = {
    getAll: async () => {
        const q = query(collection(db, "inventory"), orderBy("item_name", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    },
    add: async (data) => {
        let supplier_name = null;
        if (data.supplier_id) {
            const sDoc = await getDoc(doc(db, "suppliers", data.supplier_id));
            if (sDoc.exists()) supplier_name = sDoc.data().name;
        }
        await addDoc(collection(db, "inventory"), {
            ...data,
            quantity: Number(data.quantity),
            min_level: Number(data.min_level),
            cost_price: Number(data.cost_price),
            supplier_name,
            updated_at: new Date().toISOString()
        });
    },
    update: async (id, data) => {
        await updateDoc(doc(db, "inventory", id), data);
    },
    delete: async (id) => {
        await deleteDoc(doc(db, "inventory", id));
    }
};

export const supplierService = {
    getAll: async () => {
        const q = query(collection(db, "suppliers"), orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    },
    add: async (data) => {
        await addDoc(collection(db, "suppliers"), {
            ...data,
            created_at: new Date().toISOString()
        });
    },
    update: async (id, data) => {
        await updateDoc(doc(db, "suppliers", id), data);
    },
    delete: async (id) => {
        await deleteDoc(doc(db, "suppliers", id));
    }
};

export const financeService = {
    getCheques: async () => {
        const q = query(collection(db, "cheques"), orderBy("due_date", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    },
    addCheque: async (data) => {
        await addDoc(collection(db, "cheques"), {
            ...data,
            amount: Number(data.amount),
            status: "Pending",
            created_at: new Date().toISOString()
        });
    },
    payCheque: async (id) => {
        await updateDoc(doc(db, "cheques", id), { status: "Paid" });
    },
    getUtilities: async () => {
        const q = query(collection(db, "utilities"), orderBy("due_date", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    },
    addUtility: async (data) => {
        await addDoc(collection(db, "utilities"), {
            ...data,
            amount: Number(data.amount),
            status: "Unpaid",
            created_at: new Date().toISOString()
        });
    },
    payUtility: async (id) => {
        await updateDoc(doc(db, "utilities", id), { status: "Paid" });
    },
    getSalaries: async () => {
        const q = query(collection(db, "salaries"), orderBy("payment_date", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    },
    addSalary: async (data) => {
        const eDoc = await getDoc(doc(db, "employees", data.employee_id));
        const employee_name = eDoc.exists() ? eDoc.data().name : "Unknown";
        await addDoc(collection(db, "salaries"), {
            ...data,
            employee_name,
            amount: Number(data.amount),
            created_at: new Date().toISOString()
        });
    }
};

export const attendanceService = {
    getToday: async () => {
        const today = new Date().toISOString().split('T')[0];
        const empSnapshot = await getDocs(query(collection(db, "employees"), orderBy("name")));
        const employees = empSnapshot.docs.map(d => ({ ...d.data(), id: d.id }));

        const attnSnapshot = await getDocs(query(collection(db, "attendance"), where("date", "==", today)));
        const attendance = attnSnapshot.docs.map(d => ({ ...d.data(), id: d.id }));

        const tasksSnapshot = await getDocs(query(collection(db, "task_entries"), where("date", "==", today)));
        const allTasks = tasksSnapshot.docs.map(d => ({ ...d.data(), id: d.id }));

        return {
            date: today,
            employees: employees.map(emp => {
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
            })
        };
    },
    mark: async ({ employee_id, status }) => {
        const today = new Date().toISOString().split('T')[0];
        const id = `${employee_id}_${today}`;
        await setDoc(doc(db, "attendance", id), {
            employee_id,
            date: today,
            status: status || "Present",
            marked_at: new Date().toISOString()
        }, { merge: true });
    },
    unmark: async (employeeId) => {
        const today = new Date().toISOString().split('T')[0];
        await deleteDoc(doc(db, "attendance", `${employeeId}_${today}`));
    },
    getOrdersForEmployee: async (employeeId) => {
        const q = query(collection(db, "orders"), where("status", "in", ["Pending", "Cutting", "Stitching"]));
        const snapshot = await getDocs(q);
        return snapshot.docs
            .map(d => ({ ...d.data(), id: d.id }))
            .filter(o => o.assignments?.some(a => a.employee_id === employeeId));
    },
    addTask: async ({ employee_id, order_id }) => {
        const today = new Date().toISOString().split('T')[0];
        await addDoc(collection(db, "task_entries"), {
            employee_id,
            order_id,
            date: today,
            created_at: new Date().toISOString()
        });
        await attendanceService.mark({ employee_id, status: "Present" });
    },
    removeTask: async (taskId) => {
        await deleteDoc(doc(db, "task_entries", taskId));
    },
    getWeekly: async () => {
        // Complex logic similar to backend, calculating week dates and filtering
        const empSnapshot = await getDocs(query(collection(db, "employees"), orderBy("name")));
        const employees = empSnapshot.docs.map(d => ({ ...d.data(), id: d.id }));

        const now = new Date();
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(now);
        monday.setDate(now.getDate() + mondayOffset);
        const mondayStr = monday.toISOString().split('T')[0];

        const sundayDate = new Date(monday);
        sundayDate.setDate(monday.getDate() + 6);
        const sundayStr = sundayDate.toISOString().split('T')[0];

        const attnSnapshot = await getDocs(query(collection(db, "attendance"),
            where("date", ">=", mondayStr), where("date", "<=", sundayStr)));
        const weekAttendance = attnSnapshot.docs.map(d => d.data());

        const tasksSnapshot = await getDocs(query(collection(db, "task_entries"),
            where("date", ">=", mondayStr), where("date", "<=", sundayStr)));
        const weekTasks = tasksSnapshot.docs.map(d => d.data());

        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push(d.toISOString().split('T')[0]);
        }

        return {
            weekStart: mondayStr,
            weekEnd: sundayStr,
            days,
            employees: employees.map(emp => {
                const empRecords = weekAttendance.filter(a => a.employee_id === emp.id);
                const empTasks = weekTasks.filter(t => t.employee_id === emp.id);
                const dayStatuses = days.map(day => {
                    const rec = empRecords.find(r => r.date === day);
                    const dayTaskCount = empTasks.filter(t => t.date === day).length;
                    return { date: day, status: rec?.status || null, tasks: dayTaskCount };
                });
                const presentCount = empRecords.filter(r => r.status === "Present").length;
                const halfDayCount = empRecords.filter(r => r.status === "Half-Day").length;
                return {
                    ...emp,
                    days: dayStatuses,
                    presentCount,
                    halfDayCount,
                    totalDays: presentCount + (halfDayCount * 0.5),
                    totalTasks: empTasks.length
                };
            })
        };
    }
};

export const statsService = {
    getStats: async () => {
        const empCount = (await getCountFromServer(collection(db, "employees"))).data().count;
        const custCount = (await getCountFromServer(collection(db, "customers"))).data().count;
        const ordersSnap = await getDocs(collection(db, "orders"));
        const inventorySnap = await getDocs(collection(db, "inventory"));

        const orders = ordersSnap.docs.map(d => d.data());
        const pendingOrders = orders.filter(o => o.status !== "Delivered");
        const lowStock = inventorySnap.docs.filter(d => d.data().quantity <= d.data().min_level);

        let totalRevenue = 0;
        let balanceDue = 0;
        orders.forEach(o => {
            if (o.status === "Delivered") {
                totalRevenue += Number(o.total_amount) || 0;
            } else {
                totalRevenue += Number(o.advance_amount) || 0;
                balanceDue += (Number(o.total_amount) || 0) - (Number(o.advance_amount) || 0);
            }
        });

        const recentOrders = ordersSnap.docs
            .map(d => ({ ...d.data(), id: d.id }))
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
            .slice(0, 5);

        return {
            employees: empCount,
            customers: custCount,
            pendingOrders: pendingOrders.length,
            lowStock: lowStock.length,
            totalRevenue,
            balanceDue,
            recentOrders,
            chartData: [
                { name: 'Mon', orders: 0 },
                { name: 'Tue', orders: 0 },
                { name: 'Wed', orders: 0 },
                { name: 'Thu', orders: 0 },
                { name: 'Fri', orders: 0 },
                { name: 'Sat', orders: 0 },
                { name: 'Sun', orders: 0 },
            ]
        };
    }
};
