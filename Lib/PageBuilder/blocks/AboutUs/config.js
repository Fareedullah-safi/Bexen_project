// blocks/about-us.config.js
export default {
  name: "About Us",
  description:
    "Full about section with experience badge, title, description, YouTube video, main image, and client info.",
  icon: "👥",
  defaultData: {
    mainImage: { url: "", publicId: "" },
    thumbnailImage: { url: "", publicId: "" },
    buttonLink: "/about",
    videoLink: "",
    translations: {
      en: {
        experienceNumber: "13+",
        experienceLabel: "Years of Experience",
        experienceText: "Decades of Experience, Endless Innovation",
        sectionLabel: "Get to Know Us",
        title: "",
        description: "",
        buttonText: "Learn More",
        clientName: "",
        clientRole: "",
      },
      ps: {
        experienceNumber: "",
        experienceLabel: "",
        experienceText: "",
        sectionLabel: "",
        title: "",
        description: "",
        buttonText: "",
        clientName: "",
        clientRole: "",
      },
      fa: {
        experienceNumber: "",
        experienceLabel: "",
        experienceText: "",
        sectionLabel: "",
        title: "",
        description: "",
        buttonText: "",
        clientName: "",
        clientRole: "",
      },
    },
  },
};
