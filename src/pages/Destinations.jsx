import React, { useEffect, useState } from 'react';
import {
    FaFilter,
    FaRedo,
    FaSearch,
    FaSlidersH,
    FaTimes,
} from 'react-icons/fa';

import { useApi } from '../hooks/useApi';
import DestinationCard from '../components/destinations/DestinationCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { DESTINATION_TYPES } from '../utils/constants';

const Destinations = () => {
    const { get, loading } = useApi();

    const [destinations, setDestinations] = useState([]);
    const [showFilters, setShowFilters] = useState(true);

    const [filters, setFilters] = useState({
        search: '',
        destination_type: '',
        min_entry_fee: '',
        max_entry_fee: '',
        min_rating: '',
        is_popular: false,
        ordering: 'rating_desc',
    });

    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
        page: 1,
        pageSize: 12,
    });

    useEffect(() => {
        fetchDestinations();
    }, [filters, pagination.page]);

    const buildQuery = () => {
        const params = new URLSearchParams();

        params.append('page', pagination.page);
        params.append('page_size', pagination.pageSize);

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== '' && value !== false && value !== null) {
                params.append(key, value);
            }
        });

        return params.toString();
    };

    const fetchDestinations = async () => {
        try {
            const response = await get(`/destinations/?${buildQuery()}`, {}, false);
            setDestinations(response.results || response || []);
            setPagination((prev) => ({
                ...prev,
                count: response.count || response.length || 0,
                next: response.next,
                previous: response.previous,
            }));
        } catch (error) {
            console.error('Destination fetch error:', error);
        }
    };

    const updateFilter = (key, value) => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        setFilters({
            search: '',
            destination_type: '',
            min_entry_fee: '',
            max_entry_fee: '',
            min_rating: '',
            is_popular: false,
            ordering: 'rating_desc',
        });
    };

    const totalPages = Math.ceil(pagination.count / pagination.pageSize);

    return (
        <div className="min-h-screen bg-slate-50 bg-soft-gradient px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 text-center">
                    <span className="badge badge-primary mb-3">
                        Explore Bangladesh
                    </span>
                    <h1 className="text-3xl font-extrabold text-slate-900 md:text-5xl">
                        Explore Destinations
                    </h1>
                    <p className="mx-auto mt-3 max-w-2xl text-slate-600">
                        Search, filter, sort, and save your favourite travel destinations.
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
                                placeholder="Search by name, location, or description..."
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
                        <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2 lg:grid-cols-6">
                            <select
                                value={filters.destination_type}
                                onChange={(e) => updateFilter('destination_type', e.target.value)}
                                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            >
                                <option value="">All Types</option>
                                {DESTINATION_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="number"
                                value={filters.min_entry_fee}
                                onChange={(e) => updateFilter('min_entry_fee', e.target.value)}
                                placeholder="Min fee"
                                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            />

                            <input
                                type="number"
                                value={filters.max_entry_fee}
                                onChange={(e) => updateFilter('max_entry_fee', e.target.value)}
                                placeholder="Max fee"
                                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            />

                            <select
                                value={filters.min_rating}
                                onChange={(e) => updateFilter('min_rating', e.target.value)}
                                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            >
                                <option value="">Any Rating</option>
                                <option value="4">4+ Stars</option>
                                <option value="3">3+ Stars</option>
                                <option value="2">2+ Stars</option>
                            </select>

                            <select
                                value={filters.ordering}
                                onChange={(e) => updateFilter('ordering', e.target.value)}
                                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            >
                                <option value="rating_desc">Top Rated</option>
                                <option value="entry_fee_asc">Low Entry Fee</option>
                                <option value="entry_fee_desc">High Entry Fee</option>
                                <option value="name_asc">Name A-Z</option>
                                <option value="newest">Newest</option>
                            </select>

                            <label className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={filters.is_popular}
                                    onChange={(e) => updateFilter('is_popular', e.target.checked)}
                                    className="h-4 w-4 rounded text-primary-600"
                                />
                                Popular only
                            </label>
                        </div>
                    )}
                </div>

                <div className="mb-5 flex items-center justify-between">
                    <p className="font-semibold text-slate-600">
                        Found {pagination.count} destination{pagination.count !== 1 ? 's' : ''}
                    </p>

                    <button
                        onClick={fetchDestinations}
                        className="inline-flex items-center gap-2 text-sm font-bold text-primary-700"
                    >
                        <FaRedo />
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : destinations.length === 0 ? (
                    <div className="rounded-3xl bg-white p-12 text-center shadow-soft">
                        <FaFilter className="mx-auto mb-4 text-5xl text-slate-300" />
                        <h3 className="text-xl font-bold text-slate-800">
                            No destinations found
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
                            {destinations.map((destination) => (
                                <DestinationCard
                                    key={destination.destination_id}
                                    destination={destination}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-10 flex justify-center gap-3">
                                <button
                                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={!pagination.previous}
                                    className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                <span className="rounded-2xl bg-primary-50 px-5 py-3 text-sm font-bold text-primary-700">
                                    Page {pagination.page} of {totalPages}
                                </span>

                                <button
                                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={!pagination.next}
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

export default Destinations;