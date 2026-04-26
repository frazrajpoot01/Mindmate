import Link from 'next/link';
import { Brain, Phone, Shield, Heart } from 'lucide-react';

const footerLinks = {
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Data Processing', href: '#' },
  ],
  Resources: [
    { label: 'Mental Health Guides', href: '#' },
    { label: 'Self-Care Tips', href: '#' },
    { label: 'Community Forum', href: '#' },
    { label: 'Blog', href: '#' },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-900 bg-zinc-950 font-sans antialiased">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">

          {/* Col 1 — Brand */}
          <div className="space-y-6 md:pr-4">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0">
                <Brain size={16} className="text-zinc-950" />
              </div>
              <span className="text-zinc-50 font-semibold text-lg tracking-tight">
                MindMate<span className="text-zinc-600">.ai</span>
              </span>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed">
              An AI-powered mental health companion helping you understand and nurture your emotional well-being safely and privately.
            </p>
            <p className="text-zinc-600 text-xs">
              © {currentYear} MindMate. All rights reserved.
            </p>
          </div>

          {/* Col 2 — Legal */}
          <div>
            <h3 className="text-zinc-100 font-medium text-sm mb-6 tracking-wide">Legal</h3>
            <ul className="space-y-4">
              {footerLinks.Legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-zinc-400 hover:text-zinc-100 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Resources */}
          <div>
            <h3 className="text-zinc-100 font-medium text-sm mb-6 tracking-wide">Resources</h3>
            <ul className="space-y-4">
              {footerLinks.Resources.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-zinc-400 hover:text-zinc-100 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Crisis Helplines */}
          <div>
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-5">
              <div className="flex items-center gap-2.5">
                <Shield size={16} className="text-zinc-400" />
                <h3 className="text-zinc-100 font-semibold text-sm tracking-wide">In Crisis?</h3>
              </div>

              <ul className="space-y-4">
                <li className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-zinc-700 transition-colors">
                    <Phone size={13} className="text-zinc-300" />
                  </div>
                  <div>
                    <a href="tel:1166" className="text-zinc-50 text-sm font-semibold hover:underline">1166</a>
                    <p className="text-zinc-500 text-xs mt-0.5">National Helpline</p>
                  </div>
                </li>
                <li className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-zinc-700 transition-colors">
                    <Heart size={13} className="text-zinc-300" />
                  </div>
                  <div>
                    <a href="tel:03174288665" className="text-zinc-50 text-sm font-semibold hover:underline">0317-4288665</a>
                    <p className="text-zinc-500 text-xs mt-0.5">Umang Mental Health</p>
                  </div>
                </li>
                <li className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-zinc-700 transition-colors">
                    <Phone size={13} className="text-zinc-300" />
                  </div>
                  <div>
                    <a href="tel:115" className="text-zinc-50 text-sm font-semibold hover:underline">115</a>
                    <p className="text-zinc-500 text-xs mt-0.5">Edhi Foundation</p>
                  </div>
                </li>
              </ul>

              <div className="pt-4 border-t border-zinc-800">
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  MindMate is an AI companion, not a medical service or suicide prevention hotline.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}