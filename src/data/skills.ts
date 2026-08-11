export type SkillGroup = {
  category: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    category: "AI & Data",
    items: [
      "RLHF / Model Evaluation",
      "Prompt Engineering",
      "Data Annotation",
      "LLM Red-Teaming",
    ],
  },
  {
    category: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Three.js / WebGL"],
  },
  {
    category: "Backend & Infra",
    items: ["Node.js", "WebRTC", "REST APIs", "Payment Integrations", "PostgreSQL"],
  },
  {
    category: "3D & Emerging Tech",
    items: ["3D Gaussian Splatting", "Photogrammetry", "Real-time 3D Visualization"],
  },
  {
    category: "Business",
    items: [
      "Market Validation",
      "Remote Contracting",
      "Product Strategy",
      "Multi-Venture Execution",
    ],
  },
];
