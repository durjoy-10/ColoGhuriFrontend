import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaHeart,
    FaTrash,
    FaMapMarkerAlt,
    FaRoute,
    FaSearch,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency } from '../utils/formatters';

const Wishlist = () => {
    const { get, del, loading } = useApi();

    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        const response = await get('/engagement/wishlist/', {}, false);
        setItems(Array.isArray(response) ? response : response.results || []);
    };

    const removeItem = async (item) => {
        const confirmed = window.confirm('Remove this item from wishlist?');

        if (!confirmed) return;

        try {
            await del(`/engagement/wishlist/${item.id}/delete/`, true);
            setItems((prev) => prev.filter((i) => i.id !== item.id));
            toast.success('Removed from wishlist.');
        } catch (error) {
            toast.error('Failed to remove item.');
        }
    };

    const filteredItems = items.filter((item) => {
        const matchesType = filter === 'all' || item.item_type === filter;
        const matchesSearch =
            !search ||
            item.item_title?.toLowerCase().includes(search.toLowerCase()) ||
            item.item_subtitle?.toLowerCase().includes(search.toLowerCase());

        return matchesType && matchesSearch;
    });

    if (loading && items.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-slate-50 bg-soft-gradient px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <span className="badge badge-primary mb-3">
                        Saved Items
                    </span>
                    <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
                        My Wishlist
                    </h1>
                    <p className="mt-2 text-slate-600">
                        Manage your saved destinations and tours.
                    </p>
                </div>

                <div className="mb-8 rounded-3xl bg-white p-5 shadow-soft">
                    <div className="grid gap-4 md:grid-cols-[1fr_240px]">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search saved items..."
                                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            />
                        </div>

                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                        >
                            <option value="all">All Items</option>
                            <option value="destination">Destinations</option>
                            <option value="tour">Tours</option>
                        </select>
                    </div>
                </div>

                {filteredItems.length === 0 ? (
                    <div className="rounded-3xl bg-white p-12 text-center shadow-soft">
                        <FaHeart className="mx-auto mb-4 text-5xl text-slate-300" />
                        <h3 className="text-xl font-bold text-slate-800">
                            No wishlist items found
                        </h3>
                        <p className="mt-2 text-slate-500">
                            Save destinations or tours to see them here.
                        </p>

                        <div className="mt-6 flex justify-center gap-3">
                            <Link to="/destinations" className="btn-primary">
                                Browse Destinations
                            </Link>
                            <Link to="/tours" className="btn-secondary">
                                Browse Tours
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-card"
                            >
                                <div className="relative h-52">
                                    <img
                                        src={item.item_image || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'}
                                        alt={item.item_title}
                                        className="h-full w-full object-cover"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent"></div>

                                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold capitalize text-primary-700">
                                        {item.item_type}
                                    </span>

                                    <button
                                        onClick={() => removeItem(item)}
                                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg transition hover:bg-red-600"
                                    >
                                        <FaTrash />
                                    </button>

                                    <h3 className="absolute bottom-4 left-4 right-4 line-clamp-2 text-xl font-extrabold text-white">
                                        {item.item_title}
                                    </h3>
                                </div>

                                <div className="p-5">
                                    <p className="mb-3 flex items-center gap-2 text-sm text-slate-600">
                                        {item.item_type === 'destination' ? <FaMapMarkerAlt /> : <FaRoute />}
                                        {item.item_subtitle}
                                    </p>

                                    {item.item_price !== null && (
                                        <p className="mb-5 font-bold text-primary-700">
                                            {formatCurrency(item.item_price)}
                                        </p>
                                    )}

                                    <Link
                                        to={item.item_url}
                                        className="btn-primary w-full py-3 text-sm"
                                    >
                                        Open Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;