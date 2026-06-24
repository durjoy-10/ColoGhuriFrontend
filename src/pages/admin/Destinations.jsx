import React, { useEffect, useMemo, useState } from 'react';
import {
    FaEdit,
    FaEye,
    FaImage,
    FaMapMarkerAlt,
    FaPlus,
    FaRedo,
    FaSearch,
    FaStar,
    FaTimes,
    FaTrash,
    FaUpload,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

import axios from '../../api/axios';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { DESTINATION_TYPES } from '../../utils/constants';

const API_BASE_URL =
    import.meta.env.VITE_SERVER_BASE_URL ||
    (import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
        : 'http://127.0.0.1:8000');

const emptyForm = {
    name: '',
    description: '',
    location: '',
    destination_type: 'beach',
    entry_fee: '',
    best_time_to_visit: '',
    opening_hours: '',
    is_popular: false,
    image: null,
};

const AdminDestinations = () => {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [popularOnly, setPopularOnly] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [viewing, setViewing] = useState(null);

    const [formData, setFormData] = useState(emptyForm);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        fetchDestinations();
    }, []);

    const filteredDestinations = useMemo(() => {
        const query = search.trim().toLowerCase();

        return destinations.filter((item) => {
            const matchesSearch =
                !query ||
                item.name?.toLowerCase().includes(query) ||
                item.location?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query);

            const matchesType =
                !typeFilter || item.destination_type === typeFilter;

            const matchesPopular = !popularOnly || item.is_popular;

            return matchesSearch && matchesType && matchesPopular;
        });
    }, [destinations, search, typeFilter, popularOnly]);

    const fetchDestinations = async () => {
        setLoading(true);

        try {
            const allItems = [];
            const usedIds = new Set();

            let page = 1;
            let hasNext = true;

            while (hasNext && page <= 50) {
                const response = await axios.get('/destinations/', {
                    params: {
                        page,
                        page_size: 100,
                    },
                });

                const data = response.data;
                const items = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.results)
                        ? data.results
                        : [];

                items.forEach((item) => {
                    const id = getDestinationId(item);
                    if (id && !usedIds.has(id)) {
                        usedIds.add(id);
                        allItems.push(item);
                    }
                });

                hasNext = Boolean(data?.next);
                page += 1;
            }

            setDestinations(allItems);
        } catch (error) {
            console.error('Destination fetch error:', error);
            toast.error('Failed to load destinations.');
        } finally {
            setLoading(false);
        }
    };

    const getDestinationId = (destination) => {
        return destination?.destination_id || destination?.id;
    };

    const getImageUrl = (path) => {
        if (!path) return '';

        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }

        if (path.startsWith('/')) {
            return `${API_BASE_URL}${path}`;
        }

        return `${API_BASE_URL}/${path}`;
    };

    const getPrimaryImage = (destination) => {
        return getImageUrl(
            destination?.primary_image ||
                destination?.cover_image_url ||
                destination?.image ||
                ''
        );
    };

    const resetForm = () => {
        setFormData(emptyForm);
        setPreviewUrl('');
        setEditing(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (destination) => {
        setEditing(destination);

        setFormData({
            name: destination.name || '',
            description: destination.description || '',
            location: destination.location || '',
            destination_type: destination.destination_type || 'beach',
            entry_fee:
                destination.entry_fee !== null &&
                destination.entry_fee !== undefined
                    ? String(destination.entry_fee)
                    : '',
            best_time_to_visit: destination.best_time_to_visit || '',
            opening_hours: destination.opening_hours || '',
            is_popular: Boolean(destination.is_popular),
            image: null,
        });

        setPreviewUrl(getPrimaryImage(destination));
        setShowModal(true);
    };

    const openViewModal = (destination) => {
        setViewing(destination);
        setShowViewModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleChange = (event) => {
        const { name, type, value, checked } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file.');
            return;
        }

        setFormData((prev) => ({
            ...prev,
            image: file,
        }));

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error('Destination name is required.');
            return false;
        }

        if (!formData.location.trim()) {
            toast.error('Location is required.');
            return false;
        }

        if (!formData.description.trim()) {
            toast.error('Description is required.');
            return false;
        }

        if (!formData.best_time_to_visit.trim()) {
            toast.error('Best time to visit is required.');
            return false;
        }

        if (!formData.opening_hours.trim()) {
            toast.error('Opening hours is required.');
            return false;
        }

        return true;
    };

    const buildSubmitData = () => {
        const data = new FormData();

        data.append('name', formData.name.trim());
        data.append('description', formData.description.trim());
        data.append('location', formData.location.trim());
        data.append('destination_type', formData.destination_type);
        data.append('entry_fee', formData.entry_fee || '0');
        data.append('best_time_to_visit', formData.best_time_to_visit.trim());
        data.append('opening_hours', formData.opening_hours.trim());
        data.append('is_popular', formData.is_popular ? 'true' : 'false');

        if (formData.image) {
            data.append('image', formData.image);
        }

        return data;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        setSubmitting(true);

        try {
            const data = buildSubmitData();

            if (editing) {
                const id = getDestinationId(editing);

                await axios.put(`/destinations/${id}/update/`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                toast.success('Destination updated successfully.');
            } else {
                await axios.post('/destinations/create/', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                toast.success('Destination added successfully.');
            }

            closeModal();
            await fetchDestinations();
        } catch (error) {
            console.error('Destination save error:', error);

            const data = error.response?.data;

            const message =
                data?.error ||
                data?.message ||
                data?.detail ||
                formatBackendError(data) ||
                'Failed to save destination.';

            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const formatBackendError = (data) => {
        if (!data || typeof data !== 'object') return '';

        const firstKey = Object.keys(data)[0];

        if (!firstKey) return '';

        const value = data[firstKey];

        if (Array.isArray(value)) {
            return `${firstKey}: ${value[0]}`;
        }

        return `${firstKey}: ${value}`;
    };

    const handleDelete = async (destination) => {
        const id = getDestinationId(destination);

        if (!id) {
            toast.error('Destination ID not found.');
            return;
        }

        const ok = window.confirm(
            `Are you sure you want to delete "${destination.name}"?`
        );

        if (!ok) return;

        setDeletingId(id);

        try {
            await axios.delete(`/destinations/${id}/delete/`);

            toast.success('Destination deleted successfully.');

            setDestinations((prev) =>
                prev.filter((item) => getDestinationId(item) !== id)
            );
        } catch (error) {
            console.error('Destination delete error:', error);
            toast.error(
                error.response?.data?.error ||
                    error.response?.data?.message ||
                    'Failed to delete destination.'
            );
        } finally {
            setDeletingId(null);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setTypeFilter('');
        setPopularOnly(false);
    };

    const getTypeBadgeClass = (type) => {
        const classes = {
            beach: 'bg-blue-100 text-blue-700',
            mountain: 'bg-emerald-100 text-emerald-700',
            historical: 'bg-amber-100 text-amber-700',
            natural: 'bg-green-100 text-green-700',
            religious: 'bg-purple-100 text-purple-700',
            adventure: 'bg-orange-100 text-orange-700',
            cultural: 'bg-pink-100 text-pink-700',
        };

        return classes[type] || 'bg-slate-100 text-slate-700';
    };

    return (
        <div className="min-h-screen bg-slate-50 bg-soft-gradient px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <span className="badge badge-primary mb-3">
                            Admin Panel
                        </span>
                        <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
                            Manage Destinations
                        </h1>
                        <p className="mt-2 text-slate-600">
                            Add, edit, update images, and delete tourist destinations.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            icon={FaRedo}
                            onClick={fetchDestinations}
                            disabled={loading}
                        >
                            Refresh
                        </Button>

                        <Button icon={FaPlus} onClick={openAddModal}>
                            Add Destination
                        </Button>
                    </div>
                </div>

                <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                        <div className="lg:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Search
                            </label>

                            <div className="relative">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search by name, location, or description..."
                                    className="w-full rounded-2xl border border-slate-300 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Destination Type
                            </label>

                            <select
                                value={typeFilter}
                                onChange={(event) =>
                                    setTypeFilter(event.target.value)
                                }
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            >
                                <option value="">All Types</option>
                                {DESTINATION_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() +
                                            type.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end gap-3">
                            <label className="flex min-h-[46px] flex-1 cursor-pointer items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={popularOnly}
                                    onChange={(event) =>
                                        setPopularOnly(event.target.checked)
                                    }
                                    className="h-4 w-4"
                                />
                                Popular only
                            </label>

                            <button
                                type="button"
                                onClick={clearFilters}
                                className="flex min-h-[46px] items-center justify-center rounded-2xl bg-slate-100 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-600">
                        Showing {filteredDestinations.length} of{' '}
                        {destinations.length} destinations
                    </p>
                </div>

                {loading ? (
                    <div className="rounded-3xl bg-white p-10 shadow-soft">
                        <LoadingSpinner />
                    </div>
                ) : filteredDestinations.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-soft">
                        <FaMapMarkerAlt className="mx-auto mb-4 text-5xl text-slate-300" />
                        <h3 className="text-xl font-bold text-slate-800">
                            No destinations found
                        </h3>
                        <p className="mt-2 text-slate-500">
                            Add a new destination or clear the filter.
                        </p>

                        <div className="mt-5 flex justify-center gap-3">
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filter
                            </Button>
                            <Button icon={FaPlus} onClick={openAddModal}>
                                Add Destination
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredDestinations.map((destination) => {
                            const id = getDestinationId(destination);
                            const imageUrl = getPrimaryImage(destination);

                            return (
                                <div
                                    key={id}
                                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-large"
                                >
                                    <div className="relative h-52 bg-slate-200">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={destination.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-slate-100">
                                                <FaImage className="text-5xl text-slate-300" />
                                            </div>
                                        )}

                                        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-bold ${getTypeBadgeClass(
                                                    destination.destination_type
                                                )}`}
                                            >
                                                {destination.destination_type}
                                            </span>

                                            {destination.is_popular && (
                                                <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
                                                    Popular
                                                </span>
                                            )}
                                        </div>

                                        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700">
                                            <FaStar className="mr-1 inline text-amber-500" />
                                            {destination.average_rating || '0.00'}
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <h3 className="line-clamp-1 text-lg font-extrabold text-slate-900">
                                            {destination.name}
                                        </h3>

                                        <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500">
                                            <FaMapMarkerAlt className="text-primary-500" />
                                            <span className="line-clamp-1">
                                                {destination.location}
                                            </span>
                                        </p>

                                        <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                                            {destination.description}
                                        </p>

                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            <div className="rounded-2xl bg-primary-50 p-3">
                                                <p className="text-xs font-semibold text-slate-500">
                                                    Entry Fee
                                                </p>
                                                <p className="font-extrabold text-primary-700">
                                                    ৳{destination.entry_fee || 0}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl bg-slate-50 p-3">
                                                <p className="text-xs font-semibold text-slate-500">
                                                    Reviews
                                                </p>
                                                <p className="font-extrabold text-slate-800">
                                                    {destination.total_reviews || 0}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openViewModal(destination)
                                                }
                                                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                                            >
                                                <FaEye />
                                                View
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEditModal(destination)
                                                }
                                                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-50 px-3 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                                            >
                                                <FaEdit />
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(destination)
                                                }
                                                disabled={deletingId === id}
                                                className="flex h-[46px] w-[46px] items-center justify-center rounded-2xl bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                                            >
                                                {deletingId === id ? (
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                                                ) : (
                                                    <FaTrash />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Modal
                isOpen={showModal}
                onClose={closeModal}
                title={editing ? 'Edit Destination' : 'Add Destination'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Input
                            label="Destination Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Sajek Valley"
                        />

                        <Input
                            label="Location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Rangamati, Chattogram"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Write destination description..."
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                Destination Type{' '}
                                <span className="text-red-500">*</span>
                            </label>

                            <select
                                name="destination_type"
                                value={formData.destination_type}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                                required
                            >
                                {DESTINATION_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() +
                                            type.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Entry Fee (BDT)"
                            name="entry_fee"
                            type="number"
                            min="0"
                            value={formData.entry_fee}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Input
                            label="Best Time to Visit"
                            name="best_time_to_visit"
                            value={formData.best_time_to_visit}
                            onChange={handleChange}
                            required
                            placeholder="e.g., November to February"
                        />

                        <Input
                            label="Opening Hours"
                            name="opening_hours"
                            value={formData.opening_hours}
                            onChange={handleChange}
                            required
                            placeholder="e.g., 24 hours"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Cover Image
                        </label>

                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary-200 bg-primary-50/50 px-4 py-8 text-center transition hover:bg-primary-50">
                            <FaUpload className="mb-3 text-3xl text-primary-600" />
                            <p className="font-bold text-primary-700">
                                Click to upload image
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                PNG, JPG, JPEG supported
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>

                        {previewUrl && (
                            <div className="relative mt-4 h-48 overflow-hidden rounded-3xl border border-slate-200">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreviewUrl('');
                                        setFormData((prev) => ({
                                            ...prev,
                                            image: null,
                                        }));
                                    }}
                                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-lg"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        )}
                    </div>

                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <input
                            type="checkbox"
                            name="is_popular"
                            checked={formData.is_popular}
                            onChange={handleChange}
                            className="h-4 w-4"
                        />
                        <span className="font-semibold text-slate-700">
                            Mark as popular destination
                        </span>
                    </label>

                    <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={closeModal}
                            fullWidth
                            disabled={submitting}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="primary"
                            loading={submitting}
                            fullWidth
                        >
                            {editing ? 'Update Destination' : 'Create Destination'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={showViewModal}
                onClose={() => {
                    setShowViewModal(false);
                    setViewing(null);
                }}
                title="Destination Details"
                size="lg"
            >
                {viewing && (
                    <div className="space-y-5">
                        <div className="overflow-hidden rounded-3xl border border-slate-200">
                            {getPrimaryImage(viewing) ? (
                                <img
                                    src={getPrimaryImage(viewing)}
                                    alt={viewing.name}
                                    className="h-72 w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-72 items-center justify-center bg-slate-100">
                                    <FaImage className="text-6xl text-slate-300" />
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-2xl font-extrabold text-slate-900">
                                {viewing.name}
                            </h3>
                            <p className="mt-1 flex items-center gap-2 text-slate-600">
                                <FaMapMarkerAlt className="text-primary-600" />
                                {viewing.location}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <InfoBox
                                label="Type"
                                value={viewing.destination_type}
                            />
                            <InfoBox
                                label="Entry Fee"
                                value={`৳${viewing.entry_fee || 0}`}
                            />
                            <InfoBox
                                label="Rating"
                                value={`${viewing.average_rating || 0} / 5`}
                            />
                        </div>

                        <InfoBox
                            label="Best Time to Visit"
                            value={viewing.best_time_to_visit}
                        />
                        <InfoBox
                            label="Opening Hours"
                            value={viewing.opening_hours}
                        />

                        <div>
                            <p className="mb-2 text-sm font-bold text-slate-700">
                                Description
                            </p>
                            <p className="rounded-2xl bg-slate-50 p-4 leading-7 text-slate-700">
                                {viewing.description}
                            </p>
                        </div>

                        <div className="flex gap-3 border-t border-slate-200 pt-5">
                            <Button
                                variant="outline"
                                icon={FaEdit}
                                onClick={() => {
                                    setShowViewModal(false);
                                    openEditModal(viewing);
                                }}
                                fullWidth
                            >
                                Edit
                            </Button>

                            <Button
                                variant="danger"
                                icon={FaTrash}
                                onClick={() => {
                                    setShowViewModal(false);
                                    handleDelete(viewing);
                                }}
                                fullWidth
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const InfoBox = ({ label, value }) => (
    <div className="rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {label}
        </p>
        <p className="mt-1 font-semibold capitalize text-slate-800">
            {value || 'N/A'}
        </p>
    </div>
);

export default AdminDestinations;