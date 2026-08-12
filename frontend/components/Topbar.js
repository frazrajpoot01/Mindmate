import BrandIcon from './BrandIcon';
import Link from 'next/link';

export default function Topbar({ title = '', subtitle = '' }) {
  return (
    <header className="h-16 border-b border-hairline flex items-center px-4 md:px-6 gap-3 shrink-0 bg-canvas/80 backdrop-blur-sm sticky top-0 z-20 md:hidden">
      {title ? (
        <span className="font-medium text-sm text-ink">{title}</span>
      ) : (
        <Link href="/" className="flex items-center gap-3">
          <BrandIcon className="w-8 h-8" />
          <div>
            <p className="text-ink text-sm font-semibold leading-none">MindMate AI</p>
            <p className="text-muted text-xs mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-mood-positive rounded-full inline-block" />
              {subtitle || "Online & ready"}
            </p>
          </div>
        </Link>
      )}
    </header>
  );
}
