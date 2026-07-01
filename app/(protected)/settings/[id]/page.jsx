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
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Toaster position="top-center" />
      
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <UserIcon className="text-indigo-600 dark:text-indigo-400" size={28} />
              My Profile
            </h1>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex cursor-pointer items-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm"
            >
              <Edit2 size={16} /> Edit Details
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="flex cursor-pointer items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex cursor-pointer items-center gap-2 bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50"
              >
                <Save size={16} /> {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-200">
          {/* Header Banner */}
          <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700" />
          
          <div className="px-8 pb-8">
            {/* Avatar & Role Setup */}
            <div className="relative flex justify-between items-end -mt-12 mb-8">
              <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-3xl font-black">
                {initials}
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <span className="px-4 py-1.5 rounded-lg border bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold text-sm shadow-sm transition-colors">
                  {getRoleText()}
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              
              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <UserIcon size={16} className="text-gray-400 dark:text-gray-500" /> Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="text-base text-slate-800 dark:text-slate-200 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-transparent dark:border-gray-700">
                      {user.name || <span className="text-gray-400 dark:text-gray-500 italic">Not provided</span>}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Mail size={16} className="text-gray-400 dark:text-gray-500" /> Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="your@email.com"
                    />
                  ) : (
                    <p className="text-base text-slate-800 dark:text-slate-200 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-transparent dark:border-gray-700">
                      {user.email || <span className="text-gray-400 dark:text-gray-500 italic">Not provided</span>}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Phone size={16} className="text-gray-400 dark:text-gray-500" /> Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-base text-slate-800 dark:text-slate-200 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-transparent dark:border-gray-700">
                      {user.phone || <span className="text-gray-400 dark:text-gray-500 italic">Not provided</span>}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Section - ONLY VISIBLE WHEN EDITING */}
              {isEditing && (
                <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                      <ShieldAlert size={20} className="text-indigo-600 dark:text-indigo-400" />
                      Update Password
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Leave these fields blank if you do not wish to change your password.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="w-full p-3 pr-10 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full p-3 pr-10 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full p-3 pr-10 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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