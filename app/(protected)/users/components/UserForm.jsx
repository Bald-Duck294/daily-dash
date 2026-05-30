"use client";

import { useState, useEffect, useMemo } from "react";
import { useCompanyId } from "@/providers/CompanyProvider";
import { useSelector } from "react-redux";
// TanStack Query Hooks
import { useGetAllRoles } from "@/features/roles/queries/roles.queries"; 
import { useCompany } from "@/features/companies/queries/companies.queries"; 

export default function UserForm({
  initialData,
  onSubmit,
  isEditing = false,
  canSubmit = true,
  locations = [],           // ✅ Now receiving locations from parent
  isLoadingLocations = false // ✅ Now receiving loading state from parent
}) {
  const { companyId } = useCompanyId();

  // --- TANSTACK QUERIES ---
  const { data: companyData, isLoading: isLoadingCompany } = useCompany(companyId);
  const { data: allRoles, isLoading: isLoadingRoles } = useGetAllRoles({ enabled: !!companyId });

  // --- DERIVED STATE ---
  const isLoadingData = isLoadingCompany || isLoadingRoles || isLoadingLocations;
  const currentUser = useSelector((state) => state.auth.user);
  
  const roles = useMemo(() => (allRoles || []).filter((role) => role.id !== 1), [allRoles]);

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role_id: "",
    company_id: companyId,
    location_ids: [],
  });

  const [canAssignLocation, setCanAssignLocation] = useState(false);

  // --- EFFECTS ---
  
  // 1. Initialize Form Data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "",
        phone: initialData.phone || "",
        role_id: initialData.role_id || "",
        company_id: companyId,
        location_ids:
          initialData.location_assignments
            ?.filter((a) => a.is_active)
            .map((a) => a.location_id.toString()) || [],
      });
    }
  }, [initialData, companyId]);

  // 2. Handle Location Assignment Visibility
  useEffect(() => {
    const isSuperadmin = currentUser?.role_id === 1;

    const selectedRole = roles.find(
      (r) => r.id.toString() === formData.role_id.toString(),
    );
    
    const hasPermissionToAssign = 
      isSuperadmin || 
      (selectedRole && ["Admin", "Supervisor"].includes(selectedRole.name));
    
    setCanAssignLocation(hasPermissionToAssign);
  }, [formData.role_id, roles, currentUser]);

  // --- EVENT HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLocationChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      location_ids: checked
        ? [...prev.location_ids, value]
        : prev.location_ids.filter((id) => id !== value),
    }));
  };

  const isFormValid = () => {
    const hasName = formData.name.trim().length > 0;
    const hasPhone = formData.phone.trim().length === 10;
    const hasRole = formData.role_id !== "";
    const hasPassword = isEditing || formData.password.trim().length >= 6;
    return hasName && hasPhone && hasRole && hasPassword;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      company_id: companyId,
      role_id: formData.role_id ? parseInt(formData.role_id) : null,
    };
    onSubmit(dataToSend);
  };

  const inputClass = "w-full px-4 py-2.5 text-sm rounded-lg outline-none transition-all";
  const labelClass = "block text-xs font-semibold mb-2 uppercase tracking-wide";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Operation Node Section */}
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center"
          style={{ background: "var(--user-add-header-bg)" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--user-add-accent)" }}
            aria-hidden="true"
          >
            <path d="M10 12h4" />
            <path d="M10 8h4" />
            <path d="M14 21v-3a2 2 0 0 0-4 0v3" />
            <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
            <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
          </svg>
        </div>

        <div>
          <h3
            className="text-sm font-black uppercase tracking-tight"
            style={{ color: "var(--user-add-title)" }}
          >
            Assigned Operation Node
          </h3>
          <p
            className="text-xs font-medium"
            style={{ color: "var(--user-add-subtitle)" }}
          >
            Select the operation node for this user
          </p>
        </div>
      </div>

      {/* User Information Section */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: "var(--user-form-accent)" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <h2
            className="text-base font-bold"
            style={{ color: "var(--user-form-text)" }}
          >
            User Information
          </h2>
        </div>

        <div>
          <label className={labelClass} style={{ color: "var(--user-form-label)" }}>
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={inputClass}
            style={{
              background: "var(--user-form-input-bg)",
              border: "1px solid var(--user-form-input-border)",
              color: "var(--user-form-text)",
            }}
            placeholder="Legal Name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={{ color: "var(--user-form-label)" }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
              style={{
                background: "var(--user-form-input-bg)",
                border: "1px solid var(--user-form-input-border)",
                color: "var(--user-form-text)",
              }}
              placeholder="staff@saaf.ai"
            />
          </div>

          <div>
            <label className={labelClass} style={{ color: "var(--user-form-label)" }}>
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
              required
              maxLength={10}
              pattern="[0-9]{10}"
              style={{
                background: "var(--user-form-input-bg)",
                border: "1px solid var(--user-form-input-border)",
                color: "var(--user-form-text)",
              }}
              placeholder="Mobile Number"
            />
          </div>
        </div>
      </div>

      {/* Access & Security Section */}
      <div className="space-y-5 pt-4">
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: "var(--user-form-accent)" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h2
            className="text-base font-bold"
            style={{ color: "var(--user-form-text)" }}
          >
            Access &amp; Security
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={{ color: "var(--user-form-label)" }}>
              <span className="flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ color: "var(--user-form-label)" }}
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Password {!isEditing && "*"}
              </span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!isEditing}
              className={inputClass}
              placeholder="••••••"
              minLength={!isEditing ? 6 : undefined}
              style={{
                background: "var(--user-form-input-bg)",
                border: "1px solid var(--user-form-input-border)",
                color: "var(--user-form-text)",
              }}
            />
          </div>

          <div>
            <label className={labelClass} style={{ color: "var(--user-form-label)" }}>
              <span className="flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ color: "var(--user-form-label)" }}
                >
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
                Access Level *
              </span>
            </label>
            <select
              name="role_id"
              value={formData.role_id}
              onChange={handleChange}
              required
              disabled={isLoadingData}
              className={inputClass}
              style={{
                background: "var(--user-form-input-bg)",
                border: "1px solid var(--user-form-input-border)",
                color: "var(--user-form-text)",
              }}
            >
              <option value="">
                {isLoadingData ? "Loading roles..." : "Select role"}
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Location Assignment */}
      {canAssignLocation && (
        <div className="pt-4">
          <label className={labelClass} style={{ color: "var(--user-form-label)" }}>
            Assign Locations (Optional)
          </label>

          <div
            className="mt-2 p-4 rounded-lg max-h-48 overflow-y-auto space-y-2.5"
            style={{
              background: "var(--user-form-muted-bg)",
              border: "1px solid var(--user-form-border)",
            }}
          >
            {isLoadingLocations ? ( 
              <p className="text-sm" style={{ color: "var(--user-form-subtext)" }}>
                Loading locations...
              </p>
            ) : locations.length > 0 ? ( 
              locations.map((loc) => (
                <label
                  key={loc.id}
                  className="flex items-center gap-3 cursor-pointer p-2 rounded transition-colors"
                  style={{ color: "var(--user-form-text)" }}
                >
                  <input
                    type="checkbox"
                    name="location_ids"
                    value={loc.id.toString()}
                    checked={formData.location_ids.includes(loc.id.toString())}
                    onChange={handleLocationChange}
                    className="h-4 w-4 rounded"
                    style={{ accentColor: "var(--user-form-success)" }}
                  />
                  <span className="text-sm font-medium">{loc.name}</span>
                </label>
              ))
            ) : (
              <p className="text-sm" style={{ color: "var(--user-form-subtext)" }}>
                No locations available.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
     <div className="flex justify-end gap-3 pt-6 border-t border-[var(--user-form-border)]">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="cursor-pointer px-6 py-2.5 text-sm font-semibold rounded-lg"
          style={{ background: "var(--user-form-cancel-bg)", color: "var(--user-form-cancel-text)" }}
        >
          CANCEL
        </button>
        <button
          type="submit"
          disabled={isLoadingData || !isFormValid() || !canSubmit}
          className="cursor-pointer px-6 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-50"
          style={{ background: "var(--user-form-submit-bg)", color: "var(--user-form-submit-text)" }}
        >
          {isEditing ? "SAVE CHANGES" : "CREATE USER"}
        </button>
      </div>
    </form>
  );
}