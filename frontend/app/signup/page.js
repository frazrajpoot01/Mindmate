'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Brain, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2, User } from 'lucide-react';
import { authApi } from '../../lib/api';

// ─── NEW: Google Imports ─────────────────────────────────────────
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
// ─────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const requirements = [
  { test: (p) => p.length >= 8, label: '8+ characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'Uppercase letter' },
  { test: (p) => /[0-9]/.test(p), label: 'One number' },
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirm: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name required';
    if (!form.lastName.trim()) e.lastName = 'Last name required';
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Must be 8+ characters';
    if (!form.confirm) e.confirm = 'Confirm your password';
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await authApi.signup(form.email, form.password, form.firstName, form.lastName);
      localStorage.setItem('mindmate_token', res.data.access_token);
      document.cookie = `mindmate_token=${res.data.access_token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      router.push('/chat');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Signup failed. Email might already be in use.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── NEW: Google Success Handler ───────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setServerError('');
      // Send the secure ID token to our FastAPI backend
      const res = await authApi.googleLogin(credentialResponse.credential);

      localStorage.setItem('mindmate_token', res.data.access_token);
      document.cookie = `mindmate_token=${res.data.access_token}; path=/; max-age=${7 * 24 * 60 * 60}`;

      router.push('/chat');
    } catch (err) {
      setServerError(err.response?.data?.detail || "Google authentication failed.");
      setLoading(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 flex font-sans antialiased text-zinc-50 py-0">

      {/* ─── Left Side: Auth Form ─── */}
      <main className="w-full md:w-1/2 flex flex-col px-8 md:px-16 lg:px-24 py-12">
        {/* Logo Header */}
        <header className="mb-16 md:mb-20">
          <Link href="/" className="flex items-center gap-2.5 group w-fit">
            <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center transition-transform group-hover:scale-105">
              <Brain size={16} className="text-zinc-950" />
            </div>
            <span className="text-zinc-50 font-semibold text-lg tracking-tight">
              MindMate<span className="text-zinc-600">.ai</span>
            </span>
          </Link>
        </header>

        {/* Form Container (Centered Vertically) */}
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="space-y-10"
          >
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-zinc-50 tracking-tighter">
                Create your space
              </h1>
              <p className="text-zinc-400 text-base leading-relaxed">
                Free forever. Begin your journey toward mental clarity and well-being.
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-red-950/40 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg font-medium"
                >
                  {serverError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* Name Row (New Fields) */}
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-1.5">
                  <label className="text-zinc-300 text-sm font-medium" htmlFor="firstName">
                    First Name
                  </label>
                  <div className="relative group">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-zinc-300 transition-colors" />
                    <input
                      id="firstName"
                      type="text"
                      placeholder="Jane"
                      className={`w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm px-4 pl-11 py-2.5 rounded-lg outline-none transition-all duration-150 focus:border-zinc-500 focus:bg-transparent ${errors.firstName ? 'border-red-600 focus:border-red-600' : ''}`}
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    />
                  </div>
                  {errors.firstName && <p className="text-red-400 text-xs pt-1">{errors.firstName}</p>}
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                  <label className="text-zinc-300 text-sm font-medium" htmlFor="lastName">
                    Last Name
                  </label>
                  <div className="relative group">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-zinc-300 transition-colors" />
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      className={`w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm px-4 pl-11 py-2.5 rounded-lg outline-none transition-all duration-150 focus:border-zinc-500 focus:bg-transparent ${errors.lastName ? 'border-red-600 focus:border-red-600' : ''}`}
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    />
                  </div>
                  {errors.lastName && <p className="text-red-400 text-xs pt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-zinc-300 text-sm font-medium" htmlFor="signup-email">
                  Email address
                </label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-zinc-300 transition-colors" />
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@email.com"
                    className={`w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm px-4 pl-11 py-2.5 rounded-lg outline-none transition-all duration-150 focus:border-zinc-500 focus:bg-transparent ${errors.email ? 'border-red-600 focus:border-red-600' : ''}`}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs pt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5 relative">
                <label className="text-zinc-300 text-sm font-medium" htmlFor="signup-password">
                  Password
                </label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-zinc-300 transition-colors" />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    className={`w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm px-4 pl-11 pr-12 py-2.5 rounded-lg outline-none transition-all duration-150 focus:border-zinc-500 focus:bg-transparent ${errors.password ? 'border-red-600' : ''}`}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs pt-1">{errors.password}</p>}

                {/* Password requirements */}
                {form.password && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 pt-2.5">
                    {requirements.map((req) => (
                      <span key={req.label} className={`flex items-center gap-1.5 text-xs transition-colors ${req.test(form.password) ? 'text-green-400' : 'text-zinc-600'}`}>
                        <CheckCircle2 size={13} />
                        {req.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="text-zinc-300 text-sm font-medium" htmlFor="signup-confirm">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-zinc-300 transition-colors" />
                  <input
                    id="signup-confirm"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    className={`w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm px-4 pl-11 py-2.5 rounded-lg outline-none transition-all duration-150 focus:border-zinc-500 focus:bg-transparent ${errors.confirm ? 'border-red-600' : ''}`}
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  />
                </div>
                {errors.confirm && <p className="text-red-400 text-xs pt-1">{errors.confirm}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                id="signup-submit"
                className="w-full h-11 flex items-center justify-center gap-2 bg-zinc-50 text-zinc-950 rounded-lg text-sm font-semibold transition-all hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed mt-7"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Creating account…</>
                ) : (
                  <>Get started free <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            {/* ─── NEW: Google Divider & Button ───────────────────────── */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zinc-950 text-zinc-500">Or sign up with</span>
              </div>
            </div>

            <div className="flex justify-center w-full">
              {/* IMPORTANT: Paste your actual Client ID here! */}
              <GoogleOAuthProvider clientId="165775322221-6v6dmvv9t5aa6stgdeu5eq2p1aehjhd6.apps.googleusercontent.com">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    setServerError("Google Sign-up popup was closed or failed.");
                  }}
                  theme="filled_black"
                  shape="rectangular"
                  size="large"
                  text="signup_with"
                />
              </GoogleOAuthProvider>
            </div>
            {/* ──────────────────────────────────────────────────────────── */}

            {/* Footer */}
            <p className="text-center text-zinc-500 text-sm pt-3">
              Already have an account?{' '}
              <Link href="/login" className="text-zinc-100 hover:text-white font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Disclaimer Footer */}
        <footer className="mt-20 max-w-sm mx-auto w-full text-center">
          <p className="text-zinc-700 text-xs leading-relaxed">
            By creating an account, you agree to MindMate's Terms of Service and Privacy Policy. Your privacy and data security are our top priorities.
          </p>
        </footer>
      </main>

      {/* ─── Right Side: MindMate Feature Panel (Matching Login) ─── */}
      <aside className="hidden md:flex md:w-1/2 bg-zinc-900 border-l border-zinc-800 relative items-center justify-center p-16 lg:p-24 overflow-hidden">

        {/* Hypnotic Gradient Visual Element (Calming, subtle) */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-800 rounded-full blur-[120px] opacity-40" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-zinc-700 rounded-full blur-[100px] opacity-20" />
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-lg space-y-16 text-center"
        >
          {/* Main Slogan (Updated for joining) */}
          <h2 className="text-5xl lg:text-6xl font-bold text-zinc-50 tracking-tighter leading-[1.05]">
            Start healing, one conversation at a time.
          </h2>

          {/* Feature List (Matching Login for consistency) */}
          <div className="grid grid-cols-2 gap-8 text-left max-w-md mx-auto">
            <div className="space-y-2">
              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full"></div>
              <h4 className="text-zinc-200 font-medium text-sm">24/7 AI Companion</h4>
              <p className="text-zinc-500 text-xs leading-relaxed">Always available to listen, analyze, and support without judgment.</p>
            </div>
            <div className="space-y-2">
              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full"></div>
              <h4 className="text-zinc-200 font-medium text-sm">Secure & Private</h4>
              <p className="text-zinc-500 text-xs leading-relaxed">Your emotional data is protected with industry-standard encryption.</p>
            </div>
            <div className="space-y-2">
              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full"></div>
              <h4 className="text-zinc-200 font-medium text-sm">Mood Tracking</h4>
              <p className="text-zinc-500 text-xs leading-relaxed">Identify patterns and insights into your emotional well-being over time.</p>
            </div>
            <div className="space-y-2">
              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full"></div>
              <h4 className="text-zinc-200 font-medium text-sm">Cognitive Exercises</h4>
              <p className="text-zinc-500 text-xs leading-relaxed">Utilize simple tools to manage stress, anxiety, and difficult emotions.</p>
            </div>
          </div>

          {/* Sub-quote */}
          <div className="pt-10 border-t border-zinc-800">
            <p className="text-zinc-600 text-xs italic tracking-wide">
              "Invest in your mind. It's the only place you'll ever truly live."
            </p>
          </div>

        </motion.div>
      </aside>
    </div>
  );
}