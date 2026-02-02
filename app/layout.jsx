import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ReduxProvider from "@/providers/ReduxProvider";
import QueryProvider from "@/providers/QueryProvider";
import { CompanyProvider } from "@/providers/CompanyProvider";
import ThemeProvider from "@/providers/ThemeProvider";
import StoreProvider from "@/store/StoreProvider.jsx";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <StoreProvider>
          <QueryProvider>
            <ThemeProvider>
              {/* <LayoutWrapper> */}
              <CompanyProvider>{children}</CompanyProvider>
              {/* </LayoutWrapper> */}
            </ThemeProvider>
          </QueryProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
