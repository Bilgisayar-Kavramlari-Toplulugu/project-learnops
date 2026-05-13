// src/data/team.ts

export type TeamMember = {
  slug: string;
  name: string;
  tagline?: string;
  contributions?: string;
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
    tagline: "Senior DevOps / Cloud Engineer",
    contributions: "(PO, DevOps, Cloud)",
    links: {
      github: gh("flovearth"),
      linkedin: li("feyzsari"),
    },
  },
  {
    slug: "lerkush",
    name: "Lütfiye Erkuş",
    tagline: "Fullstack Dev",
    contributions: "(Project Lead)",
    links: {
      github: gh("lerkush"),
      linkedin: li("lerkush"),
    },
  },
  {
    slug: "karalarmehmet",
    name: "Mehmet Karalar",
    tagline: "Computer Engineer",
    contributions: "(Backend, DevOps)",
    links: {
      github: gh("karalarmehmet"),
      linkedin: li("karalar-mehmet"),
    },
  },
  {
    slug: "slymanmrcan",
    name: "Süleyman Mercan",
    tagline: "DevOps & Fullstack Dev",
    contributions: "(Frontend)",
    links: {
      github: gh("slymanmrcan"),
      linkedin: li("slymanmrcan"),
      website: "https://suleymanmercan.is-a.dev/",
    },
  },
  {
    slug: "shamsiaa",
    name: "Shamsiaa Rahimi",
    tagline: "Data & Backend Engineer",
    contributions: "(Backend, DevOps, Content)",
    links: {
      github: gh("shamsiaa"),
      linkedin: li("shamsia-r-5b6919240"),
    },
  },
  {
    slug: "belmuh",
    name: "Belma Ünsal",
    tagline: "Software Developer",
    contributions: "(Backend, Frontend, Content)",
    links: {
      github: gh("belmuh"),
      linkedin: li("belmaunsal"),
    },
  },
  {
    slug: "muhammedcagrikurt",
    name: "Muhammed Çağrı Kurt",
    tagline: "Fullstack Dev",
    contributions: "(Frontend)",
    links: {
      github: gh("muhammedcagrikurt"),
      linkedin: li("muhammedcagrikurt"),
    },
  },
  {
    slug: "replakcan",
    name: "Alper Mutlu Akcan",
    tagline: "Software Engineer",
    contributions: "(Frontend)",
    links: {
      github: gh("replakcan"),
      linkedin: li("alpermutluakcan"),
    },
  },
  {
    slug: "ismailaricioglu",
    name: "İsmail Arıcıoğlu",
    tagline: "Software Technician",
    contributions: "(Backend, Infra, Cloud, Content)",
    links: {
      github: gh("ismailaricioglu"),
      linkedin: li("ismailaricioglu"),
    },
  },
  {
    slug: "svenes25",
    name: "Enes Eren Seven",
    tagline: "Full Stack Developer",
    contributions: "(Frontend)",
    links: {
      github: gh("svenes25"),
      linkedin: li("enes-eren-seven"),
    },
  },
  {
    slug: "anenthusiastic",
    name: "Fatih Gürkan",
    tagline: "Software Engineer",
    contributions: "(Backend)",
    links: {
      github: gh("anenthusiastic"),
      linkedin: li("fatihgurkan"),
    },
  },
  {
    slug: "maliuyanik",
    name: "Muhammed Ali Uyanık",
    tagline: "Software Engineer",
    contributions: "(Cloud, Backend)",
    links: {
      github: gh("maliuyanik"),
      linkedin: li("maliuyanik"),
    },
  },
];
