// src/components/layout/Navbar.jsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Car, LogOut, Shield, Menu, X, Bell, Search, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { usePendingOrders } from '../../hooks/usePendingOrders';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const { user, token, logout } = useAuthStore();
  const pendingOrders = usePendingOrders();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQ.trim()) return;
    navigate(`/cars?search=${encodeURIComponent(searchQ)}`);
    setSearchQ(''); setSearchOpen(false); setMenuOpen(false);
  };

  const navLink = "text-white/60 hover:text-white transition-colors text-sm font-medium";
  const active = "!text-brand-500";

  const isDealer = user?.role === 'DEALER';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
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
          {token && (
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
          {!token && (
            <Link to="/become-a-dealer" className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
              List Your Cars →
            </Link>
          )}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          {/* Search */}
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
          {isSuperAdmin && pendingOrders > 0 && (
            <Link to="/admin" className="relative p-2">
              <Bell size={18} className="text-white/60" />
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-brand-500 text-white text-[9px] flex items-center justify-center font-bold">
                {pendingOrders > 9 ? '9+' : pendingOrders}
              </span>
            </Link>
          )}
          <button onClick={() => setSearchOpen(s => !s)} className="p-2 text-white/60 hover:text-white">
            <Search size={18} />
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-white/60 hover:text-white">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
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

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-800 border-t border-white/5">
          <div className="px-4 py-4 space-y-1">
            {[
              { to: '/cars', label: 'Browse Cars' },
              ...(token && !isDealer && !isSuperAdmin ? [{ to: '/favorites', label: 'Saved Cars' }] : []),
              ...(token ? [{ to: '/account', label: 'My Account' }] : []),
              ...(isDealer ? [{ to: '/dealer/dashboard', label: 'My Dashboard' }] : []),
              ...(isSuperAdmin ? [{ to: '/admin', label: `Admin Panel${pendingOrders > 0 ? ` (${pendingOrders})` : ''}`, admin: true }] : []),
              ...(!token ? [{ to: '/become-a-dealer', label: 'List Your Cars →', dealer: true }] : [])
            ].map(({ to, label, admin, dealer }) => (
              <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-xl text-sm transition-colors ${isActive ? 'bg-brand-500/10 text-brand-400' : admin ? 'text-brand-400' : dealer ? 'text-brand-400' : 'text-white/60 hover:text-white hover:bg-white/5'}`
                }>
                {label}
              </NavLink>
            ))}

            <div className="pt-3 border-t border-white/5 mt-3">
              {token ? (
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/40 hover:text-white rounded-xl hover:bg-white/5 transition-colors">
                  <LogOut size={14} /> Sign out
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 btn-outline !py-2.5 !text-sm text-center">Sign in</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 btn-primary !py-2.5 !text-sm text-center">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}