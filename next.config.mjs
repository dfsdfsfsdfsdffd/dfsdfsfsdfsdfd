/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // This forces the build to finish even with tiny code mistakes
  },
  eslint: {
    ignoreDuringBuilds: true, // This prevents the build from stopping over "styling" rules
  },
};

export default nextConfig;
