import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@connoisseur/db",
    "@connoisseur/shared",
    "@connoisseur/api-client",
  ],
};

export default nextConfig;
