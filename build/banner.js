// build/banner.js
// Returns a /*! ... */ banner string for Rollup/Terser to preserve.
export default function makeBanner({
  name = 'Amazon Store Router',
  version = process.env.VERSION || '0.0.0',
  repo = process.env.REPOSITORY || 'https://github.com/YOURUSER/amazon_store',
  license = 'MIT',
  sha = process.env.SHORT_SHA || '',
  date = process.env.BUILD_DATE || new Date().toISOString()
} = {}) {
  const commit = sha ? `• commit ${sha}` : '';
  return `/*! ${name} v${version} — ${license} | ${repo} • built ${date} ${commit} */`;
}

