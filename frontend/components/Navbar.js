'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Brain, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Mark component as mounted to safely render browser-only data
    setMounted(true);

    // 2. Check if the user is logged in
    const token = localStorage.getItem('mindmate_token');
    if (token) {
      setIsLoggedIn(true);
    }

    // 3. Handle scroll blur effect
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800'
        : 'bg-transparent border-b border-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group w-fit">
          <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
            <Brain size={16} className="text-zinc-950" />
          </div>
          <span className="text-zinc-50 font-semibold tracking-tight text-lg">
            MindMate<span className="text-zinc-600">.ai</span>
          </span>
        </Link>

        {/* Nav Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Prevent Hydration Mismatch by waiting for mount */}
          {!mounted ? (
            <div className="h-10 w-32"></div> // Invisible placeholder to prevent layout shift
          ) : isLoggedIn ? (
            // ─── LOGGED IN STATE ───
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-zinc-400 hover:text-zinc-50 transition-colors px-3 py-2 rounded-lg hover:bg-zinc-900 hidden sm:block"
              >
                Dashboard
              </Link>
              <Link
                href="/chat"
                className="h-9 sm:h-10 px-4 sm:px-5 flex items-center justify-center gap-2 bg-zinc-50 text-zinc-950 rounded-lg text-sm font-semibold transition-all hover:bg-zinc-200 shrink-0"
              >
                <span>Go to App</span>
                <ArrowRight size={16} className="hidden sm:block" />
              </Link>
            </>
          ) : (
            // ─── LOGGED OUT STATE ───
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-400 hover:text-zinc-50 transition-colors px-3 py-2 rounded-lg hover:bg-zinc-900"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="h-9 sm:h-10 px-4 sm:px-5 flex items-center justify-center bg-zinc-50 text-zinc-950 rounded-lg text-sm font-semibold transition-all hover:bg-zinc-200 shrink-0"
              >
                <span className="hidden sm:inline">Get started free</span>
                <span className="sm:hidden">Start free</span>
              </Link>
            </>
          )}
        </div>

      </div>
    </motion.nav>
  );
}