import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaUsers,
    FaMapMarkedAlt,
    FaCalendarAlt,
    FaCheckCircle,
    FaClock,
    FaUserCheck,
    FaUserTimes,
    FaRoute,
    FaArrowRight,
    FaRedo,
} from 'react-icons/fa';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
    const { get, loading } = useApi();

    const [stats, setStats] = useState({
        users: {
            total: 0,
            travellers: 0,
            guides: 0,
            admins: 0,
            unverified: 0,
        },
        destinations: {
            total: 0,
        },
        tours: {
            total: 0,
            active: 0,
            completed: 0,
            cancelled: 0,
        },
        bookings: {
            total: 0,
            pending: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
        },
        guide_groups: {
            total: 0,
            pending: 0,
            verified: 0,
        },
    });

    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await get('/users/admin-dashboard-stats/', {}, false);

            setStats({
                users: res?.users || {
                    total: 0,
                    travellers: 0,
                    guides: 0,
                    admins: 0,
                    unverified: 0,
                },
                destinations: res?.destinations || { total: 0 },
                tours: res?.tours || {
                    total: 0,
                    active: 0,
                    completed: 0,
                    cancelled: 0,
                },
                bookings: res?.bookings || {
                    total: 0,
                    pending: 0,
                    confirmed: 0,
                    completed: 0,
                    cancelled: 0,
                },
                guide_groups: res?.guide_groups || {
                    total: 0,
                    pending: 0,
                    verified: 0,
                },
            });

            setError(null);
        } catch (err) {
            console.error('Admin dashboard stats error:', err);
            setError('Failed to load admin dashboard data.');
        }
    };

    if (loading && !stats.users.total) {
        return <LoadingSpinner />;
    }

    const mainCards = [
        {
            title: 'Verified Users',
            value: stats.users.total,
            sub: `${stats.users.travellers} travellers | ${stats.users.guides} guides | ${stats.users.admins} admins`,
            note: `${stats.users.unverified} email-unverified users excluded`,
            icon: FaUsers,
            accent: 'from-blue-600 to-cyan-500',
            link: '/admin/users',
        },
        {
            title: 'Destinations',
            value: stats.destinations.total,
            sub: 'Total destination records',
            note: 'Real backend count',
            icon: FaMapMarkedAlt,
            accent: 'from-emerald-600 to-teal-500',
            link: '/admin/destinations',
        },
        {
            title: 'Active Tours',
            value: stats.tours.active,
            sub: `${stats.tours.total} total tours`,
            note: `${stats.tours.completed} completed | ${stats.tours.cancelled} cancelled`,
            icon: FaCalendarAlt,
            accent: 'from-purple-600 to-fuchsia-500',
            link: '/admin/tours',
        },
        {
            title: 'Total Bookings',
            value: stats.bookings.total,
            sub: `${stats.bookings.pending} pending | ${stats.bookings.confirmed} confirmed`,
            note: `${stats.bookings.completed} completed | ${stats.bookings.cancelled} cancelled`,
            icon: FaCheckCircle,
            accent: 'from-orange-600 to-amber-500',
            link: '/admin/tours',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 bg-soft-gradient px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <span className="badge badge-primary mb-3">
                            Admin Panel
                        </span>
                        <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
                            Admin Dashboard
                        </h1>
                        <p className="mt-2 text-slate-600">
                            Monitor verified users, destinations, tours, bookings, and guide group verification.
                        </p>
                    </div>

                    <button
                        onClick={fetchDashboardData}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-primary-700 shadow-soft transition hover:bg-primary-50"
                    >
                        <FaRedo />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                        <p className="font-semibold text-red-700">{error}</p>
                        <button
                            onClick={fetchDashboardData}
                            className="mt-2 text-sm font-bold text-red-600 underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {mainCards.map((card) => (
                        <Link
                            key={card.title}
                            to={card.link}
                            className="group overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-card"
                        >
                            <div className={`h-2 bg-gradient-to-r ${card.accent}`}></div>

                            <div className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">
                                            {card.title}
                                        </p>
                                        <p className="mt-2 text-4xl font-black text-slate-900">
                                            {card.value}
                                        </p>
                                    </div>

                                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-white shadow-lg transition group-hover:scale-110`}>
                                        <card.icon className="text-2xl" />
                                    </div>
                                </div>

                                <p className="mt-4 text-sm font-medium text-slate-600">
                                    {card.sub}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    {card.note}
                                </p>

                                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary-700">
                                    Open section
                                    <FaArrowRight className="transition group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Link
                        to="/admin/guide-groups"
                        className="rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-soft ring-1 ring-orange-100 transition hover:-translate-y-1 hover:shadow-card"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-orange-700">
                                    Pending Guide Group Verifications
                                </p>
                                <p className="mt-2 text-4xl font-black text-orange-700">
                                    {stats.guide_groups.pending}
                                </p>
                                <p className="mt-2 text-sm text-orange-700/70">
                                    Need admin review and approval
                                </p>
                            </div>

                            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-500 text-white shadow-lg">
                                <FaClock className="text-3xl" />
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/admin/guide-groups"
                        className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-soft ring-1 ring-emerald-100 transition hover:-translate-y-1 hover:shadow-card"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-emerald-700">
                                    Verified Guide Groups
                                </p>
                                <p className="mt-2 text-4xl font-black text-emerald-700">
                                    {stats.guide_groups.verified}
                                </p>
                                <p className="mt-2 text-sm text-emerald-700/70">
                                    Approved guide groups
                                </p>
                            </div>

                            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-lg">
                                <FaUserCheck className="text-3xl" />
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Link
                        to="/admin/destinations"
                        className="rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-600 p-6 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-card"
                    >
                        <FaMapMarkedAlt className="mb-5 text-3xl opacity-90" />
                        <h3 className="text-xl font-bold">Manage Destinations</h3>
                        <p className="mt-2 text-sm text-blue-50">
                            Add, edit, or remove tourist destinations.
                        </p>
                    </Link>

                    <Link
                        to="/admin/users"
                        className="rounded-3xl bg-gradient-to-br from-orange-600 to-amber-600 p-6 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-card"
                    >
                        <FaUserTimes className="mb-5 text-3xl opacity-90" />
                        <h3 className="text-xl font-bold">Manage Users</h3>
                        <p className="mt-2 text-sm text-orange-50">
                            View users and delete non-admin users.
                        </p>
                    </Link>

                    <Link
                        to="/admin/guide-groups"
                        className="rounded-3xl bg-gradient-to-br from-purple-600 to-fuchsia-600 p-6 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-card"
                    >
                        <FaRoute className="mb-5 text-3xl opacity-90" />
                        <h3 className="text-xl font-bold">Guide Verifications</h3>
                        <p className="mt-2 text-sm text-purple-50">
                            Verify or reject guide group registrations.
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;