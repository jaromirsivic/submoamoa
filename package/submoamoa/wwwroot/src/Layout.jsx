import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import menuIcon from './assets/menu-icon.svg';

// Import icons
import mainPageIcon from './assets/icons/mainPage.svg';
import manualControlIcon from './assets/icons/manualControl.svg';
import aiAgentIcon from './assets/icons/aiAgent.svg';
import settingsIcon from './assets/icons/settings.svg';
import importExportIcon from './assets/icons/importExport.svg';
import motorsIcon from './assets/icons/motors.svg';
import aiBehaviorIcon from './assets/icons/aiBehavior.svg';
import hotZoneIcon from './assets/icons/hotZone.svg';
import cameraIcon from './assets/icons/camera.svg';
import tutorialsIcon from './assets/icons/tutorials.svg';
import componentsDemoIcon from './assets/icons/mainPage.svg'; // Using mainPage icon as fallback for Components Demo
import aboutIcon from './assets/icons/about.svg';
import modalWindowsIcon from './assets/icons/tip.svg';

const Layout = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Main Page', icon: mainPageIcon };
    if (path === '/manual-control') return { title: 'Manual Control', icon: manualControlIcon };
    if (path === '/ai-agent') return { title: 'AI Agent', icon: aiAgentIcon };
    if (path.startsWith('/settings')) {
      if (path === '/settings/import-export') return { title: 'Import / Export', icon: importExportIcon };
      if (path === '/settings/motors') return { title: 'Motors', icon: motorsIcon };
      if (path === '/settings/ai-behavior') return { title: 'AI Behavior', icon: aiBehaviorIcon };
      if (path === '/settings/ai-behavior') return { title: 'AI Behavior', icon: aiBehaviorIcon };
      if (path === '/settings/hot-zone') return { title: 'Hot Zone', icon: hotZoneIcon };
      if (path === '/settings/camera') return { title: 'Camera', icon: cameraIcon };
      return { title: 'Settings', icon: settingsIcon };
    }
    if (path.startsWith('/sandbox')) {
      if (path === '/sandbox/components-demo') return { title: 'Components Demo', icon: componentsDemoIcon };
      if (path === '/sandbox/modal-windows-demo') return { title: 'Modal Windows Demo', icon: modalWindowsIcon };
      if (path === '/sandbox/editable-chart') return { title: 'Editable Chart', icon: componentsDemoIcon };
      return { title: 'Developers Sandbox', icon: manualControlIcon };
    }
    if (path === '/tutorials') return { title: 'Tutorials', icon: tutorialsIcon };
    if (path === '/about') return { title: 'About', icon: aboutIcon };
    return { title: 'Submoamoa', icon: null };
  };

  const { title, icon } = getPageInfo();

  const MenuLink = ({ to, icon, label, onClick }) => (
    <Link
      to={to}
      className="btn"
      style={{ justifyContent: 'flex-start', width: '100%', gap: '0.75rem' }}
      onClick={onClick}
    >
      {icon && <img src={icon} alt="" width="24" height="24" />}
      {label}
    </Link>
  );

  return (
    <div className="app-container">
      <header className="app-header glass">
        <div className="header-left">
          {icon && <img src={icon} alt="" width="24" height="24" />}
          <span>{title}</span>
        </div>
        <div className="header-right">
          <button
            className="btn menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            <span style={{ marginRight: '0.5rem', display: 'none' }} className="menu-text">Menu</span>
            <img src={menuIcon} alt="Menu" width="24" height="24" />
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <nav className="mobile-menu glass" style={{
          position: 'fixed',
          top: 'var(--header-height)',
          right: 0,
          width: '250px', // Increased width for icons
          padding: '1rem',
          borderLeft: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          zIndex: 49,
          maxHeight: 'calc(100vh - var(--header-height))',
          overflowY: 'auto'
        }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><MenuLink to="/" icon={mainPageIcon} label="Main Page" onClick={() => setIsMenuOpen(false)} /></li>
            <li><MenuLink to="/manual-control" icon={manualControlIcon} label="Manual Control" onClick={() => setIsMenuOpen(false)} /></li>
            <li><MenuLink to="/ai-agent" icon={aiAgentIcon} label="AI Agent" onClick={() => setIsMenuOpen(false)} /></li>
            <li>
              <div className="btn" style={{ justifyContent: 'flex-start', width: '100%', cursor: 'default', opacity: 0.8, gap: '0.75rem' }}>
                <img src={settingsIcon} alt="" width="24" height="24" />
                Settings
              </div>
              <ul style={{ listStyle: 'none', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <li><MenuLink to="/settings/import-export" icon={importExportIcon} label="Import / Export" onClick={() => setIsMenuOpen(false)} /></li>
                <li><MenuLink to="/settings/motors" icon={motorsIcon} label="Motors" onClick={() => setIsMenuOpen(false)} /></li>
                <li><MenuLink to="/settings/ai-behavior" icon={aiBehaviorIcon} label="AI Behavior" onClick={() => setIsMenuOpen(false)} /></li>
                <li><MenuLink to="/settings/hot-zone" icon={hotZoneIcon} label="Hot Zone" onClick={() => setIsMenuOpen(false)} /></li>
                <li><MenuLink to="/settings/camera" icon={cameraIcon} label="Camera" onClick={() => setIsMenuOpen(false)} /></li>
              </ul>
            </li>
            <li><MenuLink to="/tutorials" icon={tutorialsIcon} label="Tutorials" onClick={() => setIsMenuOpen(false)} /></li>
            <li>
              <div className="btn" style={{ justifyContent: 'flex-start', width: '100%', cursor: 'default', opacity: 0.8, gap: '0.75rem' }}>
                <img src={manualControlIcon} alt="" width="24" height="24" />
                Developers Sandbox
              </div>
              <ul style={{ listStyle: 'none', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <li><MenuLink to="/sandbox/components-demo" icon={componentsDemoIcon} label="Components Demo" onClick={() => setIsMenuOpen(false)} /></li>
                <li><MenuLink to="/sandbox/modal-windows-demo" icon={modalWindowsIcon} label="Modal Windows Demo" onClick={() => setIsMenuOpen(false)} /></li>
                <li><MenuLink to="/sandbox/editable-chart" icon={componentsDemoIcon} label="Editable Chart" onClick={() => setIsMenuOpen(false)} /></li>
              </ul>
            </li>
            <li><MenuLink to="/about" icon={aboutIcon} label="About" onClick={() => setIsMenuOpen(false)} /></li>
          </ul>
        </nav>
      )}

      <main className="main-content">
        <Outlet />
      </main>

      <style>{`
        @media (min-width: 640px) {
          .menu-text {
            display: inline !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
