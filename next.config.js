/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    scrollRestoration: true,
  },
  images: {
    domains: ["lh3.googleusercontent.com", "i.scdn.co"],
  },
};

module.exports = nextConfig;
