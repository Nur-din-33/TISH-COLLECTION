export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow:    '/',
        disallow: [
          '/admin',
          '/admin/',
          '/checkout',
          '/cart',
          '/orders',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://tishcollection.store/sitemap.xml',
    host:    'https://tishcollection.store',
  };
}
