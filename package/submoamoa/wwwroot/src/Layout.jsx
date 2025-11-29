import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import menuIcon from './assets/menu-icon.svg';

const Layout = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Main Page';
    if (location.pathname === '/manual-control') return 'Manual Control';
    if (location.pathname === '/ai-agent') return 'AI Agent';
    if (location.pathname.startsWith('/settings')) return 'Settings';
    if (location.pathname === '/tutorials') return 'Tutorials';
    if (location.pathname === '/components-demo') return 'Components Demo';
    if (location.pathname === '/about') return 'About';
    return 'Submoamoa';
  };

  return (
    <div className="app-container">
      <header className="app-header glass">
        <div className="header-left">
          <span>{getPageTitle()}</span>
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
          width: '200px',
          padding: '1rem',
          borderLeft: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          zIndex: 49,
          maxHeight: 'calc(100vh - var(--header-height))',
          overflowY: 'auto'
        }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><Link to="/" className="btn" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => setIsMenuOpen(false)}>Main Page</Link></li>
            <li><Link to="/manual-control" className="btn" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => setIsMenuOpen(false)}>Manual Control</Link></li>
            <li><Link to="/ai-agent" className="btn" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => setIsMenuOpen(false)}>AI Agent</Link></li>
            <li>
              <div className="btn" style={{ justifyContent: 'flex-start', width: '100%', cursor: 'default', opacity: 0.8 }}>Settings</div>
              <ul style={{ listStyle: 'none', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><Link to="/settings/import-export" className="btn" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => setIsMenuOpen(false)}>Import / Export</Link></li>
                <li><Link to="/settings/motors" className="btn" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => setIsMenuOpen(false)}>Motors</Link></li>
                <li><Link to="/settings/ai-behavior" className="btn" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => setIsMenuOpen(false)}>AI Behavior</Link></li>
                <li><Link to="/settings/hot-zone" className="btn" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => setIsMenuOpen(false)}>Hot Zone</Link></li>
              </ul>
            </li>
            <li><Link to="/tutorials" className="btn" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => setIsMenuOpen(false)}>Tutorials</Link></li>
            <li><Link to="/components-demo" className="btn" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => setIsMenuOpen(false)}>Components Demo</Link></li>
            <li><Link to="/about" className="btn" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => setIsMenuOpen(false)}>About</Link></li>
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
