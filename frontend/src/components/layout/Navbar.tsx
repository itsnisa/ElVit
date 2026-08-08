import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/',               label: 'Beranda',      icon: '⌂', desc: 'Halaman utama ElvIT' },
  { to: '/self-assessment',label: 'Asesmen',       icon: '📋', desc: 'Kuesioner self-assessment' },
  { to: '/manual-input',   label: 'Manual Check',  icon: '✎',  desc: 'Input skill secara manual' },
  { to: '/about',          label: 'Tentang',       icon: '○',  desc: 'Tentang sistem & penelitian' },
]

export default function Navbar() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.mobile-menu') && !target.closest('.hamburger')) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  // Blur page content when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    if (menuOpen) {
      document.body.classList.add('menu-open')
    } else {
      document.body.classList.remove('menu-open')
    }
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('menu-open')
    }
  }, [menuOpen])

  return (
    <header className="navbar">
      <nav className="nav-inner">
        <Link to="/" className="logo" aria-label="ElvIT Home">
          <img src="src/assets/elvit-icon.svg" alt="ElvIT Logo" className="nav-logo-img" />
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          {NAV_ITEMS.map(({ to, label }) => (
            <Link key={to} to={to} className={location.pathname === to ? 'active' : ''}>
              {label}
            </Link>
          ))}
          <Link
            to="/scan-cv"
            className={`accent-link${location.pathname === '/scan-cv' ? ' active' : ''}`}
          >
            Scan CV
          </Link>
        </div>

        {/* Hamburger — prominent labeled button */}
        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={menuOpen}
        >
          <span className="hamburger-lines">
            <span /><span /><span />
          </span>
          <span className="hamburger-label">{menuOpen ? 'Tutup' : 'Menu'}</span>
        </button>
      </nav>

      {/* ── Mobile full-screen menu ── */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`} role="dialog" aria-modal="true">
        {/* Drawer header */}
        <div className="mm-header">
          <div className="mm-brand">
            <img src="src/assets/elvit-icon.svg" alt="ElvIT" className="mm-brand-logo" />
            <div className="mm-brand-meta">
              <span className="mm-brand-name">ElvIT</span>
              <span className="mm-brand-sub">Skill Gap Detection System</span>
            </div>
          </div>
          <button className="mm-close" onClick={() => setMenuOpen(false)} aria-label="Tutup menu">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Nav section */}
        <div className="mm-section-label">NAVIGASI</div>
        <nav className="mm-nav">
          {NAV_ITEMS.map(({ to, label, icon, desc }) => (
            <Link
              key={to}
              to={to}
              className={`mm-link${location.pathname === to ? ' mm-link--active' : ''}`}
            >
              <span className="mm-link-icon">{icon}</span>
              <span className="mm-link-body">
                <span className="mm-link-label">{label}</span>
                <span className="mm-link-desc">{desc}</span>
              </span>
              {location.pathname === to && <span className="mm-link-dot" />}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="mm-divider" />

        {/* CTA */}
        <div className="mm-cta-wrap">
          <div className="mm-cta-meta">
            <span className="mm-cta-badge">FITUR UTAMA</span>
            <p>Unggah CV dan deteksi skill gap kamu secara otomatis dalam hitungan detik.</p>
          </div>
          <Link
            to="/scan-cv"
            className={`mm-cta-btn${location.pathname === '/scan-cv' ? ' active' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Scan CV Sekarang
          </Link>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className={`mobile-backdrop${menuOpen ? ' open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
    </header>
  )
}

