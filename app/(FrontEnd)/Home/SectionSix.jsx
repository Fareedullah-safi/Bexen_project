"use client";

import { ArrowRight, Box } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";

export default function SectionSix() {
  const [headerData, setHeaderData] = useState({
    badgeText: "",
    headingLine: "",
    headingText: "",
    highlightWord: "",
    description: "",
    buttonText: "",
    buttonLink: "",
  });

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [headerRes, projectsRes] = await Promise.all([
          axios.get("/api/homepage/projects/header").catch(() => null),
          axios.get("/api/homepage/projects").catch(() => null),
        ]);

        if (headerRes?.data) {
          const header =
            headerRes.data.header || headerRes.data.data || headerRes.data;

          setHeaderData({
            badgeText: header.badgeText || "",
            headingLine: header.headingLine || "",
            headingText: header.headingText || "",
            highlightWord: header.highlightWord || "",
            description: header.description || "",
            buttonText: header.buttonText || "",
            buttonLink: header.buttonLink || "",
          });
        }

        if (projectsRes?.data) {
          const savedProjects = projectsRes.data.projects;

          if (Array.isArray(savedProjects)) {
            setProjects(
              savedProjects
                .map((project) => ({
                  ...project,
                  image: project.image || project.imageUrl || project.url || "",
                  tag: project.tag || "",
                  title: project.title || "",
                }))
                .filter((project) => project.image && project.title),
            );
          } else {
            setProjects([]);
          }
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
      }
    };

    loadData();
  }, []);

  const handleButtonClick = () => {
    if (headerData.buttonLink) {
      window.location.href = headerData.buttonLink;
    }
  };

  const renderProject = (project, index) => {
    const patternIndex = index % 4;
    const isLarge = patternIndex === 0 || patternIndex === 3;

    return (
      <div
        key={project._id || project.publicId || index}
        data-wow-duration="0.9s"
        data-wow-delay={index % 2 === 0 ? "0.1s" : "0.25s"}
        className={`wow animate__animated animate__fadeInUp group relative w-full overflow-hidden rounded-2xl ${
          isLarge ? "lg:flex-[1.7]" : "lg:flex-1"
        } h-[280px] sm:h-[340px] md:h-[400px] lg:h-[440px] xl:h-[460px]`}
      >
        {/* Optimized Project Image */}
        {project.image && (
          <Image
            src={project.image}
            alt={project.title || "Project"}
            fill
            sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(100vw - 48px), (max-width: 1400px) 50vw, 650px"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

        {/* Project Tag */}
        {project.tag && (
          <button
            type="button"
            className="absolute top-4 left-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur-md transition-all duration-300 hover:bg-[#1E8A8A] sm:px-4 sm:py-2 sm:text-sm"
          >
            {project.tag}
          </button>
        )}

        {/* Project Content */}
        <div className="absolute right-4 bottom-4 left-4 z-10 flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              className={`line-clamp-2 text-left font-semibold break-words text-white ${
                isLarge
                  ? "text-lg sm:text-xl md:text-2xl"
                  : "text-base sm:text-lg md:text-xl"
              }`}
            >
              {project.title}
            </button>
          </div>

          <button
            type="button"
            aria-label={`View ${project.title || "project"}`}
            className={`group/arrow flex shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:bg-[#167575] ${
              isLarge
                ? "h-11 w-11 sm:h-12 sm:w-12 md:h-14 md:w-14"
                : "h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12"
            } opacity-100 sm:opacity-0 sm:group-hover:opacity-100`}
          >
            <ArrowRight
              size={isLarge ? 24 : 22}
              className="-rotate-45 transition-transform duration-300 group-hover/arrow:rotate-0"
            />
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full bg-[#ECF0F0] px-4 py-12 sm:px-6 sm:py-14 lg:px-6 lg:py-16">
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="px-2 sm:px-4 lg:px-8">
          {/* Badge */}
          {headerData.badgeText && (
            <span
              data-wow-duration="0.8s"
              className="wow animate__animated animate__fadeInDown group inline-flex items-center gap-2 border border-cyan-100 bg-[#ECF0F0] px-4 py-2"
            >
              <Box
                size={18}
                className="text-[#1E8A8A] transition-transform duration-500 group-hover:rotate-180"
              />

              <span className="text-sm font-bold text-zinc-950">
                {headerData.badgeText}
              </span>
            </span>
          )}

          {/* Heading and Description */}
          {(headerData.headingLine ||
            headerData.headingText ||
            headerData.highlightWord ||
            headerData.description ||
            headerData.buttonText) && (
            <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:gap-10">
              {(headerData.headingLine ||
                headerData.headingText ||
                headerData.highlightWord) && (
                <h1
                  data-wow-duration="0.9s"
                  data-wow-delay="0.1s"
                  className="wow animate__animated animate__fadeInLeft text-3xl leading-tight font-medium text-[#102326] sm:text-4xl md:text-5xl lg:text-[48px]"
                >
                  {headerData.headingLine}
                  {headerData.headingText}
                  {/* {headerData.headingText}{" "} */}
                  <span className="text-[#1E8A8A]">
                    {" " + headerData.highlightWord}
                  </span>
                </h1>
              )}

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                {headerData.description && (
                  <p
                    data-wow-duration="0.9s"
                    data-wow-delay="0.2s"
                    className="wow animate__animated animate__fadeInRight max-w-xl flex-1 text-sm leading-6 text-zinc-600 sm:text-base md:text-lg"
                  >
                    {headerData.description}
                  </p>
                )}

                {headerData.buttonText && headerData.buttonLink && (
                  <button
                    type="button"
                    onClick={handleButtonClick}
                    data-wow-duration="0.8s"
                    data-wow-delay="0.35s"
                    className="wow animate__animated animate__fadeInRight group/button flex h-14 w-full max-w-[220px] shrink-0 cursor-pointer items-center justify-between gap-1 overflow-hidden rounded-full bg-[#1E8A8A] py-1 pr-1 pl-5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#167575] sm:w-48"
                  >
                    <span className="overflow-hidden leading-none">
                      <span className="block transition-transform duration-400 [text-shadow:0_30px_0_currentColor] group-hover/button:-translate-y-7.5">
                        {headerData.buttonText}
                      </span>
                    </span>

                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0C1E21]">
                      <ArrowRight
                        size={18}
                        className="-rotate-45 transition-transform duration-300 group-hover/button:rotate-0"
                      />
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div
            data-wow-duration="0.8s"
            data-wow-delay="0.4s"
            className="wow animate__animated animate__fadeIn mt-10 h-px w-full bg-[#102326]/10"
          />
        </div>

        {/* Projects */}
        {Array.from(
          { length: Math.ceil(projects.length / 2) },
          (_, rowIndex) => (
            <div
              key={rowIndex}
              className={`${rowIndex === 0 ? "mt-10" : "pt-5"} w-full px-0 sm:px-4 lg:px-8`}
            >
              <div className="flex w-full flex-col gap-6 lg:flex-row">
                {projects
                  .slice(rowIndex * 2, rowIndex * 2 + 2)
                  .map((project, index) =>
                    renderProject(project, rowIndex * 2 + index),
                  )}
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}
