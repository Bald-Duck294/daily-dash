"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { Eye, EyeClosed, Smartphone } from "lucide-react";
import { AuthApi } from "@/features/auth/auth.api.js";
import { loginStart, loginFailure } from "@/features/auth/auth.slice.js";
import { useAuthSuccess } from "@/features/auth/useAuthSuccess";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const handleAuthSuccess = useAuthSuccess();

  const [loading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ phone: "", password: "" });

  // ─── GOOGLE AUTHENTICATION INITIALIZATION ───────────────────
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => initializeGoogleSignIn();
    document.head.appendChild(script);

    return () => document.head.removeChild(script);
  }, []);

  const initializeGoogleSignIn = () => {
    if (!window.google) return;

    try {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
      });

      const renderOptions = { theme: "outline", size: "large", width: 200 };
      const desktopOverlay = document.getElementById("google-btn-overlay");
      if (desktopOverlay) window.google.accounts.id.renderButton(desktopOverlay, renderOptions);
    } catch (error) {
      console.error("Google script initialization failed:", error);
    }
  };

  const handleGoogleCredentialResponse = async (googleResponse) => {
    setIsLoading(true);
    dispatch(loginStart());

    try {
      const response = await AuthApi.googleLogin(googleResponse.credential);
      if (response.success || response.status === "success") {
        const user = response.user || response.data?.user;
        handleAuthSuccess(user, response.data || response);
      } else {
        toast.error(response.error || "Google Authentication failed.");
        dispatch(loginFailure(response.error));
      }
    } catch (error) {
      console.error("Google Auth error:", error);
      toast.error("An unexpected error occurred during Google sign in.");
      dispatch(loginFailure(error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    dispatch(loginStart());

    try {
      const response = await AuthApi.login(loginData.phone, loginData.password);
      if (response.success || response.status === "success") {
        const user = response.user || response.data?.user;
        handleAuthSuccess(user, response);
      } else {
        toast.error(response.error || response.message || "Login failed.");
        dispatch(loginFailure(response.error));
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || "An unexpected error occurred.");
      dispatch(loginFailure(error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-view active" style={{ display: 'flex' }}>
      <div className="brand-header">
        <div className="brand-title">Saaf<span>AI</span></div>
        <div className="brand-divider">
          <div className="line"></div>
          <div className="text">PORTAL-1</div>
          <div className="line"></div>
        </div>
        <div className="brand-tagline">Smart Waste Management Platform</div>
      </div>

      <div className="section-separator"></div>

      <form onSubmit={handleLoginSubmit}>
        <div className="form-group">
          <label htmlFor="phone">Mobile Number</label>
          <div className="input-wrapper">
            <span className="input-icon-left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <input
              type="tel"
              id="phone"
              inputMode="numeric"
              placeholder="10-digit mobile number"
              value={loginData.phone}
              onChange={(e) =>
                setLoginData((prev) => ({
                  ...prev,
                  phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                }))
              }
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper" style={{ position: "relative" }}>
            <span className="input-icon-left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>

            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter your password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              required
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
                padding: 0
              }}
            >
              {showPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
            </button>
          </div>
        </div>

        <div className="form-link-row auth-links-row">
          <Link href="/register" className="auth-link register-link">
            Don't have an account? Register
          </Link>
          <span className="auth-links-divider">|</span>
          <Link href="/forgot-password" className="auth-link forgot-password-link">
            Forgot Password?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn-login">
          {loading ? "Authenticating..." : "Login"}
          {!loading && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          )}
        </button>

        <div className="or-divider">OR CONTINUE WITH</div>

        <div className="social-btn-group">
          {/* 🔓 GOOGLE LOGIN WITH TRANSPARENT SECURE OVERLAY CONTAINER */}
          <div className="social-btn-wrapper">
            <div id="google-btn-overlay" className="google-iframe-overlay" />
            <button type="button" className="btn-social">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-1.14 2.77-2.4 3.63v3h3.86c2.26-2.09 3.67-5.17 3.67-8.48z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.13C3.26 21.35 7.37 24 12 24z" />
                <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.57H1.29C.47 8.2.0 10.05.0 12s.47 3.8 1.29 5.43l3.98-3.14z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.65 1.29 6.57l3.98 3.14c.95-2.85 3.6-4.96 6.73-4.96z" />
              </svg>
              Google
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}