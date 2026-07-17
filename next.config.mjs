// When deploying to GitHub Pages the site is served from /<repo>/,
// so we set basePath. Locally (next dev) these stay empty.
const isGithubPages = process.env.GITHUB_PAGES === 'true'
const repo = 'palmos-tasks'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: isGithubPages ? `/${repo}` : '',
  assetPrefix: isGithubPages ? `/${repo}/` : '',
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
