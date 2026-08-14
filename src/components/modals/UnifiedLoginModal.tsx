"use client";

import React, { useState } from "react";
import {
  X,
  Lock,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GymLogo } from "../common/GymLogo";
import { Button, Input } from "../ui";

export const UnifiedLoginModal: React.FC = () => {
  const {
    isAdminLoginModalOpen,
    setIsAdminLoginModalOpen,
    isMemberLoginModalOpen,
    setIsMemberLoginModalOpen,
    setIsJoinModalOpen,
    userLogin,
    lang,
    t,
  } = useApp();

  const isOpen = isAdminLoginModalOpen || isMemberLoginModalOpen;

  const [mobileOrEmail, setMobileOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleClose = () => {
    setIsAdminLoginModalOpen(false);
    setIsMemberLoginModalOpen(false);
    setMobileOrEmail("");
    setPassword("");
    setShowPassword(false);
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(false);
  };

  const handleSwitchToSignup = () => {
    handleClose();
    if (setIsJoinModalOpen) {
      setIsJoinModalOpen(true);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanInput = mobileOrEmail.trim();
    if (!cleanInput) {
      setErrorMsg(
        lang === "en"
          ? "Please enter mobile number or email."
          : "कृपया मोबाइल नंबर अथवा ईमेल दर्ज करें।",
      );
      return;
    }
    if (!password) {
      setErrorMsg(
        lang === "en"
          ? "Please enter your account password."
          : "कृपया अपने खाते का पासवर्ड दर्ज करें।",
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cleanInput, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        setSuccessMsg(
          data.message ||
            (lang === "en"
              ? "Login successful!"
              : "लॉगिन सफल! पोर्टल में प्रवेश स्वीकृत।"),
        );

        // Update application auth state via userLogin if available
        if (userLogin) {
          userLogin(data.user || data.member, data.token, data.role);
        }

        setTimeout(() => {
          handleClose();
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }, 600);
      } else {
        setErrorMsg(
          data.error ||
            (lang === "en"
              ? "Invalid mobile/email or password."
              : "अमान्य मोबाइल नंबर, ईमेल या पासवर्ड दर्ज किया गया है।"),
        );
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(
        err.message ||
          (lang === "en"
            ? "Network error during login. Please try again."
            : "लॉगिन करते समय नेटवर्क त्रुटि हुई। कृपया पुनः प्रयास करें।"),
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* ── BACKDROP ── */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={handleClose}
      />

      {/* ── MODAL CONTAINER ── */}
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl z-10 my-8 overflow-hidden transition-all text-slate-900 dark:text-slate-50 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
              <GymLogo size={32} variant="icon" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {lang === "en" ? "Portal Login" : "पोर्टल लॉगिन"}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {lang === "en"
                  ? "Enter your mobile/email and password to continue"
                  : "पोर्टल में प्रवेश हेतु मोबाइल/ईमेल एवं पासवर्ड दर्ज करें"}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <div className="p-6 space-y-4">
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs font-medium rounded-xl flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-xl flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handlePasswordLogin} className="space-y-4">
            {/* Mobile / Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {lang === "en"
                  ? "Mobile Number or Email"
                  : "मोबाइल नंबर या ईमेल पता"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <Input
                  type="text"
                  required
                  value={mobileOrEmail}
                  onChange={(e) => setMobileOrEmail(e.target.value)}
                  placeholder={
                    lang === "en"
                      ? "9876543210 or user@example.com"
                      : "उदा. 9876543210 या नाम@ईमेल.com"
                  }
                  className="pl-10 h-10.5 text-xs rounded-xl"
                  autoFocus
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {lang === "en" ? "Password" : "पासवर्ड"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-10.5 text-xs rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !mobileOrEmail.trim() || !password}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {lang === "en"
                    ? "Authenticating..."
                    : "सत्यापित किया जा रहा है..."}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  {lang === "en" ? "Login to Portal" : "पोर्टल में प्रवेश करें"}
                </span>
              )}
            </Button>
          </form>

          {/* Switch to Signup */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === "en"
                ? "Don't have an account yet?"
                : "क्या आपका खाता अभी तक नहीं बना है?"}{" "}
              <button
                type="button"
                onClick={handleSwitchToSignup}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer inline-flex items-center gap-1 ml-1"
              >
                <span>{lang === "en" ? "Register Now" : "नया खाता बनाएं"}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
