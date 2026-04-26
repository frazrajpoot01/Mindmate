import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "MindMate — Your AI Mental Health Companion",
  description:
    "A safe, AI-powered space to vent, reflect, and track your emotional well-being 24/7. MindMate understands your mind.",
  keywords: ["mental health", "AI therapy", "mood tracking", "wellness", "mindmate"],
  openGraph: {
    title: "MindMate — Your AI Mental Health Companion",
    description: "A safe, AI-powered space to vent, reflect, and track your emotional well-being.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0B0F19" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-[#0B0F19] text-slate-200`}>
        {children}
      </body>
    </html>
  );
}
