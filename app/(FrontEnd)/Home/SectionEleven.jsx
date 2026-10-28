"use client";

import { ArrowRight, Box } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const API = "/api/homepage/articles-section";

const getText = (value, language = "en") => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[language] || value.en || value.fa || value.ps || "";
  }

  return "";
};

const getArticleTranslation = (blog, language) => {
  const translation = blog?.translations?.[language];

  // Support both the multilingual schema and older flat article data.
  if (translation && typeof translation === "object") {
    return {
      day: getText(translation.day) || getText(blog.day) || "01",
      month: getText(translation.month) || getText(blog.month) || "JAN",
      category: getText(translation.category) || getText(blog.category),
      author: getText(translation.author) || getText(blog.author) || "Admin",
      title: getText(translation.title) || getText(blog.title),
    };
  }

  return {
    day: getText(blog?.day) || "01",
    month: getText(blog?.month) || "JAN",
    category: getText(blog?.category),
    author: getText(blog?.author) || "Admin",
    title: getText(blog?.title),
  };
};

const getSectionHeading = (titles, language) => {
  // New multilingual API shape: Titles.en, Titles.fa, Titles.ps
  if (titles?.[language] && typeof titles[language] === "object") {
    const selected = titles[language];
    const english = titles.en || {};

    return {
      sectionTitle:
        getText(selected.sectionTitle) ||
        getText(english.sectionTitle) ||
        "The Ultimate",
      highlightedTitle:
        getText(selected.highlightedTitle) ||
        getText(english.highlightedTitle) ||
        "Resource.",
    };
  }

  // Support the legacy flat API shape.
  return {
    sectionTitle: getText(titles?.sectionTitle) || "The Ultimate",
    highlightedTitle: getText(titles?.highlightedTitle) || "Resource.",
  };
};

export default function SectionEleven() {
  const [blogs, setBlogs] = useState([]);
  const [titles, setTitles] = useState({});
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const updateLanguage = (event) => {
      let storedLanguage = "en";

      try {
        storedLanguage = localStorage.getItem("site-language") || "en";
      } catch {
        // Continue with English if localStorage is unavailable.
      }

      const nextLanguage = event?.detail?.language || storedLanguage;

      setLanguage(
        ["en", "fa", "ps"].includes(nextLanguage) ? nextLanguage : "en",
      );
    };

    updateLanguage();
    window.addEventListener("site-language-change", updateLanguage);

    return () => {
      window.removeEventListener("site-language-change", updateLanguage);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBlogs() {
      try {
        const response = await fetch(API, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            result?.message ||
              `Articles API request failed (${response.status}).`,
          );
        }

        if (!result?.success || !result?.data) {
          throw new Error(result?.message || "Invalid articles API response.");
        }

        const section = result.data;
        const posts = Array.isArray(section.posts) ? section.posts : [];

        setBlogs(
          posts.filter(
            (blog) =>
              blog &&
              typeof blog.image === "string" &&
              blog.image.trim() &&
              typeof blog.link === "string" &&
              blog.link.trim() &&
              (blog.translations?.en?.title ||
                blog.translations?.fa?.title ||
                blog.translations?.ps?.title ||
                blog.title),
          ),
        );

        setTitles(
          section.Titles || {
            sectionTitle: section.sectionTitle,
            highlightedTitle: section.highlightedTitle,
          },
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to load blog section:", error);
          setBlogs([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadBlogs();

    return () => {
      controller.abort();
    };
  }, []);

  const heading = getSectionHeading(titles, language);

  return (
    <section
      dir={language === "en" ? "ltr" : "rtl"}
      className="w-full bg-[#ECF0F0] px-4 py-16 sm:px-6 md:px-8 lg:px-12"
    >
      <div className="w-full">
        <span className="wow animate__animated animate__fadeInDown mx-auto flex w-fit items-center gap-2 rounded-md border border-[#1E8A8A]/20 bg-white/40 px-4 py-2 text-xs font-bold tracking-wide text-[#102326]">
          <Box size={17} className="text-[#1E8A8A]" />
          {language === "en"
            ? "INSIGHT & IDEAS"
            : language === "fa"
              ? "دیدگاه‌ها و ایده‌ها"
              : "لیدلوري او نظریې"}
        </span>

        <h1 className="wow animate__animated animate__fadeInUp mt-4 text-center text-3xl leading-tight font-medium text-[#102326] sm:text-4xl md:text-5xl lg:text-6xl">
          {heading.sectionTitle}{" "}
          <span className="text-[#1E8A8A]">{heading.highlightedTitle}</span>
        </h1>

        {loading ? (
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[430px] animate-pulse rounded-2xl bg-white/70"
              />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <p className="mt-12 text-center text-[#102326]/70">
            {language === "en"
              ? "No articles available at the moment."
              : language === "fa"
                ? "در حال حاضر مقاله‌ای موجود نیست."
                : "اوس مهال کومې مقالې نشته."}
          </p>
        ) : (
          <div className="mt-10 grid w-full gap-5 sm:mt-12 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-3">
            {blogs.map((blog, index) => {
              const article = getArticleTranslation(blog, language);
              const { title, category, author, day, month } = article;

              const link = getText(blog.link) || "/";

              return (
                <div
                  key={blog._id || index}
                  data-wow-delay={`${index * 0.15}s`}
                  className="wow animate__animated animate__fadeInUp overflow-hidden rounded-2xl bg-white"
                >
                  {/* Image */}
                  <div className="relative h-56 w-full overflow-hidden sm:h-64 md:h-72">
                    <Image
                      src={blog.image}
                      alt={title}
                      fill
                      sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                      className="object-cover transition duration-700 hover:scale-105"
                    />

                    <div className="absolute top-4 left-4 z-10 flex h-20 w-20 items-center justify-center rounded-lg border border-black/10 bg-black/10 px-4 py-3 shadow-lg backdrop-blur-md">
                      <span className="text-sm leading-tight font-semibold text-white">
                        <span className="text-2xl">{day}</span>
                        <br />
                        {month}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-5 py-6 sm:px-6 sm:py-7">
                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="rounded-md border border-zinc-300 px-3 py-1 text-base font-medium text-[#102326] sm:text-lg">
                        {category || "Business"}
                      </span>

                      <span className="text-base text-zinc-500 sm:text-lg">
                        {language === "en"
                          ? "By"
                          : language === "fa"
                            ? "نویسنده:"
                            : "لیکوال:"}
                      </span>

                      <span className="text-base text-[#102326] sm:text-lg">
                        {author}
                      </span>
                    </div>

                    {/* Title */}
                    <a
                      href={link}
                      className="group/title mt-6 block"
                      aria-label={`Read ${title}`}
                    >
                      <span className="inline cursor-pointer [background-image:linear-gradient(#102326,#102326)] [box-decoration-break:clone] [background-size:0%_2px] [background-position:0_100%] [background-repeat:no-repeat] text-2xl leading-8 font-semibold text-[#102326] transition-[background-size] duration-700 ease-out [-webkit-box-decoration-break:clone] group-hover/title:[background-size:100%_2px] sm:text-2xl md:text-[23.3px]">
                        {title}
                      </span>
                    </a>

                    {/* Read More */}
                    <a
                      href={link}
                      className="group/read mt-7 inline-flex w-full max-w-44 items-center justify-between gap-2 overflow-hidden rounded-full bg-white py-1 pr-1 pl-4 text-sm font-semibold text-[#0C1E21] transition-all duration-300 hover:shadow-md sm:text-base"
                    >
                      <span className="overflow-hidden leading-none">
                        <span className="block transition-transform duration-300 ease-in-out [text-shadow:0_30px_0_currentColor] group-hover/read:-translate-y-7.5">
                          {language === "en"
                            ? "Read More"
                            : language === "fa"
                              ? "بیشتر بخوانید"
                              : "نور ولولئ"}
                        </span>
                      </span>

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0C1E21] transition-colors group-hover/read:bg-[#1E8A8A] sm:h-10 sm:w-10">
                        <ArrowRight
                          size={18}
                          className="-rotate-45 text-white transition-transform duration-300 ease-in-out group-hover/read:rotate-0 sm:size-5"
                        />
                      </span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
