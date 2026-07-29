"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AuthApi } from "@/features/auth/auth.api.js";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [loading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Reset Password
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  
  const [forgotData, setForgotData] = useState({ 
    newPassword: "", 
    confirmPassword: "" 
  });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) return toast.error("Enter a valid 10-digit number");

    setIsLoading(true);
    try {
      const response = await AuthApi.requestOtp(phone, "forgot");
      if (response.success) {
        toast.success("OTP sent to your mobile!");
        setStep(2);
      } else {
        toast.error(response.error || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) return toast.error("Enter a valid 6-digit OTP");

    setIsLoading(true);
    try {
      const response = await AuthApi.verifyOtp(phone, otpCode, "forgot");

      if (response.success) {
        toast.success("Number verified! You can now reset your password.");
        setStep(3);
      } else {
        toast.error(response.error || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Failed to verify OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (forgotData.newPassword !== forgotData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    
    setIsLoading(true);
    try {
      const response = await AuthApi.resetPassword(phone, forgotData.newPassword);
      if (response.success || response.status === "success") {
        toast.success("Password reset successfully! Please log in.");
        router.push("/login");
      } else {
        toast.error(response.error || "Failed to reset password.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-view active" style={{ display: 'flex' }}>
      <div className="brand-header">
        <div className="brand-title">Reset <span>Password</span></div>
        <div className="brand-tagline">
          {step === 1 && "Enter your mobile number to regain access"}
          {step === 2 && "Enter the OTP sent to your mobile"}
          {step === 3 && "Create a new password"}
        </div>
      </div>

      <div className="section-separator"></div>

      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <div className="form-group">
            <label htmlFor="forgot-phone">Registered Mobile Number</label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </span>
              <input
                type="tel"
                id="forgot-phone"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                required
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-login" style={{ background: "linear-gradient(120deg, #f59e0b 0%, #d97706 100%)", boxShadow: "0 6px 20px rgba(245, 158, 11, 0.3)" }}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp}>
          <div className="form-group">
            <label htmlFor="forgot-otp">Enter OTP</label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                type="text"
                id="forgot-otp"
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-login" style={{ background: "linear-gradient(120deg, #f59e0b 0%, #d97706 100%)", boxShadow: "0 6px 20px rgba(245, 158, 11, 0.3)" }}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleForgotSubmit}>
          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                type="password"
                id="new-password"
                placeholder="Enter new password"
                value={forgotData.newPassword}
                onChange={(e) => setForgotData((prev) => ({ ...prev, newPassword: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                type="password"
                id="confirm-password"
                placeholder="Re-enter new password"
                value={forgotData.confirmPassword}
                onChange={(e) => setForgotData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-login" style={{ background: "linear-gradient(120deg, #f59e0b 0%, #d97706 100%)", boxShadow: "0 6px 20px rgba(245, 158, 11, 0.3)" }}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}

      <Link href="/login" style={{ textDecoration: 'none' }}>
        <button type="button" className="btn-back-main">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to login
        </button>
      </Link>
    </div>
  );
}
