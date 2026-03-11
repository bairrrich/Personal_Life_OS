import type { NextConfig } from 'next' 
 
const nextConfig: NextConfig = { 
  output: 'standalone', 
  images: { 
    remotePatterns: [ 
      { protocol: 'https', hostname: 'world.openfoodfacts.org' }, 
      { protocol: 'https', hostname: 'static.openfoodfacts.org' }, 
      { protocol: 'https', hostname: 'wger.de' }, 
    ], 
  }, 
} 
 
export default nextConfig
