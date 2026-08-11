import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { profile } from "@/data/profile";

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadBackground(): Promise<string | null> {
  try {
    const data = await readFile(join(process.cwd(), "public/images/og-background.png"), "base64");
    return `data:image/png;base64,${data}`;
  } catch {
    return null;
  }
}

const backgroundSrc = await loadBackground();

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "80px",
          backgroundColor: "#08070a",
          backgroundImage: backgroundSrc
            ? `url(${backgroundSrc})`
            : "radial-gradient(circle at 72% 28%, #8b7bff66, transparent 60%), radial-gradient(circle at 30% 80%, #ff6b5744, transparent 55%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#f3f1ea",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#8b7bff",
            marginBottom: 22,
          }}
        >
          {profile.role} — {profile.location}
        </div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700 }}>{profile.name}</div>
        <div style={{ display: "flex", fontSize: 30, color: "#a7a3ab", marginTop: 18, maxWidth: 920 }}>
          {profile.tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
