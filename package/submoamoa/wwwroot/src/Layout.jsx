import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Main Page';
      case '/hot-zone': return 'Hot Zone';
      default: return 'Submoamoa';
    }
  };

  return (
    <div className="app-container">
      <header className="app-header glass">
        <div className="header-left">
          <span>{getPageTitle()}</span>
        </div>
        <div className="header-right">
          <button 
            className="btn" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            <span style={{ marginRight: '0.5rem', display: 'none' }} className="menu-text">Menu</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
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
          zIndex: 49
        }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><Link to="/" className="btn" style={{justifyContent: 'flex-start', width: '100%'}} onClick={() => setIsMenuOpen(false)}>Main Page</Link></li>
            <li><Link to="/hot-zone" className="btn" style={{justifyContent: 'flex-start', width: '100%'}} onClick={() => setIsMenuOpen(false)}>Hot Zone</Link></li>
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
