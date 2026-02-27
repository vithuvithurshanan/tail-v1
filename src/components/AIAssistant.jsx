import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Sparkles, MessageSquare } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hello! I'm Rajani AI, powered by Gemini. I know everything about this Tailoring Management System. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    // Initialize Gemini AI
    const api_key = "AIzaSyAdY3UsuVn6yjOrvec-5P0CxhYAtrY0qGA".trim();
    const genAI = new GoogleGenerativeAI(api_key);

    // Using gemini-2.0-flash
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash"
    });

    const SYSTEM_PROMPT = `You are Rajani AI, a highly intelligent assistant for the "Rajani Tailors Management System". 
    Your goal is to help users (tailor shop owners/staff) navigate and use the application.
    - Support English and Tanglish.
    - If user asks in Tanglish, respond in Tanglish.
    - Knowledge: Dashboard (overview), Orders (new orders/measurements), Printing (Invoices/Job Cards), Finance (Salaries/Bills).
    - Recommendation: Charge LKR 150k - 250k for this system.
    - Contact: +94 77 123 4567.`;

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setIsTyping(true);

        try {
            // Include system prompt in the very first message/part to set context
            const promptWithContext = `${SYSTEM_PROMPT}\n\nUser Question: ${userMessage}`;

            // Simplified chat without complex history for testing
            const result = await model.generateContent(promptWithContext);
            const response = await result.response;
            const text = response.text();

            if (!text) throw new Error("Empty response");

            setMessages(prev => [...prev, { role: 'ai', content: text }]);
        } catch (error) {
            console.error("Gemini Error:", error);
            setMessages(prev => [...prev, { role: 'ai', content: "I'm having a connection issue. Please check if your API Key is active in Google AI Studio or try again later." }]);
        } finally {
            setIsTyping(false);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    return (
        <div className="fixed bottom-8 right-8 z-[100] no-print">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-600/40 transition-all hover:scale-110 active:scale-95 group relative"
                >
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white animate-bounce">AI</div>
                    <Sparkles className="group-hover:rotate-12 transition-transform" />
                </button>
            )}

            {isOpen && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-[400px] h-[600px] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                <Bot size={24} />
                            </div>
                            <div>
                                <h3 className="font-black uppercase tracking-widest text-xs">Rajani AI</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-blue-100 uppercase">Gemini 1.5 Powered</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-slate-950/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2`}>
                                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${msg.role === 'ai' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                                        {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                                    </div>
                                    <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${msg.role === 'ai'
                                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-100 dark:border-slate-700'
                                        : 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start animate-in fade-in">
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSend} className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask Gemini AI..."
                                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 pr-14 outline-none text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AIAssistant;
