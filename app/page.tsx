import Hero from '@/components/Hero';
import UseCases from '@/components/UseCases';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <UseCases />
      <Testimonials />
      <Footer />
    </main>
  );
}
