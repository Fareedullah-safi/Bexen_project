"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Loader2,
  MapPin,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const DEFAULT_MAP_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d316440.5712687838!2d-74.01091796224334!3d40.67186885683901!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sbd!4v1745918398047!5m2!1sen!2sbd";

const TRANSLATIONS = {
  en: {
    badge: "GET IN TOUCH",
    heading: "Feel Free to Get in Touch or Visit our Location.",
    description:
      "Have a question or need more information? Send us a message and our team will be happy to help you.",
    fullNamePlaceholder: "Full Name*",
    emailPlaceholder: "Email Address*",
    phonePlaceholder: "Phone Number*",
    selectOptionPlaceholder: "Choose an option",
    selectOptionError: "Please choose an option.",
    messagePlaceholder: "Message here...*",
    submitBtn: "Submit Now",
    submittingBtn: "Sending...",
    successMsg: "Your message has been sent successfully.",
    errorMsg: "Failed to send message. Please try again.",
    mapBadge: "OUR LOCATION",
    subjectOptions: [
      "Business Strategy",
      "Customer Experience",
      "Sustainability and ESG",
      "Training and Development",
      "IT Support & Maintenance",
      "Marketing Strategy",
    ],
  },
  ps: {
    badge: "له موږ سره په اړیکه کې شئ",
    heading: "په وړیا توګه له موږ سره اړیکه ونیسئ یا زموږ د ادرس لیدنه وکړئ.",
    description:
      "پوښتنه لرئ یا نورو معلوماتو ته اړتیا لرئ؟ موږ ته پیغام واستوئ او زموږ ټیم به له تاسو سره مرستې ته خوښ وي.",
    fullNamePlaceholder: "بشپړ نوم*",
    emailPlaceholder: "بریښنالیک ادرس*",
    phonePlaceholder: "د تلیفون شمیره*",
    selectOptionPlaceholder: "یو اختیار وټاکئ",
    selectOptionError: "مهرباني وکړئ یو اختیار وټاکئ.",
    messagePlaceholder: "دلته پیغام ولیکئ...*",
    submitBtn: "اوس یې واستوئ",
    submittingBtn: "لیږل کیږي...",
    successMsg: "ستاسو پیغام په بریالیتوب سره ولیږل شو.",
    errorMsg: "پیغام ونه لیږل شو. مهرباني وکړئ بیا هڅه وکړئ.",
    mapBadge: "زموږ ادرس",
    subjectOptions: [
      "د سوداګرۍ ستراتیژي",
      "د پیرودونکي تجربه",
      "پایښت او ESG",
      "روزنه او پراختیا",
      "د معلوماتي ټیکنالوژۍ ملاتړ او ساتنه",
      "د بازارموندنې ستراتیژي",
    ],
  },
  fa: {
    badge: "با ما در تماس باشید",
    heading: "با خیال راحت با ما در تماس باشید یا از آدرس ما دیدن کنید.",
    description:
      "سوالی دارید یا به اطلاعات بیشتری نیاز دارید؟ به ما پیام بفرستید و تیم ما با خوشحالی به شما کمک خواهد کرد.",
    fullNamePlaceholder: "نام کامل*",
    emailPlaceholder: "آدرس ایمیل*",
    phonePlaceholder: "شماره تماس*",
    selectOptionPlaceholder: "یک گزینه را انتخاب کنید",
    selectOptionError: "لطفاً یک گزینه را انتخاب کنید.",
    messagePlaceholder: "پیام خود را اینجا بنویسید...*",
    submitBtn: "اکنون ارسال کنید",
    submittingBtn: "در حال ارسال...",
    successMsg: "پیام شما با موفقیت ارسال شد.",
    errorMsg: "ارسال پیام ناموفق بود. لطفاً دوباره تلاش کنید.",
    mapBadge: "موقعیت ما",
    subjectOptions: [
      "استراتژی کسب‌وکار",
      "تجربه مشتری",
      "پایداری و ESG",
      "آموزش و توسعه",
      "پشتیبانی و نگهداری فناوری اطلاعات",
      "استراتژی بازاریابی",
    ],
  },
};

export default function MapPage() {
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(null);
  const [subjectError, setSubjectError] = useState(false);
  const [lang, setLang] = useState("en");
  const [mapEmbedSrc, setMapEmbedSrc] = useState(DEFAULT_MAP_EMBED_SRC);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // "success" | "error" | null
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const dropdownRef = useRef(null);

  // Language sync from localStorage site-language
  useEffect(() => {
    const syncLanguage = () => {
      const storedLang = localStorage.getItem("site-language") || "en";
      setLang(storedLang);
    };

    syncLanguage();

    window.addEventListener("storage", syncLanguage);
    window.addEventListener("languageChange", syncLanguage);
    window.addEventListener("site-language-change", syncLanguage);
    window.addEventListener("focus", syncLanguage);

    return () => {
      window.removeEventListener("storage", syncLanguage);
      window.removeEventListener("languageChange", syncLanguage);
      window.removeEventListener("site-language-change", syncLanguage);
      window.removeEventListener("focus", syncLanguage);
    };
  }, []);

  // GET contact details / map config (safe fetch)
  useEffect(() => {
    let active = true;

    async function fetchContactConfig() {
      try {
        const res = await fetch("/api/contactpage/contact-details", {
          cache: "no-store",
        });

        if (!res.ok) return;

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) return;

        const data = await res.json();

        if (!active || !data?.success || !data?.data) return;

        // Optional: if your API later stores mapEmbedSrc, use it
        if (data.data.mapEmbedSrc) {
          setMapEmbedSrc(data.data.mapEmbedSrc);
        } else if (data.data.shared?.mapEmbedSrc) {
          setMapEmbedSrc(data.data.shared.mapEmbedSrc);
        }
      } catch (error) {
        console.error("Failed to load contact map config:", error);
      }
    }

    fetchContactConfig();

    return () => {
      active = false;
    };
  }, []);

  // Close dropdown outside / Escape
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSubjectOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setIsSubjectOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const currentT = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const isRtl = lang === "ps" || lang === "fa";
  const selectedSubjectText =
    selectedSubjectIndex !== null
      ? currentT.subjectOptions[selectedSubjectIndex]
      : "";

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitStatus) setSubmitStatus(null);
  };

  const handleSelectSubject = (index) => {
    setSelectedSubjectIndex(index);
    setSubjectError(false);
    setIsSubjectOpen(false);
    if (submitStatus) setSubmitStatus(null);
  };

  // POST to existing /api/contact (do not change that route)
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (selectedSubjectIndex === null) {
      setSubjectError(true);
      return;
    }

    setSubjectError(false);
    setIsSubmitting(true);
    setSubmitStatus(null);

    const subject =
      TRANSLATIONS.en.subjectOptions[selectedSubjectIndex] ||
      currentT.subjectOptions[selectedSubjectIndex];

    const payload = {
      name: formData.fullName.trim(),
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      subject,
      message: formData.message.trim(),
      language: lang,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") || "";
      let result = null;

      if (contentType.includes("application/json")) {
        result = await res.json();
      }

      if (!res.ok || result?.success === false) {
        throw new Error(result?.message || "Submit failed");
      }

      setSubmitStatus("success");
      setFormData({ fullName: "", email: "", phone: "", message: "" });
      setSelectedSubjectIndex(null);
    } catch (error) {
      console.error("Contact form submit error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="relative z-20 mb-10 w-full overflow-visible bg-[#EAEFEF] px-3 py-4 sm:mb-12 sm:px-4 sm:py-5 lg:px-6 lg:py-6"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        {/* Contact form */}
        <div
          data-wow-duration="0.9s"
          data-wow-delay="0.1s"
          data-wow-offset="70"
          className="wow animate__animated animate__fadeInLeft relative z-30 overflow-visible rounded-3xl bg-white px-5 py-8 shadow-[0_15px_50px_rgba(12,30,33,0.06)] sm:px-8 sm:py-9 md:px-10 md:py-10 lg:px-11 lg:py-11 xl:px-12 xl:py-12"
        >
          <div
            className={`pointer-events-none absolute -top-16 h-48 w-48 rounded-full bg-[#1E8A8A]/5 blur-3xl sm:h-56 sm:w-56 ${
              isRtl ? "-left-16" : "-right-16"
            }`}
          />

          <div className="relative z-10 mx-auto w-full max-w-2xl">
            <div
              data-wow-duration="0.7s"
              data-wow-delay="0.15s"
              data-wow-offset="60"
              className="wow animate__animated animate__fadeInDown inline-flex items-center gap-2 rounded-full border border-[#1E8A8A]/15 bg-[#ECF4F3] px-3 py-1.5"
            >
              <MapPin size={14} className="text-[#1E8A8A]" aria-hidden="true" />
              <span className="text-[11px] font-bold tracking-[0.14em] text-[#1E8A8A] sm:text-xs">
                {currentT.badge}
              </span>
            </div>

            <h2
              data-wow-duration="0.9s"
              data-wow-delay="0.25s"
              data-wow-offset="60"
              className="wow animate__animated animate__fadeInUp mt-4 max-w-2xl text-2xl leading-[1.12] font-semibold tracking-tight text-[#102326] sm:text-3xl md:text-[34px] lg:text-[38px]"
            >
              {currentT.heading}
            </h2>

            <p
              data-wow-duration="0.8s"
              data-wow-delay="0.35s"
              data-wow-offset="60"
              className="wow animate__animated animate__fadeInUp mt-4 max-w-xl text-sm leading-6 text-[#102326]/60 sm:text-[15px] sm:leading-7"
            >
              {currentT.description}
            </p>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="relative mt-7 sm:mt-9"
            >
              <div className="grid grid-cols-1 gap-x-7 gap-y-6 sm:grid-cols-2">
                {/* Full name */}
                <div
                  data-wow-duration="0.7s"
                  data-wow-delay="0.4s"
                  data-wow-offset="50"
                  className="wow animate__animated animate__fadeInUp"
                >
                  <label htmlFor="fullName" className="sr-only">
                    {currentT.fullNamePlaceholder}
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder={currentT.fullNamePlaceholder}
                    className="h-11 w-full border-b border-dashed border-[#0C1E21]/15 bg-transparent text-sm text-[#102326] transition-all duration-300 placeholder:text-[#102326]/40 hover:border-[#1E8A8A]/40 focus:border-[#1E8A8A] focus:outline-none sm:text-[15px]"
                  />
                </div>

                {/* Email */}
                <div
                  data-wow-duration="0.7s"
                  data-wow-delay="0.47s"
                  data-wow-offset="50"
                  className="wow animate__animated animate__fadeInUp"
                >
                  <label htmlFor="email" className="sr-only">
                    {currentT.emailPlaceholder}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={currentT.emailPlaceholder}
                    className="h-11 w-full border-b border-dashed border-[#0C1E21]/15 bg-transparent text-sm text-[#102326] transition-all duration-300 placeholder:text-[#102326]/40 hover:border-[#1E8A8A]/40 focus:border-[#1E8A8A] focus:outline-none sm:text-[15px]"
                  />
                </div>

                {/* Phone */}
                <div
                  data-wow-duration="0.7s"
                  data-wow-delay="0.54s"
                  data-wow-offset="50"
                  className="wow animate__animated animate__fadeInUp"
                >
                  <label htmlFor="phone" className="sr-only">
                    {currentT.phonePlaceholder}
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={currentT.phonePlaceholder}
                    className="h-11 w-full border-b border-dashed border-[#0C1E21]/15 bg-transparent text-sm text-[#102326] transition-all duration-300 placeholder:text-[#102326]/40 hover:border-[#1E8A8A]/40 focus:border-[#1E8A8A] focus:outline-none sm:text-[15px]"
                  />
                </div>

                {/* Subject */}
                <div
                  ref={dropdownRef}
                  data-wow-duration="0.7s"
                  data-wow-delay="0.61s"
                  data-wow-offset="50"
                  className="wow animate__animated animate__fadeInUp relative z-[100]"
                >
                  <label id="subject-label" className="sr-only">
                    {currentT.selectOptionPlaceholder}
                  </label>

                  <button
                    type="button"
                    aria-labelledby="subject-label"
                    aria-haspopup="listbox"
                    aria-expanded={isSubjectOpen}
                    onClick={() => setIsSubjectOpen((prev) => !prev)}
                    className={`flex h-11 w-full cursor-pointer items-center justify-between border-b border-dashed bg-transparent text-left text-sm transition-all duration-300 focus:outline-none sm:text-[15px] ${
                      subjectError
                        ? "border-red-400"
                        : "border-[#0C1E21]/15 hover:border-[#1E8A8A]/40 focus:border-[#1E8A8A]"
                    }`}
                  >
                    <span
                      className={
                        selectedSubjectText
                          ? "text-[#102326]"
                          : "text-[#102326]/40"
                      }
                    >
                      {selectedSubjectText || currentT.selectOptionPlaceholder}
                    </span>
                    <ChevronDown
                      size={16}
                      aria-hidden="true"
                      className={`shrink-0 text-[#102326]/60 transition-transform duration-300 ${
                        isSubjectOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isSubjectOpen && (
                    <div
                      role="listbox"
                      aria-label="Subject options"
                      className="absolute top-full left-0 z-[9999] mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-[#0C1E21]/5 bg-white py-1 shadow-[0_20px_50px_rgba(12,30,33,0.15)]"
                    >
                      {currentT.subjectOptions.map((option, idx) => (
                        <button
                          key={idx}
                          type="button"
                          role="option"
                          aria-selected={selectedSubjectIndex === idx}
                          onClick={() => handleSelectSubject(idx)}
                          className={`block min-h-10 w-full cursor-pointer px-5 py-2.5 text-left text-sm transition-colors duration-200 sm:text-[15px] ${
                            selectedSubjectIndex === idx
                              ? "bg-[#ECF4F3] font-semibold text-[#1E8A8A]"
                              : "text-[#102326] hover:bg-[#F5F7F7]"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {subjectError && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {currentT.selectOptionError}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div
                  data-wow-duration="0.7s"
                  data-wow-delay="0.68s"
                  data-wow-offset="50"
                  className="wow animate__animated animate__fadeInUp sm:col-span-2"
                >
                  <label htmlFor="message" className="sr-only">
                    {currentT.messagePlaceholder}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={3}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder={currentT.messagePlaceholder}
                    className="w-full resize-none border-b border-dashed border-[#0C1E21]/15 bg-transparent pt-1.5 text-sm leading-6 text-[#102326] transition-all duration-300 placeholder:text-[#102326]/40 hover:border-[#1E8A8A]/40 focus:border-[#1E8A8A] focus:outline-none sm:text-[15px]"
                  />
                </div>
              </div>

              {/* Inline status (no modal) */}
              {submitStatus === "success" && (
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#1E8A8A]">
                  <CheckCircle2 size={16} />
                  {currentT.successMsg}
                </div>
              )}
              {submitStatus === "error" && (
                <p className="mt-4 text-sm font-medium text-red-500">
                  {currentT.errorMsg}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                data-wow-duration="0.8s"
                data-wow-delay="0.78s"
                data-wow-offset="50"
                className={`wow animate__animated animate__fadeInUp group mt-7 flex h-12 w-full cursor-pointer items-center justify-between rounded-full bg-[#1E8A8A] py-1 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#167575] hover:shadow-[0_12px_30px_rgba(30,138,138,0.2)] disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit sm:min-w-[170px] sm:text-[15px] ${
                  isRtl ? "pr-5 pl-1 sm:pr-6" : "pr-1 pl-5 sm:pl-6"
                }`}
              >
                <span className="overflow-hidden leading-none">
                  <span className="flex items-center gap-2 transition-transform duration-300 [text-shadow:0_30px_0_currentColor] group-hover:-translate-y-7.5">
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {currentT.submittingBtn}
                      </>
                    ) : (
                      currentT.submitBtn
                    )}
                  </span>
                </span>

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0C1E21]">
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ArrowUpRight
                      size={16}
                      aria-hidden="true"
                      className={`transition-transform duration-300 group-hover:rotate-45 sm:size-[18px] ${
                        isRtl
                          ? "group-hover:-translate-x-0.5"
                          : "group-hover:translate-x-0.5"
                      }`}
                    />
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Map */}
        <div
          data-wow-duration="0.9s"
          data-wow-delay="0.2s"
          data-wow-offset="70"
          className="wow animate__animated animate__fadeInRight relative z-10 min-h-[340px] overflow-hidden rounded-3xl bg-[#DCE6E6] shadow-[0_15px_50px_rgba(12,30,33,0.06)] sm:min-h-[400px] md:min-h-[460px] lg:min-h-full"
        >
          <iframe
            src={mapEmbedSrc}
            title="Bexon Location"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />

          <div
            data-wow-duration="0.7s"
            data-wow-delay="0.5s"
            data-wow-offset="50"
            className={`wow animate__animated animate__fadeInDown absolute top-4 z-10 flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-md sm:top-5 sm:px-3.5 ${
              isRtl ? "right-4 sm:right-5" : "left-4 sm:left-5"
            }`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1E8A8A] text-white">
              <MapPin size={13} />
            </span>
            <span className="text-[10px] font-bold tracking-wide text-[#102326] sm:text-xs">
              {currentT.mapBadge}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
