import PwaRegister from "@/components/pwa/PwaRegister";

export const metadata = {
  title: "SaafAI - Citizen Feedback",
  description: "Citizen Washroom Experience & Feedback",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SaafAI Feedback",
  },
};

export default function FeedbackLayout({ children }) {
  return (
    <>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#284e3a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <PwaRegister />
      {children}
    </>
  );
}
