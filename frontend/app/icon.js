import { ImageResponse } from 'next/og';
 
export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg viewBox="0 0 40 40" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="8" width="16" height="16" rx="6" stroke="#cc785c" strokeWidth="3" />
          <rect x="16" y="16" width="16" height="16" rx="6" stroke="#cc785c" strokeWidth="3" strokeOpacity="0.5" />
          <circle cx="20" cy="20" r="2.5" fill="#cc785c" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
