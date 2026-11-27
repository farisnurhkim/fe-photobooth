import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/packages', '/api/public'],
      disallow: [
        '/admin/',
        '/my-bookings/',
        '/settings/',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
        '/request-activation',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
