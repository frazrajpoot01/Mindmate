'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Loader2, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import Logo from '../../components/Logo';
import { authApi } from '../../lib/api';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', confirm_password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const passwordRequirements = [
    { regex: /.{8,}/, text: 'At least 8 characters' },
    { regex: /[A-Z]/, text: 'One uppercase letter' },
    { regex: /[0-9]/, text: 'One number' }
  ];

  const validate = () => {
    const e = {};
    if (!form.first_name) e.first_name = 'First name is required';
    if (!form.last_name) e.last_name = 'Last name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';

    if (!form.password) e.password = 'Password is required';
    else {
      passwordRequirements.forEach(req => {
        if (!req.regex.test(form.password)) e.password = 'Password does not meet requirements';
      });
    }

    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match';
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
      await authApi.signup({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password
      });

      const res = await authApi.login(form.email, form.password);
      localStorage.setItem('mindmate_token', res.data.access_token);
      document.cookie = `mindmate_token=${res.data.access_token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      router.push('/chat');
    } catch (err) {
      const msg = err.response?.data?.detail || 'An error occurred during signup.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setServerError('');
      const res = await authApi.googleLogin(credentialResponse.credential);
      localStorage.setItem('mindmate_token', res.data.access_token);
      document.cookie = `mindmate_token=${res.data.access_token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      router.push('/chat');
    } catch (err) {
      setServerError(err.response?.data?.detail || "Google authentication failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex font-sans antialiased text-ink">
      <main className="w-full md:w-1/2 flex flex-col px-8 md:px-16 lg:px-24 py-12">
        <header className="mb-12">
          <Logo />
        </header>

        <div className="flex-1 flex flex-col justify-center max-w-[400px] mx-auto w-full">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-10">
            <div className="space-y-2">
              <h1 className="text-3xl font-medium text-ink tracking-tighter font-serif">
                Begin your journey
              </h1>
              <p className="text-muted text-base leading-relaxed font-sans">
                Create a secure account to track your mood and talk freely.
              </p>
            </div>

            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-mood-negative/10 border border-mood-negative/30 text-mood-negative text-sm px-4 py-3 rounded-lg font-medium"
                >
                  {serverError}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5 font-sans" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-ink text-sm font-medium" htmlFor="first_name">First Name</label>
                  <div className="relative group">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                    <input
                      id="first_name" type="text" placeholder="Jane"
                      className={`w-full bg-surface-card border border-hairline text-ink placeholder-muted-soft text-sm px-4 pl-11 py-3 rounded-lg outline-none transition-all duration-150 focus:border-primary/50 shadow-sm ${errors.first_name ? 'border-mood-negative focus:border-mood-negative' : ''}`}
                      value={form.first_name}
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    />
                  </div>
                  {errors.first_name && <p className="text-mood-negative text-xs pt-1">{errors.first_name}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-ink text-sm font-medium" htmlFor="last_name">Last Name</label>
                  <div className="relative group">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                    <input
                      id="last_name" type="text" placeholder="Doe"
                      className={`w-full bg-surface-card border border-hairline text-ink placeholder-muted-soft text-sm px-4 pl-11 py-3 rounded-lg outline-none transition-all duration-150 focus:border-primary/50 shadow-sm ${errors.last_name ? 'border-mood-negative focus:border-mood-negative' : ''}`}
                      value={form.last_name}
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    />
                  </div>
                  {errors.last_name && <p className="text-mood-negative text-xs pt-1">{errors.last_name}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-ink text-sm font-medium" htmlFor="email">Email address</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    id="email" type="email" placeholder="you@email.com"
                    className={`w-full bg-surface-card border border-hairline text-ink placeholder-muted-soft text-sm px-4 pl-11 py-3 rounded-lg outline-none transition-all duration-150 focus:border-primary/50 shadow-sm ${errors.email ? 'border-mood-negative focus:border-mood-negative' : ''}`}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                {errors.email && <p className="text-mood-negative text-xs pt-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-ink text-sm font-medium" htmlFor="password">Password</label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    id="password" type={showPassword ? 'text' : 'password'} placeholder="Create password"
                    className={`w-full bg-surface-card border border-hairline text-ink placeholder-muted-soft text-sm px-4 pl-11 pr-12 py-3 rounded-lg outline-none transition-all duration-150 focus:border-primary/50 shadow-sm ${errors.password ? 'border-mood-negative focus:border-mood-negative' : ''}`}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-mood-negative text-xs pt-1">{errors.password}</p>}
                
                <div className="pt-2 grid grid-cols-1 gap-1.5">
                  {passwordRequirements.map((req, i) => {
                    const isValid = req.regex.test(form.password);
                    return (
                      <div key={i} className={`flex items-center gap-2 text-xs ${isValid ? 'text-mood-positive' : 'text-muted-soft'}`}>
                        {isValid ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                        <span>{req.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-2 bg-primary text-on-primary rounded-lg text-sm font-semibold transition-all hover:bg-primary-active disabled:opacity-50 disabled:cursor-not-allowed mt-8 shadow-sm"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account…</> : <>Sign up <ArrowRight size={16} /></>}
              </button>
            </form>

            <div className="relative my-6 font-sans">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-hairline"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-canvas text-muted">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center w-full">
              <GoogleOAuthProvider clientId="165775322221-6v6dmvv9t5aa6stgdeu5eq2p1aehjhd6.apps.googleusercontent.com">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setServerError("Google Login popup was closed or failed.")}
                  theme="outline"
                  shape="rectangular"
                  size="large"
                  text="signup_with"
                />
              </GoogleOAuthProvider>
            </div>

            <p className="text-center text-muted text-sm pt-4 font-sans">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:text-primary-active font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </main>

      <aside className="hidden md:flex md:w-1/2 bg-surface-card border-l border-hairline relative items-center justify-center p-16 lg:p-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-canvas rounded-full blur-[120px] opacity-60" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-lg space-y-16 text-center"
        >
          <h2 className="text-5xl lg:text-6xl font-medium text-ink tracking-tighter leading-[1.05] font-serif">
            A private space for your thoughts.
          </h2>

          <div className="grid grid-cols-2 gap-8 text-left max-w-md mx-auto font-sans">
            <div className="space-y-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              <h4 className="text-ink font-medium text-sm">24/7 AI Companion</h4>
              <p className="text-muted text-xs leading-relaxed">Always available to listen, analyze, and support without judgment.</p>
            </div>
            <div className="space-y-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              <h4 className="text-ink font-medium text-sm">Secure & Private</h4>
              <p className="text-muted text-xs leading-relaxed">Your emotional data is protected with industry-standard encryption.</p>
            </div>
            <div className="space-y-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              <h4 className="text-ink font-medium text-sm">Mood Tracking</h4>
              <p className="text-muted text-xs leading-relaxed">Identify patterns and insights into your emotional well-being over time.</p>
            </div>
            <div className="space-y-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              <h4 className="text-ink font-medium text-sm">Cognitive Exercises</h4>
              <p className="text-muted text-xs leading-relaxed">Utilize simple tools to manage stress, anxiety, and difficult emotions.</p>
            </div>
          </div>
        </motion.div>
      </aside>
    </div>
  );
}