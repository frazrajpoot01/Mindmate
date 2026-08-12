import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-canvas border-t border-hairline pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Col */}
          <div className="md:col-span-4">
            <Logo />
            <p className="mt-5 text-sm text-muted leading-relaxed pr-4 font-sans">
              An AI-powered mental health companion helping you understand and nurture your emotional well-being safely and privately.
            </p>
          </div>

          {/* Links Cols */}
          <div className="md:col-span-2">
            <h4 className="font-serif text-lg text-ink font-medium mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-muted font-sans">
              <li><Link href="#" className="hover:text-primary transition-colors">Mental Health Guides</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Self-Care Tips</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Community Forum</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-serif text-lg text-ink font-medium mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-muted font-sans">
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Data Processing</Link></li>
            </ul>
          </div>

          {/* Crisis Card Col */}
          <div className="md:col-span-4">
            <div className="bg-surface-card p-6 rounded-xl border border-hairline shadow-sm">
              <h4 className="font-serif text-lg text-ink font-medium mb-4">In Crisis?</h4>
              <ul className="space-y-4 text-sm font-sans">
                <li className="flex flex-col">
                  <a href="tel:1166" className="font-medium text-primary hover:text-primary-active transition-colors w-fit">1166</a>
                  <span className="text-muted text-xs">National Helpline</span>
                </li>
                <li className="flex flex-col">
                  <a href="tel:03174288665" className="font-medium text-primary hover:text-primary-active transition-colors w-fit">0317-4288665</a>
                  <span className="text-muted text-xs">Umang Mental Health</span>
                </li>
                <li className="flex flex-col">
                  <a href="tel:115" className="font-medium text-primary hover:text-primary-active transition-colors w-fit">115</a>
                  <span className="text-muted text-xs">Edhi Foundation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-hairline pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-soft font-sans">
          <p className="text-center md:text-left max-w-2xl">
            MindMate is an AI companion, not a medical service or suicide prevention hotline.
          </p>
          <p>© 2026 MindMate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}