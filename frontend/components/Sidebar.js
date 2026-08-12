'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, BarChart2, BookOpen, Settings, LogOut, Trash2 } from 'lucide-react';
import Logo from './Logo';
import { chatApi } from '../lib/api';

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('mindmate_token');
    document.cookie = "mindmate_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = '/login';
  };

  const handleClearChat = async () => {
    try {
      await chatApi.clearChat();
      window.location.href = '/chat';
    } catch (err) {
      console.error("Failed to clear chat:", err);
    }
  };

  const navItems = [
    { name: 'AI Chat', href: '/chat', icon: MessageSquare },
    { name: 'Mood Dashboard', href: '/dashboard', icon: BarChart2 },
    { name: 'Journal Archive', href: '/journal', icon: BookOpen },
    { name: 'Account Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-hairline bg-canvas h-screen sticky top-0 overflow-y-auto">
      <div className="h-16 px-5 border-b border-hairline flex items-center justify-between shrink-0">
        <Logo />
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return isActive ? (
            <div key={item.name} className="bg-surface-card rounded-lg px-3 py-2.5 flex items-center gap-3 text-ink mt-1">
              <Icon size={16} className="text-primary" />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
          ) : (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted hover:text-ink hover:bg-surface-soft transition-all text-sm mt-1"
            >
              <Icon size={16} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-hairline space-y-1">
        {pathname === '/chat' && (
          <button
            onClick={handleClearChat}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted hover:text-mood-negative hover:bg-mood-negative/10 transition-all text-sm"
          >
            <Trash2 size={15} />
            Clear chat
          </button>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted hover:text-ink hover:bg-surface-soft transition-all text-sm"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
