// layout.jsx (SERVER)
import ClientAuthGuard from "./component/ClientAuthGuard";

import PageLayout from "@/components/layout/PageLayout";

export default function ProtectedLayout({ children }) {
  return (
    <ClientAuthGuard>
      <PageLayout>{children}</PageLayout>
    </ClientAuthGuard>
  );
}
