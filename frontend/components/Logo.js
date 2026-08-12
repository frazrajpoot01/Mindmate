import Link from 'next/link';
import BrandIcon from './BrandIcon';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 select-none cursor-pointer group w-fit">
      {/* Empathetic 'Interlocking Connection' Mark */}
      <BrandIcon className="w-8 h-8 transition-transform group-hover:scale-105 duration-500 ease-in-out" />
      
      {/* Editorial Wordmark */}
      <span className="font-serif text-2xl tracking-tight text-ink font-medium">
        MindMate<span className="text-primary">.ai</span>
      </span>
    </Link>
  );
}
