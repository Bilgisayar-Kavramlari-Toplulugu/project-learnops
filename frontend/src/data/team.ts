// src/data/team.ts

export type TeamMember = {
  slug: string;
  name: string;
  tagline?: string;
  links?: {
    website?: string;
    github?: string;
    linkedin?: string;
  };
};

// Helper'lar
const gh = (handle: string) => `https://github.com/${handle}`;
const li = (handle: string) => `https://linkedin.com/in/${handle}`;

export const teamMembers: TeamMember[] = [
  {
    slug: "flovearth",
    name: "Feyz Sarı",
    tagline: "Cloud/DevOps Engineer",
    links: {
      github: gh("flovearth"),
      linkedin: li("feyzsari"),
    },
  },
  {
    slug: "lerkush",
    name: "Lütfiye Erkuş",
    tagline: "Fullstack Dev",
    links: {
      github: gh("lerkush"),
      linkedin: li("lerkush"),
    },
  },
  {
    slug: "karalarmehmet",
    name: "Mehmet Karalar",
    tagline: "Fullstack Dev",
    links: {
      github: gh("karalarmehmet"),
      linkedin: li("karalar-mehmet"),
    },
  },
  {
    slug: "slymanmrcan",
    name: "Süleyman Mercan",
    tagline: "DevOps & Fullstack Dev",
    links: {
      github: gh("slymanmrcan"),
      linkedin: li("slymanmrcan"),
      website: "https://suleymanmercan.is-a.dev/",
    },
  },
  {
    slug: "shamsiaa",
    name: "Shamsiaa Rahimi",
    tagline: "DevOps & Fullstack Dev",
    links: {
      github: gh("shamsiaa"),
      linkedin: li("shamsia-r-5b6919240"),
    },
  },
  {
    slug: "belmuh",
    name: "Belma Ünsal",
    tagline: "Fullstack Dev",
    links: {
      github: gh("belmuh"),
      linkedin: li("belmaunsal"),
    },
  },
  {
    slug: "muhammedcagrikurt",
    name: "Muhammed Çağrı Kurt",
    tagline: "Fullstack Dev",
    links: {
      github: gh("muhammedcagrikurt"),
      linkedin: li("muhammedcagrikurt"),
    },
  },
  {
    slug: "replakcan",
    name: "Alper Mutlu Akcan",
    tagline: "Fullstack Dev",
    links: {
      github: gh("replakcan"),
      linkedin: li("alpermutluakcan"),
    },
  },
  {
    slug: "ismailaricioglu",
    name: "İsmail Arıcıoğlu",
    tagline: "Fullstack Dev",
    links: {
      github: gh("ismailaricioglu"),
      linkedin: li("ismailaricioglu"),
    },
  },
  {
    slug: "svenes25",
    name: "Enes Eren Seven",
    tagline: "Fullstack Dev",
    links: {
      github: gh("svenes25"),
      linkedin: li("enes-eren-seven"),
    },
  },
  {
    slug: "anenthusiastic",
    name: "Fatih Gürkan",
    tagline: "Fullstack Dev",
    links: {
      github: gh("anenthusiastic"),
      linkedin: li("fatihgurkan"),
    },
  },
  {
    slug: "maliuyanik",
    name: "Muhammed Ali Uyanık",
    tagline: "Fullstack Dev",
    links: {
      github: gh("maliuyanik"),
      linkedin: li("maliuyanik"),
    },
  },
];
