export type IconName =
  | "users"
  | "trendingUp"
  | "heart"
  | "star"
  | "camera"
  | "shirt"
  | "shoppingBag"
  | "smile"
  | "clapperboard"
  | "sparkles"
  | "gem"
  | "coffee"
  | "globe"
  | "zap"
  | "youtube"
  | "instagram"
  | "facebook"
  | "play"
  | "mail"

export type NavLink = {
  label: string
  href: string
}

export type StatEntry = {
  label: string
  value: string
  icon: IconName
}

export type GalleryImages = {
  row1: string[]
  row2: string[]
}

export type BentoCardEntry = {
  title: string
  icon: IconName
  color: string
  spanClass: string
  tags: string[]
  delay: number
  image: string
}

export type VideoHighlight = {
  views: string
  title: string
  image: string
  link: string
  dynamicViews?: boolean
}

export type BrandCollab = {
  name: string
  icon: IconName
}

export type SocialLink = {
  label: string
  href: string
  icon: IconName
  accent: string
}

export type PersonalData = {
  fullName: string
  brandHighlight: string
  badge: string
  heroDescription: string
  ctaPrimary: string
  ctaSecondary: string
  navLinks: NavLink[]
  stats: StatEntry[]
  aboutStatementPrefix: string
  aboutStatementAccent: string
  aboutStatementSuffix: string
  aboutDescription: string
  aboutTags: string[]
  galleryImages: GalleryImages
  bentoCards: BentoCardEntry[]
  videoHighlights: VideoHighlight[]
  brands: BrandCollab[]
  socialLinks: SocialLink[]
  footerEmail: string
}

export const personalData: PersonalData = {
  fullName: "KEOCHARNAI",
  brandHighlight: "AESTHETICS",
  badge: "Lifestyle & Content Creator",
  heroDescription:
    "Food reviews, outfit checks, store hunts, and unfiltered fun. Bringing a cherry-on-top vibe to your daily feed. 🍒",
  ctaPrimary: "Watch Content",
  ctaSecondary: "Work With Me",
  navLinks: [
    { label: "About", href: "#about" },
    { label: "Content", href: "#content" },
    { label: "Viral", href: "#viral" },
    { label: "Collabs", href: "#collabs" },
    { label: "Contact", href: "#contact" },
  ],
  stats: [
    { label: "Followers", value: "1.2M", icon: "users" },
    { label: "Monthly Views", value: "4.5M+", icon: "trendingUp" },
    { label: "Engagement", value: "8.4%", icon: "heart" },
    { label: "Brands", value: "50+", icon: "star" },
  ],
  aboutStatementPrefix: "I'm a content creator who loves",
  aboutStatementAccent: "romanticizing",
  aboutStatementSuffix: "the little things.",
  aboutDescription:
    "Hi! I'm Keocharnai. My content is a digital diary of my favorite foods, fits, and funny moments. I believe in aesthetics with a side of chaos. Whether I'm spilling coffee or finding the perfect vintage bag, you're coming along for the ride.",
  aboutTags: ["Foodie 🍒", "Fashion 👗", "Comedy 😂", "Lifestyle 🎥", "Aesthetic ✨"],
  galleryImages: {
    row1: [
      "https://pub-7eba62e4264b4804be4b689b906673cd.r2.dev/Image%20from%20Telegram%20Web%20(1).webp",
      "https://pub-7eba62e4264b4804be4b689b906673cd.r2.dev/Image%20from%20Telegram%20Web.webp",
      "https://pub-7eba62e4264b4804be4b689b906673cd.r2.dev/Telegram%20Image%202110.webp",
      "https://pub-7eba62e4264b4804be4b689b906673cd.r2.dev/Telegram%20Image%202112.webp",
      "https://pub-7eba62e4264b4804be4b689b906673cd.r2.dev/Telegram%20Image%202164.webp",
      "https://pub-7eba62e4264b4804be4b689b906673cd.r2.dev/Telegram%20Image%203115.webp",
    ],
    row2: [
      "https://pub-7eba62e4264b4804be4b689b906673cd.r2.dev/Telegram%20Image%203123.webp",
      "https://pub-7eba62e4264b4804be4b689b906673cd.r2.dev/Telegram%20Image%203130.webp",
      "https://pub-7eba62e4264b4804be4b689b906673cd.r2.dev/Telegram%20Image%202110.webp",
      "https://pub-7eba62e4264b4804be4b689b906673cd.r2.dev/Telegram%20Image%205802.webp",
      "https://pub-7eba62e4264b4804be4b689b906673cd.r2.dev/Telegram%20Image%208249.webp",
      "https://pub-7eba62e4264b4804be4b689b906673cd.r2.dev/Telegram%20Image%208256.webp",
    ],
  },
  bentoCards: [
    {
      title: "Food Reviews & Café Hunts",
      icon: "camera",
      color: "from-red-400 to-pink-300",
      spanClass: "md:col-span-2 md:row-span-1",
      tags: ["Café Visits ☕", "Honest Reviews ⭐", "Foodie 🍒"],
      delay: 0.1,
      image: "https://pub-7eba62e4264b4804be4b689b906673cd.r2.dev/Image%20from%20Telegram%20Web%20(1).webp",
    },
    {
      title: "Daily Outfit Checks",
      icon: "shirt",
      color: "from-pink-300 to-purple-300",
      spanClass: "md:col-span-1 md:row-span-2",
      tags: ["Styling 👗", "GRWM", "Trends"],
      delay: 0.2,
      image: "https://pub-7eba62e4264b4804be4b689b906673cd.r2.dev/Image%20from%20Telegram%20Web.webp",
    },
    {
      title: "Store Visits & Hauls",
      icon: "shoppingBag",
      color: "from-orange-200 to-pink-200",
      spanClass: "md:col-span-1 md:row-span-1",
      tags: ["Mall Tours 🛍️", "Finds"],
      delay: 0.3,
      image: "https://pub-7eba62e4264b4804be4b689b906673cd.r2.dev/Telegram%20Image%203115.webp",
    },
    {
      title: "Just For Laughs",
      icon: "smile",
      color: "from-yellow-200 to-orange-200",
      spanClass: "md:col-span-1 md:row-span-1",
      tags: ["Skits 😂", "Relatable"],
      delay: 0.4,
      image: "https://pub-7eba62e4264b4804be4b689b906673cd.r2.dev/Telegram%20Image%202112.webp",
    },
    {
      title: "Random Lifestyle",
      icon: "clapperboard",
      color: "from-blue-200 to-purple-200",
      spanClass: "md:col-span-3 md:row-span-1",
      tags: ["BTS 🎥", "Vlogs", "Life Updates"],
      delay: 0.5,
      image: "https://pub-7eba62e4264b4804be4b689b906673cd.r2.dev/Telegram%20Image%202164.webp",
    },
  ],
  videoHighlights: [
    {
      title: "",
      views: "",
      image: "https://www.tiktok.com/api/img/?itemId=7572049501758704917&location=0",
      link: "https://www.tiktok.com/@jewelln/video/7572049501758704917",
      dynamicViews: false,
    },
    {
      title: "",
      views: "",
      image: "https://www.tiktok.com/api/img/?itemId=7573325676481236245&location=0",
      link: "https://www.tiktok.com/@jewelln/video/7573325676481236245",
    },
    {
      title: "",
      views: "",
      image: "https://www.tiktok.com/api/img/?itemId=7575011066124586261&location=0",
      link: "https://www.tiktok.com/@jewelln/video/7575011066124586261",
    },
    {
      title: "",
      views: "",
      image: "https://www.tiktok.com/api/img/?itemId=7569058377574157588&location=0",
      link: "https://www.tiktok.com/@jewelln/video/7569058377574157588",
    },
    {
      title: "",
      views: "",
      image: "https://www.tiktok.com/api/img/?itemId=7557170740680822024&location=0",
      link: "https://www.tiktok.com/@jewelln/photo/7557170740680822024",
    },
  ],
  brands: [
    { name: "Glossier", icon: "sparkles" },
    { name: "Starbucks", icon: "coffee" },
    { name: "Zara", icon: "shoppingBag" },
    { name: "Canon", icon: "camera" },
    { name: "Revolve", icon: "globe" },
    { name: "Sephora", icon: "gem" },
    { name: "Casetify", icon: "zap" },
  ],
  socialLinks: [
    { label: "YouTube", href: "https://youtube.com", icon: "youtube", accent: "bg-red-500" },
    { label: "Instagram", href: "https://instagram.com", icon: "instagram", accent: "bg-pink-500" },
    { label: "TikTok", href: "https://www.tiktok.com", icon: "play", accent: "bg-black" },
    { label: "Facebook", href: "https://facebook.com", icon: "facebook", accent: "bg-blue-600" },
  ],
  footerEmail: "hello@keocharnai.com",
}
