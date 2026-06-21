/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config, { isServer }) => {
    // Disable CSS optimization to fix PostCSS build error
    if (!isServer) {
      config.optimization = config.optimization || {};
      config.optimization.minimize = false;
    }
    return config;
  },
}

module.exports = nextConfig
