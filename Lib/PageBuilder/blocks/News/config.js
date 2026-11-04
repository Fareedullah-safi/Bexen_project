const newsConfig = {
  label: "News",
  name: "News",
  description: "Showcase news articles with images, dates and descriptions.",
  type: "News",
  icon: "📰",
  defaultData: {
    translations: {
      en: {
        sectionTitle: "Latest News",
        sectionSubtitle: "Stay updated with our most recent announcements",
      },
      ps: {
        sectionTitle: "وروستي خبرونه",
        sectionSubtitle: "زموږ د وروستیو اعلانونو سره تازه پاتې شئ",
      },
      fa: {
        sectionTitle: "آخرین اخبار",
        sectionSubtitle: "با جدیدترین اطلاعیه‌های ما به‌روز بمانید",
      },
    },
    items: [
      {
        image: { url: "", publicId: "" },
        date: "",
        order: 1,
        translations: {
          en: {
            title: "Big product launch coming soon",
            subtitle: "A quick look at what we've been working on",
            description:
              "<p>We are excited to share the news about our upcoming launch.</p>",
          },
          ps: {
            title: "لوی محصول ډیر ژر راځي",
            subtitle: "یوه چټکه کتنه چې موږ پرې کار کوو",
            description:
              "<p>موږ خوښ یو چې زموږ د راتلونکي لانچ خبر شریک کړو.</p>",
          },
          fa: {
            title: "به‌زودی، معرفی محصول بزرگ",
            subtitle: "نگاهی سریع به آنچه روی آن کار کرده‌ایم",
            description:
              "<p>مشتاقیم که خبر معرفی محصول آینده را با شما به اشتراک بگذاریم.</p>",
          },
        },
      },
    ],
  },
};

export default newsConfig;
