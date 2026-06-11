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

  // Lock body scroll when menu open
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
    setSearchQ(''); setSearchOpen(false); setMenuOpen(false);
  };

  const navLink = "text-white/60 hover:text-white transition-colors text-sm font-medium";
  const active = "!text-brand-500";

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
              <NavLink to="/admin" className={({ isActive }) => `${navLink} ${isActive ? active : ''} relative flex items-center gap-1.5`}>
                <Shield size={14} /> Admin
                {pendingOrders > 0 && (
                  <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {pendingOrders > 9 ? '9+' : pendingOrders}
                  </span>
                )}
              </NavLink>
            )}
            {/* About & Contact — desktop popover trigger */}
            <div className="relative group">
              <button className={`${navLink} flex items-center gap-1`}>
                More <span className="text-white/30 text-xs">↓</span>
              </button>
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
            {/* Animated hamburger */}
            <button onClick={() => setMenuOpen(true)}
              className="p-2 text-white/60 hover:text-white flex flex-col gap-[5px] items-center justify-center w-9 h-9">
              <span className="block w-5 h-[1.5px] bg-white/60 rounded-full" />
              <span className="block w-3.5 h-[1.5px] bg-white/60 rounded-full self-end" />
              <span className="block w-5 h-[1.5px] bg-white/60 rounded-full" />
            </button>
          </div>
        </div>

        {/* Mobile Search bar */}
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

      {/* Full-screen mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-dark-900 flex flex-col px-6 py-6 md:hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-10">
            <Link to="/" onClick={close} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <Car size={16} className="text-white" />
              </div>
              <span className="font-display text-xl tracking-wider text-white">AUTONEXUS</span>
            </Link>
            <button onClick={close} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Big links */}
          <div className="flex-1 flex flex-col justify-center gap-1">
            {[
              { to: '/cars', label: 'Browse Cars' },
              ...(token && !isDealer && !isSuperAdmin ? [{ to: '/favorites', label: 'Saved Cars' }] : []),
              ...(token && !isSuperAdmin ? [{ to: '/account', label: 'Account' }] : []),
              ...(isDealer ? [{ to: '/dealer/dashboard', label: 'Dashboard' }] : []),
              ...(isSuperAdmin ? [{ to: '/admin', label: 'Admin Panel' }] : []),
            ].map(({ to, label }) => (
              <NavLink key={to} to={to} onClick={close}
                className={({ isActive }) =>
                  `flex items-center justify-between py-4 border-b border-white/5 group ${isActive ? 'text-brand-400' : 'text-white'}`
                }>
                <span className="text-2xl font-semibold tracking-tight">{label}</span>
                <span className="text-white/20 group-hover:text-white/60 transition-colors text-lg">→</span>
              </NavLink>
            ))}

            {/* Secondary links */}
            <div className="mt-4 flex gap-6">
              <Link to="/about" onClick={close} className="text-white/30 hover:text-white/60 text-sm transition-colors">About Us</Link>
              <Link to="/contact" onClick={close} className="text-white/30 hover:text-white/60 text-sm transition-colors">Contact</Link>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="space-y-3 pt-6 border-t border-white/5">
            {!token && (
              <Link to="/become-a-dealer" onClick={close}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-brand-500/20 bg-brand-500/5 text-brand-400 text-sm">
                List Your Cars → <span className="text-brand-500 font-medium">Become a Dealer</span>
              </Link>
            )}
            {token ? (
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm hover:text-white transition-colors">
                <LogOut size={14} /> Sign out
              </button>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" onClick={close} className="flex-1 btn-outline !py-3 text-center text-sm">Sign in</Link>
                <Link to="/register" onClick={close} className="flex-1 btn-primary !py-3 text-center text-sm">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}