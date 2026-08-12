'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { User, Shield, Download, Trash2, Save, Loader2, LogOut } from 'lucide-react';
import { settingsApi } from '../../../lib/api';
import BrandIcon from '../../../components/BrandIcon';

export default function SettingsPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        companion_tone: 'Empathetic',
        notifications: true 
    });

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
            handleLogout(); 
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
            <div className="flex-1 flex flex-col items-center justify-center text-muted space-y-4">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-sm font-medium font-sans">Loading preferences...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 md:space-y-10">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-medium text-ink tracking-tight font-serif">Account Settings</h1>
                    <p className="text-muted text-sm md:text-base mt-1 font-sans">Manage your profile, preferences, and privacy.</p>
                </div>
                <AnimatePresence>
                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-mood-positive/10 border border-mood-positive/30 text-mood-positive text-sm px-4 py-2 rounded-lg font-medium font-sans shadow-sm"
                        >
                            {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6 md:space-y-8 font-sans">

                <section className="bg-surface-card border border-hairline rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-hairline flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-canvas flex items-center justify-center shrink-0 border border-hairline">
                            <User size={16} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-ink font-medium text-base font-serif">Personal Information</h2>
                            <p className="text-muted-soft text-xs mt-0.5">Update your name and contact details.</p>
                        </div>
                    </div>
                    <div className="p-6 md:p-8">
                        <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-ink text-sm font-medium">First Name</label>
                                    <input
                                        type="text"
                                        value={form.first_name}
                                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                        className="w-full bg-canvas border border-hairline text-ink placeholder-muted-soft text-sm px-4 py-2.5 rounded-lg outline-none transition-all focus:border-primary/50 shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-ink text-sm font-medium">Last Name</label>
                                    <input
                                        type="text"
                                        value={form.last_name}
                                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                        className="w-full bg-canvas border border-hairline text-ink placeholder-muted-soft text-sm px-4 py-2.5 rounded-lg outline-none transition-all focus:border-primary/50 shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-ink text-sm font-medium">Email Address</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    disabled
                                    className="w-full bg-surface-soft border border-hairline text-muted text-sm px-4 py-2.5 rounded-lg outline-none cursor-not-allowed shadow-sm"
                                />
                                <p className="text-muted-soft text-xs mt-1">To change your email, please contact support.</p>
                            </div>
                        </form>
                    </div>
                </section>

                <section className="bg-surface-card border border-hairline rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-hairline flex items-center gap-3">
                            <BrandIcon className="w-8 h-8" />
                        <div>
                            <h2 className="text-ink font-medium text-base font-serif">AI Companion Settings</h2>
                            <p className="text-muted-soft text-xs mt-0.5">Customize how MindMate interacts with you.</p>
                        </div>
                    </div>
                    <div className="p-6 md:p-8 space-y-8 max-w-2xl">
                        <div className="space-y-4">
                            <label className="text-ink text-sm font-medium block">Companion Tone</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {['Empathetic', 'Direct', 'Motivational'].map((tone) => (
                                    <button
                                        key={tone}
                                        onClick={() => setForm({ ...form, companion_tone: tone })}
                                        className={`px-4 py-3 border rounded-xl text-sm font-medium transition-all text-left shadow-sm ${form.companion_tone === tone
                                            ? 'bg-canvas border-primary text-primary'
                                            : 'bg-surface-soft border-hairline text-muted hover:border-primary/50'
                                            }`}
                                    >
                                        {tone}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-hairline pb-6">
                            <div className="space-y-0.5">
                                <p className="text-ink font-medium text-sm">Daily Check-in Reminders</p>
                                <p className="text-muted-soft text-xs">Receive a gentle nudge to log your mood.</p>
                            </div>
                            <button
                                onClick={() => setForm({ ...form, notifications: !form.notifications })}
                                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${form.notifications ? 'bg-primary' : 'bg-muted-soft'
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

                        <div className="pt-2">
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="h-10 px-6 flex items-center justify-center gap-2 bg-primary text-on-primary rounded-lg text-sm font-semibold transition-all hover:bg-primary-active disabled:opacity-50 shadow-sm"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Save All Changes
                            </button>
                        </div>
                    </div>
                </section>

                <section className="bg-surface-card border border-hairline rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-hairline flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-canvas flex items-center justify-center shrink-0 border border-hairline">
                            <Shield size={16} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-ink font-medium text-base font-serif">Data & Privacy</h2>
                            <p className="text-muted-soft text-xs mt-0.5">Control your personal data and account security.</p>
                        </div>
                    </div>
                    <div className="p-6 md:p-8 space-y-6 max-w-3xl">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-5 rounded-xl border border-hairline bg-canvas">
                            <div>
                                <h3 className="text-ink font-medium text-sm">Export My Data</h3>
                                <p className="text-muted-soft text-xs mt-1 max-w-md">Download a secure JSON file containing all your chat history and mood logs.</p>
                            </div>
                            <button
                                onClick={handleExportData}
                                disabled={exporting}
                                className="h-9 px-4 flex items-center justify-center gap-2 bg-surface-card text-ink hover:text-primary hover:bg-canvas border border-hairline rounded-lg text-xs font-semibold transition-all shrink-0 disabled:opacity-50 shadow-sm"
                            >
                                {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                Export Data
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-5 rounded-xl border border-mood-negative/30 bg-mood-negative/5">
                            <div>
                                <h3 className="text-mood-negative font-medium text-sm">Delete Account</h3>
                                <p className="text-muted-soft text-xs mt-1 max-w-md">Permanently delete your account and wipe all data from our servers. This action cannot be undone.</p>
                            </div>

                            {showDeleteConfirm ? (
                                <div className="shrink-0 flex items-center gap-2">
                                    <button onClick={() => setShowDeleteConfirm(false)} className="h-9 px-4 bg-surface-card text-ink border border-hairline rounded-lg text-xs font-semibold hover:bg-canvas transition-colors shadow-sm">
                                        Cancel
                                    </button>
                                    <button onClick={handleDeleteAccount} disabled={deleting} className="h-9 px-4 bg-mood-negative text-white rounded-lg text-xs font-semibold hover:bg-mood-negative/90 transition-colors flex items-center gap-2 shadow-sm">
                                        {deleting ? <Loader2 size={14} className="animate-spin" /> : 'Confirm Wipe'}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="h-9 px-4 flex items-center justify-center gap-2 bg-mood-negative/10 text-mood-negative hover:bg-mood-negative hover:text-white border border-mood-negative/30 rounded-lg text-xs font-semibold transition-all shrink-0 shadow-sm"
                                >
                                    <Trash2 size={14} />
                                    Delete Account
                                </button>
                            )}
                        </div>

                        {/* Mobile Sign Out Button */}
                        <div className="md:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-5 rounded-xl border border-hairline bg-canvas">
                            <div>
                                <h3 className="text-ink font-medium text-sm">Sign Out</h3>
                                <p className="text-muted-soft text-xs mt-1 max-w-md">Securely end your session and return to the login screen.</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="h-9 px-4 flex items-center justify-center gap-2 bg-surface-card text-ink hover:text-primary hover:bg-canvas border border-hairline rounded-lg text-xs font-semibold transition-all shrink-0 shadow-sm"
                            >
                                <LogOut size={14} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </section>
            </motion.div>
        </div>
    );
}