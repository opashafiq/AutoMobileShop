/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: { unoptimized: true },
  devIndicators: false,
  output: 'standalone', // Minimizes output size for Docker
}

export default nextConfig
