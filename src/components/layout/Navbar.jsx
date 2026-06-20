import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaBars,
    FaBell,
    FaCalendarAlt,
    FaCalendarCheck,
    FaChartLine,
    FaCheckDouble,
    FaChevronDown,
    FaClipboardList,
    FaCog,
    FaCompass,
    FaEnvelope,
    FaHeart,
    FaHome,
    FaInfoCircle,
    FaPhone,
    FaPlane,
    FaShieldAlt,
    FaSignInAlt,
    FaSignOutAlt,
    FaSpinner,
    FaTicketAlt,
    FaTimes,
    FaUser,
    FaUserCircle,
    FaUserPlus,
} from 'react-icons/fa';

import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const {
        user,
        logout,
        isAdmin,
        isGuide,
        isGuideVerified,
        isTraveller,
    } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();

    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationLoading, setNotificationLoading] = useState(false);

    const profileRef = useRef(null);
    const notificationRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }

            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setIsOpen(false);
        setIsProfileOpen(false);
        setIsNotificationOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!user) return;

        fetchUnreadCount();

        const interval = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(interval);
    }, [user?.id]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get('/engagement/notifications/unread-count/');
            setUnreadCount(response.data?.unread_count || 0);
        } catch (error) {
            console.error('Unread notification count error:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            setNotificationLoading(true);

            const response = await axios.get('/engagement/notifications/');
            const list = Array.isArray(response.data)
                ? response.data
                : response.data?.results || [];

            setNotifications(list);
        } catch (error) {
            console.error('Notification fetch error:', error);
        } finally {
            setNotificationLoading(false);
        }
    };

    const toggleNotifications = () => {
        const nextState = !isNotificationOpen;
        setIsNotificationOpen(nextState);
        setIsProfileOpen(false);

        if (nextState) {
            fetchNotifications();
        }
    };

    const markNotificationRead = async (notification) => {
        if (notification.is_read) return;

        try {
            await axios.post(`/engagement/notifications/${notification.id}/read/`);

            setNotifications((prev) =>
                prev.map((item) =>
                    item.id === notification.id
                        ? { ...item, is_read: true }
                        : item
                )
            );

            fetchUnreadCount();
        } catch (error) {
            console.error('Mark notification read error:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await axios.post('/engagement/notifications/read-all/');

            setUnreadCount(0);
            setNotifications((prev) =>
                prev.map((item) => ({ ...item, is_read: true }))
            );
        } catch (error) {
            console.error('Mark all notifications read error:', error);
        }
    };

    const mainLinks = [
        { to: '/', label: 'Home', icon: FaHome },
        { to: '/destinations', label: 'Destinations', icon: FaCompass },
        { to: '/tours', label: 'Tours', icon: FaCalendarAlt },
        { to: '/about', label: 'About', icon: FaInfoCircle },
        ...(!isAdmin ? [{ to: '/contact', label: 'Contact', icon: FaPhone }] : []),
    ];

    const travellerLinks = [
        { to: '/traveller/dashboard', label: 'Dashboard', icon: FaChartLine },
        { to: '/my-bookings', label: 'My Bookings', icon: FaTicketAlt },
        { to: '/my-trips', label: 'My Trips', icon: FaPlane },
        { to: '/my-wishlist', label: 'Wishlist', icon: FaHeart },
    ];

    const guideLinks = [
        { to: '/guide/dashboard', label: 'Dashboard', icon: FaChartLine },
        { to: '/guide/tours', label: 'Manage Tours', icon: FaShieldAlt },
        { to: '/guide/availability', label: 'Availability', icon: FaCalendarCheck },
    ];

    const adminLinks = [
        { to: '/admin', label: 'Admin Panel', icon: FaCog },
        { to: '/admin/activity-logs', label: 'Activity Logs', icon: FaClipboardList },
        { to: '/admin/contact-messages', label: 'Messages', icon: FaEnvelope },
    ];

    const roleLinks = [
        ...(isTraveller ? travellerLinks : []),
        ...(isGuide && isGuideVerified ? guideLinks : []),
        ...(isAdmin ? adminLinks : []),
    ];

    const navbarWrapperClass = scrolled
        ? 'bg-white/92 text-dark-900 shadow-soft backdrop-blur-xl border-b border-slate-200/70'
        : 'bg-dark-950/75 text-white shadow-lg backdrop-blur-xl border-b border-white/10';

    const linkClass = (path) => {
        const active = isActive(path);

        if (scrolled) {
            return active
                ? 'bg-primary-50 text-primary-700 shadow-sm'
                : 'text-slate-700 hover:bg-slate-100 hover:text-primary-700';
        }

        return active
            ? 'bg-white/20 text-white shadow-sm'
            : 'text-white/95 hover:bg-white/15 hover:text-white';
    };

    const iconButtonClass = scrolled
        ? 'bg-slate-100 text-slate-700 hover:bg-primary-50 hover:text-primary-700'
        : 'bg-white/10 text-white hover:bg-white/20';

    const renderLinks = (links, mobile = false) =>
        links.map((link) => (
            <Link
                key={link.to}
                to={link.to}
                className={
                    mobile
                        ? 'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-primary-50 hover:text-primary-700'
                        : `nav-link px-2.5 py-2 xl:px-3 ${linkClass(link.to)}`
                }
            >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
            </Link>
        ));

    return (
        <header className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${navbarWrapperClass}`}>
            <nav className="mx-auto w-full max-w-[1720px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
                <div className="flex h-16 items-center justify-between gap-4">
                    <Link to="/" className="group flex shrink-0 items-center gap-3">
                        <div
                            className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg transition duration-300 group-hover:scale-105 ${
                                scrolled
                                    ? 'bg-travel-gradient'
                                    : 'bg-white/15 backdrop-blur-lg ring-1 ring-white/20'
                            }`}
                        >
                            <span className="text-xl">🌍</span>
                        </div>

                        <div className="leading-none">
                            <p className={`font-display text-xl font-extrabold leading-none tracking-tight ${scrolled ? 'text-primary-800' : 'text-white'}`}>
                                Colo Ghuri
                            </p>
                            <p className={`text-[11px] font-medium tracking-wide ${scrolled ? 'text-slate-500' : 'text-white/80'}`}>
                                Explore Bangladesh
                            </p>
                        </div>
                    </Link>

                    <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:gap-2 lg:flex">
                        {renderLinks(mainLinks)}

                        {roleLinks.length > 0 && (
                            <div className={`mx-1 h-6 w-px xl:mx-2 ${scrolled ? 'bg-slate-200' : 'bg-white/20'}`}></div>
                        )}

                        {renderLinks(roleLinks)}
                    </div>

                    <div className="hidden shrink-0 items-center gap-2 xl:gap-3 lg:flex">
                        {user ? (
                            <>
                                <div className="relative" ref={notificationRef}>
                                    <button
                                        type="button"
                                        onClick={toggleNotifications}
                                        className={`relative flex h-11 w-11 items-center justify-center rounded-2xl transition ${iconButtonClass}`}
                                        title="Notifications"
                                    >
                                        <FaBell />

                                        {unreadCount > 0 && (
                                            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {isNotificationOpen && (
                                        <div className="absolute right-0 z-[9999] mt-3 w-80 overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
                                            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                                                <div>
                                                    <h3 className="font-bold text-slate-900">
                                                        Notifications
                                                    </h3>
                                                    <p className="text-xs text-slate-500">
                                                        {unreadCount} unread
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={markAllRead}
                                                    className="rounded-xl bg-primary-50 p-2 text-primary-700 transition hover:bg-primary-100"
                                                    title="Mark all read"
                                                >
                                                    <FaCheckDouble />
                                                </button>
                                            </div>

                                            <div className="max-h-96 overflow-y-auto">
                                                {notificationLoading ? (
                                                    <div className="flex items-center justify-center gap-2 p-8 text-slate-500">
                                                        <FaSpinner className="animate-spin" />
                                                        Loading...
                                                    </div>
                                                ) : notifications.length === 0 ? (
                                                    <div className="p-8 text-center text-sm text-slate-500">
                                                        No notifications yet.
                                                    </div>
                                                ) : (
                                                    notifications.map((notification) => {
                                                        const content = (
                                                            <div
                                                                onClick={() => markNotificationRead(notification)}
                                                                className={`border-b border-slate-100 px-5 py-4 transition hover:bg-slate-50 ${
                                                                    notification.is_read ? 'bg-white' : 'bg-primary-50/70'
                                                                }`}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <span
                                                                        className={`mt-1 h-2.5 w-2.5 rounded-full ${
                                                                            notification.is_read ? 'bg-slate-300' : 'bg-primary-600'
                                                                        }`}
                                                                    ></span>

                                                                    <div>
                                                                        <p className="font-bold text-slate-900">
                                                                            {notification.title}
                                                                        </p>
                                                                        <p className="mt-1 text-sm text-slate-600">
                                                                            {notification.message}
                                                                        </p>
                                                                        <p className="mt-2 text-xs text-slate-400">
                                                                            {new Date(notification.created_at).toLocaleString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );

                                                        if (notification.link) {
                                                            return (
                                                                <Link
                                                                    key={notification.id}
                                                                    to={notification.link}
                                                                    onClick={() => setIsNotificationOpen(false)}
                                                                >
                                                                    {content}
                                                                </Link>
                                                            );
                                                        }

                                                        return (
                                                            <div key={notification.id}>
                                                                {content}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="relative" ref={profileRef}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsProfileOpen(!isProfileOpen);
                                            setIsNotificationOpen(false);
                                        }}
                                        className={`flex items-center gap-3 rounded-2xl px-3 py-2 transition ${
                                            scrolled ? 'hover:bg-slate-100' : 'bg-white/10 hover:bg-white/15'
                                        }`}
                                    >
                                        <div className="relative">
                                            {user.profile_picture ? (
                                                <img
                                                    src={user.profile_picture}
                                                    alt={user.username}
                                                    className="h-10 w-10 rounded-2xl border-2 border-white object-cover shadow-md"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-md">
                                                    <FaUser />
                                                </div>
                                            )}

                                            {isGuide && !isGuideVerified && (
                                                <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-amber-400 ring-2 ring-white"></span>
                                            )}
                                        </div>

                                        <div className="text-left">
                                            <p className={`text-sm font-bold leading-tight ${scrolled ? 'text-dark-800' : 'text-white'}`}>
                                                {user.username}
                                            </p>
                                            <p className={`text-xs capitalize ${scrolled ? 'text-slate-500' : 'text-white/80'}`}>
                                                {user.role}
                                            </p>
                                        </div>

                                        <FaChevronDown
                                            className={`text-xs transition ${
                                                isProfileOpen ? 'rotate-180' : ''
                                            } ${scrolled ? 'text-slate-600' : 'text-white/80'}`}
                                        />
                                    </button>

                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-3 w-72 animate-slide-down overflow-hidden rounded-3xl border border-white bg-white shadow-2xl">
                                            <div className="bg-soft-gradient p-5">
                                                <div className="flex items-center gap-3">
                                                    {user.profile_picture ? (
                                                        <img
                                                            src={user.profile_picture}
                                                            alt={user.username}
                                                            className="h-14 w-14 rounded-2xl object-cover ring-4 ring-white"
                                                        />
                                                    ) : (
                                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-travel-gradient text-white ring-4 ring-white">
                                                            <FaUser />
                                                        </div>
                                                    )}

                                                    <div className="min-w-0">
                                                        <p className="truncate font-bold text-dark-900">
                                                            {user.username}
                                                        </p>
                                                        <p className="truncate text-xs text-slate-500">
                                                            {user.email}
                                                        </p>
                                                        <span className="badge badge-primary mt-2 capitalize">
                                                            {user.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-2">
                                                <ProfileMenuLink to="/profile" icon={FaUserCircle} title="My Profile" subtitle="View and edit profile" />

                                                {isTraveller && (
                                                    <>
                                                        <ProfileMenuLink to="/traveller/dashboard" icon={FaChartLine} title="Dashboard" subtitle="Traveller overview" />
                                                        <ProfileMenuLink to="/my-bookings" icon={FaTicketAlt} title="My Bookings" subtitle="View your bookings" />
                                                        <ProfileMenuLink to="/my-trips" icon={FaPlane} title="My Trips" subtitle="Plan your trips" />
                                                        <ProfileMenuLink to="/my-wishlist" icon={FaHeart} title="Wishlist" subtitle="Saved destinations and tours" />
                                                    </>
                                                )}

                                                {isGuide && isGuideVerified && (
                                                    <>
                                                        <ProfileMenuLink to="/guide/dashboard" icon={FaChartLine} title="Dashboard" subtitle="View group performance" />
                                                        <ProfileMenuLink to="/guide/tours" icon={FaShieldAlt} title="Manage Tours" subtitle="Create and manage tours" />
                                                        <ProfileMenuLink to="/guide/availability" icon={FaCalendarCheck} title="Availability" subtitle="Manage guide calendar" />
                                                    </>
                                                )}

                                                {isAdmin && (
                                                    <>
                                                        <ProfileMenuLink to="/admin" icon={FaCog} title="Admin Panel" subtitle="Manage platform" />
                                                        <ProfileMenuLink to="/admin/activity-logs" icon={FaClipboardList} title="Activity Logs" subtitle="Monitor actions" />
                                                        <ProfileMenuLink to="/admin/contact-messages" icon={FaEnvelope} title="Messages" subtitle="View user messages" />
                                                    </>
                                                )}

                                                {isGuide && !isGuideVerified && (
                                                    <div className="m-2 rounded-2xl bg-amber-50 p-3 text-xs text-amber-700">
                                                        Your guide account is waiting for admin verification.
                                                    </div>
                                                )}

                                                <div className="my-2 border-t border-slate-100"></div>

                                                <button
                                                    type="button"
                                                    onClick={handleLogout}
                                                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                                >
                                                    <FaSignOutAlt />
                                                    <div className="text-left">
                                                        <p>Logout</p>
                                                        <p className="text-xs text-red-400">Sign out of your account</p>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className={`nav-link ${
                                        scrolled
                                            ? 'text-slate-700 hover:bg-slate-100'
                                            : 'text-white/95 hover:bg-white/15'
                                    }`}
                                >
                                    <FaSignInAlt />
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className={
                                        scrolled
                                            ? 'btn-primary px-4 py-2 text-sm'
                                            : 'inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-primary-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-primary-50'
                                    }
                                >
                                    <FaUserPlus />
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl transition lg:hidden ${
                            scrolled
                                ? 'bg-slate-100 text-dark-800'
                                : 'bg-white/15 text-white backdrop-blur-lg ring-1 ring-white/20'
                        }`}
                    >
                        {isOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                {isOpen && (
                    <div className="animate-slide-down pb-4 lg:hidden">
                        <div className="rounded-3xl border border-white/70 bg-white p-3 shadow-2xl">
                            <div className="space-y-1">
                                {renderLinks(mainLinks, true)}

                                {roleLinks.length > 0 && (
                                    <div className="my-2 border-t border-slate-100"></div>
                                )}

                                {renderLinks(roleLinks, true)}
                            </div>

                            <div className="mt-3 border-t border-slate-100 pt-3">
                                {user ? (
                                    <>
                                        <div className="mb-2 rounded-2xl bg-slate-50 px-4 py-3">
                                            <p className="text-sm font-bold text-dark-800">
                                                {user.username}
                                            </p>
                                            <p className="text-xs capitalize text-slate-500">
                                                {user.role}
                                            </p>
                                        </div>

                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-primary-50"
                                        >
                                            <FaUserCircle />
                                            Profile
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleLogout();
                                                setIsOpen(false);
                                            }}
                                            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                                        >
                                            <FaSignOutAlt />
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        <Link to="/login" className="btn-secondary py-2 text-sm">
                                            Login
                                        </Link>
                                        <Link to="/register" className="btn-primary py-2 text-sm">
                                            Register
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

const ProfileMenuLink = ({ to, icon: Icon, title, subtitle }) => {
    return (
        <Link
            to={to}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-primary-50 hover:text-primary-700"
        >
            <Icon className="h-5 w-5 text-primary-600" />

            <div>
                <p>{title}</p>
                {subtitle && (
                    <p className="text-xs font-normal text-slate-500">
                        {subtitle}
                    </p>
                )}
            </div>
        </Link>
    );
};

export default Navbar;