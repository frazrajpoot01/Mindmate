'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Calendar, ChevronRight, Smile, Meh, Frown, Loader2, X } from 'lucide-react';
import { chatApi } from '../../../lib/api';
import { mentalHealthSpring } from '../../../lib/animations';

const formatToLocalTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat('en-PK', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(date);
    }
    return dateStr;
};

const MoodBadge = ({ mood }) => {
    const config = {
        Positive: { icon: Smile, colors: 'bg-mood-positive/10 border-mood-positive/30 text-mood-positive' },
        Neutral: { icon: Meh, colors: 'bg-mood-neutral/10 border-mood-neutral/30 text-mood-neutral' },
        Negative: { icon: Frown, colors: 'bg-mood-negative/10 border-mood-negative/30 text-mood-negative' }
    };

    const { icon: Icon, colors } = config[mood] || config.Neutral;

    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium font-sans ${colors}`}>
            <Icon size={12} />
            {mood}
        </div>
    );
};

export default function JournalPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const fetchJournalData = async () => {
            try {
                const res = await chatApi.getJournal();
                const formattedLogs = (res.data.logs || []).map(log => ({
                    ...log,
                    displayDate: formatToLocalTime(log.date)
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

    const filteredLogs = logs.filter(log =>
        (log.title && log.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.summary && log.summary.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <h1 className="text-3xl font-medium text-ink tracking-tight font-serif">Journal Archive</h1>
                    <p className="text-muted text-sm md:text-base font-sans">Reflect on past conversations and emotional insights.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative w-full md:w-72 group font-sans"
                >
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search summaries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface-card border border-hairline text-ink placeholder-muted-soft text-sm pl-10 pr-4 py-2.5 rounded-lg outline-none transition-all focus:border-primary/50 shadow-sm"
                    />
                </motion.div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <Loader2 size={32} className="text-muted animate-spin" />
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-24 px-4 border border-dashed border-hairline rounded-2xl bg-canvas"
                    >
                        <div className="w-12 h-12 rounded-full bg-surface-soft flex items-center justify-center mb-4">
                            <Search size={20} className="text-muted" />
                        </div>
                        <p className="text-ink font-medium font-sans">No entries found</p>
                        <p className="text-muted-soft text-sm mt-1 text-center font-sans">Try adjusting your search terms to find what you're looking for.</p>
                    </motion.div>
                ) : (
                    filteredLogs.map((log, index) => (
                        <motion.div
                            key={log.id}
                            layoutId={`journal-card-${log.id}`}
                            onClick={() => setExpandedId(log.id)}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...mentalHealthSpring, delay: 0.1 + (index * 0.05) }}
                            className="bg-surface-card border border-hairline rounded-2xl p-6 md:p-8 space-y-4 transition-shadow shadow-sm hover:shadow cursor-pointer group"
                        >
                            <motion.div layoutId={`journal-header-${log.id}`} className="flex items-center justify-between gap-4 font-sans">
                                <div className="flex items-center gap-2 text-muted text-sm font-medium">
                                    <Calendar size={14} className="text-muted-soft" />
                                    {log.displayDate}
                                </div>
                                <MoodBadge mood={log.mood} />
                            </motion.div>

                            <motion.div layoutId={`journal-content-${log.id}`} className="space-y-2">
                                <h3 className="text-ink font-medium text-xl tracking-tight font-serif">{log.title}</h3>
                                <p className="text-body text-sm leading-relaxed max-w-3xl font-sans line-clamp-3">
                                    {log.summary}
                                </p>
                            </motion.div>

                            <div className="pt-2 font-sans flex justify-end">
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors">
                                    Click to expand
                                </span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <AnimatePresence>
                {expandedId && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setExpandedId(null)}
                            className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-40"
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 pointer-events-none">
                            {(() => {
                                const activeLog = logs.find(l => l.id === expandedId);
                                if (!activeLog) return null;
                                return (
                                    <motion.div
                                        layoutId={`journal-card-${activeLog.id}`}
                                        className="bg-surface-card border border-hairline rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto flex flex-col shadow-xl"
                                        transition={mentalHealthSpring}
                                    >
                                        <div className="p-6 md:p-8 space-y-6 border-b border-hairline bg-canvas">
                                            <div className="flex items-center justify-between">
                                                <motion.div layoutId={`journal-header-${activeLog.id}`} className="flex items-center gap-4 font-sans w-full justify-between">
                                                    <div className="flex items-center gap-2 text-muted text-sm font-medium">
                                                        <Calendar size={14} className="text-muted-soft" />
                                                        {activeLog.displayDate}
                                                    </div>
                                                    <MoodBadge mood={activeLog.mood} />
                                                </motion.div>
                                            </div>
                                            <motion.div layoutId={`journal-content-${activeLog.id}`} className="space-y-4">
                                                <h2 className="text-ink font-medium text-2xl md:text-3xl tracking-tight font-serif">{activeLog.title}</h2>
                                            </motion.div>
                                        </div>
                                        <div className="p-6 md:p-8 flex-1">
                                            <p className="text-body text-base leading-relaxed font-sans whitespace-pre-wrap">
                                                {activeLog.summary}
                                            </p>
                                        </div>
                                        <div className="p-6 md:p-8 border-t border-hairline bg-canvas flex items-center justify-between">
                                            <button 
                                                onClick={() => setExpandedId(null)}
                                                className="px-4 py-2 text-sm font-medium text-muted hover:text-ink transition-colors"
                                            >
                                                Close
                                            </button>
                                            <Link
                                                href={`/chat?sessionId=${activeLog.session_id}`}
                                                className="px-5 py-2.5 bg-primary hover:bg-primary-active text-on-primary rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
                                            >
                                                Read full conversation
                                                <ChevronRight size={16} />
                                            </Link>
                                        </div>
                                    </motion.div>
                                );
                            })()}
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}