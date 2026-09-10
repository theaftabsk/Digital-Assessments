import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config, { isServer }) => {
    // face-api.js requires canvas — skip it in server-side builds
    if (isServer) {
      config.externals = [...(config.externals || []), "canvas", "face-api.js"];
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "https://www.greatcampus.tech/assess",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
