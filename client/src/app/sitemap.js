export default function sitemap() {
  const baseUrl = 'https://tishcollection.store';
  const now     = new Date().toISOString();

  return [
    {
      url:             baseUrl,
      lastModified:    now,
      changeFrequency: 'daily',
      priority:        1.0,
    },
    {
      url:             `${baseUrl}/products`,
      lastModified:    now,
      changeFrequency: 'daily',
      priority:        0.9,
    },
    // Fashion categories
    {
      url:             `${baseUrl}/products?category=ladies-fashion`,
      lastModified:    now,
      changeFrequency: 'daily',
      priority:        0.9,
    },
    {
      url:             `${baseUrl}/products?category=mens-fashion`,
      lastModified:    now,
      changeFrequency: 'daily',
      priority:        0.9,
    },
    {
      url:             `${baseUrl}/products?category=shoes`,
      lastModified:    now,
      changeFrequency: 'daily',
      priority:        0.9,
    },
    {
      url:             `${baseUrl}/products?category=accessories`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.8,
    },
    {
      url:             `${baseUrl}/products?category=kids-fashion`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.8,
    },
    {
      url:             `${baseUrl}/products?featured=true`,
      lastModified:    now,
      changeFrequency: 'daily',
      priority:        0.8,
    },
    {
      url:             `${baseUrl}/login`,
      lastModified:    now,
      changeFrequency: 'monthly',
      priority:        0.4,
    },
    {
      url:             `${baseUrl}/register`,
      lastModified:    now,
      changeFrequency: 'monthly',
      priority:        0.4,
    },
  ];
}
