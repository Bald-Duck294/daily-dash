"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AuthApi } from "@/features/auth/auth.api.js";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");

  // ─── GOOGLE AUTHENTICATION INITIALIZATION ───────────────────
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => initializeGoogleSignIn();
    document.head.appendChild(script);

    return () => document.head.removeChild(script);
  }, [step]); // Re-initialize if step changes and button is rendered again

  const initializeGoogleSignIn = () => {
    if (!window.google) return;

    try {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
      });

      const renderOptions = { theme: "outline", size: "large", width: 200 };
      const registerOverlay = document.getElementById("google-register-overlay");
      if (registerOverlay) window.google.accounts.id.renderButton(registerOverlay, renderOptions);
    } catch (error) {
      console.error("Google script initialization failed:", error);
    }
  };

  const handleGoogleCredentialResponse = async (googleResponse) => {
    // Implement standard google login for register view too, or direct to profile setup
    // Since backend google-login already registers/logs in, we just call AuthApi.googleLogin
    setIsLoading(true);
    try {
      const response = await AuthApi.googleLogin(googleResponse.credential);
      if (response.success || response.status === "success") {
        toast.success("Successfully authenticated with Google");
        router.push("/dashboard"); // or use handleAuthSuccess
      } else {
        toast.error(response.error || "Google Authentication failed.");
      }
    } catch (error) {
      console.error("Google Auth error:", error);
      toast.error("An unexpected error occurred during Google sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) return toast.error("Enter a valid 10-digit number");

    setIsLoading(true);
    try {
      const response = await AuthApi.requestOtp(phone, "register");
      if (response.success) {
        toast.success("OTP sent for registration!");
        setStep(2);
      } else {
        // If 409, show "Phone number already exists"
        toast.error(response.error || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) return toast.error("Enter a valid 6-digit OTP");

    setIsLoading(true);
    try {
      const response = await AuthApi.verifyOtp(phone, otpCode, "register");

      if (response.success && response.data?.registrationToken) {
        toast.success("Number verified! Please complete your profile.");
        // Temporarily save token and phone to persist across routes
        sessionStorage.setItem("registrationToken", response.data.registrationToken);
        sessionStorage.setItem("registerPhone", phone);
        router.push("/register/profile");
      } else {
        toast.error(response.error || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Failed to verify OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-view active" style={{ display: 'flex' }}>
      <div className="brand-header">
        <div className="brand-title">Create <span>Account</span></div>
        <div className="brand-tagline">Join SaafAI Portal today</div>
      </div>

      <div className="section-separator"></div>

      {step === 1 && (
        <form onSubmit={handleRegSendOtp}>
          <div className="form-group">
            <label htmlFor="reg-phone">Mobile Number</label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </span>
              <input
                type="tel"
                id="reg-phone"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                required
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-login" style={{ background: "linear-gradient(120deg, #10b981 0%, #059669 100%)", boxShadow: "0 6px 20px rgba(16, 185, 129, 0.3)" }}>
            {loading ? "Sending..." : "Send OTP"}
          </button>

          <div className="or-divider">OR SIGN UP WITH</div>
          <div className="social-btn-group">
            <div className="social-btn-wrapper">
              <div id="google-register-overlay" className="google-iframe-overlay" />
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
      )}

      {step === 2 && (
        <form onSubmit={handleRegVerifyOtp}>
          <div className="form-group">
            <label htmlFor="reg-otp">Enter OTP</label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                type="text"
                id="reg-otp"
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-login" style={{ background: "linear-gradient(120deg, #10b981 0%, #059669 100%)", boxShadow: "0 6px 20px rgba(16, 185, 129, 0.3)" }}>
            {loading ? "Verifying..." : "Verify Number"}
          </button>
        </form>
      )}

      <Link href="/login" style={{ textDecoration: 'none' }}>
        <button type="button" className="btn-back-main">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Already have an account? Log in
        </button>
      </Link>
    </div>
  );
}
