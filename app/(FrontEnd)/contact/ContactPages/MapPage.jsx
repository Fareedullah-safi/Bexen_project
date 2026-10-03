"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, MapPin } from "lucide-react";

const SUBJECT_OPTIONS = [
  "Business Strategy",
  "Customer Experience",
  "Sustainability and ESG",
  "Training and Development",
  "IT Support & Maintenance",
  "Marketing Strategy",
];

const MAP_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d316440.5712687838!2d-74.01091796224334!3d40.67186885683901!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sbd!4v1745918398047!5m2!1sen!2sbd";

export default function MapPage() {
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjectError, setSubjectError] = useState(false);

  const dropdownRef = useRef(null);

  // Initialize WOW.js
  useEffect(() => {
    let wowInstance;

    (async () => {
      const { WOW } = await import("wowjs");

      wowInstance = new WOW({
        boxClass: "wow",
        animateClass: "animate__animated",
        offset: 60,
        mobile: true,
        live: true,
      });

      wowInstance.init();
    })();

    return () => {
      wowInstance?.sync?.();
    };
  }, []);

  // Close dropdown outside and with Escape
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsSubjectOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsSubjectOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Select subject
  const handleSelectSubject = (option) => {
    setSelectedSubject(option);
    setSubjectError(false);
    setIsSubjectOpen(false);
  };

  // Submit form
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedSubject) {
      setSubjectError(true);
      return;
    }

    setSubjectError(false);

    // Add your API request here
  };

  return (
    <section className="relative z-20 mb-10 w-full overflow-visible bg-[#EAEFEF] px-3 py-4 sm:mb-12 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">

        {/* Contact form */}
        <div
          data-wow-duration="0.9s"
          data-wow-delay="0.1s"
          data-wow-offset="70"
          className="wow animate__animated animate__fadeInLeft relative z-30 overflow-visible rounded-3xl bg-white px-5 py-8 shadow-[0_15px_50px_rgba(12,30,33,0.06)] sm:px-8 sm:py-9 md:px-10 md:py-10 lg:px-11 lg:py-11 xl:px-12 xl:py-12"
        >
          {/* Soft decoration */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#1E8A8A]/5 blur-3xl sm:h-56 sm:w-56" />

          <div className="relative z-10 mx-auto w-full max-w-2xl">

            {/* Badge */}
            <div
              data-wow-duration="0.7s"
              data-wow-delay="0.15s"
              data-wow-offset="60"
              className="wow animate__animated animate__fadeInDown inline-flex items-center gap-2 rounded-full border border-[#1E8A8A]/15 bg-[#ECF4F3] px-3 py-1.5"
            >
              <MapPin
                size={14}
                className="text-[#1E8A8A]"
                aria-hidden="true"
              />

              <span className="text-[11px] font-bold tracking-[0.14em] text-[#1E8A8A] sm:text-xs">
                GET IN TOUCH
              </span>
            </div>

            {/* Heading */}
            <h2
              data-wow-duration="0.9s"
              data-wow-delay="0.25s"
              data-wow-offset="60"
              className="wow animate__animated animate__fadeInUp mt-4 max-w-2xl text-2xl leading-[1.12] font-semibold tracking-tight text-[#102326] sm:text-3xl md:text-[34px] lg:text-[38px]"
            >
              Feel Free to Get in Touch or Visit our Location.
            </h2>

            {/* Description */}
            <p
              data-wow-duration="0.8s"
              data-wow-delay="0.35s"
              data-wow-offset="60"
              className="wow animate__animated animate__fadeInUp mt-4 max-w-xl text-sm leading-6 text-[#102326]/60 sm:text-[15px] sm:leading-7"
            >
              Have a question or need more information? Send us a message and
              our team will be happy to help you.
            </p>

            {/* Form */}
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
                    Full Name
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Full Name*"
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
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Email Address*"
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
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="Phone Number*"
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
                  <label
                    id="subject-label"
                    className="sr-only"
                  >
                    Choose an option
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
                        selectedSubject
                          ? "text-[#102326]"
                          : "text-[#102326]/40"
                      }
                    >
                      {selectedSubject || "Choose an option"}
                    </span>

                    <ChevronDown
                      size={16}
                      aria-hidden="true"
                      className={`shrink-0 text-[#102326]/60 transition-transform duration-300 ${
                        isSubjectOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown */}
                  {isSubjectOpen && (
                    <div
                      role="listbox"
                      aria-label="Subject options"
                      className="absolute top-full left-0 z-[9999] mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-[#0C1E21]/5 bg-white py-1 shadow-[0_20px_50px_rgba(12,30,33,0.15)]"
                    >
                      {SUBJECT_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          role="option"
                          aria-selected={selectedSubject === option}
                          onClick={() => handleSelectSubject(option)}
                          className={`block min-h-10 w-full cursor-pointer px-5 py-2.5 text-left text-sm transition-colors duration-200 sm:text-[15px] ${
                            selectedSubject === option
                              ? "bg-[#ECF4F3] font-semibold text-[#1E8A8A]"
                              : "text-[#102326] hover:bg-[#F5F7F7]"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Error */}
                  {subjectError && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      Please choose an option.
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
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={3}
                    placeholder="Message here...*"
                    className="w-full resize-none border-b border-dashed border-[#0C1E21]/15 bg-transparent pt-1.5 text-sm leading-6 text-[#102326] transition-all duration-300 placeholder:text-[#102326]/40 hover:border-[#1E8A8A]/40 focus:border-[#1E8A8A] focus:outline-none sm:text-[15px]"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                data-wow-duration="0.8s"
                data-wow-delay="0.78s"
                data-wow-offset="50"
                className="wow animate__animated animate__fadeInUp group mt-7 flex h-12 w-full cursor-pointer items-center justify-between rounded-full bg-[#1E8A8A] py-1 pr-1 pl-5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#167575] hover:shadow-[0_12px_30px_rgba(30,138,138,0.2)] sm:w-fit sm:min-w-[170px] sm:pl-6 sm:text-[15px]"
              >
                <span className="overflow-hidden leading-none">
                  <span className="block transition-transform duration-300 [text-shadow:0_30px_0_currentColor] group-hover:-translate-y-7.5">
                    Submit Now
                  </span>
                </span>

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0C1E21]">
                  <ArrowUpRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:rotate-45 sm:size-[18px]"
                  />
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
            src={MAP_EMBED_SRC}
            title="Bexon Location"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />

          {/* Map label */}
          <div
            data-wow-duration="0.7s"
            data-wow-delay="0.5s"
            data-wow-offset="50"
            className="wow animate__animated animate__fadeInDown absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-md sm:top-5 sm:left-5 sm:px-3.5"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1E8A8A] text-white">
              <MapPin size={13} />
            </span>

            <span className="text-[10px] font-bold tracking-wide text-[#102326] sm:text-xs">
              OUR LOCATION
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}