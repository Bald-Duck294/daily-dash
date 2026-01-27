"use client";

import { useState } from "react";
import { User, Mail, Phone, Lock } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call register / request-access API
    alert("Register / Request Access API not wired yet");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-8 shadow-xl">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50">
          <User className="h-7 w-7 text-amber-400" />
        </div>

        {/* Title */}
        <h1 className="text-center text-xl font-semibold tracking-wide text-black">
          SAFAI PORTAL
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          Create your administrator account to manage workspaces.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold tracking-widest text-orange-500">
              FULL NAME
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
              <User className="h-4 w-4 text-gray-400" />
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold tracking-widest text-orange-500">
              EMAIL ADDRESS
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@safai.gov"
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          {/* Phone + Password */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold tracking-widest text-orange-500">
                PHONE NUMBER
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    }))
                  }
                  inputMode="numeric"
                  placeholder="9876543210"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold tracking-widest text-orange-500">
                ACCESS PASSWORD
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                <Lock className="h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400 py-3 text-sm font-semibold tracking-wider text-white shadow-md hover:opacity-90"
          >
            REQUEST PORTAL ACCESS
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          EXISTING USER?{" "}
          <a
            href="/login"
            className="font-semibold tracking-wide text-orange-500 hover:underline"
          >
            SIGN IN TO PORTAL
          </a>
        </p>
      </div>
    </div>
  );
}
