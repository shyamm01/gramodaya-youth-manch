import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://gramodayarasoolpur.org';
  const currentDate = new Date();

  const routes = [
    { path: '', changeFrequency: 'daily' as const, priority: 1.0 },
    { path: '/members', changeFrequency: 'daily' as const, priority: 0.9 },
    { path: '/leadership', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/problems', changeFrequency: 'daily' as const, priority: 0.8 },
    { path: '/social-work', changeFrequency: 'weekly' as const, priority: 0.7 },
    { path: '/announcements', changeFrequency: 'daily' as const, priority: 0.8 },
    { path: '/events', changeFrequency: 'weekly' as const, priority: 0.7 },
    { path: '/gallery', changeFrequency: 'weekly' as const, priority: 0.6 },
    { path: '/helpline', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/elders', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/about', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/live-chat', changeFrequency: 'always' as const, priority: 0.9 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
