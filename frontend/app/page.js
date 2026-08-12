'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MessageCircleHeart, LineChart, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const features = [
  {
    icon: MessageCircleHeart,
    title: 'AI-Powered Chat',
    description:
      'Talk freely to an empathetic AI that listens without judgment. Available 24/7, always patient, always present.',
    size: 'col-span-1 row-span-1',
  },
  {
    icon: LineChart,
    title: 'Mood Tracking',
    description:
      'Visualize your emotional journey over time with beautiful charts. Spot patterns, celebrate streaks, and understand your triggers.',
    size: 'col-span-1 row-span-1',
  },
  {
    icon: ShieldCheck,
    title: 'Crisis Safety Net',
    description:
      "MindMate detects distress signals in real time. In moments of crisis, it instantly surfaces local helplines — so you're never alone.",
    size: 'col-span-1 row-span-1 md:col-span-1',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('mindmate_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-canvas font-sans antialiased selection:bg-primary/20 selection:text-ink overflow-x-hidden">
      <Navbar />

      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-32">
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e6dfd8_1px,transparent_1px),linear-gradient(to_bottom,#e6dfd8_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-10">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="inline-flex items-center gap-2 bg-surface-card border border-hairline rounded-full px-4 py-1.5 text-xs font-medium text-muted font-sans"
          >
            <Sparkles size={14} className="text-primary" />
            <span>AI-powered emotional support, available 24/7</span>
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter text-ink leading-[1.05] font-serif"
          >
            Your Mind,{' '}
            <span className="text-muted-soft">Understood.</span>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed font-sans"
          >
            A safe, AI-powered space to vent, reflect, and track your emotional
            well-being 24/7. No judgment. No waiting rooms. Just understanding.
          </motion.p>

          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4 font-sans"
          >
            {!mounted ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                <div className="h-12 w-full sm:w-40" />
                <div className="h-12 w-full sm:w-48" />
              </div>
            ) : isLoggedIn ? (
              <>
                <Link
                  href="/chat"
                  className="h-12 px-8 flex items-center justify-center gap-2 bg-primary text-on-primary rounded-lg text-sm font-semibold transition-all hover:bg-primary-active shadow-sm"
                >
                  Continue to Chat
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/dashboard"
                  className="h-12 px-8 flex items-center justify-center gap-2 bg-transparent border border-hairline text-ink rounded-lg text-sm font-medium transition-all hover:bg-surface-soft"
                >
                  View Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="h-12 px-8 flex items-center justify-center gap-2 bg-primary text-on-primary rounded-lg text-sm font-semibold transition-all hover:bg-primary-active shadow-sm"
                >
                  Start for free
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/login"
                  className="h-12 px-8 flex items-center justify-center gap-2 bg-transparent border border-hairline text-ink rounded-lg text-sm font-medium transition-all hover:bg-surface-soft"
                >
                  Sign in to your space
                </Link>
              </>
            )}
          </motion.div>

          <motion.p
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-muted-soft text-sm font-medium tracking-wide font-sans"
          >
            Free to start · No credit card · Crisis-safe
          </motion.p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-32 border-t border-hairline">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="text-center mb-20 space-y-4"
        >
          <p className="text-primary font-semibold text-xs uppercase tracking-widest font-sans">The Platform</p>
          <h2 className="text-3xl md:text-5xl font-medium text-ink tracking-tighter font-serif">
            Everything you need to feel better
          </h2>
          <p className="text-muted max-w-xl mx-auto leading-relaxed text-lg font-sans">
            Built with care. Designed for real humans. Powered by cutting-edge AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                className={`bg-surface-card border border-hairline rounded-2xl p-10 space-y-6 transition-all shadow-sm hover:shadow hover:border-hairline-soft ${feature.size}`}
              >
                <div className="w-12 h-12 rounded-lg bg-canvas border border-hairline flex items-center justify-center text-primary">
                  <Icon size={20} strokeWidth={2} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-ink font-semibold text-xl tracking-tight">{feature.title}</h3>
                  <p className="text-body text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="relative rounded-3xl overflow-hidden bg-surface-card border border-hairline shadow-sm"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

          <div className="relative z-10 py-24 px-8 md:px-16 text-center flex flex-col items-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-medium text-ink tracking-tighter max-w-2xl font-serif">
              Your journey to emotional clarity starts today.
            </h2>
            <p className="text-muted max-w-lg mx-auto leading-relaxed text-lg font-sans">
              Join thousands of people who use MindMate to understand themselves better. Free, private, and always here.
            </p>

            <div className="h-12 flex items-center justify-center font-sans">
              {!mounted ? (
                <div className="h-12 w-48" />
              ) : isLoggedIn ? (
                <Link
                  href="/chat"
                  className="h-12 px-8 flex items-center justify-center gap-2 bg-primary text-on-primary rounded-lg text-sm font-semibold transition-all hover:bg-primary-active shadow-sm"
                >
                  Return to Chat <ArrowRight size={16} />
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="h-12 px-8 flex items-center justify-center gap-2 bg-primary text-on-primary rounded-lg text-sm font-semibold transition-all hover:bg-primary-active shadow-sm"
                >
                  Begin your journey <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}