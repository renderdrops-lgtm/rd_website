import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MarqueeBanner from './components/MarqueeBanner';
import WorkSection from './components/WorkSection';
import ReelWall from './components/ReelWall';
import ServicesSection from './components/ServicesSection';
import ManifestoSection from './components/ManifestoSection';
import HighlightsSection from './components/HighlightsSection';
import CollectiveSection from './components/CollectiveSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import ScrollReveal from './components/ScrollReveal';
import RecruitmentSection from './components/RecruitmentSection';
import ShortFilmApplication from './components/ShortFilmApplication';
import SiteAdminDashboard from './components/SiteAdminDashboard';
import { trackVisit } from './lib/trackVisit';

const FILM_POPUP_SEEN_KEY = 'rd_film_popup_seen';

// The Freshers Party Pass page has been retired; old links land on the homepage
const RETIRED_PATHS = ['/freshers-pass', '/freshers'];

// The admin dashboard, plus the old admin addresses that now lead to it
const ADMIN_PATH = '/admin/dashboard';
const OLD_ADMIN_PATHS = ['/admin', '/admin/passes'];

const currentPath = () => window.location.pathname.replace(/\/+$/, '') || '/';
const isAdminPath = (path) => path === ADMIN_PATH || OLD_ADMIN_PATHS.includes(path);

function App() {
  const [isSiteAdminRoute, setIsSiteAdminRoute] = useState(() => isAdminPath(currentPath()));
  const [isRecruitmentOpen, setIsRecruitmentOpen] = useState(false);
  const [isFilmOpen, setIsFilmOpen] = useState(false);

  // Count this visit for the admin dashboard (skipped on admin pages)
  useEffect(() => {
    trackVisit();
  }, []);

  // Show the short film casting call once per visit, shortly after the homepage loads
  useEffect(() => {
    if (isSiteAdminRoute) return undefined;
    let seen = false;
    try {
      seen = sessionStorage.getItem(FILM_POPUP_SEEN_KEY) === '1';
    } catch {
      /* storage unavailable */
    }
    if (seen) return undefined;
    const t = setTimeout(() => setIsFilmOpen(true), 900);
    return () => clearTimeout(t);
  }, [isSiteAdminRoute]);

  const closeFilmPopup = useCallback(() => {
    setIsFilmOpen(false);
    try {
      sessionStorage.setItem(FILM_POPUP_SEEN_KEY, '1');
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    const checkRoute = () => {
      const path = currentPath();
      if (RETIRED_PATHS.includes(path)) {
        window.history.replaceState({}, '', '/');
      }
      if (OLD_ADMIN_PATHS.includes(path)) {
        window.history.replaceState({}, '', ADMIN_PATH);
      }
      setIsSiteAdminRoute(isAdminPath(path));
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  // Admin: visitors + short film applications
  if (isSiteAdminRoute) {
    return <SiteAdminDashboard />;
  }

  const handleOpenJoinDirectly = () => {
    setIsRecruitmentOpen(true);
  };

  return (
    <div className="min-h-screen bg-rd-black text-white relative overflow-x-clip">

      {/* Navigation */}
      <Navbar onOpenRecruitment={handleOpenJoinDirectly} onOpenFilmCall={() => setIsFilmOpen(true)} />

      <main>
        <Hero onOpenFilmCall={() => setIsFilmOpen(true)} />
        <MarqueeBanner />
        <ScrollReveal delay={60}>
          <WorkSection />
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <ReelWall />
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <ServicesSection />
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <ManifestoSection />
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <HighlightsSection />
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <CollectiveSection />
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <ContactSection />
        </ScrollReveal>
      </main>

      {/* Footer */}
      <ScrollReveal delay={80}>
        <Footer />
      </ScrollReveal>

      {/* Recruitment Popup Modal */}
      <RecruitmentSection 
        isOpen={isRecruitmentOpen} 
        onClose={() => setIsRecruitmentOpen(false)}
      />

      {/* Short Film Crew & Cast Application Popup */}
      <ShortFilmApplication isOpen={isFilmOpen} onClose={closeFilmPopup} />
    </div>
  );
}

export default App;