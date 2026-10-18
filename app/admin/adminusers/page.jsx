"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import {
  UserPlus,
  LockKeyhole,
  Mail,
  UserRound,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Camera,
  Upload,
  Trash2,
  Save,
  User,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const initialAdmin = { name: "", email: "", password: "" };
const initialPassword = { currentPassword: "", newPassword: "" };

export default function AdminUsersPage() {
  const widgetRef = useRef(null);

  const [widgetReady, setWidgetReady] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState({});
  const [addAdmin, setAddAdmin] = useState(initialAdmin);
  const [changePassword, setChangePassword] = useState(initialPassword);
  const [isCreating, setIsCreating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profilePublicId, setProfilePublicId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [adminUid, setAdminUid] = useState("");

  // Get the logged-in admin UID.
  useEffect(() => {
    const getAdminUid = async () => {
      try {
        const res = await axios.get("/api/admin/adminusers/session", {
          withCredentials: true,
        });

        if (res.data.success) {
          setAdminUid(res.data.admin.uid);
        }
      } catch (error) {
        console.error(
          "Unable to get admin UID:",
          error.response?.data || error.message,
        );
      }
    };

    getAdminUid();
  }, []);

  // Load the saved profile after the admin UID is available.
  useEffect(() => {
    if (!adminUid) return;

    const loadProfile = async () => {
      setIsLoadingProfile(true);

      try {
        const res = await axios.get("/api/admin/adminusers/profile", {
          params: { UID: adminUid },
          withCredentials: true,
        });

        if (res.data.success) {
          const profile = res.data.profile || res.data.data;

          if (profile) {
            setProfileName(profile.name || "");
            setProfileImage(profile.imageUrl || "");
            setProfilePublicId(profile.publicId || "");
          }
        }
      } catch (error) {
        console.log(
          "Unable to load admin profile:",
          error.response?.data || error.message,
        );
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [adminUid]);

  const inputClass =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-3.5 pl-11 pr-12 text-sm text-[var(--foreground)] outline-none transition-all duration-300 placeholder:text-[var(--muted)] hover:border-[var(--accent)]/50 focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:ring-4 focus:ring-[var(--accent)]/10";

  const labelClass =
    "mb-2 block text-sm font-semibold text-[var(--foreground)]";

  const iconClass =
    "absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors duration-200";

  const cardClass =
    "overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all duration-300 hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-[var(--accent)]/5";

  const buttonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-[var(--accent)]/15 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--accent)]/20 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent)]/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none";

  const secondaryButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]/50 hover:bg-[var(--accent-soft)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent)]/15 disabled:cursor-not-allowed disabled:opacity-60";

  const handleAddChange = (e) => {
    setAddAdmin((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e) => {
    setChangePassword((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const togglePassword = (id) => {
    setShowPassword((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const openCloudinaryWidget = () => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!widgetReady || !window.cloudinary) {
      toast.error("Cloudinary widget is still loading.");
      return;
    }

    if (!cloudName || !uploadPreset || !adminUid) {
      toast.error(
        "Configure your Cloudinary environment variables or login First.",
      );
      return;
    }

    if (widgetRef.current) {
      widgetRef.current.open();
      return;
    }

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ["local", "url", "camera"],
        defaultSource: "local",
        resourceType: "image",
        multiple: false,
        maxFiles: 1,
        maxFileSize: 5000000,
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        cropping: true,
        croppingAspectRatio: 1,
        showSkipCropButton: true,
        showUploadMoreButton: false,
        singleUploadAutoClose: true,
        showCompletedButton: false,
        secure: true,
        language: "en",
        styles: {
          palette: {
            window: "#FFFFFF",
            windowBorder: "#D0E5E5",
            tabIcon: "#1E8A8A",
            menuIcons: "#1E8A8A",
            textDark: "#101828",
            textLight: "#FFFFFF",
            link: "#187777",
            action: "#1E8A8A",
            inactiveTabIcon: "#667085",
            error: "#D92D20",
            inProgress: "#1E8A8A",
            complete: "#12B76A",
            sourceBg: "#F2F8F8",
          },
        },
      },
      (error, result) => {
        if (error) {
          setIsUploading(false);
          toast.error("Cloudinary upload failed. Please try again.");
          console.error("Cloudinary upload error:", error);
          return;
        }

        if (result?.event === "queues-start") {
          setIsUploading(true);
        }

        if (result?.event === "success") {
          const image = result.info;

          setProfileImage(image.secure_url);
          setProfilePublicId(image.public_id);
          setIsUploading(false);
          toast.success("Profile image uploaded successfully.");
        }

        if (["queues-end", "close"].includes(result?.event)) {
          setIsUploading(false);
        }
      },
    );

    widgetRef.current.open();
  };

  const removeProfileImage = () => {
    setProfileImage("");
    setProfilePublicId("");
    toast.success("Image removed from the profile preview.");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!profileName.trim()) {
      return toast.error("Enter your profile name.");
    }

    if (profileImage && !profilePublicId) {
      return toast.error("Upload the image through Cloudinary first.");
    }

    if (!adminUid) {
      return toast.error("Unable to identify the logged-in administrator.");
    }

    setIsSavingProfile(true);

    try {
      const imageData = {
        UID: adminUid,
        name: profileName.trim(),
        imageUrl: profileImage,
        publicId: profilePublicId,
      };

      const res = await axios.post("/api/admin/adminusers/profile", imageData, {
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(res.data.msg || "Profile saved successfully!");
      } else {
        toast.error(res.data.msg || "Failed to save profile.");
      }
    } catch (error) {
      console.error(
        "Profile save error:",
        error.response?.data || error.message,
      );

      toast.error(
        error.response?.data?.msg ||
          error.response?.data?.message ||
          "Failed to save profile.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!addAdmin.name.trim() || !addAdmin.email.trim() || !addAdmin.password) {
      return toast.error("Please fill in all fields.");
    }

    if (addAdmin.password.length < 8) {
      return toast.error("Password must contain at least 8 characters.");
    }

    setIsCreating(true);

    try {
      const res = await axios.post("/api/admin/adminusers/addAdmin", {
        name: addAdmin.name.trim(),
        email: addAdmin.email.trim(),
        password: addAdmin.password,
      });

      if (res.data.success) {
        toast.success(res.data.msg || "Admin created successfully.");
        setAddAdmin({ ...initialAdmin });
        setShowPassword({});
      } else {
        toast.error(res.data.msg || "Unable to create admin.");
      }
    } catch (error) {
      console.log("Add admin error:", error.response?.data || error.message);

      toast.error(
        error.response?.data?.msg ||
          error.response?.data?.message ||
          "Unable to create the administrator.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!changePassword.currentPassword || !changePassword.newPassword) {
      return toast.error("Please fill in both password fields.");
    }

    if (changePassword.newPassword.length < 8) {
      return toast.error("New password must contain at least 8 characters.");
    }

    if (changePassword.currentPassword === changePassword.newPassword) {
      return toast.error("Choose a different new password.");
    }

    setIsChangingPassword(true);

    try {
      toast.info("Connect your change-password API.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const renderPasswordInput = ({
    id,
    label,
    name,
    value,
    onChange,
    placeholder,
    autoComplete = "new-password",
    minLength = 8,
  }) => (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>

      <div className="group relative">
        <LockKeyhole
          size={18}
          className={`${iconClass} group-focus-within:text-[var(--accent)]`}
        />

        <input
          id={id}
          name={name}
          type={showPassword[id] ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          required
          className={inputClass}
        />

        <button
          type="button"
          onClick={() => togglePassword(id)}
          aria-label={showPassword[id] ? "Hide password" : "Show password"}
          className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--muted)] transition-all duration-200 hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] active:scale-90"
        >
          {showPassword[id] ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );

  const tabs = [
    ["profile", "My Profile", User],
    ["add", "Add Admin", UserPlus],
    ["password", "Change Password", LockKeyhole],
  ];

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[var(--background)] px-4 py-6 text-[var(--foreground)] transition-colors duration-300 sm:px-6 sm:py-8 lg:px-8">
      <Script
        src="https://upload-widget.cloudinary.com/latest/global/all.js"
        strategy="afterInteractive"
        onReady={() => setWidgetReady(true)}
        onError={() => toast.error("Unable to load Cloudinary widget.")}
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

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                Manage your profile, administrator accounts, and password
                security from one place.
              </p>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent-soft)] px-3.5 py-2 text-xs font-semibold text-[var(--accent)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-30" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
              </span>
              Admin Workspace
            </div>
          </div>
        </header>

        <div className="mb-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-sm sm:inline-flex">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {tabs.map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                aria-pressed={activeTab === id}
                className={`group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-xl px-5 py-3.5 text-sm font-semibold transition-all duration-300 ease-out active:scale-[0.97] ${
                  activeTab === id
                    ? "bg-[var(--accent)] text-white shadow-[var(--accent)]/20 shadow-md"
                    : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                }`}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition-transform duration-300 ${
                    activeTab === id ? "" : "group-hover:scale-110"
                  }`}
                />

                <span>{label}</span>

                {activeTab === id && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                    <CheckCircle2 size={13} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className={cardClass}>
            <div className="h-1 bg-gradient-to-r from-[var(--accent)] via-[#35B5B5] to-[var(--accent)]" />

            <div className="p-5 sm:p-8">
              {activeTab === "profile" && (
                <div className="animate-in fade-in duration-300">
                  <div className="mb-7 flex items-center gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--accent)]/15 bg-[var(--accent-soft)] text-[var(--accent)] transition-transform duration-300 hover:scale-105 hover:rotate-3">
                      <UserRound size={23} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold tracking-tight">
                        Profile Settings
                      </h2>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Update your display name and profile picture.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-7">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 transition-all duration-300 hover:border-[var(--accent)]/30 sm:p-6">
                      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                        <div className="group relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-4 border-[var(--surface)] bg-[var(--accent-soft)] shadow-[var(--accent)]/10 shadow-lg ring-1 ring-[var(--accent)]/15 transition-all duration-300 hover:scale-[1.03] hover:shadow-[var(--accent)]/15 hover:shadow-xl">
                          <div className="absolute inset-0 overflow-hidden rounded-full">
                            {profileImage ? (
                              <img
                                src={profileImage}
                                alt="Profile preview"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={() =>
                                  toast.error(
                                    "Unable to load the image preview.",
                                  )
                                }
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <UserRound
                                  size={48}
                                  className="text-[var(--accent)] transition-transform duration-300 group-hover:scale-110"
                                />
                              </div>
                            )}
                          </div>

                          <div className="absolute right-0.5 bottom-0.5 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[var(--surface)] bg-[var(--accent)] text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                            <Camera size={16} />
                          </div>
                        </div>

                        <div className="w-full flex-1 text-center sm:text-left">
                          <h3 className="text-base font-bold">
                            Profile Picture
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                            Upload a professional photo from your computer or
                            choose an image from a web address through
                            Cloudinary.
                          </p>

                          <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                            <button
                              type="button"
                              onClick={openCloudinaryWidget}
                              disabled={!widgetReady || isUploading}
                              className={`${buttonClass} px-4 py-2.5`}
                            >
                              {isUploading ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                              ) : (
                                <Upload size={17} />
                              )}

                              {!widgetReady
                                ? "Loading Widget..."
                                : isUploading
                                  ? "Uploading..."
                                  : profileImage
                                    ? "Change Picture"
                                    : "Upload Picture"}
                            </button>

                            {profileImage && (
                              <button
                                type="button"
                                onClick={removeProfileImage}
                                className={`${secondaryButtonClass} px-4 py-2.5 hover:border-red-300 hover:bg-red-50 hover:text-red-600`}
                              >
                                <Trash2 size={16} />
                                Remove
                              </button>
                            )}
                          </div>

                          <p className="mt-3 text-xs text-[var(--muted)]">
                            JPG, PNG, or WEBP · Maximum 5 MB
                          </p>

                          {profilePublicId && (
                            <div className="mt-3 inline-flex max-w-full items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-left">
                              <CheckCircle2
                                size={15}
                                className="mt-0.5 shrink-0 text-[var(--accent)]"
                              />
                              <p className="text-xs break-all text-[var(--muted)]">
                                {profilePublicId}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="profile-name" className={labelClass}>
                        Profile Name
                      </label>

                      <div className="group relative">
                        <UserRound
                          size={18}
                          className={`${iconClass} group-focus-within:text-[var(--accent)]`}
                        />

                        <input
                          id="profile-name"
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          placeholder="Enter your name"
                          autoComplete="name"
                          maxLength={100}
                          required
                          className={inputClass}
                        />
                      </div>

                      {isLoadingProfile && (
                        <p className="mt-2 text-xs text-[var(--muted)]">
                          Loading saved profile...
                        </p>
                      )}
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-all duration-300 hover:border-[var(--accent)]/30">
                      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                        <p className="text-xs font-bold tracking-[0.12em] text-[var(--muted)] uppercase">
                          Live Preview
                        </p>

                        <span className="flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--accent)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                          PREVIEW
                        </span>
                      </div>

                      <div className="flex items-center gap-3.5 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--accent)]/15 bg-[var(--accent-soft)] text-[var(--accent)]">
                          {profileImage ? (
                            <img
                              src={profileImage}
                              alt="Small profile preview"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound size={22} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold">
                            {profileName.trim() || "Your Name"}
                          </p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            Administrator
                          </p>
                        </div>

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                          <ArrowUpRight size={17} />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        disabled={isSavingProfile || isLoadingProfile}
                        onClick={() => {
                          setProfileName("");
                          setProfileImage("");
                          setProfilePublicId("");
                        }}
                        className={secondaryButtonClass}
                      >
                        <RotateCcw size={16} />
                        Reset
                      </button>

                      <button
                        type="submit"
                        disabled={
                          isSavingProfile || isUploading || isLoadingProfile
                        }
                        className={buttonClass}
                      >
                        <Save size={17} />
                        {isSavingProfile ? "Saving..." : "Save Profile"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "add" && (
                <div className="animate-in fade-in duration-300">
                  <div className="mb-7 flex items-center gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--accent)]/15 bg-[var(--accent-soft)] text-[var(--accent)] transition-transform duration-300 hover:scale-105 hover:rotate-3">
                      <UserPlus size={23} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold tracking-tight">
                        Create Administrator
                      </h2>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Enter the details for the new admin account.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAddSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="admin-name" className={labelClass}>
                        Full Name
                      </label>

                      <div className="group relative">
                        <UserRound
                          size={18}
                          className={`${iconClass} group-focus-within:text-[var(--accent)]`}
                        />

                        <input
                          id="admin-name"
                          name="name"
                          value={addAdmin.name}
                          onChange={handleAddChange}
                          placeholder="Enter full name"
                          autoComplete="name"
                          required
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="admin-email" className={labelClass}>
                        Email Address
                      </label>

                      <div className="group relative">
                        <Mail
                          size={18}
                          className={`${iconClass} group-focus-within:text-[var(--accent)]`}
                        />

                        <input
                          id="admin-email"
                          name="email"
                          type="email"
                          value={addAdmin.email}
                          onChange={handleAddChange}
                          placeholder="admin@example.com"
                          autoComplete="email"
                          required
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {renderPasswordInput({
                      id: "admin-password",
                      label: "Password",
                      name: "password",
                      value: addAdmin.password,
                      onChange: handleAddChange,
                      placeholder: "Create a strong password",
                    })}

                    <div className="flex items-start gap-3 rounded-xl border border-[var(--accent)]/15 bg-[var(--accent-soft)] p-4">
                      <ShieldCheck
                        size={19}
                        className="mt-0.5 shrink-0 text-[var(--accent)]"
                      />
                      <p className="text-sm leading-6 text-[var(--muted)]">
                        Use at least 8 characters. Your server should securely
                        hash the password before storing it.
                      </p>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        disabled={isCreating}
                        onClick={() => {
                          setAddAdmin({ ...initialAdmin });
                          setShowPassword({});
                        }}
                        className={secondaryButtonClass}
                      >
                        <RotateCcw size={16} />
                        Reset
                      </button>

                      <button
                        type="submit"
                        disabled={isCreating}
                        className={buttonClass}
                      >
                        <UserPlus size={17} />
                        {isCreating ? "Creating..." : "Create Admin"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "password" && (
                <div className="animate-in fade-in duration-300">
                  <div className="mb-7 flex items-center gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--accent)]/15 bg-[var(--accent-soft)] text-[var(--accent)] transition-transform duration-300 hover:scale-105 hover:rotate-3">
                      <LockKeyhole size={23} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold tracking-tight">
                        Change Password
                      </h2>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Update the password for your account.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    {renderPasswordInput({
                      id: "current-password",
                      label: "Current Password",
                      name: "currentPassword",
                      value: changePassword.currentPassword,
                      onChange: handlePasswordChange,
                      placeholder: "Enter current password",
                      autoComplete: "current-password",
                      minLength: 1,
                    })}

                    {renderPasswordInput({
                      id: "new-password",
                      label: "New Password",
                      name: "newPassword",
                      value: changePassword.newPassword,
                      onChange: handlePasswordChange,
                      placeholder: "Enter new password",
                    })}

                    <div className="rounded-2xl border border-[var(--accent)]/15 bg-[var(--accent-soft)] p-4">
                      <div className="flex items-start gap-3">
                        <ShieldCheck
                          size={20}
                          className="mt-0.5 shrink-0 text-[var(--accent)]"
                        />

                        <div>
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            Security reminder
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                            Your API must verify the current password and
                            securely hash the new password before saving it.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        disabled={isChangingPassword}
                        onClick={() => {
                          setChangePassword({ ...initialPassword });
                          setShowPassword({});
                        }}
                        className={secondaryButtonClass}
                      >
                        <RotateCcw size={16} />
                        Reset
                      </button>

                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className={buttonClass}
                      >
                        <LockKeyhole size={17} />
                        {isChangingPassword ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-5">
            <div className={cardClass}>
              <div className="h-1 bg-gradient-to-r from-[var(--accent)]/20 via-[var(--accent)] to-[var(--accent)]/20" />

              <div className="p-5 sm:p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--accent)]/15 bg-[var(--accent-soft)] text-[var(--accent)] transition-transform duration-300 hover:scale-105 hover:rotate-3">
                  <ShieldCheck size={23} />
                </div>

                <span className="text-xs font-bold tracking-[0.15em] text-[var(--accent)] uppercase">
                  Workspace Guide
                </span>

                <h3 className="mt-2 text-lg font-bold tracking-tight">
                  {activeTab === "profile"
                    ? "Profile Management"
                    : "Account Security"}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {activeTab === "profile"
                    ? "Personalize your administrator profile with a name and picture."
                    : "Keep administrator accounts secure and limit access to trusted users."}
                </p>

                <div className="my-5 border-t border-[var(--border)]" />

                <ul className="space-y-4">
                  {(activeTab === "profile"
                    ? [
                        "Preview your picture before saving",
                        "Upload through Cloudinary",
                        "Choose a file or web address",
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
                        className="mt-0.5 shrink-0 text-[var(--accent)] transition-transform duration-200 group-hover:scale-110"
                      />
                      <span className="text-sm leading-5 text-[var(--muted)] transition-colors duration-200 group-hover:text-[var(--foreground)]">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent-soft)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--accent)]/5 hover:shadow-lg sm:p-6">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full border border-[var(--accent)]/10 transition-transform duration-500 group-hover:scale-125"
              />

              <div className="relative">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--accent)] shadow-sm">
                  <Sparkles size={17} />
                </div>

                <p className="text-sm font-bold text-[var(--accent)]">
                  {activeTab === "profile"
                    ? "Profile Changes"
                    : activeTab === "add"
                      ? "New Administrator"
                      : "Password Update"}
                </p>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {activeTab === "profile"
                    ? "Cloudinary handles image uploads, while your profile API saves the name and image details."
                    : activeTab === "add"
                      ? "Your API must create administrator accounts securely."
                      : "Verify the current password and hash the new password on the server."}
                </p>
              </div>
            </div>
          </aside>
        </div>

        <footer className="mt-10 border-t border-[var(--border)] pt-5 text-center text-xs text-[var(--muted)]">
          <span className="font-semibold text-[var(--accent)]">BEXON</span>
          <span className="mx-2 opacity-40">·</span>
          Admin Dashboard
          <span className="mx-2 opacity-40">·</span>
          User &amp; Security Management
        </footer>
      </div>
    </main>
  );
}
