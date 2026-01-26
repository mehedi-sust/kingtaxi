import Hero from '@/components/Hero';
import Services from '@/components/Services';
import InteractiveFareTable from '@/components/InteractiveFareTable';
import Reviews from '@/components/Reviews';
import OffersBanner from '@/components/OffersBanner';

export const metadata = {
  title: 'King Taxi | Reliable Taxi Service in Ashford, UK',
  description: 'Premium taxi service for local rides and airport transfers across the UK.',
  keywords: ['taxi', 'Ashford taxi', 'airport transfer', 'UK taxi', 'King Taxi'],
  openGraph: {
    title: 'King Taxi | Reliable Taxi Service in Ashford, UK',
    description: 'Premium taxi service for local rides and airport transfers across the UK.',
    type: 'website',
  },
};

export default function Home() {
  return (
    <div className="pt-20 bg-white dark:bg-gray-900 min-h-screen">
      <OffersBanner />
      <Hero />
      <InteractiveFareTable />
      <Services />
      <Reviews />
    </div>
  );
}
