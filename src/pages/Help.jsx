import React from 'react';
import {
    HelpCircle,
    BookOpen,
    PlayCircle,
    MessageCircle,
    ShoppingBag,
    Users,
    Printer,
    CreditCard,
    ChevronRight,
    Search
} from 'lucide-react';


const HelpCard = ({ icon: Icon, title, description, steps }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <Icon size={120} />
        </div>

        <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="p-4 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <Icon size={28} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
        </div>

        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed relative z-10">{description}</p>

        <div className="space-y-4 relative z-10">
            {steps.map((step, idx) => (
                <div key={idx} className="flex gap-4 items-start group/step">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 text-[10px] font-black flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-colors group-hover/step:bg-blue-600 group-hover/step:text-white group-hover/step:border-blue-600">
                        {idx + 1}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-bold leading-tight pt-0.5">{step}</span>
                </div>
            ))}
        </div>
    </div>
);

const Help = () => {
    const helpResources = [
        {
            icon: ShoppingBag,
            title: "Orders & Invoices",
            description: "How to create a new order and print an invoice?",
            steps: [
                "Go to the 'Orders' page and click the 'New Order' button.",
                "Select a customer and enter the required dress measurements.",
                "Record the advance payment and total amount, then save.",
                "Inside the order details, click 'Print Invoice' to give a receipt to the customer."
            ]
        },
        {
            icon: Users,
            title: "Employee Management",
            description: "Managing employees and their production tasks.",
            steps: [
                "Add new employees or masters in the 'Employees' section.",
                "Assign specific cutters and stitchers when creating an order.",
                "Mark daily attendance in the 'Attendance' portal every morning.",
                "Track the number of tasks completed by each employee automatically."
            ]
        },
        {
            icon: Printer,
            title: "Task Cards (Job Card)",
            description: "How to provide measurements to the production team.",
            steps: [
                "Open the details page for any active order.",
                "Click the 'Print Task Card' button located at the top.",
                "This card displays only measurements and dress color (no private customer info).",
                "Give this printed job card to the tailor to start production."
            ]
        },
        {
            icon: CreditCard,
            title: "Finance & Accounts",
            description: "Managing shop expenses and employee salaries.",
            steps: [
                "Go to 'Finance' > 'Salaries' to record payments made to workers.",
                "Record electricity, water, or rent bills under 'Utilities & Expenses'.",
                "Log post-dated cheques in 'Cheque Management' to track future payments.",
                "View the dashboard for a summary of total income and balance due."
            ]
        }
    ];

    return (
        <div className="page-container relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 -z-10"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/20">
                            <HelpCircle size={28} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Help Center</h1>
                    </div>
                    <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Welcome! Here is the comprehensive guide to using the Rajani Tailors Management System. Find all the answers to your operational questions below.
                    </p>
                </div>

                <div className="flex gap-4 no-print">
                    <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-slate-900/10 active:shadow-none">
                        <PlayCircle size={18} /> Video Tutorial
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                        <MessageCircle size={18} /> Support
                    </button>
                </div>
            </div>

            {/* Quick Search Bar */}
            <div className="relative mb-16 no-print max-w-xl">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search for a topic... (e.g. How to print?)"
                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 rounded-3xl px-14 py-5 outline-none text-slate-900 dark:text-white font-bold transition-all shadow-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {helpResources.map((resource, index) => (
                    <HelpCard key={index} {...resource} />
                ))}
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-600/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="max-w-xl text-center lg:text-left">
                        <h2 className="text-3xl font-black uppercase mb-4 tracking-tight">Need More assistance?</h2>
                        <p className="text-blue-100 text-lg font-medium leading-relaxed mb-8">
                            If you need further help or encounter any technical errors, please reach out to our support team. We're available 24/7.
                        </p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-blue-300 mb-1 tracking-widest">Phone / WhatsApp</span>
                                <span className="text-2xl font-black">+94 77 123 4567</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-blue-300 mb-1 tracking-widest">Email Support</span>
                                <span className="text-2xl font-black">support@rajanitailors.com</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                        <BookOpen size={64} className="mx-auto lg:mx-0 mb-6" />
                        <h4 className="text-xl font-bold mb-2">Printable Manual</h4>
                        <p className="text-sm text-blue-100 mb-6">Click below to print this entire guide for offline use.</p>
                        <button
                            onClick={() => window.print()}
                            className="w-full bg-white text-blue-600 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-50 transition-colors shadow-lg"
                        >
                            Download PDF / Print
                        </button>
                    </div>
                </div>
            </div>

            <footer className="mt-20 py-12 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Rajani Tailors Management System • Version 1.0.0</p>
            </footer>
        </div>
    );
};

export default Help;
