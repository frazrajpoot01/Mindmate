'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Logo from './Logo';

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans ${scrolled
        ? 'bg-canvas/80 backdrop-blur-md border-b border-hairline'
        : 'bg-transparent border-b border-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Logo />

        {/* Nav Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Prevent Hydration Mismatch by waiting for mount */}
          {!mounted ? (
            <div className="h-10 w-32"></div> // Invisible placeholder to prevent layout shift
          ) : isLoggedIn ? (
            // ─── LOGGED IN STATE ───
            <Link
              href="/dashboard"
              className="px-4 py-2 flex items-center justify-center gap-2 bg-primary text-on-primary rounded-md text-sm font-medium transition-colors hover:bg-primary-active shrink-0 shadow-sm"
            >
              <span className="hidden sm:inline">Open Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
              <ArrowRight size={16} className="hidden sm:block" />
            </Link>
          ) : (
            // ─── LOGGED OUT STATE ───
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-ink hover:text-primary transition-colors px-2"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 flex items-center justify-center bg-primary text-on-primary rounded-md text-sm font-medium transition-colors hover:bg-primary-active shrink-0 shadow-sm"
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