import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://scanutsav.com';
  
  const staticRoutes = [
    { route: '', priority: 1.0, changeFrequency: 'daily' },
    { route: '/features', priority: 0.9, changeFrequency: 'weekly' },
    { route: '/solutions', priority: 0.9, changeFrequency: 'weekly' },
    { route: '/how-it-works', priority: 0.9, changeFrequency: 'weekly' },
    { route: '/pricing', priority: 0.9, changeFrequency: 'weekly' },
    { route: '/gallery', priority: 0.8, changeFrequency: 'daily' },
    { route: '/blog', priority: 0.8, changeFrequency: 'daily' },
    { route: '/about', priority: 0.7, changeFrequency: 'monthly' },
    { route: '/contact', priority: 0.7, changeFrequency: 'monthly' },
    { route: '/faq', priority: 0.8, changeFrequency: 'weekly' },
    { route: '/gift', priority: 0.8, changeFrequency: 'weekly' },
    { route: '/privacy', priority: 0.5, changeFrequency: 'monthly' },
    { route: '/terms', priority: 0.5, changeFrequency: 'monthly' },
    { route: '/refund', priority: 0.5, changeFrequency: 'monthly' },
    { route: '/login', priority: 0.6, changeFrequency: 'monthly' },
    { route: '/register', priority: 0.7, changeFrequency: 'monthly' },
  ] as const;

  const blogSlugs = [
    'how-to-collect-uncompressed-4k-wedding-photos',
    'why-qr-code-photo-sharing-beats-whatsapp-groups',
    'dpdp-act-2023-wedding-guest-photo-privacy-guide',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticEntries, ...blogEntries];
}
