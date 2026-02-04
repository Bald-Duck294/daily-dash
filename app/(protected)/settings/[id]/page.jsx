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
    <div className="min-h-screen bg-[var(--dashboard-bg)] px-4 py-8 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ================= PROFILE CARD ================= */}
        <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[var(--radius)] shadow-[var(--card-shadow)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--card-border)] bg-[var(--muted)]">
            <h1 className="text-base font-semibold text-[var(--foreground)]">
              Profile
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Personal information & account overview
            </p>
          </div>

          <div className="p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <div className="w-28 h-28 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-2xl font-black shadow-md">
              {initials}
            </div>

            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                {user.name}
              </h2>
              <p className="text-sm text-red-500 font-bold">
                {userRole}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {user.email}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {user.phone || "—"}
              </p>
            </div>
          </div>
        </section>

        {/* ================= SECURITY ================= */}
        <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[var(--radius)] shadow-[var(--card-shadow)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--card-border)] bg-[var(--muted)]">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Security
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Update your account password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 max-w-md space-y-4">

            {error && (
              <div className="text-sm text-red-500 font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-600 font-medium">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[var(--input)] border border-[var(--border)] rounded-[var(--radius)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--input)] border border-[var(--border)] rounded-[var(--radius)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[var(--input)] border border-[var(--border)] rounded-[var(--radius)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-[var(--primary)] disabled:opacity-60 text-[var(--primary-foreground)] rounded-[var(--radius)] px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition"
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
