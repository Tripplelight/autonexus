// src/components/layout/Navbar.jsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Car, LogOut, Shield, Menu, X, Bell, Search } from 'lucide-react';
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQ.trim()) return;
    navigate(`/cars?search=${encodeURIComponent(searchQ)}`);
    setSearchQ('');
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  const navLink = "text-white/60 hover:text-white transition-colors text-sm font-medium";
  const active = "!text-brand-500";

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
          <NavLink to="/cars" className={({ isActive }) => `${navLink} ${isActive ? active : ''}`}>
            Browse Cars
          </NavLink>
          {token && <>
            <NavLink to="/favorites" className={({ isActive }) => `${navLink} ${isActive ? active : ''}`}>
              Saved
            </NavLink>
            <NavLink to="/account" className={({ isActive }) => `${navLink} ${isActive ? active : ''}`}>
              Account
            </NavLink>
          </>}
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin" className={({ isActive }) => `${navLink} ${isActive ? active : ''} relative flex items-center gap-1.5`}>
              <Shield size={14} /> Admin
              {pendingOrders > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingOrders > 9 ? '9+' : pendingOrders}
                </span>
              )}
            </NavLink>
          )}
        </div>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className='hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-brand-500/50 transition-colors'>
          <Search size={14} className='text-white/30 shrink-0' />
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder='Search cars...' className='bg-transparent text-sm text-white placeholder-white/25 focus:outline-none w-40 focus:w-56 transition-all duration-300' />
        </form>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {token ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/40">{user?.name?.split(' ')[0]}</span>
              <button onClick={handleLogout}
                className="btn-outline !px-4 !py-2 !text-sm flex items-center gap-1.5">
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

        {/* Mobile: right side icons */}
        <div className="md:hidden flex items-center gap-2">
          {user?.role === 'ADMIN' && pendingOrders > 0 && (
            <Link to="/admin" className="relative p-2">
              <Bell size={18} className="text-white/60" />
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-brand-500 text-white text-[9px] flex items-center justify-center font-bold">
                {pendingOrders > 9 ? '9+' : pendingOrders}
              </span>
            </Link>
          )}
          <button onClick={() => setSearchOpen(s => !s)} className='p-2 text-white/60 hover:text-white'>
            <Search size={18} />
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-white/60 hover:text-white">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      {searchOpen && (
        <div className='md:hidden px-4 py-3 border-t border-white/5 bg-dark-800'>
          <form onSubmit={handleSearch} className='flex gap-2'>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder='Search cars...' autoFocus
              className='input !py-2 !text-sm flex-1' />
            <button type='submit' className='btn-primary !px-4 !py-2 !text-sm'>Go</button>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-800 border-t border-white/5">
          <div className="px-4 py-4 space-y-1">
            {[
              { to: '/cars', label: 'Browse Cars' },
              ...(token ? [
                { to: '/favorites', label: 'Saved Cars' },
                { to: '/account', label: 'My Account' },
              ] : []),
              ...(user?.role === 'ADMIN' ? [{ to: '/admin', label: `Admin Panel${pendingOrders > 0 ? ` (${pendingOrders} pending)` : ''}`, admin: true }] : [])
            ].map(({ to, label, admin }) => (
              <NavLink key={to} to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-xl text-sm transition-colors ${isActive ? 'bg-brand-500/10 text-brand-400' : admin ? 'text-brand-400' : 'text-white/60 hover:text-white hover:bg-white/5'}`
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
                  <Link to="/login" onClick={() => setMenuOpen(false)}
                    className="flex-1 btn-outline !py-2.5 !text-sm text-center">Sign in</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}
                    className="flex-1 btn-primary !py-2.5 !text-sm text-center">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
