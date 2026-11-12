import React, { useState, useEffect } from 'react';
import { Header } from './components/public/Header';
import { Hero } from './components/public/Hero';
import { AboutSection } from './components/public/AboutSection';
import { CampusesSection } from './components/public/CampusesSection';
import { AcademicsSection } from './components/public/AcademicsSection';
import { TeachersSection } from './components/public/TeachersSection';
import { FacilitiesSection } from './components/public/FacilitiesSection';
import { GallerySection } from './components/public/GallerySection';
import { AdmissionSection } from './components/public/AdmissionSection';
import { NewsSection } from './components/public/NewsSection';
import { ContactSection } from './components/public/ContactSection';
import { Footer } from './components/public/Footer';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminLayout } from './components/admin/AdminLayout';

export default function App() {
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<string | null>(() => {
    try {
      return localStorage.getItem('bss_admin_user') || null;
    } catch {
      return null;
    }
  });

  const handleOpenAdminPortal = () => {
    if (adminUser) {
      setViewMode('admin');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = (userEmail: string) => {
    setAdminUser(userEmail);
    try {
      localStorage.setItem('bss_admin_user', userEmail);
    } catch {}
    setIsLoginModalOpen(false);
    setViewMode('admin');
  };

  const handleLogout = () => {
    setAdminUser(null);
    try {
      localStorage.removeItem('bss_admin_user');
    } catch {}
    setViewMode('public');
  };

  const handleNavigateSection = (sectionId: string) => {
    if (viewMode !== 'public') {
      setViewMode('public');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (viewMode === 'admin' && adminUser) {
    return (
      <AdminLayout
        userEmail={adminUser}
        onLogout={handleLogout}
        onReturnToWebsite={() => setViewMode('public')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Navigation Header */}
      <Header
        onOpenAdmin={handleOpenAdminPortal}
        onNavigateSection={handleNavigateSection}
      />

      {/* Main Public Website Sections */}
      <main className="flex-1">
        <Hero
          onApplyClick={() => handleNavigateSection('admissions')}
          onExploreCampuses={() => handleNavigateSection('campuses')}
          onOpenAdmin={handleOpenAdminPortal}
        />

        <AboutSection />

        <CampusesSection />

        <AcademicsSection />

        <TeachersSection />

        <FacilitiesSection />

        <GallerySection />

        <AdmissionSection />

        <NewsSection />

        <ContactSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenAdmin={handleOpenAdminPortal}
        onNavigateSection={handleNavigateSection}
      />

      {/* Admin Authentication Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
