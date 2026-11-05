// Lib/PageBuilder/blocks/Albums/albums.config.js

export default {
  name: "Photo Albums",
  description:
    "Page heading with subtitle and photo albums, each with a cover and a photo gallery.",
  icon: "🖼️",
  defaultData: {
    translations: {
      en: {
        title: "Photo Albums",
        subtitle: "Select an album to explore photo collections.",
      },
      ps: {
        title: "د انځورونو البومونه",
        subtitle: "د انځورونو د لیدلو لپاره یو البوم وټاکئ.",
      },
      fa: {
        title: "آلبوم‌های عکس",
        subtitle: "برای مشاهده تصاویر، یک آلبوم را انتخاب کنید.",
      },
    },
    albums: [],
  },
};
