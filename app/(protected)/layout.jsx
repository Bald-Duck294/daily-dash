// layout.jsx (SERVER)
import AuthChecker from "./component/AuthChecker";
import ClientAuthGuard from "./component/ClientAuthGuard";

import PageLayout from "@/components/layout/PageLayout";

export default function ProtectedLayout({ children }) {
  return (
    // <ClientAuthGuard>
    <AuthChecker>
      <PageLayout>{children}</PageLayout>
    </AuthChecker>
    // </ClientAuthGuard>
  );
}
