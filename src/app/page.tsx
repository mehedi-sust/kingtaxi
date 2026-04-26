import Hero from '@/components/Hero';
import Services from '@/components/Services';
import InteractiveFareTable from '@/components/InteractiveFareTable';
import Reviews from '@/components/Reviews';
import OffersBanner from '@/components/OffersBanner';

export const metadata = {
  title: 'King Taxi Ashford | 24/7 Taxi Service & Airport Transfers in Ashford, Kent',
  description: 'King Taxi Ashford offers reliable 24/7 taxi service, airport transfers, and local rides in Ashford, Kent. CRB-checked drivers, competitive fares, instant booking. Call 01233 367 357.',
  keywords: [
    'King Taxi Ashford',
    'Ashford taxi',
    'taxi Ashford Kent',
    'Ashford airport transfer',
    'taxi service Ashford',
    'Ashford taxi company',
    'cheap taxi Ashford',
    'Ashford to Heathrow',
    'Ashford to Gatwick',
    'Ashford station taxi',
    '24 hour taxi Ashford',
    'book taxi Ashford',
    'Ashford minicab',
    'taxi near me Ashford',
    'Ashford taxi booking',
  ],
  openGraph: {
    title: 'King Taxi Ashford | 24/7 Taxi Service & Airport Transfers',
    description: 'Reliable taxi service in Ashford, Kent. CRB-checked drivers, competitive fares, 24/7 availability. Book online or call 01233 367 357.',
    type: 'website',
    locale: 'en_GB',
    siteName: 'King Taxi Ashford',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'King Taxi Ashford | 24/7 Taxi Service & Airport Transfers',
    description: 'Reliable taxi service in Ashford, Kent. CRB-checked drivers, competitive fares, 24/7 availability.',
  },
  alternates: {
    canonical: 'https://kingtaxi.co.uk',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function Home() {
  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'King Taxi Ashford',
    image: 'https://kingtaxi.co.uk/logo.jpeg',
    '@id': 'https://kingtaxi.co.uk',
    url: 'https://kingtaxi.co.uk',
    telephone: '+44-1233-367357',
    priceRange: '££',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '',
      addressLocality: 'Ashford',
      addressRegion: 'Kent',
      postalCode: '',
      addressCountry: 'GB',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 51.1465,
      longitude: 0.8750,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '00:00',
      closes: '23:59',
    },
    sameAs: [
      'https://www.facebook.com/kingtaxiashford',
      'https://twitter.com/kingtaxiashford',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '500',
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Ashford',
      },
      {
        '@type': 'City',
        name: 'Canterbury',
      },
      {
        '@type': 'City',
        name: 'Maidstone',
      },
      {
        '@type': 'City',
        name: 'Folkestone',
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Taxi Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Airport Transfer',
            description: 'Reliable airport pickup and drop-off services',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Local Taxi Service',
            description: '24/7 local taxi service in Ashford and Kent',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Long Distance Travel',
            description: 'Comfortable long-distance taxi journeys',
          },
        },
      ],
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="pt-20 bg-white dark:bg-gray-900 min-h-screen">
        <OffersBanner />
        <Hero />
        <InteractiveFareTable />
        <Services />
        <Reviews />
      </div>
    </>
  );
}
