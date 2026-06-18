import { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 18);
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    const publicLinks = [
        { to: '/', label: 'Accueil' },
        { to: '/leaderboard', label: 'Classement' }
    ];

    const privateLinks = [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/matches', label: 'Matches' },
        { to: '/predict-24h', label: 'Predire 24h' },
        { to: '/my-predictions', label: 'Mes pronos' }
    ];

    const links = user ? [...publicLinks, ...privateLinks] : publicLinks;

    const isActive = (path) => location.pathname === path;

    return (
        <motion.nav
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45 }}
            className={`sticky top-0 z-50 border-b transition-all duration-300 ${
                scrolled
                    ? 'border-[#295b38]/60 bg-[#0b1c12]/92 backdrop-blur-xl'
                    : 'border-transparent bg-[#0b1c12]/78 backdrop-blur'
            }`}
        >
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link to="/" className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-[#5eaf70]/40 bg-[#12311c] shadow-lg shadow-green-950/20">
                        <img src="/logo.png" alt="FootBattle logo" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <div className="font-display text-xl uppercase leading-none text-[#f3fff0]">
                            FootBattle
                        </div>
                        <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.24em] text-[#86a08d]">
                            World Cup 2026
                        </div>
                    </div>
                </Link>

                <div className="hidden items-center gap-2 lg:flex">
                    {links.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`rounded-full px-3 py-2 text-[13px] font-bold transition ${
                                isActive(link.to)
                                    ? 'border border-[#5eaf70]/45 bg-[#173825] text-[#bff0c8]'
                                    : 'text-[#d9e9dc] hover:bg-[#173825] hover:text-[#bff0c8]'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="hidden items-center gap-3 lg:flex">
                    {user ? (
                        <>
                            <div className="rounded-full border border-[#4e7f59]/40 bg-[#12311c] px-4 py-2 text-[13px] font-bold text-[#edf7ef] shadow-sm">
                                {user.name}
                            </div>
                            <button
                                onClick={logout}
                                className="rounded-full border border-[#5eaf70]/35 bg-[#1f7a36] px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#256f38]"
                            >
                                Deconnexion
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="rounded-full px-4 py-2 text-[13px] font-bold text-[#d9e9dc] transition hover:bg-[#173825] hover:text-[#bff0c8]">
                                Connexion
                            </Link>
                            <Link to="/register" className="rounded-full border border-[#5eaf70]/35 bg-[#1f7a36] px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#256f38]">
                                Inscription
                            </Link>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setMenuOpen((value) => !value)}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#4e7f59]/40 bg-[#12311c] text-[#bff0c8] shadow-sm lg:hidden"
                    aria-label="Ouvrir le menu"
                >
                    <div className="space-y-1.5">
                        <span className={`block h-0.5 w-5 bg-current transition ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
                        <span className={`block h-0.5 w-5 bg-current transition ${menuOpen ? 'opacity-0' : ''}`} />
                        <span className={`block h-0.5 w-5 bg-current transition ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
                    </div>
                </button>
            </div>

            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-[#295b38]/60 bg-[#0b1c12] lg:hidden"
                    >
                        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
                            <div className="grid gap-2">
                                {links.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`rounded-2xl px-4 py-3 text-[13px] font-bold transition ${
                                            isActive(link.to)
                                                ? 'border border-[#5eaf70]/45 bg-[#173825] text-[#bff0c8]'
                                                : 'border border-[#23472f] bg-[#12311c] text-[#edf7ef] shadow-sm'
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-4 grid gap-2">
                                {user ? (
                                    <>
                                        <div className="rounded-2xl border border-[#4e7f59]/40 bg-[#12311c] px-4 py-3 text-[13px] font-bold text-[#edf7ef] shadow-sm">
                                            Connecte: {user.name}
                                        </div>
                                        <button
                                            onClick={logout}
                                            className="rounded-2xl border border-[#5eaf70]/35 bg-[#1f7a36] px-4 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white"
                                        >
                                            Deconnexion
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" className="rounded-2xl border border-[#4e7f59]/40 bg-[#12311c] px-4 py-3 text-[13px] font-bold text-[#edf7ef] shadow-sm">
                                            Connexion
                                        </Link>
                                        <Link to="/register" className="rounded-2xl border border-[#5eaf70]/35 bg-[#1f7a36] px-4 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white">
                                            Inscription
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
