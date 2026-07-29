"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeClosed } from "lucide-react";
import { AuthApi } from "@/features/auth/auth.api.js";
import { useAuthSuccess } from "@/features/auth/useAuthSuccess";

export default function RegisterProfilePage() {
  const router = useRouter();
  const handleAuthSuccess = useAuthSuccess();

  const [loading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [regData, setRegData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [registrationToken, setRegistrationToken] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    // Check for registrationToken and phone in sessionStorage
    const token = sessionStorage.getItem("registrationToken");
    const storedPhone = sessionStorage.getItem("registerPhone");

    if (!token || !storedPhone) {
      toast.error(
        "Session expired or invalid. Please verify your phone number again.",
      );
      router.push("/register");
    } else {
      setRegistrationToken(token);
      setPhone(storedPhone);
    }
  }, [router]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setIsLoading(true);
    try {
      // 1. Create the account
      const payload = {
        name: regData.name,
        email: regData.email,
        phone: phone,
        password: regData.password,
        role_id: 2,
        registrationToken: registrationToken, // New requirement
      };

      const response = await AuthApi.register(payload);

      if (!response.success) {
        throw new Error(response.error || "Registration failed");
      }

      toast.success("Account created! Logging you in...");

      // Clear session storage since registration is done
      sessionStorage.removeItem("registrationToken");
      sessionStorage.removeItem("registerPhone");

      // 2. Auto Login
      const loginResponse = await AuthApi.login(phone, regData.password);

      if (loginResponse.success || loginResponse.status === "success") {
        const user = loginResponse.user || loginResponse.data?.user;
        handleAuthSuccess(user, loginResponse);
      } else {
        toast.error("Auto-login failed. Please log in manually.");
        router.push("/login");
      }
    } catch (error) {
      toast.error(error.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!registrationToken) {
    return null; // Return nothing while checking session storage
  }

  return (
    <div className="auth-view active" style={{ display: "flex" }}>
      <div className="brand-header">
        <div className="brand-title">
          Create <span>Profile</span>
        </div>
        <div className="brand-tagline">Tell us a bit about yourself</div>
      </div>

      <div className="section-separator"></div>

      <form onSubmit={handleRegisterSubmit} autoComplete="off">
        <div className="form-group">
          <label htmlFor="reg-name">Full Name</label>
          <div className="input-wrapper">
            <span className="input-icon-left">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <input
              type="text"
              id="reg-name"
              placeholder="John Doe"
              value={regData.name}
              onChange={(e) =>
                setRegData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reg-email">
            Email Address{" "}
            <span
              style={{
                color: "#94a3b8",
                fontSize: "0.75rem",
                fontWeight: 500,
                marginLeft: "4px",
              }}
            >
              (Optional)
            </span>
          </label>
          <div className="input-wrapper">
            <span className="input-icon-left">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </span>
            <input
              type="email"
              id="reg-email"
              placeholder="john@example.com"
              value={regData.email}
              onChange={(e) =>
                setRegData((prev) => ({ ...prev, email: e.target.value }))
              }
              autoComplete="off"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reg-password">Password</label>
          <div className="input-wrapper" style={{ position: "relative" }}>
            <span className="input-icon-left">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>

            <input
              type={showPassword ? "text" : "password"}
              id="reg-password"
              placeholder="Create a secure password"
              value={regData.password}
              onChange={(e) =>
                setRegData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
              autoComplete="new-password"
              style={{ paddingRight: "40px" }}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                padding: 0,
              }}
            >
              {showPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <div className="input-wrapper" style={{ position: "relative" }}>
            <span className="input-icon-left">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>

            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirm-password"
              placeholder="Re-enter your password"
              value={regData.confirmPassword}
              onChange={(e) =>
                setRegData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              required
              autoComplete="new-password"
              style={{ paddingRight: "40px" }}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                padding: 0,
              }}
            >
              {showConfirmPassword ? (
                <Eye size={18} />
              ) : (
                <EyeClosed size={18} />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-login"
          style={{
            background: "linear-gradient(120deg, #10b981 0%, #059669 100%)",
            boxShadow: "0 6px 20px rgba(16, 185, 129, 0.3)",
          }}
        >
          {loading ? "Creating account..." : "Complete Registration"}
        </button>
      </form>
    </div>
  );
}
