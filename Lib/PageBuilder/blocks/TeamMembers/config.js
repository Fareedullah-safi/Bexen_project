const teamMembersConfig = {
  label: "Team Members",
  name: "Team Members",
  description: "Showcase your team with photos, roles and bios.",
  type: "TeamMembers",
  icon: "🚹",

  defaultData: {
    translations: {
      en: {
        sectionTitle: "Meet Our Team",
        sectionSubtitle: "The people behind our success",
      },
      ps: {
        sectionTitle: "زموږ ټیم وپیژنئ",
        sectionSubtitle: "هغه خلک چې زموږ د بریا تر شا دي",
      },
      fa: {
        sectionTitle: "با تیم ما آشنا شوید",
        sectionSubtitle: "افرادی که پشت موفقیت ما هستند",
      },
    },
    members: [
      {
        image: { url: "", publicId: "" },
        order: 1,
        translations: {
          en: {
            name: "John Doe",
            position: "CEO & Founder",
            description:
              "<p>Leading the vision with <strong>15 years</strong> of industry experience.</p>",
          },
          ps: {
            name: "جان ډو",
            position: "اجرایوي رییس او بنسټګر",
            description:
              "<p>د <strong>۱۵ کلونو</strong> د صنعت تجربې سره د لید رهبري.</p>",
          },
          fa: {
            name: "جان دو",
            position: "مدیرعامل و بنیان‌گذار",
            description:
              "<p>رهبری چشم‌انداز با <strong>۱۵ سال</strong> تجربه در صنعت.</p>",
          },
        },
      },
    ],
  },
};

export default teamMembersConfig;
