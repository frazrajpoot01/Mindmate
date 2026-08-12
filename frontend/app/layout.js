import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ['400', '500', '600'],
  variable: "--font-cormorant",
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
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#faf9f5" />
      </head>
      <body className={`${inter.variable} ${cormorant.variable} font-sans antialiased bg-canvas text-ink`}>
        {children}
      </body>
    </html>
  );
}
