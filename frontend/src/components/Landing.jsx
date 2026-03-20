import Navbar from './Navbar';
import Hero from './Hero';
import LivePreview from './LivePreview';
import Stats from './Stats';
import Features from './Features';
import HowItWorks from './HowItWorks';
import CTA from './CTA';
import Footer from './Footer';

export default function Landing() {
  return (
    <div className="w-full bg-gradient-hero text-white overflow-hidden">
      <Navbar />
      <Hero />
      <LivePreview />
      <Stats />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}
