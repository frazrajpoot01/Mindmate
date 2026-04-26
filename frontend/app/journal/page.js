'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Brain, MessageSquare, LogOut, BarChart2, Menu, X,
    Search, Calendar, ChevronRight, Smile, Meh, Frown, BookOpen, Settings, Loader2
} from 'lucide-react';
import { chatApi } from '../../lib/api';

// ─── Date Formatter (UTC to Local Time) ──────────────────────────────────────
const formatToLocalTime = (dateStr) => {
    if (!dateStr) return '';

    // Attempt to parse the date string into a JavaScript Date object
    const date = new Date(dateStr);

    // If the backend sends an ISO string or a standard date (e.g., "April 23, 2026"), 
    // JS can parse it, and we force it to display in the user's local timezone.
    if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat('en-PK', { // Uses Pakistan Locale format defaults
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(date);
    }

    // If the backend sent a string like "Today, 2:30 PM", JS can't parse the word "Today".
    // In that case, we just return the string exactly as the backend sent it.
    return dateStr;
};

// ─── Helper for Mood Badges ──────────────────────────────────────────────────
const MoodBadge = ({ mood }) => {
    const config = {
        Positive: { icon: Smile, colors: 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400' },
        Neutral: { icon: Meh, colors: 'bg-blue-950/30 border-blue-900/50 text-blue-400' },
        Negative: { icon: Frown, colors: 'bg-rose-950/30 border-rose-900/50 text-rose-400' }
    };

    const { icon: Icon, colors } = config[mood] || config.Neutral;

    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${colors}`}>
            <Icon size={12} />
            {mood}
        </div>
    );
};

export default function JournalPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Journal Data from Python Backend
    useEffect(() => {
        const fetchJournalData = async () => {
            try {
                const res = await chatApi.getJournal();

                // Format the dates as soon as they arrive from the API
                const formattedLogs = (res.data.logs || []).map(log => ({
                    ...log,
                    displayDate: formatToLocalTime(log.date) // <-- Apply our new formatter
                }));

                setLogs(formattedLogs);
            } catch (error) {
                console.error("Failed to fetch journal archives:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJournalData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('mindmate_token');
        document.cookie = "mindmate_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = '/login';
    };

    // Filter logic for search
    const filteredLogs = logs.filter(log =>
        (log.title && log.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.summary && log.summary.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-zinc-950 font-sans antialiased flex overflow-hidden text-zinc-50">

            {/* ─── Sidebar (Matches Dashboard & Settings) ─── */}
            <>
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </AnimatePresence>

                <aside
                    className={`fixed md:relative z-40 w-64 shrink-0 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                        }`}
                >
                    <div className="h-16 px-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
                        <Link href="/" className="flex items-center gap-2.5 w-fit group">
                            <div className="w-7 h-7 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                                <Brain size={14} className="text-zinc-950" />
                            </div>
                            <span className="text-zinc-50 font-semibold tracking-tight text-[15px]">
                                MindMate<span className="text-zinc-600">.ai</span>
                            </span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="md:hidden text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-1">
                        <Link
                            href="/chat"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all text-sm"
                        >
                            <MessageSquare size={16} />
                            AI Chat
                        </Link>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all text-sm mt-1"
                        >
                            <BarChart2 size={16} />
                            Mood Dashboard
                        </Link>
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 flex items-center gap-3 text-zinc-100 mt-1">
                            <BookOpen size={16} className="text-zinc-100" />
                            <span className="text-sm font-medium">Journal Archive</span>
                        </div>
                        <Link
                            href="/settings"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all text-sm mt-1"
                        >
                            <Settings size={16} />
                            Account Settings
                        </Link>
                    </nav>

                    <div className="p-4 border-t border-zinc-800">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-all text-sm"
                        >
                            <LogOut size={15} />
                            Sign out
                        </button>
                    </div>
                </aside>
            </>

            {/* ─── Main Content ───────────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0 bg-zinc-950 overflow-y-auto">

                <header className="h-16 border-b border-zinc-800 flex items-center px-4 md:hidden shrink-0 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-zinc-400 hover:text-zinc-100 transition-colors p-1"
                    >
                        <Menu size={20} />
                    </button>
                    <span className="ml-3 font-medium text-sm">Journal Archive</span>
                </header>

                <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2"
                        >
                            <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">Journal Archive</h1>
                            <p className="text-zinc-400 text-sm md:text-base">Reflect on past conversations and emotional insights.</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="relative w-full md:w-72 group"
                        >
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search summaries..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm pl-10 pr-4 py-2.5 rounded-lg outline-none transition-all focus:border-zinc-500 focus:bg-transparent"
                            />
                        </motion.div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center items-center py-32">
                                <Loader2 size={32} className="text-zinc-600 animate-spin" />
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-24 px-4 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/50"
                            >
                                <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                                    <Search size={20} className="text-zinc-600" />
                                </div>
                                <p className="text-zinc-300 font-medium">No entries found</p>
                                <p className="text-zinc-500 text-sm mt-1 text-center">Try adjusting your search terms to find what you're looking for.</p>
                            </motion.div>
                        ) : (
                            filteredLogs.map((log, index) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + (index * 0.05), duration: 0.4 }}
                                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-4 transition-all hover:border-zinc-700 group"
                                >
                                    {/* Top Row: Date & Badge */}
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                                            <Calendar size={14} className="text-zinc-500" />
                                            {/* Render the dynamically formatted local date */}
                                            {log.displayDate}
                                        </div>
                                        <MoodBadge mood={log.mood} />
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-2">
                                        <h3 className="text-zinc-50 font-semibold text-lg tracking-tight">{log.title}</h3>
                                        <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">
                                            {log.summary}
                                        </p>
                                    </div>

                                    {/* Link to specific Chat Session */}
                                    <div className="pt-2">
                                        <Link
                                            href={`/chat?sessionId=${log.session_id}`}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
                                        >
                                            Read full conversation
                                            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}