import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Application metadata for SEO and social sharing.
 */
export const metadata: Metadata = {
  title: "GradeSight | Student Performance Prediction Dashboard",
  description:
    "AI-powered student performance prediction and analytics dashboard. Upload student data to get insights, risk assessments, and grade predictions.",
  keywords: [
    "student performance",
    "grade prediction",
    "education analytics",
    "machine learning",
    "data science",
  ],
  authors: [{ name: "GradeSight Team" }],
  openGraph: {
    title: "GradeSight | Student Performance Prediction",
    description: "AI-powered student performance prediction and analytics",
    type: "website",
  },
};

/**
 * Viewport configuration for responsive design.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

/**
 * Root layout component.
 * Provides global styles and font configuration.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
