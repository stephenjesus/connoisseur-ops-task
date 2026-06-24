import type { NextConfig } from "next";

const devTunnelHost = process.env.DEV_TUNNEL_HOST;

const nextConfig: NextConfig = {
  transpilePackages: [
    "@connoisseur/db",
    "@connoisseur/shared",
    "@connoisseur/api-client",
  ],
  allowedDevOrigins: [
    "192.168.1.2",
    "localhost",
    ...(devTunnelHost ? [devTunnelHost] : []),
  ],
};

export default nextConfig;
