import "./globals.css";
import type { Metadata } from "next";
import { metadataObj } from "./utils/metadata";

import { Providers } from "./redux/StoreProvider";
import Layout from "./components/layout/Layout";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import SessionWrapper from "./components/nextauth/SessionWrapper";
import Script from "next/script";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "KiAcademy – Learn Anything, Anytime",
  description:
    "KiAcademy is a modern learning platform combining the best of Coursera, Udemy, and edX. Explore expert-led courses, earn certifications, and upskill from anywhere.",
  keywords: [
    "online courses",
    "e-learning",
    "KiAcademy",
    "online education",
    "certification",
    "upskilling",
    "edtech",
    "Coursera alternative",
    "Udemy alternative",
    "edX alternative",
    "learn online",
    "virtual classroom",
    "professional development",
    "tech courses",
    "business courses",
    "coding bootcamp",
  ],
  applicationName: "KiAcademy",
  authors: [{ name: "KiAcademy Team", url: "https://kiacademy.in" }],
  creator: "KiAcademy",
  publisher: "KiAcademy",
  metadataBase: new URL("https://kiacademy.in"),
  openGraph: {
    title: "KiAcademy – Learn Anything, Anytime",
    description:
      "Access thousands of online courses from top educators. KiAcademy blends Coursera's structure, Udemy's flexibility, and edX's credibility into one unified platform.",
    url: "https://kiacademy.in",
    siteName: "KiAcademy",
    images: [
      {
        url: "https://kiacademy.in/og-image.jpg", // Replace with your actual OG image
        width: 1200,
        height: 630,
        alt: "KiAcademy – Online Learning Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KiAcademy – Learn Anything, Anytime",
    description:
      "Learn with KiAcademy, the all-in-one platform for modern learners. Courses, certifications, and real-world skills in one place.",
    site: "@kiacademy", // Replace with your actual Twitter handle
    images: ["https://kiacademy.in/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    noimageindex: false,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
};

export const viewport = {
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Bootstrap CDN fallback (though unnecessary if using npm install) */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-..."
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 5000 }} />
        <SessionWrapper>
          <Providers>
            <Layout>
              <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
            </Layout>
          </Providers>
        </SessionWrapper>

        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
