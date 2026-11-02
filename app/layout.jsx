import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ReduxProvider from "@/providers/ReduxProvider";
import QueryProvider from "@/providers/QueryProvider";
import { CompanyProvider } from "@/providers/CompanyProvider";
import ThemeProvider from "@/providers/ThemeProvider";
import StoreProvider from "@/store/StoreProvider.jsx";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import LogoutOverlay from "@/components/layout/LogoutOverlay";
import PwaRegister from "@/components/pwa/PwaRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SaafAI Dashboard",
  description: "Admin dashboard",
  manifest: "/manifest.json",
  icons: {
    icon: "/flo-mascot.png",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SaafAI Dash",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0891b2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <StoreProvider>
          <QueryProvider>
            <ThemeProvider>
              {/* <LayoutWrapper> */}
              <CompanyProvider>
                <PwaRegister />
                {children}
                <LogoutOverlay />
              </CompanyProvider>
              {/* </LayoutWrapper> */}
            </ThemeProvider>
          </QueryProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
