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
import PassesAdminDashboard from './components/PassesAdminDashboard';
import FreshersPass from './components/FreshersPass';
import { ArrowUpRight } from 'lucide-react';

function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isPassesAdminRoute, setIsPassesAdminRoute] = useState(false);
  const [isFreshersRoute, setIsFreshersRoute] = useState(false);
  const [isRecruitmentOpen, setIsRecruitmentOpen] = useState(false);
  const [recruitmentMode, setRecruitmentMode] = useState('teaser');

  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname.replace(/\/+$/, '') || '/';
      if (path === '/admin/passes') {
        setIsPassesAdminRoute(true);
        setIsAdminRoute(false);
        setIsFreshersRoute(false);
        return;
      }
      if (path === '/admin') {
        setIsAdminRoute(true);
        setIsPassesAdminRoute(false);
        setIsFreshersRoute(false);
        return;
      }
      if (path === '/freshers-pass' || path === '/freshers') {
        setIsFreshersRoute(true);
        setIsAdminRoute(false);
        setIsPassesAdminRoute(false);
        return;
      }
      setIsAdminRoute(false);
      setIsPassesAdminRoute(false);
      setIsFreshersRoute(false);

      // Otherwise show recruitment teaser popup on home page load
      setRecruitmentMode('teaser');
      setIsRecruitmentOpen(true);
    };

    checkRoute();

    const handlePopState = () => {
      const path = window.location.pathname.replace(/\/+$/, '') || '/';
      setIsPassesAdminRoute(path === '/admin/passes');
      setIsAdminRoute(path === '/admin');
      setIsFreshersRoute(path === '/freshers-pass' || path === '/freshers');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // If on passes admin route, render PassesAdminDashboard directly
  if (isPassesAdminRoute) {
    return <PassesAdminDashboard />;
  }

  // If on admin route, render Admin Dashboard directly
  if (isAdminRoute) {
    return <AdminDashboard />;
  }

  // If on Freshers Party Pass route, render FreshersPass directly
  if (isFreshersRoute) {
    return (
      <FreshersPass 
        onBackToHome={() => {
          window.history.pushState({}, '', '/');
          setIsFreshersRoute(false);
          setIsRecruitmentOpen(false);
        }} 
      />
    );
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
        onNavigateToFreshers={() => {
          setIsRecruitmentOpen(false);
          window.history.pushState({}, '', '/freshers-pass');
          setIsFreshersRoute(true);
        }}
      />

      {/* Floating Freshers Party Pass Luxury CTA */}
      <a
        href="/freshers-pass"
        onClick={(e) => {
          e.preventDefault();
          window.history.pushState({}, '', '/freshers-pass');
          setIsFreshersRoute(true);
        }}
        className="fixed bottom-6 right-6 z-40 group flex items-center gap-3 px-4 py-3 bg-zinc-950/90 hover:bg-zinc-900 border border-amber-500/40 hover:border-amber-400 text-white rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.25)] backdrop-blur-xl transition-all duration-300 hover:scale-105 select-none"
        aria-label="Book Freshers Party Pass"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-black text-sm shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.6)]">
          🎟️
        </div>
        <div className="flex flex-col text-left pr-1">
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-amber-400 font-bold">NOV 7 • FINN CLUB</span>
          <span className="text-xs font-black uppercase tracking-wider text-white">Freshers Pass</span>
        </div>
        <ArrowUpRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </a>
    </div>
  );
}

export default App;