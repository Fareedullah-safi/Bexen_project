"use client";

import axios from "axios";
import {
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  Link as LinkIcon,
  LockKeyhole,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  Text,
  Trash2,
  Upload,
  User,
  UserPlus,
  UserRound,
} from "lucide-react";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Spinner from "../../Components/Admin/Spinner";

/* ==========================================================================
   CONSTANTS & STYLES
   ========================================================================== */
const initialAdmin = { name: "", email: "", password: "", role: "" };
const initialPassword = { currentPassword: "", newPassword: "" };
const roles = [
  { value: "super-admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

const CONTACT_API = "/api/contactpage/contact-details";
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ps", label: "پښتو" },
  { code: "fa", label: "دری" },
];

const emptyContactTranslation = () => ({
  topTag: "",
  highlightedTitle: "",
  mainTitle: "",
  locationTitle: "",
  locationAddress: "",
  emailTitle: "",
  phoneTitle: "",
  chatTitle: "",
  chatLinkText: "",
});
const emptyContactData = () => ({
  translations: {
    en: emptyContactTranslation(),
    ps: emptyContactTranslation(),
    fa: emptyContactTranslation(),
  },
  shared: {
    email1: "",
    email2: "",
    phone1: "",
    phone2: "",
    chatEmail: "",
    chatLinkUrl: "",
  },
});
const initializeContactErrors = () => ({
  shared: {
    email1: null,
    email2: null,
    phone1: null,
    phone2: null,
    chatEmail: null,
    chatLinkUrl: null,
  },
  en: emptyContactTranslation(),
  ps: emptyContactTranslation(),
  fa: emptyContactTranslation(),
});

const TABS = [
  { id: "profile", label: "My Profile", shortLabel: "Profile", icon: User },
  { id: "add", label: "Add Admin", shortLabel: "Add", icon: UserPlus },
  {
    id: "password",
    label: "Change Password",
    shortLabel: "Password",
    icon: LockKeyhole,
  },
  { id: "contact", label: "Contact Info", shortLabel: "Contact", icon: Phone },
];

const CLASSES = {
  input:
    "w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-3.5 pl-11 pr-12 text-sm text-[var(--foreground)] outline-none transition-all duration-300 placeholder:text-[var(--muted)] hover:border-[var(--accent)]/50 focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:ring-4 focus:ring-[var(--accent)]/10",
  standard:
    "w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-all duration-300 placeholder:text-[var(--muted)] hover:border-[var(--accent)]/50 focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:ring-4 focus:ring-[var(--accent)]/10",
  error:
    "w-full rounded-xl border border-red-500 bg-red-50/5 px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-all duration-300 placeholder:text-[var(--muted)] focus:border-red-500 focus:bg-[var(--surface)] focus:ring-4 focus:ring-red-500/10",
  label: "mb-2 block text-sm font-semibold text-[var(--foreground)]",
  icon: "absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors duration-200",
  card: "overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all duration-300 hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-[var(--accent)]/5",
  btn: "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-[var(--accent)]/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--accent)]/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent)]/20 disabled:cursor-not-allowed disabled:opacity-60",
  btnSec:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]/50 hover:bg-[var(--accent-soft)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
  box: "rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/50 p-5 transition-all duration-300 hover:border-[var(--accent)]/30",
};

/* ==========================================================================
   SUB-COMPONENTS (Defined outside main component to preserve DOM focus)
   ========================================================================== */
function PwdInput({
  id,
  label,
  name,
  val,
  holder,
  onChange,
  showPassword,
  togglePassword,
}) {
  return (
    <div>
      <label htmlFor={id} className={CLASSES.label}>
        {label}
      </label>
      <div className="group relative">
        <LockKeyhole
          size={18}
          className={`${CLASSES.icon} group-focus-within:text-[var(--accent)]`}
        />
        <input
          id={id}
          name={name}
          type={showPassword[id] ? "text" : "password"}
          value={val}
          onChange={onChange}
          placeholder={holder}
          minLength={8}
          required
          className={CLASSES.input}
        />
        <button
          type="button"
          onClick={() => togglePassword(id)}
          className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
        >
          {showPassword[id] ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function CInput({
  isShared,
  name,
  label,
  placeholder,
  Icon,
  colClass = "",
  contactData,
  contactErrors,
  contactLanguage,
  onChangeS,
  onChangeT,
}) {
  const val = isShared
    ? contactData.shared[name]
    : contactData.translations[contactLanguage][name];
  const err = isShared
    ? contactErrors.shared[name]
    : contactErrors[contactLanguage][name];

  return (
    <div className={colClass}>
      <label
        className={`${CLASSES.label} ${Icon ? "flex items-center gap-1" : ""}`}
      >
        {Icon && <Icon size={14} />} {label}
      </label>
      <input
        dir={isShared ? "ltr" : contactLanguage === "en" ? "ltr" : "rtl"}
        name={name}
        value={val || ""}
        onChange={isShared ? onChangeS : onChangeT}
        placeholder={placeholder}
        className={err ? CLASSES.error : CLASSES.standard}
      />
      {err && <p className="mt-1.5 text-xs font-medium text-red-500">{err}</p>}
    </div>
  );
}

/* ==========================================================================
   MAIN PAGE COMPONENT
   ========================================================================== */
export default function AdminUsersPage() {
  const widgetRef = useRef(null);
  const roleDropdownRef = useRef(null);

  // States
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [widgetReady, setWidgetReady] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState({});
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Forms
  const [addAdmin, setAddAdmin] = useState(initialAdmin);
  const [changePassword, setChangePassword] = useState(initialPassword);
  const [profileData, setProfileData] = useState({
    name: "",
    image: "",
    publicId: "",
    uid: "",
  });
  const [contactData, setContactData] = useState(emptyContactData());
  const [contactLanguage, setContactLanguage] = useState("en");
  const [contactErrors, setContactErrors] = useState(initializeContactErrors());

  // Loading States
  const [loadState, setLoadState] = useState({
    creating: false,
    password: false,
    profile: false,
    contact: false,
    upload: false,
  });
  const toggleLoad = (key, val) => setLoadState((p) => ({ ...p, [key]: val }));

  /* --------------------------- EFFECTS ------------------------- */
  useEffect(() => {
    let isMounted = true;
    const loadAdmin = async () => {
      setIsPageLoading(true);
      try {
        const sessionRes = await axios.get("/api/admin/adminusers/session", {
          withCredentials: true,
        });
        const admin = sessionRes.data?.admin;
        if (!sessionRes.data?.success || !admin?.uid) return;
        if (!isMounted) return;

        setProfileData((p) => ({ ...p, uid: admin.uid }));
        try {
          const res = await axios.get("/api/admin/adminusers/profile", {
            params: { UID: admin.uid },
            withCredentials: true,
          });
          if (!isMounted) return;
          if (res.data?.success) {
            const p =
              res.data.profile || res.data.data || res.data.admin || null;
            if (p)
              setProfileData({
                uid: admin.uid,
                name: p.name || admin.name || "",
                image: p.imageUrl || p.image || "",
                publicId: p.publicId || "",
              });
          }
        } catch (err) {
          if (err.response?.status === 404 && isMounted)
            setProfileData({
              uid: admin.uid,
              name: admin.name || "",
              image: admin.imageUrl || "",
              publicId: admin.publicId || "",
            });
        }
      } catch (err) {
        toast.error("Unable to load admin session.");
      } finally {
        if (isMounted) setIsPageLoading(false);
      }
    };
    loadAdmin();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "contact") return;
    let isMounted = true;
    const loadContact = async () => {
      toggleLoad("contact", true);
      try {
        const res = await axios.get(CONTACT_API);
        if (isMounted && res.data?.success && res.data?.data) {
          const d = res.data.data;
          setContactData({
            translations: {
              en: {
                ...emptyContactTranslation(),
                ...d.translations?.en,
              },
              ps: {
                ...emptyContactTranslation(),
                ...d.translations?.ps,
              },
              fa: {
                ...emptyContactTranslation(),
                ...d.translations?.fa,
              },
            },
            shared: { ...emptyContactData().shared, ...d.shared },
          });
        }
      } catch (err) {
        toast.error("Failed to load contact info.");
      } finally {
        if (isMounted) toggleLoad("contact", false);
      }
    };
    loadContact();
    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  useEffect(() => {
    const clickOut = (e) => {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(e.target)
      )
        setRoleDropdownOpen(false);
    };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, []);

  /* --------------------------------- HANDLERS ----------------------------- */
  const handleAddChange = useCallback(
    (e) => setAddAdmin((p) => ({ ...p, [e.target.name]: e.target.value })),
    [],
  );
  const handlePasswordChange = useCallback(
    (e) =>
      setChangePassword((p) => ({ ...p, [e.target.name]: e.target.value })),
    [],
  );
  const togglePassword = useCallback(
    (id) => setShowPassword((p) => ({ ...p, [id]: !p[id] })),
    [],
  );

  const handleContactTChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setContactData((p) => ({
        ...p,
        translations: {
          ...p.translations,
          [contactLanguage]: {
            ...p.translations[contactLanguage],
            [name]: value,
          },
        },
      }));
      setContactErrors((p) => ({
        ...p,
        [contactLanguage]: { ...p[contactLanguage], [name]: null },
      }));
    },
    [contactLanguage],
  );

  const handleContactSChange = useCallback((e) => {
    const { name, value } = e.target;
    setContactData((p) => ({
      ...p,
      shared: { ...p.shared, [name]: value },
    }));
    setContactErrors((p) => ({
      ...p,
      shared: { ...p.shared, [name]: null },
    }));
  }, []);

  const validateContactForm = useCallback(() => {
    const newErrors = initializeContactErrors();
    let isValid = true;
    let firstErrLang = null;

    Object.keys(contactData.shared).forEach((k) => {
      const v = String(contactData.shared[k] || "").trim();
      if (!v) {
        newErrors.shared[k] = "Required field.";
        isValid = false;
      }
      if (
        k === "chatLinkUrl" &&
        v &&
        (!v.startsWith("/") || v.startsWith("//") || /\s/.test(v))
      ) {
        newErrors.shared[k] = "Must start with a single '/'";
        isValid = false;
      }
    });

    Object.keys(emptyContactTranslation()).forEach((f) => {
      LANGUAGES.forEach((lang) => {
        if (!String(contactData.translations[lang.code][f] || "").trim()) {
          newErrors[lang.code][f] = "Required field.";
          isValid = false;
          if (!firstErrLang) firstErrLang = lang.code;
        }
      });
    });

    setContactErrors(newErrors);
    if (!isValid) {
      if (firstErrLang && firstErrLang !== contactLanguage) {
        setContactLanguage(firstErrLang);
        toast.error(
          `Please fix missing fields in ${
            LANGUAGES.find((l) => l.code === firstErrLang)?.label
          }.`,
        );
      } else toast.error("Please fill in all highlighted fields.");
    }
    return isValid;
  }, [contactData, contactLanguage]);

  const handleContactSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateContactForm()) return;
      toggleLoad("contact", true);
      try {
        const payload = {
          ...contactData,
          shared: {
            ...contactData.shared,
            chatLinkUrl: String(contactData.shared.chatLinkUrl || "").trim(),
          },
        };
        const res = await axios.post(CONTACT_API, payload);
        if (!res.data?.success) throw new Error(res.data?.message);
        toast.success(res.data?.message || "Contact Info updated.");
      } catch (err) {
        toast.error(
          err.response?.data?.message || err.message || "Failed to save.",
        );
      } finally {
        toggleLoad("contact", false);
      }
    },
    [contactData, validateContactForm],
  );

  const openCloudinary = useCallback(() => {
    const [cloudName, preset] = [
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    ];
    if (!widgetReady || !window.cloudinary)
      return toast.error("Widget loading.");
    if (!cloudName || !preset || !profileData.uid)
      return toast.error("Configure Cloudinary variables or login.");
    if (widgetRef.current) return widgetRef.current.open();

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset: preset,
        sources: ["local", "url"],
        maxFiles: 1,
        maxFileSize: 5000000,
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
      },
      (err, res) => {
        if (err) return toast.error("Upload failed.");
        if (res?.event === "queues-start") toggleLoad("upload", true);
        if (res?.event === "success") {
          setProfileData((p) => ({
            ...p,
            image: res.info.secure_url,
            publicId: res.info.public_id,
          }));
          toast.success("Image uploaded.");
        }
        if (["queues-end", "close"].includes(res?.event))
          toggleLoad("upload", false);
      },
    );
    widgetRef.current.open();
  }, [profileData.uid, widgetReady]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) return toast.error("Enter profile name.");
    if (profileData.image && !profileData.publicId)
      return toast.error("Upload image properly.");
    toggleLoad("profile", true);
    try {
      const res = await axios.post(
        "/api/admin/adminusers/profile",
        {
          UID: profileData.uid,
          name: profileData.name.trim(),
          imageUrl: profileData.image,
          publicId: profileData.publicId,
        },
        { withCredentials: true },
      );
      if (res.data.success) toast.success(res.data.msg || "Profile saved!");
      else toast.error(res.data.msg || "Failed to save profile.");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to save.");
    } finally {
      toggleLoad("profile", false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (
      !addAdmin.name.trim() ||
      !addAdmin.email.trim() ||
      !addAdmin.password ||
      !addAdmin.role
    )
      return toast.error("Fill all fields.");
    if (addAdmin.password.length < 8) return toast.error("Password too short.");
    toggleLoad("creating", true);
    try {
      const s = await axios.get("/api/admin/adminusers/session", {
        withCredentials: true,
      });
      if ((s.data?.admin?.role ?? s.data?.role) !== "super-admin")
        return toast.error("Only Super Admin can create accounts.");
      const res = await axios.post(
        "/api/admin/adminusers/addAdmin",
        {
          name: addAdmin.name.trim(),
          email: addAdmin.email.trim(),
          password: addAdmin.password,
          role: addAdmin.role,
        },
        { withCredentials: true },
      );
      if (res.data.success) {
        toast.success("Admin created.");
        setAddAdmin(initialAdmin);
        setShowPassword({});
      } else toast.error(res.data.msg || "Unable to create.");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Unable to create.");
    } finally {
      toggleLoad("creating", false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!changePassword.currentPassword || !changePassword.newPassword)
      return toast.error("Fill both fields.");
    if (changePassword.newPassword.length < 8)
      return toast.error("Password too short.");
    toggleLoad("password", true);
    try {
      const res = await axios.post(
        "/api/admin/adminusers/change-password",
        {
          currentPassword: changePassword.currentPassword,
          newPassword: changePassword.newPassword,
        },
        { withCredentials: true },
      );
      if (res.data.success) {
        toast.success("Password changed.");
        setChangePassword(initialPassword);
        setShowPassword({});
      } else toast.error(res.data.msg || "Failed to change.");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to change.");
    } finally {
      toggleLoad("password", false);
    }
  };

  const hasContactErrs =
    Object.values(contactErrors.shared || {}).some(Boolean) ||
    LANGUAGES.some((l) =>
      Object.values(contactErrors[l.code] || {}).some(Boolean),
    );
  const hasLangErrs = useCallback(
    (c) =>
      Object.values(contactErrors[c] || {}).some(Boolean) ||
      Object.values(contactErrors.shared || {}).some(Boolean),
    [contactErrors],
  );

  if (isPageLoading)
    return (
      <div className="flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)]">
        <Spinner />
      </div>
    );

  /* ---------------------------------- RENDER ------------------------------ */
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[var(--background)] px-4 py-6 text-[var(--foreground)] transition-colors duration-300 sm:px-6 sm:py-8 lg:px-8">
      <Script
        src="https://upload-widget.cloudinary.com/latest/global/all.js"
        onReady={() => setWidgetReady(true)}
        onError={() => toast.error("Unable to load Cloudinary.")}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-[-8rem] -z-10 h-96 w-96 rounded-full bg-[var(--accent)]/8 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[35rem] left-[-10rem] -z-10 h-80 w-80 rounded-full bg-[var(--accent)]/5 blur-3xl"
      />

      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] shadow-sm">
              <ShieldCheck size={17} />
            </div>
            <span>Administration</span>
            <span className="opacity-50">/</span>
            <span className="font-medium text-[var(--foreground)]">
              User Security
            </span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles size={18} className="text-[var(--accent)]" />
                <span className="text-xs font-bold tracking-[0.18em] text-[var(--accent)] uppercase">
                  Workspace Settings
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Admin Management
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
                Manage your profile, administrator accounts, password security,
                and site contact information.
              </p>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div
          role="tablist"
          className="mb-6 [scrollbar-width:none] overflow-x-auto border-b border-[var(--border)] pb-2 [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex min-w-full gap-2 sm:gap-3">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={activeTab === t.id}
                onClick={() => setActiveTab(t.id)}
                className={`relative flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 sm:flex-1 sm:px-5 sm:py-3 ${
                  activeTab === t.id
                    ? "bg-[var(--accent)] text-white shadow-[var(--accent)]/20 shadow-md"
                    : "border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]"
                }`}
              >
                <t.icon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.shortLabel}</span>
                {t.id === "contact" && hasContactErrs && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[var(--surface)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Grid: Removes right sidebar for Password & Contact Info tabs */}
        <div
          className={`grid items-start gap-6 transition-all duration-300 ${
            activeTab === "profile" || activeTab === "add"
              ? "lg:grid-cols-[minmax(0,1fr)_300px]"
              : "lg:grid-cols-1"
          }`}
        >
          <section className={CLASSES.card}>
            <div className="h-1 bg-gradient-to-r from-[var(--accent)] via-[#35B5B5] to-[var(--accent)]" />
            <div className="p-5 sm:p-8">
              {/* TAB 1: PROFILE */}
              {activeTab === "profile" && (
                <div className="animate-in fade-in duration-300">
                  <div className="mb-7 flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                      <UserRound size={23} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">Profile Settings</h2>
                    </div>
                  </div>
                  <form onSubmit={handleProfileSubmit} className="space-y-7">
                    <div className="flex flex-col items-center gap-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 sm:flex-row sm:items-start sm:p-6">
                      <div className="group relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-4 border-[var(--surface)] bg-[var(--accent-soft)] shadow-lg">
                        <div className="absolute inset-0 overflow-hidden rounded-full">
                          {profileData.image ? (
                            <img
                              src={profileData.image}
                              alt="Profile"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound
                              size={48}
                              className="text-[var(--accent)]"
                            />
                          )}
                        </div>
                        <div className="absolute right-0.5 bottom-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-md">
                          <Camera size={16} />
                        </div>
                      </div>
                      <div className="w-full flex-1 text-center sm:text-left">
                        <h3 className="text-base font-bold">Profile Picture</h3>
                        <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                          <button
                            type="button"
                            onClick={openCloudinary}
                            disabled={!widgetReady || loadState.upload}
                            className={CLASSES.btn}
                          >
                            {loadState.upload ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            ) : (
                              <Upload size={17} />
                            )}
                            {loadState.upload
                              ? "Uploading..."
                              : profileData.image
                                ? "Change Picture"
                                : "Upload Picture"}
                          </button>
                          {profileData.image && (
                            <button
                              type="button"
                              onClick={() =>
                                setProfileData((p) => ({
                                  ...p,
                                  image: "",
                                  publicId: "",
                                }))
                              }
                              className={`${CLASSES.btnSec} hover:bg-red-50 hover:text-red-600`}
                            >
                              <Trash2 size={16} /> Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className={CLASSES.label}>Profile Name</label>
                      <div className="group relative">
                        <UserRound
                          size={18}
                          className={`${CLASSES.icon} group-focus-within:text-[var(--accent)]`}
                        />
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData((p) => ({
                              ...p,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Enter name"
                          required
                          className={CLASSES.input}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
                      <button
                        type="submit"
                        disabled={loadState.profile || loadState.upload}
                        className={CLASSES.btn}
                      >
                        <Save size={17} />{" "}
                        {loadState.profile ? "Saving..." : "Save Profile"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: ADD ADMIN */}
              {activeTab === "add" && (
                <div className="animate-in fade-in duration-300">
                  <div className="mb-7 flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                      <UserPlus size={23} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">
                        Create Administrator
                      </h2>
                    </div>
                  </div>
                  <form onSubmit={handleAddSubmit} className="space-y-5">
                    <div>
                      <label className={CLASSES.label}>Full Name</label>
                      <div className="group relative">
                        <UserRound
                          size={18}
                          className={`${CLASSES.icon} group-focus-within:text-[var(--accent)]`}
                        />
                        <input
                          name="name"
                          value={addAdmin.name}
                          onChange={handleAddChange}
                          placeholder="Enter name"
                          required
                          className={CLASSES.input}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={CLASSES.label}>Email Address</label>
                      <div className="group relative">
                        <Mail
                          size={18}
                          className={`${CLASSES.icon} group-focus-within:text-[var(--accent)]`}
                        />
                        <input
                          name="email"
                          type="email"
                          value={addAdmin.email}
                          onChange={handleAddChange}
                          placeholder="admin@example.com"
                          required
                          className={CLASSES.input}
                        />
                      </div>
                    </div>
                    <PwdInput
                      id="admin-password"
                      label="Password"
                      name="password"
                      val={addAdmin.password}
                      holder="Create password"
                      onChange={handleAddChange}
                      showPassword={showPassword}
                      togglePassword={togglePassword}
                    />

                    <div className="relative" ref={roleDropdownRef}>
                      <label className={CLASSES.label}>Admin Role</label>
                      <button
                        type="button"
                        onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                        className={`${CLASSES.input} flex w-full items-center justify-between text-left`}
                      >
                        <span>
                          {roles.find((r) => r.value === addAdmin.role)
                            ?.label || "Select role"}
                        </span>
                        <ChevronDown
                          size={18}
                          className={roleDropdownOpen ? "rotate-180" : ""}
                        />
                      </button>
                      {roleDropdownOpen && (
                        <div className="absolute right-0 bottom-full left-0 z-50 mb-2 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                          {roles.map((r) => (
                            <button
                              key={r.value}
                              type="button"
                              onClick={() => {
                                setAddAdmin((p) => ({ ...p, role: r.value }));
                                setRoleDropdownOpen(false);
                              }}
                              className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm hover:bg-[var(--accent-soft)] ${
                                addAdmin.role === r.value
                                  ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent)]"
                                  : ""
                              }`}
                            >
                              <span>{r.label}</span>
                              {addAdmin.role === r.value && (
                                <Check
                                  size={17}
                                  className="text-[var(--accent)]"
                                />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
                      <button
                        type="submit"
                        disabled={loadState.creating}
                        className={CLASSES.btn}
                      >
                        <UserPlus size={17} />{" "}
                        {loadState.creating ? "Creating..." : "Create Admin"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: PASSWORD */}
              {activeTab === "password" && (
                <div className="animate-in fade-in duration-300">
                  <div className="mb-7 flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                      <LockKeyhole size={23} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">Change Password</h2>
                    </div>
                  </div>
                  <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    <PwdInput
                      id="curr-pwd"
                      label="Current Password"
                      name="currentPassword"
                      val={changePassword.currentPassword}
                      holder="Current password"
                      onChange={handlePasswordChange}
                      showPassword={showPassword}
                      togglePassword={togglePassword}
                    />
                    <PwdInput
                      id="new-pwd"
                      label="New Password"
                      name="newPassword"
                      val={changePassword.newPassword}
                      holder="New password"
                      onChange={handlePasswordChange}
                      showPassword={showPassword}
                      togglePassword={togglePassword}
                    />
                    <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
                      <button
                        type="submit"
                        disabled={loadState.password}
                        className={CLASSES.btn}
                      >
                        <LockKeyhole size={17} />{" "}
                        {loadState.password ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 4: CONTACT INFO */}
              {activeTab === "contact" && (
                <div className="animate-in fade-in duration-300">
                  <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                        <Phone size={23} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold">
                          Contact Information
                        </h2>
                        <p className="text-sm text-[var(--muted)]">
                          Manage the &quot;Reach Out to Us&quot; section.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-1">
                      {LANGUAGES.map((l) => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => setContactLanguage(l.code)}
                          className={`relative rounded-lg px-3 py-2 text-xs font-semibold ${
                            contactLanguage === l.code
                              ? "bg-[var(--accent)] text-white"
                              : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]"
                          }`}
                        >
                          {l.label}
                          {hasLangErrs(l.code) && (
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {loadState.contact ? (
                    <div className="flex min-h-64 items-center justify-center">
                      <Spinner />
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-6">
                      <div className={CLASSES.box}>
                        <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--accent)]">
                          <Text size={18} /> Presentation Text
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <CInput
                            name="topTag"
                            label="Top Tag"
                            placeholder="e.g. CONTACT INFO"
                            contactData={contactData}
                            contactErrors={contactErrors}
                            contactLanguage={contactLanguage}
                            onChangeS={handleContactSChange}
                            onChangeT={handleContactTChange}
                          />
                          <CInput
                            name="highlightedTitle"
                            label="Highlighted Title"
                            placeholder="e.g. Reach"
                            contactData={contactData}
                            contactErrors={contactErrors}
                            contactLanguage={contactLanguage}
                            onChangeS={handleContactSChange}
                            onChangeT={handleContactTChange}
                          />
                          <CInput
                            name="mainTitle"
                            label="Main Title"
                            placeholder="e.g. Out to Us"
                            contactData={contactData}
                            contactErrors={contactErrors}
                            contactLanguage={contactLanguage}
                            onChangeS={handleContactSChange}
                            onChangeT={handleContactTChange}
                          />
                        </div>
                      </div>

                      <div className={CLASSES.box}>
                        <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--accent)]">
                          <MapPin size={18} /> Location Block
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <CInput
                            name="locationTitle"
                            label="Title"
                            placeholder="e.g. Our Location"
                            contactData={contactData}
                            contactErrors={contactErrors}
                            contactLanguage={contactLanguage}
                            onChangeS={handleContactSChange}
                            onChangeT={handleContactTChange}
                          />
                          <CInput
                            name="locationAddress"
                            label="Address"
                            placeholder="e.g. 993 Renner Burg..."
                            colClass="sm:col-span-2"
                            contactData={contactData}
                            contactErrors={contactErrors}
                            contactLanguage={contactLanguage}
                            onChangeS={handleContactSChange}
                            onChangeT={handleContactTChange}
                          />
                        </div>
                      </div>

                      <div className={CLASSES.box}>
                        <div className="mb-4 flex flex-wrap items-center justify-between">
                          <h3 className="flex items-center gap-2 font-bold text-[var(--accent)]">
                            <Mail size={18} /> Email Block
                          </h3>
                          <span className="text-xs text-[var(--muted)]">
                            Shared globally
                          </span>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <CInput
                            name="emailTitle"
                            label="Title (Translated)"
                            placeholder="e.g. Email us"
                            contactData={contactData}
                            contactErrors={contactErrors}
                            contactLanguage={contactLanguage}
                            onChangeS={handleContactSChange}
                            onChangeT={handleContactTChange}
                          />
                          <CInput
                            isShared
                            name="email1"
                            label="Email 1 (Shared)"
                            placeholder="support@bexon.com"
                            contactData={contactData}
                            contactErrors={contactErrors}
                            contactLanguage={contactLanguage}
                            onChangeS={handleContactSChange}
                            onChangeT={handleContactTChange}
                          />
                          <CInput
                            isShared
                            name="email2"
                            label="Email 2 (Shared)"
                            placeholder="info@bexon.com"
                            contactData={contactData}
                            contactErrors={contactErrors}
                            contactLanguage={contactLanguage}
                            onChangeS={handleContactSChange}
                            onChangeT={handleContactTChange}
                          />
                        </div>
                      </div>

                      <div className={CLASSES.box}>
                        <div className="mb-4 flex flex-wrap items-center justify-between">
                          <h3 className="flex items-center gap-2 font-bold text-[var(--accent)]">
                            <Phone size={18} /> Phone Block
                          </h3>
                          <span className="text-xs text-[var(--muted)]">
                            Shared globally
                          </span>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <CInput
                            name="phoneTitle"
                            label="Title (Translated)"
                            placeholder="e.g. Call us"
                            contactData={contactData}
                            contactErrors={contactErrors}
                            contactLanguage={contactLanguage}
                            onChangeS={handleContactSChange}
                            onChangeT={handleContactTChange}
                          />
                          <CInput
                            isShared
                            name="phone1"
                            label="Phone 1 (Shared)"
                            placeholder="+1 000 0000"
                            contactData={contactData}
                            contactErrors={contactErrors}
                            contactLanguage={contactLanguage}
                            onChangeS={handleContactSChange}
                            onChangeT={handleContactTChange}
                          />
                          <CInput
                            isShared
                            name="phone2"
                            label="Phone 2 (Shared)"
                            placeholder="+1 000 0000"
                            contactData={contactData}
                            contactErrors={contactErrors}
                            contactLanguage={contactLanguage}
                            onChangeS={handleContactSChange}
                            onChangeT={handleContactTChange}
                          />
                        </div>
                      </div>

                      <div className={CLASSES.box}>
                        <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--accent)]">
                          <MessageCircle size={18} /> Live Chat Block
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <CInput
                            name="chatTitle"
                            label="Title (Translated)"
                            placeholder="e.g. Live chat"
                            contactData={contactData}
                            contactErrors={contactErrors}
                            contactLanguage={contactLanguage}
                            onChangeS={handleContactSChange}
                            onChangeT={handleContactTChange}
                          />
                          <CInput
                            isShared
                            name="chatEmail"
                            label="Email (Shared)"
                            placeholder="chat@bexon.com"
                            contactData={contactData}
                            contactErrors={contactErrors}
                            contactLanguage={contactLanguage}
                            onChangeS={handleContactSChange}
                            onChangeT={handleContactTChange}
                          />
                          <CInput
                            name="chatLinkText"
                            label="Link Text"
                            placeholder="e.g. Need help?"
                            Icon={LinkIcon}
                            contactData={contactData}
                            contactErrors={contactErrors}
                            contactLanguage={contactLanguage}
                            onChangeS={handleContactSChange}
                            onChangeT={handleContactTChange}
                          />
                          <CInput
                            isShared
                            name="chatLinkUrl"
                            label="URL (Shared)"
                            placeholder="/contact"
                            Icon={LinkIcon}
                            contactData={contactData}
                            contactErrors={contactErrors}
                            contactLanguage={contactLanguage}
                            onChangeS={handleContactSChange}
                            onChangeT={handleContactTChange}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
                        <button
                          type="submit"
                          disabled={loadState.contact}
                          className={CLASSES.btn}
                        >
                          <Save size={17} /> Save Contact Info
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Right Sidebar - Shown only for Profile & Add Admin */}
          {(activeTab === "profile" || activeTab === "add") && (
            <aside className="animate-in slide-in-from-right-4 space-y-5 duration-300">
              <div className={CLASSES.card}>
                <div className="h-1 bg-gradient-to-r from-[var(--accent)]/20 via-[var(--accent)] to-[var(--accent)]/20" />
                <div className="p-5 sm:p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <ShieldCheck size={23} />
                  </div>
                  <span className="text-xs font-bold tracking-wider text-[var(--accent)] uppercase">
                    Workspace Guide
                  </span>
                  <h3 className="mt-2 text-lg font-bold">
                    {activeTab === "profile"
                      ? "Profile Management"
                      : "Account Management"}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {activeTab === "profile"
                      ? "Personalize your administrator profile with a name and picture."
                      : "Create new accounts to allow team members access."}
                  </p>
                  <div className="my-5 border-t border-[var(--border)]" />
                  <ul className="space-y-4">
                    {(activeTab === "profile"
                      ? [
                          "Preview your picture before saving",
                          "Upload through Cloudinary",
                          "Maximum 5 MB limit",
                        ]
                      : [
                          "Use strong, unique passwords",
                          "Restrict administrator access",
                          "Never share login credentials",
                        ]
                    ).map((item) => (
                      <li key={item} className="group flex items-start gap-2.5">
                        <CheckCircle2
                          size={17}
                          className="mt-0.5 shrink-0 text-[var(--accent)]"
                        />
                        <span className="text-sm text-[var(--muted)]">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
