import React, { useState, useEffect } from 'react';
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

function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isRecruitmentOpen, setIsRecruitmentOpen] = useState(false);
  const [recruitmentMode, setRecruitmentMode] = useState('teaser');

  useEffect(() => {
    // Check if URL is /admin
    if (window.location.pathname === '/admin') {
      setIsAdminRoute(true);
      return;
    }

    // Otherwise show recruitment teaser popup on home page load
    setRecruitmentMode('teaser');
    setIsRecruitmentOpen(true);
  }, []);

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
      <Navbar onOpenRecruitment={handleOpenJoinDirectly} />

      <main>
        <Hero />
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
    </div>
  );
}

export default App;