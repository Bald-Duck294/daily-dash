"use client";

import { useState } from "react";
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
  const router = useRouter();
  const dispatch = useDispatch();

  // --- UI View State ---
  const [activeView, setActiveView] = useState("main");
  const [loading, setIsLoading] = useState(false);

  // --- Form States ---
  const [loginData, setLoginData] = useState({ phone: "", password: "" });

  const [regData, setRegData] = useState({
    name: "",
    phone: "",
    password: "",
  });

  const [forgotData, setForgotData] = useState({
    phone: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ─── LOGIN HANDLER ──────────────────────────────────────────
  // const handleLoginSubmit = async (e) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   dispatch(loginStart());

  //   try {
  //     const response = await AuthApi.login(loginData.phone, loginData.password);

  //     if (response.success || response.status === "success") {
  //       const user = response.user || response.data?.user;
  //       const token = user?.token;

  //       if (!user?.role || !Array.isArray(user?.role?.permissions)) {
  //         toast.error("Invalid Login, Please Contact Support!");
  //         dispatch(loginFailure("Missing role/permissions"));
  //         return;
  //       }

  //       if (token) localStorage.setItem("token", token);
  //       dispatch(loginSuccess(user));

  //       const roleId = parseInt(user?.role_id);

  //       // Safely extract company data
  //       const companyData = response.company || user?.company || {};
  //       const isOnboardingDone = companyData?.is_onboarding_completed;
  //       const hasMetadata =
  //         companyData?.metadata?.organization_type ||
  //         companyData?.onboarding_metadata?.organization_type;
  //       const companyName = companyData?.name;

  //       // 🚀 SMART ROUTING LOGIC
  //       if (roleId === 2 && !isOnboardingDone) {
  //         // Check if they need to do Phase 1 (Company Setup)
  //         if (!hasMetadata || companyName === "Pending Setup" || !companyName) {
  //           toast("Please complete your company profile.");
  //           router.push("/company-setup");
  //         } else {
  //           // Phase 1 is done, skip questions, go straight to Phase 2 (Workspace)
  //           toast("Resuming workspace setup...");
  //           router.push("/stepper");
  //         }
  //         return;
  //       }

  //       toast.success(`Welcome back, ${user.name}!`);
  //       if (roleId === 1) {
  //         router.push("/dashboard");
  //       } else if (user.company_id) {
  //         router.push(`/clientDashboard/${user.company_id}`);
  //       } else {
  //         toast.error("No company assigned. Contact support.");
  //         dispatch(loginFailure("No company"));
  //       }
  //     } else {
  //       toast.error(response.error || response.message || "Login failed.");
  //       dispatch(loginFailure(response.error));
  //     }
  //   } catch (error) {
  //     console.error("Login error:", error);
  //     toast.error(
  //       error?.response?.data?.error || "An unexpected error occurred.",
  //     );
  //     dispatch(loginFailure(error.message));
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // ─── LOGIN HANDLER ──────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    dispatch(loginStart());

    try {
      const response = await AuthApi.login(loginData.phone, loginData.password);

      if (response.success || response.status === "success") {
        const user = response.user || response.data?.user;
        const token = user?.token;

        if (!user?.role || !Array.isArray(user?.role?.permissions)) {
          toast.error("Invalid Login, Please Contact Support!");
          dispatch(loginFailure("Missing role/permissions"));
          return;
        }

        if (token) localStorage.setItem("token", token);
        dispatch(loginSuccess(user));

        const roleId = parseInt(user?.role_id);
        toast.success(`Welcome back, ${user.name}!`);

        // 🚀 SMART ROUTING BASED ON BACKEND STATUS
        if (roleId === 2 && user.company_id) {
          try {
            // Fetch exact status from backend
            const statusRes = await AuthApi.getOnboardingStatus();

            console.log("Onboarding status response:", statusRes);
            if (statusRes.nextStep === "company") {
              toast("Please complete your company profile.");
              router.push("/company-setup");
            } else if (statusRes.nextStep === "workspace") {
              toast("Resuming workspace setup...");
              router.push("/stepper");
            } else {
              router.push(`/clientDashboard/${user.company_id}`);
            }
          } catch (statusErr) {
            console.error("Failed to get status, defaulting to dashboard");
            router.push(`/clientDashboard/${user.company_id}`);
          }
        } else if (roleId === 1) {
          router.push("/dashboard"); // Superadmin
        } else if (user.company_id) {
          router.push(`/clientDashboard/${user.company_id}`); // Regular Staff
        } else {
          toast.error("No company assigned. Contact support.");
          dispatch(loginFailure("No company"));
        }
      } else {
        toast.error(response.error || response.message || "Login failed.");
        dispatch(loginFailure(response.error));
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error?.response?.data?.error || "An unexpected error occurred.",
      );
      dispatch(loginFailure(error.message));
    } finally {
      setIsLoading(false);
    }
  };
  // ─── REGISTER HANDLER ───────────────────────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: regData.name,
        phone: regData.phone,
        password: regData.password,
        role_id: 2,
      };

      await AuthApi.register(payload);
      toast.success("Account created! Please log in to setup your workspace.");
      setActiveView("main");
      setLoginData({ phone: regData.phone, password: "" });
      setRegData({ name: "", phone: "", password: "" });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Registration failed.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ─── FORGOT PASSWORD HANDLER ────────────────────────────────
  const handleForgotSubmit = async (e) => {
    e.preventDefault();

    if (forgotData.newPassword !== forgotData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    setIsLoading(true);
    try {
      await AuthApi.resetPassword(forgotData.phone, forgotData.newPassword);
      toast.success("Password reset successfully! Please log in.");
      setActiveView("main");
      setLoginData({ phone: forgotData.phone, password: "" });
      setForgotData({ phone: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── COMING SOON HANDLER ────────────────────────────────
  const handleComingSoon = (provider) => {
    toast(`Login with ${provider} will be available soon! 🚀`, {
      icon: "✨",
      style: {
        borderRadius: "10px",
        background: "#1e293b",
        color: "#fff",
      },
    });
  };

  return (
    <>
      <Toaster position="top-center" />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .saafai-login-body {
          font-family: "Plus Jakarta Sans", sans-serif;
          height: 100vh;
          overflow: hidden;
          background-color: #f4f7ff;
          background-image:
            radial-gradient(circle at 15% 20%, rgba(59,77,242,0.07) 0%, transparent 40%),
            radial-gradient(circle at 85% 80%, rgba(92,110,255,0.07) 0%, transparent 40%),
            radial-gradient(#dde4f7 1.5px, transparent 1.5px);
          background-size: 100% 100%, 100% 100%, 24px 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem;
        }

        .page-container {
          display: flex;
          width: 100%;
          max-width: 1300px;
          height: 90vh;
          max-height: 880px;
          min-height: 600px;
          align-items: center;
          gap: 3rem;
        }

        /* ─── Left Section ───────────────────────────────── */
        .left-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          padding: 1rem 0.5rem;
          position: relative;
        }

        .left-brand-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0;
        }
        .left-brand-logo .logo-mark {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #3b4df2, #5c6eff);
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59,77,242,0.3);
        }
        .left-brand-logo .logo-mark svg { color: white; }
        .left-brand-logo .logo-name { font-size: 1.1rem; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
        .left-brand-logo .logo-name span { color: #3b4df2; }

        .mascot-container {
          position: relative;
          width: 100%;
          height: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 0.5rem;
        }

        .mascot-bg-glow {
          position: absolute;
          width: clamp(240px, 26vw, 420px);
          height: clamp(240px, 26vw, 420px);
          background: linear-gradient(145deg, #d6e0ff 0%, #eaedff 50%, #f0f3ff 100%);
          border-radius: 50%;
          z-index: 1;
          box-shadow: inset 0 0 40px rgba(255,255,255,0.7), 0 0 0 8px rgba(165,180,252,0.08), 0 0 0 16px rgba(165,180,252,0.04);
          animation: glowBreathe 3.5s ease-in-out infinite;
        }

        .pulse-ring {
          position: absolute;
          width: clamp(240px, 26vw, 420px);
          height: clamp(240px, 26vw, 420px);
          border-radius: 50%;
          border: 1.5px solid #a5b4fc;
          z-index: 0;
          opacity: 0;
          animation: pulseRing 3.5s cubic-bezier(0.2, 0.6, 0.4, 1) infinite;
        }

        .pulse-ring-1 { animation-delay: 0s; }
        .pulse-ring-2 { animation-delay: 1.17s; }
        .pulse-ring-3 { animation-delay: 2.34s; }

        @keyframes glowBreathe {
          0%, 100% { box-shadow: inset 0 0 40px rgba(255,255,255,0.7), 0 0 0 8px rgba(165,180,252,0.08), 0 0 0px rgba(165,180,252,0); }
          50% { box-shadow: inset 0 0 50px rgba(255,255,255,0.9), 0 0 0 8px rgba(165,180,252,0.12), 0 0 36px rgba(165,180,252,0.35); }
        }

        @keyframes pulseRing {
          0%   { transform: scale(0.82); opacity: 0.55; border-color: #a5b4fc; }
          70%  { opacity: 0.15; }
          100% { transform: scale(1.38); opacity: 0; border-color: #c7d2fe; }
        }

        .mascot-img {
          position: relative;
          z-index: 2;
          max-width: 70%;
          max-height: 100%;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 14px 24px rgba(100,120,252,0.3));
          transform-origin: 50% 85%;
          animation: floatMascot 3.5s ease-in-out infinite;
        }

        .shuriken {
          position: absolute;
          z-index: 4;
          width: 26px;
          height: 26px;
          top: 38%;
          left: 67%;
          opacity: 0;
          transform: translate(0, 0) rotate(0deg) scale(0.4);
          animation: throwShuriken 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }
        .shuriken-1 { animation-delay: 0s; }
        .shuriken-2 { animation-delay: 0.5s; top: 36%; animation-name: throwShuriken2; }
        .shuriken-3 { animation-delay: 1s; top: 40%; animation-name: throwShuriken3; }
        .shuriken-4 { animation-delay: 1.5s; top: 37%; animation-name: throwShuriken4; }

        @keyframes floatMascot {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1, 1); }
          20%  { transform: translateY(-6px) rotate(-2deg) scale(1.01, 0.99); }
          50%  { transform: translateY(-16px) rotate(1.5deg) scale(0.99, 1.02); }
          75%  { transform: translateY(-8px) rotate(-1deg) scale(1, 1); }
        }

        @keyframes throwShuriken {
          0%   { opacity: 0; transform: translate(0px, 0px) rotate(0deg) scale(0.4); }
          10%  { opacity: 1; transform: translate(15px, -10px) rotate(150deg) scale(1.1); }
          80%  { opacity: 1; transform: translate(150px, -38px) rotate(820deg) scale(0.95); }
          100% { opacity: 0; transform: translate(185px, -48px) rotate(1000deg) scale(0.5); }
        }
        @keyframes throwShuriken2 {
          0%   { opacity: 0; transform: translate(0px, 0px) rotate(0deg) scale(0.4); }
          10%  { opacity: 1; transform: translate(18px, -2px) rotate(150deg) scale(1.1); }
          80%  { opacity: 1; transform: translate(158px, -8px) rotate(820deg) scale(0.95); }
          100% { opacity: 0; transform: translate(192px, -10px) rotate(1000deg) scale(0.5); }
        }
        @keyframes throwShuriken3 {
          0%   { opacity: 0; transform: translate(0px, 0px) rotate(0deg) scale(0.4); }
          10%  { opacity: 1; transform: translate(14px, 8px) rotate(150deg) scale(1.1); }
          80%  { opacity: 1; transform: translate(145px, 30px) rotate(820deg) scale(0.95); }
          100% { opacity: 0; transform: translate(178px, 40px) rotate(1000deg) scale(0.5); }
        }
        @keyframes throwShuriken4 {
          0%   { opacity: 0; transform: translate(0px, 0px) rotate(0deg) scale(0.4); }
          10%  { opacity: 1; transform: translate(20px, -22px) rotate(150deg) scale(1.1); }
          80%  { opacity: 1; transform: translate(165px, -65px) rotate(820deg) scale(0.95); }
          100% { opacity: 0; transform: translate(198px, -82px) rotate(1000deg) scale(0.5); }
        }

        /* Scaled-down shuriken throws for mobile */
        @keyframes throwShurikenMobile {
          0%   { opacity: 0; transform: translate(0px, 0px) rotate(0deg) scale(0.4); }
          10%  { opacity: 1; transform: translate(6px, -4px) rotate(150deg) scale(1.1); }
          80%  { opacity: 1; transform: translate(60px, -15px) rotate(820deg) scale(0.95); }
          100% { opacity: 0; transform: translate(74px, -19px) rotate(1000deg) scale(0.5); }
        }
        @keyframes throwShurikenMobile2 {
          0%   { opacity: 0; transform: translate(0px, 0px) rotate(0deg) scale(0.4); }
          10%  { opacity: 1; transform: translate(7px, -1px) rotate(150deg) scale(1.1); }
          80%  { opacity: 1; transform: translate(63px, -3px) rotate(820deg) scale(0.95); }
          100% { opacity: 0; transform: translate(77px, -4px) rotate(1000deg) scale(0.5); }
        }
        @keyframes throwShurikenMobile3 {
          0%   { opacity: 0; transform: translate(0px, 0px) rotate(0deg) scale(0.4); }
          10%  { opacity: 1; transform: translate(6px, 3px) rotate(150deg) scale(1.1); }
          80%  { opacity: 1; transform: translate(58px, 12px) rotate(820deg) scale(0.95); }
          100% { opacity: 0; transform: translate(71px, 16px) rotate(1000deg) scale(0.5); }
        }
        @keyframes throwShurikenMobile4 {
          0%   { opacity: 0; transform: translate(0px, 0px) rotate(0deg) scale(0.4); }
          10%  { opacity: 1; transform: translate(8px, -9px) rotate(150deg) scale(1.1); }
          80%  { opacity: 1; transform: translate(66px, -26px) rotate(820deg) scale(0.95); }
          100% { opacity: 0; transform: translate(79px, -33px) rotate(1000deg) scale(0.5); }
        }

        .left-content-bottom { z-index: 2; }
        .left-panel h1 { font-size: clamp(1.5rem, 2.2vw, 2.1rem); color: #111827; font-weight: 800; line-height: 1.2; margin-bottom: 0.35rem; letter-spacing: -0.5px; }
        .left-panel h1 span { color: #3b4df2; }

        .info-icon-wrapper { margin: 0.5rem 0; display: inline-flex; align-items: center; justify-content: center; width: clamp(28px, 2.4vw, 36px); height: clamp(28px, 2.4vw, 36px); background: linear-gradient(135deg, #3b4df2, #5c6eff); border-radius: 8px; color: white; box-shadow: 0 4px 10px rgba(59,77,242,0.3); }
        .left-panel p { color: #64748b; font-size: clamp(0.8rem, 1vw, 0.9rem); line-height: 1.6; max-width: 320px; margin-bottom: 1rem; font-weight: 500; }

        .slider-dots { display: flex; gap: 6px; align-items: center; }
        .dot-bar { width: 22px; height: 4px; background: linear-gradient(90deg, #3b4df2, #5c6eff); border-radius: 10px; animation: dotPulse 3s ease-in-out infinite; }
        .dot { width: 4px; height: 4px; background-color: #c7d2fe; border-radius: 50%; transition: background 0.3s; }
        @keyframes dotPulse { 0%, 100% { width: 22px; } 50% { width: 14px; } }

        /* ─── Right Panel ────────────────────────────────── */
        .right-panel {
          flex: 0 1 480px; 
          width: 100%;
          height: 100%;
          background: #ffffff;
          border-radius: 28px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.04), 0 20px 50px -10px rgba(59,77,242,0.10), 0 0 0 1px rgba(59,77,242,0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          position: relative;
        }

        .right-panel::before {
          content: ''; position: absolute; top: 0; right: 0; width: 160px; height: 160px;
          background: radial-gradient(circle at top right, rgba(59,77,242,0.06) 0%, transparent 70%);
          border-radius: 0 28px 0 100%; pointer-events: none;
        }

        .form-container {
          padding: clamp(1.8rem, 3.5vh, 2.8rem) clamp(2rem, 3.5vw, 3rem) clamp(0.5rem, 1vh, 1rem) clamp(2rem, 3.5vw, 3rem);
          display: flex; flex-direction: column; height: calc(100% - 44px); justify-content: center;
          overflow-y: auto;
        }
        
        .form-container::-webkit-scrollbar { display: none; }

        .auth-view { display: none; flex-direction: column; height: 100%; justify-content: center; animation: viewFadeIn 0.25s ease; }
        .auth-view.active { display: flex; }
        @keyframes viewFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        .brand-header { text-align: center; margin-bottom: clamp(1rem, 2.5vh, 1.5rem); }
        .brand-title { font-size: clamp(2rem, 3vw, 2.5rem); font-weight: 800; color: #0f172a; letter-spacing: -1.5px; line-height: 1; }
        .brand-title span { background: linear-gradient(135deg, #3b4df2 0%, #5c6eff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .brand-divider { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin: 0.25rem 0; }
        .brand-divider .line { width: 28px; height: 1.5px; background: linear-gradient(90deg, transparent, #3b4df2, transparent); }
        .brand-divider .text { font-size: 0.65rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.5em; text-indent: 0.5em; }
        .brand-tagline { font-size: 0.76rem; color: #94a3b8; font-weight: 500; margin-top: 0.2rem; }
        .section-separator { height: 1px; background: linear-gradient(90deg, transparent, #e8ecf5, transparent); margin-bottom: clamp(1rem, 2vh, 1.4rem); }

        .form-group { margin-bottom: clamp(0.8rem, 2vh, 1.4rem); }
        .form-group label { display: block; font-size: clamp(0.8rem, 0.9vw, 0.875rem); font-weight: 600; color: #1e293b; margin-bottom: 0.4rem; }
        .input-wrapper { position: relative; display: flex; align-items: center; }
        .input-wrapper input {
          width: 100%; padding: clamp(11px, 1.2vw, 14px) 14px clamp(11px, 1.2vw, 14px) 44px;
          font-size: clamp(0.875rem, 0.95vw, 0.9375rem); border: 1.5px solid #e2e8f0; border-radius: 12px;
          color: #0f172a; outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; background-color: #f8faff; font-weight: 500;
        }
        .input-wrapper input::placeholder { color: #b0b8cc; font-weight: 400; }
        .input-wrapper input:focus { border-color: #3b4df2; background-color: #ffffff; box-shadow: 0 0 0 4px rgba(59,77,242,0.08); }
        .input-icon-left { position: absolute; left: 14px; color: #a0aaba; display: flex; align-items: center; transition: color 0.2s; }
        .input-wrapper:focus-within .input-icon-left { color: #3b4df2; }
        .input-icon-right { position: absolute; right: 14px; color: #a0aaba; cursor: pointer; display: flex; align-items: center; transition: color 0.2s; }
        .input-icon-right:hover { color: #3b4df2; }

        .form-link-row { display: flex; justify-content: space-between; align-items: center; margin-top: -0.1rem; margin-bottom: 1rem;}
        .auth-link { color: #3b4df2; font-size: 0.75rem; font-weight: 600; text-decoration: none; cursor: pointer; transition: opacity 0.15s; }
        .auth-link:hover { opacity: 0.75; }

        .btn-login {
          width: 100%; background: linear-gradient(120deg, #6dc1e8 0%, #3a8bbf 35%, #4f5fb0 68%, #7c4fc9 100%);
          color: white; border: none; padding: clamp(12px, 1.3vw, 16px); font-size: clamp(0.9rem, 1vw, 1rem); font-weight: 700;
          border-radius: 12px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 10px;
          margin-top: clamp(0.3rem, 0.8vh, 0.6rem); box-shadow: 0 6px 20px rgba(100,90,190,0.38);
          transition: transform 0.15s, box-shadow 0.15s, background-position 0.4s; background-size: 150% 150%; background-position: 30% 50%; letter-spacing: 0.01em;
        }
        .btn-login:hover:not(:disabled) { transform: translateY(-1.5px); box-shadow: 0 10px 28px rgba(100,90,190,0.46); background-position: 70% 50%; }
        .btn-login:active:not(:disabled) { transform: translateY(0); }
        .btn-login:disabled { opacity: 0.7; cursor: not-allowed; }

        .or-divider { display: flex; align-items: center; text-align: center; margin: clamp(0.6rem, 1.2vh, 1rem) 0; color: #b0b8cc; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; }
        .or-divider::before, .or-divider::after { content: ""; flex: 1; border-bottom: 1.5px solid #edf0f7; }
        .or-divider:not(:empty)::before { margin-right: 0.6rem; }
        .or-divider:not(:empty)::after  { margin-left: 0.6rem; }

        .social-btn-group { display: flex; gap: 0.6rem; }
        .btn-social {
          flex: 1; background-color: #f8faff; border: 1.5px solid #e2e8f0; padding: clamp(0.5rem, 0.8vw, 0.7rem);
          font-size: clamp(0.8rem, 0.9vw, 0.85rem); font-weight: 600; color: #1e293b; border-radius: 10px;
          cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 0.45rem;
          transition: background-color 0.18s, border-color 0.18s, box-shadow 0.18s, transform 0.12s;
        }
        .btn-social:hover { background-color: #eef2ff; border-color: #c7d2fe; box-shadow: 0 2px 8px rgba(59,77,242,0.1); transform: translateY(-1px); }

        .btn-back-main {
          width: 100%; background: none; border: 1.5px dashed #d1d9e6; padding: 0.5rem; font-size: 0.75rem; font-weight: 600; color: #64748b; border-radius: 10px;
          cursor: pointer; margin-top: 0.7rem; display: flex; justify-content: center; align-items: center; gap: 0.4rem; transition: all 0.2s;
        }
        .btn-back-main:hover { background: #f8fafc; color: #0f172a; border-color: #94a3b8; }

        .form-footer { background: linear-gradient(135deg, #f8faff, #fafbfe); border-top: 1px solid #edf0f9; padding: 0.7rem; text-align: center; display: flex; justify-content: center; align-items: center; gap: 0.35rem; color: #94a3b8; font-size: 0.72rem; font-weight: 500; }
        .form-footer svg { color: #3b4df2; opacity: 0.8; }

        /* Responsive Mobile Code */
        .mobile-only { display: none; }
        .mobile-mascot-block { display: none; }
        .auth-links-divider { display: none; }

        @media (max-width: 800px) {
          .saafai-login-body { overflow: auto; height: auto; padding: 0 !important; background-image: none; background-color: #eef1ff; min-height: 100dvh; }
          .page-container { flex-direction: column; width: 100%; height: 100%; min-height: 100dvh; max-height: none; gap: 0; padding: 0; max-width: none; align-items: stretch; }
          
          /* Hide Left Panel on Mobile */
          .left-panel { display: none !important; }

          /* Expand Right Panel on Mobile */
          .right-panel {
            flex: 1 1 auto; height: 100%; min-height: 100dvh; border-radius: 0; box-shadow: none; overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column; margin: 0;
            background: linear-gradient(170deg, #eef1ff 0%, #f4f6ff 30%, #ffffff 70%);
          }
          .right-panel::before { display: none; }

          /* Mobile Mascot inside Form */
          .mobile-mascot-block { display: flex; flex-direction: column; align-items: center; justify-content: center;  background: transparent; gap: 0.6rem; }
          .mobile-mascot-block .mob-brand { display: flex; align-items: center; gap: 0.5rem; }
          .mobile-mascot-block .mob-logo-mark { width: 32px; height: 32px; background: linear-gradient(135deg, #3b4df2, #5c6eff); border-radius: 9px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(59,77,242,0.3); }
          .mobile-mascot-block .mob-logo-mark svg { color: white; }
          .mobile-mascot-block .mob-logo-name { font-size: 1.15rem; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
          .mobile-mascot-block .mob-logo-name span { color: #3b4df2; }

          .mobile-mascot-block .mob-mascot-wrap { position: relative; width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; }
          .mobile-mascot-block .mob-glow { position: absolute; inset: 0; background: linear-gradient(145deg, #d6e0ff 0%, #eaedff 50%, #f0f3ff 100%); border-radius: 50%; box-shadow: inset 0 0 30px rgba(255,255,255,0.7), 0 0 0 8px rgba(165,180,252,0.08), 0 0 0 16px rgba(165,180,252,0.04); animation: glowBreathe 3.5s ease-in-out infinite; z-index: 1; }
          .mobile-mascot-block .mob-pulse { position: absolute; inset: 0; border-radius: 50%; border: 1.5px solid #a5b4fc; opacity: 0; animation: pulseRing 3.5s cubic-bezier(0.2,0.6,0.4,1) infinite; z-index: 0; }
          .mobile-mascot-block .mob-pulse-2 { animation-delay: 1.17s; }
          .mobile-mascot-block .mob-pulse-3 { animation-delay: 2.34s; }
          
          .mobile-mascot-block .mob-shuriken { position: absolute; z-index: 4; width: 14px; height: 14px; top: 38%; left: 67%; opacity: 0; transform: translate(0,0) rotate(0deg) scale(0.4); animation: throwShurikenMobile 2.2s cubic-bezier(0.25,0.46,0.45,0.94) infinite; }
          .mobile-mascot-block .mob-shuriken-2 { animation-delay:0.5s; top:36%; animation-name:throwShurikenMobile2; }
          .mobile-mascot-block .mob-shuriken-3 { animation-delay:1s;   top:40%; animation-name:throwShurikenMobile3; }
          .mobile-mascot-block .mob-shuriken-4 { animation-delay:1.5s; top:37%; animation-name:throwShurikenMobile4; }
          
          .mobile-mascot-block .mob-mascot-img { position: relative; z-index: 2; max-width: 70%; max-height: 70%; object-fit: contain; filter: drop-shadow(0 10px 18px rgba(100,120,252,0.3)); animation: floatMascot 3.5s ease-in-out infinite; }
          .mobile-mascot-block .mob-tagline { font-size: 1rem; font-weight: 800; color: #111827; letter-spacing: -0.3px; text-align: center; line-height: 1.3; display: flex; align-items: center; gap: 0.3rem; flex-wrap: wrap; justify-content: center; }
          .mobile-mascot-block .mob-tagline .accent { color: #3b4df2; }

          .auth-view .brand-header { display: none; }
          #view-main .section-separator { margin-bottom: 0.5rem; }

          .form-container { flex: 1 1 auto; height: auto; padding: 2rem 1.6rem 1.5rem; justify-content: flex-start; overflow: visible; display: flex; flex-direction: column; }
          .auth-view { height: auto; justify-content: flex-start; overflow: visible; }

          .brand-header { margin-bottom: 1.4rem; }
          .brand-title { font-size: 1.7rem; letter-spacing: -1px; }
          .brand-tagline { font-size: 0.88rem; margin-top: 0.3rem; }
          .brand-divider .text { font-size: 0.68rem; }
          .section-separator { margin-bottom: 1.5rem; }
          .form-group { margin-bottom: 1.3rem; }
          .form-group label { font-size: 0.92rem; font-weight: 600; margin-bottom: 0.5rem; }
          .input-wrapper input { font-size: 1rem; padding-top: 1rem; padding-bottom: 1rem; padding-left: 2.8rem; border-radius: 16px; }
          .input-icon-left { left: 16px; }
          .input-icon-left svg { width: 18px; height: 18px; }
          .input-icon-right svg { width: 18px; height: 18px; }
          .auth-links-row { margin-bottom: 1rem; gap: 0.5rem; }
          .register-link { font-size: 0.72rem; }
          .forgot-password-link { font-size: 0.72rem; }
          .auth-links-divider { display: inline-block; color: #cbd5e1; font-size: 0.75rem; font-weight: 300; }
          .btn-login { padding-top: 1.1rem; padding-bottom: 1.1rem; font-size: 1rem; border-radius: 16px; margin-top: 0.5rem; }
          .btn-login svg { width: 18px; height: 18px; }
          .or-divider { margin: 1.2rem 0; font-size: 0.78rem; }
          .social-btn-group { flex-direction: column; }
          .btn-social { padding-top: 0.9rem; padding-bottom: 0.9rem; font-size: 0.9rem; border-radius: 14px; }
          .btn-social svg { width: 18px; height: 18px; }
          .btn-back-main { padding: 0.75rem; font-size: 0.88rem; margin-top: 0.9rem; }
          .form-footer { font-size: 0.75rem; padding: 0.8rem; }
          .form-footer svg { width: 15px; height: 15px; }

          #view-register .form-group { margin-bottom: 1.1rem; }
          #view-register .form-group label { font-size: 0.88rem; }
          #view-register .input-wrapper input { padding-top: 0.9rem; padding-bottom: 0.9rem; }
          #view-register .btn-login { padding-top: 0.95rem; padding-bottom: 0.95rem; }
          #view-register .btn-back-main { margin-top: 0.7rem; }
        }
      `,
        }}
      />

      <div className="saafai-login-body">
        <div className="page-container">
          {/* ================= LEFT PANEL (DESKTOP) ================= */}
          <div className="left-panel">
            <div className="left-brand-logo">
              <div className="logo-mark">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span className="logo-name">
                Saaf<span>AI</span>
              </span>
            </div>

            <div className="mascot-container">
              <div className="pulse-ring pulse-ring-1"></div>
              <div className="pulse-ring pulse-ring-2"></div>
              <div className="pulse-ring pulse-ring-3"></div>
              <div className="mascot-bg-glow"></div>

              <svg
                className="shuriken shuriken-1"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                  fill="#3b4df2"
                />
              </svg>
              <svg
                className="shuriken shuriken-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                  fill="#3b4df2"
                />
              </svg>
              <svg
                className="shuriken shuriken-3"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                  fill="#3b4df2"
                />
              </svg>
              <svg
                className="shuriken shuriken-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                  fill="#3b4df2"
                />
              </svg>

              <img
                className="mascot-img"
                src="/flo-mascot.png" /* <-- ADD YOUR BASE64 / IMG SRC HERE */
                alt="SaafAI Mascot"
              />
            </div>

            <div className="left-content-bottom">
              <h1>
                Clean Today,
                <br />
                <span>Greener Tomorrow.</span>
              </h1>
              <div className="info-icon-wrapper">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072 2.143-.224 4.054.5 5.5z" />
                  <path d="M11 12a3 3 0 0 1 4.5-2.5" />
                </svg>
              </div>
              <p>
                SaafAI Portal empowers smart decisions for a cleaner and better
                future.
              </p>
              <div className="slider-dots">
                <div className="dot-bar"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT PANEL (FORMS) ================= */}
          <div className="right-panel">
            <div className="form-container">
              {/* --- MOBILE MASCOT BLOCK (Hidden on Desktop) --- */}
              <div className="mobile-mascot-block">
                <div
                  className="brand-title"
                  style={{ fontSize: "1.7rem", letterSpacing: "-1px" }}
                >
                  Saaf
                  <span
                    style={{
                      background:
                        "linear-gradient(135deg, #3b4df2 0%, #5c6eff 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    AI
                  </span>
                </div>
                <div
                  className="brand-divider"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    margin: "0.25rem 0",
                  }}
                >
                  <div
                    className="line"
                    style={{
                      width: "28px",
                      height: "1.5px",
                      background:
                        "linear-gradient(90deg, transparent, #3b4df2, transparent)",
                    }}
                  ></div>
                  <div
                    className="text"
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: "#94a3b8",
                      letterSpacing: "0.5em",
                      textIndent: "0.5em",
                    }}
                  >
                    PORTAL
                  </div>
                  <div
                    className="line"
                    style={{
                      width: "28px",
                      height: "1.5px",
                      background:
                        "linear-gradient(90deg, transparent, #3b4df2, transparent)",
                    }}
                  ></div>
                </div>
                <div
                  className="brand-tagline"
                  style={{
                    fontSize: "0.82rem",
                    color: "#94a3b8",
                    fontWeight: 500,
                    marginBottom: "0.5rem",
                  }}
                >
                  Transforming Washroom Hygiene with AI
                </div>

                <div className="mob-mascot-wrap">
                  <div className="mob-pulse"></div>
                  <div className="mob-pulse mob-pulse-2"></div>
                  <div className="mob-pulse mob-pulse-3"></div>
                  <div className="mob-glow"></div>

                  <svg className="mob-shuriken" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                      fill="#3b4df2"
                    />
                  </svg>
                  <svg
                    className="mob-shuriken mob-shuriken-2"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                      fill="#3b4df2"
                    />
                  </svg>
                  <svg
                    className="mob-shuriken mob-shuriken-3"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                      fill="#3b4df2"
                    />
                  </svg>
                  <svg
                    className="mob-shuriken mob-shuriken-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                      fill="#3b4df2"
                    />
                  </svg>

                  <img
                    className="mob-mascot-img"
                    src="/flo-mascot.png" /* <-- ADD YOUR BASE64 / IMG SRC HERE */
                    alt="SaafAI Mascot"
                  />
                </div>
                <div className="mob-tagline">
                  Clean Today,&nbsp;
                  <span className="accent">Greener Tomorrow.</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                  </svg>
                </div>
              </div>

              {/* --- VIEW: MAIN (LOGIN) --- */}
              <div
                className={`auth-view ${activeView === "main" ? "active" : ""}`}
              >
                <div className="brand-header">
                  <div className="brand-title">
                    Saaf<span>AI</span>
                  </div>
                  <div className="brand-divider">
                    <div className="line"></div>
                    <div className="text">PORTAL-1</div>
                    <div className="line"></div>
                  </div>
                  <div className="brand-tagline">
                    Smart Waste Management Platform
                  </div>
                </div>

                <div className="section-separator"></div>

                <form onSubmit={handleLoginSubmit}>
                  <div className="form-group">
                    <label htmlFor="phone">Mobile Number</label>
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
                        type="tel"
                        id="phone"
                        inputMode="numeric"
                        placeholder="10-digit mobile number"
                        value={loginData.phone}
                        onChange={(e) =>
                          setLoginData((prev) => ({
                            ...prev,
                            phone: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10),
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
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
                          <rect
                            x="3"
                            y="11"
                            width="18"
                            height="11"
                            rx="2"
                            ry="2"
                          ></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </span>
                      <input
                        type="password"
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
                      />
                    </div>
                  </div>

                  <div className="form-link-row">
                    <span
                      onClick={() => setActiveView("register")}
                      className="auth-link"
                    >
                      Don't have an account? Register
                    </span>
                    <span
                      onClick={() => setActiveView("forgot")}
                      className="auth-link"
                    >
                      Forgot Password?
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-login"
                  >
                    {loading ? "Authenticating..." : "Login"}
                    {!loading && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    )}
                  </button>

                  <div className="or-divider">OR CONTINUE WITH</div>

                  <div className="social-btn-group">
                    <button
                      type="button"
                      onClick={() => handleComingSoon("Google")}
                      className="btn-social"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-1.14 2.77-2.4 3.63v3h3.86c2.26-2.09 3.67-5.17 3.67-8.48z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.13C3.26 21.35 7.37 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.57H1.29C.47 8.2.0 10.05.0 12s.47 3.8 1.29 5.43l3.98-3.14z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.65 1.29 6.57l3.98 3.14c.95-2.85 3.6-4.96 6.73-4.96z"
                        />
                      </svg>
                      Google
                    </button>

                    <button
                      type="button"
                      onClick={() => handleComingSoon("Email")}
                      className="btn-social"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#3b4df2"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      Email
                    </button>
                  </div>
                </form>
              </div>

              {/* --- VIEW: REGISTER --- */}
              <div
                className={`auth-view ${activeView === "register" ? "active" : ""}`}
              >
                <div className="brand-header">
                  <div className="brand-title">
                    Create <span>Account</span>
                  </div>
                  <div className="brand-tagline">Join SaafAI Portal today</div>
                </div>

                <div className="section-separator"></div>

                <form onSubmit={handleRegisterSubmit}>
                  <div className="form-group">
                    <label htmlFor="reg-name">Full Name (Optional)</label>
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
                          setRegData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-phone">Mobile Number</label>
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
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </span>
                      <input
                        type="tel"
                        id="reg-phone"
                        inputMode="numeric"
                        placeholder="10-digit mobile number"
                        value={regData.phone}
                        onChange={(e) =>
                          setRegData((prev) => ({
                            ...prev,
                            phone: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10),
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-password">Password</label>
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
                          <rect
                            x="3"
                            y="11"
                            width="18"
                            height="11"
                            rx="2"
                            ry="2"
                          ></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </span>
                      <input
                        type="password"
                        id="reg-password"
                        placeholder="Create a secure password"
                        value={regData.password}
                        onChange={(e) =>
                          setRegData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-login"
                    style={{
                      background:
                        "linear-gradient(120deg, #10b981 0%, #059669 100%)",
                      boxShadow: "0 6px 20px rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    {loading ? "Creating account..." : "Register Now"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveView("main")}
                    className="btn-back-main"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Already have an account? Log in
                  </button>
                </form>
              </div>

              {/* --- VIEW: FORGOT PASSWORD --- */}
              <div
                className={`auth-view ${activeView === "forgot" ? "active" : ""}`}
              >
                <div className="brand-header">
                  <div className="brand-title">
                    Reset <span>Password</span>
                  </div>
                  <div className="brand-tagline">
                    Create a new password to regain access
                  </div>
                </div>

                <div className="section-separator"></div>

                <form onSubmit={handleForgotSubmit}>
                  <div className="form-group">
                    <label htmlFor="forgot-phone">
                      Registered Mobile Number
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
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </span>
                      <input
                        type="tel"
                        id="forgot-phone"
                        inputMode="numeric"
                        placeholder="10-digit mobile number"
                        value={forgotData.phone}
                        onChange={(e) =>
                          setForgotData((prev) => ({
                            ...prev,
                            phone: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10),
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="new-password">New Password</label>
                    <div className="input-wrapper">
                      <span className="input-icon-left">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect
                            x="3"
                            y="11"
                            width="18"
                            height="11"
                            rx="2"
                            ry="2"
                          ></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </span>
                      <input
                        type="password"
                        id="new-password"
                        placeholder="Enter new password"
                        value={forgotData.newPassword}
                        onChange={(e) =>
                          setForgotData((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirm-password">Confirm Password</label>
                    <div className="input-wrapper">
                      <span className="input-icon-left">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect
                            x="3"
                            y="11"
                            width="18"
                            height="11"
                            rx="2"
                            ry="2"
                          ></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </span>
                      <input
                        type="password"
                        id="confirm-password"
                        placeholder="Re-enter new password"
                        value={forgotData.confirmPassword}
                        onChange={(e) =>
                          setForgotData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-login"
                    style={{
                      background:
                        "linear-gradient(120deg, #f59e0b 0%, #d97706 100%)",
                      boxShadow: "0 6px 20px rgba(245, 158, 11, 0.3)",
                    }}
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveView("main")}
                    className="btn-back-main"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to login
                  </button>
                </form>
              </div>
            </div>

            {/* Footer */}
            <div className="form-footer">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 11 11 13 15 9"></polyline>
              </svg>
              Secured &amp; powered by SaafAI
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
