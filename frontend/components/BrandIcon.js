export default function BrandIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={`text-primary shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* The User (Solid Line) */}
      <rect x="8" y="8" width="16" height="16" rx="6" stroke="currentColor" strokeWidth="2.5" />
      {/* The AI Companion (Transparent Line) */}
      <rect x="16" y="16" width="16" height="16" rx="6" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.4" />
      {/* The Insight / Connection Point */}
      <circle cx="20" cy="20" r="2" fill="currentColor" />
    </svg>
  );
}
