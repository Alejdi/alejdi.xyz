import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Dokumentet private lexohen nga disku në kohë ekzekutimi, ndaj duhen
  // përfshirë shprehimisht në paketimin e funksionit.
  outputFileTracingIncludes: {
    "/p/[slug]": ["./src/offers/**"],
  },
};

export default nextConfig;
