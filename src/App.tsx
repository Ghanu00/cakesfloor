import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Lenis from 'lenis';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { FloatingCTA } from './components/layout/FloatingCTA';
import { IntroAnimation } from './components/layout/IntroAnimation';

import { Home } from './pages/Home';
import { About } from './pages/About';
import { Menu } from './pages/Menu';
import { Gallery } from './pages/Gallery';
import { Reviews } from './pages/Reviews';
import { Contact } from './pages/Contact';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';

import './App.css'; // We will empty this file to avoid conflicts

// Route listener component to snap scroll positions to the top & track GA4 pageviews
const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Track SPA pageviews in Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'G-2576SVCCFE', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
};

function App() {
  const [introCompleted, setIntroCompleted] = useState(false);

  useEffect(() => {
    // Check if intro has been played this session or if prefers-reduced-motion is active
    const introPlayed = sessionStorage.getItem('the_cakes_floor_intro_played');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (introPlayed === 'true' || prefersReducedMotion) {
      setIntroCompleted(true);
    }
  }, []);

  useEffect(() => {
    if (!introCompleted) return;

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard ease-out curve
      wheelMultiplier: 1,
      infinite: false,
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [introCompleted]);

  // Eagerly prefetch and load all images across all sections/pages in the background
  useEffect(() => {
    if (!introCompleted) return;

    const imagesToPreload = [
      '/logo.png',
      '/images/hero-carousel-1.webp',
      '/images/hero-carousel-2.webp',
      '/images/hero-carousel-3.webp',
      '/images/instagram-profile.webp',
      '/images/teaser-cake-1.webp',
      '/images/teaser-cake-2.webp',
      '/images/teaser-cake-3.webp',
      '/images/aboutus-img.webp',
      '/images/aboutus-img2.webp',
      '/images/menu-header-bg.webp',
      '/images/usp-bg.webp',
      '/images/review-bg-1.webp',
      '/images/review-bg-2.webp',
      '/images/review-bg-4.webp',
      '/images/box-img-1.webp',
      '/images/box-img-2.webp',
      '/images/box-img-3.webp',
      '/images/hero-bg.jpg',
      '/images/WhatsApp Image 2026-07-02 at 23.53.24.jpeg',
      '/images/WhatsApp Image 2026-07-02 at 23.53.25.jpeg',
      '/images/WhatsApp Image 2026-07-02 at 23.53.23.jpeg',
      '/images/WhatsApp Image 2026-07-02 at 23.53.26.jpeg',
      '/images/WhatsApp Image 2026-07-02 at 23.53.25 (2).jpeg'
    ];

    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}`;
    });
  }, [introCompleted]);

  return (
    <HelmetProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        {/* 1. The lightweight Intro Animation overlay */}
        {!introCompleted && (
          <IntroAnimation onComplete={() => setIntroCompleted(true)} />
        )}
        
        {/* 2. Main Website Wrapper (allowed to render in the background, locked from scroll if not completed) */}
        <div className={introCompleted ? 'opacity-100 min-h-screen' : 'h-screen overflow-hidden opacity-100'}>
          <Navbar introCompleted={introCompleted} />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
            </Routes>
          </main>
          <Footer />
          <FloatingCTA />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
