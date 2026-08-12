'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, BarChart2, BookOpen, Settings } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    let maxHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      
      if (currentHeight > maxHeight) {
        maxHeight = currentHeight;
      }
      
      // If height drops significantly (> 150px), keyboard is likely open
      if (currentHeight < maxHeight - 150) {
        setIsKeyboardOpen(true);
        document.body.classList.add('keyboard-open');
      } else {
        setIsKeyboardOpen(false);
        document.body.classList.remove('keyboard-open');
      }
    };

    window.addEventListener('resize', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
      document.body.classList.remove('keyboard-open');
    };
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart2 },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Journal', href: '/journal', icon: BookOpen },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-canvas/90 backdrop-blur-md border-t border-hairline pb-2 transition-transform duration-300 ease-in-out ${isKeyboardOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted hover:text-ink'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-primary' : ''} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
