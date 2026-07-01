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
    <div className="min-h-screen p-6 bg-gray-50 text-slate-800">
      <Toaster position="top-center" />
      
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 cursor-pointer bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
              <Building2 className="text-indigo-600" size={28} />
              Company Profile
            </h1>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex cursor-pointer items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Edit2 size={16} /> Edit Details
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="flex cursor-pointer items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex cursor-pointer items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
              >
                <Save size={16} /> {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600" />
          
          <div className="px-8 pb-8">
            {/* Avatar & Status Setup */}
            <div className="relative flex justify-between items-end -mt-12 mb-8">
              <div className="w-24 h-24 bg-white rounded-xl shadow-md border border-gray-100 flex items-center justify-center">
                <Building2 size={48} className="text-indigo-400" />
              </div>
              
              <div className="flex flex-col items-end gap-2">
                {/* Status Toggle */}
                {/* <button
                  onClick={handleStatusToggle}
                  disabled={isToggling}
                  className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    company.status 
                      ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" 
                      : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  } disabled:opacity-50`}
                >
                  <Power size={16} />
                  <span className="font-semibold text-sm">
                    {company.status ? "Active Account" : "Inactive Account"}
                  </span>
                </button> */}
                <p className="text-xs text-gray-500">
                  Created {new Date(company.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Building2 size={16} className="text-gray-400" /> Company Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Enter company name"
                  />
                ) : (
                  <p className="text-lg text-slate-800 bg-gray-50 p-3 rounded-lg border border-transparent">
                    {company.name || <span className="text-gray-400 italic">Not provided</span>}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Mail size={16} className="text-gray-400" /> Contact Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="company@example.com"
                  />
                ) : (
                  <p className="text-lg text-slate-800 bg-gray-50 p-3 rounded-lg border border-transparent">
                    {company.contact_email || <span className="text-gray-400 italic">Not provided</span>}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FileText size={16} className="text-gray-400" /> Description
                </label>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                    placeholder="Enter company description..."
                  />
                ) : (
                  <p className="text-base text-slate-700 bg-gray-50 p-4 rounded-lg border border-transparent whitespace-pre-wrap leading-relaxed min-h-[100px]">
                    {company.description || <span className="text-gray-400 italic">No description available.</span>}
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