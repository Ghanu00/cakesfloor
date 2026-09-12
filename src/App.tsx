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

// Custom Hidden Loyalty System Routes
import { LoyaltyScan } from './pages/LoyaltyScan';
import { OwnerPortal } from './pages/OwnerPortal';

import './App.css';

// Route listener component to top scroll & GA4 tracking
const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Track SPA pageviews in Google Analytics 4 (excluding private scan pages)
    if (
      typeof window !== 'undefined' &&
      (window as any).gtag &&
      !location.pathname.startsWith('/scan') &&
      !location.pathname.startsWith('/owner-portal')
    ) {
      (window as any).gtag('config', 'G-2576SVCCFE', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
};

// Layout Manager Component to hide Navbar/Footer on hidden /scan and /owner-portal routes
const AppLayout = () => {
  const location = useLocation();
  const isHiddenAppRoute =
    location.pathname.startsWith('/scan') ||
    location.pathname.startsWith('/owner-portal');

  return (
    <>
      {!isHiddenAppRoute && <Navbar introCompleted={true} />}
      <main className={isHiddenAppRoute ? '' : 'min-h-screen'}>
        <Routes>
          {/* Main Website Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />

          {/* Hidden Loyalty System Routes */}
          <Route path="/scan" element={<LoyaltyScan />} />
          <Route path="/owner-portal" element={<OwnerPortal />} />
        </Routes>
      </main>
      {!isHiddenAppRoute && <Footer />}
      {!isHiddenAppRoute && <FloatingCTA />}
    </>
  );
};

function App() {
  const [introCompleted, setIntroCompleted] = useState(false);

  useEffect(() => {
    const introPlayed = sessionStorage.getItem('the_cakes_floor_intro_played');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (introPlayed === 'true' || prefersReducedMotion) {
      setIntroCompleted(true);
    }
  }, []);

  useEffect(() => {
    if (!introCompleted) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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

  return (
    <HelmetProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        {!introCompleted && (
          <IntroAnimation onComplete={() => setIntroCompleted(true)} />
        )}
        
        <div className={introCompleted ? 'opacity-100 min-h-screen' : 'h-screen overflow-hidden opacity-100'}>
          <AppLayout />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
