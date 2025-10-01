/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // optionnel mais recommandé
  webpack: (config) => {
    config.ignoreWarnings = [{ module: /@supabase\/realtime-js/ }];
    return config;
  },
  images: {
    domains: ["fcempygvfykaxytifbop.supabase.co"], // autorise ton domaine Supabase
  },
};

module.exports = nextConfig;
