/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    swcPlugins: [['@formatjs/swc-plugin-experimental', {}]],
  },
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })

    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          // fixes siwe dependencies
          net: false,
          tls: false,
          fs: false,
        },
      }
    }

    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig)
