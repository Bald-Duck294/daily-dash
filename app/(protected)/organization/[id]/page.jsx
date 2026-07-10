"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  Building2,
  Mail,
  FileText,
  Edit2,
  Save,
  X,
  ArrowLeft,
  Power
} from "lucide-react";

// ✅ Import your TanStack Query hooks
import { 
  useCompany, 
  useUpdateCompany, 
  useToggleCompanyStatus 
} from "@/features/companies/queries/companies.queries.js"; // Adjust path as needed

export default function SingleCompanyView() {
  const params = useParams();
  const router = useRouter();
  const companyId = params?.id;

  // ✅ TanStack Queries & Mutations
  const { data: company, isLoading, isError, error } = useCompany(companyId);
  const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany();
  const { mutate: toggleStatus, isPending: isToggling } = useToggleCompanyStatus();

  // Local State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact_email: "",
    description: "",
  });

  // Sync form data when the company data loads
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        contact_email: company.contact_email || "",
        description: company.description || "",
      });
    }
  }, [company]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData({
      name: company.name || "",
      contact_email: company.contact_email || "",
      description: company.description || "",
    });
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Company name is required");
      return;
    }

    updateCompany(
      { id: companyId, companyData: formData },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Company updated successfully!");
        },
        onError: (err) => {
          toast.error(err.message || "Failed to update company");
        },
      }
    );
  };

  const handleStatusToggle = () => {
    // Assuming your hook expects the exact opposite of the current status
    // Note: Adjust the key 'status' or 'is_active' based on what your backend actually expects in the toggle payload.
    const newStatus = !company.status; 
    
    toggleStatus(
      { id: companyId, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Company marked as ${newStatus ? 'Active' : 'Inactive'}`);
        },
        onError: (err) => {
          toast.error(err.message || "Failed to update status");
        },
      }
    );
  };

  // Loading & Error States
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <p className="text-gray-500">{error?.message || "Company not found."}</p>
        <button onClick={() => router.back()} className="text-indigo-600 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

return (
    <div className="w-full p-4 md:p-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Toaster position="top-center" />
      
      <div className="max-w-3xl w-full mx-auto space-y-4">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <ArrowLeft size={18} className="text-slate-600 dark:text-slate-300" />
            </button>
            <h1 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Building2 className="text-orange-500 dark:text-orange-400" size={24} />
              Company Profile
            </h1>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex cursor-pointer items-center gap-2 bg-orange-500 dark:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors shadow-sm"
            >
              <Edit2 size={14} /> Edit Details
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="flex cursor-pointer items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50"
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex cursor-pointer items-center gap-2 bg-green-600 dark:bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50"
              >
                <Save size={14} /> {isUpdating ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden transition-colors duration-200">
          {/* Header Banner - Soft light orange shade */}
          <div className="h-20 bg-orange-100 dark:bg-orange-900/30" />
          
          <div className="px-6 pb-6">
            {/* Avatar & Status Setup */}
            <div className="relative flex justify-between items-end -mt-10 mb-6">
              <div className="w-20 h-20 rounded-xl shadow-lg border-4 border-white dark:border-slate-800 flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                <Building2 size={36} className="text-orange-500 dark:text-orange-400" />
              </div>
              
              <div className="flex flex-col items-end gap-2 mb-2">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Created {new Date(company.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <Building2 size={14} className="text-orange-500 dark:text-orange-400" /> Company Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder-slate-400"
                    placeholder="Enter company name"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                    {company.name || <span className="text-slate-400 italic font-normal">Not provided</span>}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <Mail size={14} className="text-orange-500 dark:text-orange-400" /> Contact Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder-slate-400"
                    placeholder="company@example.com"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                    {company.contact_email || <span className="text-slate-400 italic font-normal">Not provided</span>}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <FileText size={14} className="text-orange-500 dark:text-orange-400" /> Description
                </label>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none placeholder-slate-400"
                    placeholder="Enter company description..."
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700/80 p-3 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm whitespace-pre-wrap leading-relaxed min-h-[60px]">
                    {company.description || <span className="text-slate-400 italic font-normal">No description available.</span>}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}