import './globals.css';
import { Toaster } from 'react-hot-toast';

const SITE_NAME   = 'Tish Collection';
const SITE_URL    = 'https://tishcollection.store';
const DESCRIPTION = 'Shop the latest fashion, clothes, shoes and accessories at Tish Collection Kenya. Trendy outfits for men and women. Fast delivery across Kenya. Pay with M-Pesa.';
const KEYWORDS    = 'clothes kenya, shoes kenya, fashion kenya, buy clothes online kenya, buy shoes nairobi, ladies fashion kenya, mens fashion kenya, tish collection, online clothing store kenya, mpesa fashion, nairobi clothes shop, kenya fashion store';

export const metadata = {
  title: {
    default:  `${SITE_NAME} — Clothes & Shoes Online Store Kenya`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords:    KEYWORDS,

  openGraph: {
    type:        'website',
    locale:      'en_KE',
    url:          SITE_URL,
    siteName:     SITE_NAME,
    title:       `${SITE_NAME} — Fashion, Clothes & Shoes Kenya`,
    description:  DESCRIPTION,
    images: [
      {
        url:    `${SITE_URL}/og-image.jpg`,
        width:   1200,
        height:  630,
        alt:    `${SITE_NAME} — Clothes & Shoes Kenya`,
      },
    ],
  },

  twitter: {
    card:        'summary_large_image',
    title:       `${SITE_NAME} — Fashion, Clothes & Shoes Kenya`,
    description:  DESCRIPTION,
    images:      [`${SITE_URL}/og-image.jpg`],
  },

  robots: {
    index:     true,
    follow:    true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },

  alternates: {
    canonical: SITE_URL,
  },

  icons: {
    icon:  '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  verification: {
    google: 'Whvc7mvxC-YxG1hDPd4QVbZzZdVVpaER46uY8vhIaPM',
  },

  applicationName: SITE_NAME,
  authors:        [{ name: SITE_NAME, url: SITE_URL }],
  category:       'fashion',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* 
          Structured data for Google rich results.
          Using ClothingStore + ItemList schema.
          Removed individual Product items from hasOfferCatalog
          because they were triggering "missing offers/review/aggregateRating" errors.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type':    'ClothingStore',
              name:        SITE_NAME,
              url:         SITE_URL,
              description: DESCRIPTION,
              image:       `${SITE_URL}/og-image.jpg`,
              priceRange:  'KES',
              currenciesAccepted: 'KES',
              paymentAccepted:    'M-Pesa, Cash',
              address: {
                '@type':         'PostalAddress',
                addressLocality: 'Nairobi',
                addressRegion:   'Nairobi County',
                addressCountry:  'KE',
              },
              geo: {
                '@type':    'GeoCoordinates',
                latitude:   '-1.2921',
                longitude:  '36.8219',
              },
              contactPoint: {
                '@type':           'ContactPoint',
                telephone:         '+254700000000',
                contactType:       'customer service',
                areaServed:        'KE',
                availableLanguage: ['English', 'Swahili'],
              },
              openingHoursSpecification: {
                '@type':     'OpeningHoursSpecification',
                dayOfWeek:  ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
                opens:       '08:00',
                closes:      '18:00',
              },
              sameAs: [
                'https://www.facebook.com/tishcollection',
                'https://www.instagram.com/tishcollection',
                'https://www.tiktok.com/@tishcollection',
              ],
              potentialAction: {
                '@type':       'SearchAction',
                target:       `${SITE_URL}/products?search={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />

        {/* BreadcrumbList — helps Google show your site structure */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context':        'https://schema.org',
              '@type':           'BreadcrumbList',
              itemListElement: [
                {
                  '@type':   'ListItem',
                  position:   1,
                  name:       'Home',
                  item:       SITE_URL,
                },
                {
                  '@type':   'ListItem',
                  position:   2,
                  name:       'All Products',
                  item:      `${SITE_URL}/products`,
                },
                {
                  '@type':   'ListItem',
                  position:   3,
                  name:       'Ladies Fashion',
                  item:      `${SITE_URL}/products?category=ladies-fashion`,
                },
                {
                  '@type':   'ListItem',
                  position:   4,
                  name:       "Men's Fashion",
                  item:      `${SITE_URL}/products?category=mens-fashion`,
                },
                {
                  '@type':   'ListItem',
                  position:   5,
                  name:       'Shoes',
                  item:      `${SITE_URL}/products?category=shoes`,
                },
              ],
            }),
          }}
        />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        {children}
      </body>
    </html>
  );
}
