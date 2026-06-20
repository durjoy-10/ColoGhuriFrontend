import React, { useEffect, useState } from 'react';
import {
    FaBell,
    FaCalendarCheck,
    FaHeart,
    FaMoneyBillWave,
    FaPlane,
    FaRoute,
    FaSuitcase,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BookingTicketButton from '../components/bookings/BookingTicketButton';
import { formatCurrency } from '../utils/formatters';

const TravellerDashboard = () => {
    const { get, loading } = useApi();

    const [data, setData] = useState(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        const res = await get('/operations/traveller-dashboard/', {}, false);
        setData(res);
    };

    if (loading && !data) {
        return <LoadingSpinner />;
    }

    const summary = data?.summary || {};

    const cards = [
        {
            title: 'Total Bookings',
            value: summary.total_bookings || 0,
            icon: FaCalendarCheck,
            color: 'from-blue-600 to-cyan-500',
            link: '/my-bookings',
        },
        {
            title: 'Active Trips',
            value: summary.active_trips || 0,
            icon: FaSuitcase,
            color: 'from-emerald-600 to-teal-500',
            link: '/my-trips',
        },
        {
            title: 'Wishlist',
            value: summary.wishlist_count || 0,
            icon: FaHeart,
            color: 'from-red-600 to-pink-500',
            link: '/my-wishlist',
        },
        {
            title: 'Unread Notifications',
            value: summary.unread_notifications || 0,
            icon: FaBell,
            color: 'from-orange-600 to-amber-500',
            link: '#',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 bg-soft-gradient px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <span className="badge badge-primary mb-3">
                        Traveller Panel
                    </span>
                    <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
                        Traveller Dashboard
                    </h1>
                    <p className="mt-2 text-slate-600">
                        Track bookings, trips, wishlist, budget, and notifications from one place.
                    </p>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => (
                        <Link
                            key={card.title}
                            to={card.link}
                            className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-card"
                        >
                            <div className={`h-2 bg-gradient-to-r ${card.color}`}></div>

                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">
                                            {card.title}
                                        </p>
                                        <p className="mt-2 text-4xl font-black text-slate-900">
                                            {card.value}
                                        </p>
                                    </div>

                                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                                        <card.icon className="text-2xl" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-100">
                        <div className="mb-3 flex items-center gap-3">
                            <FaMoneyBillWave className="text-2xl text-primary-600" />
                            <h2 className="text-xl font-extrabold text-slate-900">
                                Booking Spending
                            </h2>
                        </div>
                        <p className="text-3xl font-black text-primary-700">
                            {formatCurrency(summary.total_booking_amount || 0)}
                        </p>
                    </div>

                    <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-100">
                        <div className="mb-3 flex items-center gap-3">
                            <FaRoute className="text-2xl text-emerald-600" />
                            <h2 className="text-xl font-extrabold text-slate-900">
                                Trip Budget
                            </h2>
                        </div>
                        <p className="text-3xl font-black text-emerald-700">
                            {formatCurrency(summary.total_trip_budget || 0)}
                        </p>
                    </div>

                    <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-100">
                        <div className="mb-3 flex items-center gap-3">
                            <FaMoneyBillWave className="text-2xl text-orange-600" />
                            <h2 className="text-xl font-extrabold text-slate-900">
                                Trip Expenses
                            </h2>
                        </div>
                        <p className="text-3xl font-black text-orange-700">
                            {formatCurrency(summary.total_trip_expense || 0)}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <Section title="Upcoming Bookings" emptyText="No upcoming bookings.">
                        {(data?.upcoming_bookings || []).map((booking) => (
                            <div
                                key={booking.booking_id}
                                className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                            >
                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                    <div>
                                        <h3 className="font-bold text-slate-900">
                                            {booking.tour_name}
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {booking.guide_group} · {booking.number_of_travellers} traveller(s)
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-primary-700">
                                            {formatCurrency(booking.total_amount)}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            to={`/tours/${booking.tour_id}`}
                                            className="rounded-2xl bg-primary-50 px-4 py-2 text-sm font-bold text-primary-700 hover:bg-primary-100"
                                        >
                                            View Tour
                                        </Link>
                                        <BookingTicketButton bookingId={booking.booking_id} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Section>

                    <Section title="Active Trips" emptyText="No active trips.">
                        {(data?.active_trips || []).map((trip) => (
                            <div
                                key={trip.trip_id}
                                className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                            >
                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                    <div>
                                        <h3 className="font-bold text-slate-900">
                                            {trip.trip_name}
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {trip.start_date} to {trip.end_date}
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-emerald-700">
                                            Budget: {formatCurrency(trip.total_budget)}
                                        </p>
                                    </div>

                                    <Link
                                        to={`/my-trips/${trip.trip_id}`}
                                        className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100"
                                    >
                                        Open Trip
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </Section>
                </div>
            </div>
        </div>
    );
};

const Section = ({ title, emptyText, children }) => {
    const hasChildren = React.Children.count(children) > 0;

    return (
        <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-100">
            <h2 className="mb-5 text-xl font-extrabold text-slate-900">
                {title}
            </h2>

            {hasChildren ? (
                <div className="space-y-4">{children}</div>
            ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center">
                    <FaPlane className="mx-auto mb-3 text-4xl text-slate-300" />
                    <p className="text-slate-500">{emptyText}</p>
                </div>
            )}
        </div>
    );
};

export default TravellerDashboard;