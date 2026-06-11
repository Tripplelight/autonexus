// src/components/layout/Navbar.jsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Car, LogOut, Shield, X, Search, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { usePendingOrders } from '../../hooks/usePendingOrders';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const { user, token, logout } = useAuthStore();
  const pendingOrders = usePendingOrders();
  const navigate = useNavigate();

  const isDealer = user?.role === 'DEALER';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };
  const close = () => setMenuOpen(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQ.trim()) return;
    navigate(`/cars?search=${encodeURIComponent(searchQ)}`);
    setSearchQ(''); setSearchOpen(false); close();
  };

  const navLink = "text-white/60 hover:text-white transition-colors text-sm font-medium";
  const active = "!text-brand-500";

  const mainLinks = [
    { to: '/cars', label: 'Browse Cars' },
    ...(token && !isDealer && !isSuperAdmin ? [{ to: '/favorites', label: 'Saved Cars' }] : []),
    ...(token && !isSuperAdmin ? [{ to: '/account', label: 'Account' }] : []),
    ...(isDealer ? [{ to: '/dealer/dashboard', label: 'Dashboard' }] : []),
    ...(isSuperAdmin ? [{ to: '/admin', label: 'Admin Panel' }] : []),
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-dark-900/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Car size={16} className="text-white" />
            </div>
            <span className="font-display text-xl tracking-wider text-white">AUTONEXUS</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/cars" className={({ isActive }) => `${navLink} ${isActive ? active : ''}`}>Browse Cars</NavLink>
            {token && !isDealer && !isSuperAdmin && (
              <NavLink to="/favorites" className={({ isActive }) => `${navLink} ${isActive ? active : ''}`}>Saved</NavLink>
            )}
            {token && !isSuperAdmin && (
              <NavLink to="/account" className={({ isActive }) => `${navLink} ${isActive ? active : ''}`}>Account</NavLink>
            )}
            {isDealer && (
              <NavLink to="/dealer/dashboard" className={({ isActive }) => `${navLink} ${isActive ? active : ''} flex items-center gap-1.5`}>
                <LayoutDashboard size={14} /> Dashboard
              </NavLink>
            )}
            {isSuperAdmin && (
              <NavLink to="/admin" className={({ isActive }) => `${navLink} ${isActive ? active : ''} flex items-center gap-1.5`}>
                <Shield size={14} /> Admin
                {pendingOrders > 0 && (
                  <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {pendingOrders > 9 ? '9+' : pendingOrders}
                  </span>
                )}
              </NavLink>
            )}
            <div className="relative group">
              <button className={`${navLink} flex items-center gap-1`}>More <span className="text-white/30 text-xs">↓</span></button>
              <div className="absolute top-full right-0 mt-2 w-44 bg-dark-800 border border-white/10 rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 shadow-xl">
                <Link to="/about" className="block px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">About Us</Link>
                <Link to="/contact" className="block px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors border-t border-white/5">Contact</Link>
              </div>
            </div>
            {!token && (
              <Link to="/become-a-dealer" className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
                List Your Cars →
              </Link>
            )}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-brand-500/50 transition-colors">
              <Search size={14} className="text-white/30 shrink-0" />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search cars..." className="bg-transparent text-sm text-white placeholder-white/25 focus:outline-none w-36 focus:w-52 transition-all duration-300" />
            </form>
            {token ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/40">{user?.name?.split(' ')[0]}</span>
                <button onClick={handleLogout} className="btn-outline !px-4 !py-2 !text-sm flex items-center gap-1.5">
                  <LogOut size={13} /> Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className={navLink}>Sign in</Link>
                <Link to="/register" className="btn-primary !px-4 !py-2 !text-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile right */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={() => setSearchOpen(s => !s)} className="p-2 text-white/60 hover:text-white">
              <Search size={18} />
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: '5px', width: '36px', height: '36px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <span style={{ display: 'block', width: '20px', height: '1.5px', background: 'rgba(255,255,255,0.6)', borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '13px', height: '1.5px', background: 'rgba(255,255,255,0.6)', borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '20px', height: '1.5px', background: 'rgba(255,255,255,0.6)', borderRadius: '2px' }} />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="md:hidden px-4 py-3 border-t border-white/5 bg-dark-800">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search cars..." autoFocus className="input !py-2 !text-sm flex-1" />
              <button type="submit" className="btn-primary !px-4 !py-2 !text-sm">Go</button>
            </form>
          </div>
        )}
      </nav>

      {/* Full-screen overlay — 100% inline styles, no Tailwind */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', height: '100vh',
          zIndex: 9999,
          background: 'rgba(8, 8, 12, 0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column',
          padding: '24px 28px',
          boxSizing: 'border-box',
        }}>
          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48px' }}>
            <Link to="/" onClick={close} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{ width: '32px', height: '32px', background: '#f97316', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Car size={16} color="white" />
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 700, letterSpacing: '3px', color: 'white' }}>AUTONEXUS</span>
            </Link>
            <button onClick={close} style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.5)'
            }}>
              <X size={18} />
            </button>
          </div>

          {/* Main links */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {mainLinks.map(({ to, label }, i) => (
              <NavLink key={to} to={to} onClick={close} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '18px 0',
                borderBottom: '0.5px solid rgba(255,255,255,0.06)',
                textDecoration: 'none',
                color: isActive ? '#f97316' : 'white',
              })}>
                <span style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1 }}>{label}</span>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '18px' }}>→</span>
              </NavLink>
            ))}

            {/* Secondary */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '28px' }}>
              <Link to="/about" onClick={close} style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', textDecoration: 'none' }}>About Us</Link>
              <Link to="/contact" onClick={close} style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', textDecoration: 'none' }}>Contact</Link>
            </div>
          </div>

          {/* Bottom */}
          <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {!token && (
              <Link to="/become-a-dealer" onClick={close} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 16px', borderRadius: '12px',
                border: '0.5px solid rgba(249,115,22,0.25)',
                background: 'rgba(249,115,22,0.06)',
                textDecoration: 'none', fontSize: '13px', color: '#f97316'
              }}>
                List Your Cars → <span style={{ fontWeight: 600 }}>Become a Dealer</span>
              </Link>
            )}
            {token ? (
              <button onClick={handleLogout} style={{
                width: '100%', padding: '13px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.4)', fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                <LogOut size={14} /> Sign out
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <Link to="/login" onClick={close} style={{
                  flex: 1, padding: '13px', borderRadius: '12px', textAlign: 'center',
                  border: '0.5px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none', fontSize: '13px'
                }}>Sign in</Link>
                <Link to="/register" onClick={close} style={{
                  flex: 1, padding: '13px', borderRadius: '12px', textAlign: 'center',
                  background: '#f97316', color: 'white', fontWeight: 600,
                  textDecoration: 'none', fontSize: '13px'
                }}>Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}