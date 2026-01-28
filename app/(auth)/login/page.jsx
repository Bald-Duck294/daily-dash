// src/app/login/page.jsx
"use client";

import { useState } from "react";
import { ShieldCheck, Phone, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

import { AuthApi } from "@/features/auth/auth.api.js";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "@/features/auth/auth.slice.js";

export default function LoginPage() {
  //   const [phone, setPhone] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [password, setPassword] = useState("");
  const [loading, setIsLoading] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  // const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     setLoading(true);

  //     try {
  //         const response = await AuthApi.login(phone, password);

  //         if (!response.success || response.data?.status !== "success") {
  //             toast.error(response.error || "Invalid credentials");
  //             return;
  //         }

  //         const user = response.data.user;
  //         const token = user?.token;

  //         if (!token) {
  //             toast.error("Token missing");
  //             return;
  //         }

  //         localStorage.setItem("token", token);
  //         localStorage.setItem("user", JSON.stringify(user));

  //         dispatch(loginSuccess(user));

  //         if (Number(user.role_id) === 1) {
  //             router.replace("/dashboard");
  //         } else {
  //             router.replace(`/clientDashboard/${user.company_id}`);
  //         }
  //     } catch (err) {
  //         toast.error("Login failed");
  //     } finally {
  //         setLoading(false);
  //     }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (isLogin) {
      dispatch(loginStart());

      try {
        const response = await AuthApi.login(formData.phone, formData.password);
        console.log(response, "user login response");

        if (response.success && response.data?.status === "success") {
          const user = response.data.user;
          const token = user.token;

          if (!user?.role || !Array.isArray(user?.role?.permissions)) {
            toast.error("Invalid Login, Please Contact Support!");
            dispatch(loginFailure("Missing role/permissions"));
            return; // ✅ Early return, loading will stop in finally
          }

          if (token) {
            localStorage.setItem("token", token);
          }

          dispatch(loginSuccess(user));
          const roleId = parseInt(user?.role_id);
          toast.success(`Welcome back, ${user.name}!`);
          console.log(user.role_id, "user before redirecting ");
          console.log(user.role_id === 1, "user role id ");

          if (roleId === 1) {
            // Superadmin → Main dashboard
            console.log("Redirecting to /dashboard for superadmin");
            router.push("/dashboard");
          } else if (user.company_id) {
            // All other roles with company_id → Client dashboard
            router.push(`/clientDashboard/${user.company_id}`);
          } else {
            // No company assigned (shouldn't happen for non-superadmin)
            toast.error("No company assigned. Contact support.");
            dispatch(logout());
          }
        } else {
          toast.error(
            response.error || "Login failed. Please check your credentials.",
          );
          dispatch(loginFailure(response.error));
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error(error.message || "An unexpected error occurred.");
        dispatch(loginFailure(error.message));
      } finally {
        setIsLoading(false);
      }
    } else {
      // --- SIGNUP LOGIC ---
      try {
        const response = await AuthApi.register(formData);

        if (response.success && response.data?.message === "User registered") {
          toast.success("Registration successful! Please sign in.");
          setIsLogin(true);
          setFormData({ name: "", email: "", phone: "", password: "" });
        } else {
          toast.error(
            response.error || "Registration failed. Please try again.",
          );
        }
      } catch (error) {
        toast.error(
          error.message || "An unexpected error occurred during registration.",
        );
      } finally {
        setIsLoading(false);
      }
    }
  };
  return (
    <>
      <Toaster position="top-center" />
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
        <div className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-8 shadow-xl">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
            <ShieldCheck className="h-7 w-7 text-blue-600" />
          </div>

          {/* Title */}
          <h1 className="text-center text-xl font-semibold text-black">
            SAFAI PORTAL
          </h1>
          <p className="mt-1 text-center text-sm text-gray-500">
            Initialize an encrypted session to manage your workspace.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Phone */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <input
                  inputMode="numeric"
                  placeholder="Enter Mobile Number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    }))
                  }
                  className="w-full bg-transparent text-sm outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Access Key
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                <Lock className="h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full bg-transparent text-sm outline-none"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
            >
              <Lock className="h-4 w-4" />
              {loading ? "Authenticating..." : "Authenticate Session"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 border-t pt-4 text-center text-xs text-gray-500">
            Forgot access?{" "}
            <a href="/forgot-password" className="font-semibold text-blue-600">
              Recover Account
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
