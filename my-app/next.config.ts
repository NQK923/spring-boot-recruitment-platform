import type { NextConfig } from "next";

const supabaseProjectHost = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL).hostname
  : "npynwsukvsxrsmxssikx.supabase.co";

const nextConfig: NextConfig = {
  images: {
    domains: [supabaseProjectHost],
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseProjectHost,
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
