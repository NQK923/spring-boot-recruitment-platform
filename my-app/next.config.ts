import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL).hostname
  : "npynwsukvsxrsmxssikx.supabase.co";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
