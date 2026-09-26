"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  ShieldCheck,
  Building2,
  MapPin,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  useCompaniesDropdown,
  useDropdownLocations,
} from "@/features/dropdownList/dropdownlist.query";
import { useCompanySlaConfig } from "@/features/companies/queries/sla.queries";
import { Toaster } from "react-hot-toast";
import CompanySlaCard from "./components/CompanySlaCard";
import WashroomSlaCard from "./components/WashroomSlaCard";
import WashroomsSlaList from "./components/WashroomsSlaList";
import EscalationConfigCard from "./components/escalation/EscalationConfigCard";

export default function SlaManagementPage() {
  const { user } = useSelector((state) => state.auth);
  const isSuperAdmin = Number(user?.role_id) === 1;

  // Selected filters
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedWashroomId, setSelectedWashroomId] = useState("");

  // Queries
  const {
    data: companies = [],
    isLoading: isLoadingCompanies,
  } = useCompaniesDropdown();

  // Auto-fallback to first company if not explicitly selected
  const effectiveCompanyId =
    selectedCompanyId || (companies?.length > 0 ? String(companies[0].id) : "");

  // Query parent organization SLA status to derive master switch & baseline threshold
  const { data: companySlaData } = useCompanySlaConfig(
    effectiveCompanyId,
    Boolean(effectiveCompanyId)
  );

  const companySlaEnabled = Boolean(companySlaData?.enabled);
  const companyThreshold = Number(
    companySlaData?.configuration?.threshold_score ?? 8.0
  );

  const {
    data: locations = [],
    isLoading: isLoadingLocations,
    refetch: refetchLocations,
  } = useDropdownLocations(effectiveCompanyId ? effectiveCompanyId : null);

  // Reset washroom when company changes
  const handleCompanyChange = (e) => {
    const newCompanyId = e.target.value;
    setSelectedCompanyId(newCompanyId);
    setSelectedWashroomId("");
  };

  // Find selected objects
  const selectedCompany = companies?.find(
    (c) => String(c.id) === String(effectiveCompanyId)
  );

  const selectedWashroom = locations?.find(
    (l) => String(l.id) === String(selectedWashroomId)
  );

  const handleEditWashroom = (washroom) => {
    setSelectedWashroomId(String(washroom.id));
    const cardEl = document.getElementById("single-washroom-sla-card");
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-full mb-4">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Access Restricted
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md">
          SLA & Threshold Management is strictly reserved for SuperAdmin users.
          Please contact your administrator if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                SLA & Threshold Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure organization-level SLA standards and customize individual washroom thresholds.
              </p>
            </div>
          </div>
        </div>

        {/* Global Status Pill */}
        {selectedCompany && (
          <div className="flex items-center gap-2 self-start md:self-auto px-3.5 py-1.5 rounded-full border bg-white dark:bg-slate-900 shadow-sm border-slate-200/80 dark:border-slate-800 text-xs">
            <span className="text-slate-500 font-medium">
              {selectedCompany.name}:
            </span>
            <span
              className={`font-semibold flex items-center gap-1.5 ${
                companySlaEnabled
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  companySlaEnabled ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                }`}
              />
              {companySlaEnabled ? "Master SLA Active" : "Master SLA Disabled"}
            </span>
          </div>
        )}
      </div>

      {/* Filter / Selector Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Organization Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-500" />
              Select Organization
            </label>
            <select
              value={effectiveCompanyId}
              onChange={handleCompanyChange}
              disabled={isLoadingCompanies}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="" disabled>
                {isLoadingCompanies
                  ? "Loading organizations..."
                  : "Select an Organization"}
              </option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} 
                </option>
              ))}
            </select>
          </div>

          {/* Washroom / Location Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-500" />
              Select Single Washroom (Optional)
            </label>
            <select
              value={selectedWashroomId}
              onChange={(e) => setSelectedWashroomId(e.target.value)}
              disabled={!effectiveCompanyId || isLoadingLocations}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all cursor-pointer disabled:opacity-50"
            >
              <option value="">
                {isLoadingLocations
                  ? "Loading washrooms..."
                  : !effectiveCompanyId
                  ? "Choose an organization first"
                  : locations?.length === 0
                  ? "No washrooms found for this organization"
                  : "-- Choose a washroom to configure individual SLA --"}
              </option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main SLA Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Organization Baseline SLA Card */}
        <CompanySlaCard selectedCompany={selectedCompany} />

        {/* Single Washroom Override SLA Card */}
        <div id="single-washroom-sla-card" className="h-full">
          <WashroomSlaCard
            selectedWashroom={selectedWashroom}
            companySlaEnabled={companySlaEnabled}
            companyThreshold={companyThreshold}
            onWashroomUpdated={() => refetchLocations()}
          />
        </div>
      </div>

      {/* SLA Multi-Tier Escalation Hierarchy Section */}
      <div id="escalation-hierarchy-section">
        <EscalationConfigCard selectedCompany={selectedCompany} />
      </div>

      {/* List of Active / Setup Washroom SLAs */}
      <WashroomsSlaList
        locations={locations}
        companySlaEnabled={companySlaEnabled}
        companyThreshold={companyThreshold}
        selectedWashroomId={selectedWashroomId}
        onSelectWashroom={(loc) => setSelectedWashroomId(String(loc.id))}
        onEditWashroom={handleEditWashroom}
      />

      {/* Informational Guidance / Rule Summary Card */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-950/20 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              SLA Hierarchy & Execution Rules
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  Master Switch Dependency:
                </strong>{" "}
                Individual washroom SLAs cannot be enabled or evaluated unless the Organization Master SLA is Active.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  Automatic Fallback:
                </strong>{" "}
                When an individual washroom does not have a custom SLA configured (or has its override turned off), it automatically inherits the Organization Master SLA threshold.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  Automated Escalation Routing:
                </strong>{" "}
                When an SLA breach is triggered, the system snapshots the active hierarchy and routes notifications through defined levels (Cleaner &rarr; Supervisor &rarr; Admin) on chronological delay timers.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  Corrective Cleaning Retries:
                </strong>{" "}
                Ground staff can submit corrective cleanings up to the configured max retry attempts. Passing inspections immediately resolve and close the escalation.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: "13px",
            fontWeight: "500",
            borderRadius: "10px",
          },
        }}
      />
    </div>
  );
}
