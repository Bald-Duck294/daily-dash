// layout.jsx (SERVER)
import AuthChecker from "@/components/layout/AuthChecker";


// import PageLayout from "@/components/layout/PageLayout";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

export default function ProtectedLayout({ children }) {
  return (
   
    <AuthChecker>
      {/* <PageLayout>{children}</PageLayout> */}
      <LayoutWrapper>{children}</LayoutWrapper>
    </AuthChecker>
   
  );
}
