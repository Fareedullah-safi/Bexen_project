export default {
  type: "slider",
  name: "Hero Slider",
  icon: "🖼️",
  description: "Full-width image slider with captions and buttons.",
  defaultData: {
    slides: [
      {
        id: "slide_1",
        image: { url: "", publicId: "" },
        buttonLink: "/contact",
        translations: {
          en: {
            title: "Welcome to Our Platform",
            subtitle: "Innovating the future",
            buttonText: "Get Started",
          },
          ps: {
            title: "زموږ پلیټ فارم ته ښه راغلاست",
            subtitle: "د راتلونکي نوښت",
            buttonText: "پیل کړئ",
          },
          fa: {
            title: "به پلتفرم ما خوش آمدید",
            subtitle: "نوآوری در آینده",
            buttonText: "شروع کنید",
          },
        },
      },
    ],
  },
};
