"use client";

import { ArrowRight, Box } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";

const defaultProjects = [
  {
    tag: "Connect",
    title: "Event Management Platform",
    image:
      "https://themejunction.net/html/bexon/demo/assets/images/project/project-1.webp",
  },
  {
    tag: "Empower",
    title: "Digital Marketing Campaign",
    image:
      "https://themejunction.net/html/bexon/demo/assets/images/project/project-2.webp",
  },
  {
    tag: "Support",
    title: "Interactive Learning Platform",
    image:
      "https://themejunction.net/html/bexon/demo/assets/images/project/project-3.webp",
  },
  {
    tag: "Business",
    title: "Environmental Impact Dashboard",
    image:
      "https://themejunction.net/html/bexon/demo/assets/images/project/project-4.webp",
  },
];

export default function SectionSix() {
  const [headerData, setHeaderData] = useState({
    badgeText: "PROUD PROJECTS",
    headingLine: "Breaking Boundaries,",
    headingText: "Building",
    highlightWord: "Dreams.",
    description:
      "We work closely with our clients to understand their unique needs and craft tailored solutions that address challenges.",
    buttonText: "More Projects",
    buttonLink: "/projects",
  });

  const [projects, setProjects] = useState(defaultProjects);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [headerRes, projectsRes] = await Promise.all([
          axios.get("/api/homepage/projects/header").catch(() => null),
          axios.get("/api/homepage/projects/large").catch(() => null),
        ]);

        if (headerRes?.data) {
          const header =
            headerRes.data.header || headerRes.data.data || headerRes.data;

          setHeaderData((prev) => ({ ...prev, ...header }));
        }

        if (projectsRes?.data) {
          const savedProjects = projectsRes.data.projects;

          if (Array.isArray(savedProjects)) {
            setProjects(
              savedProjects.map((project) => ({
                ...project,
                image: project.image || project.imageUrl || project.url || "",
                tag: project.tag || "",
                title: project.title || "",
              })),
            );
          }
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
      }
    };

    loadData();
  }, []);

  const renderProject = (project, index) => {
    const patternIndex = index % 4;
    const isLarge = patternIndex === 0 || patternIndex === 3;
    const isFirstRow = index < 2;

    return (
      <div
        key={project._id || project.publicId || index}
        data-wow-duration="0.9s"
        data-wow-delay={index % 2 === 0 ? "0.1s" : "0.25s"}
        className={`wow animate__animated animate__fadeInUp group relative ${
          isFirstRow ? "h-120" : "h-115"
        } w-full overflow-hidden rounded-2xl ${
          isLarge ? "lg:flex-[1.7]" : "lg:flex-1"
        }`}
      >
        {project.image && (
          <Image
            src={project.image}
            alt={project.title || "Project"}
            width={999}
            height={666}
            unoptimized
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}

        <button
          type="button"
          className="absolute bottom-20 left-5 cursor-pointer rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md transition-all duration-300 hover:bg-[#1E8A8A]"
        >
          {project.tag}
        </button>

        <div
          className={`absolute ${
            isLarge ? "bottom-4" : "bottom-5"
          } right-5 left-5 flex items-center justify-between`}
        >
          <button
            type="button"
            className={`text-left ${
              isLarge ? "text-2xl" : "text-xl"
            } font-semibold text-white`}
          >
            {project.title}
          </button>

          <button
            type="button"
            aria-label={`View ${project.title || "project"}`}
            className={`group/arrow flex ${
              isLarge ? "h-15 w-15" : "h-13 w-13"
            } cursor-pointer items-center justify-center rounded-full bg-white/10 text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-[#167575]`}
          >
            <ArrowRight
              size={isLarge ? 24 : 22}
              className="rotate-320 transition-transform duration-500 group-hover/arrow:rotate-360"
            />
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full bg-[#ECF0F0] px-6 py-16">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-15">
        {/* Badge */}
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

        {/* Heading + Content */}
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <h1
            data-wow-duration="0.9s"
            data-wow-delay="0.1s"
            className="wow animate__animated animate__fadeInLeft text-3xl font-medium text-[#102326] sm:text-4xl md:text-5xl lg:text-[48px]"
          >
            {headerData.headingLine}
            <br />
            {headerData.headingText}
            <span className="text-[#1E8A8A]"> {headerData.highlightWord}</span>
          </h1>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p
              data-wow-duration="0.9s"
              data-wow-delay="0.2s"
              className="wow animate__animated animate__fadeInRight max-w-xl flex-1 text-sm leading-6 text-zinc-600 sm:text-base md:text-lg"
            >
              {headerData.description}
            </p>

            <button
              type="button"
              onClick={() => {
                window.location.href = headerData.buttonLink || "/projects";
              }}
              data-wow-duration="0.8s"
              data-wow-delay="0.35s"
              className="wow animate__animated animate__fadeInRight group/button flex h-14 w-48 shrink-0 cursor-pointer items-center justify-between gap-1 overflow-hidden rounded-full bg-[#1E8A8A] py-1 pr-1 pl-5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#167575]"
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
          </div>
        </div>

        {/* Divider */}
        <div
          data-wow-duration="0.8s"
          data-wow-delay="0.4s"
          className="wow animate__animated animate__fadeIn mt-10 h-px w-full bg-[#102326]/10"
        />
      </div>

      {/* Unlimited Projects */}
      {Array.from({ length: Math.ceil(projects.length / 2) }, (_, rowIndex) => (
        <div
          key={rowIndex}
          className={`w-full px-0 sm:px-6 lg:px-14 ${
            rowIndex === 0 ? "mt-10" : "pt-5"
          }`}
        >
          <div className="flex w-full flex-col gap-6 lg:flex-row">
            {projects
              .slice(rowIndex * 2, rowIndex * 2 + 2)
              .map((project, index) =>
                renderProject(project, rowIndex * 2 + index),
              )}
          </div>
        </div>
      ))}
    </section>
  );
}
