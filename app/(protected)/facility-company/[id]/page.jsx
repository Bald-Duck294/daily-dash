/* eslint-disable react-hooks/immutability */
"use client";

import React, { useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Check,
  X,
  Shield,
  Briefcase,
  Clock,
  ExternalLink,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Loader from "@/components/ui/Loader";

import { useCompanyId } from "@/providers/CompanyProvider";
import { usePermissions } from "@/shared/hooks/usePermission";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

// Import the TanStack Query hook
import { useFacilityCompanyById } from "@/features/facilityCompany/facilityCompany.queries";

export default function ViewFacilityCompanyPage() {
  useRequirePermission(MODULES.FACILITY_COMPANIES);

  const { canUpdate } = usePermissions();
  const canEditFacility = canUpdate(MODULES.FACILITY_COMPANIES);

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId");
  const facilityCompanyId = params.id;

  /* =====================================================
     TANSTACK QUERY (Data Fetching)
  ===================================================== */
  const {
    data: facilityCompany,
    isLoading,
    isError,
    error,
  } = useFacilityCompanyById(facilityCompanyId);

  /* =====================================================
     SIDE EFFECTS (Error Handling & Redirect)
  ===================================================== */
  useEffect(() => {
    if (isError) {
      toast.error(error?.message || "Failed to load facility company details");
      const timer = setTimeout(() => {
        router.push(`/facility-company?companyId=${companyId}`);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isError, error, router, companyId]);

  /* =====================================================
     HANDLERS & HELPERS
  ===================================================== */
  const handleViewLocations = () => {
    router.push(
      `/washrooms?companyId=${companyId}&facilityCompanyId=${facilityCompanyId}&facilityCompanyName=${encodeURIComponent(
        facilityCompany?.name || ""
      )}`
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =====================================================
     RENDER STATES
  ===================================================== */
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--facility-bg)" }}
      >
        <Loader size="large" color="var(--primary)" />
      </div>
    );
  }

  // If it's done loading but there is no data (or an error occurred)
  if (!facilityCompany) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "var(--facility-bg)" }}
      >
        <div className="text-center">
          <Building2
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "var(--facility-muted-text)" }}
          />

          <p
            className="font-medium"
            style={{ color: "var(--facility-muted-text)" }}
          >
            Facility company not found
          </p>

          <button
            onClick={() => router.push(`/facility-company?companyId=${companyId}`)}
            className="mt-4 font-bold transition-colors"
            style={{ color: "var(--primary)" }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      <div
        className="min-h-screen p-6 flex justify-center pb-20"
        style={{ background: "var(--facility-bg)" }}
      >
        <div className="w-full max-w-5xl space-y-8">
          {/* --- HEADER --- */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Back button */}
              <button
                onClick={() =>
                  router.push(`/facility-company?companyId=${companyId}`)
                }
                className="p-2 rounded-xl transition-colors shadow-sm"
                style={{
                  background: "var(--facility-surface)",
                  border: "1px solid var(--facility-border)",
                  color: "var(--facility-muted-text)",
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div>
                {/* Title */}
                <h1
                  className="text-2xl font-bold"
                  style={{ color: "var(--facility-title)" }}
                >
                  {facilityCompany.name}
                </h1>

                <div className="flex items-center gap-2 mt-1">
                  {/* Status badge */}
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide"
                    style={{
                      background: facilityCompany.status
                        ? "var(--facility-status-active-bg)"
                        : "var(--facility-status-inactive-bg)",
                      color: facilityCompany.status
                        ? "var(--facility-status-active-text)"
                        : "var(--facility-status-inactive-text)",
                      borderColor: "var(--facility-border)",
                    }}
                  >
                    {facilityCompany.status ? (
                      <Check size={12} strokeWidth={3} />
                    ) : (
                      <X size={12} strokeWidth={3} />
                    )}
                    {facilityCompany.status ? "Active" : "Inactive"}
                  </span>

                  {/* Created date */}
                  <span
                    className="text-xs flex items-center gap-1"
                    style={{ color: "var(--facility-muted-text)" }}
                  >
                    <Clock size={12} /> Added{" "}
                    {formatDate(facilityCompany.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full sm:w-auto">
              {/* View washrooms */}
              <button
                onClick={handleViewLocations}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl transition-all shadow-sm font-bold text-xs uppercase tracking-wide"
                style={{
                  background: "var(--facility-surface)",
                  border: "1px solid var(--facility-border)",
                  color: "var(--facility-muted-text)",
                }}
              >
                <MapPin className="w-4 h-4" /> View Washrooms
              </button>

              {/* Edit CTA */}
              {canEditFacility && (
                <button
                  onClick={() =>
                    router.push(
                      `/facility-company/${facilityCompanyId}/edit?companyId=${companyId}`
                    )
                  }
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl transition-all shadow-lg font-bold text-xs uppercase tracking-wide"
                  style={{
                    background: "var(--facility-primary-bg)",
                    color: "var(--facility-primary-text)",
                  }}
                >
                  <Edit className="w-4 h-4" /> Edit Company
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN - MAIN INFO */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. BASIC INFO */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "var(--facility-surface)",
                  border: "1px solid var(--facility-border)",
                  boxShadow: "var(--facility-shadow)",
                }}
              >
                <div
                  className="flex items-center gap-3 mb-6 pb-4"
                  style={{ borderBottom: "1px solid var(--facility-border)" }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: "var(--facility-icon-bg)",
                      color: "var(--facility-icon-text)",
                    }}
                  >
                    <Building2 size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2
                      className="text-sm font-black uppercase tracking-[0.15em]"
                      style={{ color: "var(--facility-title)" }}
                    >
                      Company Profile
                    </h2>
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80"
                      style={{ color: "var(--facility-muted-text)" }}
                    >
                      Primary Information
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  {[
                    ["Company Name", facilityCompany.name],
                    ["Organization", facilityCompany.company?.name || "N/A"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <label
                        className="text-[10px] font-bold uppercase tracking-wider block mb-1"
                        style={{ color: "var(--facility-muted-text)" }}
                      >
                        {label}
                      </label>
                      <p
                        className="text-sm font-bold"
                        style={{ color: "var(--facility-title)" }}
                      >
                        {value}
                      </p>
                    </div>
                  ))}

                  <div>
                    <label
                      className="text-[10px] font-bold uppercase tracking-wider block mb-1"
                      style={{ color: "var(--facility-muted-text)" }}
                    >
                      Email Address
                    </label>
                    <a
                      href={`mailto:${facilityCompany.email}`}
                      className="text-sm font-medium flex items-center gap-1 hover:underline"
                      style={{ color: "var(--primary)" }}
                    >
                      {facilityCompany.email || "N/A"}{" "}
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  <div>
                    <label
                      className="text-[10px] font-bold uppercase tracking-wider block mb-1"
                      style={{ color: "var(--facility-muted-text)" }}
                    >
                      Phone Number
                    </label>
                    <a
                      href={`tel:${facilityCompany.phone}`}
                      className="text-sm font-medium transition-colors"
                      style={{ color: "var(--facility-title)" }}
                    >
                      {facilityCompany.phone || "N/A"}
                    </a>
                  </div>
                </div>
              </div>

              {/* 2. ADDRESS */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "var(--facility-surface)",
                  border: "1px solid var(--facility-border)",
                  boxShadow: "var(--facility-shadow)",
                }}
              >
                <div
                  className="flex items-center gap-3 mb-6 pb-4"
                  style={{ borderBottom: "1px solid var(--facility-border)" }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: "var(--facility-icon-bg)",
                      color: "var(--facility-icon-text)",
                    }}
                  >
                    <MapPin size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2
                      className="text-sm font-black uppercase tracking-[0.15em]"
                      style={{ color: "var(--facility-title)" }}
                    >
                      Location
                    </h2>
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80"
                      style={{ color: "var(--facility-muted-text)" }}
                    >
                      Headquarters Address
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: "var(--facility-muted-bg)",
                      border: "1px solid var(--facility-border)",
                    }}
                  >
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--facility-muted-text)" }}
                    >
                      {facilityCompany.address || "No address provided"}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      ["City", facilityCompany.city],
                      ["State", facilityCompany.state],
                      ["Pincode", facilityCompany.pincode],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <label
                          className="text-[10px] font-bold uppercase tracking-wider block mb-1"
                          style={{ color: "var(--facility-muted-text)" }}
                        >
                          {label}
                        </label>
                        <p
                          className="text-sm font-bold font-mono"
                          style={{ color: "var(--facility-title)" }}
                        >
                          {value || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. BUSINESS & LEGAL */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "var(--facility-surface)",
                  border: "1px solid var(--facility-border)",
                  boxShadow: "var(--facility-shadow)",
                }}
              >
                <div
                  className="flex items-center gap-3 mb-6 pb-4"
                  style={{ borderBottom: "1px solid var(--facility-border)" }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: "var(--facility-icon-bg)",
                      color: "var(--facility-icon-text)",
                    }}
                  >
                    <Shield size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2
                      className="text-sm font-black uppercase tracking-[0.15em]"
                      style={{ color: "var(--facility-title)" }}
                    >
                      Legal Details
                    </h2>
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80"
                      style={{ color: "var(--facility-muted-text)" }}
                    >
                      Registration & Compliance
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  {[
                    ["GST / Reg Number", facilityCompany.registration_number],
                    ["PAN Number", facilityCompany.pan_number],
                    ["License Number", facilityCompany.license_number],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <label
                        className="text-[10px] font-bold uppercase tracking-wider block mb-1"
                        style={{ color: "var(--facility-muted-text)" }}
                      >
                        {label}
                      </label>
                      <p
                        className="text-sm font-bold font-mono"
                        style={{ color: "var(--facility-title)" }}
                      >
                        {value || "—"}
                      </p>
                    </div>
                  ))}

                  <div>
                    <label
                      className="text-[10px] font-bold uppercase tracking-wider block mb-1"
                      style={{ color: "var(--facility-muted-text)" }}
                    >
                      License Expiry
                    </label>
                    <p
                      className="text-sm font-bold"
                      style={{
                        color:
                          new Date(facilityCompany.license_expiry_date) <
                          new Date()
                            ? "var(--facility-status-inactive-text)"
                            : "var(--facility-status-active-text)",
                      }}
                    >
                      {formatDate(facilityCompany.license_expiry_date)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - CONTACT & CONTRACT */}
            <div className="space-y-6">
              {/* 4. CONTACT PERSON */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "var(--facility-surface)",
                  border: "1px solid var(--facility-border)",
                  boxShadow: "var(--facility-shadow)",
                }}
              >
                <div
                  className="flex items-center gap-3 mb-6 pb-4"
                  style={{ borderBottom: "1px solid var(--facility-border)" }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: "var(--facility-icon-bg)",
                      color: "var(--facility-icon-text)",
                    }}
                  >
                    <User size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2
                      className="text-sm font-black uppercase tracking-[0.15em]"
                      style={{ color: "var(--facility-title)" }}
                    >
                      Primary Contact
                    </h2>
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80"
                      style={{ color: "var(--facility-muted-text)" }}
                    >
                      Representative
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Contact card */}
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background: "var(--facility-muted-bg)",
                      border: "1px solid var(--facility-border)",
                    }}
                  >
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{
                        background: "var(--facility-icon-bg)",
                        color: "var(--facility-icon-text)",
                      }}
                    >
                      {facilityCompany.contact_person_name?.charAt(0)}
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: "var(--facility-title)" }}
                      >
                        {facilityCompany.contact_person_name}
                      </p>
                      <p
                        className="text-[10px] font-bold uppercase tracking-wide"
                        style={{ color: "var(--facility-muted-text)" }}
                      >
                        Key Contact
                      </p>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-3 pt-2">
                    {[
                      [Phone, facilityCompany.contact_person_phone],
                      [Mail, facilityCompany.contact_person_email],
                    ].map(([Icon, value], i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg"
                        style={{
                          background: "var(--facility-muted-bg)",
                          border: "1px solid var(--facility-border)",
                        }}
                      >
                        <Icon
                          size={16}
                          style={{ color: "var(--facility-muted-text)" }}
                        />
                        <span
                          className="text-xs font-medium truncate"
                          style={{ color: "var(--facility-title)" }}
                        >
                          {value || "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. CONTRACT DETAILS */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "var(--facility-surface)",
                  border: "1px solid var(--facility-border)",
                  boxShadow: "var(--facility-shadow)",
                }}
              >
                <div
                  className="flex items-center gap-3 mb-6 pb-4"
                  style={{ borderBottom: "1px solid var(--facility-border)" }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: "var(--facility-icon-bg)",
                      color: "var(--facility-icon-text)",
                    }}
                  >
                    <Briefcase size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2
                      className="text-sm font-black uppercase tracking-[0.15em]"
                      style={{ color: "var(--facility-title)" }}
                    >
                      Contract Info
                    </h2>
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80"
                      style={{ color: "var(--facility-muted-text)" }}
                    >
                      Duration & Terms
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    ["Start Date", facilityCompany.contract_start_date],
                    ["End Date", facilityCompany.contract_end_date],
                  ].map(([label, date]) => (
                    <div
                      key={label}
                      className="flex justify-between items-center p-3 rounded-xl"
                      style={{ background: "var(--facility-muted-bg)" }}
                    >
                      <span
                        className="text-xs font-bold uppercase"
                        style={{ color: "var(--facility-muted-text)" }}
                      >
                        {label}
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: "var(--facility-title)" }}
                      >
                        {formatDate(date)}
                      </span>
                    </div>
                  ))}

                  {facilityCompany.description && (
                    <div
                      className="mt-4 pt-4"
                      style={{
                        borderTop: "1px solid var(--facility-border)",
                      }}
                    >
                      <label
                        className="text-[10px] font-bold uppercase tracking-wider block mb-2"
                        style={{ color: "var(--facility-muted-text)" }}
                      >
                        Notes / Description
                      </label>
                      <p
                        className="text-xs italic leading-relaxed"
                        style={{ color: "var(--facility-muted-text)" }}
                      >
                        &quot;{facilityCompany.description}&quot;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}