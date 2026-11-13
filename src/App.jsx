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
import CustomCursor from './components/CustomCursor';
import RecruitmentSection from './components/RecruitmentSection';
import AdminDashboard from './components/AdminDashboard';
import PassesAdminDashboard from './components/PassesAdminDashboard';
import ShortFilmApplication from './components/ShortFilmApplication';

const FILM_POPUP_SEEN_KEY = 'rd_film_popup_seen';

// The Freshers Party Pass page has been retired; old links land on the homepage
const RETIRED_PATHS = ['/freshers-pass', '/freshers'];

function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isPassesAdminRoute, setIsPassesAdminRoute] = useState(false);
  const [isRecruitmentOpen, setIsRecruitmentOpen] = useState(false);
  const [recruitmentMode, setRecruitmentMode] = useState('teaser');
  const [isFilmOpen, setIsFilmOpen] = useState(false);

  // Show the short film casting call once per visit, shortly after the homepage loads
  useEffect(() => {
    if (isAdminRoute || isPassesAdminRoute) return undefined;
    let seen = false;
    try {
      seen = sessionStorage.getItem(FILM_POPUP_SEEN_KEY) === '1';
    } catch {
      /* storage unavailable */
    }
    if (seen) return undefined;
    const t = setTimeout(() => setIsFilmOpen(true), 900);
    return () => clearTimeout(t);
  }, [isAdminRoute, isPassesAdminRoute]);

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
      const path = window.location.pathname.replace(/\/+$/, '') || '/';
      if (RETIRED_PATHS.includes(path)) {
        window.history.replaceState({}, '', '/');
      }
      setIsPassesAdminRoute(path === '/admin/passes');
      setIsAdminRoute(path === '/admin');
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  // If on passes admin route, render PassesAdminDashboard directly
  if (isPassesAdminRoute) {
    return <PassesAdminDashboard />;
  }

  // If on admin route, render Admin Dashboard directly
  if (isAdminRoute) {
    return <AdminDashboard />;
  }

  const handleOpenJoinDirectly = () => {
    setRecruitmentMode('form');
    setIsRecruitmentOpen(true);
  };

  return (
    <div className="min-h-screen bg-rd-black text-white relative overflow-x-clip">
      {/* Premium Custom Cursor */}
      <CustomCursor />

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
        mode={recruitmentMode}
        onClose={() => setIsRecruitmentOpen(false)}
      />

      {/* Short Film Crew & Cast Application Popup */}
      <ShortFilmApplication isOpen={isFilmOpen} onClose={closeFilmPopup} />
    </div>
  );
}

export default App;