import Hero from '@/components/Hero';
import Services from '@/components/Services';
import FareAndFleet from '@/components/FareAndFleet';
import Reviews from '@/components/Reviews';
import OffersBanner from '@/components/OffersBanner';

export default function Home() {
  return (
    <div className="pt-20 bg-white dark:bg-gray-900 min-h-screen">
      <OffersBanner />
      <Hero />
      <FareAndFleet />
      <Services />
      <Reviews />
    </div>
  );
}
