import React, { useEffect, useRef, useState } from 'react';
import { FaBell, FaCheckDouble, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const NotificationBell = () => {
    const { isAuthenticated } = useAuth();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        fetchUnreadCount();

        const interval = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(interval);
    }, [isAuthenticated]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get('/engagement/notifications/unread-count/');
            setUnreadCount(response.data.unread_count || 0);
        } catch (error) {
            console.error('Unread count error:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/engagement/notifications/');
            setNotifications(Array.isArray(response.data) ? response.data : response.data.results || []);
        } catch (error) {
            console.error('Notification fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleOpen = () => {
        const next = !open;
        setOpen(next);

        if (next) {
            fetchNotifications();
        }
    };

    const markAllRead = async () => {
        try {
            await axios.post('/engagement/notifications/read-all/');
            setUnreadCount(0);
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Mark all read error:', error);
        }
    };

    const markOneRead = async (notification) => {
        if (notification.is_read) return;

        try {
            await axios.post(`/engagement/notifications/${notification.id}/read/`);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notification.id ? { ...n, is_read: true } : n
                )
            );
            fetchUnreadCount();
        } catch (error) {
            console.error('Mark read error:', error);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleOpen}
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20"
                title="Notifications"
            >
                <FaBell />

                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 z-[9999]">
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
                            onClick={markAllRead}
                            className="rounded-xl bg-primary-50 p-2 text-primary-700 transition hover:bg-primary-100"
                            title="Mark all read"
                        >
                            <FaCheckDouble />
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
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
                                        onClick={() => markOneRead(notification)}
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
                                            onClick={() => setOpen(false)}
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
    );
};

export default NotificationBell;