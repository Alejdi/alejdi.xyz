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
  /** The headline project: a pinned, scroll-told stop and a full case study instead of the standard card. */
  flagship?: Flagship;
};

export type FlagshipStat = {
  value: number;
  /** Appended after the counted number, e.g. "k" or "+". */
  suffix?: string;
  label: string;
};

export type FlagshipStep = {
  title: string;
  body: string;
};

export type FlagshipVideoSource = {
  /** Path under /public, e.g. "/videos/preventiv-16x9.mp4". */
  src: string;
  /** Still frame shown before playback, path under /public. */
  poster?: string;
};

export type Flagship = {
  /** One line under the name on the scroll stop. */
  pitch: string;
  /** Count-up figures, all taken from the product and its repository. */
  stats: FlagshipStat[];
  /** "How it works" — told in sync with the particle story while the stop is pinned. */
  steps: FlagshipStep[];
  /** The things most visitors never notice: shown in the case study's "Under the hood" tab. */
  details: { title: string; body: string }[];
  /** Key/value rows for the spec sheet. */
  spec: { label: string; value: string }[];
  /** The product's own embeddable demo, shown in the "Try it live" tab. */
  demo?: { url: string; note: string };
  /**
   * Explainer film. Landscape plays on desktop and tablets in landscape,
   * portrait on phones; either one alone is used everywhere. Leave empty
   * until the files exist — the Film tab only appears once a source is set.
   */
  video?: {
    landscape?: FlagshipVideoSource;
    portrait?: FlagshipVideoSource;
    /**
     * WebVTT captions, path under /public. The film's text is burned in, so the
     * track is offered but off by default (it would print every line twice).
     */
    captions?: string;
    /** Length in seconds, shown before the metadata has loaded. */
    duration?: number;
    /**
     * Scenes of the edit, in order, starting at 0. They drive the chapter rail
     * under the player and the transcript screen readers get. `index` mirrors
     * the "03/08" counter burned into the film; intro and credits have none.
     */
    chapters?: FlagshipChapter[];
  };
};

export type FlagshipChapter = {
  /** Seconds from the start, where the scene's entrance begins. */
  start: number;
  title: string;
  /** The line under the title on screen, for the transcript. */
  line?: string;
  index?: number;
};

export const projects: Project[] = [
  {
    id: "preventiv",
    name: "Preventiv",
    tagline: "Quotes, estimates and invoicing for any business.",
    description:
      "A SaaS that takes a business from the first price to the paid invoice. Pick one of 38 industries and start from a ready price list written in your trade's own words, build the estimate in a keyboard-first grid, then send a branded PDF or a link the client opens on their phone, picks options on and accepts online. The accepted offer becomes invoices with the right tax for Albania (TVSH, NIPT, fiscalisation) or Italy (IVA, split payment, FatturaPA). Every amount in the editor, the PDF, the Excel file, the API and the website widget comes from one decimal calculation engine, so the totals always add up to the cent.",
    role: "Founder / Full-Stack Developer",
    status: "live",
    statusLabel: "Public beta",
    tech: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Stripe", "Web Components", "Playwright"],
    year: "2026",
    accent: "#e8561c",
    url: "https://preventiv.app/en",
    featured: true,
    flagship: {
      pitch: "From the first price to the paid invoice, for businesses in Albania and Italy.",
      stats: [
        { value: 38, label: "Industries" },
        { value: 219, suffix: "k", label: "Lines of TypeScript" },
        { value: 2000, suffix: "+", label: "Automated tests" },
      ],
      steps: [
        {
          title: "Pick your industry",
          body: "38 industries, each with its own starter price list, templates, units and wording, from construction to weddings to software.",
        },
        {
          title: "Build the estimate",
          body: "A keyboard-first grid: quantities, formulas, options and alternatives. Overhead, discounts and VAT are applied in the right order, to the cent.",
        },
        {
          title: "Send, sign, bill",
          body: "The client opens a link on their phone, ticks the options they want and signs. Then it becomes invoices: at once, by milestone or monthly.",
        },
      ],
      details: [
        {
          title: "One engine for every number",
          body: "@preventiv/calc is a pure TypeScript engine on decimal arithmetic. The grid, the PDF, the Excel export, the REST API and the website widget all call it, so a total can never differ between two places.",
        },
        {
          title: "AI that can't invent a price",
          body: "Describe a job, add photos, and the AI drafts the estimate. It splits the work into items and does the measurements, but it never sees a price: it can only pick rows from your own price list through a search tool, and anything it can't match comes back unpriced.",
        },
        {
          title: "The client chooses, the engine recalculates",
          body: "Mark items optional or group alternatives. On the share link the client ticks what they want, and the totals, VAT included, are recalculated live by the same engine that prints the PDF.",
        },
        {
          title: "Two tax systems, built in",
          body: "Italy: IVA at 22/10/4%, split payment, reverse charge, ritenuta d'acconto and FatturaPA XML for the SdI. Albania: TVSH 20/6%, NIPT on every document and the NIVF/NSLF fiscalisation fields.",
        },
        {
          title: "An estimator for any website",
          body: "A <preventiv-estimator> web component and a WordPress plugin. Visitors answer a few questions, get a priced estimate, and every request lands in the CRM as a lead with a draft offer.",
        },
        {
          title: "Built to be trusted",
          body: "A public REST API with a TypeScript SDK and OpenAPI docs, two-factor sign-in, a nonce-based Content Security Policy, bot checks on public forms, and 300 test files plus Playwright end-to-end runs.",
        },
      ],
      spec: [
        { label: "Industries", value: "38 in 4 groups" },
        { label: "Languages", value: "Albanian · Italian · English" },
        { label: "Currencies", value: "Lek · EUR" },
        { label: "Outputs", value: "PDF · Excel · XPWE · CSV · XML" },
        { label: "Taxes", value: "TVSH · IVA · split payment · reverse charge" },
        { label: "Surface", value: "100+ screens · 60+ API routes" },
        { label: "Stack", value: "Next.js · Supabase · Stripe" },
      ],
      demo: {
        url: "https://preventiv.app/e/edilizia-brera/cb444cc2-6166-56d9-9278-a5c26d1729e2?embed=1&lang=en",
        note: "The real estimator of Preventiv's demo company, running live. Prices are indicative and no request reaches a real business.",
      },
      video: {
        landscape: { src: "/videos/preventiv-16x9.mp4", poster: "/videos/preventiv-16x9.jpg" },
        portrait: { src: "/videos/preventiv-9x16.mp4", poster: "/videos/preventiv-9x16.jpg" },
        captions: "/videos/preventiv.vtt",
        duration: 62,
        chapters: [
          { start: 0, title: "Preventiv", line: "Quotes, offers & invoicing for any business." },
          { start: 5, index: 1, title: "The problem", line: "Most small businesses still quote with spreadsheets, handwritten notes and WhatsApp photos." },
          { start: 11, index: 2, title: "Pick your trade", line: "38 industries, each with a ready-made price list." },
          { start: 17, index: 3, title: "Estimate in minutes", line: "One engine, two tax systems: Albania and Italy." },
          { start: 25, index: 4, title: "Branded PDF offers", line: "Generated instantly, in the client's language." },
          { start: 31, index: 5, title: "Accept online", line: "Clients choose options, see live totals and sign electronically." },
          { start: 38, index: 6, title: "Bill in stages", line: "Advance, progress bills and final, with e-invoice export." },
          { start: 44, index: 7, title: "Website calculator", line: "Visitors price their job on your site, you get the lead." },
          { start: 49, index: 8, title: "Under the hood", line: "Designed and engineered end to end." },
          { start: 56, title: "Credits", line: "Designed & built by Alejdi · alejdi.xyz" },
        ],
      },
    },
  },
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
    id: "agplayer",
    name: "AG Player",
    tagline: "One IPTV player for Android TV, phones and Windows.",
    description:
      "An IPTV player shipped as an Android TV app, an Android mobile app and a Windows desktop app. It has live TV with an XMLTV programme guide, movies and series, per-device activation, a parental PIN and 8 languages. It runs on a Supabase backend with PayPal and crypto checkout, a customer portal, and an admin panel with live chat and error reports.",
    role: "Founder / Full-Stack Developer",
    status: "live",
    statusLabel: "Live",
    tech: ["Supabase", "Capacitor", "Electron", "HLS.js", "PostgreSQL", "JavaScript"],
    year: "2026",
    accent: "#1e7bff",
    url: "https://agplayer.xyz",
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
