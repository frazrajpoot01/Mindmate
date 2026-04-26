'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Brain, MessageSquare, LogOut, BarChart2, Menu, X,
    User, Settings as SettingsIcon, Shield, Bell,
    Download, Trash2, Save, Loader2, CreditCard, BookOpen
} from 'lucide-react';
import { settingsApi } from '../../lib/api'; // <-- IMPORTANT: Ensure this path is correct for your api.js

export default function SettingsPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Page States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // Real state connected to DB
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        companion_tone: 'Empathetic',
        notifications: true // UI only for now
    });

    // Fetch initial profile data & Auth Guard
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('mindmate_token');
            if (!token) {
                router.replace('/login');
                return;
            }

            const fetchProfile = async () => {
                try {
                    const res = await settingsApi.getProfile();
                    setForm(prev => ({
                        ...prev,
                        first_name: res.data.first_name || '',
                        last_name: res.data.last_name || '',
                        email: res.data.email || '',
                        companion_tone: res.data.companion_tone || 'Empathetic',
                        notifications: res.data.notifications
                    }));
                } catch (err) {
                    if (err.response?.status === 401) {
                        handleLogout();
                    }
                } finally {
                    setLoading(false);
                }
            };
            fetchProfile();
        }
    }, [router]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMsg('');
        try {
            await settingsApi.updateProfile({
                first_name: form.first_name,
                last_name: form.last_name,
                companion_tone: form.companion_tone,
                notifications: form.notifications
            });
            setSuccessMsg('Profile and preferences updated successfully.');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error("Failed to save profile", err);
        } finally {
            setSaving(false);
        }
    };

    const handleExportData = async () => {
        setExporting(true);
        try {
            const res = await settingsApi.exportData();
            // Convert JSON response into a downloadable file
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `mindmate_export_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        } catch (err) {
            console.error("Export failed", err);
        } finally {
            setExporting(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            await settingsApi.deleteAccount();
            handleLogout(); // Clears cookies and redirects
        } catch (err) {
            console.error("Delete failed", err);
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('mindmate_token');
        document.cookie = "mindmate_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = '/login';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-500 space-y-4">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-sm font-medium">Loading preferences...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 font-sans antialiased flex overflow-hidden text-zinc-50">

            {/* ─── Sidebar ─── */}
            <>
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </AnimatePresence>

                <aside className={`fixed md:relative z-40 w-64 shrink-0 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                    <div className="h-16 px-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
                        <Link href="/" className="flex items-center gap-2.5 w-fit group">
                            <div className="w-7 h-7 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                                <Brain size={14} className="text-zinc-950" />
                            </div>
                            <span className="text-zinc-50 font-semibold tracking-tight text-[15px]">
                                MindMate<span className="text-zinc-600">.ai</span>
                            </span>
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-zinc-500 hover:text-zinc-300">
                            <X size={18} />
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-1">
                        <Link href="/chat" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all text-sm">
                            <MessageSquare size={16} /> AI Chat
                        </Link>
                        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all text-sm mt-1">
                            <BarChart2 size={16} /> Mood Dashboard
                        </Link>
                        <Link href="/journal" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all text-sm mt-1">
                            <BookOpen size={16} /> Journal Archive
                        </Link>
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 flex items-center gap-3 text-zinc-100 mt-1">
                            <SettingsIcon size={16} className="text-zinc-100" />
                            <span className="text-sm font-medium">Account Settings</span>
                        </div>
                    </nav>

                    <div className="p-4 border-t border-zinc-800">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-all text-sm">
                            <LogOut size={15} /> Sign out
                        </button>
                    </div>
                </aside>
            </>

            {/* ─── Main Content ─── */}
            <main className="flex-1 flex flex-col min-w-0 bg-zinc-950 overflow-y-auto">

                <header className="h-16 border-b border-zinc-800 flex items-center px-4 md:hidden shrink-0 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
                    <button onClick={() => setSidebarOpen(true)} className="text-zinc-400 hover:text-zinc-100 p-1">
                        <Menu size={20} />
                    </button>
                    <span className="ml-3 font-medium text-sm">Settings</span>
                </header>

                <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 md:space-y-10">

                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">Account Settings</h1>
                            <p className="text-zinc-400 text-sm md:text-base mt-1">Manage your profile, preferences, and privacy.</p>
                        </div>

                        {/* Global Success Message */}
                        <AnimatePresence>
                            {successMsg && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 text-sm px-4 py-2 rounded-lg font-medium"
                                >
                                    {successMsg}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6 md:space-y-8">

                        {/* ─── Section 1: Profile ─── */}
                        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                            <div className="px-6 py-5 border-b border-zinc-800 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                                    <User size={16} className="text-zinc-300" />
                                </div>
                                <div>
                                    <h2 className="text-zinc-50 font-semibold text-base">Personal Information</h2>
                                    <p className="text-zinc-500 text-xs mt-0.5">Update your name and contact details.</p>
                                </div>
                            </div>
                            <div className="p-6 md:p-8">
                                <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-zinc-300 text-sm font-medium">First Name</label>
                                            <input
                                                type="text"
                                                value={form.first_name}
                                                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm px-4 py-2.5 rounded-lg outline-none transition-all focus:border-zinc-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-zinc-300 text-sm font-medium">Last Name</label>
                                            <input
                                                type="text"
                                                value={form.last_name}
                                                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm px-4 py-2.5 rounded-lg outline-none transition-all focus:border-zinc-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-zinc-300 text-sm font-medium">Email Address</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            disabled
                                            className="w-full bg-zinc-950/50 border border-zinc-800/50 text-zinc-500 text-sm px-4 py-2.5 rounded-lg outline-none cursor-not-allowed"
                                        />
                                        <p className="text-zinc-600 text-xs mt-1">To change your email, please contact support.</p>
                                    </div>
                                </form>
                            </div>
                        </section>

                        {/* ─── Section 2: AI Preferences ─── */}
                        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                            <div className="px-6 py-5 border-b border-zinc-800 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                                    <Brain size={16} className="text-zinc-300" />
                                </div>
                                <div>
                                    <h2 className="text-zinc-50 font-semibold text-base">AI Companion Settings</h2>
                                    <p className="text-zinc-500 text-xs mt-0.5">Customize how MindMate interacts with you.</p>
                                </div>
                            </div>
                            <div className="p-6 md:p-8 space-y-8 max-w-2xl">
                                <div className="space-y-4">
                                    <label className="text-zinc-300 text-sm font-medium block">Companion Tone</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {['Empathetic', 'Direct', 'Motivational'].map((tone) => (
                                            <button
                                                key={tone}
                                                onClick={() => setForm({ ...form, companion_tone: tone })}
                                                className={`px-4 py-3 border rounded-xl text-sm font-medium transition-all text-left ${form.companion_tone === tone
                                                    ? 'bg-zinc-800 border-zinc-400 text-zinc-50'
                                                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-900'
                                                    }`}
                                            >
                                                {tone}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-zinc-800/50 pb-6">
                                    <div className="space-y-0.5">
                                        <p className="text-zinc-200 font-medium text-sm">Daily Check-in Reminders</p>
                                        <p className="text-zinc-500 text-xs">Receive a gentle nudge to log your mood.</p>
                                    </div>
                                    <button
                                        onClick={() => setForm({ ...form, notifications: !form.notifications })}
                                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${form.notifications ? 'bg-emerald-500' : 'bg-zinc-700'
                                            }`}
                                    >
                                        <motion.div
                                            layout
                                            className="w-4 h-4 rounded-full bg-white shadow-sm"
                                            animate={{ x: form.notifications ? 20 : 0 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    </button>
                                </div>

                                {/* Shared Save Button for Profile & Preferences */}
                                <div className="pt-2">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="h-10 px-6 flex items-center justify-center gap-2 bg-zinc-50 text-zinc-950 rounded-lg text-sm font-semibold transition-all hover:bg-zinc-200 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        Save All Changes
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* ─── Section 3: Data & Privacy (Danger Zone) ─── */}
                        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                            <div className="px-6 py-5 border-b border-zinc-800 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                                    <Shield size={16} className="text-zinc-300" />
                                </div>
                                <div>
                                    <h2 className="text-zinc-50 font-semibold text-base">Data & Privacy</h2>
                                    <p className="text-zinc-500 text-xs mt-0.5">Control your personal data and account security.</p>
                                </div>
                            </div>
                            <div className="p-6 md:p-8 space-y-6 max-w-3xl">

                                {/* Export Data */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-5 rounded-xl border border-zinc-800 bg-zinc-950/50">
                                    <div>
                                        <h3 className="text-zinc-200 font-medium text-sm">Export My Data</h3>
                                        <p className="text-zinc-500 text-xs mt-1 max-w-md">Download a secure JSON file containing all your chat history and mood logs.</p>
                                    </div>
                                    <button
                                        onClick={handleExportData}
                                        disabled={exporting}
                                        className="h-9 px-4 flex items-center justify-center gap-2 bg-zinc-800 text-zinc-300 hover:text-zinc-50 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-semibold transition-all shrink-0 disabled:opacity-50"
                                    >
                                        {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                        Export Data
                                    </button>
                                </div>

                                {/* Delete Account */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-5 rounded-xl border border-red-900/30 bg-red-950/10">
                                    <div>
                                        <h3 className="text-red-400 font-medium text-sm">Delete Account</h3>
                                        <p className="text-zinc-500 text-xs mt-1 max-w-md">Permanently delete your account and wipe all data from our servers. This action cannot be undone.</p>
                                    </div>

                                    {showDeleteConfirm ? (
                                        <div className="shrink-0 flex items-center gap-2">
                                            <button onClick={() => setShowDeleteConfirm(false)} className="h-9 px-4 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold hover:bg-zinc-700 transition-colors">
                                                Cancel
                                            </button>
                                            <button onClick={handleDeleteAccount} disabled={deleting} className="h-9 px-4 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors flex items-center gap-2">
                                                {deleting ? <Loader2 size={14} className="animate-spin" /> : 'Confirm Wipe'}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="h-9 px-4 flex items-center justify-center gap-2 bg-red-950/50 text-red-400 hover:bg-red-900 hover:text-red-100 border border-red-900/50 rounded-lg text-xs font-semibold transition-all shrink-0"
                                        >
                                            <Trash2 size={14} />
                                            Delete Account
                                        </button>
                                    )}
                                </div>

                            </div>
                        </section>

                    </motion.div>
                </div>
            </main>
        </div>
    );
}