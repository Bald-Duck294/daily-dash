"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { UsersApi } from "@/features/users/users.api.js";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);

  // 🔐 Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (String(user.id) !== String(id)) {
      router.replace(`/settings/${user.id}`);
    }
  }, [user, id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (currentPassword === password) {
      setError("New password must be different from current password");
      return;
    }

    setLoading(true);

    const response = await UsersApi.changePassword({
      currentPassword,
      newPassword: password,
    });

    setLoading(false);

    if (!response.success) {
      setError(response.error || "Failed to update password");
      return;
    }

    setSuccess("Password updated successfully");

    // Clear fields
    setCurrentPassword("");
    setPassword("");
    setConfirmPassword("");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--muted-foreground)]">
        Loading profile…
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

  const userRole = getRoleText();

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-[var(--dashboard-bg)] px-4 py-10 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* ================= PROFILE CARD ================= */}
        <section className="
      bg-[var(--card-bg)]
      border border-[var(--card-border)]
      rounded-2xl
      shadow-lg
      overflow-hidden
    ">
          <div className="
        px-6 py-5
        border-b border-[var(--card-border)]
        bg-[var(--muted)]
      ">
            <h1 className="text-lg font-semibold text-[var(--foreground)]">
              Profile
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Personal information & account overview
            </p>
          </div>

          <div className="p-8 flex flex-col sm:flex-row gap-8 items-center sm:items-start">

            {/* Avatar */}
            <div className="
          w-32 h-32
          rounded-full
          bg-gradient-to-br from-[var(--primary)] to-indigo-500
          text-white
          flex items-center justify-center
          text-3xl font-black
          shadow-xl
        ">
              {initials}
            </div>

            {/* Info */}
            <div className="text-center sm:text-left space-y-3">
              <h2 className="text-2xl font-semibold text-[var(--foreground)]">
                {user.name}
              </h2>

              <span className="
            inline-block
            text-xs
            px-3 py-1
            rounded-full
            bg-red-100
            text-red-600
            font-semibold
          ">
                {userRole}
              </span>

              <div className="pt-3 space-y-1 text-sm text-[var(--muted-foreground)]">
                <p>{user.email}</p>
                <p>{user.phone || "—"}</p>
              </div>
            </div>

          </div>
        </section>


        {/* ================= SECURITY ================= */}
        <section className="
      bg-[var(--card-bg)]
      border border-[var(--card-border)]
      rounded-2xl
      shadow-lg
      overflow-hidden
    ">
          <div className="
        px-6 py-5
        border-b border-[var(--card-border)]
        bg-[var(--muted)]
      ">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Security
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Update your account password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 max-w-md space-y-6">

            {error && (
              <div className="
            rounded-lg
            bg-red-50
            border border-red-200
            text-red-600
            text-sm
            px-4 py-3
          ">
                {error}
              </div>
            )}

            {success && (
              <div className="
            rounded-lg
            bg-green-50
            border border-green-200
            text-green-600
            text-sm
            px-4 py-3
          ">
                {success}
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="
              w-full
              bg-[var(--input)]
              border border-[var(--border)]
              rounded-xl
              px-4 py-3
              text-sm
              transition
              focus:ring-2 focus:ring-[var(--primary)]
              focus:border-[var(--primary)]
              outline-none
            "
              />
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
              w-full
              bg-[var(--input)]
              border border-[var(--border)]
              rounded-xl
              px-4 py-3
              text-sm
              transition
              focus:ring-2 focus:ring-[var(--primary)]
              focus:border-[var(--primary)]
              outline-none
            "
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="
              w-full
              bg-[var(--input)]
              border border-[var(--border)]
              rounded-xl
              px-4 py-3
              text-sm
              transition
              focus:ring-2 focus:ring-[var(--primary)]
              focus:border-[var(--primary)]
              outline-none
            "
              />
            </div>

            {/* Submit */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="
              bg-gradient-to-r
              from-[var(--primary)]
              to-indigo-500
              text-white
              rounded-xl
              px-6 py-3
              text-sm font-semibold
              shadow-md
              transition
              hover:opacity-90
              disabled:opacity-60
            "
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>

          </form>
        </section>

      </div>
    </div>
  );
}
