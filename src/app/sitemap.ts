import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://scanutsav.com';
  
  const staticRoutes = [
    '',
    '/features',
    '/solutions',
    '/how-it-works',
    '/pricing',
    '/gallery',
    '/blog',
    '/about',
    '/contact',
    '/faq',
    '/gift',
    '/privacy',
    '/terms',
    '/refund',
    '/login',
    '/register',
  ];

  const blogSlugs = [
    'how-to-collect-uncompressed-4k-wedding-photos',
    'why-qr-code-photo-sharing-beats-whatsapp-groups',
    'dpdp-act-2023-wedding-guest-photo-privacy-guide',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticEntries, ...blogEntries];
}
