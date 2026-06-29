import React, { useEffect, useRef, useState } from 'react';
import {
    FaFilter,
    FaRedo,
    FaSearch,
    FaSlidersH,
    FaTimes,
} from 'react-icons/fa';

import { useApi } from '../hooks/useApi';
import TourCard from '../components/tours/TourCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { DESTINATION_TYPES, TOUR_STATUS } from '../utils/constants';

const DEFAULT_FILTERS = {
    search: '',
    status: 'upcoming',
    min_price: '',
    max_price: '',
    min_seats: '',
    destination_type: '',
    location: '',
    available_only: true,
    has_discount: false,
    ordering: 'newest',
};

const Tours = () => {
    const { get, loading } = useApi();
    const requestIdRef = useRef(0);

    const [tours, setTours] = useState([]);
    const [showFilters, setShowFilters] = useState(true);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [debouncedFilters, setDebouncedFilters] = useState(DEFAULT_FILTERS);

    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
        page: 1,
        pageSize: 12,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 450);

        return () => clearTimeout(timer);
    }, [filters]);

    useEffect(() => {
        fetchTours();
    }, [debouncedFilters, pagination.page]);

    const buildParams = () => {
        const params = {
            page: pagination.page,
            page_size: pagination.pageSize,
        };

        Object.entries(debouncedFilters).forEach(([key, value]) => {
            if (value !== '' && value !== false && value !== null) {
                params[key] = value;
            }
        });

        return params;
    };

    const fetchTours = async (options = {}) => {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;

        try {
            const response = await get('/tours/', buildParams(), false, {
                cache: options.forceRefresh ? false : true,
                cacheTtl: 45 * 1000,
            });

            if (requestId !== requestIdRef.current) return;

            const items = response.results || response || [];
            setTours(Array.isArray(items) ? items : []);
            setPagination((prev) => ({
                ...prev,
                count: response.count || items.length || 0,
                next: response.next || null,
                previous: response.previous || null,
            }));
        } catch (error) {
            if (requestId === requestIdRef.current) {
                console.error('Tours fetch error:', error);
                setTours([]);
            }
        }
    };

    const updateFilter = (key, value) => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        setFilters(DEFAULT_FILTERS);
        setDebouncedFilters(DEFAULT_FILTERS);
    };

    const totalPages = Math.ceil(pagination.count / pagination.pageSize);

    return (
        <div className="min-h-screen bg-slate-50 bg-soft-gradient px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 text-center">
                    <span className="badge badge-warning mb-3">
                        Guided Packages
                    </span>
                    <h1 className="text-3xl font-extrabold text-slate-900 md:text-5xl">
                        Find Your Next Tour
                    </h1>
                    <p className="mx-auto mt-3 max-w-2xl text-slate-600">
                        Search, filter, sort, save, and book guided travel packages.
                    </p>
                </div>

                <div className="mb-8 rounded-3xl bg-white p-5 shadow-soft">
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => updateFilter('search', e.target.value)}
                                placeholder="Search tour, guide group, destination..."
                                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            />
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-50 px-5 py-3 text-sm font-bold text-primary-700 transition hover:bg-primary-100"
                        >
                            <FaSlidersH />
                            Filters
                        </button>

                        <button
                            onClick={clearFilters}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                        >
                            <FaTimes />
                            Clear
                        </button>
                    </div>

                    {showFilters && (
                        <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2 lg:grid-cols-5">
                            <select
                                value={filters.status}
                                onChange={(e) => updateFilter('status', e.target.value)}
                                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            >
                                <option value="">All Status</option>
                                {TOUR_STATUS.map((status) => (
                                    <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="number"
                                value={filters.min_price}
                                onChange={(e) => updateFilter('min_price', e.target.value)}
                                placeholder="Min price"
                                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            />

                            <input
                                type="number"
                                value={filters.max_price}
                                onChange={(e) => updateFilter('max_price', e.target.value)}
                                placeholder="Max price"
                                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            />

                            <input
                                type="number"
                                value={filters.min_seats}
                                onChange={(e) => updateFilter('min_seats', e.target.value)}
                                placeholder="Min seats"
                                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            />

                            <select
                                value={filters.destination_type}
                                onChange={(e) => updateFilter('destination_type', e.target.value)}
                                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            >
                                <option value="">All Destination Types</option>
                                {DESTINATION_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="text"
                                value={filters.location}
                                onChange={(e) => updateFilter('location', e.target.value)}
                                placeholder="Location"
                                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            />

                            <select
                                value={filters.ordering}
                                onChange={(e) => updateFilter('ordering', e.target.value)}
                                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            >
                                <option value="newest">Newest</option>
                                <option value="price_asc">Low Price</option>
                                <option value="price_desc">High Price</option>
                                <option value="seats_desc">Most Seats</option>
                            </select>

                            <label className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={filters.available_only}
                                    onChange={(e) => updateFilter('available_only', e.target.checked)}
                                />
                                Available only
                            </label>

                            <label className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={filters.has_discount}
                                    onChange={(e) => updateFilter('has_discount', e.target.checked)}
                                />
                                Discount only
                            </label>
                        </div>
                    )}
                </div>

                <div className="mb-5 flex items-center justify-between">
                    <p className="font-semibold text-slate-600">
                        Found {pagination.count} tour{pagination.count !== 1 ? 's' : ''}
                    </p>

                    <button
                        onClick={() => fetchTours({ forceRefresh: true })}
                        className="inline-flex items-center gap-2 text-sm font-bold text-primary-700"
                    >
                        <FaRedo />
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : tours.length === 0 ? (
                    <div className="rounded-3xl bg-white p-12 text-center shadow-soft">
                        <FaFilter className="mx-auto mb-4 text-5xl text-slate-300" />
                        <h3 className="text-xl font-bold text-slate-800">
                            No tours found
                        </h3>
                        <p className="mt-2 text-slate-500">
                            Try changing or clearing filters.
                        </p>
                        <button onClick={clearFilters} className="btn-primary mt-6">
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                            {tours.map((tour) => (
                                <TourCard key={tour.tour_id} tour={tour} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-10 flex justify-center gap-3">
                                <button
                                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={!pagination.previous || loading}
                                    className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                <span className="rounded-2xl bg-primary-50 px-5 py-3 text-sm font-bold text-primary-700">
                                    Page {pagination.page} of {totalPages}
                                </span>

                                <button
                                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={!pagination.next || loading}
                                    className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Tours;