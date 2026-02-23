import type { Metadata, Viewport } from "next";
import { Poppins, Fira_Code } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

/**
 * Application metadata for SEO and social sharing.
 */
export const metadata: Metadata = {
  title: "PlacePredict | Student Placement Probability Predictor",
  description:
    "ML-powered placement probability prediction for students. Analyze your profile, get probability scores, and receive personalized improvement suggestions.",
  keywords: [
    "placement prediction",
    "campus placement",
    "software developer",
    "machine learning",
    "career guidance",
    "student placement",
  ],
  authors: [{ name: "PlacePredict Team" }],
  openGraph: {
    title: "PlacePredict | Placement Probability Predictor",
    description: "ML-powered placement probability prediction and analysis",
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
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
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
        className={`${poppins.variable} ${firaCode.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
