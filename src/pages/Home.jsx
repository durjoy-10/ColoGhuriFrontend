import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaArrowRight,
    FaCheckCircle,
    FaCompass,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaPlaneDeparture,
    FaRoute,
    FaShieldAlt,
    FaUsers,
} from 'react-icons/fa';
import { useApi } from '../hooks/useApi';
import DestinationCard from '../components/destinations/DestinationCard';
import TourCard from '../components/tours/TourCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
    const { get, loading } = useApi();

    const [popularDestinations, setPopularDestinations] = useState([]);
    const [upcomingTours, setUpcomingTours] = useState([]);

    useEffect(() => {
        fetchHomeData();
    }, []);

    const fetchHomeData = async () => {
        try {
            const [destinationsRes, toursRes] = await Promise.all([
                get('/destinations/', { is_popular: true }, false),
                get('/tours/', { status: 'upcoming' }, false),
            ]);

            setPopularDestinations(destinationsRes?.results || destinationsRes || []);
            setUpcomingTours(toursRes?.results || toursRes || []);
        } catch (error) {
            console.error('Error fetching home data:', error);
        }
    };

    if (loading) return <LoadingSpinner />;

    const features = [
        {
            icon: FaCompass,
            title: 'Smart Destination Discovery',
            description: 'Explore beaches, mountains, heritage sites, religious places, and cultural destinations with useful details.',
        },
        {
            icon: FaShieldAlt,
            title: 'Verified Guide Groups',
            description: 'Travel with approved guide groups and manage bookings through a secure role-based platform.',
        },
        {
            icon: FaRoute,
            title: 'Personal Trip Planner',
            description: 'Create your own trip plan, track expenses, and monitor your remaining budget easily.',
        },
    ];

    const steps = [
        'Choose destination',
        'Compare tours',
        'Book your seat',
        'Travel with guide',
    ];

    return (
        <div className="animate-fade-in bg-slate-50">
            <section className="relative flex min-h-screen items-center overflow-hidden bg-dark-950 pt-16">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=80"
                        alt="Bangladesh travel"
                        className="h-full w-full object-cover opacity-55"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-950/80 to-primary-950/70"></div>
                    <div className="absolute inset-0 bg-mesh"></div>
                </div>

                <div className="floating-blob left-10 top-28 h-72 w-72 bg-primary-500/25"></div>
                <div className="floating-blob bottom-20 right-10 h-96 w-96 bg-secondary-500/20"></div>

                <div className="container-custom relative z-10 py-20">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <div className="max-w-3xl">
                            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-xl">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Your Bangladesh travel companion
                            </div>

                            <h1 className="font-display text-5xl font-black leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
                                Discover places.
                                <br />
                                Book tours.
                                <br />
                                <span className="bg-gradient-to-r from-primary-300 via-cyan-200 to-secondary-300 bg-clip-text text-transparent">
                                    Travel smarter.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 md:text-xl">
                                Colo Ghuri helps travellers explore destinations, book guided tours,
                                plan personal trips, and track travel expenses in one professional platform.
                            </p>

                            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                                <Link to="/destinations" className="btn-primary px-7 py-4">
                                    Explore Destinations
                                    <FaArrowRight />
                                </Link>

                                <Link to="/tours" className="btn-outline px-7 py-4">
                                    View Tours
                                    <FaPlaneDeparture />
                                </Link>
                            </div>

                            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                {[
                                    ['50+', 'Destinations'],
                                    ['100+', 'Guides'],
                                    ['24/7', 'Assistant'],
                                    ['4.9', 'Rating'],
                                ].map(([value, label]) => (
                                    <div
                                        key={label}
                                        className="rounded-3xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-xl"
                                    >
                                        <p className="text-2xl font-black text-white">
                                            {value}
                                        </p>
                                        <p className="text-xs font-medium text-slate-300">
                                            {label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative hidden lg:block">
                            <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-primary-400/30 blur-2xl"></div>

                            <div className="glass-dark rounded-[2rem] p-5">
                                <div className="overflow-hidden rounded-[1.5rem]">
                                    <img
                                        src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
                                        alt="Tour experience"
                                        className="h-[420px] w-full object-cover"
                                    />
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-4">
                                    <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
                                        <FaUsers className="mb-3 text-2xl text-primary-300" />
                                        <p className="font-bold text-white">Verified guides</p>
                                        <p className="mt-1 text-sm text-slate-300">Safe group travel</p>
                                    </div>

                                    <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
                                        <FaMoneyBillWave className="mb-3 text-2xl text-secondary-300" />
                                        <p className="font-bold text-white">Budget control</p>
                                        <p className="mt-1 text-sm text-slate-300">Track expenses</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-padding bg-white">
                <div className="container-custom">
                    <div className="mx-auto mb-12 max-w-3xl text-center">
                        <span className="badge badge-primary mb-4">
                            Why Colo Ghuri
                        </span>
                        <h2 className="section-title">
                            Professional travel planning made simple
                        </h2>
                        <p className="section-subtitle mx-auto">
                            A complete platform for travellers, guide groups, and admins with smooth booking, trip planning, and management tools.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="pro-card p-7 animate-slide-up"
                                style={{ animationDelay: `${index * 120}ms` }}
                            >
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-600 to-primary-400 text-2xl text-white shadow-glow">
                                    <feature.icon />
                                </div>

                                <h3 className="text-xl font-bold text-dark-900">
                                    {feature.title}
                                </h3>

                                <p className="mt-3 leading-7 text-slate-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section-padding bg-slate-50 bg-soft-gradient">
                <div className="container-custom">
                    <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                        <div>
                            <span className="badge badge-primary mb-4">
                                Popular places
                            </span>
                            <h2 className="section-title">
                                Explore trending destinations
                            </h2>
                            <p className="section-subtitle">
                                Start with the most loved destinations selected for travellers.
                            </p>
                        </div>

                        <Link to="/destinations" className="btn-secondary self-start md:self-auto">
                            View All
                            <FaArrowRight />
                        </Link>
                    </div>

                    {popularDestinations.length > 0 ? (
                        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                            {popularDestinations.slice(0, 6).map((destination) => (
                                <DestinationCard
                                    key={destination.destination_id}
                                    destination={destination}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="soft-card p-10 text-center">
                            <FaMapMarkerAlt className="mx-auto mb-4 text-4xl text-primary-500" />
                            <h3 className="text-xl font-bold text-dark-800">
                                No popular destinations yet
                            </h3>
                            <p className="mt-2 text-slate-600">
                                Add popular destinations from the admin panel.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <section className="section-padding bg-white">
                <div className="container-custom">
                    <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                        <div>
                            <span className="badge badge-warning mb-4">
                                Upcoming tours
                            </span>
                            <h2 className="section-title">
                                Book your next guided adventure
                            </h2>
                            <p className="section-subtitle">
                                Compare seats, prices, guide groups, and choose the best travel package.
                            </p>
                        </div>

                        <Link to="/tours" className="btn-secondary self-start md:self-auto">
                            View All
                            <FaArrowRight />
                        </Link>
                    </div>

                    {upcomingTours.length > 0 ? (
                        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                            {upcomingTours.slice(0, 6).map((tour) => (
                                <TourCard key={tour.tour_id} tour={tour} />
                            ))}
                        </div>
                    ) : (
                        <div className="soft-card p-10 text-center">
                            <FaPlaneDeparture className="mx-auto mb-4 text-4xl text-primary-500" />
                            <h3 className="text-xl font-bold text-dark-800">
                                No upcoming tours yet
                            </h3>
                            <p className="mt-2 text-slate-600">
                                Guide groups can create upcoming tours from the guide panel.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <section className="section-padding relative overflow-hidden bg-dark-950">
                <div className="absolute inset-0 bg-mesh opacity-70"></div>

                <div className="container-custom relative z-10">
                    <div className="grid items-center gap-10 lg:grid-cols-2">
                        <div>
                            <span className="badge bg-white/10 text-white border border-white/10 mb-4">
                                How it works
                            </span>

                            <h2 className="section-title text-white">
                                From planning to travelling in four simple steps
                            </h2>

                            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                                Colo Ghuri connects traveller needs with destination data, guide groups, tour packages, and personal trip budgeting.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {steps.map((step, index) => (
                                <div
                                    key={step}
                                    className="glass-dark rounded-3xl p-5"
                                >
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary-700 font-black">
                                        {index + 1}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FaCheckCircle className="text-emerald-400" />
                                        <p className="font-bold text-white">
                                            {step}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;