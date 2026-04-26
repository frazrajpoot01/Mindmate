'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Brain, MessageSquare, LogOut, TrendingUp,
  Flame, Smile, BarChart2, Loader2, CalendarDays,
  Menu, X, BookOpen, Settings,
  Wind, Focus, Compass, Droplets, Headphones, Target, Zap, Sparkles, Send
} from 'lucide-react';
import { moodApi } from '../../lib/api';

// ─── Mood value map ──────────────────────────────────────────────────────────
const MOOD_MAP = { Positive: 3, Neutral: 2, Negative: 1 };
const MOOD_LABELS = { 3: 'Positive', 2: 'Neutral', 1: 'Negative' };

// ─── Modern Premium Strategies ───────────────────────────────────────────────
const MOOD_STRATEGIES = {
  Negative: [
    { title: "4-7-8 Breathing Protocol", text: "Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. Repeat 3 times to immediately reset your nervous system.", icon: Wind },
    { title: "Sensory Grounding", text: "Acknowledge 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.", icon: Focus },
    { title: "Environment Shift", text: "Close your screen and step away for exactly 5 minutes. A physical change in environment disrupts negative cognitive loops.", icon: Compass }
  ],
  Neutral: [
    { title: "Hydration Check", text: "Have you drank a glass of water recently? Mild dehydration is a primary cause of brain fog and afternoon fatigue.", icon: Droplets },
    { title: "Binaural Focus", text: "Switch to instrumental, lo-fi, or binaural beats. Removing lyrics helps maintain a steady, distraction-free workflow.", icon: Headphones },
    { title: "Micro-Targeting", text: "Isolate your to-do list. Jot down just ONE small, high-probability task to complete in the next 30 minutes to build momentum.", icon: Target }
  ],
  Positive: [
    { title: "Capitalize on Momentum", text: "Your cognitive energy is peaking. Use this state to tackle the most complex or intimidating task on your project list.", icon: Zap },
    { title: "Gratitude Anchor", text: "Take 30 seconds to mentally acknowledge exactly what is driving this positive state. Recognizing the trigger helps replicate it later.", icon: Sparkles },
    { title: "Network Output", text: "Send a quick, positive message to a colleague or friend. Positive emotional sharing reinforces your own baseline.", icon: Send }
  ]
};

// ─── Flat & Professional AI Insight Panel ────────────────────────────────────
function StrategyCard({ latestMood, refreshTrigger }) {
  const [strategy, setStrategy] = useState(null);

  useEffect(() => {
    if (latestMood && MOOD_STRATEGIES[latestMood]) {
      const list = MOOD_STRATEGIES[latestMood];
      const randomIndex = Math.floor(Math.random() * list.length);
      setStrategy(list[randomIndex]);
    }
  }, [latestMood, refreshTrigger]);

  if (!strategy) return null;
  const Icon = strategy.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-6 flex flex-col md:flex-row gap-5 md:gap-6 items-start md:items-center transition-all hover:border-zinc-700"
    >
      <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0">
        <Icon size={22} className={
          latestMood === 'Positive' ? 'text-emerald-400' :
            latestMood === 'Negative' ? 'text-indigo-400' : 'text-zinc-300'
        } />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles size={14} className="text-zinc-500" />
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
            AI Insight • {latestMood} State
          </p>
        </div>
        <h4 className="text-zinc-50 text-lg font-bold tracking-tight mb-1">
          {strategy.title}
        </h4>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">
          {strategy.text}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm shadow-xl">
      <p className="text-zinc-400 text-xs mb-1 font-medium">{label}</p>
      <p className="text-zinc-50 font-semibold">{MOOD_LABELS[val] || 'Unknown'}</p>
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, iconColor, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 transition-all hover:border-zinc-700"
    >
      <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0">
        <Icon size={18} className={iconColor} />
      </div>
      <div>
        <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">{label}</p>
        <p className="text-zinc-50 text-2xl font-bold tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-zinc-800" />
            <div className="space-y-2.5">
              <div className="h-3 w-20 bg-zinc-800 rounded" />
              <div className="h-7 w-16 bg-zinc-800 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 animate-pulse h-80" />
    </div>
  );
}

// ─── Mood Logger ─────────────────────────────────────────────────────────────
function MoodLogger({ onMoodLogged }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const moods = [
    { key: 'Positive', emoji: '😊', label: 'Good' },
    { key: 'Neutral', emoji: '😐', label: 'Okay' },
    { key: 'Negative', emoji: '😔', label: 'Rough' },
  ];

  const handleLog = async () => {
    if (!selected || loading) return;
    setLoading(true);
    try {
      await moodApi.saveMood(selected);
      setSuccess(true);
      onMoodLogged(selected);
      setTimeout(() => { setSuccess(false); setSelected(null); }, 2500);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-8"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0">
          <Smile size={18} className="text-zinc-300" />
        </div>
        <div>
          <h3 className="text-zinc-50 font-semibold tracking-tight">Log Today's Mood</h3>
          <p className="text-zinc-400 text-sm mt-0.5">How are you feeling right now?</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {moods.map((mood) => (
          <button
            key={mood.key}
            onClick={() => setSelected(mood.key)}
            className={`flex flex-col items-center justify-center gap-3 p-4 md:p-6 rounded-xl border transition-all cursor-pointer outline-none ${selected === mood.key
              ? 'border-zinc-400 bg-zinc-800 text-zinc-50 scale-[1.02] shadow-sm'
              : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-900'
              }`}
          >
            <span className="text-3xl md:text-4xl">{mood.emoji}</span>
            <span className="text-xs font-semibold uppercase tracking-wide">{mood.label}</span>
          </button>
        ))}
      </div>

      {success ? (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-11 flex items-center justify-center text-emerald-400 font-medium text-sm bg-emerald-950/20 border border-emerald-900/50 rounded-lg"
        >
          ✓ Mood logged successfully
        </motion.div>
      ) : (
        <button
          onClick={handleLog}
          disabled={!selected || loading}
          className="w-full h-11 flex items-center justify-center gap-2 bg-zinc-50 text-zinc-950 rounded-lg text-sm font-semibold transition-all hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : 'Save mood'}
        </button>
      )}
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('mindmate_token');
      if (!token) router.replace('/login');
    }
  }, [router]);

  const fetchHistory = async () => {
    try {
      const res = await moodApi.getHistory();
      const logs = res.data?.mood_logs || [];
      setMoodHistory(logs);
    } catch {
      setMoodHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const computeStreak = () => {
    if (!moodHistory.length) return 0;
    const dates = [...new Set(moodHistory.map((l) => l.date.split('T')[0]))].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = subtractDay(today);

    if (dates[0] !== today && dates[0] !== yesterday) {
      return 0;
    }

    let streak = 0;
    let cursor = dates[0];

    for (const d of dates) {
      if (d === cursor) {
        streak++;
        cursor = subtractDay(cursor);
      } else {
        break;
      }
    }
    return streak;
  };

  const subtractDay = (dateStr) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const chartData = moodHistory.map((l) => ({
    date: new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: MOOD_MAP[l.mood_type] ?? 2,
    mood: l.mood_type,
  }));

  const handleLogout = () => {
    localStorage.removeItem('mindmate_token');
    document.cookie = "mindmate_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = '/login';
  };

  const handleMoodLogged = () => fetchHistory();

  const streak = computeStreak();
  const moodEmoji = { Positive: '😊', Neutral: '😐', Negative: '😔' };

  const latestLog = moodHistory.length > 0 ? moodHistory[moodHistory.length - 1] : null;
  const latestMood = latestLog ? latestLog.mood_type : null;

  return (
    <div className="min-h-screen bg-zinc-950 font-sans antialiased flex overflow-hidden text-zinc-50">

      {/* ─── Sidebar ─────────────────────────────────────────── */}
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
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 flex items-center gap-3 text-zinc-100 mt-1">
              <BarChart2 size={16} className="text-zinc-100" />
              <span className="text-sm font-medium">Mood Dashboard</span>
            </div>
            <Link
              href="/journal"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all text-sm mt-1"
            >
              <BookOpen size={16} />
              Journal Archive
            </Link>
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
          <span className="ml-3 font-medium text-sm">Dashboard</span>
        </header>

        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 md:space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">Mood Dashboard</h1>
            <p className="text-zinc-400 text-sm md:text-base">Track your emotional journey and identify patterns over time.</p>
          </motion.div>

          {!loading && latestMood && (
            <StrategyCard
              latestMood={latestMood}
              refreshTrigger={moodHistory.length}
            />
          )}

          {loading ? (
            <DashboardSkeleton />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <MetricCard icon={CalendarDays} label="Total Logs" value={moodHistory.length} iconColor="text-zinc-300" delay={0} />
                <MetricCard icon={Flame} label="Current Streak" value={`${streak} day${streak !== 1 ? 's' : ''}`} iconColor="text-emerald-400" delay={0.1} />

                {/* ─── UPDATED: CURRENT MOOD METRIC CARD ─── */}
                <MetricCard
                  icon={Smile}
                  label="Current Mood"
                  value={latestMood ? `${moodEmoji[latestMood]} ${latestMood}` : '—'}
                  iconColor={
                    latestMood === 'Positive' ? 'text-emerald-400' :
                      latestMood === 'Negative' ? 'text-indigo-400' :
                        latestMood === 'Neutral' ? 'text-zinc-300' : 'text-blue-400'
                  }
                  delay={0.2}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-8"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0">
                    <TrendingUp size={18} className="text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-zinc-50 font-semibold tracking-tight">Mood Over Time</h3>
                    <p className="text-zinc-400 text-sm mt-0.5">Last 30 days of check-ins</p>
                  </div>
                </div>

                {chartData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-56 space-y-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center">
                      <BarChart2 size={20} className="text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 text-sm">No mood data yet. Log your first mood below.</p>
                  </div>
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 0, bottom: 0, left: -25 }}>
                        <defs>
                          <linearGradient id="zincGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fafafa" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#fafafa" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis domain={[0.5, 3.5]} ticks={[1, 2, 3]} tickFormatter={(v) => MOOD_LABELS[v]?.slice(0, 3) || ''} tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area type="monotone" dataKey="value" stroke="#fafafa" strokeWidth={2} fill="url(#zincGradient)" dot={{ fill: '#18181b', stroke: '#fafafa', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#fafafa', stroke: '#18181b', strokeWidth: 3 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </motion.div>

              <MoodLogger onMoodLogged={handleMoodLogged} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}