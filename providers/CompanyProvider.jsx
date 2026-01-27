"use client";

import { createContext, useContext, useState } from "react";

const CompanyContext = createContext(null);

export function CompanyProvider({ children }) {
  const [companyId, setCompanyId] = useState(null);

  return (
    <CompanyContext.Provider value={{ companyId, setCompanyId }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompanyId() {
  const context = useContext(CompanyContext);

  if (!context) {
    throw new Error("useCompanyId must be used inside CompanyProvider");
  }

  return context;
}
