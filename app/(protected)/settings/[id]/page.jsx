"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  User as UserIcon,
  Mail,
  Phone,
  Edit2,
  Save,
  X,
  ArrowLeft,
  ShieldAlert,
  Eye,
  EyeOff
} from "lucide-react";

// ✅ Import your TanStack Query hook
import { useChangeProfile } from "@/features/users/users.queries.js"; // Adjust the path as needed
// import { setCredentials } from "@/store/slices/authSlice"; // Adjust with your actual Redux action

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // ✅ Initialize TanStack Mutation
  const { mutate: updateProfileMutation, isPending } = useChangeProfile();

  // Local State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });

  // Password Visibility State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync form data and enforce self-redirect
  useEffect(() => {
    if (!user) return;
    
    if (String(user.id) !== String(id)) {
      router.replace(`/settings/${user.id}`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    }));
  }, [user, id, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      currentPassword: "",
      password: "",
      confirmPassword: "",
    });
    
    // Reset visibility states
    setShowCurrentPassword(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and Email are required");
      return;
    }

    // 1. Construct the base payload
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    };

    // 2. Validate and add password fields conditionally
    const isChangingPassword = formData.currentPassword || formData.password || formData.confirmPassword;
    
    if (isChangingPassword) {
      if (!formData.currentPassword || !formData.password || !formData.confirmPassword) {
        toast.error("All password fields are required to update your password");
        return;
      }

      if (formData.password.length < 8) {
        toast.error("Password must be at least 8 characters long");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      if (formData.currentPassword === formData.password) {
        toast.error("New password must be different from current password");
        return;
      }

      // Add passwords to the payload
      payload.currentPassword = formData.currentPassword;
      payload.newPassword = formData.password;
    }

    // 3. Trigger the mutation
    updateProfileMutation(payload, {
      onSuccess: (updatedUserData) => {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        
        // Clear password fields and hide them upon success
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          password: "",
          confirmPassword: "",
        }));
        setShowCurrentPassword(false);
        setShowPassword(false);
        setShowConfirmPassword(false);

        // ✅ Update Redux store so the UI updates instantly
        // dispatch(setCredentials({ user: updatedUserData })); 
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update profile");
      },
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getRoleText = () => {
    if (!user || !user.role_id) return "User";
    switch (user.role_id) {
      case 1: return "Super Admin";
      case 2: return "Admin";
      case 3: return "Supervisor";
      case 4: return "User";
      case 5: return "Cleaner";
      case 6: return "Zonal Admin";
      case 7: return "Facility Supervisor";
      case 8: return "Facility Admin";
      default: return "User";
    }
  };

  const initials = user.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "U";

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
              <UserIcon className="text-orange-500 dark:text-orange-400" size={24} />
              My Profile
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
                disabled={isPending}
                className="flex cursor-pointer items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50"
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex cursor-pointer items-center gap-2 bg-green-600 dark:bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50"
              >
                <Save size={14} /> {isPending ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden transition-colors duration-200">
          {/* Header Banner - Swapped to a soft, light orange shade */}
          <div className="h-20 bg-orange-100 dark:bg-orange-900/30" />
          
          <div className="px-6 pb-6">
            {/* Avatar & Role Setup */}
            <div className="relative flex justify-between items-end -mt-10 mb-6">
              <div className="w-20 h-20 rounded-xl shadow-lg border-4 border-white dark:border-slate-800 flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-orange-600 dark:text-orange-400 text-3xl font-black">
                {initials}
              </div>
              
              <div className="flex flex-col items-end gap-1 mb-2">
                <span className="px-3 py-1 rounded-lg border bg-orange-50 dark:bg-orange-900/40 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 font-bold text-xs shadow-sm transition-colors">
                  {getRoleText()}
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              
              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    <UserIcon size={14} className="text-orange-500 dark:text-orange-400" /> Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder-slate-400"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                      {user.name || <span className="text-slate-400 italic font-normal">Not provided</span>}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Mail size={14} className="text-orange-500 dark:text-orange-400" /> Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder-slate-400"
                      placeholder="your@email.com"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                      {user.email || <span className="text-slate-400 italic font-normal">Not provided</span>}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Phone size={14} className="text-orange-500 dark:text-orange-400" /> Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder-slate-400"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                      {user.phone || <span className="text-slate-400 italic font-normal">Not provided</span>}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Section - ONLY VISIBLE WHEN EDITING */}
              {isEditing && (
                <div className="pt-5 mt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="mb-4">
                    <h3 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                      <ShieldAlert size={18} className="text-orange-500 dark:text-orange-400" />
                      Update Password
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Leave these fields blank if you do not wish to change your password.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="w-full p-2.5 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm placeholder-slate-400"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full p-2.5 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm placeholder-slate-400"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full p-2.5 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm placeholder-slate-400"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}