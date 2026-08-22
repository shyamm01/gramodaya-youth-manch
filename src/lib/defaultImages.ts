/**
 * Default fallback images for grievances and other entities
 * Works completely offline and online.
 */

export const DEFAULT_GRIEVANCE_IMAGE = '/images/village_hero.jpg';

/**
 * High-quality category-specific fallback illustrations/SVG data URLs
 * guaranteeing 100% load reliability even without internet connection.
 */
function createCategorySvg(title: string, icon: string, bgGradientStart: string, bgGradientEnd: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgGradientStart};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${bgGradientEnd};stop-opacity:1" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <circle cx="400" cy="200" r="75" fill="rgba(255,255,255,0.12)" />
  <text x="400" y="225" font-size="64" text-anchor="middle" dominant-baseline="middle">${icon}</text>
  <text x="400" y="320" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="1">${title}</text>
  <text x="400" y="355" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="rgba(255,255,255,0.75)" text-anchor="middle" letter-spacing="2">GRAMODAYA YOUTH MANCH</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const CATEGORY_FALLBACK_SVGS: Record<string, string> = {
  Water: createCategorySvg('Water Supply & Quality', '💧', '#0891b2', '#0e7490'),
  Road: createCategorySvg('Roads & Transportation', '🛣️', '#d97706', '#b45309'),
  Electricity: createCategorySvg('Electricity & Lighting', '⚡', '#eab308', '#ca8a04'),
  Cleanliness: createCategorySvg('Cleanliness & Waste', '🧹', '#65a30d', '#4d7c0f'),
  Environment: createCategorySvg('Environment & Greenery', '🌳', '#059669', '#047857'),
  Education: createCategorySvg('Education & Schools', '📚', '#2563eb', '#1d4ed8'),
  Health: createCategorySvg('Health & Medical', '🏥', '#e11d48', '#be123c'),
  Sanitation: createCategorySvg('Sanitation & Drainage', '🚰', '#0d9488', '#0f766e'),
  'Animal-related': createCategorySvg('Cattle & Wildlife', '🐂', '#ea580c', '#c2410c'),
  'Social Issue': createCategorySvg('Social Welfare', '🤝', '#9333ea', '#7e22ce'),
  'Government Service': createCategorySvg('Public Services', '🏛️', '#4f46e5', '#4338ca'),
  Other: createCategorySvg('Village Grievance Desk', '📋', '#475569', '#334155'),
};

/**
 * Returns the reliable fallback image for a grievance.
 */
export function getGrievanceFallbackImage(category?: string): string {
  if (category && CATEGORY_FALLBACK_SVGS[category]) {
    return CATEGORY_FALLBACK_SVGS[category];
  }
  return CATEGORY_FALLBACK_SVGS.Other || DEFAULT_GRIEVANCE_IMAGE;
}
