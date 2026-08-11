export type ProjectStatus = "live" | "building" | "concept";

export type Project = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  role: string;
  status: ProjectStatus;
  statusLabel: string;
  tech: string[];
  year: string;
  accent: string;
  url?: string;
  github?: string;
  featured: boolean;
  /** Marked true where the copy is a best-effort draft awaiting your confirmation. */
  draft?: boolean;
  /** Path under /public to a concept/preview image. Falls back to the procedural treatment if missing. */
  previewImage?: string;
};

export const projects: Project[] = [
  {
    id: "ai-training",
    name: "AI Model Training & Evaluation",
    tagline: "Shaping how frontier models think, respond, and reason.",
    description:
      "Ongoing remote contractor work across multiple AI training platforms — evaluating and ranking model outputs, writing and applying evaluation rubrics, red-teaming responses for safety and quality, and providing structured human feedback that shapes how large language models behave in production.",
    role: "AI Trainer / Model Evaluator",
    status: "live",
    statusLabel: "Ongoing",
    tech: ["RLHF", "Prompt Engineering", "Data Annotation", "Model Evaluation"],
    year: "2024 — Present",
    accent: "#7c5cff",
    featured: true,
  },
  {
    id: "italy-3dgs",
    name: "3D Gaussian Splatting Real Estate Tours",
    tagline: "Turning Italian listings into walkable 3D experiences.",
    description:
      "A venture bringing 3D Gaussian Splatting capture to Italian real estate agencies — replacing flat photos and clunky video walkthroughs with immersive, photorealistic 3D property tours that buyers can explore from anywhere. Currently in market validation with agencies across Italy before scaling capture operations.",
    role: "Founder",
    status: "building",
    statusLabel: "Validating",
    tech: ["3D Gaussian Splatting", "Photogrammetry", "Web3D", "Business Development"],
    year: "2026",
    accent: "#ff6b6b",
    featured: true,
  },
  {
    id: "randochat",
    name: "RandoChat",
    tagline: "Instant, anonymous, one-on-one conversations with strangers.",
    description:
      "A real-time random chat platform that pairs strangers for live conversation, built on a custom WebRTC signaling layer for fast peer-to-peer connections. Includes matchmaking, session handling, and a dedicated signaling server (randochat-signal) to keep connection setup fast and reliable at scale.",
    role: "Founder / Full-Stack Developer",
    status: "live",
    statusLabel: "Live",
    tech: ["JavaScript", "WebRTC", "Node.js", "WebSockets"],
    year: "2026",
    accent: "#22d3ee",
    github: "https://github.com/alejdi/randochat",
    featured: true,
    draft: true,
    previewImage: "/images/projects/randochat.png",
  },
  {
    id: "qp-link",
    name: "QP-Link",
    tagline: "Turn any product into a payment link in seconds.",
    description:
      "A lightweight payment-links SaaS: create shareable checkout links with embedded QR codes and built-in click and conversion analytics, without setting up a full storefront. Built for small merchants and solo sellers who need a fast, no-friction way to get paid.",
    role: "Founder / Full-Stack Developer",
    status: "building",
    statusLabel: "In Development",
    tech: ["TypeScript", "Payments", "QR Codes", "Analytics"],
    year: "2026",
    accent: "#34d399",
    github: "https://github.com/alejdi/qp-link",
    featured: true,
    draft: true,
    previewImage: "/images/projects/qp-link.png",
  },
  {
    id: "constructshield",
    name: "ConstructShield",
    tagline: "Safety and compliance, built for the job site.",
    description:
      "A digital safety and compliance toolkit for construction crews and site managers — centralizing hazard tracking, inspections, and certification records so nothing falls through the cracks on-site.",
    role: "Founder",
    status: "concept",
    statusLabel: "Concept",
    tech: ["TypeScript", "Compliance Workflows", "Web App"],
    year: "2026",
    accent: "#fbbf24",
    github: "https://github.com/alejdi/ConstructShield",
    featured: true,
    draft: true,
    previewImage: "/images/projects/constructshield.png",
  },
  {
    id: "realtix",
    name: "Realtix",
    tagline: "Real estate transactions, streamlined end to end.",
    description:
      "A real estate technology concept aimed at streamlining property listings and transactions for agents and buyers — early-stage and shaping up alongside the Italy 3D tours venture.",
    role: "Founder",
    status: "concept",
    statusLabel: "Concept",
    tech: ["Product Design", "Real Estate Tech"],
    year: "2026",
    accent: "#f472b6",
    featured: true,
    draft: true,
    previewImage: "/images/projects/realtix.png",
  },
  {
    id: "vue-al",
    name: "vue.al",
    tagline: "A dark-themed, futuristic subscription marketplace.",
    description:
      "A subscription marketplace with a bold dark-futuristic visual identity, built to make discovering and managing subscriptions feel effortless.",
    role: "Founder",
    status: "building",
    statusLabel: "In Development",
    tech: ["HTML", "CSS", "JavaScript"],
    year: "2026",
    accent: "#a78bfa",
    github: "https://github.com/alejdi/vue.al",
    featured: false,
    draft: true,
    previewImage: "/images/projects/vue-al.png",
  },
  {
    id: "telesports",
    name: "Telesports.live",
    tagline: "Live sports streaming, simplified.",
    description: "A live sports streaming platform built for fast, reliable access to matches and events.",
    role: "Founder",
    status: "concept",
    statusLabel: "Concept",
    tech: ["HTML", "Live Streaming"],
    year: "2025",
    accent: "#60a5fa",
    github: "https://github.com/alejdi/Telesports.live",
    featured: false,
    draft: true,
    previewImage: "/images/projects/telesports.png",
  },
  {
    id: "hash-relay",
    name: "hash-relay",
    tagline: "Lightweight relay infrastructure.",
    description: "A Python-based relay utility for passing and routing hashed data between services.",
    role: "Founder",
    status: "concept",
    statusLabel: "Concept",
    tech: ["Python"],
    year: "2026",
    accent: "#94a3b8",
    github: "https://github.com/alejdi/hash-relay",
    featured: false,
    draft: true,
    previewImage: "/images/projects/hash-relay.png",
  },
  {
    id: "gjejcmime",
    name: "GjejÇmime.al",
    tagline: "Albania's price comparison engine.",
    description:
      "A price comparison platform helping Albanian shoppers find the best prices across online retailers before they buy.",
    role: "Founder",
    status: "concept",
    statusLabel: "Concept",
    tech: ["Web Scraping", "Price Comparison"],
    year: "2026",
    accent: "#facc15",
    featured: false,
    draft: true,
    previewImage: "/images/projects/gjejcmime.png",
  },
  {
    id: "bytezone",
    name: "ByteZone.al",
    tagline: "An Albanian tech and electronics destination.",
    description: "A tech-focused platform serving the Albanian market.",
    role: "Founder",
    status: "concept",
    statusLabel: "Concept",
    tech: ["Web Platform"],
    year: "2026",
    accent: "#38bdf8",
    featured: false,
    draft: true,
    previewImage: "/images/projects/bytezone.png",
  },
  {
    id: "shqipnews",
    name: "ShqipNews",
    tagline: "Albanian-language news, aggregated.",
    description: "A news aggregator surfacing Albanian-language stories from across the web in one place.",
    role: "Founder",
    status: "concept",
    statusLabel: "Concept",
    tech: ["News Aggregation"],
    year: "2026",
    accent: "#fb7185",
    featured: false,
    draft: true,
    previewImage: "/images/projects/shqipnews.png",
  },
  {
    id: "kasapos",
    name: "KasaPOS (SeonPOS)",
    tagline: "Point-of-sale software for retail businesses.",
    description: "A point-of-sale system built for small and mid-size retail businesses to manage sales, inventory, and checkout.",
    role: "Founder",
    status: "concept",
    statusLabel: "Concept",
    tech: ["POS Systems", "Retail Tech"],
    year: "2026",
    accent: "#4ade80",
    featured: false,
    draft: true,
    previewImage: "/images/projects/kasapos.png",
  },
  {
    id: "converter",
    name: "Converter",
    tagline: "A fast, no-nonsense file & unit converter.",
    description: "A utility tool for quick file and unit conversions.",
    role: "Founder",
    status: "concept",
    statusLabel: "Concept",
    tech: ["Utility Tools"],
    year: "2026",
    accent: "#c084fc",
    featured: false,
    draft: true,
    previewImage: "/images/projects/converter.png",
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const otherProjects = projects.filter((p) => !p.featured);
