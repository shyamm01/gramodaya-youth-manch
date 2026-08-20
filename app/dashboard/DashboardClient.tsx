"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/src/context/AppContext";
import { useToast } from "@/src/context/ToastContext";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  LogOut,
  KeyRound,
  Edit3,
  Check,
  AlertCircle,
  Sparkles,
  Layers,
  HeartHandshake,
  MessageSquareQuote,
  Building2,
  ExternalLink,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Camera,
  UploadCloud,
  ImageIcon,
  Loader2,
  Trash2,
  Clock,
  MapPin,
  Briefcase,
  Award,
  Droplet,
  Users,
  Home,
  Compass,
  Copy,
  CheckCheck,
  X,
  CreditCard,
  ChevronRight,
  UserCheck,
} from "lucide-react";

export interface VillageItem {
  id: number | string;
  name: string;
  name_hindi?: string | null;
  slug?: string;
}

export interface ProfileData {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  mobile?: string | null;
  email?: string | null;
  fatherName?: string | null;
  dob?: string | null;
  gender?: string | null;
  villageId?: string | null;
  houseNo?: string | null;
  street?: string | null;
  pincode?: string | null;
  occupation?: string | null;
  designation?: string | null;
  politicalBackground?: string | null;
  bloodGroup?: string | null;
  systemRole?: string;
  role?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAuthData {
  id: string;
  email: string | null;
  provider: string;
  createdAt: string;
  lastSignInAt: string | null;
  membershipStatus?: "active" | "pending" | "suspended";
  memberRole?: string;
  systemRole?: string;
  role?: string;
  memberVillage?: string;
}

export interface DashboardClientProps {
  user: UserAuthData;
  initialProfile: ProfileData | null;
  villages?: VillageItem[];
}

type DashboardTab = "personal" | "contact" | "career" | "security" | "services";

export function DashboardClient({
  user,
  initialProfile,
  villages = [],
}: DashboardClientProps) {
  const router = useRouter();
  const { lang, memberLogout, setSelectedIdCardMember } = useApp();
  const isEn = lang === "en";

  const {
    success: toastSuccess,
    error: toastError,
    info: toastInfo,
  } = useToast();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<DashboardTab>("personal");

  // Profile data & form states
  const [profile, setProfile] = useState<ProfileData | null>(initialProfile);
  const [fullName, setFullName] = useState(initialProfile?.fullName || "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatarUrl || "");
  const [mobile, setMobile] = useState(initialProfile?.mobile || "");
  const [email, setEmail] = useState(initialProfile?.email || user.email || "");
  const [fatherName, setFatherName] = useState(
    initialProfile?.fatherName || "",
  );
  const [dob, setDob] = useState(initialProfile?.dob || "");
  const [gender, setGender] = useState(initialProfile?.gender || "");
  const [villageId, setVillageId] = useState(initialProfile?.villageId || "8");
  const [houseNo, setHouseNo] = useState(initialProfile?.houseNo || "");
  const [street, setStreet] = useState(initialProfile?.street || "");
  const [pincode, setPincode] = useState(initialProfile?.pincode || "");
  const [occupation, setOccupation] = useState(
    initialProfile?.occupation || "",
  );
  const [designation, setDesignation] = useState(
    initialProfile?.designation || "",
  );
  const [politicalBackground, setPoliticalBackground] = useState(
    initialProfile?.politicalBackground || "",
  );
  const [bloodGroup, setBloodGroup] = useState(
    initialProfile?.bloodGroup || "",
  );

  const [membershipStatus, setMembershipStatus] = useState<
    "active" | "pending" | "suspended"
  >((initialProfile?.status as any) || user.membershipStatus || "pending");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Security & Password Change State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Realtime subscription for public.profiles changes
  useEffect(() => {
    const profileChannel = supabase
      .channel(`profile-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === "object") {
            const updated = payload.new as any;
            setProfile({
              id: updated.id,
              fullName: updated.full_name,
              avatarUrl: updated.avatar_url,
              mobile: updated.mobile,
              email: updated.email,
              fatherName: updated.father_name,
              dob: updated.dob,
              gender: updated.gender,
              villageId: updated.village_id ? String(updated.village_id) : "",
              houseNo: updated.house_no,
              street: updated.street,
              pincode: updated.pincode,
              occupation: updated.occupation,
              designation: updated.designation,
              politicalBackground: updated.political_background,
              bloodGroup: updated.blood_group,
              systemRole: updated.system_role,
              role: updated.role,
              status: updated.status,
              createdAt: updated.created_at,
              updatedAt: updated.updated_at,
            });
            if (updated.full_name) setFullName(updated.full_name);
            if (updated.avatar_url) setAvatarUrl(updated.avatar_url);
            if (updated.mobile) setMobile(updated.mobile);
            if (updated.email) setEmail(updated.email);
            if (updated.status) setMembershipStatus(updated.status);
            toastInfo(
              isEn
                ? "Profile updated in realtime"
                : "प्रोफ़ाइल डेटा वास्तविक समय में अद्यतन हुआ",
              isEn ? "Sync" : "सिंक",
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [supabase, user.id, isEn, toastInfo]);

  // Handle direct file upload to Supabase Storage
  const handleFileUpload = async (file: File, isHeaderUpload = false) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toastError(
        isEn
          ? "Please select an image file (PNG, JPG, WEBP)."
          : "कृपया मान्य छवि फ़ाइल (PNG, JPG, WEBP) चुनें।",
        isEn ? "Invalid File" : "अमान्य फ़ाइल",
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toastError(
        isEn
          ? "File size exceeds 5MB limit."
          : "फ़ाइल का आकार 5MB की सीमा से अधिक है।",
        isEn ? "File Too Large" : "फ़ाइल बहुत बड़ी है",
      );
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      let publicUrl = "";
      if (!uploadError && uploadData) {
        const { data } = supabase.storage
          .from("profiles")
          .getPublicUrl(filePath);
        publicUrl = data.publicUrl;
      } else {
        // Fallback to unified Supabase upload endpoint
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", "profiles");
        formData.append("folder", "avatars");

        const uploadRes = await fetch("/api/upload/supabase", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error(
            isEn
              ? "Image upload failed. Please try again."
              : "छवि अपलोड विफल रहा। कृपया पुनः प्रयास करें।",
          );
        }

        const json = await uploadRes.json();
        publicUrl = json.url || json.publicUrl;
      }

      setAvatarUrl(publicUrl);

      // If triggered directly from the header avatar button, auto-save
      if (isHeaderUpload) {
        await supabase
          .from("profiles")
          .update({
            avatar_url: publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        setProfile((prev) => (prev ? { ...prev, avatarUrl: publicUrl } : null));
        toastSuccess(
          isEn
            ? "Profile photo updated successfully!"
            : "प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपडेट की गई!",
          isEn ? "Photo Saved" : "फ़ोटो सहेजी गई",
        );
      } else {
        toastSuccess(
          isEn
            ? 'Photo uploaded. Click "Save Changes" to apply.'
            : 'फ़ोटो अपलोड हो गई। लागू करने हेतु "परिवर्तन सहेजें" पर क्लिक करें।',
          isEn ? "Uploaded" : "अपलोड सफल",
        );
      }
    } catch (err: any) {
      console.error("File upload error:", err);
      toastError(
        err.message ||
          (isEn
            ? "Failed to upload photo."
            : "फ़ोटो अपलोड करने में त्रुटि हुई।"),
        isEn ? "Upload Error" : "अपलोड त्रुटि",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // Save complete profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const cleanName = fullName.trim();
      const cleanAvatar = avatarUrl.trim();
      const cleanMobile = mobile.trim();
      const cleanEmail = email.trim();
      const cleanFather = fatherName.trim();
      const cleanDob = dob.trim();
      const cleanGender = gender.trim();
      const cleanHouseNo = houseNo.trim();
      const cleanStreet = street.trim();
      const cleanPincode = pincode.trim();
      const cleanOccupation = occupation.trim();
      const cleanDesignation = designation.trim();
      const cleanPolitical = politicalBackground.trim();
      const cleanBlood = bloodGroup.trim();
      const numVillageId =
        villageId && !isNaN(Number(villageId)) ? Number(villageId) : null;

      if (!cleanName) {
        throw new Error(
          isEn ? "Full name is required." : "पूरा नाम दर्ज करना अनिवार्य है।",
        );
      }

      const profilePayload: Record<string, any> = {
        id: user.id,
        full_name: cleanName,
        avatar_url: cleanAvatar || null,
        mobile: cleanMobile || null,
        email: cleanEmail || null,
        father_name: cleanFather || null,
        dob: cleanDob || null,
        gender: cleanGender || null,
        village_id: numVillageId,
        house_no: cleanHouseNo || null,
        street: cleanStreet || null,
        pincode: cleanPincode || null,
        occupation: cleanOccupation || null,
        designation: cleanDesignation || null,
        political_background: cleanPolitical || null,
        blood_group: cleanBlood || null,
        updated_at: new Date().toISOString(),
      };

      // 1. Update public.profiles via Supabase client
      const { data, error } = await supabase
        .from("profiles")
        .upsert(profilePayload)
        .select()
        .single();

      if (error) {
        // Fallback to internal API route
        const apiRes = await fetch(`/api/members/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: cleanName,
            photoUrl: cleanAvatar,
            mobile: cleanMobile,
            email: cleanEmail,
            fatherName: cleanFather,
            dob: cleanDob,
            gender: cleanGender,
            villageId: numVillageId,
            houseNo: cleanHouseNo,
            street: cleanStreet,
            pincode: cleanPincode,
            occupation: cleanOccupation,
            designation: cleanDesignation,
            politicalBackground: cleanPolitical,
            bloodGroup: cleanBlood,
          }),
        });
        if (!apiRes.ok) {
          const errData = await apiRes.json();
          throw new Error(errData?.error || error.message);
        }
      }

      // 2. Sync auth user metadata
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: cleanName,
            name: cleanName,
            avatar_url: cleanAvatar,
            mobile: cleanMobile,
            villageId: String(numVillageId || "8"),
          },
        });
      } catch (authMetaErr) {
        // Non-fatal
      }

      setProfile((prev) => ({
        ...(prev || ({} as ProfileData)),
        id: user.id,
        fullName: cleanName,
        avatarUrl: cleanAvatar,
        mobile: cleanMobile,
        email: cleanEmail,
        fatherName: cleanFather,
        dob: cleanDob,
        gender: cleanGender,
        villageId: String(numVillageId || ""),
        houseNo: cleanHouseNo,
        street: cleanStreet,
        pincode: cleanPincode,
        occupation: cleanOccupation,
        designation: cleanDesignation,
        politicalBackground: cleanPolitical,
        bloodGroup: cleanBlood,
        createdAt: prev?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      setIsEditing(false);
      const succMsg = isEn
        ? "Profile updated successfully!"
        : "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!";
      setStatusMessage({ type: "success", text: succMsg });
      toastSuccess(succMsg, isEn ? "Profile Saved" : "प्रोफ़ाइल सहेजी गई");
      router.refresh();
    } catch (err: any) {
      const errMsg =
        err?.message ||
        (isEn ? "Failed to update profile." : "प्रोफ़ाइल सहेजने में त्रुटि।");
      setStatusMessage({ type: "error", text: errMsg });
      toastError(errMsg, isEn ? "Error" : "त्रुटि");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      const msg = isEn
        ? "Password must be at least 8 characters"
        : "पासवर्ड कम से कम 8 अक्षरों का होना चाहिए";
      setPasswordError(msg);
      toastError(msg, isEn ? "Weak Password" : "कमजोर पासवर्ड");
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = isEn
        ? "Passwords do not match"
        : "पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते";
      setPasswordError(msg);
      toastError(msg, isEn ? "Password Mismatch" : "पासवर्ड बेमेल");
      return;
    }

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      const succMsg = isEn
        ? "Password updated successfully!"
        : "पासवर्ड सफलतापूर्वक बदल दिया गया!";
      setPasswordSuccess(succMsg);
      toastSuccess(succMsg, isEn ? "Security" : "सुरक्षा");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const errMsg =
        err?.message ||
        (isEn
          ? "Failed to update password."
          : "पासवर्ड अपडेट करने में त्रुटि।");
      setPasswordError(errMsg);
      toastError(errMsg, isEn ? "Error" : "त्रुटि");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await memberLogout();
      toastSuccess(
        isEn
          ? "You have logged out successfully."
          : "आप सफलतापूर्वक लॉग आउट हो चुके हैं।",
        isEn ? "Goodbye" : "अलविदा",
      );
      router.refresh();
      router.replace("/auth/login");
    } catch (err) {
      console.error("Logout error:", err);
      router.replace("/auth/login");
    }
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
    toastSuccess(isEn ? "User ID copied to clipboard" : "यूज़र ID कॉपी हो गई");
  };

  const displayName =
    profile?.fullName ||
    user.email?.split("@")[0] ||
    (isEn ? "Community Member" : "ग्राम सदस्य");
  const effectiveSystemRole =
    profile?.systemRole || user.systemRole || "MEMBER";
  const effectiveRole =
    profile?.role ||
    user.role ||
    user.memberRole ||
    (effectiveSystemRole === "SUPER_ADMIN" || effectiveSystemRole === "ADMIN"
      ? "ADMIN"
      : "MEMBER");

  const selectedVillageObj = villages.find(
    (v) => String(v.id) === String(profile?.villageId || villageId),
  );
  const villageDisplayName = selectedVillageObj
    ? isEn
      ? selectedVillageObj.name
      : selectedVillageObj.name_hindi || selectedVillageObj.name
    : isEn
      ? "Rasoolpur"
      : "रसूलपुर";

  const displayAvatar =
    profile?.avatarUrl && profile.avatarUrl.trim().length > 0
      ? profile.avatarUrl
      : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=059669,d97706`;

  const formattedCreatedDate = new Date(user.createdAt).toLocaleDateString(
    isEn ? "en-US" : "hi-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );

  const tabNavItems = [
    {
      id: "personal" as DashboardTab,
      label: isEn ? "Personal Info" : "व्यक्तिगत विवरण",
      sublabel: isEn ? "Name, DOB, Blood Group" : "नाम, जन्म तिथि, रक्त समूह",
      icon: User,
      badge: isEn ? "Core" : "मुख्य",
    },
    {
      id: "contact" as DashboardTab,
      label: isEn ? "Contact & Address" : "संपर्क एवं निवास",
      sublabel: isEn ? "Phone, Village, Street" : "मोबाइल, ग्राम इकाई, पता",
      icon: MapPin,
    },
    {
      id: "career" as DashboardTab,
      label: isEn ? "Career & Role" : "व्यवसाय एवं पद",
      sublabel: isEn ? "Occupation, Designation" : "पेशा, दायित्व, पृष्ठभूमि",
      icon: Briefcase,
    },
    {
      id: "security" as DashboardTab,
      label: isEn ? "Security & Password" : "सुरक्षा एवं पासवर्ड",
      sublabel: isEn ? "Update Password, Logins" : "पासवर्ड, प्रमाणीकरण स्थिति",
      icon: Shield,
    },
    {
      id: "services" as DashboardTab,
      label: isEn ? "Village Portals" : "ग्रामोदय पोर्टल सेवाएं",
      sublabel: isEn
        ? "Grievances, Social, Directory"
        : "समस्याएं, सामाजिक कार्य, सदस्य",
      icon: Layers,
    },
  ];

  return (
    <main
      className="max-w-7xl mx-auto px-4 py-8 sm:py-10 space-y-6 animate-in fade-in"
      aria-label={isEn ? "User Dashboard" : "सदस्य डैशबोर्ड"}
    >
      {/* Toast / Status Feedback Alert */}
      {statusMessage && (
        <div
          role="alert"
          aria-live="polite"
          className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm transition-all ${
            statusMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
          }`}
        >
          <div className="flex items-center gap-3">
            {statusMessage.type === "success" ? (
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="text-sm font-semibold">{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            aria-label={isEn ? "Dismiss notification" : "सूचना हटाएं"}
          >
            <X className="w-4 h-4 opacity-70 hover:opacity-100" />
          </button>
        </div>
      )}

      {/* Top Full-Width Member Identity Hero Card */}
      <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-950 text-white p-5 sm:p-7 shadow-xl border border-stone-800/80 relative overflow-hidden">
        {/* Glow ambient background accents */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 relative z-10">
          {/* Left Avatar & Identity Cluster */}
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 text-center sm:text-left w-full md:w-auto">
            {/* Avatar with Camera Overlay Trigger */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-amber-500/30 shadow-2xl bg-stone-800 flex items-center justify-center relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                aria-label={
                  isEn ? "Upload profile picture" : "प्रोफ़ाइल फ़ोटो अपलोड करें"
                }
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, true);
                }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-50"
                title={isEn ? "Change Photo" : "फ़ोटो बदलें"}
                aria-label={isEn ? "Change Photo" : "फ़ोटो बदलें"}
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Member Details */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-1.5">
                  <span>{displayName}</span>
                  <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                </h1>

                {/* Village Chapter Pill */}
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-stone-800/90 border border-stone-700 text-amber-300 font-medium">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{villageDisplayName}</span>
                </span>
              </div>

              {/* Email & Copyable UUID */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-stone-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-500" />
                  <span className="text-stone-300">
                    {profile?.email ||
                      user.email ||
                      (isEn ? "Email not linked" : "ईमेल दर्ज नहीं")}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={copyUserId}
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
                  title={isEn ? "Click to copy User ID" : "यूज़र ID कॉपी करें"}
                >
                  <span className="text-stone-500">ID:</span>
                  <span>{user.id.slice(0, 10)}...</span>
                  {copiedId ? (
                    <CheckCheck className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              {/* Badges Cluster */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                {/* System Role Badge */}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 shadow-xs ${
                    effectiveSystemRole === "SUPER_ADMIN"
                      ? "bg-purple-500/25 text-purple-200 border-purple-400/40"
                      : effectiveSystemRole === "ADMIN"
                        ? "bg-amber-500/25 text-amber-200 border-amber-400/40"
                        : "bg-blue-500/25 text-blue-200 border-blue-400/40"
                  }`}
                >
                  <ShieldCheck className="w-3 h-3 text-current" />
                  <span>
                    {effectiveSystemRole === "SUPER_ADMIN"
                      ? "Super Admin"
                      : effectiveSystemRole === "ADMIN"
                        ? "Admin"
                        : "Member"}
                  </span>
                </span>

                {/* Role Badge */}
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-stone-200 border border-white/15">
                  Role: {effectiveRole}
                </span>

                {/* Status Badge */}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1 ${
                    membershipStatus === "active"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {membershipStatus === "active" ? (
                    <>
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                      <span>{isEn ? "Active Member" : "सक्रिय सदस्य"}</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-2.5 h-2.5 text-amber-400" />
                      <span>
                        {isEn ? "Pending Approval" : "स्वीकृति लंबित"}
                      </span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Right Action & Metadata Area */}
          <div className="flex flex-wrap sm:flex-col items-center md:items-end justify-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-stone-800/80">
            <button
              type="button"
              onClick={() => {
                if (profile) {
                  setSelectedIdCardMember({
                    id: profile.id,
                    name: profile.fullName || displayName,
                    photoUrl: profile.avatarUrl || "",
                    mobile: profile.mobile || "",
                    role: (profile.role as any) || "MEMBER",
                    systemRole: (profile.systemRole as any) || "MEMBER",
                    villageId: profile.villageId || "8",
                    status: (profile.status as any) || "active",
                  } as any);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-lg shadow-amber-900/30 transition-all active:scale-95 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-stone-950" />
              <span>{isEn ? "Digital ID Card" : "डिजिटल पहचान पत्र"}</span>
            </button>

            <span className="text-[11px] text-stone-400 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              <span>
                {isEn
                  ? `Member since ${formattedCreatedDate}`
                  : `सदस्यता: ${formattedCreatedDate}`}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Split-Screen 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT SECTION (Sidebar Navigation & Actions) ================= */}
        <aside
          className="lg:col-span-4 space-y-4 lg:sticky lg:top-20"
          aria-label={
            isEn
              ? "Profile Navigation & Identity"
              : "प्रोफ़ाइल नेविगेशन एवं पहचान"
          }
        >
          {/* Left Vertical Tab Menu */}
          <nav
            className="bg-white dark:bg-stone-900/80 backdrop-blur-xl border border-stone-200 dark:border-stone-800 rounded-3xl p-3 shadow-sm space-y-1.5"
            aria-label={isEn ? "Dashboard Sections" : "डैशबोर्ड अनुभाग"}
          >
            {tabNavItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 shadow-xs"
                      : "hover:bg-stone-50 dark:hover:bg-stone-800/50 border border-transparent text-stone-700 dark:text-stone-300"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl transition-colors ${
                        isActive
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-bold ${
                            isActive
                              ? "text-amber-900 dark:text-amber-300"
                              : "text-stone-900 dark:text-stone-100"
                          }`}
                        >
                          {tab.label}
                        </span>
                        {tab.badge && (
                          <span className="px-1.5 py-0.2 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[9px] font-bold rounded-md">
                            {tab.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">
                        {tab.sublabel}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isActive
                        ? "text-amber-600 dark:text-amber-400 translate-x-0.5"
                        : "text-stone-400 opacity-60"
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Quick Action Footer Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                if (profile) {
                  setSelectedIdCardMember({
                    id: profile.id,
                    name: profile.fullName || displayName,
                    photoUrl: profile.avatarUrl || "",
                    mobile: profile.mobile || "",
                    role: (profile.role as any) || "MEMBER",
                    systemRole: (profile.systemRole as any) || "MEMBER",
                    villageId: profile.villageId || "8",
                    status: (profile.status as any) || "active",
                  } as any);
                }
              }}
              className="py-2.5 px-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/25 text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{isEn ? "Digital ID" : "पहचान पत्र"}</span>
            </button>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="py-2.5 px-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>
                {loggingOut
                  ? isEn
                    ? "..."
                    : "..."
                  : isEn
                    ? "Logout"
                    : "लॉग आउट"}
              </span>
            </button>
          </div>
        </aside>

        {/* ================= RIGHT SECTION (Active Tab Details & Edit Form) ================= */}
        <section
          className="lg:col-span-8 bg-white dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
          aria-labelledby="active-section-heading"
        >
          {/* Section Header with In-Place Edit Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
            <div>
              <h2
                id="active-section-heading"
                className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2"
              >
                {activeTab === "personal" && (
                  <User className="w-5 h-5 text-amber-500" />
                )}
                {activeTab === "contact" && (
                  <MapPin className="w-5 h-5 text-emerald-500" />
                )}
                {activeTab === "career" && (
                  <Briefcase className="w-5 h-5 text-purple-500" />
                )}
                {activeTab === "security" && (
                  <Shield className="w-5 h-5 text-amber-500" />
                )}
                {activeTab === "services" && (
                  <Layers className="w-5 h-5 text-blue-500" />
                )}
                <span>
                  {activeTab === "personal" &&
                    (isEn ? "Personal Information" : "व्यक्तिगत जानकारी")}
                  {activeTab === "contact" &&
                    (isEn
                      ? "Contact & Location Details"
                      : "संपर्क एवं निवास विवरण")}
                  {activeTab === "career" &&
                    (isEn
                      ? "Professional & Community Role"
                      : "व्यवसाय एवं संस्थागत स्थिति")}
                  {activeTab === "security" &&
                    (isEn
                      ? "Account Security & Password"
                      : "खाता सुरक्षा एवं पासवर्ड")}
                  {activeTab === "services" &&
                    (isEn
                      ? "Village Services & Portals"
                      : "ग्रामोदय पोर्टल सेवाएं")}
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {activeTab === "personal" &&
                  (isEn
                    ? "Manage core identity, name, DOB, gender & blood group"
                    : "नाम, जन्मतिथि, लिंग व रक्त समूह विवरण देखें एवं अद्यतन करें")}
                {activeTab === "contact" &&
                  (isEn
                    ? "Manage phone, email, village chapter & street address"
                    : "मोबाइल, ईमेल, ग्राम इकाई व पते का विवरण")}
                {activeTab === "career" &&
                  (isEn
                    ? "Manage occupation, organization position & public background"
                    : "व्यवसाय, पद एवं सामाजिक दायित्व विवरण")}
                {activeTab === "security" &&
                  (isEn
                    ? "Update your access password and review login status"
                    : "पासवर्ड बदलें एवं खाता सुरक्षा जांचें")}
                {activeTab === "services" &&
                  (isEn
                    ? "Direct access to village modules and registries"
                    : "ग्राम समस्याओं, सामाजिक कार्यों व निर्देशिका तक सीधी पहुंच")}
              </p>
            </div>

            {activeTab !== "security" && activeTab !== "services" && (
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs ${
                  isEditing
                    ? "bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200"
                    : "bg-amber-600 hover:bg-amber-500 text-white"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>
                  {isEditing
                    ? isEn
                      ? "Cancel Edit"
                      : "संपादन रद्द करें"
                    : isEn
                      ? "Edit Details"
                      : "विवरण संपादित करें"}
                </span>
              </button>
            )}
          </div>

          {/* Form / Details based on Active Tab */}

          {/* TAB 1: PERSONAL INFO */}
          {activeTab === "personal" && (
            <div>
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        {isEn ? "Full Name *" : "पूरा नाम *"}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={
                            isEn ? "e.g. Ramesh Kumar" : "उदा. रमेश कुमार"
                          }
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Father's Name */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        {isEn
                          ? "Father's / Guardian's Name"
                          : "पिता / अभिभावक का नाम"}
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          value={fatherName}
                          onChange={(e) => setFatherName(e.target.value)}
                          placeholder={
                            isEn ? "e.g. Ram Kumar" : "उदा. राम कुमार"
                          }
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        {isEn ? "Date of Birth (DOB)" : "जन्म तिथि"}
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        {isEn ? "Gender" : "लिंग"}
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                      >
                        <option value="">
                          {isEn ? "Select Gender" : "लिंग चुनें"}
                        </option>
                        <option value="Male">
                          {isEn ? "Male (पुरुष)" : "पुरुष"}
                        </option>
                        <option value="Female">
                          {isEn ? "Female (महिला)" : "महिला"}
                        </option>
                        <option value="Other">
                          {isEn ? "Other (अन्य)" : "अन्य"}
                        </option>
                      </select>
                    </div>

                    {/* Blood Group */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        {isEn ? "Blood Group" : "रक्त समूह (Blood Group)"}
                      </label>
                      <div className="relative max-w-sm">
                        <Droplet className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
                        <select
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                        >
                          <option value="">
                            {isEn ? "Select Blood Group" : "रक्त समूह चुनें"}
                          </option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Photo Uploader Component */}
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/80 space-y-3">
                    <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                      {isEn
                        ? "Profile Picture File / URL"
                        : "प्रोफ़ाइल फ़ोटो अपलोड या URL"}
                    </label>

                    <input
                      type="file"
                      ref={editFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, false);
                      }}
                    />

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <UploadCloud className="w-4 h-4 text-amber-500" />
                        <span>
                          {uploadingImage
                            ? isEn
                              ? "Uploading..."
                              : "अपलोड हो रहा है..."
                            : isEn
                              ? "Upload File"
                              : "फ़ाइल अपलोड करें"}
                        </span>
                      </button>

                      <div className="relative flex-1 w-full">
                        <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="url"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving || uploadingImage}
                      className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                    >
                      {saving ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {isEn
                              ? "Save Personal Info"
                              : "व्यक्तिगत जानकारी सहेजें"}
                          </span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                    >
                      {isEn ? "Cancel" : "रद्द करें"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                      <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {isEn ? "Full Name" : "पूरा नाम"}
                      </div>
                      <div className="text-sm font-bold text-stone-900 dark:text-white mt-1">
                        {displayName}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                      <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {isEn
                          ? "Father's / Guardian's Name"
                          : "पिता / अभिभावक का नाम"}
                      </div>
                      <div className="text-sm font-medium text-stone-800 dark:text-stone-200 mt-1">
                        {profile?.fatherName ||
                          (isEn ? "Not recorded" : "दर्ज नहीं")}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                      <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {isEn ? "Date of Birth" : "जन्म तिथि"}
                      </div>
                      <div className="text-sm font-medium text-stone-800 dark:text-stone-200 mt-1">
                        {profile?.dob || (isEn ? "Not recorded" : "दर्ज नहीं")}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                      <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {isEn ? "Gender" : "लिंग"}
                      </div>
                      <div className="text-sm font-medium text-stone-800 dark:text-stone-200 mt-1">
                        {profile?.gender
                          ? isEn
                            ? profile.gender
                            : profile.gender === "Male"
                              ? "पुरुष"
                              : profile.gender === "Female"
                                ? "महिला"
                                : "अन्य"
                          : isEn
                            ? "Not recorded"
                            : "दर्ज नहीं"}
                      </div>
                    </div>

                    <div className="sm:col-span-2 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                      <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {isEn ? "Blood Group" : "रक्त समूह"}
                      </div>
                      <div className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-1">
                        {profile?.bloodGroup ||
                          (isEn ? "Not recorded" : "दर्ज नहीं")}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONTACT & ADDRESS */}
          {activeTab === "contact" && (
            <div>
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Mobile */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        {isEn
                          ? "Mobile Number (10 digits)"
                          : "मोबाइल नंबर (10 अंक)"}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="tel"
                          maxLength={10}
                          value={mobile}
                          onChange={(e) =>
                            setMobile(e.target.value.replace(/\D/g, ""))
                          }
                          placeholder="9XXXXXXXXX"
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        {isEn ? "Email Address" : "ईमेल पता"}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="user@example.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Village Chapter */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        {isEn ? "Village Unit / Chapter" : "ग्राम इकाई / शाखा"}
                      </label>
                      <div className="relative">
                        <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <select
                          value={villageId}
                          onChange={(e) => setVillageId(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                        >
                          {villages.length > 0 ? (
                            villages.map((v) => (
                              <option key={v.id} value={String(v.id)}>
                                {isEn
                                  ? v.name
                                  : `${v.name_hindi || v.name} (${v.name})`}
                              </option>
                            ))
                          ) : (
                            <option value="8">रसूलपुर (Rasoolpur)</option>
                          )}
                        </select>
                      </div>
                    </div>

                    {/* House No */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        {isEn ? "House No. / Building" : "मकान नं. / भवन"}
                      </label>
                      <div className="relative">
                        <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          value={houseNo}
                          onChange={(e) => setHouseNo(e.target.value)}
                          placeholder={isEn ? "e.g. 45-B" : "उदा. 45-ख"}
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Street */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        {isEn
                          ? "Street / Ward / Area"
                          : "गली / वार्ड / मौहल्ला"}
                      </label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder={
                          isEn ? "e.g. Main Market" : "उदा. मुख्य मार्ग"
                        }
                        className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Pincode */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        {isEn ? "Pincode" : "पिनकोड (Pincode)"}
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) =>
                          setPincode(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="222161"
                        className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                    >
                      {saving ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {isEn
                              ? "Save Contact & Address"
                              : "संपर्क व पता सुरक्षित करें"}
                          </span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                    >
                      {isEn ? "Cancel" : "रद्द करें"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                      <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {isEn ? "Mobile" : "मोबाइल नंबर"}
                      </div>
                      <div className="text-sm font-mono font-bold text-stone-900 dark:text-white mt-1">
                        {profile?.mobile ||
                          (isEn ? "Not recorded" : "दर्ज नहीं")}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                      <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {isEn ? "Email" : "ईमेल"}
                      </div>
                      <div className="text-sm font-medium text-stone-900 dark:text-white mt-1 truncate">
                        {profile?.email ||
                          user.email ||
                          (isEn ? "Not recorded" : "दर्ज नहीं")}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                      <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {isEn ? "Village Unit" : "ग्राम इकाई"}
                      </div>
                      <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1">
                        {villageDisplayName}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                      <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {isEn ? "House & Ward" : "मकान व मौहल्ला"}
                      </div>
                      <div className="text-sm font-medium text-stone-800 dark:text-stone-200 mt-1">
                        {[profile?.houseNo, profile?.street]
                          .filter(Boolean)
                          .join(", ") || (isEn ? "Not recorded" : "दर्ज नहीं")}
                      </div>
                    </div>

                    <div className="sm:col-span-2 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                      <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {isEn ? "Pincode" : "पिनकोड"}
                      </div>
                      <div className="text-sm font-mono font-medium text-stone-900 dark:text-white mt-1">
                        {profile?.pincode ||
                          (isEn ? "Not recorded" : "दर्ज नहीं")}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CAREER & POSITION */}
          {activeTab === "career" && (
            <div>
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Occupation */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        {isEn ? "Occupation / Profession" : "व्यवसाय / पेशा"}
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          placeholder={
                            isEn
                              ? "e.g. Teacher, Farmer"
                              : "उदा. शिक्षक, कृषक, छात्र, व्यापारी"
                          }
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Designation */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        {isEn
                          ? "Designation / Manch Position"
                          : "पद / मंच में दायित्व"}
                      </label>
                      <div className="relative">
                        <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          placeholder={
                            isEn
                              ? "e.g. Active Member"
                              : "उदा. सक्रिय सदस्य, संयोजक"
                          }
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Political / Social */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        {isEn
                          ? "Social / Public Background"
                          : "सामाजिक / सार्वजनिक पृष्ठभूमि"}
                      </label>
                      <input
                        type="text"
                        value={politicalBackground}
                        onChange={(e) => setPoliticalBackground(e.target.value)}
                        placeholder={
                          isEn
                            ? "e.g. Community organizer"
                            : "उदा. सामाजिक कार्यकर्ता"
                        }
                        className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                    >
                      {saving ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {isEn
                              ? "Save Professional Info"
                              : "व्यावसायिक जानकारी सहेजें"}
                          </span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                    >
                      {isEn ? "Cancel" : "रद्द करें"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                      <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {isEn ? "Occupation" : "व्यवसाय / पेशा"}
                      </div>
                      <div className="text-sm font-medium text-stone-900 dark:text-white mt-1">
                        {profile?.occupation ||
                          (isEn ? "Not recorded" : "दर्ज नहीं")}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                      <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {isEn ? "Designation in Manch" : "मंच में दायित्व"}
                      </div>
                      <div className="text-sm font-bold text-stone-900 dark:text-white mt-1">
                        {profile?.designation ||
                          (isEn ? "Active Member" : "सक्रिय सदस्य")}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                      <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {isEn ? "System Role" : "सिस्टम भूमिका"}
                      </div>
                      <div className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-1">
                        {effectiveSystemRole}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                      <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {isEn ? "Member Role" : "सदस्य भूमिका"}
                      </div>
                      <div className="text-sm font-bold text-stone-800 dark:text-stone-200 mt-1">
                        {effectiveRole}
                      </div>
                    </div>

                    <div className="sm:col-span-2 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                      <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {isEn
                          ? "Social / Public Background"
                          : "सामाजिक / सार्वजनिक पृष्ठभूमि"}
                      </div>
                      <div className="text-sm font-medium text-stone-800 dark:text-stone-200 mt-1">
                        {profile?.politicalBackground ||
                          (isEn ? "Not recorded" : "दर्ज नहीं")}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SECURITY & PASSWORD */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                  <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {isEn ? "Auth Provider" : "प्रमाणीकरण प्रदाता"}
                  </div>
                  <div className="text-sm font-bold text-stone-900 dark:text-white mt-1 capitalize">
                    {user.provider}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                  <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {isEn ? "Last Active Sign-In" : "अंतिम साइन इन"}
                  </div>
                  <div className="text-sm font-medium text-stone-800 dark:text-stone-200 mt-1">
                    {user.lastSignInAt
                      ? new Date(user.lastSignInAt).toLocaleString(
                          isEn ? "en-US" : "hi-IN",
                        )
                      : isEn
                        ? "Currently Active"
                        : "वर्तमान में सक्रिय"}
                  </div>
                </div>
              </div>

              {/* Password Update Form */}
              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 space-y-4">
                <h3 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  <span>
                    {isEn
                      ? "Set New Account Password"
                      : "नया पासवर्ड निर्धारित करें"}
                  </span>
                </h3>

                {passwordSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form
                  onSubmit={handleUpdatePassword}
                  className="space-y-3 max-w-md"
                >
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={
                        isEn
                          ? "New password (min 8 chars)"
                          : "नया पासवर्ड (कम से कम 8 अक्षर)"
                      }
                      className="w-full px-3.5 py-2.5 pr-10 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                      aria-label={
                        showPassword
                          ? isEn
                            ? "Hide password"
                            : "पासवर्ड छुपाएं"
                          : isEn
                            ? "Show password"
                            : "पासवर्ड देखें"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={
                      isEn
                        ? "Confirm new password"
                        : "नए पासवर्ड की पुष्टि करें"
                    }
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-stone-900 dark:bg-stone-700 hover:bg-stone-800 dark:hover:bg-stone-600 text-white text-xs font-bold transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                  >
                    {updatingPassword ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>
                          {isEn ? "Update Password Now" : "पासवर्ड अपडेट करें"}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: SERVICES & QUICK PORTALS */}
          {activeTab === "services" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/problems"
                className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-amber-500/50 bg-stone-50/50 dark:bg-stone-800/30 hover:bg-white dark:hover:bg-stone-800 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                      <MessageSquareQuote className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                        {isEn ? "Grievances & Problems" : "ग्राम समस्याएं"}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {isEn
                          ? "Report and track issues"
                          : "शिकायत दर्ज व ट्रैक करें"}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-amber-500 transition-colors" />
                </div>
              </Link>

              <Link
                href="/social-work"
                className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-emerald-500/50 bg-stone-50/50 dark:bg-stone-800/30 hover:bg-white dark:hover:bg-stone-800 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                        {isEn ? "Social Initiatives" : "सामाजिक कार्य"}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {isEn
                          ? "Development missions"
                          : "विकास एवं सेवा अभियान"}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-emerald-500 transition-colors" />
                </div>
              </Link>

              <Link
                href="/announcements"
                className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-blue-500/50 bg-stone-50/50 dark:bg-stone-800/30 hover:bg-white dark:hover:bg-stone-800 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                        {isEn ? "Announcements" : "ग्राम सूचनाएं"}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {isEn ? "Official announcements" : "आधिकारिक घोषणाएं"}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </Link>

              <Link
                href="/members"
                className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-purple-500/50 bg-stone-50/50 dark:bg-stone-800/30 hover:bg-white dark:hover:bg-stone-800 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                        {isEn ? "Member Directory" : "सदस्य निर्देशिका"}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {isEn
                          ? "Gram Panchayat members list"
                          : "ग्राम पंचायत सदस्य सूची"}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-purple-500 transition-colors" />
                </div>
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
