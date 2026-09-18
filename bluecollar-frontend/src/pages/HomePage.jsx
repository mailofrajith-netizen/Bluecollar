import HeroSection      from '../components/home/HeroSection';
import FeaturesStrip    from '../components/home/FeaturesStrip';
import { CollectionsGrid, BestSellers } from '../components/home/ProductShowcase';
import LifestyleBanner  from '../components/home/LifestyleBanner';
import AboutSection     from '../components/home/AboutSection';
import Testimonials     from '../components/home/Testimonials';
import TrustBadges      from '../components/home/TrustBadges';
import NewsletterSignup from '../components/home/NewsletterSignup';
import Toast            from '../components/common/Toast';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesStrip />
      <CollectionsGrid />
      <BestSellers />
      <LifestyleBanner />
      <AboutSection />
      <Testimonials />
      <TrustBadges />
      <NewsletterSignup />
      <Toast />
    </>
  );
}
